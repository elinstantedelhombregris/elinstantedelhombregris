/**
 * Lo que el ensayo emite: señales que nadie dijo, y el rastro de quién las movió.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §3.9 y §7.1.
 *
 * ## Los nombres terminan en `_ensayadas` a propósito
 *
 * No es un prefijo decorativo: es la primera de las tres reglas de aislamiento
 * (`simulacion-esquema.ts`). Si esta tabla se llamara `senales`, entonces el día
 * que exista `public.senales` una consulta sin calificar resolvería por
 * `search_path` y podría alcanzar una fila sintética **sin dar error**. Con
 * nombres que no colisionan, esa consulta no encuentra nada que resolver y
 * revienta. La guarda afirma que ningún nombre se repite entre los dos
 * esquemas.
 *
 * ## La regla que gobierna las columnas
 *
 * *Todo campo que la ingesta real exige, el generador lo produce; y todo campo
 * que la ingesta real deriva, el generador lo deriva con la misma función* —
 * `claseDe`, `techoDeTipo`, `permisoEfectivo`, `publicLocation`,
 * `habitantesDeCelda`, la tabla de relojes por tipo.
 *
 * Cualquier campo que el generador llene con una constante es una dimensión que
 * el análisis de sensibilidad va a reportar como insensible, y va a tener razón
 * y no servir para nada. Por eso las dos que casi siempre se falsean están acá
 * como palanca declarada y no como default:
 *
 * - **`persona_id` es nullable a propósito.** Un generador que siempre asigna
 *   actor no puede reproducir el estado de celda `sin_actor_conocido`, y hace
 *   que **todo barrido sea sistemáticamente optimista sobre la nitidez**.
 * - **`estado` no tiene default.** Un corpus sintético todo en `enviada` deja
 *   la nitidez del país en `inaplicable`; todo en `corroborada` dibuja un país
 *   verificado. La distribución de estados es una entrada del diseño.
 *
 * ## El tiempo es del modelo, no del reloj
 *
 * `creada_en_ms`, `vence_el_ms`, `caduca_el_ms` y `comprometido_para_ms` son
 * epoch en milisegundos y **no** `timestamptz`: son instantes del país
 * simulado, que empieza cuando el escenario dice que empieza. Un `default now()`
 * ahí sería el reloj de la máquina metiéndose en una función pura, que es
 * exactamente el defecto del §1.5 de la spec.
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  check,
  foreignKey,
  index,
  integer,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { simFunciones } from './simulacion-corrida';
import { simPersonas } from './simulacion-elenco';
import {
  DESENLACES,
  enLista,
  ESTADOS_DE_DIRECCION,
  ESTADOS_ENSAYADOS,
  ORIGENES_DE_TEMA,
  paresDeTipoYClase,
  PRECISIONES,
  ROLES_DE_UBICACION,
  SENSIBILIDADES,
  simulacion,
  TIPOS_CON_ALTURA,
} from './simulacion-esquema';

/** Una señal que emitió una persona que no existe. */
export const simSenalesEnsayadas = simulacion.table(
  'senales_ensayadas',
  {
    funcionId: text('funcion_id')
      .notNull()
      .references(() => simFunciones.id, { onDelete: 'cascade' }),
    /** Local a la función, y correlativo. No hay `id_publico`: esto no se publica. */
    id: integer('id').notNull(),

    /**
     * Quién la emitió, o `null` cuando la señal no tiene actor conocido (ver
     * cabecera).
     *
     * **No lleva FK a `personas`, y eso es una deuda declarada, no un olvido.**
     * La clave de una persona es `(elenco_huella, id)`, y una señal sólo conoce
     * su `funcion_id`; para referenciarla habría que copiar `elenco_huella` en
     * cada una de las cientos de miles de filas que emite una corrida. Se
     * eligió el gasto de integridad y no el de espacio, porque estas filas se
     * escriben de a lotes en una sola sentencia y se tiran enteras. Lo mismo
     * vale para `persona_id` en adhesiones, confirmaciones y rastro.
     */
    personaId: integer('persona_id'),
    /** La ronda en que se emitió. Una ronda es un período (§3.2). */
    ronda: integer('ronda').notNull(),

    tipo: text('tipo').notNull(),
    /** Derivada de `tipo` con `claseDe`. Denormalizada, y con CHECK de coherencia. */
    clase: text('clase').notNull(),
    estado: text('estado').notNull(),

    tema: text('tema'),
    /**
     * `sugerido` es lo único que una máquina puede escribir. Es la regla 6 en el
     * único campo de contenido que un modelo toca: el tipo, la clase y el estado
     * los asigna la regla del generador y la semilla, nunca el modelo.
     */
    temaOrigen: text('tema_origen').notNull(),

    provinciaId: integer('provincia_id').notNull(),
    departamentoId: integer('departamento_id'),
    localidadId: integer('localidad_id'),
    celdaId: text('celda_id').notNull(),

    /** El punto **publicado**, ya engrosado. El crudo no existe: nadie lo capturó. */
    precision: text('precision').notNull(),
    locationRole: text('location_role').notNull(),
    sensitivity: text('sensitivity').notNull(),

    direccionEstado: text('direccion_estado').notNull(),
    /** Sólo los cuatro tipos de techo `completa` la llevan. Hay CHECK. */
    altura: integer('altura'),

    creadaEnMs: bigint('creada_en_ms', { mode: 'number' }).notNull(),
    venceElMs: bigint('vence_el_ms', { mode: 'number' }),
    caducaElMs: bigint('caduca_el_ms', { mode: 'number' }),
    /** Sólo un acto lo tiene, y siempre lo tiene. */
    comprometidoParaMs: bigint('comprometido_para_ms', { mode: 'number' }),
    desenlace: text('desenlace'),

    /** Retenida por revisión. Sin retenciones, el ensayo no puede proyectar «sin exponer». */
    retenidaEnMs: bigint('retenida_en_ms', { mode: 'number' }),
  },
  (t) => [
    primaryKey({ columns: [t.funcionId, t.id] }),
    index('sim_senales_provincia_idx').on(t.funcionId, t.provinciaId, t.ronda),
    index('sim_senales_clase_idx').on(t.funcionId, t.clase),

    check('sim_senales_ronda_chk', sql`${t.ronda} >= 1`),
    check('sim_senales_provincia_chk', sql`${t.provinciaId} > 0`),
    check('sim_senales_estado_chk', enLista(t.estado, ESTADOS_ENSAYADOS)),
    check('sim_senales_tema_origen_chk', enLista(t.temaOrigen, ORIGENES_DE_TEMA)),
    check('sim_senales_precision_chk', enLista(t.precision, PRECISIONES)),
    check('sim_senales_rol_chk', enLista(t.locationRole, ROLES_DE_UBICACION)),
    check('sim_senales_sensibilidad_chk', enLista(t.sensitivity, SENSIBILIDADES)),
    check('sim_senales_direccion_chk', enLista(t.direccionEstado, ESTADOS_DE_DIRECCION)),

    /** La clase se deriva del tipo. Un `sueño` marcado `hecho` no entra (regla 11). */
    check('sim_senales_tipo_clase_chk', paresDeTipoYClase(t.tipo, t.clase)),

    /** Sólo un hecho o un acto se corroboran. La otra mitad se delibera (regla 11). */
    check(
      'sim_senales_corroborada_solo_verificable_chk',
      sql`${t.estado} <> 'corroborada' or ${t.clase} in ('hecho', 'acto')`,
    ),

    /** El techo de dirección por tipo, copiado de `TECHO_POR_TIPO`. */
    check(
      'sim_senales_altura_por_tipo_chk',
      sql`${t.altura} is null or ${enLista(t.tipo, TIPOS_CON_ALTURA)}`,
    ),

    /**
     * Lo que trata de una persona y puede hacerle daño no lleva dirección. Es
     * la política de ubicación, hecha motor y no convención del generador.
     */
    check(
      'sim_senales_sujeto_sensible_sin_direccion_chk',
      sql`not (${t.locationRole} = 'subject' and ${t.sensitivity} = 'high')
          or ${t.direccionEstado} = 'sin_direccion'`,
    ),

    /** Un tema y su origen son la misma afirmación dicha dos veces: no pueden discrepar. */
    check(
      'sim_senales_tema_invariante_chk',
      sql`(${t.tema} is null) = (${t.temaOrigen} = 'ninguno')`,
    ),

    /** Un acto tiene fecha y desenlace; lo que no es acto, no. */
    check(
      'sim_senales_acto_chk',
      sql`(${t.clase} = 'acto') = (${t.comprometidoParaMs} is not null)
          and (${t.clase} = 'acto') = (${t.desenlace} is not null)`,
    ),
    check('sim_senales_desenlace_chk', sql`${t.desenlace} is null or ${enLista(t.desenlace, DESENLACES)}`),
  ],
);

/**
 * Una adhesión: una persona apoya una señal, una sola vez.
 *
 * La clave primaria es la que hace cumplir «una vez»: el brillo cuenta
 * **personas distintas**, no filas (regla 8), y un contador guardado en la fila
 * de la señal sería el antipatrón que `mandate_suggestions.support_count` ya
 * tiene y que la spec B §2.8 rechazó por escrito. Acá el conteo se deriva de
 * las aristas o no existe.
 */
export const simAdhesionesEnsayadas = simulacion.table(
  'adhesiones_ensayadas',
  {
    funcionId: text('funcion_id').notNull(),
    senalId: integer('senal_id').notNull(),
    personaId: integer('persona_id').notNull(),
    ronda: integer('ronda').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.funcionId, t.senalId, t.personaId] }),
    foreignKey({
      columns: [t.funcionId, t.senalId],
      foreignColumns: [simSenalesEnsayadas.funcionId, simSenalesEnsayadas.id],
      name: 'sim_adhesiones_senal_fk',
    }).onDelete('cascade'),
    check('sim_adhesiones_ronda_chk', sql`${t.ronda} >= 1`),
  ],
);

/**
 * Una corroboración, con su ronda.
 *
 * `cuenta` distingue la confirmación que suma para el umbral de la que no —la
 * de alguien que no cumple la regla de independencia—. Guardar sólo las que
 * cuentan borraría el intento, y el intento es dato: es la diferencia entre
 * «nadie miró» y «miraron y no valía».
 */
export const simConfirmacionesEnsayadas = simulacion.table(
  'confirmaciones_ensayadas',
  {
    funcionId: text('funcion_id').notNull(),
    senalId: integer('senal_id').notNull(),
    ronda: integer('ronda').notNull(),
    personaId: integer('persona_id').notNull(),
    veredicto: text('veredicto').notNull(),
    cuenta: boolean('cuenta').notNull(),
  },
  (t) => [
    /** El constraint del canon, copiado: una persona confirma una vez por ronda. */
    primaryKey({
      name: 'confirmacion_actor_distinto',
      columns: [t.funcionId, t.senalId, t.ronda, t.personaId],
    }),
    foreignKey({
      columns: [t.funcionId, t.senalId],
      foreignColumns: [simSenalesEnsayadas.funcionId, simSenalesEnsayadas.id],
      name: 'sim_confirmaciones_senal_fk',
    }).onDelete('cascade'),
    check('sim_confirmaciones_ronda_chk', sql`${t.ronda} >= 1`),
    check('sim_confirmaciones_veredicto_chk', enLista(t.veredicto, ['confirma', 'desmiente', 'no_sabe'])),
  ],
);

/**
 * El rastro de la función: qué pasó, en qué ronda, y quién lo movió.
 *
 * Se llama `rastro_funcion` y **no** `memoria`, y la diferencia no es de estilo.
 * MiroFish llama «memoria de largo plazo dinámica» a un hilo de fondo que sube
 * lotes a Zep y que los agentes nunca leen durante la corrida — y que viene
 * apagado por defecto. Acá pasa lo mismo y se lo dice: ningún paso de la
 * dinámica lee esta tabla. Es el rastro de la corrida, que es lo que es.
 *
 * ## Los dos CHECK que son la regla 6, copiados del canon
 *
 * `actor_clase in ('maquina')` — **no existe el valor `'ia'`**, y acá no existe
 * `'persona'` tampoco: en el ensayo no hay personas, hay una función. Y una
 * sugerencia automática es **estructuralmente incapaz** de mover un estado: el
 * CHECK obliga `estado_nuevo is null`. No es buena voluntad del código, es el
 * motor.
 */
export const simRastroFuncion = simulacion.table(
  'rastro_funcion',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    funcionId: text('funcion_id')
      .notNull()
      .references(() => simFunciones.id, { onDelete: 'cascade' }),
    ronda: integer('ronda').notNull(),
    senalId: integer('senal_id'),
    personaId: integer('persona_id'),
    actorClase: text('actor_clase').notNull(),
    tipoEvento: text('tipo_evento').notNull(),
    estadoNuevo: text('estado_nuevo'),
  },
  (t) => [
    index('sim_rastro_funcion_idx').on(t.funcionId, t.ronda),
    check('sim_rastro_ronda_chk', sql`${t.ronda} >= 1`),
    check('sim_rastro_actor_clase_chk', enLista(t.actorClase, ['maquina'])),
    check(
      'rastro_sugerencia_no_mueve_estado_check',
      sql`${t.tipoEvento} <> 'sugerencia_automatica' or ${t.estadoNuevo} is null`,
    ),
    check(
      'sim_rastro_estado_nuevo_chk',
      sql`${t.estadoNuevo} is null or ${enLista(t.estadoNuevo, ESTADOS_ENSAYADOS)}`,
    ),
  ],
);

/**
 * Una entrevista a una persona sintética: por qué hizo lo que hizo.
 *
 * Es la mejor idea de MiroFish (`interview_record=False`) y la más fácil de
 * perder: **preguntarle a un agente no puede cambiar lo que el agente es.** Si
 * la entrevista escribiera en el estado de la persona, cada pregunta alteraría
 * la corrida que estás tratando de entender, y dos personas mirando el mismo
 * resultado verían cosas distintas.
 *
 * Acá no hace falta un flag: la función ya terminó, sus filas son inmutables, y
 * **ningún paso de la dinámica lee esta tabla**. No hay dónde escribir aunque
 * quisiera.
 *
 * `descartada_en` es la única columna que se actualiza, y es el affordance de
 * revertir: la spec B §2.11 da el criterio en una línea — *la diferencia entre
 * la IA sugiere y la IA determina es, literalmente, que la sugerencia se pueda
 * revertir*. Una respuesta que no se puede descartar dejó de ser una sugerencia.
 */
export const simEntrevistas = simulacion.table(
  'entrevistas',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    funcionId: text('funcion_id')
      .notNull()
      .references(() => simFunciones.id, { onDelete: 'cascade' }),
    elencoHuella: text('elenco_huella').notNull(),
    personaId: integer('persona_id').notNull(),
    pregunta: text('pregunta').notNull(),
    respuesta: text('respuesta').notNull(),
    /** El sello del modelo que contestó. Sin sello no hay entrevista. */
    sello: text('sello').notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    descartadaEn: timestamp('descartada_en', { withTimezone: true }),
  },
  (t) => [
    index('sim_entrevistas_funcion_idx').on(t.funcionId),
    foreignKey({
      columns: [t.elencoHuella, t.personaId],
      foreignColumns: [simPersonas.elencoHuella, simPersonas.id],
      name: 'sim_entrevistas_persona_fk',
    }).onDelete('cascade'),
    check('sim_entrevistas_pregunta_chk', sql`length(${t.pregunta}) > 0`),
    check('sim_entrevistas_sello_chk', sql`length(${t.sello}) > 0`),
  ],
);

export type SenalEnsayada = typeof simSenalesEnsayadas.$inferSelect;
export type NuevaSenalEnsayada = typeof simSenalesEnsayadas.$inferInsert;
export type AdhesionEnsayada = typeof simAdhesionesEnsayadas.$inferSelect;
export type NuevaAdhesionEnsayada = typeof simAdhesionesEnsayadas.$inferInsert;
export type ConfirmacionEnsayada = typeof simConfirmacionesEnsayadas.$inferSelect;
export type NuevaConfirmacionEnsayada = typeof simConfirmacionesEnsayadas.$inferInsert;
export type EventoDeRastro = typeof simRastroFuncion.$inferSelect;
export type NuevoEventoDeRastro = typeof simRastroFuncion.$inferInsert;
export type Entrevista = typeof simEntrevistas.$inferSelect;
export type NuevaEntrevista = typeof simEntrevistas.$inferInsert;
