import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TipoVoz } from '~/components/papel/primitives';

import { api } from '~/lib/api';

export interface ProvinciaApi {
  id: number;
  name: string;
  isoCode: string | null;
}

/** Las 24 provincias seed — alimentan el select del panel y el match nombre→id del SVG. */
export function useProvincias() {
  return useQuery({
    queryKey: ['open-data', 'provincias'],
    queryFn: () => api.get<{ provinces: ProvinciaApi[] }>('/api/open-data/provinces'),
    select: (d) => d.provinces,
  });
}

export interface VozAbierta {
  id: number;
  body: string;
  category: string | null;
  provinceId: number | null;
  submittedAs: string | null;
  createdAt: string;
}

export const VOCES_MAPA_LIMIT = 500;

/** Voces aprobadas, más nuevas primero — un solo fetch para puntos del mapa Y feed. */
export function useVocesAbiertas() {
  return useQuery({
    queryKey: ['open-data', 'voces', VOCES_MAPA_LIMIT],
    queryFn: () => api.get<VozAbierta[]>(`/api/open-data/dreams?limit=${String(VOCES_MAPA_LIMIT)}`),
  });
}

export interface ConteoProvincia {
  provinceId: number | null;
  count: number;
}

/** Conteo autoritativo por provincia — numera los clusters más allá del cap de la lista. */
export function useVocesPorProvincia() {
  return useQuery({
    queryKey: ['open-data', 'voces-por-provincia'],
    queryFn: () => api.get<{ byProvince: ConteoProvincia[] }>('/api/open-data/dreams/by-province'),
    select: (d) => d.byProvince,
  });
}

export interface SoltarVozInput {
  body: string;
  category: TipoVoz;
  provinceId?: number;
}

/**
 * La conversión primaria del sitio. Endpoint anónimo (CSRF allow-listed,
 * rate limit del server como techo). Al 201 invalida open-data (puntos,
 * clusters, feed) y analytics (cifra de portada + contador FOMO del header):
 * toda la página confirma que la voz quedó.
 */
export function useSoltarVoz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SoltarVozInput) => api.post<{ id: number }>('/api/open-data/dreams', input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['open-data'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);
    },
  });
}
