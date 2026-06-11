import type { Express, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { db } from './db';
import { dreams, userCommitments, userResources } from '@shared/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { storage } from './storage';
import { optionalAuth, type AuthRequest } from './auth';
import { sanitizeInput } from './middleware';
import {
  radarSenalSchema,
  buildDreamInsert,
  excerptSignalText,
  isVoiceType,
} from './lib/radar';

/**
 * Radar ¡BASTA! — API del colector móvil de señales.
 * POST /api/radar/senal   — captura anónima (sueño/valor/necesidad/basta) o con cuenta (compromiso/recurso)
 * GET  /api/radar/resumen — gemelo digital: totales por tipo + señales recientes sanitizadas
 */

const radarSubmitRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { message: 'Mandaste muchas señales seguidas. Esperá unos minutos y seguí.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Cache corto del resumen para no castigar la base con cada apertura de la app
let resumenCache: { data: unknown; generatedAt: number } | null = null;
const RESUMEN_TTL_MS = 60 * 1000;

export function registerRadarRoutes(app: Express): void {
  app.post('/api/radar/senal', radarSubmitRateLimit, optionalAuth, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const input = radarSenalSchema.parse(req.body);
      const userId = req.user?.userId ?? null;

      if (isVoiceType(input.type)) {
        const dream = await storage.createDream(buildDreamInsert(input, userId));
        resumenCache = null;
        return res.status(201).json({ ok: true, type: input.type, id: dream.id });
      }

      if (!userId) {
        return res.status(401).json({
          message: input.type === 'compromiso'
            ? 'Necesitás una cuenta para registrar compromisos'
            : 'Necesitás una cuenta para ofrecer recursos',
          code: 'AUTH_REQUIRED',
        });
      }

      if (input.type === 'compromiso') {
        const commitment = await storage.saveCommitment(userId, input.text, 'initial', {
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
        });
        resumenCache = null;
        return res.status(201).json({ ok: true, type: input.type, id: commitment.id });
      }

      // recurso
      const resource = await storage.createUserResource({
        userId,
        description: input.text,
        category: input.category ?? 'other',
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        location: input.location ?? null,
      });
      resumenCache = null;
      return res.status(201).json({ ok: true, type: input.type, id: resource.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message ?? 'Datos inválidos' });
      }
      console.error('Radar senal error:', error);
      return res.status(500).json({ message: 'No pudimos guardar tu señal. Probá de nuevo.' });
    }
  });

  app.get('/api/radar/resumen', async (_req, res: Response) => {
    try {
      if (resumenCache && Date.now() - resumenCache.generatedAt < RESUMEN_TTL_MS) {
        return res.json(resumenCache.data);
      }

      const [dreamTypeCounts, [commitmentCount], [resourceCount], recentRows] = await Promise.all([
        db.select({ type: dreams.type, count: sql<number>`count(*)::int` })
          .from(dreams)
          .groupBy(dreams.type),
        db.select({ count: sql<number>`count(*)::int` })
          .from(userCommitments)
          .where(eq(userCommitments.status, 'active')),
        db.select({ count: sql<number>`count(*)::int` })
          .from(userResources)
          .where(eq(userResources.isActive, true)),
        db.select({
          id: dreams.id,
          type: dreams.type,
          dream: dreams.dream,
          value: dreams.value,
          need: dreams.need,
          basta: dreams.basta,
          location: dreams.location,
          createdAt: dreams.createdAt,
        })
          .from(dreams)
          .orderBy(desc(dreams.id))
          .limit(20),
      ]);

      const totals: Record<string, number> = {
        dream: 0, value: 0, need: 0, basta: 0,
        compromiso: commitmentCount?.count ?? 0,
        recurso: resourceCount?.count ?? 0,
      };
      for (const row of dreamTypeCounts) {
        if (row.type in totals) totals[row.type] = row.count;
      }
      const total = Object.values(totals).reduce((a, b) => a + b, 0);

      const recientes = recentRows.map((row) => ({
        id: row.id,
        type: row.type,
        excerpt: excerptSignalText(row.dream ?? row.value ?? row.need ?? row.basta),
        location: row.location,
        createdAt: row.createdAt,
      }));

      const data = { totals: { ...totals, total }, recientes };
      resumenCache = { data, generatedAt: Date.now() };
      return res.json(data);
    } catch (error) {
      console.error('Radar resumen error:', error);
      return res.status(500).json({ message: 'No pudimos cargar el pulso del Radar.' });
    }
  });
}
