import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '~/lib/api';

/**
 * Conteo público de semillas plantadas — alimenta el tile de la portada
 * (vuelta sancionada por la card 2.0; única superficie del agregado).
 */
export function useSemillasCount() {
  return useQuery({
    queryKey: ['semillas', 'count'],
    queryFn: () => api.get<{ total: number }>('/api/semillas/count'),
  });
}

export interface PlantarSemillaInput {
  basta: string;
  sueno: string;
  compromiso: string;
}

/**
 * La conversión secundaria del sitio. Endpoint anónimo (CSRF allow-listed,
 * rate limit del server como techo). Al 201 invalida ['semillas'] para que
 * el tile de la portada cuente la nueva.
 */
export function usePlantarSemilla() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlantarSemillaInput) =>
      api.post<{ id: number; createdAt: string }>('/api/semillas', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['semillas'] });
    },
  });
}
