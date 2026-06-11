// server/geo-resolver.ts
// Resolución geográfica pura (sin DB): punto-en-polígono sobre las 24 provincias,
// ciudad más cercana por haversine, y snap de coordenadas para privacidad.
import provincesGeoJSON from './data/argentina-provinces';

export interface GeoFeature {
  type: 'Feature';
  properties: { name?: string } & Record<string, unknown>;
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: unknown };
}

export interface CityCandidate {
  name: string;
  latitude: number | null;
  longitude: number | null;
}

/** Natural Earth dice "Ciudad de Buenos Aires"; el resto del sistema usa el nombre oficial. */
const GEOJSON_TO_OFFICIAL: Record<string, string> = {
  'Ciudad de Buenos Aires': 'Ciudad Autónoma de Buenos Aires',
};

const MAX_CITY_KM = 50;

/** Redondeo a 2 decimales ≈ 1.1 km — nunca persistimos la posición exacta del usuario. */
export function snapCoords(lat: number, lng: number): { lat: number; lng: number } {
  return { lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 };
}

function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygonRings(lng: number, lat: number, rings: number[][][]): boolean {
  if (rings.length === 0 || !pointInRing(lng, lat, rings[0])) return false;
  // Los anillos siguientes al primero son agujeros
  for (let k = 1; k < rings.length; k++) {
    if (pointInRing(lng, lat, rings[k])) return false;
  }
  return true;
}

export function pointInPolygonFeature(lng: number, lat: number, feature: GeoFeature): boolean {
  const { type, coordinates } = feature.geometry;
  if (type === 'Polygon') return pointInPolygonRings(lng, lat, coordinates as number[][][]);
  if (type === 'MultiPolygon') {
    return (coordinates as number[][][][]).some((poly) => pointInPolygonRings(lng, lat, poly));
  }
  return false;
}

/** Nombre oficial de la provincia que contiene el punto, o null. */
export function resolveProvince(lat: number, lng: number): string | null {
  const features = (provincesGeoJSON as { features: GeoFeature[] }).features;
  for (const f of features) {
    try {
      if (pointInPolygonFeature(lng, lat, f)) {
        const raw = f.properties?.name;
        if (typeof raw === 'string' && raw) return GEOJSON_TO_OFFICIAL[raw] ?? raw;
        return null;
      }
    } catch {
      // feature malformada — seguimos con la próxima
    }
  }
  return null;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Ciudad más cercana dentro de 50 km, o null. */
export function nearestCity(lat: number, lng: number, cities: CityCandidate[]): string | null {
  let best: string | null = null;
  let bestKm = Infinity;
  for (const c of cities) {
    if (c.latitude == null || c.longitude == null) continue;
    const km = haversineKm(lat, lng, c.latitude, c.longitude);
    if (km < bestKm) {
      bestKm = km;
      best = c.name;
    }
  }
  return bestKm <= MAX_CITY_KM ? best : null;
}
