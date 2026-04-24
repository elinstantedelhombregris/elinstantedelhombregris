// client/src/components/radiografia-map/useProvinceClassifier.ts
import { useEffect, useMemo, useState } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { apiRequest } from '@/lib/queryClient';
import type { MapEntry } from './types';
import { normalizePlaceName } from './utils';

type Feature = {
  type: 'Feature';
  properties: { name: string } & Record<string, unknown>;
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: unknown };
};

type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] };

type Province = { id: number; name: string };
type City = { id: number; name: string; latitude?: number; longitude?: number };

interface ClassifierData {
  boundaries: FeatureCollection;
  cityByProvince: Record<string, City[]>;
}

const MAX_CITY_KM = 50;

/**
 * Natural Earth uses "Ciudad de Buenos Aires" but the backend's
 * /api/geographic/provinces returns the official "Ciudad Autónoma de Buenos Aires".
 * Silent filter mismatches are the failure mode if this drifts — see
 * memory/project_radiografia_map_geojson.md.
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

// ─── Persistent cache ───
// Two layers:
//  1. Module-level singleton — dedupes concurrent fetches within a page load.
//  2. localStorage — survives hard-refresh for CACHE_TTL_MS.
// Bump CACHE_VERSION whenever the boundaries file or the shape of
// ClassifierData changes.

const CACHE_VERSION = 'v1';
const CACHE_KEY = `radiografia-classifier:${CACHE_VERSION}`;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEnvelope {
  cachedAt: number;
  data: ClassifierData;
}

function readLocalCache(): ClassifierData | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    if (!raw) return null;
    const env = JSON.parse(raw) as CacheEnvelope;
    if (typeof env.cachedAt !== 'number') return null;
    if (Date.now() - env.cachedAt > CACHE_TTL_MS) return null;
    if (!env.data?.boundaries?.features) return null;
    return env.data;
  } catch {
    return null;
  }
}

function writeLocalCache(data: ClassifierData): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const env: CacheEnvelope = { cachedAt: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(env));
  } catch {
    // Quota exceeded, Safari private mode, etc. — silent OK.
    // In-memory singleton still keeps this session fast.
  }
}

async function fetchClassifierData(): Promise<ClassifierData> {
  const res = await fetch('/data/argentina-provinces-simplified.geojson');
  if (!res.ok) throw new Error(`Boundaries fetch failed: ${res.status}`);
  const boundaries = (await res.json()) as FeatureCollection;

  const cityByProvince: Record<string, City[]> = {};
  try {
    const provRes = await apiRequest('GET', '/api/geographic/provinces');
    if (provRes.ok) {
      const provinces = (await provRes.json()) as Province[];
      await Promise.all(
        provinces.map(async (p) => {
          try {
            const r = await apiRequest('GET', `/api/geographic/provinces/${p.id}/cities`);
            if (!r.ok) return;
            const cities = (await r.json()) as City[];
            cityByProvince[p.name] = cities.filter((c) => c.latitude != null && c.longitude != null);
          } catch {
            // ignore per-province failure — classifier still works on polygons
          }
        }),
      );
    }
  } catch {
    // city lookup is optional; boundaries alone are enough for province filtering
  }

  return { boundaries, cityByProvince };
}

// ─── Session-wide singleton ───
// Prevents a 24-request burst on every nav within the same page load.

let singleton: Promise<ClassifierData> | null = null;

function loadClassifierData(): Promise<ClassifierData> {
  if (singleton) return singleton;

  const cached = readLocalCache();
  if (cached) {
    singleton = Promise.resolve(cached);
    return singleton;
  }

  singleton = fetchClassifierData()
    .then((data) => {
      writeLocalCache(data);
      return data;
    })
    .catch((e: unknown) => {
      // Reset so a future mount can retry instead of being poisoned forever
      singleton = null;
      throw e;
    });

  return singleton;
}

/** Test-only. Lets tests start from a clean module state. */
export function __resetProvinceClassifierSingleton() {
  singleton = null;
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(CACHE_KEY);
  } catch {
    // noop
  }
}

// ─── Hook ───

export interface ProvinceClassifier {
  classify: (entries: MapEntry[]) => MapEntry[];
  loaded: boolean;
  error: string | null;
}

export function useProvinceClassifier(): ProvinceClassifier {
  const [data, setData] = useState<ClassifierData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadClassifierData()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        console.warn('[useProvinceClassifier] load failed:', msg);
        setError(msg);
      });
    return () => { cancelled = true; };
  }, []);

  const classify = useMemo(() => {
    // Per-entry cache keyed by identity — re-render passing the same MapEntry
    // instances doesn't re-run point-in-polygon.
    const cache = new WeakMap<MapEntry, MapEntry>();

    return (entries: MapEntry[]): MapEntry[] => {
      if (!data) return entries;
      const { boundaries, cityByProvince } = data;

      return entries.map((entry) => {
        if (entry.province != null) return entry; // already assigned upstream
        const cached = cache.get(entry);
        if (cached) return cached;

        const point = {
          type: 'Point' as const,
          coordinates: [entry.lng, entry.lat] as [number, number],
        };
        let province: string | null = null;
        for (const f of boundaries.features) {
          try {
            if (booleanPointInPolygon(point, f as never)) {
              const raw = (f.properties as { name?: string }).name ?? '';
              province = raw ? normalizeProvinceName(raw) : null;
              break;
            }
          } catch {
            // skip malformed features
          }
        }
        if (!province) {
          cache.set(entry, entry);
          return entry;
        }

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

        const enriched: MapEntry = {
          ...entry,
          province,
          city,
          provinceKey: normalizePlaceName(province),
          cityKey: normalizePlaceName(city),
        };
        cache.set(entry, enriched);
        return enriched;
      });
    };
  }, [data]);

  return { classify, loaded: data != null, error };
}
