import { integer, pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';

import { fichasFuturo } from './fichas';
import { iniciativaTasks } from './iniciativas';
import { users } from './users';

export const dispositivosCampo = pgTable(
  'dispositivos_campo',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    usuarioId: integer('usuario_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    huella: text('huella').notNull().unique(),
    expira: timestamp('expira', { withTimezone: true }).notNull(),
    revocadoEn: timestamp('revocado_en', { withTimezone: true }),
  },
  (t) => [index('dispositivos_campo_usuario_idx').on(t.usuarioId)],
);
export const tareasFichas = pgTable(
  'tareas_fichas',
  {
    tareaId: integer('tarea_id')
      .primaryKey()
      .references(() => iniciativaTasks.id, { onDelete: 'cascade' }),
    fichaId: uuid('ficha_id')
      .notNull()
      .references(() => fichasFuturo.id, { onDelete: 'cascade' }),
  },
  (t) => [index('tareas_fichas_ficha_idx').on(t.fichaId)],
);
