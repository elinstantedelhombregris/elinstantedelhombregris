import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '~/lib/api';

/**
 * Lo que falta — el canal de escucha
 * (`docs/specs/2026-08-12-lo-que-falta.md`).
 *
 * Los tres endpoints de escritura son anónimos y están exentos de CSRF por
 * patrón anclado del lado del servidor; el techo es el límite de tasa. Ninguno
 * manda ni recibe un dato de contacto: la identidad del envío es una llave que
 * vuelve una sola vez y vive en el navegador de quien la dejó.
 */

export type OrigenDeFalta = 'adentro' | 'afuera';
export type SuperficieDeFalta =
  | 'el-mapa'
  | 'los-planes'
  | 'la-biblioteca'
  | 'los-entrenamientos'
  | 'la-plataforma';
export type EstadoDeFalta = 'dicha' | 'anotada' | 'en_curso' | 'hecha' | 'no_va' | 'bajada';

export interface ContextoDeFalta {
  ruta?: string;
  encuadre?: { oeste: number; sur: number; este: number; norte: number };
  capa?: string;
}

export interface FaltaPublica {
  idPublico: string;
  origen: OrigenDeFalta;
  superficie: SuperficieDeFalta;
  titulo: string;
  cuerpo: string;
  contexto: ContextoDeFalta | null;
  severidad: 'bloqueante' | 'alta' | 'media' | 'baja' | null;
  estado: EstadoDeFalta;
  razon: string | null;
  anotadaComo: string | null;
  cierreUrl: string | null;
  firmas: number;
  creadaEn: string;
  movidaEn: string;
}

export interface PaginaDeFaltas {
  faltas: FaltaPublica[];
  siguiente: string | null;
}

export interface FiltroDeFaltas {
  estado?: EstadoDeFalta;
  superficie?: SuperficieDeFalta;
  origen?: OrigenDeFalta;
}

function aQuery(filtro: FiltroDeFaltas, cursor?: string): string {
  const params = new URLSearchParams();
  if (filtro.estado) params.set('estado', filtro.estado);
  if (filtro.superficie) params.set('superficie', filtro.superficie);
  if (filtro.origen) params.set('origen', filtro.origen);
  if (cursor) params.set('cursor', cursor);
  const texto = params.toString();
  return texto ? `?${texto}` : '';
}

/** El registro, cronológico y por cursor. El orden nunca lo decide la popularidad. */
export function useFaltas(filtro: FiltroDeFaltas = {}) {
  return useInfiniteQuery({
    queryKey: ['faltas', 'listado', filtro],
    queryFn: ({ pageParam }) =>
      api.get<PaginaDeFaltas>(`/api/v1/faltas${aQuery(filtro, pageParam ?? undefined)}`),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (ultima: PaginaDeFaltas) => ultima.siguiente ?? undefined,
  });
}

export function useFalta(idPublico: string | undefined) {
  return useQuery({
    queryKey: ['faltas', 'ficha', idPublico],
    queryFn: () => api.get<FaltaPublica>(`/api/v1/faltas/${String(idPublico)}`),
    enabled: Boolean(idPublico),
  });
}

/** El conteo autoritativo. No sale del listado, que está paginado y mentiría. */
export function useConteosDeFaltas() {
  return useQuery({
    queryKey: ['faltas', 'conteos'],
    queryFn: () =>
      api.get<{ total: number; porEstado: Record<string, number> }>('/api/v1/faltas/conteos'),
  });
}

export interface DejarFaltaInput {
  superficie: SuperficieDeFalta;
  titulo: string;
  cuerpo: string;
  contexto?: ContextoDeFalta;
}

export interface FaltaDejada {
  idPublico: string;
  url: string;
  /** Vuelve UNA sola vez. Se guarda en el navegador; el servidor tiene su hash. */
  llave: string;
}

export function useDejarFalta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DejarFaltaInput) => api.post<FaltaDejada>('/api/v1/faltas', input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['faltas'] });
    },
  });
}

export function useFirmarFalta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idPublico, llave }: { idPublico: string; llave: string }) =>
      api.post<{ firmas: number; nueva: boolean }>(`/api/v1/faltas/${idPublico}/firmas`, { llave }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['faltas'] });
    },
  });
}

export function useRetirarFalta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idPublico, llave }: { idPublico: string; llave: string }) =>
      api.del<FaltaPublica>(`/api/v1/faltas/${idPublico}`, { body: { llave } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['faltas'] });
    },
  });
}
