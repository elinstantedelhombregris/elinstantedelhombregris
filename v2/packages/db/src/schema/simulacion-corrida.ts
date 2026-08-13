/**
 * Lo que se guarda de una corrida: el escenario que se declaró, la función que
 * se corrió, y el resultado reducido.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §3.6 y §3.9.
 *
 * ## Tres tablas y no una, porque son tres ritmos
 *
 * Un **escenario** es una declaración: las variables que alguien puso. Se
 * escribe una vez y se reusa en miles de corridas.
 *
 * Una **función** es una dinámica del modo gente: un elenco corriendo N rondas
 * con una semilla. Existe sólo en modo gente, y es lo que las señales
 * ensayadas referencian.
 *
 * Una **corrida** es el resultado **reducido** de un punto del diseño. Reducido
 * no es un ahorro: es una decisión medida. Reteniendo 1.000 `ResultadoSimulacion`
 * completos con 24 provincias son 27,38 MB; los mismos mil reducidos a cinco
 * escalares son 0,18 MB — factor ×148, y a nivel municipio el completo escala a
 * gigas dentro de una pestaña. El retrato completo se rehidrata bajo demanda
 * para la única corrida que alguien abre, y recalcularlo cuesta 0,0082 ms:
 * menos que guardarlo.
 *
 * ## Por qué la mayoría de las corridas de un barrido NO llegan acá
 *
 * Un barrido son miles de puntos y vive en el worker del navegador. Esta tabla
 * guarda las que alguien decidió conservar: la que citó, la que compartió, la
 * que va a comparar mañana. Una tabla que guarda todo lo que un bucle produjo
 * no es un archivo, es un vertedero.
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { simElencos } from './simulacion-elenco';
import { enLista, MODOS, simulacion } from './simulacion-esquema';

/**
 * Un escenario declarado, direccionado por su contenido.
 *
 * La huella es sha-256 del objeto canónico `{ paisHuella, forma, ajustes,
 * mecanismo, ahora }`. Dos personas que declaran lo mismo obtienen la misma
 * huella y comparten la fila: es lo que hace que compartir un escenario por URL
 * y guardarlo sean la misma cosa.
 *
 * **`ahora` es una columna y no un `now()`.** Es el instante congelado del
 * país medido, y es el arreglo del §1.5 de la spec convertido en esquema: hoy
 * `useModoSimulacion.tsx:62` lee `Date.now()` adentro de un `useMemo` que
 * depende de las palancas, y medí que **un milisegundo** de avance del reloj
 * voltea el mandato del silencio (alcance 0,0000 → 1,0000). Un escenario cuyo
 * reloj no está escrito no es reproducible, y una corrida no reproducible no
 * se puede comparar con la de ayer. Por eso `ahora` viaja adentro de la huella.
 */
export const simEscenarios = simulacion.table(
  'escenarios',
  {
    huella: text('huella').primaryKey(),

    /** sha-256 del país medido: territorios, poblaciones y voces base. */
    paisHuella: text('pais_huella').notNull(),

    /** Epoch ms. El reloj entra por parámetro y queda escrito (ver cabecera). */
    ahora: bigint('ahora', { mode: 'number' }).notNull(),

    /** Participación, dispersión, constancia, composición. Lo que el modo forma declara. */
    forma: jsonb('forma').$type<Record<string, unknown>>().notNull(),
    /** Horizonte, resistencia, cumplimiento. Los dos modos los obedecen igual. */
    ajustes: jsonb('ajustes').$type<Record<string, unknown>>().notNull(),
    /** Chispa, contagio, desaliento, grado. `null` en modo forma: no hay dónde ponerlos. */
    mecanismo: jsonb('mecanismo').$type<Record<string, unknown>>(),
    /** Los coeficientes vigentes en esta corrida. Decisiones nuestras, no de la gente. */
    coeficientes: jsonb('coeficientes').$type<Record<string, unknown>>().notNull(),

    /** La razón escrita del diseño. Un rango sin razón es un número inventado (§3.6). */
    razon: text('razon').notNull(),

    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('sim_escenarios_huella_chk', sql`length(${t.huella}) >= 16`),
    check('sim_escenarios_ahora_chk', sql`${t.ahora} > 0`),
    check('sim_escenarios_razon_chk', sql`length(${t.razon}) > 0`),
  ],
);

/**
 * Una función: el elenco corriendo, sembrado, sin modelo adentro del bucle.
 *
 * Se llama función y no «simulación de agentes» porque eso es lo que es: una
 * función pura de `(escenario, elenco, semilla) → cosecha`. El modelo ya corrió
 * antes, cuando escribió el elenco; acá no se lo llama ni una vez. Ésa es la
 * decisión del §2.5 y es lo que hace que un barrido sea posible.
 *
 * `rondas` es el número de períodos del horizonte, y hay una guarda en
 * `civic-core` que afirma `rondas === periodosDelHorizonte(ajustes.horizonte)`:
 * es lo único que hace comparables los dos modos.
 */
export const simFunciones = simulacion.table(
  'funciones',
  {
    /** sha-256 de `{ escenarioHuella, elencoHuella, semilla, rondas, guion }`. */
    id: text('id').primaryKey(),

    escenarioHuella: text('escenario_huella')
      .notNull()
      .references(() => simEscenarios.huella, { onDelete: 'cascade' }),
    elencoHuella: text('elenco_huella')
      .notNull()
      .references(() => simElencos.huella, { onDelete: 'restrict' }),

    semilla: integer('semilla').notNull(),
    rondas: integer('rondas').notNull(),

    /**
     * Los eventos programados que se inyectan «desde la vista de dios» (§4.3).
     * `null` cuando no hay guion. Que esté escrito y sembrado es lo que hace
     * que inyectar una variable NO rompa la reproducibilidad — el defecto
     * exacto que `scheduled_events` de MiroFish tiene, donde el guion se genera
     * y no lo lee nadie.
     */
    guion: jsonb('guion').$type<Record<string, unknown>[]>(),

    corridaEn: timestamp('corrida_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('sim_funciones_escenario_idx').on(t.escenarioHuella),
    index('sim_funciones_elenco_idx').on(t.elencoHuella),
    check('sim_funciones_rondas_chk', sql`${t.rondas} > 0`),
    check('sim_funciones_guion_chk', sql`${t.guion} is null or jsonb_typeof(${t.guion}) = 'array'`),
  ],
);

/**
 * El resultado reducido de un punto del diseño.
 *
 * ## El CHECK que es la regla 6 hecha esquema
 *
 * `sello` es el `SelloDelModelo` —modelo, digest, temperatura, huella de la
 * población, semilla, cuándo— y es **NOT NULL exactamente cuando el modo es
 * `gente`, y NULL exactamente cuando es `forma`**. No se inventa uno.
 *
 * Eso no es prolijidad: una corrida del modo forma que llevara sello se leería
 * como hipótesis de un modelo que nunca corrió, y una del modo gente sin sello
 * se leería como dato declarado por una persona. Las dos son la misma mentira
 * en direcciones opuestas, y las dos las rechaza el motor. Lo mismo con
 * `funcion_id`: sin función no hubo gente.
 *
 * `mandatos` es la lista de territorios que ganaron mandato. En memoria es un
 * `Uint8Array` —un bitset, que es lo que se transfiere desde el worker sin
 * serializar Maps—; en el archivo son los nombres, porque un archivo que no se
 * puede consultar es un archivo binario, no una tabla.
 */
export const simCorridas = simulacion.table(
  'corridas',
  {
    id: serial('id').primaryKey(),

    escenarioHuella: text('escenario_huella')
      .notNull()
      .references(() => simEscenarios.huella, { onDelete: 'cascade' }),
    /** Se copia del escenario para que la corrida se pueda leer sin join. */
    paisHuella: text('pais_huella').notNull(),

    modo: text('modo').notNull(),
    semilla: integer('semilla').notNull(),

    funcionId: text('funcion_id').references(() => simFunciones.id, { onDelete: 'cascade' }),
    sello: jsonb('sello').$type<Record<string, unknown>>(),

    /** Si esta corrida se puede volver a producir bit a bit. Se declara, no se supone. */
    reproducible: boolean('reproducible').notNull(),

    /** Las cinco Magnitudes, cada una con su procedencia. Nunca un número pelado. */
    resumen: jsonb('resumen').$type<Record<string, unknown>>().notNull(),
    /** La forma que se pidió. */
    pedido: jsonb('pedido').$type<Record<string, unknown>>().notNull(),
    /** La forma que salió, vía `medirForma()`. En modo forma coinciden, y se muestra. */
    logrado: jsonb('logrado').$type<Record<string, unknown>>().notNull(),
    /** Cobertura y sesgo. Regla 5: obligatoria en toda síntesis, también acá. */
    cobertura: jsonb('cobertura').$type<Record<string, unknown>>().notNull(),

    /** Los territorios con mandato, por nombre canónico. Ver cabecera. */
    mandatos: jsonb('mandatos').$type<string[]>().notNull(),
    /** sha-256 de la cosecha, para rehidratar el retrato bajo demanda. */
    cosechaHuella: text('cosecha_huella').notNull(),

    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /** El mismo punto del diseño no se guarda dos veces. */
    uniqueIndex('sim_corridas_punto_uidx').on(t.escenarioHuella, t.modo, t.semilla, t.cosechaHuella),
    index('sim_corridas_funcion_idx').on(t.funcionId),

    check('sim_corridas_modo_chk', enLista(t.modo, MODOS)),
    check('sim_corridas_mandatos_chk', sql`jsonb_typeof(${t.mandatos}) = 'array'`),
    /**
     * La regla 6, hecha imposible de violar por descuido: el sello y la función
     * existen si y sólo si hubo gente. Ver la cabecera de esta tabla.
     */
    check(
      'sim_corridas_sello_solo_en_gente_chk',
      sql`(${t.modo} = 'gente' and ${t.sello} is not null and ${t.funcionId} is not null)
          or (${t.modo} = 'forma' and ${t.sello} is null and ${t.funcionId} is null)`,
    ),
  ],
);

export type EscenarioGuardado = typeof simEscenarios.$inferSelect;
export type NuevoEscenario = typeof simEscenarios.$inferInsert;
export type FuncionGuardada = typeof simFunciones.$inferSelect;
export type NuevaFuncion = typeof simFunciones.$inferInsert;
export type CorridaGuardada = typeof simCorridas.$inferSelect;
export type NuevaCorrida = typeof simCorridas.$inferInsert;
