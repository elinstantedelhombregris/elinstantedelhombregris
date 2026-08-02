import { prepareRecordLocation } from '@v2/civic-core';
import { dreams, eq, getDb } from '@v2/db';

import { provinciaIdDePunto } from '../geographic/provincias.js';

import type { CapturaInput } from './validation.js';
import type { LocationRole } from '@v2/civic-core';

/**
 * La ingesta de capturas de campo (spec 4 §4).
 *
 * `juego/src/civic/sync.ts` tiene un outbox completo —batching, arriendos de
 * envío, barrido de reintentos, cursor de feed, autenticación por dispositivo—
 * que postea a `/api/v1/civic/*`. Ninguno de esos endpoints existía en v2: el
 * puente estaba construido hasta la mitad del río. Esto construye el tramo que
 * el mapa necesita, y nada más.
 */

export interface ReciboCaptura {
  idLocal: string;
  /** El mismo id con el que la captura aparece en el mapa. */
  idPublico: string;
  precisionPublicada: string;
  /** Por qué se engrosó, cuando se engrosó. La persona tiene que enterarse. */
  engrosado: string | null;
  url: string;
  /** `true` cuando el idLocal ya existía: el outbox reintentó, no duplicamos. */
  yaExistia: boolean;
}

/**
 * El tipo de captura decide en qué capa entra y, sobre todo, qué rol tiene su
 * ubicación por defecto:
 *
 * - `observation` → `capture`: dónde estaba parado quien vio el pozo. Es la
 *   esquina del problema, no la casa de nadie, así que se publica exacta.
 * - `resource`    → `meeting_point`: dónde se entrega o se retira. Sin
 *   exactitud el recurso no se puede usar.
 * - `need`        → `subject`: el único caso donde la protección puede entrar,
 *   y solo si además la sensibilidad es alta.
 */
const ROL_POR_TIPO: Record<CapturaInput['tipo'], LocationRole> = {
  observation: 'capture',
  resource: 'meeting_point',
  need: 'subject',
};

export async function ingerirCaptura(input: CapturaInput): Promise<ReciboCaptura> {
  const db = getDb();

  // Idempotencia: el outbox del móvil reintenta con el mismo idLocal y no
  // puede terminar publicando la misma captura tres veces.
  const [existente] = await db
    .select({ id: dreams.id, precision: dreams.precision })
    .from(dreams)
    .where(eq(dreams.submittedAs, marcaDeCaptura(input.idLocal)))
    .limit(1);

  if (existente) {
    return {
      idLocal: input.idLocal,
      idPublico: `voz:${String(existente.id)}`,
      precisionPublicada: existente.precision,
      engrosado: null,
      url: urlDe(existente.id),
      yaExistia: true,
    };
  }

  /**
   * El servidor RECALCULA la precisión y nunca le cree la que el cliente dice
   * haber aplicado. Un cliente modificado no puede publicar más fino de lo que
   * la política permite — y bajo D7 la política permite bastante, justamente
   * para que un pozo esté donde está el pozo.
   */
  const ubicacion = prepareRecordLocation({
    point: input.punto,
    requestedPrecision: input.precisionPedida,
    role: ROL_POR_TIPO[input.tipo],
    sensitivity: input.sensitivity,
    audience: 'collective',
  });

  /**
   * La provincia se deriva del punto publicado — D-001 en `docs/DEUDAS.md`.
   *
   * Se usa el punto PUBLICADO y no el crudo para que la fila sea internamente
   * coherente: la provincia tiene que ser la del punto que el mapa dibuja, no
   * la de uno que nadie ve. Si el cliente mandó `provinceId`, manda el
   * cliente: sabe cosas que la geometría no, como de qué lado de un límite
   * está realmente.
   */
  const provinceId =
    input.provinceId ?? (await provinciaIdDePunto(db, ubicacion.publicPoint ?? null));

  const [fila] = await db
    .insert(dreams)
    .values({
      body: input.texto,
      category: input.tipo,
      status: 'approved',
      submittedAs: marcaDeCaptura(input.idLocal),
      ...(ubicacion.publicPoint
        ? { lat: String(ubicacion.publicPoint.lat), lng: String(ubicacion.publicPoint.lng) }
        : {}),
      precision: ubicacion.publishedPrecision,
      locationRole: ROL_POR_TIPO[input.tipo],
      sensitivity: input.sensitivity,
      ...(provinceId === null ? {} : { provinceId }),
    })
    .returning({ id: dreams.id });

  if (!fila) throw new Error('No se pudo guardar la captura.');

  return {
    idLocal: input.idLocal,
    idPublico: `voz:${String(fila.id)}`,
    precisionPublicada: ubicacion.publishedPrecision,
    engrosado: ubicacion.coarsenedBecause,
    url: urlDe(fila.id),
    yaExistia: false,
  };
}

/**
 * La marca de idempotencia viaja en `submitted_as` — la columna que ya existe
 * para el nombre público de un envío anónimo.
 *
 * Es deuda declarada, no elegancia: una tabla de outbox con índice único sobre
 * `id_local` es lo correcto, y llega con el contrato de sync completo, que es
 * del blueprint y no de esta spec (spec 4 §2). Mientras tanto el prefijo
 * `captura:` la hace inequívoca y el test de idempotencia la cubre.
 */
function marcaDeCaptura(idLocal: string): string {
  return `captura:${idLocal}`;
}

function urlDe(id: number): string {
  return `/el-mapa#voz-${String(id)}`;
}
