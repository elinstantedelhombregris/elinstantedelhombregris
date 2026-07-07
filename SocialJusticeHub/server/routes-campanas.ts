// server/routes-campanas.ts
// API de campañas ¡BASTA! — relevamientos y consultas lanzados por círculos.
import type { Express, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { authenticateToken, optionalAuth, type AuthRequest } from './auth';
import { sanitizeInput, publicReadRateLimit } from './middleware';
import { parsePagination } from './lib/pagination';
import { resolveSignalGeo } from './geo-service';
import { haversineKm } from './geo-resolver';
import {
  crearCampanaSchema,
  cambiarEstadoSchema,
  entradaSchema,
  canTransition,
  validateEntryData,
  parseFormSchema,
} from './lib/campanas';
import type { CampaignFormSchema } from '@shared/campaign-forms';
import * as campanas from './services/campanas-service';
import { getCircleById, getMembership } from './services/circulos-service';

const entrySubmitRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { message: 'Mandaste muchas entradas seguidas. Esperá unos minutos y seguí relevando.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Caches in-module (patrón routes-analytics.ts) ──

interface CacheEntry<T> {
  data: T;
  generatedAt: Date;
}

let plantillasCache: CacheEntry<unknown> | null = null;
const PLANTILLAS_TTL = 15 * 60 * 1000; // 15 minutos

const progresoCache = new Map<number, CacheEntry<unknown>>();
const PROGRESO_TTL = 60 * 1000; // 60 segundos
const PROGRESO_CACHE_MAX = 500;

function isCacheFresh<T>(entry: CacheEntry<T> | null | undefined, ttl: number): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.generatedAt.getTime() < ttl;
}

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function zodMessage(error: z.ZodError): string {
  return error.errors[0]?.message ?? 'Datos inválidos';
}

export function registerCampanasRoutes(app: Express): void {
  // ── Plantillas (antes que /api/campanas/:id) ──
  app.get('/api/campanas/plantillas', publicReadRateLimit, async (_req, res: Response) => {
    try {
      if (isCacheFresh(plantillasCache, PLANTILLAS_TTL)) {
        return res.json(plantillasCache.data);
      }
      const templates = await campanas.listTemplates();
      const plantillas = templates.map((t) => ({
        id: t.id,
        slug: t.slug,
        type: t.type,
        title: t.title,
        description: t.description,
        category: t.category,
        formSchema: parseFormSchema(t.formSchema),
        mapColor: t.mapColor,
        mapIcon: t.mapIcon,
      }));
      const data = { plantillas, total: plantillas.length };
      plantillasCache = { data, generatedAt: new Date() };
      return res.json(data);
    } catch (error) {
      console.error('[campanas] plantillas error:', error);
      return res.status(500).json({ message: 'No pudimos cargar las plantillas. Probá de nuevo.' });
    }
  });

  // ── Crear campaña dentro de un círculo ──
  app.post('/api/circulos/:id/campanas', authenticateToken, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const circleId = parseId(req.params.id);
      if (!circleId) return res.status(400).json({ message: 'Círculo inválido' });

      const circle = await getCircleById(circleId);
      if (!circle) return res.status(404).json({ message: 'Ese círculo no existe.' });

      const userId = req.user!.userId;
      const membership = await getMembership(circleId, userId);
      if (!membership) {
        if (circle.kind === 'celula' || circle.isPrivate) {
          return res.status(404).json({ message: 'Ese círculo no existe.' });
        }
        return res.status(403).json({ message: 'Tenés que ser parte del círculo para lanzar campañas.' });
      }

      // Gobernanza contextual: coordinado → solo coordinadores; abierto → cualquier miembro
      if (circle.governance === 'coordinado' && membership.role !== 'coordinador') {
        return res.status(403).json({
          message: 'En este círculo las campañas las lanzan los coordinadores. Proponésela a quien coordina.',
        });
      }

      const input = crearCampanaSchema.parse(req.body);

      let formSchema: CampaignFormSchema | null = input.formSchema ?? null;
      let defaults: { category?: string | null; mapColor?: string | null; mapIcon?: string | null } = {};
      if (input.templateId) {
        const template = await campanas.getTemplateById(input.templateId);
        if (!template || template.isActive === false) {
          return res.status(404).json({ message: 'Esa plantilla no existe o ya no está disponible.' });
        }
        if (template.type !== input.type) {
          return res.status(400).json({
            message: `Esa plantilla es de ${template.type} y la campaña es de ${input.type}. Tienen que coincidir.`,
          });
        }
        if (!formSchema) formSchema = parseFormSchema(template.formSchema);
        defaults = { category: template.category, mapColor: template.mapColor, mapIcon: template.mapIcon };
      }

      if (!formSchema) {
        return res.status(400).json({ message: 'Elegí una plantilla o armá el formulario de la campaña' });
      }

      const campaign = await campanas.createCampaign(circleId, input, formSchema, defaults, userId);
      return res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: zodMessage(error) });
      }
      console.error('[campanas] create error:', error);
      return res.status(500).json({ message: 'No pudimos crear la campaña. Probá de nuevo.' });
    }
  });

  // ── Listado ──
  app.get('/api/campanas', publicReadRateLimit, async (req, res: Response) => {
    try {
      const str = (v: unknown): string | undefined =>
        typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;

      const results = await campanas.listCampaigns({
        status: str(req.query.status),
        type: str(req.query.type),
        province: str(req.query.province),
        city: str(req.query.city),
      });

      const campanasOut = results.map((c) => ({ ...c, formSchema: undefined }));
      return res.json({ campanas: campanasOut, total: campanasOut.length });
    } catch (error) {
      console.error('[campanas] list error:', error);
      return res.status(500).json({ message: 'No pudimos cargar las campañas. Probá de nuevo.' });
    }
  });

  // ── Detalle (incluye formSchema parseado) ──
  app.get('/api/campanas/:id', publicReadRateLimit, async (req, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Campaña inválida' });

      const campaign = await campanas.getCampaignWithCircle(id);
      if (!campaign) return res.status(404).json({ message: 'Esa campaña no existe.' });

      return res.json({ ...campaign, formSchema: parseFormSchema(campaign.formSchema) });
    } catch (error) {
      console.error('[campanas] detail error:', error);
      return res.status(500).json({ message: 'No pudimos cargar la campaña. Probá de nuevo.' });
    }
  });

  // ── Cambiar estado (solo hacia adelante) ──
  app.post('/api/campanas/:id/estado', authenticateToken, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Campaña inválida' });

      const campaign = await campanas.getCampaignById(id);
      if (!campaign) return res.status(404).json({ message: 'Esa campaña no existe.' });

      const userId = req.user!.userId;
      const membership = await getMembership(campaign.circleId, userId);
      const isCreator = campaign.createdBy === userId;
      const isCoordinator = membership?.role === 'coordinador';
      if (!isCreator && !isCoordinator) {
        return res.status(403).json({ message: 'Solo quien creó la campaña o coordina el círculo puede cambiar su estado.' });
      }

      const { estado } = cambiarEstadoSchema.parse(req.body);
      if (!canTransition(campaign.status, estado)) {
        return res.status(400).json({
          message: `Una campaña ${campaign.status} no puede pasar a ${estado}. Los estados solo avanzan.`,
        });
      }

      const updated = await campanas.updateCampaignStatus(id, estado);
      progresoCache.delete(id);
      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: zodMessage(error) });
      }
      console.error('[campanas] estado error:', error);
      return res.status(500).json({ message: 'No pudimos cambiar el estado. Probá de nuevo.' });
    }
  });

  // ── Cargar entrada ──
  app.post('/api/campanas/:id/entradas', entrySubmitRateLimit, authenticateToken, sanitizeInput, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Campaña inválida' });

      const campaign = await campanas.getCampaignById(id);
      if (!campaign) return res.status(404).json({ message: 'Esa campaña no existe.' });

      if (campaign.status !== 'activa') {
        return res.status(409).json({ message: 'Esta campaña no está recibiendo entradas en este momento.' });
      }

      const userId = req.user!.userId;
      const input = entradaSchema.parse(req.body);

      // Resolución geográfica: clasificamos con coords crudas, persistimos snapeadas
      const resolved = await resolveSignalGeo(input.latitude, input.longitude);

      if (campaign.type === 'relevamiento') {
        const membership = await getMembership(campaign.circleId, userId);
        if (!membership) {
          return res.status(403).json({
            message: 'Este relevamiento lo carga la gente del círculo. Sumate al círculo primero.',
          });
        }
      } else {
        // consulta: contención geográfica (provincia/ciudad objetivo o radio)
        const checks: boolean[] = [];
        if (campaign.targetLat != null && campaign.targetLng != null && campaign.targetRadiusKm != null) {
          checks.push(
            haversineKm(input.latitude, input.longitude, campaign.targetLat, campaign.targetLng) <= campaign.targetRadiusKm,
          );
        }
        if (campaign.targetProvince) {
          const provinceOk = resolved.province === campaign.targetProvince;
          const cityOk = !campaign.targetCity || resolved.city === campaign.targetCity;
          checks.push(provinceOk && cityOk);
        }
        if (checks.length > 0 && !checks.some(Boolean)) {
          return res.status(403).json({
            message: 'Esta consulta es para gente de otra zona. Fijate las campañas activas en la tuya.',
          });
        }
      }

      const formSchema = parseFormSchema(campaign.formSchema);
      if (!formSchema) {
        console.error('[campanas] formSchema corrupto en campaña', campaign.id);
        return res.status(500).json({ message: 'El formulario de esta campaña está roto. Avisale a quien la coordina.' });
      }

      const validation = validateEntryData(formSchema, input.data);
      if (!validation.ok || !validation.data) {
        return res.status(400).json({ message: validation.message ?? 'Las respuestas no pasaron la validación.' });
      }

      const entry = await campanas.createEntry({
        campaignId: campaign.id,
        submittedBy: userId, // se guarda siempre para el track record; jamás se expone si anonymous
        anonymous: input.anonymous ?? false,
        latitude: resolved.lat,
        longitude: resolved.lng,
        province: resolved.province,
        city: resolved.city,
        data: validation.data,
        photoUrl: input.photoUrl ?? null,
      });

      progresoCache.delete(campaign.id);
      return res.status(201).json({ ok: true, id: entry.id, province: resolved.province, city: resolved.city });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: zodMessage(error) });
      }
      console.error('[campanas] entrada error:', error);
      return res.status(500).json({ message: 'No pudimos guardar tu entrada. Probá de nuevo.' });
    }
  });

  // ── Entradas (paginado; anonimizado para no-miembros) ──
  app.get('/api/campanas/:id/entradas', publicReadRateLimit, optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Campaña inválida' });

      const campaign = await campanas.getCampaignById(id);
      if (!campaign) return res.status(404).json({ message: 'Esa campaña no existe.' });

      const userId = req.user?.userId ?? null;
      const membership = userId ? await getMembership(campaign.circleId, userId) : undefined;

      const pagination = parsePagination(req, { defaultLimit: 20, maxLimit: 100 });
      const { entradas, total } = await campanas.listEntries(
        campaign.id,
        campaign.circleId,
        Boolean(membership),
        pagination,
      );
      return res.json({ entradas, total, limit: pagination.limit, offset: pagination.offset });
    } catch (error) {
      console.error('[campanas] entradas error:', error);
      return res.status(500).json({ message: 'No pudimos cargar las entradas. Probá de nuevo.' });
    }
  });

  // ── Verificación entre pares ──
  app.post('/api/campanas/entradas/:entryId/verificar', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const entryId = parseId(req.params.entryId);
      if (!entryId) return res.status(400).json({ message: 'Entrada inválida' });

      const entry = await campanas.getEntryById(entryId);
      if (!entry) return res.status(404).json({ message: 'Esa entrada no existe.' });

      const campaign = await campanas.getCampaignById(entry.campaignId);
      if (!campaign) return res.status(404).json({ message: 'La campaña de esa entrada ya no existe.' });

      const userId = req.user!.userId;
      const membership = await getMembership(campaign.circleId, userId);
      if (!membership) {
        return res.status(403).json({ message: 'Las entradas las verifica la gente del círculo. Sumate primero.' });
      }

      if (entry.submittedBy === userId) {
        return res.status(403).json({ message: 'No podés verificar tu propia entrada — la confianza la construyen los demás.' });
      }

      if (entry.status === 'verificada') {
        return res.status(409).json({ message: 'Esa entrada ya está verificada.' });
      }

      const updated = await campanas.verifyEntry(entryId, userId);
      progresoCache.delete(campaign.id);
      return res.json({ ok: true, id: updated?.id, status: updated?.status });
    } catch (error) {
      console.error('[campanas] verificar error:', error);
      return res.status(500).json({ message: 'No pudimos verificar la entrada. Probá de nuevo.' });
    }
  });

  // ── Progreso (cache 60s) ──
  app.get('/api/campanas/:id/progreso', publicReadRateLimit, async (req, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Campaña inválida' });

      const cached = progresoCache.get(id);
      if (isCacheFresh(cached, PROGRESO_TTL)) {
        return res.json(cached.data);
      }

      const campaign = await campanas.getCampaignById(id);
      if (!campaign) return res.status(404).json({ message: 'Esa campaña no existe.' });

      const progress = await campanas.computeProgress(campaign);
      if (progresoCache.size >= PROGRESO_CACHE_MAX) progresoCache.clear();
      progresoCache.set(id, { data: progress, generatedAt: new Date() });
      return res.json(progress);
    } catch (error) {
      console.error('[campanas] progreso error:', error);
      return res.status(500).json({ message: 'No pudimos calcular el progreso. Probá de nuevo.' });
    }
  });
}
