import type { GeoPoint, LocationPrecision, PublicLocation } from './types';

const METERS_PER_DEGREE_LAT = 111_320;

const precisionMeters = (precision: LocationPrecision): number | null => {
  if (precision === 'exact') return null;
  if (precision === '100m') return 100;
  if (precision === '500m') return 500;
  if (precision === 'neighborhood') return 1_500;
  return 5_000;
};

/**
 * Reduce precisión determinísticamente para que el mismo punto siempre caiga
 * en la misma celda pública. No agrega ruido reversible ni conserva decimales
 * que aparenten una exactitud que ya no existe.
 */
export const obfuscatePoint = (
  point: GeoPoint | null,
  precision: LocationPrecision,
): GeoPoint | null => {
  if (!point || precision === 'exact') return point;
  const meters = precisionMeters(precision);
  if (!meters) return point;
  const latStep = meters / METERS_PER_DEGREE_LAT;
  const latitudeCenter = Math.round(point.lat / latStep) * latStep;
  // El servidor usa el centro de la banda latitudinal para definir la misma
  // grilla en todos los clientes, aun cerca del borde entre celdas.
  const lngScale = Math.max(0.2, Math.cos((latitudeCenter * Math.PI) / 180));
  const lngStep = meters / (METERS_PER_DEGREE_LAT * lngScale);
  return {
    lat: Number(latitudeCenter.toFixed(6)),
    lng: Number((Math.round(point.lng / lngStep) * lngStep).toFixed(6)),
  };
};

export const publicLocation = (
  exact: GeoPoint | null,
  precision: LocationPrecision,
  label: string | null = null,
): PublicLocation => ({ point: obfuscatePoint(exact, precision), precision, label });

/** Radio máximo aproximado entre un centro público y el punto original. */
export const publicLocationUncertaintyKm = (precision: LocationPrecision): number => {
  const meters = precisionMeters(precision);
  return meters == null ? 0 : (meters * Math.SQRT2) / 2_000;
};

export const haversineKm = (a: GeoPoint, b: GeoPoint): number => {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6_371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
};
