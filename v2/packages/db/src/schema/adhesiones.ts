/**
 * Las dos aristas de una señal: quién la apoya (`adhesiones`) y qué la responde
 * (`respuestas`).
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §3.4 y §3.5.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 11.
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { actores } from './actores';
import { senales } from './senales';
import { users } from './users';

/**
 * «Yo también» — un `+1` y nada más.
 *
 * **No hay `valor` ni `signo`.** El `0` de `proposal_votes` («me interesa sin
 * avalar») muere porque nadie puede leerlo sin inventarle sentido, y el `-1`
 * (objeción) no vive acá: una objeción es una contradicción sobre un hecho, o
 * sea del eje de corroboración. **Una adhesión no es una confirmación**: mueve
 * el brillo y nunca la nitidez.
 *
 * `actor_id` es `NOT NULL` —una adhesión que no se puede contar no es nada—, y
 * ésa es la asimetría con `senales.actor_id`, nullable porque un texto sin actor
 * sigue siendo un texto del país. Retirar un actor **no toca una sola fila de
 * acá**: el retiro es un UPDATE sobre `actores`, y el `cascade` de `senal_id` es
 * una red para el borrado accidental, no un camino de producto.
 */
export const adhesiones = pgTable(
  'adhesiones',
  {
    senalId: bigint('senal_id', { mode: 'number' })
      .notNull()
      .references(() => senales.id, { onDelete: 'cascade' }),
    actorId: bigint('actor_id', { mode: 'number' })
      .notNull()
      .references(() => actores.id),
    /**
     * Desnormalizado del actor en el INSERT. El unique de PERSONA tiene que
     * existir al mismo nivel estructural que el de ACTOR, o la misma persona en
     * Chrome y en el teléfono son dos «personas» en el conteo público.
     */
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /**
     * **LA restricción de toda la spec.** `proposal_votes` no la tiene, y por
     * eso `castVote` deja dos votos de la misma persona con dos pestañas
     * abiertas. La PK natural es el par: un `id` subrogado acá sería una columna
     * y un índice de puro peso.
     */
    primaryKey({ columns: [t.senalId, t.actorId], name: 'adhesiones_pk' }),
    uniqueIndex('adhesiones_senal_user_unico')
      .on(t.senalId, t.userId)
      .where(sql`user_id is not null`),
    index('adhesiones_actor_idx').on(t.actorId),
  ],
);

/**
 * Qué señal responde a qué pregunta.
 *
 * Una tabla y no una columna, porque una pregunta admite varias respuestas y una
 * misma señal puede responder varias preguntas.
 *
 * **La clase viaja en las DOS FK compuestas, no en la confianza.** Sin la de la
 * pregunta se le puede colgar una «respuesta» a una necesidad ajena y, al
 * corroborar la respuesta, llevarla a `resuelta` por la puerta de servicio,
 * salteando la maquinaria de corroboración. Y sólo un **hecho** puede responder:
 * una pregunta pide algo que se pueda comprobar, y contestarla con un sueño es
 * cambiar de tema.
 *
 * Los dos CHECK de clase fija son los que hacen que las FK compuestas apunten a
 * una clase y no a cualquiera: `(pregunta_id, 'meta')` y `(senal_id, 'hecho')`
 * contra el `unique (id, clase)` de `senales`.
 */
export const respuestas = pgTable(
  'respuestas',
  {
    preguntaId: bigint('pregunta_id', { mode: 'number' }).notNull(),
    preguntaClase: text('pregunta_clase').notNull(),
    senalId: bigint('senal_id', { mode: 'number' }).notNull(),
    senalClase: text('senal_clase').notNull(),
    actorId: bigint('actor_id', { mode: 'number' }).references(() => actores.id),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /** Impide la duplicada. El techo contra el llenado es de tasa, no de forma. */
    primaryKey({ columns: [t.preguntaId, t.senalId], name: 'respuestas_pk' }),
    foreignKey({
      name: 'respuestas_pregunta_fk',
      columns: [t.preguntaId, t.preguntaClase],
      foreignColumns: [senales.id, senales.clase],
    }),
    foreignKey({
      name: 'respuestas_senal_fk',
      columns: [t.senalId, t.senalClase],
      foreignColumns: [senales.id, senales.clase],
    }),
    check('respuestas_pregunta_clase_chk', sql`${t.preguntaClase} = 'meta'`),
    check('respuestas_senal_clase_chk', sql`${t.senalClase} = 'hecho'`),
  ],
);

export type Adhesion = typeof adhesiones.$inferSelect;
export type NewAdhesion = typeof adhesiones.$inferInsert;
export type Respuesta = typeof respuestas.$inferSelect;
export type NewRespuesta = typeof respuestas.$inferInsert;
