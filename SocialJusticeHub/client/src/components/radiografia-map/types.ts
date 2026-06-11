import type { DreamType } from '@/hooks/useConvergenceAnalysis';

export type { DreamType };

export interface MapEntry {
  id: string;
  /** null cuando la señal se envió "sin ubicación" — cuenta en stats, no en el mapa. */
  lat: number | null;
  lng: number | null;
  location: string;
  /** Display name, may carry accents and original casing. */
  province: string | null;
  /** Display name, may carry accents and original casing. */
  city: string | null;
  /** Normalized province name for accent-insensitive matching. See utils.normalizePlaceName. */
  provinceKey: string | null;
  /** Normalized city name for accent-insensitive matching. See utils.normalizePlaceName. */
  cityKey: string | null;
  type: DreamType;
  text: string;
  /** Solo recursos (legal, medical, …). */
  category: string | null;
  createdAt: string | null;
}

export interface LassoPolygon {
  // Outer ring of a GeoJSON Polygon: [[lng, lat], ...]
  // Callers wrap this in [ring] before handing it to turf.
  coordinates: [number, number][];
}

export type TimeRange = '7d' | '30d' | 'all';

export interface MapFilters {
  types: Set<DreamType>;
  province: string | null;
  city: string | null;
  lasso: LassoPolygon | null;
  timeRange: TimeRange;
}

export const ALL_TYPES: DreamType[] = [
  'dream',
  'value',
  'need',
  'basta',
  'compromiso',
  'recurso',
];

export const initialFilters = (): MapFilters => ({
  types: new Set(ALL_TYPES),
  province: null,
  city: null,
  lasso: null,
  timeRange: 'all',
});
