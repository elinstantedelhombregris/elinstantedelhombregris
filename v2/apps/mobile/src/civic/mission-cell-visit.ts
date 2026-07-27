import { pointInCoverageArea, type GeoJsonPolygonInput } from './coverage';
import type { GeoPoint, LocationSource } from './types';

export interface MissionLocationProof {
  source: LocationSource;
  horizontalAccuracyM: number | null | undefined;
}

export type MissionCellVisitValidation =
  | 'valid'
  | 'missing_location'
  | 'location_not_field_verified'
  | 'location_accuracy_too_low'
  | 'outside_cell'
  | 'invalid_cell';

const parseCellGeometry = (value: string): GeoJsonPolygonInput | null => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as { type?: unknown; coordinates?: unknown };
    if (candidate.type !== 'Polygon' || !Array.isArray(candidate.coordinates)) return null;
    return candidate as GeoJsonPolygonInput;
  } catch {
    return null;
  }
};

const distanceToSegmentMeters = (point: GeoPoint, start: GeoPoint, end: GeoPoint): number => {
  const longitudeScale = 111_320 * Math.max(0.01, Math.cos((point.lat * Math.PI) / 180));
  const ax = (start.lng - point.lng) * longitudeScale;
  const ay = (start.lat - point.lat) * 111_320;
  const bx = (end.lng - point.lng) * longitudeScale;
  const by = (end.lat - point.lat) * 111_320;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  return Math.hypot(ax + t * dx, ay + t * dy);
};

const pointMatchesCell = (point: GeoPoint, geometry: GeoJsonPolygonInput): boolean => {
  if (pointInCoverageArea(point, geometry)) return true;
  const ring = geometry.coordinates[0];
  if (!ring || ring.length < 2) return false;
  return ring.some(([lng, lat], index) => {
    const next = ring[(index + 1) % ring.length]!;
    return distanceToSegmentMeters(point, { lat, lng }, { lat: next[1], lng: next[0] }) <= 35;
  });
};

/**
 * Acredita presencia de campo, no ausencia del fenómeno. No persiste el punto:
 * sólo comprueba fuente, precisión y pertenencia a la celda.
 */
export const validateMissionCellVisit = (
  geometryJson: string,
  location: GeoPoint | null,
  proof?: MissionLocationProof,
): MissionCellVisitValidation => {
  if (!location) return 'missing_location';
  if (proof?.source !== 'gps_current') return 'location_not_field_verified';
  if (
    typeof proof.horizontalAccuracyM !== 'number'
    || !Number.isFinite(proof.horizontalAccuracyM)
    || proof.horizontalAccuracyM < 0
    || proof.horizontalAccuracyM > 250
  ) return 'location_accuracy_too_low';
  const geometry = parseCellGeometry(geometryJson);
  if (!geometry) return 'invalid_cell';
  return pointMatchesCell(location, geometry) ? 'valid' : 'outside_cell';
};
