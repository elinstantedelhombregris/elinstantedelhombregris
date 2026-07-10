/**
 * Schema Drizzle — SQLite local (spec §5). Única fuente de verdad de la DB.
 * Todo vive en el dispositivo: cero backend, cero sync (spec §3.7).
 *
 * Import relativo (no alias @/) para que drizzle-kit generate pueda cargar
 * el schema sin resolver paths de Metro.
 */

import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type {
  EstadoCompromiso,
  EstadoExpedicion,
  OrigenExpedicion,
  TipoEstrella,
  TipoUnlock,
} from '../game/types';

/** Estrellas del Cielo — cada captura real (spec §3.1). */
export const stars = sqliteTable('stars', {
  id: text('id').primaryKey(), // uuid
  tipo: text('tipo').$type<TipoEstrella>().notNull(),
  texto: text('texto'),
  photoUri: text('photo_uri'),
  lat: real('lat'),
  lng: real('lng'),
  fundadora: integer('fundadora', { mode: 'boolean' }).notNull().default(false),
  nocturna: integer('nocturna', { mode: 'boolean' }).notNull().default(false),
  fugaz: integer('fugaz', { mode: 'boolean' }).notNull().default(false),
  expeditionId: text('expedition_id'),
  expeditionStepKey: text('expedition_step_key'),
  /** Se asigna al completar una constelación (pegajoso, no se roba). */
  constelacionId: text('constelacion_id'),
  createdAt: text('created_at').notNull(), // ISO 8601
});

/** Bitácora privada — reflexiones de la luz VER. */
export const reflections = sqliteTable('reflections', {
  id: text('id').primaryKey(),
  preguntaId: text('pregunta_id').notNull(),
  texto: text('texto').notNull(),
  fecha: text('fecha').notNull(), // YYYY-MM-DD local
});

/** Micro-compromisos de la luz DAR — la confianza es la mecánica. */
export const commitments = sqliteTable('commitments', {
  id: text('id').primaryKey(),
  texto: text('texto').notNull(),
  categoria: text('categoria').notNull(),
  fecha: text('fecha').notNull(), // YYYY-MM-DD local
  estado: text('estado').$type<EstadoCompromiso>().notNull().default('pendiente'),
});

/** Un registro por día: qué luces se encendieron (spec §2). */
export const days = sqliteTable('days', {
  fecha: text('fecha').primaryKey(), // YYYY-MM-DD local
  ver: integer('ver', { mode: 'boolean' }).notNull().default(false),
  encender: integer('encender', { mode: 'boolean' }).notNull().default(false),
  dar: integer('dar', { mode: 'boolean' }).notNull().default(false),
  nocheCompleta: integer('noche_completa', { mode: 'boolean' })
    .notNull()
    .default(false),
});

/** Expediciones — quests multi-paso (spec §3.2). */
export const expeditions = sqliteTable('expeditions', {
  id: text('id').primaryKey(),
  plantillaId: text('plantilla_id').notNull(),
  titulo: text('titulo').notNull(),
  zona: text('zona').notNull(),
  meta: integer('meta').notNull(),
  estado: text('estado').$type<EstadoExpedicion>().notNull().default('activa'),
  origen: text('origen').$type<OrigenExpedicion>().notNull(),
  /** JSON array de hitos ya pagados, ej. "[25,50]". */
  hitosOtorgados: text('hitos_otorgados').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
});

/** Entradas de expedición: un paso jugado. */
export const expeditionEntries = sqliteTable('expedition_entries', {
  id: text('id').primaryKey(),
  expeditionId: text('expedition_id').notNull(),
  stepKey: text('step_key').notNull(),
  /** JSON con los datos de la micro-UI del paso. */
  data: text('data').notNull().default('{}'),
  starId: text('star_id'),
  createdAt: text('created_at').notNull(),
});

/** Ledger de brasas — append-only, jamás se edita ni borra (spec §3.3). */
export const emberLedger = sqliteTable('ember_ledger', {
  id: text('id').primaryKey(),
  delta: integer('delta').notNull(),
  motivo: text('motivo').notNull(),
  fecha: text('fecha').notNull(), // ISO 8601
});

/** Desbloqueos: cartas de lore, paletas, rangos alcanzados. */
export const unlocks = sqliteTable('unlocks', {
  id: text('id').primaryKey(),
  tipo: text('tipo').$type<TipoUnlock>().notNull(),
  clave: text('clave').notNull(),
  fecha: text('fecha').notNull(),
});

/** Nonces de chispa ya canjeados — anti-replay local (spec §3.5). */
export const redeemedNonces = sqliteTable('redeemed_nonces', {
  nonce: text('nonce').primaryKey(),
  fecha: text('fecha').notNull(),
});

/** Ajustes clave-valor (ritoFecha, paleta activa, flags de FTUE…). */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// Tipos de fila inferidos — los usan repos y pantallas.
export type StarRow = typeof stars.$inferSelect;
export type NewStarRow = typeof stars.$inferInsert;
export type ReflectionRow = typeof reflections.$inferSelect;
export type CommitmentRow = typeof commitments.$inferSelect;
export type DayRow = typeof days.$inferSelect;
export type ExpeditionRow = typeof expeditions.$inferSelect;
export type ExpeditionEntryRow = typeof expeditionEntries.$inferSelect;
export type EmberLedgerRow = typeof emberLedger.$inferSelect;
export type UnlockRow = typeof unlocks.$inferSelect;
export type RedeemedNonceRow = typeof redeemedNonces.$inferSelect;
export type SettingRow = typeof settings.$inferSelect;
