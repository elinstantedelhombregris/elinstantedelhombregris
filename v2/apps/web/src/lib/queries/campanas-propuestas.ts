/**
 * Campañas que propone cualquiera, con un paso previo: traer gente nueva a imaginar el país
 * (spec 2026-10-19-mi-argentina-ideal-la-pila.md §11).
 *
 * Este módulo usa `escribir` de `participacion.ts` y nada más de ahí: las pruebas de otras
 * pantallas mockean ese módulo con pocas funciones, y una importación de más las rompería.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CampanaParaRevisar, CampanaPublica, EstadoCampana } from '@v2/shared';

import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { escribir } from '~/lib/queries/participacion';

/** Las rutas de la API de campañas propuestas. Si el servidor mueve una, se cambia acá. */
export const RUTAS_PROPUESTAS = {
  /** `?mias=1` trae las de quien mira. */
  campanas: '/api/v1/campanas',
  /** La lista de la administración: `CampanaParaRevisar[]`. */
  revision: '/api/v1/campanas/revision',
  campana: (idOSlug: string) => `/api/v1/campanas/${encodeURIComponent(idOSlug)}`,
  estado: (id: string) => `/api/v1/campanas/${encodeURIComponent(id)}/estado`,
  llegada: (slug: string) => `/api/v1/campanas/${encodeURIComponent(slug)}/llegada`,
} as const;

/** Adónde lleva «Sumate»: el primer momento de Mi Argentina ideal. */
export const IMAGINAR_HREF = '/mi-argentina-ideal/imaginar';
export const PROPONER_HREF = '/campanas/proponer';

/**
 * Una campaña como llega en las listas. El impulso, el historial y si es de quien mira pueden
 * no venir: entonces se piden a la página de la campaña (`useDatosDePropuesta`).
 */
export type CampanaDeLista = Pick<
  CampanaPublica,
  'id' | 'slug' | 'revision' | 'estado' | 'contrato' | 'actualizadaEn'
> &
  Partial<Pick<CampanaPublica, 'impulso' | 'impulsadaPorMi' | 'historial'>>;

const comoLista = <T>(r: unknown): T[] => (Array.isArray(r) ? (r as T[]) : []);

/** Las campañas de quien mira: las que propuso y las que coordina. */
export function useTusCampanas() {
  const auth = useAuth();
  return useQuery({
    queryKey: ['campanas', 'tuyas', auth.user?.id ?? null],
    enabled: !auth.isLoading && Boolean(auth.user),
    queryFn: async () =>
      comoLista<CampanaDeLista>(await api.get<unknown>(`${RUTAS_PROPUESTAS.campanas}?mias=1`)),
  });
}

/**
 * La página de una campaña, con la misma clave que `useCampana` de `participacion.ts`: las dos
 * comparten la respuesta y se invalidan juntas.
 */
export function useDetalleDeCampana(idOSlug: string | undefined, habilitada = true) {
  const auth = useAuth();
  return useQuery({
    queryKey: ['campanas', idOSlug, undefined, auth.user?.id ?? null],
    enabled: habilitada && Boolean(idOSlug) && !auth.isLoading,
    queryFn: () => api.get<CampanaPublica>(RUTAS_PROPUESTAS.campana(idOSlug ?? '')),
  });
}

const juntaGente = (estado: EstadoCampana) => estado === 'reuniendo' || estado === 'por_revisar';

/**
 * El impulso y el historial de una campaña de una lista. Si la lista ya los trae, no pide nada;
 * si no, los busca en su página una sola vez (las dos lecturas comparten la consulta).
 */
export function useDatosDePropuesta(c: CampanaDeLista) {
  const faltaImpulso = juntaGente(c.estado) && c.impulso === undefined;
  const faltaHistorial =
    (c.estado === 'reuniendo' || c.estado === 'borrador') && c.historial === undefined;
  const detalle = useDetalleDeCampana(c.slug, faltaImpulso || faltaHistorial);
  return {
    impulso: c.impulso ?? detalle.data?.impulso ?? null,
    historial: c.historial ?? detalle.data?.historial ?? [],
  };
}

/**
 * «Sumate»: marca la llegada desde la página de la campaña (204 y una cookie `httpOnly`). Nunca
 * falla hacia afuera: si la marca no se pudo dejar, la persona igual sigue a imaginar.
 */
export function useMarcarLlegada() {
  return useMutation({
    mutationFn: async (slug: string) => {
      try {
        await escribir<unknown>('post', RUTAS_PROPUESTAS.llegada(slug));
      } catch {
        // Un 204 llega sin cuerpo y el cliente lo lee como error; tampoco importa si falló.
      }
    },
  });
}

export interface CambioDeEstado {
  id: string;
  revision: number;
  estado: EstadoCampana;
  motivo: string;
}

/** Cambiar el estado de una campaña propuesta: presentarla, retirarla, abrirla o devolverla. */
export function useCambiarEstadoPropuesta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...cuerpo }: CambioDeEstado) =>
      escribir<{ id: string }>('post', RUTAS_PROPUESTAS.estado(id), cuerpo),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['campanas'] });
      void qc.invalidateQueries({ queryKey: ['mi-espacio'] });
    },
  });
}

/** Las campañas que llegaron al umbral y esperan que la administración las revise. */
export function useParaRevisar(habilitada: boolean) {
  return useQuery({
    queryKey: ['campanas', 'revision'],
    enabled: habilitada,
    queryFn: async () =>
      comoLista<CampanaParaRevisar>(await api.get<unknown>(RUTAS_PROPUESTAS.revision)),
  });
}
