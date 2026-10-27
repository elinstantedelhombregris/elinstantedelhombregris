/**
 * Las cuentas de un proveedor externo con las que se entra a una cuenta del sitio
 * (ADR 0012, spec 2026-10-27-ingreso-con-google.md).
 *
 * Se busca siempre por `(proveedor, sujeto)`: el `sub` del proveedor es estable y el
 * correo no. El correo queda para mostrarlo en Mi espacio y nada más.
 */
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { users } from './users';

/** Los proveedores que hay. Sumar uno es sumarlo acá y en el `check`. */
export const PROVEEDORES_DE_INGRESO = ['google'] as const;
export type ProveedorDeIngreso = (typeof PROVEEDORES_DE_INGRESO)[number];

export const identidadesExternas = pgTable(
  'identidades_externas',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    proveedor: text('proveedor').$type<ProveedorDeIngreso>().notNull(),
    /** El `sub` del proveedor: un identificador de la cuenta, no el correo. */
    sujeto: text('sujeto').notNull(),
    /** El correo que dijo el proveedor al vincular. */
    correo: text('correo').notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    usadaEn: timestamp('usada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('identidades_externas_sujeto_unique').on(t.proveedor, t.sujeto),
    index('identidades_externas_user_idx').on(t.userId),
    check('identidades_externas_proveedor_chk', sql`${t.proveedor} in ('google')`),
  ],
);

export type IdentidadExterna = typeof identidadesExternas.$inferSelect;
