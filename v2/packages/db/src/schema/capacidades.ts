import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { fichasFuturo } from './fichas';
import { geographicLocations } from './geographic';
import { senales } from './senales';
import { users } from './users';

export const capacidades = pgTable(
  'capacidades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    senalId: uuid('senal_id')
      .notNull()
      .references(() => senales.idPublico),
    oferenteId: integer('oferente_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    huella: text('huella').notNull(),
    titulo: text('titulo').notNull(),
    tipo: text('tipo').notNull(),
    unidad: text('unidad').notNull(),
    cantidad: integer('cantidad'),
    desde: date('desde').notNull(),
    hasta: date('hasta').notNull(),
    territorioId: integer('territorio_id').references(() => geographicLocations.id),
    zona: text('zona').notNull(),
    restricciones: text('restricciones').notNull(),
    firma: text('firma').notNull(),
    autorizadaEn: timestamp('autorizada_en', { withTimezone: true }).notNull().defaultNow(),
    confirmadaEn: timestamp('confirmada_en', { withTimezone: true }).notNull().defaultNow(),
    cerrada: boolean('cerrada').notNull().default(false),
  },
  (t) => [
    unique('capacidades_recibo_unique').on(t.oferenteId, t.idLocal),
    check(
      'capacidades_cantidad_chk',
      sql`${t.cantidad} is null or ${t.cantidad} between 1 and 1000000`,
    ),
    check('capacidades_periodo_chk', sql`${t.desde} <= ${t.hasta}`),
    check(
      'capacidades_tipo_chk',
      sql`${t.tipo} in ('tiempo','espacio','equipo','material','servicio')`,
    ),
    index('capacidades_senal_idx').on(t.senalId),
    index('capacidades_territorio_idx').on(t.territorioId),
  ],
);
export const reservasCapacidad = pgTable(
  'reservas_capacidad',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    capacidadId: uuid('capacidad_id')
      .notNull()
      .references(() => capacidades.id),
    solicitanteId: integer('solicitante_id')
      .notNull()
      .references(() => users.id),
    fichaId: uuid('ficha_id')
      .notNull()
      .references(() => fichasFuturo.id),
    idLocal: uuid('id_local').notNull(),
    huella: text('huella').notNull(),
    cantidad: integer('cantidad'),
    paraFecha: date('para_fecha').notNull(),
    necesidad: text('necesidad').notNull(),
    compatibilidad: text('compatibilidad').notNull(),
    estado: text('estado').notNull().default('propuesta'),
    notaEntrega: text('nota_entrega'),
    discrepancia: text('discrepancia'),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadaEn: timestamp('actualizada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('reservas_recibo_unique').on(t.solicitanteId, t.idLocal),
    check(
      'reservas_cantidad_chk',
      sql`${t.cantidad} is null or ${t.cantidad} between 1 and 1000000`,
    ),
    check(
      'reservas_estado_chk',
      sql`${t.estado} in ('propuesta','reservada','entrega_declarada','entregada','discrepancia','cancelada','rechazada')`,
    ),
    index('reservas_capacidad_idx').on(t.capacidadId),
    index('reservas_solicitante_idx').on(t.solicitanteId),
    index('reservas_ficha_idx').on(t.fichaId),
  ],
);
