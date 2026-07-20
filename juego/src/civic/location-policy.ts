import { publicLocation } from './geo';
import type { CivicAudience, GeoPoint, LocationPrecision } from './types';

const finite = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Rechaza coordenadas incompletas, no finitas o fuera de WGS84. */
export const validGeoPoint = (point: GeoPoint | null | undefined): GeoPoint | null => {
  if (!point || !finite(point.lat) || !finite(point.lng)) return null;
  if (point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180) return null;
  return { lat: point.lat, lng: point.lng };
};

/**
 * El canal colectivo no admite puntos exactos. Esta regla pura se comparte
 * entre la bóveda local y las filas operativas para evitar representaciones
 * divergentes del mismo consentimiento.
 */
export const sharedPrecisionForAudience = (
  precision: LocationPrecision | undefined,
  audience: CivicAudience | undefined,
): LocationPrecision => {
  const requested = precision ?? 'neighborhood';
  return requested === 'exact' && audience !== 'private' ? '100m' : requested;
};

export const normalizedLocationLabel = (value?: string | null): string | null =>
  value?.trim().slice(0, 120) || null;

/** Fuente única para derivar el punto operativo a partir del dato preciso. */
export const prepareRecordLocation = (input: {
  point: GeoPoint | null | undefined;
  precision?: LocationPrecision;
  audience?: CivicAudience;
  locationLabel?: string | null;
}): {
  exact: GeoPoint | null;
  publicPoint: GeoPoint | null;
  sharedPrecision: LocationPrecision;
  locationLabel: string | null;
} => {
  const exact = validGeoPoint(input.point);
  const sharedPrecision = sharedPrecisionForAudience(input.precision, input.audience);
  const locationLabel = normalizedLocationLabel(input.locationLabel);
  return {
    exact,
    publicPoint: publicLocation(exact, sharedPrecision, locationLabel).point,
    sharedPrecision,
    locationLabel,
  };
};
