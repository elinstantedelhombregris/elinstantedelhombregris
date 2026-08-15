/**
 * `confirmaciones` — el segundo par de ojos.
 *
 * Spec: `docs/specs/2026-08-11-c-la-corroboracion.md` §2.1 y §2.2.
 *
 * ## Lo que esta tabla garantiza, y lo que NO
 *
 * | Criterio | Cómo | Qué no garantiza |
 * |---|---|---|
 * | No es el mismo actor dos veces | `unique (senal_id, ronda, actor_id)` | Que dos `actor_id` sean dos personas |
 * | No es quien cargó la señal | Se comprueba al escribir, con `IS DISTINCT FROM` | Que el autor no tenga un segundo aparato |
 * | Declaró estar cerca | `proximidad`, categoría y no punto | **Nada, si miente.** Es declarada, no atestada |
 *
 * Sybil no se impide: **se encarece y se declara**. Y dos personas del mismo
 * hogar no se detectan porque detectarlo pide fingerprinting, que la regla 9
 * prohíbe. Se documenta, no se disimula.
 *
 * `umbral_vigente` se guarda por fila **para auditar la fila, no para juzgar la
 * señal**: el umbral no se congela, se sella. Subirlo a tres mañana no
 * reescribe lo que ya pasó.
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
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

import { actores } from './actores';
import { senales } from './senales';

export const confirmaciones = pgTable(
  'confirmaciones',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),

    senalId: bigint('senal_id', { mode: 'number' })
      .notNull()
      .references(() => senales.id, { onDelete: 'cascade' }),

    /** La ronda de la señal cuando se confirmó. Reabrir sube la ronda y limpia el conteo. */
    ronda: integer('ronda').notNull().default(1),

    /**
     * Nullable como en `senales`, y por lo mismo: si el navegador rechaza la
     * cookie el acto existe igual. Lo que no puede es contar para el umbral —
     * sin actor no hay forma de saber que son dos personas.
     */
    actorId: bigint('actor_id', { mode: 'number' }).references(() => actores.id),

    veredicto: text('veredicto').notNull(),
    metodo: text('metodo').notNull(),
    proximidad: text('proximidad').notNull().default('sin_declarar'),

    /** Si esta fila suma al umbral. Lo decide `metodoCuenta` del núcleo. */
    cuenta: boolean('cuenta').notNull().default(false),

    /** El umbral que regía cuando se escribió. Para auditar la fila. */
    umbralVigente: smallint('umbral_vigente').notNull(),

    /** Sólo con `correct`: qué habría que corregir, en una línea. */
    nota: text('nota'),

    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /** Una persona, una confirmación por ronda. Es la única independencia real. */
    unique('confirmaciones_una_por_actor').on(t.senalId, t.ronda, t.actorId),

    check(
      'confirmaciones_veredicto_chk',
      sql`${t.veredicto} in ('confirm','correct','duplicate','stale','unsafe','cannot_verify')`,
    ),
    check(
      'confirmaciones_metodo_chk',
      sql`${t.metodo} in ('saw_now','know_place','checked_source','field_visit','cannot_verify')`,
    ),
    check(
      'confirmaciones_proximidad_chk',
      sql`${t.proximidad} in ('en_el_lugar','cerca','lejos','sin_declarar')`,
    ),

    /**
     * La fila absurda, imposible: «lo confirmo y no tengo cómo comprobarlo».
     * Si el método es `cannot_verify`, el veredicto tiene que serlo también, y
     * al revés.
     */
    check(
      'confirmaciones_par_coherente_chk',
      sql`(${t.metodo} = 'cannot_verify') = (${t.veredicto} = 'cannot_verify')`,
    ),

    /** Un `cannot_verify` nunca suma, diga lo que diga quien lo escribió. */
    check(
      'confirmaciones_cuenta_chk',
      sql`not ${t.cuenta} or ${t.metodo} <> 'cannot_verify'`,
    ),

    /** Sin actor no se cuenta: no hay forma de saber que son dos personas. */
    check('confirmaciones_cuenta_pide_actor_chk', sql`not ${t.cuenta} or ${t.actorId} is not null`),

    /** La nota es sólo de `correct`: en los otros cinco no hay nada que corregir. */
    check(
      'confirmaciones_nota_chk',
      sql`${t.nota} is null or ${t.veredicto} = 'correct'`,
    ),

    foreignKey({
      name: 'confirmaciones_senal_fk',
      columns: [t.senalId],
      foreignColumns: [senales.id],
    }),

    index('confirmaciones_senal_idx').on(t.senalId, t.ronda),
  ],
);

export type Confirmacion = typeof confirmaciones.$inferSelect;
export type NewConfirmacion = typeof confirmaciones.$inferInsert;
