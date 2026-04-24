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
