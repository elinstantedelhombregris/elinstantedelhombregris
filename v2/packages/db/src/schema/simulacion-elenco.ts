/**
 * El elenco: la población congelada, con su huella.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §3.8 y §3.9.
 *
 * ## Por qué la huella es la clave primaria
 *
 * Un elenco es **contenido**, no un evento. La misma semilla contra el mismo
 * corpus con el mismo modelo produce la misma gente, y guardar eso dos veces
 * con dos ids distintos es tener dos verdades. La huella —sha-256 del
 * manifiesto canónico— es lo que hace que insertar de nuevo sea idempotente y
 * que dos máquinas que generaron lo mismo lo puedan reconocer.
 *
 * Y es el número que ataja el error central del §1.2 de la spec: si la
 * población se regenerara en cada corrida de un barrido, estarías midiendo la
 * varianza del modelo y creyendo que medís la palanca. **No da error y devuelve
 * números plausibles.** La única defensa es que la huella viaje con cada
 * resultado y que una guarda afirme que todas las corridas de un barrido
 * comparten la misma.
 *
 * ## Por qué el sesgo es NOT NULL
 *
 * Regla 5 de la Constitución: participación ≠ representatividad, y toda
 * síntesis muestra cobertura y sesgo. Una población generada por un modelo
 * tiene el sesgo del corpus con el que se la sembró —los PLANes, los ensayos,
 * el blog: una voz, un movimiento— y ese sesgo es una salida de primera clase,
 * no una nota al pie. Un elenco sin sesgo declarado no se puede insertar.
 *
 * ## Qué NO vive acá
 *
 * El texto pesado. La `Semblanza` completa —~1,9 KB por persona— va en disco
 * (`content/elencos/<huella>/`) en shards pedidos bajo demanda, porque la
 * dinámica no lee texto: lee cuatro números. Acá queda lo que hace falta para
 * mirar a una persona en la ficha, y las frases van en su propia tabla porque
 * son de largo variable y nadie las lee al listar.
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { CLASES_ENSAYADAS, enLista, RADIOS_DE_ATENCION, simulacion, TIPOS_ENSAYADOS } from './simulacion-esquema';

/**
 * Un elenco congelado. Una fila por población, y la fila **es** el sello.
 *
 * `modelo`, `digest` y `temperatura` son la D5 de la ADR 0009: dos corridas de
 * modelos distintos lo dicen en vez de esconderlo. `fabricado` distingue el
 * elenco que arma un `EscritorFalso` determinista —el que corre en CI, sin
 * Ollama— del que salió de un modelo: los dos son hipótesis, pero sólo uno
 * tiene un modelo del que hablar, y confundirlos sería atribuirle a una tabla
 * de constantes la autoridad de un modelo.
 */
export const simElencos = simulacion.table(
  'elencos',
  {
    /** sha-256 del manifiesto canónico. Contenido-direccionada: insertar dos veces no duplica. */
    huella: text('huella').primaryKey(),

    /** `'llama3.1:8b-instruct-q4_K_M'`, o `'fabricado'` cuando no hubo modelo. */
    modelo: text('modelo').notNull(),
    digest: text('digest').notNull(),
    temperatura: doublePrecision('temperatura').notNull(),
    /** La semilla del PRNG. Sin esto no hay reproducibilidad y no hay sensibilidad. */
    semilla: integer('semilla').notNull(),

    /** sha-256 del corpus semilla. Cambia el corpus, cambia la gente, y se ve. */
    corpusHuella: text('corpus_huella').notNull(),
    /** Cuántas personas. Es el N de todas las cuentas que salgan de acá. */
    personas: integer('personas').notNull(),

    /**
     * El sesgo declarado de la población: cobertura por provincia, por oficio,
     * por tramo de edad, y lo que el corpus sobrerrepresenta. Regla 5.
     */
    sesgo: jsonb('sesgo').$type<Record<string, unknown>>().notNull(),

    /** Sin modelo detrás: lo arma una función determinista. Nunca se dibuja como si fuera gente. */
    fabricado: boolean('fabricado').notNull(),

    generadaEn: timestamp('generada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('sim_elencos_personas_chk', sql`${t.personas} > 0`),
    check('sim_elencos_temperatura_chk', sql`${t.temperatura} >= 0`),
    check('sim_elencos_huella_chk', sql`length(${t.huella}) >= 16`),
    /**
     * Un elenco fabricado no puede pretender un digest de modelo, y uno de
     * modelo no puede dejarlo vacío. Es la regla 6 en su forma más chica: la
     * autoridad de una fila no es un adjetivo, es una columna que el motor
     * exige.
     */
    check(
      'sim_elencos_digest_chk',
      sql`(${t.fabricado} and ${t.digest} = '') or (not ${t.fabricado} and length(${t.digest}) > 0)`,
    ),
  ],
);

/**
 * Una persona sintética.
 *
 * `id` es local al elenco (empieza en 0 y es el índice del `conducta.bin`), no
 * un serial global: así el archivo en disco y la fila en la base se apuntan sin
 * una tabla de traducción.
 *
 * **Los ids territoriales son enteros pelados, sin FK a `public`.** Es la regla
 * 2 del aislamiento (ver `simulacion-esquema.ts`) y cuesta la integridad
 * referencial: una persona puede quedar apuntando a una provincia que se
 * renumeró. Se paga con gusto — la alternativa es que `drop schema simulacion
 * cascade` dependa del permiso de una tabla real, y ahí el borde deja de ser un
 * borde.
 */
export const simPersonas = simulacion.table(
  'personas',
  {
    elencoHuella: text('elenco_huella')
      .notNull()
      .references(() => simElencos.huella, { onDelete: 'cascade' }),
    id: integer('id').notNull(),

    /**
     * De qué documento del corpus salió. Es el `source_entity_uuid` de MiroFish
     * hecho honesto: no un uuid opaco de un grafo ajeno, sino el archivo, el
     * ancla adentro del archivo, y el sha del archivo el día que se leyó.
     */
    origenDocumento: text('origen_documento').notNull(),
    origenAncla: text('origen_ancla').notNull(),
    origenSha: text('origen_sha').notNull(),

    provinciaId: integer('provincia_id').notNull(),
    departamentoId: integer('departamento_id'),
    localidadId: integer('localidad_id'),
    celdaId: text('celda_id').notNull(),

    /** Los cuatro números que la dinámica lee, y nada más (§3.8). */
    propension: doublePrecision('propension').notNull(),
    constanciaPersonal: doublePrecision('constancia_personal').notNull(),
    umbralAdhesion: doublePrecision('umbral_adhesion').notNull(),
    umbralCorroboracion: doublePrecision('umbral_corroboracion').notNull(),
    radioAtencion: text('radio_atencion').notNull(),
    /** `Record<TipoSenal, number>`, suma 1. Qué tiende a decir esta persona. */
    mezclaTipos: jsonb('mezcla_tipos').$type<Record<string, number>>().notNull(),
    /** Índices de otras personas del mismo elenco. El contagio corre por acá. */
    vinculos: jsonb('vinculos').$type<number[]>().notNull(),

    /** La textura que la dinámica NO toca. El texto largo vive en disco. */
    oficio: text('oficio').notNull(),
    tramoEdad: text('tramo_edad').notNull(),
    arraigoAnios: integer('arraigo_anios').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.elencoHuella, t.id] }),
    index('sim_personas_provincia_idx').on(t.elencoHuella, t.provinciaId),

    check('sim_personas_id_chk', sql`${t.id} >= 0`),
    check('sim_personas_provincia_chk', sql`${t.provinciaId} > 0`),
    check('sim_personas_arraigo_chk', sql`${t.arraigoAnios} >= 0`),
    check('sim_personas_radio_chk', enLista(t.radioAtencion, RADIOS_DE_ATENCION)),
    /**
     * Los dominios son los que el motor clampea (§3.6). Muestrear afuera es
     * muestrear el mismo punto muchas veces y bajar la varianza artificialmente,
     * así que el borde de la base es el mismo que el borde del cálculo.
     */
    check(
      'sim_personas_dominios_chk',
      sql`${t.propension} between 0 and 1 and ${t.constanciaPersonal} between 0 and 1
          and ${t.umbralAdhesion} between 0 and 1 and ${t.umbralCorroboracion} between 0 and 1`,
    ),
    check('sim_personas_vinculos_chk', sql`jsonb_typeof(${t.vinculos}) = 'array'`),
    check('sim_personas_mezcla_chk', sql`jsonb_typeof(${t.mezclaTipos}) = 'object'`),
  ],
);

/**
 * Las frases que una persona podría decir, generadas con ella y congeladas con ella.
 *
 * Tabla aparte porque son de largo variable y nadie las lee al listar el
 * elenco: la ficha de una persona las pide, el barrido no las toca nunca.
 */
export const simFrases = simulacion.table(
  'frases',
  {
    elencoHuella: text('elenco_huella').notNull(),
    personaId: integer('persona_id').notNull(),
    orden: integer('orden').notNull(),
    tipo: text('tipo').notNull(),
    clase: text('clase').notNull(),
    texto: text('texto').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.elencoHuella, t.personaId, t.orden] }),
    foreignKey({
      columns: [t.elencoHuella, t.personaId],
      foreignColumns: [simPersonas.elencoHuella, simPersonas.id],
      name: 'sim_frases_persona_fk',
    }).onDelete('cascade'),
    check('sim_frases_orden_chk', sql`${t.orden} >= 0`),
    check('sim_frases_tipo_chk', enLista(t.tipo, TIPOS_ENSAYADOS)),
    check('sim_frases_clase_chk', enLista(t.clase, CLASES_ENSAYADAS)),
    check('sim_frases_texto_chk', sql`length(${t.texto}) > 0`),
  ],
);

export type ElencoCongelado = typeof simElencos.$inferSelect;
export type NuevoElenco = typeof simElencos.$inferInsert;
export type PersonaSintetica = typeof simPersonas.$inferSelect;
export type NuevaPersona = typeof simPersonas.$inferInsert;
export type FraseSintetica = typeof simFrases.$inferSelect;
export type NuevaFrase = typeof simFrases.$inferInsert;
