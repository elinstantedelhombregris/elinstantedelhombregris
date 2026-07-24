/**
 * Semillas domain (spec 2.5 — Sembrar).
 *
 * Una semilla es el compromiso de tres frases que un visitante planta al
 * final del asistente: su basta, su sueño y su compromiso. Inmutable por
 * diseño (no hay update — se planta otra). Anónima por diseño: userId solo
 * si había sesión. Publicación inmediata con paridad dreams (status
 * default 'approved'); el conteo público filtra por status.
 */
import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from './users';

export const semillas = pgTable(
  'semillas',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    basta: text('basta').notNull(),
    sueno: text('sueno').notNull(),
    compromiso: text('compromiso').notNull(),
    /** 'pending' | 'approved' | 'rejected' — paridad dreams; hoy se publica directo. */
    status: text('status').notNull().default('approved'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('semillas_status_idx').on(t.status)],
);

export type Semilla = typeof semillas.$inferSelect;
export type NewSemilla = typeof semillas.$inferInsert;
