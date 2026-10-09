import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { fichasFuturo } from './fichas';
import { users } from './users';

import type { alternativaSchema, estadosPrueba } from '@v2/shared';
import type { z } from 'zod';

export const fichaAfirmaciones = pgTable(
  'ficha_afirmaciones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fichaId: uuid('ficha_id')
      .notNull()
      .references(() => fichasFuturo.id, { onDelete: 'cascade' }),
    creadorId: integer('creador_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    texto: text('texto').notNull(),
    retiradaEn: timestamp('retirada_en', { withTimezone: true }),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('afirmacion_envio_unique').on(t.creadorId, t.idLocal),
    index('afirmacion_ficha_idx').on(t.fichaId),
  ],
);
export const opiniones = pgTable(
  'opiniones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    afirmacionId: uuid('afirmacion_id')
      .notNull()
      .references(() => fichaAfirmaciones.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    valor: text('valor'),
    mostradaEn: timestamp('mostrada_en', { withTimezone: true }).notNull().defaultNow(),
    respondidaEn: timestamp('respondida_en', { withTimezone: true }),
  },
  (t) => [
    unique('opinion_usuario_afirmacion_unique').on(t.afirmacionId, t.userId),
    check('opinion_valor_chk', sql`${t.valor} in ('acuerdo','desacuerdo','paso')`),
  ],
);
export const fichaAlternativas = pgTable(
  'ficha_alternativas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fichaId: uuid('ficha_id')
      .notNull()
      .references(() => fichasFuturo.id, { onDelete: 'cascade' }),
    creadorId: integer('creador_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    contenido: jsonb('contenido').$type<z.infer<typeof alternativaSchema>>().notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('alternativa_envio_unique').on(t.creadorId, t.idLocal)],
);
export const pruebasTerritoriales = pgTable(
  'pruebas_territoriales',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    alternativaId: uuid('alternativa_id')
      .notNull()
      .references(() => fichaAlternativas.id, { onDelete: 'cascade' }),
    creadorId: integer('creador_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    responsableNombre: text('responsable_nombre'),
    responsableId: integer('responsable_id').references(() => users.id),
    titulo: text('titulo').notNull(),
    alcance: text('alcance').notNull(),
    plazo: date('plazo').notNull(),
    estado: text('estado').$type<(typeof estadosPrueba)[number]>().notNull().default('propuesta'),
    revision: integer('revision').notNull().default(1),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('prueba_envio_unique').on(t.creadorId, t.idLocal),
    check(
      'prueba_estado_chk',
      sql`${t.estado} in ('propuesta','aceptada','en_curso','pausada','implementada','resultado_observado','resultado_revisado')`,
    ),
  ],
);
export const pruebaEventos = pgTable(
  'prueba_eventos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pruebaId: uuid('prueba_id')
      .notNull()
      .references(() => pruebasTerritoriales.id, { onDelete: 'cascade' }),
    revision: integer('revision').notNull(),
    idLocal: uuid('id_local').notNull(),
    huella: text('huella').notNull(),
    autorId: integer('autor_id')
      .notNull()
      .references(() => users.id),
    estado: text('estado').notNull(),
    observacion: text('observacion').notNull(),
    evidencia: jsonb('evidencia').$type<string[]>().notNull(),
    fecha: timestamp('fecha', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('prueba_evento_revision_unique').on(t.pruebaId, t.revision),
    unique('prueba_evento_envio_unique').on(t.pruebaId, t.idLocal),
  ],
);
