import { useQuery } from '@tanstack/react-query';

import { api } from '~/lib/api';

interface VocesCount {
  total: number;
}

/**
 * Live "voces" total — dreams/señales citizens dropped on the map.
 * Backs the header counter and the Cap. III of La idea (same query
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
      const r = await api.get<{ senales: SenalDeLaLista[] }>(
        `/api/v1/civic/senales?limite=${String(limit ?? 12)}`,
      );
      return vocesDeLaLista(r.senales);
    },
  });
}

interface SenalDeLaLista {
  idPublico: string;
  texto: string | null;
  tipo: string;
  estado?: string;
}

/**
 * Lo que la cinta puede mostrar de la lista pública de aportes. Un aporte
 * retirado sigue en la lista —la fila queda para la auditoría— pero no es un
 * aporte publicado: si su texto estaba reservado llega con ese aviso, y la
 * cinta decía «los últimos aportes tienen el texto reservado» sin que hubiera
 * ninguno vigente (D-167).
 */
export function vocesDeLaLista(
  senales: readonly SenalDeLaLista[],
): { id: string; texto: string; categoria: string }[] {
  return senales
    .filter((v) => v.estado !== 'retirada' && v.texto?.trim())
    .map((v) => ({ id: v.idPublico, texto: v.texto ?? '', categoria: v.tipo }));
}
