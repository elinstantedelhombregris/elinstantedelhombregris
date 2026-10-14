import { integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const iniciativaRecibos = pgTable(
  'iniciativa_recibos',
  {
    usuarioId: integer('usuario_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    idLocal: uuid('id_local').notNull(),
    huella: text('huella').notNull(),
    resultado: jsonb('resultado').$type<{ id: number; slug?: string }>().notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.idLocal] })],
);
