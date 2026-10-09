import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ContenidoFicha, FichaFuturo } from '@v2/shared';

import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth/csrf';

export function useFicha(id: string | undefined) {
  return useQuery({
    queryKey: ['fichas', id],
    enabled: Boolean(id),
    queryFn: ({ signal }) => api.get<FichaFuturo>(`/api/v1/fichas/${id ?? ''}`, { signal }),
  });
}
export function useFichas(territorioId?: number, campanaId?: string) {
  return useQuery({
    queryKey: ['fichas', 'lista', territorioId, campanaId],
    queryFn: ({ signal }) =>
      api.get<{
        fichas: {
          id: string;
          titulo: string;
          revision: number;
          territorioNombre: string | null;
          actualizadaEn: string;
        }[];
        total: number;
      }>(
        `/api/v1/fichas?${new URLSearchParams({ ...(territorioId ? { territorioId: String(territorioId) } : {}), ...(campanaId ? { campanaId } : {}) }).toString()}`,
        { signal },
      ),
  });
}
export function useGuardarFicha(id?: string, revision?: number) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ contenido, idLocal }: { contenido: ContenidoFicha; idLocal: string }) =>
      id
        ? api.put<{ id: string }>(
            `/api/v1/fichas/${id}`,
            { contenido, revisionEsperada: revision },
            { csrfToken: readCsrfToken() },
          )
        : api.post<{ id: string }>(
            '/api/v1/fichas',
            { contenido, idLocal, aceptaPublicar: true },
            { csrfToken: readCsrfToken() },
          ),
    onSuccess: () => {
      void cliente.invalidateQueries({ queryKey: ['fichas'] });
    },
  });
}
