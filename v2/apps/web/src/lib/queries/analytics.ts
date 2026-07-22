import { useQuery } from '@tanstack/react-query';

import { api } from '~/lib/api';

interface VocesCount {
  total: number;
}

/**
 * Live "voces" total — dreams/señales citizens dropped on the map.
 * Backs the header FOMO counter and the home CifrasStrip (same query
 * key, so both consumers share one fetch).
 */
export function useVocesCount() {
  return useQuery({
    queryKey: ['analytics', 'voces-count'],
    queryFn: () => api.get<VocesCount>('/api/analytics/voces-count'),
  });
}

interface Cifras {
  voces: number;
  propuestas: number;
  senales: number;
  posts: number;
}

/**
 * Real counts behind the landing "cifras" strip: propuestas + señales
 * (the strip's other two live tiles — voces comes from useVocesCount
 * above, and posts isn't shown yet, pending the Sembrar/Fase 5 UI).
 */
export function useCifras() {
  return useQuery({
    queryKey: ['analytics', 'cifras'],
    queryFn: () => api.get<Cifras>('/api/analytics/cifras'),
  });
}

export interface VozReciente {
  id: number;
  texto: string;
  categoria: string | null;
}

/**
 * Latest approved dreams for the landing VocesTicker. `limit` defaults
 * to the API's own default (12) when omitted.
 */
export function useVocesRecientes(limit?: number) {
  return useQuery({
    queryKey: ['analytics', 'voces-recientes', limit ?? 'default'],
    queryFn: () =>
      api.get<VozReciente[]>(
        limit === undefined
          ? '/api/analytics/voces-recientes'
          : `/api/analytics/voces-recientes?limit=${String(limit)}`,
      ),
  });
}
