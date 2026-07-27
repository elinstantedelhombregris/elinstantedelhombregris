import type { GeoPoint, LocationPrecision } from './types';

export interface TerritoryPoint extends GeoPoint {
  id: string;
  status: string;
  category: string;
  precision?: LocationPrecision;
}

export interface TerritorySelection {
  polygon: GeoPoint[];
  selectedIds: string[];
}

/** Ray casting; funciona igual en píxeles o en coordenadas geográficas. */
export const pointInPolygon = (point: GeoPoint, polygon: GeoPoint[]): boolean => {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!;
    const b = polygon[j]!;
    const intersects =
      a.lat > point.lat !== b.lat > point.lat &&
      point.lng < ((b.lng - a.lng) * (point.lat - a.lat)) / (b.lat - a.lat || Number.EPSILON) + a.lng;
    if (intersects) inside = !inside;
  }
  return inside;
};

export const selectTerritoryPoints = (points: TerritoryPoint[], polygon: GeoPoint[]): string[] =>
  points.filter((point) => pointInPolygon(point, polygon)).map((point) => point.id);

export const polygonCenter = (polygon: GeoPoint[]): GeoPoint | null => {
  if (polygon.length === 0) return null;
  return {
    lat: polygon.reduce((sum, point) => sum + point.lat, 0) / polygon.length,
    lng: polygon.reduce((sum, point) => sum + point.lng, 0) / polygon.length,
  };
};
