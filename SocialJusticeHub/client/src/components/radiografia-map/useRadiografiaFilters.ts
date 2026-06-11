import { useCallback, useMemo, useState } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { Feature, Polygon } from 'geojson';
import type { DreamType, MapEntry, MapFilters, LassoPolygon, TimeRange } from './types';
import { ALL_TYPES, initialFilters } from './types';
import { normalizePlaceName, parseSignalDate } from './utils';

export interface RadiografiaFiltersApi {
  filters: MapFilters;
  filteredEntries: MapEntry[];
  toggleType: (t: DreamType) => void;
  setProvince: (p: string | null) => void;
  setCity: (c: string | null) => void;
  setLasso: (lasso: LassoPolygon | null) => void;
  setTimeRange: (t: TimeRange) => void;
  clear: () => void;
  hasActiveFilters: boolean;
}

/**
 * Build the turf-ready Polygon Feature once per lasso. The filter loop below
 * reuses it for every entry instead of rebuilding per call.
 */
function buildPolygonFeature(lasso: LassoPolygon): Feature<Polygon> | null {
  if (lasso.coordinates.length < 3) return null;
  const ring = [...lasso.coordinates];
  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];
  if (firstLng !== lastLng || firstLat !== lastLat) ring.push([firstLng, firstLat]);
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  };
}

const TIME_RANGE_DAYS: Record<Exclude<TimeRange, 'all'>, number> = { '7d': 7, '30d': 30 };

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

  const setTimeRange = useCallback((t: TimeRange) => {
    setFilters((prev) => ({ ...prev, timeRange: t }));
  }, []);

  const clear = useCallback(() => setFilters(initialFilters()), []);

  const filteredEntries = useMemo(() => {
    const { types, province, city, lasso, timeRange } = filters;
    const polygon = lasso ? buildPolygonFeature(lasso) : null;
    // Normalize the selected province/city once per filter change — compare on
    // normalized keys so accents and casing never drop entries silently.
    const provinceKey = normalizePlaceName(province);
    const cityKey = normalizePlaceName(city);
    const cutoff =
      timeRange === 'all' ? null : Date.now() - TIME_RANGE_DAYS[timeRange] * 86_400_000;

    return entries.filter((e) => {
      if (!types.has(e.type)) return false;
      if (cutoff != null) {
        const t = parseSignalDate(e.createdAt);
        if (t == null || t < cutoff) return false;
      }
      if (provinceKey && e.provinceKey !== provinceKey) return false;
      if (cityKey && e.cityKey !== cityKey) return false;
      if (polygon) {
        // Una señal sin coordenadas nunca puede caer dentro de un lazo.
        if (e.lat == null || e.lng == null) return false;
        try {
          if (!booleanPointInPolygon([e.lng, e.lat], polygon)) return false;
        } catch {
          return false;
        }
      }
      return true;
    });
  }, [entries, filters]);

  const hasActiveFilters = useMemo(() => {
    const { types, province, city, lasso, timeRange } = filters;
    const allTypesOn = types.size === ALL_TYPES.length && ALL_TYPES.every((t) => types.has(t));
    return !allTypesOn || province != null || city != null || lasso != null || timeRange !== 'all';
  }, [filters]);

  return {
    filters,
    filteredEntries,
    toggleType,
    setProvince,
    setCity,
    setLasso,
    setTimeRange,
    clear,
    hasActiveFilters,
  };
}
