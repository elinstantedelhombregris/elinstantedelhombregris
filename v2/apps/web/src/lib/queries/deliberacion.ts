import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import type { LecturaDeliberacion, RelacionEntreFichas, VisionCompartida } from '@v2/shared';

import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';

export function useDeliberacion(id: string) {
  const auth = useAuth();
  return useInfiniteQuery({
    queryKey: ['deliberacion', id, auth.user?.id ?? null],
    enabled: !auth.isLoading,
    initialPageParam: '',
    queryFn: ({ pageParam, signal }) =>
      api.get<LecturaDeliberacion>(
        `/api/v1/fichas/${id}/argumentos${pageParam ? `?despues=${pageParam}` : ''}`,
        { signal },
      ),
    getNextPageParam: (pagina) => (pagina.completa ? undefined : pagina.argumentos.at(-1)?.id),
  });
}
export function useRelacionesFichas(id: string) {
  const auth = useAuth();
  return useQuery({
    queryKey: ['relaciones-fichas', id, auth.user?.id ?? null],
    enabled: !auth.isLoading,
    queryFn: ({ signal }) =>
      api.get<{ relaciones: RelacionEntreFichas[]; completa: boolean }>(
        `/api/v1/fichas/${id}/relaciones`,
        { signal },
      ),
  });
}
export function useVisionCompartida(territorioId?: number) {
  return useInfiniteQuery({
    queryKey: ['vision-compartida', territorioId],
    initialPageParam: '',
    queryFn: ({ pageParam, signal }) =>
      api.get<VisionCompartida>(
        `/api/v1/fichas/vision?${new URLSearchParams({ ...(territorioId ? { territorioId: String(territorioId) } : {}), ...(pageParam ? { despues: pageParam } : {}) }).toString()}`,
        { signal },
      ),
    getNextPageParam: (pagina) => pagina.siguiente ?? undefined,
  });
}
