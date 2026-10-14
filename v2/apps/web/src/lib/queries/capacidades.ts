import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { escribir } from './participacion';

import type { LecturaCapacidad, ListaCapacidades } from '@v2/shared';

import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';

export function useCapacidades(filtro: string) {
  const auth = useAuth();
  return useInfiniteQuery({
    queryKey: ['capacidades', 'lista', filtro, auth.user?.id ?? null],
    enabled: !auth.isLoading,
    initialPageParam: '',
    queryFn: ({ pageParam, signal }) =>
      api.get<ListaCapacidades>(
        `/api/v1/capacidades?${filtro}&despues=${pageParam}`.replace(/&despues=$/, ''),
        { signal },
      ),
    getNextPageParam: (p) => p.siguiente ?? undefined,
  });
}
export function useCapacidad(id: string) {
  const auth = useAuth();
  return useInfiniteQuery({
    queryKey: ['capacidades', id, auth.user?.id ?? null],
    enabled: !auth.isLoading,
    initialPageParam: '',
    queryFn: ({ pageParam, signal }) =>
      api.get<LecturaCapacidad>(
        `/api/v1/capacidades/${id}${pageParam ? `?despues=${pageParam}` : ''}`,
        { signal },
      ),
    getNextPageParam: (p) => p.siguiente ?? undefined,
  });
}
export function useOperacionCapacidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruta, cuerpo }: { ruta: string; cuerpo: unknown }) =>
      escribir<{ id?: string }>('post', `/api/v1/capacidades${ruta}`, cuerpo),
    onError: () => {
      void qc.invalidateQueries({ queryKey: ['capacidades'] });
      void qc.invalidateQueries({ queryKey: ['recursos-tarea'] });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['capacidades'] });
      void qc.invalidateQueries({ queryKey: ['recursos-tarea'] });
    },
  });
}
