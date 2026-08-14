/**
 * Dreams domain.
 *
 * Map-friendly user submissions: each dream is a free-form aspiration
 * + categorical tags + a location.
 *
 * Desde la spec 2 (`docs/specs/2026-07-26-mapa-2-la-verdad-de-la-ubicacion.md`)
 * la ubicación ya no es solo la provincia: cada voz lleva su punto publicado,
 * su precisión, su rol y su sensibilidad. `province` sigue siendo el default,
 * así que toda fila anterior queda exactamente donde estaba.
 *
 * ── RETIRADA (migración 0022, 2026-08-13) ──────────────────────────────────
 *
 * **Ya no recibe escrituras: toda señal vive en `senales`.** Se conserva sólo
 * para poder auditar lo que quedó escrito antes del corte, y por eso la
 * migración que crea `senales` NO la borra: borrar es irreversible y no tiene
 * por qué compartir transacción con la que crea. El `DROP` es la Task 36 de
 * `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`.
 *
 * La tabla lleva el mismo aviso como `COMMENT ON TABLE` en la base, con fecha y
 * número de migración adentro: quien abre `psql` para entender una tabla rara
 * casi nunca tiene el repo al lado.
 */
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';


import { geoColumns } from './_geo-columns';
import { geographicLocations } from './geographic';
import { users } from './users';

export const dreams = pgTable(
  'dreams',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    /** Display name shown publicly when user_id is null (anon submissions). */
    submittedAs: text('submitted_as'),
    body: text('body').notNull(),
    /** Free-form taxonomic tag (one per dream — favours faceted browse). */
    category: text('category'),
    /** Ancla administrativa. Sigue existiendo aunque haya punto. */
    provinceId: integer('province_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
    cityId: integer('city_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
    ...geoColumns,
    /** 'pending' | 'approved' | 'rejected' */
    status: text('status').notNull().default('approved'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('dreams_province_idx').on(t.provinceId),
    index('dreams_category_idx').on(t.category),
    index('dreams_status_idx').on(t.status),
    /** Recorte por bbox del endpoint del mapa. Parcial: la mayoría no tiene punto. */
    index('dreams_geo_idx').on(t.lat, t.lng).where(sql`lat is not null`),
  ],
);

export type Dream = typeof dreams.$inferSelect;
export type NewDream = typeof dreams.$inferInsert;
