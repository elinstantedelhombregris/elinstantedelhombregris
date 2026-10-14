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

import { fichaAlternativas } from './diseno';
import { fichasFuturo } from './fichas';
import { users } from './users';

export const fichaArgumentos = pgTable(
  'ficha_argumentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fichaId: uuid('ficha_id')
      .notNull()
      .references(() => fichasFuturo.id, { onDelete: 'cascade' }),
    autorId: integer('autor_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    tipo: text('tipo').notNull(),
    texto: text('texto').notNull(),
    firma: text('firma').notNull(),
    respondeA: uuid('responde_a'),
    alternativaId: uuid('alternativa_id').references(() => fichaAlternativas.id, {
      onDelete: 'set null',
    }),
    fuenteIds: jsonb('fuente_ids').$type<string[]>().notNull(),
    huella: text('huella').notNull(),
    retiradaEn: timestamp('retirada_en', { withTimezone: true }),
    motivo: text('motivo'),
    moderadorId: integer('moderador_id').references(() => users.id),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('argumento_envio_unique').on(t.autorId, t.idLocal),
    index('argumento_ficha_idx').on(t.fichaId, t.creadaEn),
    check('argumento_tipo_chk', sql`${t.tipo} in ('argumento','objecion','evidencia','respuesta')`),
  ],
);
export const fichaRelaciones = pgTable(
  'ficha_relaciones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    origenId: uuid('origen_id')
      .notNull()
      .references(() => fichasFuturo.id, { onDelete: 'cascade' }),
    destinoId: uuid('destino_id')
      .notNull()
      .references(() => fichasFuturo.id, { onDelete: 'cascade' }),
    autorId: integer('autor_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    tipo: text('tipo').notNull(),
    justificacion: text('justificacion').notNull(),
    fuente: text('fuente'),
    huella: text('huella').notNull(),
    retiradaEn: timestamp('retirada_en', { withTimezone: true }),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('relacion_envio_unique').on(t.autorId, t.idLocal),
    index('relacion_origen_idx').on(t.origenId),
    index('relacion_destino_idx').on(t.destinoId),
    check('relacion_distinta_chk', sql`${t.origenId} <> ${t.destinoId}`),
    check(
      'relacion_tipo_chk',
      sql`${t.tipo} in ('objetivo_compartido','complementa','depende','tension','hipotesis_causal')`,
    ),
  ],
);
