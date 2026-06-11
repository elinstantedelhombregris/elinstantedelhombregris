// server/geo-service.ts
// Capa con DB del resolver geográfico: provincia por polígono (exacta) +
// ciudad más cercana entre las ciudades con coordenadas de esa provincia.
// Cachea la tabla geographic_locations por 10 minutos.
import { inArray } from 'drizzle-orm';
import { db } from './db';
import { geographicLocations } from '@shared/schema';
import { resolveProvince, nearestCity, snapCoords, type CityCandidate } from './geo-resolver';

interface GeoRow {
  id: number;
  name: string;
  type: string;
  parentId: number | null;
  latitude: number | null;
  longitude: number | null;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { rows: GeoRow[]; at: number } | null = null;

async function loadGeoRows(): Promise<GeoRow[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.rows;
  const rows = await db
    .select({
      id: geographicLocations.id,
      name: geographicLocations.name,
      type: geographicLocations.type,
      parentId: geographicLocations.parentId,
      latitude: geographicLocations.latitude,
      longitude: geographicLocations.longitude,
    })
    .from(geographicLocations)
    .where(inArray(geographicLocations.type, ['province', 'city']));
  cache = { rows, at: Date.now() };
  return rows;
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export interface ResolvedGeo {
  lat: number;
  lng: number;
  province: string | null;
  city: string | null;
}

/**
 * Snap (privacidad) + provincia por polígono + ciudad más cercana (≤50 km).
 * Nunca lanza: ante cualquier falla devuelve province/city null y las
 * coordenadas snapeadas — el envío de la señal jamás se bloquea por esto.
 */
export async function resolveSignalGeo(rawLat: number, rawLng: number): Promise<ResolvedGeo> {
  // IMPORTANTE: clasificamos con las coordenadas CRUDAS (precisas) y solo
  // persistimos las snapeadas. Si se snapea antes de clasificar, un punto en
  // CABA puede caer en el hueco entre los polígonos simplificados y perder
  // su provincia.
  const { lat, lng } = snapCoords(rawLat, rawLng);
  try {
    const province = resolveProvince(rawLat, rawLng);
    if (!province) return { lat, lng, province: null, city: null };

    let city: string | null = null;
    try {
      const rows = await loadGeoRows();
      const provinceRow = rows.find(
        (r) => r.type === 'province' && normalize(r.name) === normalize(province),
      );
      if (provinceRow) {
        const cities: CityCandidate[] = rows.filter(
          (r) => r.type === 'city' && r.parentId === provinceRow.id && r.latitude != null && r.longitude != null,
        );
        city = nearestCity(rawLat, rawLng, cities);
      }
    } catch (e) {
      console.warn('[geo-service] city lookup failed:', e);
    }
    return { lat, lng, province, city };
  } catch (e) {
    console.warn('[geo-service] resolve failed:', e);
    return { lat, lng, province: null, city: null };
  }
}
