// server/routes-map-signals.ts
// GET /api/map/signals — todas las señales (sueños + compromisos + recursos)
// normalizadas a MapSignal. Reemplaza la triple query del cliente y elimina
// el límite accidental de 20 sueños (parsePagination) que recortaba el mapa.
import type { Express } from 'express';
import { desc, eq } from 'drizzle-orm';
import { db } from './db';
import { dreams, userCommitments, userResources } from '@shared/schema';
import { publicReadRateLimit } from './middleware';
import type { MapSignal, SignalType } from '@shared/map-signals';

const MAX_SIGNALS = 5000;

const parseCoord = (v: string | number | null): number | null => {
  if (v == null || v === '') return null;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : null;
};

const dreamText = (d: { dream: string | null; value: string | null; need: string | null; basta: string | null }) =>
  d.dream || d.value || d.need || d.basta || '';

const dreamType = (raw: string | null): SignalType =>
  raw === 'value' || raw === 'need' || raw === 'basta' ? raw : 'dream';

export function registerMapSignalsRoutes(app: Express): void {
  app.get('/api/map/signals', publicReadRateLimit, async (_req, res) => {
    try {
      const [dreamRows, commitmentRows, resourceRows] = await Promise.all([
        db.select({
          id: dreams.id, type: dreams.type, dream: dreams.dream, value: dreams.value,
          need: dreams.need, basta: dreams.basta, location: dreams.location,
          latitude: dreams.latitude, longitude: dreams.longitude,
          province: dreams.province, city: dreams.city, createdAt: dreams.createdAt,
        }).from(dreams).orderBy(desc(dreams.createdAt)).limit(MAX_SIGNALS),
        db.select({
          id: userCommitments.id, text: userCommitments.commitmentText,
          latitude: userCommitments.latitude, longitude: userCommitments.longitude,
          province: userCommitments.province, city: userCommitments.city,
          createdAt: userCommitments.createdAt,
        }).from(userCommitments).orderBy(desc(userCommitments.createdAt)).limit(MAX_SIGNALS),
        db.select({
          id: userResources.id, text: userResources.description, category: userResources.category,
          latitude: userResources.latitude, longitude: userResources.longitude,
          province: userResources.province, city: userResources.city,
          location: userResources.location, createdAt: userResources.createdAt,
        }).from(userResources).where(eq(userResources.isActive, true))
          .orderBy(desc(userResources.createdAt)).limit(MAX_SIGNALS),
      ]);

      const signals: MapSignal[] = [
        ...dreamRows.map((d): MapSignal => ({
          id: `dream-${d.id}`,
          type: dreamType(d.type),
          text: dreamText(d),
          lat: parseCoord(d.latitude),
          lng: parseCoord(d.longitude),
          location: d.location,
          province: d.province,
          city: d.city,
          category: null,
          createdAt: d.createdAt,
        })),
        ...commitmentRows.map((c): MapSignal => ({
          id: `commitment-${c.id}`,
          type: 'compromiso',
          text: c.text || '',
          lat: parseCoord(c.latitude),
          lng: parseCoord(c.longitude),
          location: [c.city, c.province].filter(Boolean).join(', ') || null,
          province: c.province,
          city: c.city,
          category: null,
          createdAt: c.createdAt,
        })),
        ...resourceRows.map((r): MapSignal => ({
          id: `resource-${r.id}`,
          type: 'recurso',
          text: r.text || '',
          lat: parseCoord(r.latitude),
          lng: parseCoord(r.longitude),
          location: [r.city, r.province].filter(Boolean).join(', ') || r.location || null,
          province: r.province,
          city: r.city,
          category: r.category,
          createdAt: r.createdAt,
        })),
      ]
        .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
        .slice(0, MAX_SIGNALS);

      res.json({ signals, total: signals.length });
    } catch (error) {
      console.error('[map-signals] fetch failed:', error);
      res.status(500).json({ message: 'Failed to fetch map signals' });
    }
  });
}
