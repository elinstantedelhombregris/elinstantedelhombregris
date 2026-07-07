// server/routes-circulos.ts
// API de círculos ¡BASTA! — grupos territoriales, temáticos y células de confianza.
import type { Express, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { authenticateToken, optionalAuth, requireAdmin, type AuthRequest } from './auth';
import { sanitizeInput, publicReadRateLimit } from './middleware';
import { storage } from './storage';
import {
  crearCirculoSchema,
  actualizarCirculoSchema,
  canjearInviteSchema,
  crearInviteSchema,
  reportarSchema,
  resolverReporteSchema,
} from './lib/circulos';
import * as circulos from './services/circulos-service';

const CELULA_JOIN_MESSAGE = 'A una célula se entra con invitación de alguien de adentro. Pedile el código o el QR a quien te invitó.';
const REAL_NAME_MESSAGE = 'Las células piden nombre real. Completá tu perfil primero.';

const reportRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Mandaste muchos reportes seguidos. Esperá unos minutos y seguí.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function zodMessage(error: z.ZodError): string {
  return error.errors[0]?.message ?? 'Datos inválidos';
}

/** ¿El usuario necesita nombre real y no lo tiene cargado? */
async function lacksRealName(userId: number): Promise<boolean> {
  const user = await storage.getUser(userId);
  if (!user) return true;
  const name = (user.name ?? '').trim();
  return !name || name.toLowerCase() === user.username.toLowerCase();
}

export function registerCirculosRoutes(app: Express): void {
  // ── Descubrimiento ──
  app.get('/api/circulos', publicReadRateLimit, optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const q = req.query;
      const num = (v: unknown): number | undefined => {
        if (typeof v !== 'string' || v.trim() === '') return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };
      const str = (v: unknown): string | undefined =>
        typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;

      const results = await circulos.listCircles(
        {
          kind: str(q.kind),
          province: str(q.province),
          city: str(q.city),
          theme: str(q.theme),
          q: str(q.q),
          lat: num(q.lat),
          lng: num(q.lng),
          radiusKm: num(q.radiusKm),
        },
        req.user?.userId ?? null,
      );
      return res.json({ circulos: results, total: results.length });
    } catch (error) {
      console.error('[circulos] list error:', error);
      return res.status(500).json({ message: 'No pudimos cargar los círculos. Probá de nuevo.' });
    }
  });

  // ── Crear ──
  app.post('/api/circulos', authenticateToken, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const input = crearCirculoSchema.parse(req.body);
      const userId = req.user!.userId;

      if (input.kind === 'celula' && (await lacksRealName(userId))) {
        return res.status(400).json({ message: REAL_NAME_MESSAGE, code: 'REAL_NAME_REQUIRED' });
      }

      const circle = await circulos.createCircle(input, userId);
      return res.status(201).json(circle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: zodMessage(error) });
      }
      console.error('[circulos] create error:', error);
      return res.status(500).json({ message: 'No pudimos crear el círculo. Probá de nuevo.' });
    }
  });

  // ── Canjear invitación (antes que las rutas :id por claridad) ──
  app.post('/api/circulos/invitaciones/canjear', authenticateToken, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const { code } = canjearInviteSchema.parse(req.body);
      const userId = req.user!.userId;

      const invite = await circulos.getInviteByCode(code);
      if (!invite) {
        return res.status(404).json({ message: 'Ese código no corresponde a ninguna invitación.' });
      }

      const usable = circulos.isInviteUsable(invite);
      if (!usable.usable) {
        return res.status(410).json({ message: usable.message });
      }

      const circle = await circulos.getCircleById(invite.circleId);
      if (!circle) {
        return res.status(404).json({ message: 'El círculo de esa invitación ya no existe.' });
      }

      const existing = await circulos.getMembership(circle.id, userId);
      if (existing) {
        return res.status(409).json({ message: 'Ya sos parte de este círculo.' });
      }

      const isCelula = circle.kind === 'celula';
      if (isCelula && (await lacksRealName(userId))) {
        return res.status(400).json({ message: REAL_NAME_MESSAGE, code: 'REAL_NAME_REQUIRED' });
      }

      const member = await circulos.joinCircle(circle.id, userId, isCelula);
      await circulos.incrementInviteUses(invite.id);

      return res.status(201).json({
        ok: true,
        circulo: { id: circle.id, name: circle.name, kind: circle.kind },
        role: member.role,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: zodMessage(error) });
      }
      console.error('[circulos] canjear error:', error);
      return res.status(500).json({ message: 'No pudimos canjear la invitación. Probá de nuevo.' });
    }
  });

  // ── Detalle ──
  app.get('/api/circulos/:id', publicReadRateLimit, optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Círculo inválido' });

      const circle = await circulos.getCircleById(id);
      if (!circle) return res.status(404).json({ message: 'Ese círculo no existe.' });

      const userId = req.user?.userId ?? null;
      const membership = userId ? await circulos.getMembership(id, userId) : undefined;

      // Células (y círculos privados): invisibles para quien no es miembro
      if ((circle.kind === 'celula' || circle.isPrivate) && !membership) {
        return res.status(404).json({ message: 'Ese círculo no existe.' });
      }

      const memberCount = await circulos.countMembers(id);
      return res.json({
        ...circle,
        memberCount,
        isMember: Boolean(membership),
        role: membership?.role ?? null,
      });
    } catch (error) {
      console.error('[circulos] detail error:', error);
      return res.status(500).json({ message: 'No pudimos cargar el círculo. Probá de nuevo.' });
    }
  });

  // ── Editar (solo coordinador) ──
  app.patch('/api/circulos/:id', authenticateToken, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Círculo inválido' });

      const circle = await circulos.getCircleById(id);
      if (!circle) return res.status(404).json({ message: 'Ese círculo no existe.' });

      const membership = await circulos.getMembership(id, req.user!.userId);
      if (!membership && (circle.kind === 'celula' || circle.isPrivate)) {
        return res.status(404).json({ message: 'Ese círculo no existe.' });
      }
      if (membership?.role !== 'coordinador') {
        return res.status(403).json({ message: 'Solo quien coordina puede editar el círculo.' });
      }

      const input = actualizarCirculoSchema.parse(req.body);
      const updated = await circulos.updateCircle(id, input);
      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: zodMessage(error) });
      }
      console.error('[circulos] update error:', error);
      return res.status(500).json({ message: 'No pudimos actualizar el círculo. Probá de nuevo.' });
    }
  });

  // ── Unirse ──
  app.post('/api/circulos/:id/unirse', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Círculo inválido' });

      const circle = await circulos.getCircleById(id);
      if (!circle) return res.status(404).json({ message: 'Ese círculo no existe.' });

      if (circle.kind === 'celula') {
        return res.status(403).json({ message: CELULA_JOIN_MESSAGE, code: 'INVITE_REQUIRED' });
      }

      const userId = req.user!.userId;
      const existing = await circulos.getMembership(id, userId);
      if (existing) {
        return res.status(409).json({ message: 'Ya sos parte de este círculo.' });
      }

      const member = await circulos.joinCircle(id, userId, false);
      return res.status(201).json({ ok: true, role: member.role });
    } catch (error) {
      console.error('[circulos] unirse error:', error);
      return res.status(500).json({ message: 'No pudimos sumarte al círculo. Probá de nuevo.' });
    }
  });

  // ── Salir ──
  app.post('/api/circulos/:id/salir', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Círculo inválido' });

      const result = await circulos.leaveCircle(id, req.user!.userId);
      if (!result.ok) {
        return res.status(400).json({ message: result.message });
      }
      return res.json({ ok: true });
    } catch (error) {
      console.error('[circulos] salir error:', error);
      return res.status(500).json({ message: 'No pudimos procesar tu salida. Probá de nuevo.' });
    }
  });

  // ── Miembros ──
  app.get('/api/circulos/:id/miembros', publicReadRateLimit, optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Círculo inválido' });

      const circle = await circulos.getCircleById(id);
      if (!circle) return res.status(404).json({ message: 'Ese círculo no existe.' });

      const userId = req.user?.userId ?? null;
      const membership = userId ? await circulos.getMembership(id, userId) : undefined;
      if ((circle.kind === 'celula' || circle.isPrivate) && !membership) {
        return res.status(404).json({ message: 'Ese círculo no existe.' });
      }

      const miembros = await circulos.listMembers(id);
      return res.json({ miembros, total: miembros.length });
    } catch (error) {
      console.error('[circulos] miembros error:', error);
      return res.status(500).json({ message: 'No pudimos cargar los miembros. Probá de nuevo.' });
    }
  });

  // ── Crear invitación (solo coordinador) ──
  app.post('/api/circulos/:id/invitaciones', authenticateToken, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Círculo inválido' });

      const circle = await circulos.getCircleById(id);
      if (!circle) return res.status(404).json({ message: 'Ese círculo no existe.' });

      const membership = await circulos.getMembership(id, req.user!.userId);
      if (!membership && (circle.kind === 'celula' || circle.isPrivate)) {
        return res.status(404).json({ message: 'Ese círculo no existe.' });
      }
      if (membership?.role !== 'coordinador') {
        return res.status(403).json({ message: 'Solo quien coordina puede generar invitaciones.' });
      }

      const opts = crearInviteSchema.parse(req.body ?? {});
      const invite = await circulos.createInvite(id, req.user!.userId, opts);
      return res.status(201).json({
        code: invite.code,
        maxUses: invite.maxUses,
        uses: invite.uses,
        expiresAt: invite.expiresAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: zodMessage(error) });
      }
      console.error('[circulos] invitaciones error:', error);
      return res.status(500).json({ message: 'No pudimos generar la invitación. Probá de nuevo.' });
    }
  });

  // ── Reportar ──
  app.post('/api/circulos/:id/reportar', reportRateLimit, authenticateToken, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Círculo inválido' });

      const circle = await circulos.getCircleById(id);
      if (!circle) return res.status(404).json({ message: 'Ese círculo no existe.' });

      const { reason } = reportarSchema.parse(req.body);
      const report = await circulos.createReport(id, req.user!.userId, reason);
      return res.status(201).json({ ok: true, id: report.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: zodMessage(error) });
      }
      console.error('[circulos] reportar error:', error);
      return res.status(500).json({ message: 'No pudimos registrar el reporte. Probá de nuevo.' });
    }
  });

  // ── Moderación (admin) ──
  app.get('/api/admin/circulos/reportes', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const status = typeof req.query.status === 'string' &&
        ['pendiente', 'resuelto', 'descartado'].includes(req.query.status)
        ? (req.query.status as 'pendiente' | 'resuelto' | 'descartado')
        : undefined;
      const reportes = await circulos.listReports(status);
      return res.json({ reportes, total: reportes.length });
    } catch (error) {
      console.error('[circulos] admin reportes error:', error);
      return res.status(500).json({ message: 'No pudimos cargar los reportes. Probá de nuevo.' });
    }
  });

  app.post('/api/admin/circulos/reportes/:id/resolver', authenticateToken, requireAdmin, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Reporte inválido' });

      const { estado } = resolverReporteSchema.parse(req.body);
      const updated = await circulos.resolveReport(id, estado, req.user!.userId);
      if (!updated) return res.status(404).json({ message: 'Ese reporte no existe.' });
      return res.json({ ok: true, reporte: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: zodMessage(error) });
      }
      console.error('[circulos] admin resolver error:', error);
      return res.status(500).json({ message: 'No pudimos resolver el reporte. Probá de nuevo.' });
    }
  });
}
