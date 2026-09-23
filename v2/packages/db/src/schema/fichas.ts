import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { geographicLocations } from './geographic';
import { users } from './users';

import type { ContenidoFicha } from '@v2/shared';

/** Borradores de futuro. No son acuerdos ni objetivos personales. */
export const fichasFuturo = pgTable(
  'fichas_futuro',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creadorId: integer('creador_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    territorioId: integer('territorio_id').references(() => geographicLocations.id),
    revision: integer('revision').notNull().default(1),
    contenido: jsonb('contenido').$type<ContenidoFicha>().notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadaEn: timestamp('actualizada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('fichas_futuro_envio_unique').on(t.creadorId, t.idLocal),
    index('fichas_futuro_territorio_idx').on(t.territorioId),
    check('fichas_futuro_revision_chk', sql`${t.revision} >= 1`),
  ],
);

/** Historial interno: la lectura pública expone fecha y campos, nunca copias de textos antiguos. */
export const fichasRevisiones = pgTable(
  'fichas_revisiones',
  {
    fichaId: uuid('ficha_id')
      .notNull()
      .references(() => fichasFuturo.id),
    revision: integer('revision').notNull(),
    editorId: integer('editor_id')
      .notNull()
      .references(() => users.id),
    contenido: jsonb('contenido').$type<ContenidoFicha>().notNull(),
    campos: jsonb('campos').$type<string[]>().notNull(),
    fecha: timestamp('fecha', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.fichaId, t.revision] })],
);
