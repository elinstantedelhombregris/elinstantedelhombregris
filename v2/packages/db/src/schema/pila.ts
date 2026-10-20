/**
 * Mirar — opiniones, duelos, reportes y decisiones sobre los aportes de Mi
 * Argentina ideal (spec 2026-10-19-mi-argentina-ideal-la-pila.md §4; plan de la
 * entrega 1, tarea 4).
 *
 * `pila_respuestas` no reemplaza a `opiniones`: ésa es de las fichas y pide
 * cuenta. Ésta funciona con el actor de navegador y además guarda la cuenta,
 * para que la misma persona en dos navegadores no cuente doble (lección de D-137).
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { actores } from './actores';
import { geographicLocations } from './geographic';
import { senales } from './senales';
import { users } from './users';

const REGIONES_SQL = sql`('NOA','NEA','Cuyo','Centro','Buenos Aires','Patagonia')`;

/** Una opinión por actor y por aporte. `valor` nulo: se le mostró y todavía no contestó. */
export const pilaRespuestas = pgTable(
  'pila_respuestas',
  {
    senalId: bigint('senal_id', { mode: 'number' })
      .notNull()
      .references(() => senales.id, { onDelete: 'cascade' }),
    actorId: bigint('actor_id', { mode: 'number' })
      .notNull()
      .references(() => actores.id),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    valor: text('valor'),
    /** La provincia que declaró quien opina, no la del aporte. */
    provinciaId: integer('provincia_id').references(() => geographicLocations.id),
    /** Derivada en el servidor de `provincia_id`: así «cuenta en este aporte» no repite la conversión. */
    region: text('region'),
    mostradaEn: timestamp('mostrada_en', { withTimezone: true }).notNull().defaultNow(),
    respondidaEn: timestamp('respondida_en', { withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.senalId, t.actorId], name: 'pila_respuestas_pk' }),
    uniqueIndex('pila_respuestas_senal_user_unico')
      .on(t.senalId, t.userId)
      .where(sql`user_id is not null`),
    index('pila_respuestas_actor_idx').on(t.actorId, t.respondidaEn),
    index('pila_respuestas_senal_region_idx')
      .on(t.senalId, t.region)
      .where(sql`valor in ('acuerdo','desacuerdo')`),
    check('pila_respuesta_valor_chk', sql`${t.valor} in ('acuerdo','desacuerdo','paso')`),
    check('pila_respuesta_fecha_chk', sql`(${t.valor} is null) = (${t.respondidaEn} is null)`),
    check('pila_respuesta_region_chk', sql`${t.region} in ${REGIONES_SQL}`),
    check(
      'pila_respuesta_region_provincia_chk',
      sql`(${t.region} is null) = (${t.provinciaId} is null)`,
    ),
  ],
);

/** ¿Cuál va primero? Un par por actor, sin importar el orden: `a_id < b_id`. */
export const pilaDuelos = pgTable(
  'pila_duelos',
  {
    aId: bigint('a_id', { mode: 'number' })
      .notNull()
      .references(() => senales.id, { onDelete: 'cascade' }),
    bId: bigint('b_id', { mode: 'number' })
      .notNull()
      .references(() => senales.id, { onDelete: 'cascade' }),
    actorId: bigint('actor_id', { mode: 'number' })
      .notNull()
      .references(() => actores.id),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    /** Nulo: «los dos por igual». */
    primeroId: bigint('primero_id', { mode: 'number' }),
    region: text('region'),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    cambiadoEn: timestamp('cambiado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.aId, t.bId, t.actorId], name: 'pila_duelos_pk' }),
    uniqueIndex('pila_duelos_user_unico')
      .on(t.aId, t.bId, t.userId)
      .where(sql`user_id is not null`),
    index('pila_duelos_b_idx').on(t.bId),
    check('pila_duelo_orden_chk', sql`${t.aId} < ${t.bId}`),
    check(
      'pila_duelo_primero_chk',
      sql`${t.primeroId} is null or ${t.primeroId} in (${t.aId}, ${t.bId})`,
    ),
    check('pila_duelo_region_chk', sql`${t.region} in ${REGIONES_SQL}`),
  ],
);

/** Un reporte por actor y por aporte. `cuenta`: quien reportó ya había contestado cinco aportes. */
export const pilaReportes = pgTable(
  'pila_reportes',
  {
    senalId: bigint('senal_id', { mode: 'number' })
      .notNull()
      .references(() => senales.id, { onDelete: 'cascade' }),
    actorId: bigint('actor_id', { mode: 'number' })
      .notNull()
      .references(() => actores.id),
    motivo: text('motivo').notNull(),
    cuenta: boolean('cuenta').notNull(),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.senalId, t.actorId], name: 'pila_reportes_pk' }),
    check(
      'pila_reporte_motivo_chk',
      sql`${t.motivo} in ('insulta','datos_personales','fuera_de_tema')`,
    ),
  ],
);

/** Quién retuvo o devolvió un aporte, cuándo y por qué. Los reportes cuentan desde la última devolución. */
export const pilaDecisiones = pgTable(
  'pila_decisiones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    senalId: bigint('senal_id', { mode: 'number' })
      .notNull()
      .references(() => senales.id, { onDelete: 'cascade' }),
    decision: text('decision').notNull(),
    origen: text('origen').notNull(),
    adminId: integer('admin_id').references(() => users.id),
    motivo: text('motivo').notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('pila_decisiones_senal_idx').on(t.senalId, t.creadaEn),
    check('pila_decision_chk', sql`${t.decision} in ('retener','devolver')`),
    check('pila_decision_origen_chk', sql`${t.origen} in ('reportes','gestion')`),
    check('pila_decision_admin_chk', sql`(${t.origen} = 'gestion') = (${t.adminId} is not null)`),
  ],
);

export type PilaRespuesta = typeof pilaRespuestas.$inferSelect;
export type PilaDuelo = typeof pilaDuelos.$inferSelect;
export type PilaReporte = typeof pilaReportes.$inferSelect;
export type PilaDecision = typeof pilaDecisiones.$inferSelect;
