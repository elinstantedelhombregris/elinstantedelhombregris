/**
 * Mirar — las consultas de la web contra `/api/v1/pila` y su gestión.
 *
 * Spec: `docs/specs/2026-10-19-mi-argentina-ideal-la-pila.md` §4.
 * Plan: `docs/plans/2026-10-19-mi-argentina-ideal-entrega-1-plan.md` tareas 6, 7 y 9.
 *
 * Opinar es optimista: la tarjeta avanza sin esperar al servidor. Lo que no llegó
 * espera en una cola en memoria y se reintenta tres veces, cada vez con más espera.
 * Si igual se pierde, la pantalla lo dice («Tus últimas N respuestas no se
 * guardaron») y deja reintentar. Nada de esto va a `localStorage`: la cola vive lo
 * que vive la pestaña.
 */
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useState, useSyncExternalStore } from 'react';

import { escribir, tokenParticipacion } from './participacion';

import type {
  AporteEnGestion,
  DueloInput,
  MotivoDeReporte,
  OpinionDeAporte,
  PedidoTanda,
  ResultadoOpinion,
  TandaPila,
  ValorDeOpinion,
} from '@v2/shared';

import { ApiError, api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';

/* ───────────────────────── La provincia, en memoria ───────────────────────── */

/**
 * La provincia que la persona dijo en Mirar, para que viaje también cuando cambia
 * su opinión desde la página del aporte. Vive en este módulo, como el texto en
 * curso de Imaginar: sobrevive a la navegación dentro del sitio y se pierde al
 * recargar. `undefined` es «todavía no se sabe»; `null`, «prefiere no decirlo».
 */
let provinciaEnMemoria: number | null | undefined;

/** `undefined` la olvida, como si no se hubiera preguntado. */
export function recordarProvincia(id: number | null | undefined): void {
  provinciaEnMemoria = id;
}

export function provinciaRecordada(): number | null | undefined {
  return provinciaEnMemoria;
}

/* ───────────────────────── Respuestas sin cuerpo ───────────────────────── */

/**
 * `api.ts` espera siempre un JSON. Un 204 (o un 202 sin cuerpo) llega como
 * `INVALID_JSON` con un estado 2xx: no es un error, es la respuesta.
 */
async function sinCuerpo(pedido: Promise<unknown>): Promise<void> {
  try {
    await pedido;
  } catch (e) {
    if (e instanceof ApiError && e.status >= 200 && e.status < 300) return;
    throw e;
  }
}

/* ───────────────────────── La tanda ───────────────────────── */

/** Es una mutación y no una consulta: pedir una tanda registra que se mostró. */
export function usePedirTanda() {
  return useMutation({
    mutationFn: (pedido: PedidoTanda) => escribir<TandaPila>('post', '/api/v1/pila/tandas', pedido),
  });
}

/* ───────────────────────── La cola de opiniones ───────────────────────── */

export interface OpinionPendiente {
  id: string;
  valor: ValorDeOpinion;
  provinciaId: number | null;
}

/** Tres reintentos, cada uno con más espera que el anterior. */
export const ESPERAS_DE_REINTENTO: readonly number[] = [1_000, 3_000, 9_000];

export interface EstadoDeLaCola {
  /** Opiniones que todavía no llegaron (enviándose o esperando reintento). */
  pendientes: number;
  /** Las que se perdieron después de los reintentos, en el orden en que se dieron. */
  perdidas: readonly OpinionPendiente[];
}

export interface ColaDeOpiniones {
  /** Manda una opinión. Resuelve con la respuesta del servidor, o `null` si no llegó. */
  opinar: (o: OpinionPendiente) => Promise<ResultadoOpinion | null>;
  /** Vuelve a mandar las perdidas. */
  reintentar: () => Promise<void>;
  suscribir: (oyente: () => void) => () => void;
  estado: () => EstadoDeLaCola;
}

type Desenlace = 'reintentar' | 'perder' | 'descartar';

/**
 * Qué se hace con un error:
 * - sin red, 408, 429 o 5xx: se reintenta;
 * - 404: el aporte salió de Mirar (lo retuvieron o lo retiraron) y reintentar no
 *   sirve; la respuesta se descarta sin avisar, porque no hay nada que la persona
 *   pueda hacer;
 * - cualquier otro 4xx: no se reintenta solo, pero se cuenta como perdida para que
 *   la persona pueda volver a intentarlo.
 */
function desenlaceDe(e: unknown): Desenlace {
  if (!(e instanceof ApiError)) return 'reintentar';
  if (e.status === 404) return 'descartar';
  if (e.status === 408 || e.status === 429 || e.status >= 500) return 'reintentar';
  return 'perder';
}

const esperarReal = (ms: number) =>
  new Promise<void>((ok) => {
    setTimeout(ok, ms);
  });

/** La cola, sin React: se prueba sola y el hook sólo la suscribe. */
export function crearColaDeOpiniones(
  enviar: (o: OpinionPendiente) => Promise<ResultadoOpinion>,
  { esperas = ESPERAS_DE_REINTENTO, esperar = esperarReal } = {},
): ColaDeOpiniones {
  /** Por aporte, la generación vigente: una opinión nueva sobre el mismo aporte gana. */
  const enCurso = new Map<string, number>();
  let perdidas: OpinionPendiente[] = [];
  let generacion = 0;
  let instantanea: EstadoDeLaCola = { pendientes: 0, perdidas };
  const oyentes = new Set<() => void>();
  const avisar = () => {
    instantanea = { pendientes: enCurso.size, perdidas };
    for (const oyente of oyentes) oyente();
  };
  const vigente = (id: string, gen: number) => enCurso.get(id) === gen;
  const cerrar = (o: OpinionPendiente, gen: number, perdida: boolean) => {
    if (!vigente(o.id, gen)) return;
    enCurso.delete(o.id);
    if (perdida) perdidas = [...perdidas, o];
    avisar();
  };

  const opinar = async (o: OpinionPendiente): Promise<ResultadoOpinion | null> => {
    generacion += 1;
    const gen = generacion;
    enCurso.set(o.id, gen);
    perdidas = perdidas.filter((p) => p.id !== o.id);
    avisar();
    for (let intento = 0; ; intento += 1) {
      try {
        const r = await enviar(o);
        cerrar(o, gen, false);
        return r;
      } catch (e) {
        if (!vigente(o.id, gen)) return null;
        const desenlace = desenlaceDe(e);
        const espera = esperas[intento];
        if (desenlace === 'descartar') {
          cerrar(o, gen, false);
          return null;
        }
        if (desenlace === 'perder' || espera === undefined) {
          cerrar(o, gen, true);
          return null;
        }
        await esperar(espera);
        if (!vigente(o.id, gen)) return null;
      }
    }
  };

  return {
    opinar,
    reintentar: async () => {
      const otraVez = perdidas;
      perdidas = [];
      avisar();
      await Promise.all(otraVez.map(opinar));
    },
    suscribir: (oyente) => {
      oyentes.add(oyente);
      return () => {
        oyentes.delete(oyente);
      };
    },
    estado: () => instantanea,
  };
}

const claveDeOpinion = (id: string) => ['pila', 'opinion', id] as const;

function marcarOpinion(qc: QueryClient, id: string, valor: ValorDeOpinion) {
  qc.setQueryData<OpinionDeAporte>(claveDeOpinion(id), (previa) =>
    previa ? { ...previa, miOpinion: valor } : previa,
  );
}

/**
 * Opinar sobre un aporte, sin esperar. `opinar` resuelve con la respuesta del
 * servidor cuando llega (para el aviso de después), o con `null` si no llegó.
 */
export function useOpinar() {
  const qc = useQueryClient();
  const [cola] = useState(() =>
    crearColaDeOpiniones((o) =>
      escribir<ResultadoOpinion>('put', `/api/v1/pila/opiniones/${encodeURIComponent(o.id)}`, {
        valor: o.valor,
        provinciaId: o.provinciaId,
      }),
    ),
  );
  const estado = useSyncExternalStore(cola.suscribir, cola.estado, cola.estado);
  return {
    opinar: (o: OpinionPendiente) => {
      marcarOpinion(qc, o.id, o.valor);
      // Ver se arma con estas opiniones: la próxima vez que se mire, se pide de nuevo.
      void qc.invalidateQueries({ queryKey: ['vision'] });
      return cola.opinar(o);
    },
    reintentar: cola.reintentar,
    pendientes: estado.pendientes,
    perdidas: estado.perdidas.length,
  };
}

/* ───────────────────────── Duelos y reportes ───────────────────────── */

/** ¿Cuál va primero? El servidor responde 204. */
export function useComparar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (duelo: DueloInput) => {
      await sinCuerpo(escribir<unknown>('put', '/api/v1/pila/duelos', duelo));
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['vision'] }),
  });
}

export function useReportar() {
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: MotivoDeReporte }) => {
      await sinCuerpo(
        escribir<unknown>('post', `/api/v1/pila/reportes/${encodeURIComponent(id)}`, { motivo }),
      );
    },
  });
}

/** Para `/senal/:id`: si el aporte está en Mirar y qué dijo esta persona. Sin id, no pregunta. */
export function useOpinionDe(id: string | undefined) {
  return useQuery({
    queryKey: claveDeOpinion(id ?? ''),
    enabled: Boolean(id),
    retry: false,
    queryFn: () => api.get<OpinionDeAporte>(`/api/v1/pila/aportes/${encodeURIComponent(id ?? '')}`),
  });
}

/* ───────────────────────── Gestión (sólo admin) ───────────────────────── */

export interface PaginaDeGestionPila {
  aportes: AporteEnGestion[];
  siguiente: string | null;
}

type RespuestaDeGestion =
  | AporteEnGestion[]
  | {
      data?: AporteEnGestion[];
      items?: AporteEnGestion[];
      aportes?: AporteEnGestion[];
      siguiente?: string | number | null;
      cursor?: string | number | null;
    };

/**
 * La API puede responder la lista sola o una página con cursor. Las dos formas
 * terminan iguales acá, y la pantalla no tiene que saber cuál llegó.
 */
export function leerPaginaDeGestion(r: RespuestaDeGestion | null | undefined): PaginaDeGestionPila {
  if (!r) return { aportes: [], siguiente: null };
  if (Array.isArray(r)) return { aportes: r, siguiente: null };
  const cursor = r.siguiente ?? r.cursor ?? null;
  return {
    aportes: r.aportes ?? r.items ?? r.data ?? [],
    siguiente: cursor === null ? null : String(cursor),
  };
}

const CLAVE_GESTION = ['pila', 'gestion'] as const;

export function useGestionPila() {
  const auth = useAuth();
  return useInfiniteQuery({
    queryKey: [...CLAVE_GESTION, auth.user?.id ?? null],
    enabled: auth.user?.esAdmin === true,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      leerPaginaDeGestion(
        await api.get<RespuestaDeGestion>(
          `/api/v1/gestion/pila${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ''}`,
          { signal },
        ),
      ),
    getNextPageParam: (p) => p.siguiente ?? undefined,
  });
}

function useDecisionDeGestion(decision: 'retener' | 'devolver') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const ruta = `/api/v1/gestion/pila/${encodeURIComponent(id)}/retencion`;
      if (decision === 'retener') {
        await sinCuerpo(escribir<unknown>('post', ruta, { motivo }));
        return;
      }
      const csrfToken = await tokenParticipacion();
      await sinCuerpo(api.del<unknown>(ruta, { csrfToken, body: { motivo } }));
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: CLAVE_GESTION });
    },
  });
}

/** «Retener ahora»: el aporte sale de Mirar sin esperar los reportes. */
export function useRetenerAporte() {
  return useDecisionDeGestion('retener');
}

/** «Devolver»: vuelve a Mirar y los reportes cuentan de nuevo desde cero. */
export function useDevolverAporte() {
  return useDecisionDeGestion('devolver');
}
