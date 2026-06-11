// client/src/components/radiografia-map/utils.ts
import type { MapSignal } from '@shared/map-signals';
import type { MapEntry } from './types';

/**
 * Accent-, case-, and whitespace-insensitive comparison key for place names.
 *
 * Used so that "Río Cuarto" (from a DB field) and "Rio Cuarto" (from the
 * provinces API) match each other in filters. We keep the original string
 * for display and compare only on the normalized form.
 *
 * Steps:
 *  1. Unicode NFD — decomposes accented chars ("á" → "a" + "́")
 *  2. Strip combining marks (\p{Mn}) — removes the accent
 *  3. Lowercase
 *  4. Trim + collapse internal whitespace
 */
export function normalizePlaceName(input: string | null | undefined): string | null {
  if (input == null) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  return trimmed
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}


/** Señal del server → entrada del mapa. Mantiene señales sin coordenadas (lat/lng null). */
export function toMapEntries(signals: MapSignal[]): MapEntry[] {
  return signals.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    location: s.location || 'Sin ubicación',
    province: s.province,
    city: s.city,
    provinceKey: normalizePlaceName(s.province),
    cityKey: normalizePlaceName(s.city),
    type: s.type,
    text: s.text,
    category: s.category,
    createdAt: s.createdAt,
  }));
}

/** Tolerante a "2026-06-11 12:00:00+00" (Postgres) y a ISO 8601. */
export function parseSignalDate(raw: string | null): number | null {
  if (!raw) return null;
  const t = Date.parse(raw.includes('T') ? raw : raw.replace(' ', 'T'));
  return Number.isFinite(t) ? t : null;
}
