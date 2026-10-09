import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import type { EstadoExportacion, SolicitudExportacion } from '@v2/shared';

/** No identifica al solicitante: sólo contiene el alcance público y una clave de reintento. */
export const exportaciones = pgTable(
  'exportaciones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    idSolicitud: uuid('id_solicitud').notNull().unique(),
    huella: text('huella').notNull(),
    solicitud: jsonb('solicitud').$type<SolicitudExportacion>().notNull(),
    estado: text('estado').$type<EstadoExportacion>().notNull().default('solicitado'),
    fase: text('fase').notNull().default('senales'),
    revisionPublica: integer('revision_publica').notNull(),
    corte: timestamp('corte', { withTimezone: true }).notNull().defaultNow(),
    venceEn: timestamp('vence_en', { withTimezone: true }).notNull(),
    cursor: uuid('cursor'),
    orden: integer('orden').notNull().default(0),
    registros: integer('registros').notNull().default(0),
    total: integer('total').notNull().default(0),
    textosReservados: integer('textos_reservados').notNull().default(0),
    bytes: integer('bytes').notNull().default(0),
    lease: uuid('lease'),
    leaseHasta: timestamp('lease_hasta', { withTimezone: true }),
    intentos: integer('intentos').notNull().default(0),
    fallos: integer('fallos').notNull().default(0),
    mensaje: text('mensaje'),
    actualizadaEn: timestamp('actualizada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('exportaciones_cola_idx').on(t.estado, t.leaseHasta),
    check(
      'exportaciones_estado_chk',
      sql`${t.estado} in ('solicitado','preparando','disponible','vencido','fallido')`,
    ),
  ],
);

/** Fragmentos UTF-8 acotados. ZIP se construye por flujo, sin archivo residente en RAM. */
export const exportacionPartes = pgTable(
  'exportacion_partes',
  {
    trabajoId: uuid('trabajo_id')
      .notNull()
      .references(() => exportaciones.id, { onDelete: 'cascade' }),
    orden: integer('orden').notNull(),
    archivo: text('archivo').notNull(),
    contenido: text('contenido').notNull(),
    bytes: integer('bytes').notNull(),
    sha256: text('sha256').notNull(),
  },
  (t) => [primaryKey({ columns: [t.trabajoId, t.orden] })],
);

/** El trigger de la migración invalida copias cuando cambia una fuente pública existente. */
export const exportacionRevision = pgTable('exportacion_revision', {
  id: integer('id').primaryKey(),
  revision: integer('revision').notNull().default(1),
});
