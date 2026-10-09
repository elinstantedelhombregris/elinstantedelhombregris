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
    queryFn: () => api.get<VocesCount>('/api/v1/civic/senales/conteo'),
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
  id: number | string;
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
    queryFn: async () => {
      const r = await api.get<{
        senales: { idPublico: string; texto: string | null; tipo: string }[];
      }>(`/api/v1/civic/senales?limite=${String(limit ?? 12)}`);
      return r.senales
        .filter((v) => v.texto?.trim())
        .map((v) => ({ id: v.idPublico, texto: v.texto ?? '', categoria: v.tipo }));
    },
  });
}
