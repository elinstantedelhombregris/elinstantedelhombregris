import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { escribir } from './participacion';

import type { PaginaGestion } from '@v2/shared';

import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';

export function useGestionLista<T>(
  ruta: string,
  enabled = true,
  staleTime = Number.POSITIVE_INFINITY,
) {
  const auth = useAuth();
  return useInfiniteQuery({
    queryKey: ['gestion-iniciativas', ruta, auth.user?.id ?? null],
    enabled: enabled && !auth.isLoading,
    staleTime,
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam, signal }) =>
      api.get<PaginaGestion<T>>(
        `/api/iniciativas${ruta}${pageParam ? `${ruta.includes('?') ? '&' : '?'}cursor=${pageParam}` : ''}`,
        { signal },
      ),
    getNextPageParam: (p) => p.siguiente ?? undefined,
  });
}
export function useGestionOperacion() {
  const qc = useQueryClient();
  const refrescar = () => {
    for (const key of [
      'gestion-iniciativas',
      'iniciativa',
      'diseno',
      'acciones-iniciativa',
      'recursos-tarea',
      'capacidades',
      'resultados-campo',
    ])
      void qc.invalidateQueries({ queryKey: [key] });
  };
  return useMutation({
    mutationFn: (v: { ruta: string; metodo?: 'post' | 'patch'; cuerpo: unknown }) =>
      escribir<{ id: number; slug?: string }>(
        v.metodo ?? 'post',
        `/api/iniciativas${v.ruta}`,
        v.cuerpo,
      ),
    onSuccess: refrescar,
    onError: refrescar,
  });
}
