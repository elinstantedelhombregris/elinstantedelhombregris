import { index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const seguimientos = pgTable(
  'seguimientos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tipo: text('tipo').notNull(),
    objeto: text('objeto').notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('seguimientos_usuario_objeto_unique').on(t.userId, t.tipo, t.objeto)],
);
export const analisisGuardados = pgTable(
  'analisis_guardados',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    consulta: jsonb('consulta').$type<Record<string, string>>().notNull(),
    corte: timestamp('corte', { withTimezone: true }),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('analisis_guardados_usuario_idx').on(t.userId)],
);
export const eventosCivicos = pgTable(
  'eventos_civicos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    clave: text('clave').notNull(),
    titulo: text('titulo').notNull(),
    href: text('href').notNull(),
    leidoEn: timestamp('leido_en', { withTimezone: true }),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('eventos_civicos_usuario_clave_unique').on(t.userId, t.clave),
    index('eventos_civicos_usuario_idx').on(t.userId, t.creadaEn),
  ],
);
