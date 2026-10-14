import { integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { pruebasTerritoriales } from './diseno';
import { iniciativas, iniciativaMilestones, iniciativaTasks } from './iniciativas';
import { users } from './users';

export const pruebaEjecuciones = pgTable(
  'prueba_ejecuciones',
  {
    pruebaId: uuid('prueba_id')
      .primaryKey()
      .references(() => pruebasTerritoriales.id, { onDelete: 'cascade' }),
    iniciativaId: integer('iniciativa_id')
      .notNull()
      .references(() => iniciativas.id),
    tareaId: integer('tarea_id')
      .notNull()
      .references(() => iniciativaTasks.id),
    hitoId: integer('hito_id')
      .notNull()
      .references(() => iniciativaMilestones.id),
    creadorId: integer('creador_id')
      .notNull()
      .references(() => users.id),
    idLocal: uuid('id_local').notNull(),
    huella: text('huella').notNull(),
    recursos: text('recursos').notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('ejecucion_envio_unique').on(t.creadorId, t.idLocal),
    unique('ejecucion_tarea_unique').on(t.tareaId),
    unique('ejecucion_hito_unique').on(t.hitoId),
  ],
);
