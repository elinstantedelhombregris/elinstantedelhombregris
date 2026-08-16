/**
 * De dónde lee La Radiografía. Un puerto de tres preguntas y su
 * implementación contra Postgres.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §4.3, §4.4, §7, R4, R13.
 *
 * ## El corpus, dicho por su nombre
 *
 * **La tabla es `senales`.** No es un detalle de implementación escondido acá
 * abajo: viaja en la respuesta como `corpus` y la cabecera de la página lo
 * publica al lado del modelo, porque quien mira una constelación tiene que
 * poder saber de qué tabla salió lo que ve.
 *
 * Hasta el 16/8/2026 este archivo leía `dreams`, y `dreams` está **retirada
 * desde la migración 0022**: no recibe escrituras y toda señal vive en
 * `senales` (ver la cabecera de `packages/db/src/schema/dreams.ts`). O sea que
 * una voz cargada hoy no llegaba nunca a esta página, y el vacío de la pantalla
 * —que la spec diseñó como pieza— era en realidad un caño desconectado que se
 * le parecía. Nada fallaba, y ése era el problema.
 *
 * El puerto sigue existiendo por dos razones concretas, no por gusto de
 * abstraer:
 *
 * 1. **La tabla de vectores está desacoplada de la del texto.**
 *    `analisis_vectores` guarda `(fuente, fuente_id)` y no una columna adentro
 *    del corpus, y esa previsión de la migración 0020 es lo que hizo que
 *    repuntar de `dreams` a `senales` costara este archivo y no una migración.
 * 2. **El servicio se prueba sin base.** El motor de `@v2/civic-core` ya corre
 *    sin red ni disco; que el ensamblado también lo haga es lo que permite
 *    afirmar el invariante del conteo (spec §11) en un test unitario.
 */
import { and, desc, senales, sql, FUENTE_VIVA } from '@v2/db';

import { logger } from '../../lib/logger.js';

import { puntoPublicable } from './punto.js';

import type { GeoPoint } from '@v2/civic-core';
import type { Db } from '@v2/db';

/**
 * La fuente de texto: el valor de la columna `fuente` de `analisis_vectores`
 * **y** el nombre de la tabla de la que sale el corpus. Los dos tienen que
 * decir lo mismo o la página lee vectores de un corpus y textos de otro.
 *
 * **Se reexporta desde `@v2/db` y no se escribe de nuevo acá.** El job que
 * escribe esos vectores (`pnpm radiografia:embeber`) no puede importar de
 * `apps/api` —`scripts/` no es workspace de pnpm—, así que el único lugar al
 * que llegan las dos puntas es el paquete de base. Dos literales iguales en dos
 * archivos es exactamente el defecto que dejó a esta página leyendo una tabla
 * retirada sin que nada fallara.
 */
export const FUENTE = FUENTE_VIVA;

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
  /** `"voz:<id_publico>"` — la misma convención de id que `/api/v1/civic/map/signals`. */
  readonly id: string;
  /**
   * La clase, **tal cual la columna**. No se infiere de nada.
   *
   * `senales.clase` es `notNull` y la atornillan dos FK compuestas contra
   * `tipos_senal` y `estados_senal`: insertar `('sueño','hecho')` es imposible
   * porque ese par no existe en el catálogo. La regla 11 la hace cumplir
   * Postgres, no un mapa de este lado — el que había (`clase-provisional.ts`)
   * está borrado, y con él el mapeo de `valor`, un tipo que salió del canon.
   *
   * Es `string` y no la unión de cuatro **a propósito**: el día que el catálogo
   * gane una quinta clase, la señal tiene que seguir contándose y dibujándose
   * con su nombre en vez de plegarse a una clase que no es. Es la misma
   * decisión que ya tomó el contrato de la web (`lib/queries/radiografia.ts`).
   */
  readonly clase: string;
  /** El texto crudo. **Sale a pantalla sólo por `textoPublicable`** (§4.5.4). */
  readonly texto: string;
  /** La cesión de licencia de esa fila. Sin ella, su frase no se presta. */
  readonly cesionLicencia: boolean;
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
  /** El nombre del corpus, para que la página lo declare. Ver `FUENTE`. */
  readonly corpus: string;
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
  corpus: FUENTE,

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

  /**
   * El corpus publicable de `senales`.
   *
   * El predicado es el mismo que el de `CivicMapRepository.vocesDeSenales` y el
   * mismo que el de `AnalisisRepository.faltanPorEmbeber`, y esa coincidencia
   * no es estética: si el job embebiera un conjunto y la página leyera otro, el
   * invariante del conteo de §11 —analizadas + esperando = total— dejaría de
   * cerrar sin que nada avise.
   *
   * - `retenida_en is null` — la retención de cuidado es **visibilidad y no
   *   calidad**, no toca `estado`, y sale de toda superficie pública;
   * - `estado <> 'retirada'` — una retirada conserva la fila para la cobertura
   *   pero su texto está vacío por CHECK, y una estrella sin texto en el cielo
   *   es un punto que no dice nada.
   *
   * El id que sale es `id_publico` y **nunca el ordinal**: un entero en la
   * respuesta deja enumerar el corpus entero y emparejar dos señales de la
   * misma sesión. Eso gobierna también qué guarda `analisis_vectores.fuente_id`
   * para esta fuente — el mismo `id_publico`, o los vectores no aparean.
   */
  async voces(): Promise<readonly VozDelCorpus[]> {
    const filas = await db
      .select({
        idPublico: senales.idPublico,
        clase: senales.clase,
        texto: senales.texto,
        cesionLicencia: senales.cesionLicencia,
        lat: senales.lat,
        lng: senales.lng,
        precision: senales.precision,
        provinciaId: senales.provinceId,
      })
      .from(senales)
      .where(
        and(
          sql`${senales.retenidaEn} is null`,
          sql`${senales.estado} <> 'retirada'`,
          /*
           * El texto en blanco se excluye acá porque `faltanPorEmbeber` lo
           * excluye allá. Sin esta línea el docstring de arriba era falso y
           * había una fila condenada: una señal con texto vacío entraba al
           * `total`, quedaba contada como «esperando análisis», y ningún job
           * podía embeberla nunca — esperando para siempre un análisis que
           * nadie iba a poder hacerle.
           */
          sql`length(btrim(${senales.texto})) > 0`,
        ),
      )
      .orderBy(desc(senales.creadaEn))
      // Una de más, sólo para poder decir que hubo recorte.
      .limit(TOPE_DE_CORPUS + 1);

    if (filas.length > TOPE_DE_CORPUS) {
      logger.warn(
        { tope: TOPE_DE_CORPUS, leidas: filas.length },
        'El corpus pasó el techo de la lectura en memoria: el k-NN tiene que mudarse al índice de la base (spec §4.4)',
      );
    }

    return filas.slice(0, TOPE_DE_CORPUS).map((fila) => ({
      id: `voz:${fila.idPublico}`,
      clase: fila.clase,
      texto: fila.texto,
      cesionLicencia: fila.cesionLicencia,
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
