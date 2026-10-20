/**
 * El recorrido de una tanda de Mirar, como función pura: qué tarjeta toca, cuándo
 * entra un duelo y dónde va la tarjeta de escribir (spec §4).
 *
 * Lo de la tanda se reinicia con cada una; lo de la sesión (lo que ya se vio, los
 * acuerdos, los pares comparados) dura lo que dura la página, en memoria.
 */
import { clavePar, proximoDuelo, tocaDuelo } from '@v2/civic-core';

import type { EstadoEnLaPila, TandaPila, TarjetaPila, ValorDeOpinion } from '@v2/shared';

export type ItemDeMirar =
  | { tipo: 'aporte'; tarjeta: TarjetaPila }
  | { tipo: 'escribir' }
  | { tipo: 'duelo'; par: readonly [TarjetaPila, TarjetaPila] };

export interface Visto {
  tarjeta: TarjetaPila;
  valor: ValorDeOpinion | 'reportado';
}

export interface TandaEnCurso {
  items: ItemDeMirar[];
  indice: number;
  /** Respuestas dadas en esta tanda: los duelos van después de la 4.ª y la 8.ª. */
  respondidas: number;
  duelos: number;
  vistos: Visto[];
  /** La última acción fue una respuesta: al avanzar, se mira si toca un duelo. */
  revisarDuelo: boolean;
}

export interface MemoriaDeSesion {
  conocidas: Readonly<Record<string, TarjetaPila>>;
  /** Los «Yo también» de esta sesión, en orden. */
  acuerdos: string[];
  pares: string[];
  usados: string[];
  reportados: string[];
  escribirSalteada: boolean;
}

export interface EstadoDeMirar {
  tanda: TandaEnCurso | null;
  servidor: EstadoEnLaPila | null;
  sesion: MemoriaDeSesion;
}

export type AccionDeMirar =
  | { tipo: 'empezar'; tanda: TandaPila; desdeImaginar: boolean }
  | { tipo: 'respondio'; valor: ValorDeOpinion }
  | { tipo: 'avanzar' }
  | { tipo: 'reporto' }
  | { tipo: 'salteoEscribir' }
  | { tipo: 'eligioDuelo' };

/** La tarjeta de escribir va en el sexto lugar, o al final si hay menos. */
export const LUGAR_DE_ESCRIBIR = 6;

export function mirarNuevo(): EstadoDeMirar {
  return {
    tanda: null,
    servidor: null,
    sesion: {
      conocidas: {},
      acuerdos: [],
      pares: [],
      usados: [],
      reportados: [],
      escribirSalteada: false,
    },
  };
}

export function armarItems(tarjetas: readonly TarjetaPila[], conEscribir: boolean): ItemDeMirar[] {
  const items: ItemDeMirar[] = tarjetas.map((tarjeta) => ({ tipo: 'aporte', tarjeta }));
  if (conEscribir && items.length > 0)
    items.splice(Math.min(LUGAR_DE_ESCRIBIR - 1, items.length), 0, { tipo: 'escribir' });
  return items;
}

const unicos = (ids: readonly string[]) => [...new Set(ids)];

/**
 * El duelo que toca ahora, si toca. Los acuerdos y los pares son los que trajo la
 * tanda más los de esta sesión. Sólo entran aportes cuyo texto está en memoria:
 * un duelo muestra los dos papelitos, y el estado de la tanda trae sólo ids.
 */
export function dueloQueToca(
  t: TandaEnCurso,
  servidor: EstadoEnLaPila | null,
  s: MemoriaDeSesion,
): readonly [TarjetaPila, TarjetaPila] | null {
  if (!tocaDuelo(t.respondidas, t.duelos)) return null;
  const paresDelServidor = servidor?.paresComparados ?? [];
  const acuerdos = unicos([...(servidor?.acuerdos ?? []), ...s.acuerdos]).filter(
    (id) => s.conocidas[id] !== undefined && !s.reportados.includes(id),
  );
  const yaComparados = new Set([...paresDelServidor, ...s.pares]);
  const usados = new Set([...s.usados, ...paresDelServidor.flatMap((p) => p.split('|'))]);
  const par = proximoDuelo(acuerdos, yaComparados, usados);
  if (!par) return null;
  const a = s.conocidas[par[0]];
  const b = s.conocidas[par[1]];
  return a && b ? [a, b] : null;
}

function actual(t: TandaEnCurso): ItemDeMirar | undefined {
  return t.items[t.indice];
}

export function reducirMirar(e: EstadoDeMirar, a: AccionDeMirar): EstadoDeMirar {
  if (a.tipo === 'empezar') {
    const conocidas = { ...e.sesion.conocidas };
    for (const t of a.tanda.tarjetas) conocidas[t.id] = t;
    const conEscribir = !a.tanda.estado.yaAporto && !a.desdeImaginar && !e.sesion.escribirSalteada;
    return {
      servidor: a.tanda.estado,
      sesion: { ...e.sesion, conocidas },
      tanda: {
        items: armarItems(a.tanda.tarjetas, conEscribir),
        indice: 0,
        respondidas: 0,
        duelos: 0,
        vistos: [],
        revisarDuelo: false,
      },
    };
  }
  const t = e.tanda;
  if (!t) return e;
  const item = actual(t);
  const siguiente = (cambios: Partial<TandaEnCurso>, sesion = e.sesion): EstadoDeMirar => ({
    ...e,
    sesion,
    tanda: { ...t, revisarDuelo: false, ...cambios, indice: t.indice + 1 },
  });

  switch (a.tipo) {
    case 'respondio': {
      if (item?.tipo !== 'aporte') return e;
      const id = item.tarjeta.id;
      return {
        ...e,
        sesion:
          a.valor === 'acuerdo' ? { ...e.sesion, acuerdos: [...e.sesion.acuerdos, id] } : e.sesion,
        tanda: {
          ...t,
          respondidas: t.respondidas + 1,
          vistos: [...t.vistos, { tarjeta: item.tarjeta, valor: a.valor }],
          revisarDuelo: true,
        },
      };
    }
    case 'avanzar': {
      if (!t.revisarDuelo) return siguiente({});
      const par = dueloQueToca(t, e.servidor, e.sesion);
      if (!par) return siguiente({});
      const items = [...t.items];
      items.splice(t.indice + 1, 0, { tipo: 'duelo', par });
      return siguiente({ items, duelos: t.duelos + 1 });
    }
    case 'reporto': {
      if (item?.tipo !== 'aporte') return e;
      return siguiente(
        { vistos: [...t.vistos, { tarjeta: item.tarjeta, valor: 'reportado' }] },
        { ...e.sesion, reportados: [...e.sesion.reportados, item.tarjeta.id] },
      );
    }
    case 'salteoEscribir':
      return item?.tipo === 'escribir' ? siguiente({}, { ...e.sesion, escribirSalteada: true }) : e;
    case 'eligioDuelo': {
      if (item?.tipo !== 'duelo') return e;
      const [x, y] = item.par;
      return siguiente(
        {},
        {
          ...e.sesion,
          pares: [...e.sesion.pares, clavePar(x.id, y.id)],
          usados: [...e.sesion.usados, x.id, y.id],
        },
      );
    }
  }
}
