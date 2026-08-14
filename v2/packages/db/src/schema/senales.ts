/**
 * `senales` — **una sola tabla para todo lo que alguien dice del país.**
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §2.7 y §3.3; las columnas de
 * dirección en `_geo-columns.ts` y sus nueve CHECK en `_senales-direccion.ts`,
 * los dos de `2026-08-11-a-la-tierra.md` §3.4.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 11.
 *
 * Las cuatro tablas viejas de señal tenían cero filas: no hay migración de
 * datos y no iba a haber otro momento más barato. Las «capas» dejan de existir
 * —la capa era la tabla— y la agrupación pasa a ser la **clase**.
 *
 * `clase` está desnormalizada acá para que los CHECK la vean sin un join, y las
 * dos **FK compuestas** —`(tipo, clase)` contra `tipos_senal` y `(estado, clase)`
 * contra `estados_senal`— la atornillan: insertar `('sueño','hecho')` es
 * imposible porque esa fila del catálogo no existe. Es la regla 11 escrita en
 * Postgres. No hay CHECK de enum paralelo sobre `estado`: las FK compuestas
 * dicen lo mismo con más precisión y sin el agujero de `NULL or false`.
 *
 * ── Lo que NO está, y es a propósito ───────────────────────────────────────
 *
 * - **Columna de moderación.** `dreams.status` era `approved` por default:
 *   moderación que no existía. El predicado de publicabilidad pasa a ser
 *   `estado <> 'retirada' and retenida_en is null`.
 * - **`senal_estado_historia`.** La bitácora es `rastro_senal` (spec C),
 *   verificable desde afuera y protegida por privilegios del motor; con las dos
 *   vivas, lo que escribiera ésta no dejaría evento en la cadena.
 * - **Índice sobre `tipo` solo:** nueve valores, el planner no lo usaría.
 * - **`senales_feed_idx` y los tres índices de reloj.** El feed no existe
 *   todavía y dos índices no pueden compartir nombre; los de reloj llegan con
 *   el cron que los barre. Se paga caro lo que llega tarde como columna, y
 *   barato lo que llega tarde como índice.
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { estadosSenal, temas, tiposSenal } from './_catalogos';
import { cityColumn, direccionColumns, geoColumns } from './_geo-columns';
import { checksDeDireccion } from './_senales-direccion';
import { actores } from './actores';
import { geographicLocations } from './geographic';
import { users } from './users';

export const senales = pgTable(
  'senales',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),

    /** El que sale al público. Opaco: un ordinal en la URL permite enumerar el
     *  corpus entero y emparejar dos señales de la misma sesión. */
    idPublico: uuid('id_publico').notNull().defaultRandom(),

    tipo: text('tipo').notNull(),
    /** Desnormalizada: los CHECK de abajo la necesitan sin un join. */
    clase: text('clase').notNull(),
    tema: text('tema').references(() => temas.clave, { onDelete: 'set null' }),
    temaOrigen: text('tema_origen').notNull().default('ninguno'),
    /** Gobierna la cola del clasificador y sólo eso. Sin ella, con el catálogo
     *  cerrado, cada fila que el modelo no logra mapear vuelve a quedar NULL,
     *  vuelve a ser la más vieja, y el lote se llena para siempre con las
     *  mismas filas irreducibles: una llamada de LLM por fila por tick. */
    temaIntentadoEn: timestamp('tema_intentado_en', { withTimezone: true }),

    /** Nullable a propósito: si el navegador rechaza la cookie, la señal
     *  **existe igual** y se cuenta aparte (`senalesSinActor`); lo que no puede
     *  es entrar al circuito de corroboración. Toda comparación de actor va con
     *  `IS DISTINCT FROM` y nunca con `<>`: con la columna en NULL, `actor_id <>
     *  $mio` da NULL y, según cómo se escriba, o toda señal anónima es
     *  incorroborable o toda señal anónima es **auto-corroborable**. */
    actorId: bigint('actor_id', { mode: 'number' }).references(() => actores.id),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),

    /** Lo ÚNICO de autoría que sale al público, SIEMPRE con su calificador
     *  «firmado como … · sin verificar». Reemplaza a `submitted_as`, que cargaba
     *  dos conceptos y publicaba el UUID del teléfono. */
    firma: text('firma'),

    /** Lo decide la RUTA y la CREDENCIAL, nunca el cuerpo: si lo declarara el
     *  cliente, un script se diría `campo` y lavaría spam de web como terreno. */
    origen: text('origen').notNull(),

    /** Idempotencia real: el outbox reintenta con el mismo id y el UNIQUE
     *  `(origen, id_local)` le saca la carrera. **Nunca sale a una respuesta.** */
    idLocal: uuid('id_local').notNull(),

    /** `práctica` y `propuesta` tienen nombre propio. */
    titulo: text('titulo'),
    texto: text('texto').notNull(),
    /** Sólo `saber`: cómo lo sabés, en una línea. Sin procedencia es un rumor. */
    fuente: text('fuente'),

    /** La cesión de licencia del texto. **Sin la marca, el volcado publica la
     *  fila SIN `texto`.** Fecha y versión y no sólo un booleano: el día que
     *  cambie el texto de la pantalla hace falta saber cuál firmó cada fila. El
     *  booleano existe porque es lo que lee el predicado del volcado, y los dos
     *  CHECK lo amarran a la fecha para que no puedan divergir. */
    cesionLicencia: boolean('cesion_licencia').notNull().default(false),
    cesionEn: timestamp('cesion_en', { withTimezone: true }),
    cesionVersion: smallint('cesion_version'),

    /** Ancla administrativa. Sigue existiendo aunque haya punto. */
    provinceId: integer('province_id').references(() => geographicLocations.id, {
      onDelete: 'set null',
    }),
    ...cityColumn,
    departmentId: integer('department_id').references(() => geographicLocations.id, {
      onDelete: 'set null',
    }),
    ...geoColumns,
    /** **Se pisa el default de `geoColumns` (`low`) y queda `high`.** Es la
     *  única tabla que recibe escrituras, y el default de una columna de
     *  privacidad tiene que fallar cerrado: una ingesta que se olvide de
     *  mandarla protege de más, no de menos. */
    sensitivity: text('sensitivity').notNull().default('high'),
    ...direccionColumns,

    /** La respuesta cruda a la pregunta de la casa, PERSISTIDA — «¿esto habla
     *  de una casa donde vive alguien?». El vocabulario es el de
     *  `RespuestaDeVivienda` de civic-core y no una traducción: `propia` ·
     *  `ajena` · `no` · `sinRespuesta`. **`sinRespuesta` no es `no`**, y es el
     *  default por eso mismo: la ausencia de respuesta cae del lado seguro
     *  —`subject`+`high`, sin rechazo posible del engrosado—, y un default `no`
     *  sería el `0` que dice «no sé» con el valor más permisivo. */
    casa: text('casa').notNull().default('sinRespuesta'),

    /** El rechazo del engrosado, persistido: es lo único que el piso de
     *  publicación honra, y un consentimiento que no se puede auditar no es
     *  un consentimiento. */
    engrosadoRechazado: boolean('engrosado_rechazado').notNull().default(false),

    estado: text('estado').notNull().default('enviada'),
    estadoDesde: timestamp('estado_desde', { withTimezone: true }).notNull().defaultNow(),
    ronda: integer('ronda').notNull().default(1),

    /**
     * Los dos relojes de vigencia (spec C), seteados **al publicar** y no al
     * corroborarse: un hecho que nadie confirma nunca también envejece, y con
     * relojes en NULL se quedaría en `por_verificar` para siempre, contando en
     * el denominador de su celda sin que ningún cron lo barra.
     *
     * `vence_el_revision` lleva el nombre largo a propósito: `vence_el` a secas
     * significaba «plazo del compromiso» en una spec y «hora de volver a mirar»
     * en la otra, sobre la misma fila. El plazo es `comprometido_para`.
     */
    venceElRevision: timestamp('vence_el_revision', { withTimezone: true }),
    caducaEl: timestamp('caduca_el', { withTimezone: true }),

    /** Vocabulario cerrado: texto libre acá volvería a mezclar «se resolvió»
     *  con «se cayó del mapa por olvido». */
    motivo: text('motivo'),

    /** Retención de cuidado: **visibilidad y no calidad**. No toca `estado`, y
     *  sale de toda superficie pública. */
    retenidaEn: timestamp('retenida_en', { withTimezone: true }),
    retenidaMotivo: text('retenida_motivo'),

    /** Sólo `acto`: `abierto` · `vencido` · `cumplido` · `no_cumplido`. */
    desenlace: text('desenlace'),
    /** Sólo `acto`: la fecha que declara quien promete. Sin fecha, un
     *  compromiso es un sueño con otro nombre. */
    comprometidoPara: date('comprometido_para'),

    /** Sólo `práctica`. */
    periodicidad: text('periodicidad'),
    sostenidaPor: text('sostenida_por'),

    /** Cuándo se publicó, que es de donde salen los dos relojes. **No se deriva
     *  de `creada_en`**: hay señales que esperan provincia o evidencia y salen
     *  horas después; sin ella `vence_el_revision` no tiene procedencia. */
    publicadaEn: timestamp('publicada_en', { withTimezone: true }),

    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    /** La escribe el repositorio en cada UPDATE, con su test. **NO hay
     *  trigger**: uno que drizzle no modela es una regla invisible, y
     *  `dreams.updated_at` ya demostró que sin writer copia a `created_at`. */
    actualizadaEn: timestamp('actualizada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // ── El vocabulario, atornillado ────────────────────────────────────────
    foreignKey({
      name: 'senales_tipo_clase_fk',
      columns: [t.tipo, t.clase],
      foreignColumns: [tiposSenal.tipo, tiposSenal.clase],
    }),
    foreignKey({
      name: 'senales_estado_clase_fk',
      columns: [t.estado, t.clase],
      foreignColumns: [estadosSenal.estado, estadosSenal.clase],
    }),
    unique('senales_id_publico_unique').on(t.idPublico),
    /** Para las dos FK compuestas de `respuestas`. */
    unique('senales_id_clase_unique').on(t.id, t.clase),
    /** Tres espacios de nombres de idempotencia —navegador, app de campo,
     *  adaptador viejo— y no uno compartido: con un único global, el reintento
     *  de uno colisiona con el envío legítimo de otro. */
    unique('senales_origen_id_local_unique').on(t.origen, t.idLocal),

    // ── Los dominios que no son catálogo ───────────────────────────────────
    check('senales_origen_chk', sql`${t.origen} in ('web','campo','campo-v1')`),
    check('senales_tema_origen_chk', sql`${t.temaOrigen} in ('declarado','sugerido','ninguno')`),
    check('senales_casa_chk', sql`${t.casa} in ('propia','ajena','no','sinRespuesta')`),
    /** El eje de privacidad deja de ser texto libre: un `alta` en vez de `high`
     *  desactivaba la protección en silencio. */
    check(
      'senales_precision_chk',
      sql`${t.precision} in ('exact','100m','500m','neighborhood','city','province')`,
    ),
    check(
      'senales_location_role_chk',
      sql`${t.locationRole} in ('subject','capture','service_area','meeting_point')`,
    ),
    check('senales_sensitivity_chk', sql`${t.sensitivity} in ('low','moderate','high')`),
    check(
      'senales_motivo_chk',
      sql`${t.motivo} is null or ${t.motivo} in ('ya_no_esta','caducidad_por_silencio','correccion','compromiso_vencido','compromiso_incumplido','revision_de_vigencia','revision_de_resolucion')`,
    ),
    /** El dominio de `desenlace`. No está en las specs y entra igual:
     *  `acto_coherente` lo enumera, pero se abre entero cuando el estado es
     *  `retirada`, y ahí el desenlace volvía a ser texto libre. */
    check(
      'senales_desenlace_chk',
      sql`${t.desenlace} is null or ${t.desenlace} in ('abierto','vencido','cumplido','no_cumplido')`,
    ),

    // ── Lo que cada clase y cada tipo obligan ──────────────────────────────
    /** Retirar vacía el texto y deja la fila: el borrado es auditable, el contenido no queda. */
    check('senales_retirada_sin_texto_chk', sql`${t.estado} <> 'retirada' or ${t.texto} = ''`),
    check(
      'senales_acto_tiene_fecha_chk',
      sql`${t.clase} <> 'acto' or ${t.comprometidoPara} is not null`,
    ),
    check(
      'senales_solo_acto_tiene_desenlace_chk',
      sql`${t.clase} = 'acto' or (${t.desenlace} is null and ${t.comprometidoPara} is null)`,
    ),
    check(
      'senales_acto_tiene_desenlace_chk',
      sql`${t.clase} <> 'acto' or ${t.desenlace} is not null`,
    ),
    check('senales_saber_trae_fuente_chk', sql`${t.tipo} <> 'saber' or ${t.fuente} is not null`),
    check(
      'senales_practica_tiene_periodicidad_chk',
      sql`${t.tipo} <> 'práctica' or ${t.periodicidad} is not null`,
    ),
    check(
      'senales_solo_practica_tiene_periodicidad_chk',
      sql`${t.tipo} = 'práctica' or (${t.periodicidad} is null and ${t.sostenidaPor} is null)`,
    ),
    check(
      'senales_periodicidad_conocida_chk',
      sql`${t.periodicidad} is null or ${t.periodicidad} in ('diaria','semanal','quincenal','mensual','eventual','permanente')`,
    ),
    check('senales_tema_coherente_chk', sql`(${t.tema} is null) = (${t.temaOrigen} = 'ninguno')`),
    check(
      'senales_cesion_coherente_chk',
      sql`(${t.cesionEn} is null) = (${t.cesionVersion} is null)`,
    ),
    check('senales_cesion_chk', sql`(${t.cesionEn} is null) <> ${t.cesionLicencia}`),
    /** Nadie consiente por otro, y nadie rechaza la protección de una casa ajena. */
    check(
      'senales_rechazo_chk',
      sql`not ${t.engrosadoRechazado} or (${t.casa} = 'propia' and ${t.locationRole} = 'subject')`,
    ),
    /** `no_cumplido` tiene estado propio: si compartiera `resuelta` con
     *  `cumplido`, `count(*) where estado='resuelta'` —la consulta obvia de la
     *  métrica norte— sumaría los dos. */
    check(
      'senales_acto_coherente_chk',
      sql`${t.clase} <> 'acto' or ${t.estado} = 'retirada' or (
        (${t.desenlace} = 'abierto'     and ${t.estado} in ('enviada','por_verificar','corroborada'))
     or (${t.desenlace} = 'vencido'     and ${t.estado} = 'desactualizada')
     or (${t.desenlace} = 'cumplido'    and ${t.estado} = 'resuelta')
     or (${t.desenlace} = 'no_cumplido' and ${t.estado} = 'no_cumplida'))`,
    ),

    // ── Los nueve de la dirección (spec A §3.4) ────────────────────────────
    ...checksDeDireccion,

    // ── Los índices que ya tienen consulta ─────────────────────────────────
    index('senales_clase_idx').on(t.clase, t.estado),
    index('senales_provincia_idx').on(t.provinceId, t.creadaEn.desc()),
    index('senales_geo_idx')
      .on(t.lat, t.lng)
      .where(sql`lat is not null`),
    index('senales_actor_idx')
      .on(t.actorId)
      .where(sql`actor_id is not null`),
    /** Va UNA sola vez: A y B lo declaran igual, y concatenar los dos bloques
     *  aborta la migración que crea la tabla. */
    index('senales_calle_idx')
      .on(t.calleId)
      .where(sql`calle_id is not null`),
    /** La cola del clasificador, acotada a lo que falta. */
    index('senales_tema_cola_idx')
      .on(t.creadaEn)
      .where(sql`tema is null and tema_intentado_en is null`),
  ],
);

export type Senal = typeof senales.$inferSelect;
export type NewSenal = typeof senales.$inferInsert;
