/**
 * Las personas nuevas que trae una campaña propuesta (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §11).
 *
 * La clave es el actor: cada persona cuenta para una sola campaña, la primera
 * que la trajo. La fila nace cuando la persona participa por primera vez (su
 * primer aporte o su quinta opinión) con la marca de llegada de esa campaña.
 */
import { sql } from 'drizzle-orm';
import { bigint, check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { actores } from './actores';
import { campanas } from './campanas';
import { senales } from './senales';
import { users } from './users';

export const campanaImpulsos = pgTable(
  'campana_impulsos',
  {
    actorId: bigint('actor_id', { mode: 'number' })
      .primaryKey()
      .references(() => actores.id),
    campanaId: uuid('campana_id')
      .notNull()
      .references(() => campanas.id, { onDelete: 'cascade' }),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    /** Cómo participó: con su primer aporte o con su quinta opinión. */
    como: text('como').notNull(),
    /** El aporte con el que entró, si entró por un aporte: retirado o retenido, deja de contar. */
    senalId: bigint('senal_id', { mode: 'number' }).references(() => senales.id, {
      onDelete: 'set null',
    }),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('campana_impulsos_campana_idx').on(t.campanaId),
    check('campana_impulso_como_chk', sql`${t.como} in ('aporte','opiniones')`),
    check('campana_impulso_senal_chk', sql`${t.como} = 'aporte' or ${t.senalId} is null`),
  ],
);

export type CampanaImpulso = typeof campanaImpulsos.$inferSelect;
