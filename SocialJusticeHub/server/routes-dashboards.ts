// server/routes-dashboards.ts
// Dashboards de la app ¡BASTA!: nacional, campañas, círculos, necesidades
// por zona y track record personal.
import type { Express, Response } from 'express';
import { authenticateToken, optionalAuth, type AuthRequest } from './auth';
import { publicReadRateLimit } from './middleware';
import { getCampaignById } from './services/campanas-service';
import { getCircleById, getMembership } from './services/circulos-service';
import {
  computeNacional,
  computeCampaignDashboard,
  computeCircleDashboard,
  computeNecesidades,
  computeMiAporte,
} from './services/dashboards-service';

// ─── In-memory caches (patrón routes-analytics.ts) ───

interface CacheEntry<T> {
  data: T;
  generatedAt: Date;
}

let nacionalCache: CacheEntry<unknown> | null = null;
const NACIONAL_TTL = 15 * 60 * 1000; // 15 minutos

const campanaCache = new Map<number, CacheEntry<unknown>>();
const CAMPANA_TTL = 60 * 1000; // 60 segundos
const CAMPANA_CACHE_MAX = 500;

const necesidadesCache = new Map<string, CacheEntry<unknown>>();
const NECESIDADES_TTL = 15 * 60 * 1000; // 15 minutos
const NECESIDADES_CACHE_MAX = 200;

const miAporteCache = new Map<number, CacheEntry<unknown>>();
const MI_APORTE_TTL = 60 * 1000; // 60 segundos
const MI_APORTE_CACHE_MAX = 1000;

function isCacheFresh<T>(entry: CacheEntry<T> | null | undefined, ttl: number): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.generatedAt.getTime() < ttl;
}

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function registerDashboardsRoutes(app: Express): void {
  // ── Nacional (15 min) ──
  app.get('/api/dashboards/nacional', publicReadRateLimit, async (_req, res: Response) => {
    try {
      if (isCacheFresh(nacionalCache, NACIONAL_TTL)) {
        return res.json(nacionalCache.data);
      }
      const data = await computeNacional();
      nacionalCache = { data, generatedAt: new Date() };
      return res.json(data);
    } catch (error) {
      console.error('[dashboards] nacional error:', error);
      return res.status(500).json({ message: 'No pudimos cargar el panorama nacional. Probá de nuevo.' });
    }
  });

  // ── Campaña (60 s) ──
  app.get('/api/dashboards/campanas/:id', publicReadRateLimit, async (req, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Campaña inválida' });

      const cached = campanaCache.get(id);
      if (isCacheFresh(cached, CAMPANA_TTL)) {
        return res.json(cached.data);
      }

      const campaign = await getCampaignById(id);
      if (!campaign) return res.status(404).json({ message: 'Esa campaña no existe.' });

      const data = await computeCampaignDashboard(campaign);
      if (campanaCache.size >= CAMPANA_CACHE_MAX) campanaCache.clear();
      campanaCache.set(id, { data, generatedAt: new Date() });
      return res.json(data);
    } catch (error) {
      console.error('[dashboards] campana error:', error);
      return res.status(500).json({ message: 'No pudimos cargar el dashboard de la campaña. Probá de nuevo.' });
    }
  });

  // ── Círculo (célula: solo miembros) ──
  app.get('/api/dashboards/circulos/:id', publicReadRateLimit, optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Círculo inválido' });

      const circle = await getCircleById(id);
      if (!circle) return res.status(404).json({ message: 'Ese círculo no existe.' });

      if (circle.kind === 'celula' || circle.isPrivate) {
        const userId = req.user?.userId ?? null;
        const membership = userId ? await getMembership(id, userId) : undefined;
        if (!membership) {
          return res.status(404).json({ message: 'Ese círculo no existe.' });
        }
      }

      const data = await computeCircleDashboard(id);
      return res.json(data);
    } catch (error) {
      console.error('[dashboards] circulo error:', error);
      return res.status(500).json({ message: 'No pudimos cargar el dashboard del círculo. Probá de nuevo.' });
    }
  });

  // ── Necesidades por zona (15 min) ──
  app.get('/api/dashboards/necesidades', publicReadRateLimit, async (req, res: Response) => {
    try {
      const str = (v: unknown): string | undefined =>
        typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
      const province = str(req.query.province);
      const city = str(req.query.city);

      const cacheKey = `${province ?? ''}|${city ?? ''}`;
      const cached = necesidadesCache.get(cacheKey);
      if (isCacheFresh(cached, NECESIDADES_TTL)) {
        return res.json(cached.data);
      }

      const data = await computeNecesidades(province, city);
      if (necesidadesCache.size >= NECESIDADES_CACHE_MAX) necesidadesCache.clear();
      necesidadesCache.set(cacheKey, { data, generatedAt: new Date() });
      return res.json(data);
    } catch (error) {
      console.error('[dashboards] necesidades error:', error);
      return res.status(500).json({ message: 'No pudimos cargar las necesidades de la zona. Probá de nuevo.' });
    }
  });

  // ── Mi aporte (track record personal — requiere sesión) ──
  app.get('/api/dashboards/mi-aporte', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const cached = miAporteCache.get(userId);
      if (isCacheFresh(cached, MI_APORTE_TTL)) {
        return res.json(cached.data);
      }

      const data = await computeMiAporte(userId);
      if (miAporteCache.size >= MI_APORTE_CACHE_MAX) miAporteCache.clear();
      miAporteCache.set(userId, { data, generatedAt: new Date() });
      return res.json(data);
    } catch (error) {
      console.error('[dashboards] mi-aporte error:', error);
      return res.status(500).json({ message: 'No pudimos cargar tu aporte. Probá de nuevo.' });
    }
  });
}
