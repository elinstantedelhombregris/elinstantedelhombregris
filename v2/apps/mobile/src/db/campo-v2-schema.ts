import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const cuadernosCampoV2 = sqliteTable(
  'cuadernos_campo_v2',
  {
    id: text('id').primaryKey(),
    usuarioId: integer('usuario_id').notNull(),
    origen: text('origen').notNull(),
    version: integer('version').notNull(),
    contenido: text('contenido').notNull(),
  },
  (t) => [index('cuadernos_campo_v2_cuenta_idx').on(t.usuarioId, t.origen)],
);
