/**
 * De dónde lee La Radiografía. Un puerto de tres preguntas y su
 * implementación contra Postgres.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §4.3, §4.4, §7, R4, R13.
 *
 * El puerto existe por dos razones concretas, no por gusto de abstraer:
 *
 * 1. **La fuente de texto va a cambiar de nombre.** Hoy el corpus es `dreams`;
 *    mañana es `senales` (spec `2026-08-11-b-la-senal.md`). La tabla de
 *    vectores está desacoplada de la de texto justamente para que esa
 *    migración no la toque —`analisis_vectores` guarda `(fuente, fuente_id)` y
 *    no una columna adentro de `dreams`—, y este puerto es dónde se cambia el
 *    literal `'dreams'` por `'senales'` sin tocar el servicio ni la ruta.
 * 2. **El servicio se prueba sin base.** El motor de `@v2/civic-core` ya corre
 *    sin red ni disco; que el ensamblado también lo haga es lo que permite
 *    afirmar el invariante del conteo (spec §11) en un test unitario.
 */
import { desc, dreams, eq, sql } from '@v2/db';

import { logger } from '../../lib/logger.js';

import { claseProvisional, type ClaseProvisional } from './clase-provisional.js';
import { puntoPublicable } from './punto.js';

import type { GeoPoint } from '@v2/civic-core';
import type { Db } from '@v2/db';

/**
 * La fuente de texto de hoy. Es el valor de la columna `fuente` de
 * `analisis_vectores`, y es el literal que se cambia cuando exista `senales`.
 */
export const FUENTE = 'dreams';

/**
 * El techo de filas que entran a una corrida de lectura.
 *
 * El k-NN de `aristasMedidas` es O(n²) en comparaciones y corre **en memoria,
 * adentro del request** —no hay pgvector verificado en el proyecto Neon, así
 * que la salida de la spec §4.4 es exactamente ésta—. Con vectores de 1024
 * dimensiones, quinientas señales son ~125.000 pares: milisegundos. Cinco mil
 * serían ~12,5 millones de pares, o sea trece mil millones de multiplicaciones
 * adentro de una función serverless: eso no es lento, es un timeout.
 *
 * Cuando el corpus pase el techo, la lectura no miente por omisión: se
 * registra en el log y el número que la página publica como `total` es el de
 * las filas que efectivamente entraron. El día que duela de verdad, el k-NN se
 * muda al índice de la base (spec §4.4) y este techo se borra.
 */
export const TOPE_DE_CORPUS = 500;

/** Una voz del corpus, ya reducida a lo que el motor necesita. */
export interface VozDelCorpus {
  /** `"voz:412"` — la misma convención de id que `/api/v1/civic/map/signals`. */
  readonly id: string;
  readonly clase: ClaseProvisional;
  readonly provinciaId: number | null;
  /** **Engrosado**, nunca el crudo. Ver `punto.ts`. */
  readonly punto: GeoPoint | null;
}

/** La procedencia del análisis: la última corrida del job (R4). */
export interface CorridaDeAnalisis {
  readonly modelo: string;
  readonly dimensiones: number;
  /** ISO 8601. */
  readonly corte: string;
}

export interface FuenteDeRadiografia {
  /** `null` cuando el job nunca corrió, o cuando el sustrato todavía no existe. */
  corrida(): Promise<CorridaDeAnalisis | null>;
  voces(): Promise<readonly VozDelCorpus[]>;
  /** Sólo los vectores de ese modelo: mezclar modelos mezcla dimensiones. */
  vectores(modelo: string): Promise<ReadonlyMap<string, readonly number[]>>;
}

const CODIGO_TABLA_INEXISTENTE = '42P01';

/**
 * ¿El error es «la tabla de análisis todavía no existe»?
 *
 * La migración `0020` la escribe otra rebanada (spec §10.2). Mientras no
 * aterrice, la página **no se cae ni se esconde**: dibuja el corpus entero
 * como «esperando análisis», que es literalmente el estado vacío que la spec
 * §6 pide para las señales sin vector. Cualquier otro error de base sí sube.
 */
const esTablaDeAnalisisQueNoExiste = (err: unknown): boolean => {
  if (typeof err !== 'object' || err === null) return false;
  if ((err as { code?: unknown }).code === CODIGO_TABLA_INEXISTENTE) return true;
  const mensaje = err instanceof Error ? err.message : '';
  return /relation "?analisis_[a-z]+"? does not exist/i.test(mensaje);
};

/** `real[]` guardado como `jsonb`: llega como arreglo del driver, o como texto. */
const aVector = (valor: unknown): readonly number[] | null => {
  const crudo: unknown = typeof valor === 'string' ? JSON.parse(valor) : valor;
  if (!Array.isArray(crudo) || crudo.length === 0) return null;
  // Se mapea posición por posición y NO se filtra: un `null` en el medio
  // correría todas las dimensiones siguientes un lugar y el coseno mediría
  // otra cosa sin avisar.
  return crudo.map((n) => (typeof n === 'number' && Number.isFinite(n) ? n : 0));
};

const aIso = (valor: unknown): string | null => {
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor !== 'string' && typeof valor !== 'number') return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha.toISOString();
};

/**
 * Las dos filas crudas. Extienden `Record<string, unknown>` porque es lo que
 * `db.execute<T>()` exige de su parámetro: una fila de SQL sin mapear puede
 * traer columnas que el tipo no nombra, y el driver no promete lo contrario.
 */
interface FilaDeCorrida extends Record<string, unknown> {
  modelo: string | null;
  dimensiones: number | string | null;
  corte: string | Date | null;
}

interface FilaDeVector extends Record<string, unknown> {
  fuente_id: string | number | null;
  vector: unknown;
}

/** La fuente real: la base de v2. */
export const fuenteDeBase = (db: Db): FuenteDeRadiografia => ({
  async corrida(): Promise<CorridaDeAnalisis | null> {
    try {
      const { rows } = await db.execute<FilaDeCorrida>(
        sql`select modelo, dimensiones, corte
              from analisis_corridas
             where fuente = ${FUENTE}
             order by corte desc
             limit 1`,
      );
      const fila = rows[0];
      if (!fila?.modelo) return null;
      const corte = aIso(fila.corte);
      if (corte === null) return null;
      return { modelo: fila.modelo, dimensiones: Number(fila.dimensiones ?? 0), corte };
    } catch (err) {
      if (!esTablaDeAnalisisQueNoExiste(err)) throw err;
      logger.warn(
        { fuente: FUENTE },
        'analisis_corridas todavía no existe (migración 0020): la página se sirve entera sin vectores',
      );
      return null;
    }
  },

  async voces(): Promise<readonly VozDelCorpus[]> {
    const filas = await db
      .select({
        id: dreams.id,
        categoria: dreams.category,
        lat: dreams.lat,
        lng: dreams.lng,
        precision: dreams.precision,
        provinciaId: dreams.provinceId,
      })
      .from(dreams)
      .where(eq(dreams.status, 'approved'))
      .orderBy(desc(dreams.createdAt))
      // Una de más, sólo para poder decir que hubo recorte.
      .limit(TOPE_DE_CORPUS + 1);

    if (filas.length > TOPE_DE_CORPUS) {
      logger.warn(
        { tope: TOPE_DE_CORPUS, leidas: filas.length },
        'El corpus pasó el techo de la lectura en memoria: el k-NN tiene que mudarse al índice de la base (spec §4.4)',
      );
    }

    return filas.slice(0, TOPE_DE_CORPUS).map((fila) => ({
      id: `voz:${String(fila.id)}`,
      clase: claseProvisional(fila.categoria),
      provinciaId: fila.provinciaId,
      punto: puntoPublicable(fila.lat, fila.lng, fila.precision),
    }));
  },

  async vectores(modelo: string): Promise<ReadonlyMap<string, readonly number[]>> {
    const mapa = new Map<string, readonly number[]>();
    try {
      const { rows } = await db.execute<FilaDeVector>(
        sql`select fuente_id, vector
              from analisis_vectores
             where fuente = ${FUENTE} and modelo = ${modelo}`,
      );
      for (const fila of rows) {
        if (fila.fuente_id === null) continue;
        const vector = aVector(fila.vector);
        if (!vector) continue;
        mapa.set(`voz:${String(fila.fuente_id)}`, vector);
      }
    } catch (err) {
      if (!esTablaDeAnalisisQueNoExiste(err)) throw err;
      logger.warn(
        { fuente: FUENTE, modelo },
        'analisis_vectores todavía no existe (migración 0020): todo el corpus queda esperando análisis',
      );
    }
    return mapa;
  },
});
