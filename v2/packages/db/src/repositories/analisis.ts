/**
 * AnalisisRepository — los vectores de La Radiografía y la procedencia de cada
 * corrida.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §4.3, §4.4, R4.
 *
 * Este repositorio tiene **dos clientes y ninguno más**: el job
 * `pnpm radiografia:embeber`, que escribe, y el endpoint de la página, que
 * lee. Por eso su superficie es chica a propósito —cuatro lecturas y dos
 * escrituras— y ninguna devuelve la fila entera de `analisis_vectores`: nadie
 * necesita `creadoEn` ni `dimensiones` al lado de cada vector.
 *
 * **Nada de acá conoce `dreams` salvo `faltanPorEmbeber`**, y esa es toda la
 * costura que la migración a `senales` va a tener que tocar. El resto habla de
 * `fuente` como un rótulo y le da igual de qué tabla salió.
 *
 * **Sin `db.transaction()`.** El driver es `neon-http` y no las soporta (ver
 * `client.ts`). Cada lote de vectores es un `INSERT … ON CONFLICT` que se basta
 * solo: si la corrida se corta a la mitad, lo escrito queda escrito y la
 * próxima corrida sigue desde ahí. Eso es exactamente lo que quiere decir
 * «reanudable».
 */
import { and, desc, eq, notExists, sql } from 'drizzle-orm';

import { analisisCorridas, analisisVectores } from '../schema/analisis.js';
import { dreams } from '../schema/dreams.js';

import { correrConTecho } from './_lectura.js';

import type { Db } from '../client.js';
import type { OpcionesDeLectura } from './_lectura.js';
import type { CorridaDeAnalisis, NuevaCorridaDeAnalisis } from '../schema/analisis.js';

/**
 * Cuántas filas entran en un `INSERT`.
 *
 * No lo fija el techo de parámetros de Postgres (65535, y acá son cinco por
 * fila) sino el tamaño del cuerpo: mil vectores de 1024 flotantes son varias
 * decenas de megabytes de JSON en una sola petición HTTP, y `neon-http` manda
 * cada sentencia en una. Cien filas es un lote que viaja sin drama y deja la
 * corrida reanudable con granularidad fina.
 */
export const TAMANO_DE_LOTE = 100;

/** Una fila lista para guardarse. El job la arma; el repositorio no calcula nada. */
export interface VectorParaGuardar {
  fuente: string;
  fuenteId: string;
  modelo: string;
  dimensiones: number;
  vector: readonly number[];
}

/** Lo que el motor lee: el id de origen y su vector. Nunca el texto. */
export interface VectorEmbebido {
  fuenteId: string;
  vector: number[];
}

/** Lo que falta embeber: un id y el texto que lo produce. */
export interface TextoParaEmbeber {
  id: string;
  texto: string;
}

export interface ConsultaDeFaltantes {
  /** El rótulo con el que se van a guardar. Hoy `'dreams'`. */
  fuente: string;
  modelo: string;
  /** Techo de filas. El job lo usa para cortar una corrida larga en tandas. */
  limite?: number | undefined;
}

/**
 * Un texto en blanco no se embebe: no dice nada, y su vector sería ruido con
 * la misma norma 1 que el de una frase.
 */
const TEXTO_NO_VACIO = sql`length(btrim(${dreams.body})) > 0`;

export class AnalisisRepository {
  constructor(private readonly db: Db) {}

  /**
   * Guarda vectores en lote, idempotente.
   *
   * Un `id` que ya tenía vector para este modelo se pisa: recalcular es la
   * operación normal cuando cambia el texto de origen, y fallar ahí obligaría
   * al job a leer antes de escribir. Devuelve cuántas filas escribió el motor.
   */
  async guardarVectores(filas: readonly VectorParaGuardar[]): Promise<number> {
    if (filas.length === 0) return 0;

    let escritas = 0;
    for (let i = 0; i < filas.length; i += TAMANO_DE_LOTE) {
      const lote = filas.slice(i, i + TAMANO_DE_LOTE);
      const guardadas = await this.db
        .insert(analisisVectores)
        .values(
          lote.map((fila) => ({
            fuente: fila.fuente,
            fuenteId: fila.fuenteId,
            modelo: fila.modelo,
            dimensiones: fila.dimensiones,
            vector: [...fila.vector],
          })),
        )
        .onConflictDoUpdate({
          target: [analisisVectores.fuente, analisisVectores.fuenteId, analisisVectores.modelo],
          set: {
            dimensiones: sql`excluded.dimensiones`,
            vector: sql`excluded.vector`,
            creadoEn: sql`now()`,
          },
        })
        .returning({ fuenteId: analisisVectores.fuenteId });
      escritas += guardadas.length;
    }
    return escritas;
  }

  /**
   * **Todos** los vectores de una fuente para un modelo.
   *
   * Es lo que el motor de convergencia carga entero en memoria para calcular el
   * k-NN (§4.4: sin `pgvector`, el coseno corre acá). Con el corpus de hoy eso
   * son kilobytes; el día que sean gigabytes, esta firma es el lugar donde se
   * nota, y ahí se cambia a `vector(1024)` con un índice HNSW.
   *
   * **Y no lleva `limite` a propósito.** Un `LIMIT` acá no protegería nada:
   * cortaría el corpus por la mitad y el motor dibujaría una constelación
   * completa a partir de un corpus incompleto, sin que nada avise. La guarda
   * del conteo de §11 —dibujadas + sin vector = las de la corrida— dejaría de
   * cerrar y nadie se enteraría. Si esta lectura se pone cara, la respuesta es
   * el índice, no truncar en silencio. Lo que sí lleva es techo de tiempo, para
   * que una lectura que se fue de mano muera en el motor y no en una promesa
   * abandonada.
   */
  async vectoresDe(
    fuente: string,
    modelo: string,
    opciones: OpcionesDeLectura = {},
  ): Promise<VectorEmbebido[]> {
    const filas = await correrConTecho(
      this.db,
      opciones,
      this.db
        .select({ fuenteId: analisisVectores.fuenteId, vector: analisisVectores.vector })
        .from(analisisVectores)
        .where(and(eq(analisisVectores.fuente, fuente), eq(analisisVectores.modelo, modelo)))
        .orderBy(analisisVectores.fuenteId),
    );
    return filas.map((fila) => ({ fuenteId: fila.fuenteId, vector: fila.vector }));
  }

  /**
   * Los ids que ya tienen vector, sin traerse los vectores.
   *
   * El job lo usa cuando la fuente es un archivo: para saber qué saltear no
   * necesita los flotantes, y traerlos sería descargar el corpus entero para
   * después tirarlo.
   */
  async idsEmbebidos(fuente: string, modelo: string): Promise<Set<string>> {
    const filas = await this.db
      .select({ fuenteId: analisisVectores.fuenteId })
      .from(analisisVectores)
      .where(and(eq(analisisVectores.fuente, fuente), eq(analisisVectores.modelo, modelo)));
    return new Set(filas.map((fila) => fila.fuenteId));
  }

  /**
   * Lo que falta embeber de `dreams`.
   *
   * **Es el único método que conoce la tabla del texto**, y por eso es el único
   * que la migración a `senales` va a tener que tocar.
   *
   * Se filtra por `status = 'approved'` — el mismo filtro que usan
   * `DreamsRepository.countApproved` y el endpoint del mapa. Embeber una fila
   * rechazada la metería en un núcleo que la página no puede mostrar, y el
   * conteo de la cabecera («entraron tantas, faltan tantas», §3.2 de la spec)
   * dejaría de cerrar.
   *
   * `NOT EXISTS` y no `LEFT JOIN … IS NULL`: con la PK de `analisis_vectores`
   * el planificador corta apenas encuentra la fila, y no hay forma de que un
   * duplicado del lado derecho multiplique el resultado.
   *
   * El cast de `dreams.id` a texto es el precio de que `fuenteId` sirva para
   * cualquier fuente (ver la cabecera del schema). Es un cast por fila sobre
   * una tabla que hoy tiene cero filas reales (`D-002`).
   */
  async faltanPorEmbeber(consulta: ConsultaDeFaltantes): Promise<TextoParaEmbeber[]> {
    const { fuente, modelo, limite } = consulta;

    const yaTiene = this.db
      .select({ uno: sql`1` })
      .from(analisisVectores)
      .where(
        and(
          eq(analisisVectores.fuente, fuente),
          eq(analisisVectores.modelo, modelo),
          eq(analisisVectores.fuenteId, sql`${dreams.id}::text`),
        ),
      );

    const base = this.db
      .select({ id: sql<string>`${dreams.id}::text`, texto: dreams.body })
      .from(dreams)
      .where(and(eq(dreams.status, 'approved'), TEXTO_NO_VACIO, notExists(yaTiene)))
      .orderBy(dreams.id);

    return limite === undefined ? base : base.limit(limite);
  }

  /**
   * La última corrida de una fuente. `null` cuando nunca corrió el job.
   *
   * Es la **única** fuente de frescura de la página (R4). Si esto devuelve
   * `null`, la cabecera no inventa una fecha: dice que el análisis no corrió.
   */
  async ultimaCorrida(fuente: string, opciones: OpcionesDeLectura = {}): Promise<CorridaDeAnalisis | null> {
    const filas = await correrConTecho(
      this.db,
      opciones,
      this.db
        .select()
        .from(analisisCorridas)
        .where(eq(analisisCorridas.fuente, fuente))
        // El desempate por `id` importa: dos corridas pueden compartir `corte`
        // al microsegundo, y sin él «la última» sería la que devuelva el motor.
        .orderBy(desc(analisisCorridas.corte), desc(analisisCorridas.id))
        .limit(1),
    );
    return filas[0] ?? null;
  }

  /** Anota una corrida terminada. La escribe el job y nadie más. */
  async anotarCorrida(corrida: NuevaCorridaDeAnalisis): Promise<CorridaDeAnalisis> {
    const [fila] = await this.db.insert(analisisCorridas).values(corrida).returning();
    if (!fila) throw new Error('No se pudo anotar la corrida del análisis');
    return fila;
  }
}
