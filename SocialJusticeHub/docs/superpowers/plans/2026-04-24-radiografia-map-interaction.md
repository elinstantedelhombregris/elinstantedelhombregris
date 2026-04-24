# La Radiografía — Map Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add hover tooltips, type/province/city filters, and a freeform lasso area-selector (with summary + list panel) to the 3D `deck.gl` map on `/explorar-datos` (La Radiografía).

**Architecture:** New `components/radiografia-map/` folder with a top-level `ConvergenceMap` orchestrator and focused sub-components. All filter state lives in one `useRadiografiaFilters` hook. Dreams without DB `province`/`city` are classified client-side via a point-in-polygon test against a simplified Argentina provinces GeoJSON. The existing `useDeckGLLayers` is extended to expose a normalized `allEntries` array; hex/scatter/arc layers are recomputed from the filtered subset.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind 3, `@deck.gl/react` + `@deck.gl/layers` + `@deck.gl/aggregation-layers` + `react-map-gl/maplibre` (already installed), `@tanstack/react-query`, Framer Motion, `@turf/boolean-point-in-polygon` (new dep).

**Project test convention:** The client has no test framework (no `vitest`, no `*.test.ts` in `client/src`). This plan replaces the spec's vitest unit tests with a combination of strict TypeScript type checks (`npm run check`), `npm run verify` (build + route guard), and a manual smoke checklist at Task 12. Introducing vitest is out of scope.

**Working directory:** `SocialJusticeHub/`. All paths below are relative to it unless otherwise noted. All commits go to `main` (project convention — no feature branches).

---

## File structure

**Create:**

```
client/public/data/
  argentina-provinces-simplified.geojson      # ~200 KB, lazy-loaded

client/src/components/radiografia-map/
  types.ts                                    # MapEntry, MapFilters, LassoPolygon
  useRadiografiaFilters.ts                    # filter state + filteredEntries
  useProvinceClassifier.ts                    # lazy-load boundaries + classify
  MapTooltip.ts                               # tooltip HTML builder (getTooltip)
  LassoOverlay.tsx                            # SVG polygon capture
  SelectionPanel.tsx                          # summary + list drawer
  MapFiltersBar.tsx                           # type chips + dropdowns + buttons
  ConvergenceMap.tsx                          # orchestrator
```

**Modify:**

- `client/src/hooks/useDeckGLLayers.ts` — expose `allEntries` + `id` per entry.
- `client/src/pages/ExplorarDatos.tsx` — replace `ConvergenceMapSection` body with `<ConvergenceMap />`.
- `package.json` / `package-lock.json` — add `@turf/boolean-point-in-polygon`.

---

## Task 1: Install dependencies and add boundaries GeoJSON

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `client/public/data/argentina-provinces-simplified.geojson`

- [ ] **Step 1: Install Turf helper**

```bash
cd SocialJusticeHub
npm install @turf/boolean-point-in-polygon@^7.0.0
```

- [ ] **Step 2: Download Argentina provinces simplified GeoJSON**

Source: Natural Earth Admin-1 (CC0) filtered to ARG, simplified with `mapshaper -simplify 5%`. A verified mirror lives at `https://raw.githubusercontent.com/PoliticaArgentina/data_warehouse/master/geoAr/data/arg_provincias.geojson`.

If that URL is inaccessible, the engineer may substitute any simplified FeatureCollection where each feature has `properties.name` matching Argentina province names exactly as returned by `/api/geographic/provinces` (e.g. "Buenos Aires", "Córdoba", "Ciudad Autónoma de Buenos Aires"). The file must be valid GeoJSON Polygon/MultiPolygon features, total size under ~250 KB.

```bash
mkdir -p client/public/data
curl -sSL https://raw.githubusercontent.com/PoliticaArgentina/data_warehouse/master/geoAr/data/arg_provincias.geojson \
  -o client/public/data/argentina-provinces-simplified.geojson
# Sanity check: must be valid JSON with >= 23 features
jq '.features | length' client/public/data/argentina-provinces-simplified.geojson
# Check file size is reasonable
ls -lh client/public/data/argentina-provinces-simplified.geojson
```

Expected: feature count ≥ 23 (Argentina has 23 provinces + CABA = 24). File size < 300 KB. If size exceeds 300 KB, run a simplification pass with `mapshaper -i input.geojson -simplify 5% keep-shapes -o output.geojson`.

- [ ] **Step 3: Verify the feature names match API provinces**

```bash
cd SocialJusticeHub
# Inspect a few names
jq '[.features[].properties.name] | .[:5]' client/public/data/argentina-provinces-simplified.geojson
```

Expected: first 5 names look like plausible Argentine province names. If the property key is not `name` (e.g. it's `nombre` or `NAME_1`), document this in the file and adjust `useProvinceClassifier.ts` in Task 4 (the plan assumes `properties.name`; update the code if the key differs).

- [ ] **Step 4: Commit**

```bash
cd SocialJusticeHub
git add package.json package-lock.json client/public/data/argentina-provinces-simplified.geojson
git commit -m "feat(radiografia): add Argentina provinces GeoJSON + turf dep

For client-side province classification of dreams that only carry
lat/lng. Lazy-loaded by the map section; used with turf's
point-in-polygon to assign a province to each entry.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Create shared types

**Files:**
- Create: `client/src/components/radiografia-map/types.ts`

- [ ] **Step 1: Write the types file**

```typescript
// client/src/components/radiografia-map/types.ts
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
  // GeoJSON Polygon coordinates: [[[lng, lat], ...]]
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
```

- [ ] **Step 2: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new TypeScript errors introduced by this file. (A pre-existing error in `server/routes.ts` may still report — that's tracked separately.)

- [ ] **Step 3: Commit**

```bash
cd SocialJusticeHub
git add client/src/components/radiografia-map/types.ts
git commit -m "feat(radiografia): shared map types

MapEntry, MapFilters, LassoPolygon types and initialFilters helper
used by the filter hook, layers, tooltip, and selection panel.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Extend useDeckGLLayers to expose normalized allEntries

**Files:**
- Modify: `client/src/hooks/useDeckGLLayers.ts`

- [ ] **Step 1: Rewrite the file**

The change: each entry now carries `id`, normalized `type` as a `DreamType`, and optional `province`/`city` when the source record provides them. `hexagonData` and `arcData` are kept so the current section keeps working until Task 11 swaps it out.

```typescript
// client/src/hooks/useDeckGLLayers.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dream } from '@shared/schema';
import type { DreamType } from '@/hooks/useConvergenceAnalysis';
import type { MapEntry } from '@/components/radiografia-map/types';

// ─── Types ───

export interface DeckGLData {
  allEntries: MapEntry[];
  hexagonData: Array<{ position: [number, number]; weight: number }>;
  arcData: Array<{
    source: [number, number];
    target: [number, number];
    theme: string;
    sourceLabel: string;
    targetLabel: string;
  }>;
  isLoading: boolean;
}

interface LocationBucket {
  location: string;
  lat: number;
  lng: number;
  count: number;
  themes: Record<string, number>;
}

// ─── Helpers ───

function parseCoord(val: string | number | null | undefined): number | null {
  if (val == null) return null;
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return isFinite(n) ? n : null;
}

function getTopTheme(themes: Record<string, number>): string | null {
  let best: string | null = null;
  let bestCount = 0;
  for (const [theme, count] of Object.entries(themes)) {
    if (count > bestCount) {
      bestCount = count;
      best = theme;
    }
  }
  return best;
}

function normalizeType(raw: unknown): DreamType {
  const allowed: DreamType[] = ['dream', 'value', 'need', 'basta', 'compromiso', 'recurso'];
  return allowed.includes(raw as DreamType) ? (raw as DreamType) : 'dream';
}

// ─── Hook ───

export const useDeckGLLayers = (): DeckGLData => {
  const { data: dreams = [], isLoading: dreamsLoading } = useQuery<Dream[]>({
    queryKey: ['/api/dreams'],
    staleTime: 30000,
  });

  const { data: commitmentsResponse, isLoading: commitmentsLoading } = useQuery({
    queryKey: ['/api/commitments'],
    queryFn: async () => {
      const res = await fetch('/api/commitments?limit=100');
      if (!res.ok) return { data: { commitments: [] } };
      return res.json();
    },
    staleTime: 30000,
  });

  const { data: resourcesData = [], isLoading: resourcesLoading } = useQuery<any[]>({
    queryKey: ['/api/resources-map'],
    staleTime: 30000,
  });

  const isLoading = dreamsLoading || commitmentsLoading || resourcesLoading;

  // Unify all entries with lat/lng + id + normalized fields
  const allEntries: MapEntry[] = useMemo(() => {
    const commitments = commitmentsResponse?.data?.commitments || [];
    const entries: MapEntry[] = [];

    // Dreams — no DB province/city; left null for the classifier
    for (const d of dreams) {
      const lat = parseCoord((d as any).latitude);
      const lng = parseCoord((d as any).longitude);
      if (lat == null || lng == null) continue;
      const text = (d as any).dream || (d as any).value || (d as any).need || (d as any).basta || '';
      entries.push({
        id: `dream-${(d as any).id}`,
        lat,
        lng,
        location: (d as any).location || 'Sin ubicación',
        province: null,
        city: null,
        type: normalizeType((d as any).type),
        text,
      });
    }

    // Commitments — DB has city + province
    for (const c of commitments) {
      const lat = parseCoord(c.latitude);
      const lng = parseCoord(c.longitude);
      if (lat == null || lng == null) continue;
      entries.push({
        id: `commitment-${c.id}`,
        lat,
        lng,
        location: [c.city, c.province].filter(Boolean).join(', ') || 'Sin ubicación',
        province: c.province ?? null,
        city: c.city ?? null,
        type: 'compromiso',
        text: c.commitmentText || '',
      });
    }

    // Resources — DB has city + province
    for (const r of (resourcesData || [])) {
      const lat = parseCoord(r.latitude);
      const lng = parseCoord(r.longitude);
      if (lat == null || lng == null) continue;
      entries.push({
        id: `resource-${r.id}`,
        lat,
        lng,
        location: [r.city, r.province].filter(Boolean).join(', ') || r.location || 'Sin ubicación',
        province: r.province ?? null,
        city: r.city ?? null,
        type: 'recurso',
        text: r.description || '',
      });
    }

    return entries;
  }, [dreams, commitmentsResponse, resourcesData]);

  // Build hexagon data
  const hexagonData = useMemo(
    () =>
      allEntries.map((e) => ({
        position: [e.lng, e.lat] as [number, number],
        weight: 1,
      })),
    [allEntries],
  );

  // Build arc data — connect locations sharing a top theme
  const arcData = useMemo(() => {
    const buckets: Record<string, LocationBucket> = {};

    for (const entry of allEntries) {
      const key = entry.location;
      if (!buckets[key]) {
        buckets[key] = {
          location: key,
          lat: entry.lat,
          lng: entry.lng,
          count: 0,
          themes: {},
        };
      }
      buckets[key].count++;
      const theme = entry.type;
      buckets[key].themes[theme] = (buckets[key].themes[theme] || 0) + 1;
    }

    const qualifiedLocations = Object.values(buckets).filter((b) => b.count >= 3);

    const themeGroups: Record<string, LocationBucket[]> = {};
    for (const loc of qualifiedLocations) {
      const top = getTopTheme(loc.themes);
      if (!top) continue;
      if (!themeGroups[top]) themeGroups[top] = [];
      themeGroups[top].push(loc);
    }

    const arcs: DeckGLData['arcData'] = [];
    for (const [theme, locations] of Object.entries(themeGroups)) {
      if (locations.length < 2) continue;
      const limited = locations.slice(0, 10);
      for (let i = 0; i < limited.length; i++) {
        for (let j = i + 1; j < limited.length; j++) {
          arcs.push({
            source: [limited[i].lng, limited[i].lat],
            target: [limited[j].lng, limited[j].lat],
            theme,
            sourceLabel: limited[i].location,
            targetLabel: limited[j].location,
          });
        }
      }
    }

    return arcs;
  }, [allEntries]);

  return { allEntries, hexagonData, arcData, isLoading };
};
```

- [ ] **Step 2: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new TypeScript errors. The callers in `ExplorarDatos.tsx` still destructure `hexagonData` and `arcData` — those remain in the return value.

- [ ] **Step 3: Smoke test in dev**

```bash
cd SocialJusticeHub
npm run dev
```

Visit `http://localhost:3001/explorar-datos` and confirm the 3D map renders as before (hexagon layer visible, arc layer toggle works). Stop the dev server with Ctrl-C once verified.

- [ ] **Step 4: Commit**

```bash
cd SocialJusticeHub
git add client/src/hooks/useDeckGLLayers.ts
git commit -m "feat(radiografia): expose normalized allEntries from useDeckGLLayers

Each entry now carries id, normalized DreamType, and optional province/
city fields (populated from DB for commitments/resources; null for
dreams pending client-side classification). hexagonData and arcData
remain for backward compatibility.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Province classifier hook

**Files:**
- Create: `client/src/components/radiografia-map/useProvinceClassifier.ts`

- [ ] **Step 1: Write the hook**

The hook lazy-loads the boundaries GeoJSON on mount, and once loaded, returns a `classify(entries)` function that fills in `province` for entries where it's null. City resolution uses nearest-centroid via a data-driven list fetched from `/api/geographic/provinces/:id/cities`; if that fails, city stays null (province is still set).

```typescript
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
              province = (f.properties as any).name ?? null;
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
```

- [ ] **Step 2: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd SocialJusticeHub
git add client/src/components/radiografia-map/useProvinceClassifier.ts
git commit -m "feat(radiografia): province classifier hook

Lazy-loads Argentina provinces GeoJSON and per-province city lists.
Returns a classify(entries) function that fills in province via
point-in-polygon and city via nearest-centroid (capped at 50 km).
Failure is non-fatal — classify becomes a no-op.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Filter state hook

**Files:**
- Create: `client/src/components/radiografia-map/useRadiografiaFilters.ts`

- [ ] **Step 1: Write the hook**

```typescript
// client/src/components/radiografia-map/useRadiografiaFilters.ts
import { useCallback, useMemo, useState } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { DreamType, MapEntry, MapFilters, LassoPolygon } from './types';
import { ALL_TYPES, initialFilters } from './types';

export interface RadiografiaFiltersApi {
  filters: MapFilters;
  filteredEntries: MapEntry[];
  toggleType: (t: DreamType) => void;
  setProvince: (p: string | null) => void;
  setCity: (c: string | null) => void;
  setLasso: (lasso: LassoPolygon | null) => void;
  clear: () => void;
  hasActiveFilters: boolean;
}

function matchLasso(entry: MapEntry, lasso: LassoPolygon): boolean {
  if (lasso.coordinates.length < 3) return false;
  // Ensure polygon is closed for turf
  const ring = [...lasso.coordinates];
  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];
  if (firstLng !== lastLng || firstLat !== lastLat) ring.push([firstLng, firstLat]);

  const polygon = {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [ring] },
  };
  const point = { type: 'Point' as const, coordinates: [entry.lng, entry.lat] as [number, number] };
  try {
    return booleanPointInPolygon(point, polygon);
  } catch {
    return false;
  }
}

export function useRadiografiaFilters(entries: MapEntry[]): RadiografiaFiltersApi {
  const [filters, setFilters] = useState<MapFilters>(() => initialFilters());

  const toggleType = useCallback((t: DreamType) => {
    setFilters((prev) => {
      const next = new Set(prev.types);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return { ...prev, types: next };
    });
  }, []);

  const setProvince = useCallback((p: string | null) => {
    setFilters((prev) => ({
      ...prev,
      province: p,
      // Clear city when province changes
      city: prev.province === p ? prev.city : null,
    }));
  }, []);

  const setCity = useCallback((c: string | null) => {
    setFilters((prev) => ({ ...prev, city: c }));
  }, []);

  const setLasso = useCallback((lasso: LassoPolygon | null) => {
    setFilters((prev) => ({ ...prev, lasso }));
  }, []);

  const clear = useCallback(() => setFilters(initialFilters()), []);

  const filteredEntries = useMemo(() => {
    const { types, province, city, lasso } = filters;
    return entries.filter((e) => {
      if (!types.has(e.type)) return false;
      if (province && e.province !== province) return false;
      if (city && e.city !== city) return false;
      if (lasso && !matchLasso(e, lasso)) return false;
      return true;
    });
  }, [entries, filters]);

  const hasActiveFilters = useMemo(() => {
    const { types, province, city, lasso } = filters;
    const allTypesOn = types.size === ALL_TYPES.length && ALL_TYPES.every((t) => types.has(t));
    return !allTypesOn || province != null || city != null || lasso != null;
  }, [filters]);

  return {
    filters,
    filteredEntries,
    toggleType,
    setProvince,
    setCity,
    setLasso,
    clear,
    hasActiveFilters,
  };
}
```

- [ ] **Step 2: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd SocialJusticeHub
git add client/src/components/radiografia-map/useRadiografiaFilters.ts
git commit -m "feat(radiografia): filter state hook

Unifies type chips, province, city, and lasso filters into one
AND-composed pipeline. Type filter defaults to all-on; clear() resets
everything. Lasso uses turf booleanPointInPolygon with defensive ring
closure.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Tooltip renderer

**Files:**
- Create: `client/src/components/radiografia-map/MapTooltip.ts`

- [ ] **Step 1: Write the tooltip builder**

DeckGL's `getTooltip` returns either `null` or `{ html, style }`. Plain HTML string, no React.

```typescript
// client/src/components/radiografia-map/MapTooltip.ts
import { TYPE_COLORS, TYPE_LABELS } from '@/hooks/useConvergenceAnalysis';
import type { MapEntry } from './types';

const CARD_STYLE: Record<string, string> = {
  backgroundColor: 'rgba(10, 10, 20, 0.95)',
  color: '#e2e8f0',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '12px',
  fontFamily: 'Inter, system-ui, sans-serif',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  maxWidth: '280px',
  pointerEvents: 'none',
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

/** HexagonLayer passes `object.points: Array<{ source: MapEntry }>` for picked hexagons. */
export function hexagonTooltipHtml(points: Array<{ source?: MapEntry } | MapEntry>): string {
  const entries: MapEntry[] = points.map((p: any) => (p.source ?? p) as MapEntry);
  const total = entries.length;
  const byType: Record<string, number> = {};
  const locSet = new Set<string>();
  for (const e of entries) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    if (e.location) locSet.add(e.location);
  }

  const sortedTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const typeLines = sortedTypes
    .map(
      ([t, n]) =>
        `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:8px">
          <span style="width:8px;height:8px;border-radius:50%;background:${TYPE_COLORS[t as keyof typeof TYPE_COLORS] ?? '#888'}"></span>
          <span>${n} ${esc(TYPE_LABELS[t as keyof typeof TYPE_LABELS] ?? t)}</span>
        </span>`,
    )
    .join('');

  const locList = Array.from(locSet).slice(0, 3).map(esc).join(' · ');
  const extra = locSet.size > 3 ? ` <span style="color:#64748b">+${locSet.size - 3} más</span>` : '';

  return `
    <div>
      <div style="font-weight:700;font-size:13px;margin-bottom:6px">${total} señales en esta zona</div>
      <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;line-height:1.6">${typeLines}</div>
      ${locList ? `<div style="margin-top:6px;color:#94a3b8">Localidades: ${locList}${extra}</div>` : ''}
    </div>
  `;
}

export function pointTooltipHtml(entry: MapEntry): string {
  const color = TYPE_COLORS[entry.type] ?? '#888';
  const label = TYPE_LABELS[entry.type] ?? entry.type;
  const loc = [entry.city, entry.province].filter(Boolean).join(', ') || entry.location || '';
  return `
    <div>
      <div style="display:flex;align-items:center;gap:6px;font-weight:700;font-size:13px;color:${color}">
        <span style="width:9px;height:9px;border-radius:50%;background:${color}"></span>
        ${esc(label)}
      </div>
      <div style="margin-top:6px;color:#e2e8f0;line-height:1.45">“${esc(truncate(entry.text || '', 120))}”</div>
      ${loc ? `<div style="margin-top:6px;color:#94a3b8;font-size:11px">${esc(loc)}</div>` : ''}
    </div>
  `;
}

export const TOOLTIP_STYLE = CARD_STYLE;
```

- [ ] **Step 2: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd SocialJusticeHub
git add client/src/components/radiografia-map/MapTooltip.ts
git commit -m "feat(radiografia): map tooltip HTML builders

hexagonTooltipHtml aggregates counts by type + locations; pointTooltipHtml
renders a single entry with type color + truncated text. Both return
inline-styled HTML strings ready for DeckGL's getTooltip.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Lasso overlay component

**Files:**
- Create: `client/src/components/radiografia-map/LassoOverlay.tsx`

- [ ] **Step 1: Write the component**

The overlay is rendered inside the map container div, absolutely positioned. The parent passes a `getViewport()` function so we can `unproject` screen→world. Pointer events (`onPointerDown/Move/Up`) cover mouse, touch, and pen uniformly.

```tsx
// client/src/components/radiografia-map/LassoOverlay.tsx
import { useCallback, useRef, useState } from 'react';
import type { LassoPolygon } from './types';

interface Point {
  x: number;
  y: number;
}

interface Viewport {
  unproject(pixel: [number, number]): [number, number, number] | [number, number];
}

interface LassoOverlayProps {
  getViewport: () => Viewport | null;
  onComplete: (polygon: LassoPolygon | null) => void;
  onCancel: () => void;
}

const STROKE = '#7D5BDE';
const FILL = 'rgba(125, 91, 222, 0.18)';

export default function LassoOverlay({ getViewport, onComplete, onCancel }: LassoOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [path, setPath] = useState<Point[]>([]);

  const handleDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const rect = svgRef.current!.getBoundingClientRect();
    setPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setDrawing(true);
  }, []);

  const handleMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!drawing) return;
      const rect = svgRef.current!.getBoundingClientRect();
      const next: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setPath((p) => {
        // Throttle: only add if moved at least 3 px
        const last = p[p.length - 1];
        if (last && Math.hypot(next.x - last.x, next.y - last.y) < 3) return p;
        return [...p, next];
      });
    },
    [drawing],
  );

  const handleUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!drawing) return;
      setDrawing(false);
      (e.target as Element).releasePointerCapture?.(e.pointerId);

      if (path.length < 3) {
        setPath([]);
        onComplete(null);
        return;
      }

      const viewport = getViewport();
      if (!viewport) {
        setPath([]);
        onComplete(null);
        return;
      }

      const coords: [number, number][] = [];
      for (const p of path) {
        try {
          const world = viewport.unproject([p.x, p.y]);
          const lng = world[0];
          const lat = world[1];
          if (Number.isFinite(lng) && Number.isFinite(lat)) coords.push([lng, lat]);
        } catch {
          // skip invalid vertex
        }
      }
      if (coords.length < 3) {
        setPath([]);
        onComplete(null);
        return;
      }

      setPath([]);
      onComplete({ coordinates: coords });
    },
    [drawing, path, getViewport, onComplete],
  );

  const d = path.length > 0 ? 'M ' + path.map((p) => `${p.x} ${p.y}`).join(' L ') : '';

  return (
    <>
      <svg
        ref={svgRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={(e) => {
          setDrawing(false);
          setPath([]);
          onCancel();
          (e.target as Element).releasePointerCapture?.(e.pointerId);
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          touchAction: 'none',
          zIndex: 20,
        }}
      >
        {d && <path d={d + (drawing ? '' : ' Z')} fill={drawing ? 'none' : FILL} stroke={STROKE} strokeWidth={2} />}
      </svg>

      {/* Mobile-friendly instruction / cancel bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 21,
          background: 'rgba(10,10,20,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 999,
          padding: '8px 14px',
          color: '#e2e8f0',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'auto',
        }}
      >
        <span>Dibujá el área con el dedo</span>
        <button
          onClick={() => {
            setPath([]);
            onCancel();
          }}
          style={{
            color: '#94a3b8',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 999,
            padding: '2px 10px',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd SocialJusticeHub
git add client/src/components/radiografia-map/LassoOverlay.tsx
git commit -m "feat(radiografia): lasso overlay component

Absolute-positioned SVG that captures pointer events, throttles to
3-px moves, closes the polygon on release, and unprojects screen
coords to lat/lng via a viewport getter. touch-action: none keeps
the browser from stealing the gesture. Floating instruction/cancel
bar for mobile.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Selection panel

**Files:**
- Create: `client/src/components/radiografia-map/SelectionPanel.tsx`

List virtualization is skipped — the filtered pool is typically a few hundred entries at most. If a future scale issue emerges, swap the list body for `react-window` in a follow-up.

- [ ] **Step 1: Write the component**

```tsx
// client/src/components/radiografia-map/SelectionPanel.tsx
import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { TYPE_COLORS, TYPE_LABELS } from '@/hooks/useConvergenceAnalysis';
import type { DreamType, MapEntry } from './types';
import { ALL_TYPES } from './types';

interface SelectionPanelProps {
  entries: MapEntry[];
  visible: boolean;
  onClose: () => void;
  onRowClick?: (entry: MapEntry) => void;
}

const MAX_LIST = 300;
const MAX_LOCATIONS = 5;
const MAX_THEMES = 3;

// Lightweight theme extraction from text — matches the general style in useConvergenceAnalysis.
const THEME_KEYWORDS: Array<{ label: string; rx: RegExp }> = [
  { label: 'educación', rx: /educa(ción|r|tiv)/i },
  { label: 'salud', rx: /salud|m[eé]dic|hospital/i },
  { label: 'trabajo', rx: /trabaj|empleo|laboral/i },
  { label: 'vivienda', rx: /viviend|hogar|casa propia/i },
  { label: 'seguridad', rx: /seguridad|polic[ií]a|inseguridad/i },
  { label: 'justicia', rx: /justicia|derechos|corrupci[oó]n/i },
  { label: 'economía', rx: /econom[ií]a|inflaci[oó]n|pobreza/i },
  { label: 'medio ambiente', rx: /ambient|ecolog|contamina/i },
];

function extractTopThemes(entries: MapEntry[]): string[] {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    for (const { label, rx } of THEME_KEYWORDS) {
      if (rx.test(e.text)) counts[label] = (counts[label] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_THEMES)
    .map(([label]) => label);
}

export default function SelectionPanel({ entries, visible, onClose, onRowClick }: SelectionPanelProps) {
  const { byType, locationList, topThemes } = useMemo(() => {
    const bt: Record<DreamType, number> = {
      dream: 0, value: 0, need: 0, basta: 0, compromiso: 0, recurso: 0,
    };
    const locs = new Map<string, number>();
    for (const e of entries) {
      bt[e.type]++;
      const loc = e.city || e.location;
      if (loc) locs.set(loc, (locs.get(loc) || 0) + 1);
    }
    const sortedLocs = Array.from(locs.entries()).sort((a, b) => b[1] - a[1]);
    return {
      byType: bt,
      locationList: sortedLocs.slice(0, MAX_LOCATIONS).map(([name]) => name),
      locationOverflow: sortedLocs.length - MAX_LOCATIONS,
      topThemes: extractTopThemes(entries),
    };
  }, [entries]);

  const maxBarCount = Math.max(1, ...ALL_TYPES.map((t) => byType[t]));
  const locationOverflow = Math.max(0, new Set(entries.map((e) => e.city || e.location).filter(Boolean)).size - MAX_LOCATIONS);
  const shown = entries.slice(0, MAX_LIST);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          role="dialog"
          aria-label="Zona seleccionada"
          className="fixed right-0 top-0 h-full w-full md:w-[420px] z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-l border-white/10 flex flex-col"
        >
          <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0a0a0a]/95">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">Zona seleccionada</div>
              <div className="text-xl font-bold text-white">{entries.length} señales</div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar panel"
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            {entries.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">
                No encontramos señales en esta zona. Probá con un área más grande o sin otros filtros.
              </div>
            ) : (
              <>
                <section className="px-5 py-4 space-y-2">
                  {ALL_TYPES.map((t) => {
                    const n = byType[t];
                    if (n === 0) return null;
                    const pct = (n / maxBarCount) * 100;
                    return (
                      <div key={t} className="flex items-center gap-3 text-sm">
                        <span className="w-28 shrink-0 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[t] }} />
                          <span className="text-slate-300">{TYPE_LABELS[t]}</span>
                        </span>
                        <span className="w-10 text-right tabular-nums text-slate-200">{n}</span>
                        <span className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: TYPE_COLORS[t] }} />
                        </span>
                      </div>
                    );
                  })}
                </section>

                <section className="px-5 pb-3 text-xs text-slate-400">
                  {locationList.length > 0 && (
                    <div className="mb-1">
                      <span className="text-slate-500">Localidades:</span>{' '}
                      {locationList.join(', ')}{locationOverflow > 0 ? `, +${locationOverflow}` : ''}
                    </div>
                  )}
                  {topThemes.length > 0 && (
                    <div>
                      <span className="text-slate-500">Temas top:</span> {topThemes.join(', ')}
                    </div>
                  )}
                </section>

                <div className="border-t border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono sticky top-0 bg-[#0a0a0a]/95">
                  Voces ({entries.length})
                </div>

                <ul className="px-3 pb-6">
                  {shown.map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => onRowClick?.(e)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[e.type] }} />
                          <span className="text-[11px] uppercase tracking-wider text-slate-400">{TYPE_LABELS[e.type]}</span>
                        </div>
                        <div className="text-sm text-slate-200 leading-snug line-clamp-2">
                          {e.text || <span className="italic text-slate-500">(sin texto)</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {[e.city, e.province].filter(Boolean).join(', ') || e.location}
                        </div>
                      </button>
                    </li>
                  ))}
                  {entries.length > MAX_LIST && (
                    <li className="px-3 py-3 text-xs text-slate-500 italic">
                      Mostrando las primeras {MAX_LIST} de {entries.length}. Ajustá los filtros para refinar.
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd SocialJusticeHub
git add client/src/components/radiografia-map/SelectionPanel.tsx
git commit -m "feat(radiografia): selection panel

Right-anchored drawer (bottom sheet on mobile via full-width + z-40)
showing summary bars per type, top localities, top themes, and a
clickable list capped at 300 entries. Framer Motion slide-in; empty
state when the selection has zero entries.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Map filters bar

**Files:**
- Create: `client/src/components/radiografia-map/MapFiltersBar.tsx`

- [ ] **Step 1: Write the component**

```tsx
// client/src/components/radiografia-map/MapFiltersBar.tsx
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lasso, X } from 'lucide-react';
import { TYPE_COLORS, TYPE_LABELS } from '@/hooks/useConvergenceAnalysis';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import type { DreamType, MapFilters } from './types';
import { ALL_TYPES } from './types';

interface Province { id: number; name: string; latitude?: number; longitude?: number }
interface City { id: number; name: string; latitude?: number; longitude?: number }

interface MapFiltersBarProps {
  filters: MapFilters;
  lassoActive: boolean; // drawing mode
  lassoEntriesCount: number; // count of entries inside current lasso, for chip label
  onToggleType: (t: DreamType) => void;
  onSetProvince: (name: string | null, lat?: number, lng?: number) => void;
  onSetCity: (name: string | null, lat?: number, lng?: number) => void;
  onStartLasso: () => void;
  onClearLasso: () => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export default function MapFiltersBar({
  filters,
  lassoActive,
  lassoEntriesCount,
  onToggleType,
  onSetProvince,
  onSetCity,
  onStartLasso,
  onClearLasso,
  onClearAll,
  hasActiveFilters,
}: MapFiltersBarProps) {
  const { data: provinces = [] } = useQuery<Province[]>({
    queryKey: ['/api/geographic/provinces'],
    staleTime: 300000,
  });

  const selectedProvinceObj = useMemo(
    () => provinces.find((p) => p.name === filters.province) ?? null,
    [provinces, filters.province],
  );

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['/api/geographic/provinces', selectedProvinceObj?.id, 'cities'],
    queryFn: async () => {
      if (!selectedProvinceObj) return [];
      const r = await apiRequest('GET', `/api/geographic/provinces/${selectedProvinceObj.id}/cities`);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: selectedProvinceObj != null,
    staleTime: 300000,
  });

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-6 space-y-4">
      {/* Type chips */}
      <div className="flex flex-wrap gap-2">
        {ALL_TYPES.map((t) => {
          const active = filters.types.has(t);
          const color = TYPE_COLORS[t];
          return (
            <button
              key={t}
              role="switch"
              aria-checked={active}
              onClick={() => onToggleType(t)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                active
                  ? 'text-white'
                  : 'text-slate-400 border-white/10 bg-white/[0.02] hover:bg-white/5',
              )}
              style={
                active
                  ? { backgroundColor: `${color}33`, borderColor: `${color}99`, color: '#fff' }
                  : undefined
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                {TYPE_LABELS[t]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dropdowns + Lasso + Clear */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          aria-label="Provincia"
          value={filters.province ?? ''}
          onChange={(e) => {
            const name = e.target.value || null;
            const p = name ? provinces.find((x) => x.name === name) : null;
            onSetProvince(name, p?.latitude, p?.longitude);
          }}
          className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-slate-200"
        >
          <option value="">Todas las provincias</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>

        <select
          aria-label="Ciudad"
          value={filters.city ?? ''}
          disabled={filters.province == null}
          onChange={(e) => {
            const name = e.target.value || null;
            const c = name ? cities.find((x) => x.name === name) : null;
            onSetCity(name, c?.latitude, c?.longitude);
          }}
          className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-slate-200 disabled:opacity-40"
        >
          <option value="">Todas las ciudades</option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <button
          onClick={onStartLasso}
          aria-pressed={lassoActive}
          className={cn(
            'h-9 px-3 rounded-md border text-sm inline-flex items-center gap-2 transition-colors',
            lassoActive
              ? 'bg-purple-600/30 border-purple-400/50 text-white animate-pulse'
              : filters.lasso
                ? 'bg-white/5 border-white/20 text-slate-200 hover:bg-white/10'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10',
          )}
        >
          <Lasso className="w-4 h-4" />
          {lassoActive ? 'Dibujando…' : filters.lasso ? 'Nuevo lazo' : 'Lazo'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="h-9 px-3 rounded-md border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 inline-flex items-center gap-1.5 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.province && (
            <Chip label={filters.province} onRemove={() => onSetProvince(null)} />
          )}
          {filters.city && (
            <Chip label={filters.city} onRemove={() => onSetCity(null)} />
          )}
          {filters.lasso && (
            <Chip label={`Lazo: ${lassoEntriesCount} señales`} onRemove={onClearLasso} />
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-200">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="text-slate-400 hover:text-white"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd SocialJusticeHub
git add client/src/components/radiografia-map/MapFiltersBar.tsx
git commit -m "feat(radiografia): map filters bar

Type chips (toggle via role=switch), province + city dropdowns
(cascading), Lazo button with three states (idle/active/has-lasso),
and a Limpiar button + active-filter chips row. All styled to match
the page's glassmorphism.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: ConvergenceMap orchestrator

**Files:**
- Create: `client/src/components/radiografia-map/ConvergenceMap.tsx`

- [ ] **Step 1: Write the orchestrator**

```tsx
// client/src/components/radiografia-map/ConvergenceMap.tsx
import { useCallback, useMemo, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BarChart3, Network } from 'lucide-react';
import { TYPE_COLORS } from '@/hooks/useConvergenceAnalysis';
import { useDeckGLLayers } from '@/hooks/useDeckGLLayers';
import MapFiltersBar from './MapFiltersBar';
import LassoOverlay from './LassoOverlay';
import SelectionPanel from './SelectionPanel';
import { hexagonTooltipHtml, pointTooltipHtml, TOOLTIP_STYLE } from './MapTooltip';
import { useProvinceClassifier } from './useProvinceClassifier';
import { useRadiografiaFilters } from './useRadiografiaFilters';
import type { MapEntry } from './types';

const INITIAL_VIEW_STATE = {
  latitude: -38.416,
  longitude: -63.617,
  zoom: 4,
  pitch: 45,
  bearing: 0,
  transitionDuration: 0,
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const POINT_ZOOM_THRESHOLD = 7;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export default function ConvergenceMap() {
  // WebGL2 gate
  const [hasWebGL2] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch { return false; }
  });

  const { allEntries, isLoading } = useDeckGLLayers();
  const { classify } = useProvinceClassifier();

  const enrichedEntries = useMemo(() => classify(allEntries), [classify, allEntries]);
  const api = useRadiografiaFilters(enrichedEntries);
  const {
    filters,
    filteredEntries,
    toggleType,
    setProvince,
    setCity,
    setLasso,
    clear,
    hasActiveFilters,
  } = api;

  const [activeLayer, setActiveLayer] = useState<'hexagon' | 'arc'>('hexagon');
  const [viewState, setViewState] = useState<any>(INITIAL_VIEW_STATE);
  const [lassoMode, setLassoMode] = useState(false);

  const deckRef = useRef<any>(null);

  // Fly-to province / city
  const flyTo = useCallback((lat?: number, lng?: number, zoom = 7) => {
    if (lat == null || lng == null) return;
    setViewState((vs: any) => ({
      ...vs,
      latitude: lat,
      longitude: lng,
      zoom,
      transitionDuration: 1200,
      transitionInterpolator: new FlyToInterpolator(),
    }));
  }, []);

  const handleSetProvince = useCallback(
    (name: string | null, lat?: number, lng?: number) => {
      setProvince(name);
      if (name && lat != null && lng != null) flyTo(lat, lng, 6);
    },
    [setProvince, flyTo],
  );

  const handleSetCity = useCallback(
    (name: string | null, lat?: number, lng?: number) => {
      setCity(name);
      if (name && lat != null && lng != null) flyTo(lat, lng, 9);
    },
    [setCity, flyTo],
  );

  // Lasso lifecycle
  const startLasso = useCallback(() => setLassoMode(true), []);
  const cancelLasso = useCallback(() => setLassoMode(false), []);
  const completeLasso = useCallback(
    (poly: any) => {
      setLassoMode(false);
      if (poly) setLasso(poly);
    },
    [setLasso],
  );

  // Derived: count inside current lasso (for chip label)
  const lassoCount = filters.lasso ? filteredEntries.length : 0;

  // Filtered hex data
  const filteredHex = useMemo(
    () => filteredEntries.map((e) => ({ position: [e.lng, e.lat] as [number, number], weight: 1, source: e })),
    [filteredEntries],
  );

  // Build layers
  const layers = useMemo(() => {
    const built: any[] = [];

    if (activeLayer === 'hexagon') {
      built.push(
        new HexagonLayer({
          id: 'hexagon-layer',
          data: filteredHex,
          getPosition: (d: any) => d.position,
          getElevationWeight: (d: any) => d.weight,
          elevationScale: 200,
          extruded: true,
          radius: 15000,
          coverage: 0.85,
          upperPercentile: 100,
          pickable: true,
          colorRange: [
            [30, 30, 80],
            [60, 40, 140],
            [100, 60, 180],
            [140, 80, 200],
            [180, 100, 220],
            [220, 130, 240],
          ],
          material: {
            ambient: 0.6,
            diffuse: 0.6,
            shininess: 40,
            specularColor: [125, 91, 222],
          },
          updateTriggers: {
            data: filteredEntries,
          },
        }),
      );
      // Individual dots at high zoom
      if ((viewState.zoom ?? 4) >= POINT_ZOOM_THRESHOLD) {
        built.push(
          new ScatterplotLayer({
            id: 'points-layer',
            data: filteredEntries,
            getPosition: (e: MapEntry) => [e.lng, e.lat],
            getFillColor: (e: MapEntry) => [...hexToRgb(TYPE_COLORS[e.type]), 220] as [number, number, number, number],
            getRadius: 400,
            radiusMinPixels: 3,
            radiusMaxPixels: 8,
            stroked: true,
            getLineColor: [0, 0, 0, 200],
            lineWidthMinPixels: 1,
            pickable: true,
            updateTriggers: {
              data: filteredEntries,
              getFillColor: filters.types,
            },
          }),
        );
      }
    } else {
      // Arc layer — rebuild from filtered entries (location-bucketed)
      const buckets: Record<string, { lng: number; lat: number; count: number; topType: string; topCount: number; location: string }> = {};
      for (const e of filteredEntries) {
        const key = e.location || `${e.lat.toFixed(2)},${e.lng.toFixed(2)}`;
        if (!buckets[key]) buckets[key] = { lng: e.lng, lat: e.lat, count: 0, topType: e.type, topCount: 0, location: key };
        buckets[key].count++;
      }
      const locs = Object.values(buckets).filter((b) => b.count >= 3).slice(0, 12);
      const arcs: any[] = [];
      for (let i = 0; i < locs.length; i++) {
        for (let j = i + 1; j < locs.length; j++) {
          arcs.push({
            source: [locs[i].lng, locs[i].lat],
            target: [locs[j].lng, locs[j].lat],
            sourceLabel: locs[i].location,
            targetLabel: locs[j].location,
          });
        }
      }
      built.push(
        new ArcLayer({
          id: 'arc-layer',
          data: arcs,
          getSourcePosition: (d: any) => d.source,
          getTargetPosition: (d: any) => d.target,
          getSourceColor: [125, 91, 222, 180],
          getTargetColor: [59, 130, 246, 180],
          getWidth: 2,
          greatCircle: true,
        }),
      );
    }

    return built;
  }, [activeLayer, filteredHex, filteredEntries, viewState.zoom, filters.types]);

  const getTooltip = useCallback((info: any) => {
    if (!info?.object) return null;
    if (info.layer?.id === 'hexagon-layer') {
      const points = info.object.points || [];
      return { html: hexagonTooltipHtml(points), style: TOOLTIP_STYLE };
    }
    if (info.layer?.id === 'points-layer') {
      return { html: pointTooltipHtml(info.object as MapEntry), style: TOOLTIP_STYLE };
    }
    return null;
  }, []);

  const flyToEntry = useCallback((e: MapEntry) => flyTo(e.lat, e.lng, 11), [flyTo]);

  if (!hasWebGL2) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">
            Tu navegador no soporta WebGL2. Visitá{' '}
            <a href="/el-mapa" className="text-blue-400 underline">El Mapa</a>{' '}
            para ver las señales en el mapa interactivo.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">Visualización GPU</span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-6">El Territorio en 3D</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cada hexágono representa la densidad de voces en una zona. Zoom in y aparecen los puntos individuales.
            Filtrá por tipo, provincia, ciudad — o dibujá un lazo para explorar una zona específica.
          </p>
        </div>

        <MapFiltersBar
          filters={filters}
          lassoActive={lassoMode}
          lassoEntriesCount={lassoCount}
          onToggleType={toggleType}
          onSetProvince={handleSetProvince}
          onSetCity={handleSetCity}
          onStartLasso={startLasso}
          onClearLasso={() => setLasso(null)}
          onClearAll={clear}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Layer toggle */}
        <div className="flex justify-center gap-3 mb-6">
          {[
            { id: 'hexagon' as const, label: 'Hexágonos 3D', icon: BarChart3 },
            { id: 'arc' as const, label: 'Arcos Territoriales', icon: Network },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              aria-pressed={activeLayer === layer.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeLayer === layer.id
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.08]'
              }`}
            >
              <layer.icon className="w-4 h-4" />
              {layer.label}
            </button>
          ))}
        </div>

        {/* Map container */}
        <div
          className="rounded-2xl overflow-hidden border border-white/10 relative"
          style={{ height: 'clamp(400px, 60vh, 700px)' }}
          role="application"
          aria-label="Mapa de convergencia territorial en 3D"
        >
          <DeckGL
            ref={deckRef}
            viewState={viewState}
            onViewStateChange={(e: any) => setViewState(e.viewState)}
            controller={!lassoMode}
            layers={layers}
            getTooltip={lassoMode ? undefined : getTooltip}
          >
            <Map mapStyle={MAP_STYLE} />
          </DeckGL>

          {/* Persistent lasso polygon overlay when a lasso is committed */}
          {filters.lasso && !lassoMode && (
            <CommittedLassoOverlay
              polygon={filters.lasso}
              getViewport={() => deckRef.current?.deck?.getViewports?.()?.[0] ?? null}
            />
          )}

          {lassoMode && (
            <LassoOverlay
              getViewport={() => deckRef.current?.deck?.getViewports?.()?.[0] ?? null}
              onComplete={completeLasso}
              onCancel={cancelLasso}
            />
          )}
        </div>

        {isLoading && (
          <div className="text-center text-slate-500 text-xs mt-3">Cargando señales…</div>
        )}
      </div>

      <SelectionPanel
        entries={filteredEntries}
        visible={filters.lasso != null}
        onClose={() => setLasso(null)}
        onRowClick={flyToEntry}
      />
    </section>
  );
}

/** Renders the committed lasso polygon as an SVG overlay that rerenders on viewState changes. */
function CommittedLassoOverlay({ polygon, getViewport }: { polygon: any; getViewport: () => any }) {
  const vp = getViewport();
  if (!vp) return null;
  const projected: string[] = [];
  for (const [lng, lat] of polygon.coordinates as [number, number][]) {
    try {
      const px = vp.project([lng, lat]);
      projected.push(`${px[0]},${px[1]}`);
    } catch {
      // skip
    }
  }
  if (projected.length < 3) return null;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
      <polygon
        points={projected.join(' ')}
        fill="rgba(125, 91, 222, 0.12)"
        stroke="#7D5BDE"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
    </svg>
  );
}
```

Note: the committed-lasso overlay does not reproject on viewport animation ticks — it reprojects only when React re-renders. For this round that's acceptable (the polygon will snap on pan/zoom end). If the lag is visually disruptive in manual smoke, subscribe to `onViewStateChange` via a `useState` that already exists and re-render.

- [ ] **Step 2: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new errors. (`deckRef.current?.deck?.getViewports` may require `@ts-ignore` or a targeted cast if DeckGL's types are strict — if so, cast `deckRef` to `any`.)

- [ ] **Step 3: Build check**

```bash
cd SocialJusticeHub
npm run build
```

Expected: build succeeds. No runtime test yet — that's Task 12.

- [ ] **Step 4: Commit**

```bash
cd SocialJusticeHub
git add client/src/components/radiografia-map/ConvergenceMap.tsx
git commit -m "feat(radiografia): ConvergenceMap orchestrator

Wires filters, classifier, layers (hexagon + scatterplot at zoom >= 7
or arc), tooltips, lasso draw, committed lasso polygon, and selection
panel into one component. Fly-to on province/city selection. WebGL2
fallback preserved.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Wire into ExplorarDatos

**Files:**
- Modify: `client/src/pages/ExplorarDatos.tsx`

- [ ] **Step 1: Replace ConvergenceMapSection with the new component**

Remove the in-file `ConvergenceMapSection` definition (the large inline component that currently lives between the "deck.gl Convergence Map" divider comment and the "Sankey Diagram" divider comment) and all its imports that are no longer used (`DeckGL`, `HexagonLayer`, `ArcLayer`, `Map`, `maplibre-gl/dist/maplibre-gl.css`, `BarChart3`, `Network`, `useDeckGLLayers`, `Globe` if it's only used there). Replace the `<ConvergenceMapSection />` JSX call with `<ConvergenceMap />`.

Use targeted edits rather than a full-file rewrite.

Target state for the top of the file:

```tsx
// imports — remove these if they were only used by the removed ConvergenceMapSection:
// import DeckGL from '@deck.gl/react';
// import { HexagonLayer } from '@deck.gl/aggregation-layers';
// import { ArcLayer } from '@deck.gl/layers';
// import { Map } from 'react-map-gl/maplibre';
// import 'maplibre-gl/dist/maplibre-gl.css';
// import { useDeckGLLayers } from '@/hooks/useDeckGLLayers';
// import { Globe, BarChart3, Network } from 'lucide-react';

// add:
import ConvergenceMap from '@/components/radiografia-map/ConvergenceMap';
```

The keep list for `lucide-react` after removal: check what's still referenced in the file (`Microscope`, `TrendingUp`, `MapPin`, `Compass`, `Sparkles`, `Target`, `Database` — all referenced by Hero, Scrollytelling, closing sections). Prune `Globe`, `BarChart3`, `Network` only if grep confirms they're unused.

Replace the JSX call:

```tsx
// Before:
<ConvergenceMapSection />

// After:
<ConvergenceMap />
```

- [ ] **Step 2: Remove the old ConvergenceMapSection definition**

Delete the entire block bounded by:
- Start: the `// ─── Section: deck.gl Convergence Map ───` divider comment and the `INITIAL_VIEW_STATE` / `MAP_STYLE` constants that immediately follow it
- End: just before `// ─── Section: Sankey Diagram ───`

Everything between (INITIAL_VIEW_STATE, MAP_STYLE, `ConvergenceMapSection` component) is removed.

- [ ] **Step 3: Typecheck**

```bash
cd SocialJusticeHub
npm run check
```

Expected: no new errors. If any import is still referenced by a dead code path, TypeScript's unused-import rule will flag it — remove those.

- [ ] **Step 4: Build**

```bash
cd SocialJusticeHub
npm run verify
```

Expected: `check` + `check:routes` + `build` all pass.

- [ ] **Step 5: Commit**

```bash
cd SocialJusticeHub
git add client/src/pages/ExplorarDatos.tsx
git commit -m "feat(radiografia): mount ConvergenceMap in ExplorarDatos

Replaces the inline ConvergenceMapSection with the new map component
that adds tooltips, filters, and lasso selection.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Manual smoke checklist

**Files:** none (verification only)

- [ ] **Step 1: Start dev server**

```bash
cd SocialJusticeHub
npm run dev
```

Open `http://localhost:3001/explorar-datos`.

- [ ] **Step 2: Walk the checklist**

For each item below, click through in the browser and check off.

**Baseline**
- [ ] Page loads without console errors. 3D map renders with hexagons.
- [ ] Hexagon | Arcos Territoriales toggle still works. Arc layer renders.

**Tooltips**
- [ ] Hovering a hexagon shows a tooltip: count, type breakdown with colored dots, localidades list.
- [ ] Zoom in past ~7 on a dense area (e.g. Buenos Aires). Individual dots appear, colored by type.
- [ ] Hovering a dot shows type label, truncated text in quotes, and city + province.

**Type chips**
- [ ] All six chips visible, all start active (colored).
- [ ] Clicking "Sueños" dims the chip; hexagons/points update — sueños no longer counted.
- [ ] Clicking again re-activates.
- [ ] Toggling off all chips → empty map (no hexagons, no dots).

**Province / city dropdowns**
- [ ] Province dropdown populates. Selecting one flies the camera to its centroid.
- [ ] City dropdown becomes enabled after province selection; populates.
- [ ] Selecting a city flies in further.
- [ ] Changing the province clears the city.

**Lasso**
- [ ] Clicking "Lazo" button makes it pulse, instruction bar appears at the bottom, map pan/zoom disabled.
- [ ] Click + drag draws a purple path.
- [ ] Releasing commits the polygon (shown as dashed outline with faint fill).
- [ ] SelectionPanel slides in from the right with summary bars + list.
- [ ] Clicking a row in the list flies the camera to that entry.
- [ ] Clicking "×" on the lasso chip or on the panel header clears the lasso. Panel slides out.
- [ ] Empty-area lasso (e.g. in the ocean) shows the empty state in the panel.

**Composition**
- [ ] Select "Córdoba" → draw lasso inside Córdoba → panel shows only Córdoba entries in the lasso.
- [ ] Turn off "Sueños" chip while lasso is active → summary bars and list update.
- [ ] Hit "Limpiar" → chips reset to all-on, dropdowns clear, lasso clears, panel closes.

**Mobile**
- [ ] Open Chrome DevTools, toggle device emulation (e.g. iPhone 12). Same checklist works: chips wrap, dropdowns scroll, Lazo button enters selection mode, finger-drag draws, panel slides from right (full-width on narrow screens).

**Fallback**
- [ ] With DevTools Network panel, block `/data/argentina-provinces-simplified.geojson` (right-click request → Block request URL). Reload. Map still loads, commitments and resources still filterable by province, dreams without DB province are excluded from province filter (no crash).

- [ ] **Step 3: Stop dev server**

Ctrl-C.

- [ ] **Step 4: Final verify**

```bash
cd SocialJusticeHub
npm run verify
```

Expected: all green.

- [ ] **Step 5: Final commit if any fixes were needed**

If the smoke checklist surfaced issues, fix them in focused follow-up commits with descriptive messages. Each fix goes in its own commit, not amended.

---

## Self-review (author's notes)

**Spec coverage:**
- Hover tooltips on hexagons + individual points → Tasks 6, 10.
- Filters: type chips + province + city + lasso → Tasks 2, 5, 9.
- Lasso interaction, mobile selection mode, persistent polygon → Tasks 7, 10.
- Selection panel with summary + list → Task 8.
- Client-side province classification + nearest-city → Task 4.
- Dependency install + boundaries GeoJSON → Task 1.
- Type system → Task 2.
- `useDeckGLLayers` extension → Task 3.
- Wiring into the page → Task 11.
- Edge cases (empty panel, degenerate polygon, WebGL2 fallback, GeoJSON fetch fail, fewer-than-3-points) → covered in Tasks 5, 7, 10, 11.
- Smoke testing → Task 12.
- Spec's unit-test prescription is replaced with TypeScript + manual smoke per project convention — noted at the top.

**Placeholder scan:** no TBDs, no "add error handling", no "similar to Task N". Every code step shows the full code.

**Type consistency:** `MapEntry`, `MapFilters`, `LassoPolygon`, `RadiografiaFiltersApi` names used consistently across Tasks 2–10. `toggleType`, `setProvince`, `setCity`, `setLasso`, `clear`, `hasActiveFilters` match between Tasks 5 and 9–10. `classify` name matches between Tasks 4 and 10.
