// client/src/components/radiografia-map/useProvinceClassifier.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { apiRequest } from '@/lib/queryClient';
import type { MapEntry } from './types';

type Feature = {
  type: 'Feature';
  properties: { name: string } & Record<string, unknown>;
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: any };
};

type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] };

type Province = { id: number; name: string };
type City = { id: number; name: string; latitude?: number; longitude?: number };

const MAX_CITY_KM = 50;

/**
 * Map GeoJSON province names that differ from the API's canonical names.
 * Natural Earth uses "Ciudad de Buenos Aires" but the API uses the official
 * "Ciudad Autónoma de Buenos Aires".
 */
const GEOJSON_TO_API_NAME: Record<string, string> = {
  'Ciudad de Buenos Aires': 'Ciudad Autónoma de Buenos Aires',
};

function normalizeProvinceName(geojsonName: string): string {
  return GEOJSON_TO_API_NAME[geojsonName] ?? geojsonName;
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function useProvinceClassifier() {
  const [boundaries, setBoundaries] = useState<FeatureCollection | null>(null);
  const [cityByProvince, setCityByProvince] = useState<Record<string, City[]>>({});
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      try {
        // Load boundaries
        const res = await fetch('/data/argentina-provinces-simplified.geojson');
        if (!res.ok) throw new Error(`Boundaries fetch failed: ${res.status}`);
        const geo = (await res.json()) as FeatureCollection;
        setBoundaries(geo);

        // Load provinces then cities
        const provRes = await apiRequest('GET', '/api/geographic/provinces');
        if (!provRes.ok) return; // city lookup optional; province still works from polygons
        const provinces = (await provRes.json()) as Province[];

        const map: Record<string, City[]> = {};
        await Promise.all(
          provinces.map(async (p) => {
            try {
              const r = await apiRequest('GET', `/api/geographic/provinces/${p.id}/cities`);
              if (!r.ok) return;
              const cities = (await r.json()) as City[];
              map[p.name] = cities.filter((c) => c.latitude != null && c.longitude != null);
            } catch {
              // ignore per-province failure
            }
          }),
        );
        setCityByProvince(map);
      } catch (e: any) {
        console.warn('[useProvinceClassifier] load failed:', e?.message || e);
        setError(e?.message || 'load failed');
      }
    })();
  }, []);

  const classify = useMemo(() => {
    return (entries: MapEntry[]): MapEntry[] => {
      if (!boundaries) return entries;

      return entries.map((entry) => {
        if (entry.province != null) return entry; // already assigned

        const point = { type: 'Point' as const, coordinates: [entry.lng, entry.lat] as [number, number] };
        let province: string | null = null;
        for (const f of boundaries.features) {
          try {
            if (booleanPointInPolygon(point, f as any)) {
              province = normalizeProvinceName((f.properties as any).name ?? '');
              if (!province) province = null;
              break;
            }
          } catch {
            // skip malformed features
          }
        }
        if (!province) return entry;

        // Nearest city within province (if data available)
        const cities = cityByProvince[province];
        let city: string | null = null;
        if (cities && cities.length > 0) {
          let best: City | null = null;
          let bestKm = Infinity;
          for (const c of cities) {
            const km = haversineKm([entry.lng, entry.lat], [c.longitude!, c.latitude!]);
            if (km < bestKm) {
              bestKm = km;
              best = c;
            }
          }
          if (best && bestKm <= MAX_CITY_KM) city = best.name;
        }

        return { ...entry, province, city };
      });
    };
  }, [boundaries, cityByProvince]);

  return { classify, loaded: boundaries != null, error };
}
