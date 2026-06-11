// client/src/hooks/useMapSignals.ts
// Única fuente de datos de señales para todos los mapas y análisis.
import { useQuery } from '@tanstack/react-query';
import type { MapSignal } from '@shared/map-signals';

interface MapSignalsResponse {
  signals: MapSignal[];
  total: number;
}

export const MAP_SIGNALS_QUERY_KEY = ['/api/map/signals'] as const;

export function useMapSignals() {
  const { data, isLoading, error } = useQuery<MapSignalsResponse>({
    queryKey: MAP_SIGNALS_QUERY_KEY,
    staleTime: 30000,
  });
  return { signals: data?.signals ?? [], isLoading, error };
}
