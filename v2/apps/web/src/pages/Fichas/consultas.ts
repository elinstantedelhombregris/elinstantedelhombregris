import { useQuery } from '@tanstack/react-query';

import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';

import { api } from '~/lib/api';

/** El lugar del catálogo oficial, con la misma consulta y clave que ya usan las campañas. */
export function useLugar(id: number | undefined) {
  return useQuery({
    queryKey: ['geo', 'lugar', id],
    enabled: id !== undefined,
    staleTime: 300_000,
    queryFn: ({ signal }) =>
      api.get<LugarMapa>(`/api/v1/geo/lugares/${String(id ?? '')}`, { signal }),
  });
}

export interface TemaDelCatalogo {
  clave: string;
  etiqueta: string;
}

/**
 * Los temas que el servidor ofrece. Comparte consulta y clave con `TemaDelAporte`:
 * si ya se pidieron en otra pantalla no vuelven a viajar.
 */
export function useTemasDelCatalogo() {
  return useQuery({
    queryKey: ['participacion-temas'],
    queryFn: () => api.get<{ temas?: TemaDelCatalogo[] }>('/api/v1/contribuciones/contexto'),
  });
}
