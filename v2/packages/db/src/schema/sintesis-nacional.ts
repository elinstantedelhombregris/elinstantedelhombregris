import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

import { users } from './users';

import type { ContenidoSintesisNacional } from '@v2/shared';

/** Ediciones editoriales inmutables. Lectura pública condicionada a apoyos vigentes. */
export const sintesisNacionales = pgTable(
  'sintesis_nacionales',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    autorId: integer('autor_id')
      .notNull()
      .references(() => users.id),
    revisorId: integer('revisor_id').references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    anteriorId: uuid('anterior_id').references((): AnyPgColumn => sintesisNacionales.id),
    contenido: jsonb('contenido').$type<ContenidoSintesisNacional>().notNull(),
    huella: text('huella').notNull(),
    versionGeo: text('version_geo').notNull(),
    versionCenso: text('version_censo').notNull(),
    huellaTerritorial: text('huella_territorial').notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    revisadaEn: timestamp('revisada_en', { withTimezone: true }),
    retiradaEn: timestamp('retirada_en', { withTimezone: true }),
  },
  (t) => [
    unique('sintesis_autor_recibo_unique').on(t.autorId, t.idLocal),
    check(
      'sintesis_revision_separada_chk',
      sql`${t.revisorId} is null or ${t.revisorId} <> ${t.autorId}`,
    ),
    check('sintesis_revision_fecha_chk', sql`(${t.revisorId} is null) = (${t.revisadaEn} is null)`),
  ],
);
