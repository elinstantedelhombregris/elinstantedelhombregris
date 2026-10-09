import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { senales } from './senales';
import { users } from './users';

import type { ContratoCampana, EstadoCampana } from '@v2/shared';

export const campanas = pgTable(
  'campanas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    creadorId: integer('creador_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    revision: integer('revision').notNull().default(1),
    estado: text('estado').$type<EstadoCampana>().notNull().default('borrador'),
    contrato: jsonb('contrato').$type<ContratoCampana>().notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadaEn: timestamp('actualizada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('campanas_envio_unique').on(t.creadorId, t.idLocal),
    check('campanas_revision_chk', sql`${t.revision}>0`),
    check(
      'campanas_estado_chk',
      sql`${t.estado} in ('borrador','programada','abierta','pausada','en_devolucion','cerrada')`,
    ),
  ],
);
export const campanaEdiciones = pgTable(
  'campana_ediciones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campanaId: uuid('campana_id')
      .notNull()
      .references(() => campanas.id, { onDelete: 'cascade' }),
    revision: integer('revision').notNull(),
    contrato: jsonb('contrato').$type<ContratoCampana>().notNull(),
    estado: text('estado').notNull(),
    motivo: text('motivo').notNull(),
    fecha: timestamp('fecha', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('campana_edicion_unique').on(t.campanaId, t.revision)],
);
export const contribuciones = pgTable(
  'contribuciones',
  {
    huella: text('huella').notNull(),
    senalId: uuid('senal_id')
      .primaryKey()
      .references(() => senales.idPublico, { onDelete: 'cascade' }),
    campanaId: uuid('campana_id').references(() => campanas.id),
    edicion: integer('edicion'),
    modo: text('modo').notNull().default('personal'),
    fragmentos: jsonb('fragmentos')
      .$type<{ pregunta: string; respuesta: string }[]>()
      .notNull()
      .default([]),
    confirmadaEn: timestamp('confirmada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('contribuciones_campana_idx').on(t.campanaId, t.edicion),
    check('contribucion_contexto_chk', sql`(${t.campanaId} is null) = (${t.edicion} is null)`),
  ],
);
export const campanaDevoluciones = pgTable('campana_devoluciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  campanaId: uuid('campana_id')
    .notNull()
    .references(() => campanas.id, { onDelete: 'cascade' }),
  edicion: integer('edicion').notNull(),
  texto: text('texto').notNull(),
  limites: text('limites').notNull(),
  senalIds: jsonb('senal_ids').$type<string[]>().notNull().default([]),
  fecha: timestamp('fecha', { withTimezone: true }).notNull().defaultNow(),
});
