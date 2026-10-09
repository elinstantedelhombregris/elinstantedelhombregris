import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { campanas } from './campanas';
import { users } from './users';
export const colaboraciones = pgTable(
  'colaboraciones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tipo: text('tipo').notNull(),
    objeto: uuid('objeto').notNull(),
    creadorId: integer('creador_id')
      .notNull()
      .references(() => users.id),
    usuarioId: integer('usuario_id').references(() => users.id),
    codigoHash: text('codigo_hash').notNull(),
    rol: text('rol').notNull(),
    venceEn: timestamp('vence_en', { withTimezone: true }).notNull(),
    aceptadaEn: timestamp('aceptada_en', { withTimezone: true }),
    revocadaEn: timestamp('revocada_en', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('colaboraciones_codigo_unique').on(t.codigoHash),
    index('colaboraciones_objeto_idx').on(t.tipo, t.objeto),
  ],
);
export const revisionesDevolucion = pgTable(
  'revisiones_devolucion',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campanaId: uuid('campana_id')
      .notNull()
      .references(() => campanas.id),
    autorId: integer('autor_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    texto: text('texto').notNull(),
    respuesta: text('respuesta'),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    respondidaEn: timestamp('respondida_en', { withTimezone: true }),
  },
  (t) => [uniqueIndex('revisiones_devolucion_autor_envio_unique').on(t.autorId, t.idLocal)],
);
export const preferenciasCivicas = pgTable('preferencias_civicas', {
  userId: integer('user_id')
    .primaryKey()
    .references(() => users.id),
  avisos: boolean('avisos').notNull().default(true),
});
