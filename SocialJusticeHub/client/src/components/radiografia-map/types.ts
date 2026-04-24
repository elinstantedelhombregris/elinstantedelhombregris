import type { DreamType } from '@/hooks/useConvergenceAnalysis';

export type { DreamType };

export interface MapEntry {
  id: string;
  lat: number;
  lng: number;
  location: string;
  province: string | null;
  city: string | null;
  type: DreamType;
  text: string;
}

export interface LassoPolygon {
  // Outer ring of a GeoJSON Polygon: [[lng, lat], ...]
  // Callers wrap this in [ring] before handing it to turf.
  coordinates: [number, number][];
}

export interface MapFilters {
  types: Set<DreamType>;
  province: string | null;
  city: string | null;
  lasso: LassoPolygon | null;
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
});
