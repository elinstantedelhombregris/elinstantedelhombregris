/**
 * Geographic domain.
 *
 * Argentina-focused. Provinces and (eventually) cities live here. The
 * v1 production database stores only province-level geocoding for
 * dreams; cities are present as rows but with NULL coordinates. We
 * keep the same shape so a future backfill can populate coords without
 * a schema change.
 *
 * Province name normalization: API datasets use "Ciudad Autónoma de
 * Buenos Aires" while user input often has "Ciudad de Buenos Aires".
 * The CABA normalizer in `apps/api/src/features/geographic` (added in
 * P1) maps user input to canonical form before lookup.
 */
import { decimal, index, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const geographicLocations = pgTable(
  'geographic_locations',
  {
    id: serial('id').primaryKey(),
    /** 'province' | 'city' — the only kinds we model. */
    level: text('level').notNull(),

    /** Canonical name (e.g. "Buenos Aires", "Córdoba", "Ciudad Autónoma de Buenos Aires"). */
    name: text('name').notNull(),

    /** ISO 3166-2 code if applicable (AR-B, AR-X, AR-C, ...). */
    isoCode: text('iso_code'),

    /** Province this location belongs to. NULL for province-level rows. */
    provinceId: serial('province_id'),

    /** WGS84. Nullable: cities currently lack coords (see notes above). */
    latitude: decimal('latitude', { precision: 9, scale: 6 }),
    longitude: decimal('longitude', { precision: 9, scale: 6 }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('geographic_locations_level_name_unique').on(t.level, t.name),
    index('geographic_locations_province_idx').on(t.provinceId),
  ],
);

export type GeographicLocation = typeof geographicLocations.$inferSelect;
export type NewGeographicLocation = typeof geographicLocations.$inferInsert;
