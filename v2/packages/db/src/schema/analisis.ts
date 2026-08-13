/**
 * El sustrato de La Radiografía — dónde viven los vectores y la procedencia
 * de cada corrida del análisis.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §4.4 y R4.
 *
 * ## Por qué esto es una tabla aparte y no una columna
 *
 * La spec pensaba en `senales.embedding`. Una columna adentro de la tabla del
 * texto ata dos cosas que cambian a ritmos distintos: el corpus se migra —hoy
 * la fuente es `dreams`, mañana es `senales`— y el vector se recalcula cada vez
 * que cambia el modelo. Con la columna adentro, migrar `dreams` a `senales`
 * obliga a mover los vectores en el mismo movimiento, y cambiar de modelo
 * obliga a un `ALTER TABLE` sobre la tabla más caliente del sistema.
 *
 * Desacoplada, la migración del corpus **no toca esta tabla**: cambia el valor
 * de `fuente`, se corre `pnpm radiografia:embeber` de nuevo, y las dos
 * generaciones conviven mientras dure el pasaje. Y dos modelos conviven sin
 * pisarse, porque `modelo` está en la clave.
 *
 * ## Por qué `jsonb` y no `pgvector`
 *
 * **No está verificado que la extensión `vector` exista en el proyecto Neon**
 * (pregunta 1 de §13 de la spec, todavía abierta). La salida que la propia
 * spec deja escrita en §4.4 es guardar `real[]` y calcular el k-NN afuera del
 * motor, y es la que se toma acá: un `jsonb` con el arreglo de flotantes y el
 * coseno en memoria, que con el corpus de hoy —`D-002`: la base tiene cero
 * señales reales— es indistinguible de un índice HNSW.
 *
 * Cuando el corpus lo justifique, migrar a `vector(1024)` es una migración de
 * una columna en una tabla chica que nadie más lee. Eso es exactamente lo que
 * compra tenerla separada.
 *
 * ## Lo que NO se guarda acá
 *
 * El texto. Un vector no es texto y esta tabla no lo copia: se guarda el `id`
 * de la fila de origen y nada más. Quien quiera la frase la va a buscar a la
 * fuente, donde la gobierna la cesión de licencia (§4.5.4 de la spec). Si el
 * texto estuviera acá, habría una segunda copia sin esa guarda.
 */
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Un vector por (fuente, fila, modelo).
 *
 * `fuenteId` es `text` y no `integer` a propósito: `dreams.id` es un serial,
 * `senales.id` puede no serlo, y una clave que sirve para las dos no puede
 * comprometerse con el tipo de ninguna. El costo es un cast en el join; el
 * beneficio es que la migración de fuente no toca el schema.
 */
export const analisisVectores = pgTable(
  'analisis_vectores',
  {
    /** `'dreams'` hoy, `'senales'` mañana. Nunca una FK: la fuente es un rótulo. */
    fuente: text('fuente').notNull(),
    /** El `id` de la fila de origen, siempre como texto. */
    fuenteId: text('fuente_id').notNull(),
    /** `'bge-m3'`. Entra en la clave: dos modelos conviven sin pisarse. */
    modelo: text('modelo').notNull(),
    dimensiones: integer('dimensiones').notNull(),
    /** `real[]` servido como `jsonb`. El k-NN corre en memoria (ver cabecera). */
    vector: jsonb('vector').$type<number[]>().notNull(),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.fuente, t.fuenteId, t.modelo] }),
    /** La lectura del motor es siempre «todos los de esta fuente con este modelo». */
    index('analisis_vectores_fuente_modelo_idx').on(t.fuente, t.modelo),

    check('analisis_vectores_dimensiones_chk', sql`${t.dimensiones} > 0`),
    /**
     * El constraint que importa: un vector cuya longitud no coincide con lo que
     * la fila declara es un vector de otro modelo entrando con el rótulo
     * equivocado, y el coseno contra él daría un número sin significado. La
     * base lo rechaza antes de que llegue a un gráfico.
     */
    check(
      'analisis_vectores_largo_chk',
      sql`jsonb_typeof(${t.vector}) = 'array' and jsonb_array_length(${t.vector}) = ${t.dimensiones}`,
    ),
  ],
);

/**
 * La procedencia de cada corrida del análisis.
 *
 * Es la **única** fuente de frescura de la página (R4): cuándo se cortó, con
 * qué modelo y cuántas filas entraron. Sin esta tabla la página tendría que
 * inventar un timestamp o adivinar de dónde leyó el job, y las dos cosas son
 * la misma forma de mentir.
 */
export const analisisCorridas = pgTable(
  'analisis_corridas',
  {
    id: serial('id').primaryKey(),
    modelo: text('modelo').notNull(),
    dimensiones: integer('dimensiones').notNull(),
    fuente: text('fuente').notNull(),
    /** Cuántas filas embebió ESTA corrida. No es el total acumulado. */
    procesadas: integer('procesadas').notNull(),
    /**
     * Hasta dónde sabe el análisis. Es el instante en que **arrancó** la
     * corrida, no en el que terminó: una fila escrita mientras el job corría
     * puede no haber entrado, y declarar el final la daría por analizada.
     */
    corte: timestamp('corte', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /** «La última corrida de esta fuente» es la única consulta que hace la página. */
    index('analisis_corridas_fuente_corte_idx').on(t.fuente, t.corte),
    check('analisis_corridas_procesadas_chk', sql`${t.procesadas} >= 0`),
    check('analisis_corridas_dimensiones_chk', sql`${t.dimensiones} > 0`),
  ],
);

export type VectorDeAnalisis = typeof analisisVectores.$inferSelect;
export type NuevoVectorDeAnalisis = typeof analisisVectores.$inferInsert;
export type CorridaDeAnalisis = typeof analisisCorridas.$inferSelect;
export type NuevaCorridaDeAnalisis = typeof analisisCorridas.$inferInsert;
