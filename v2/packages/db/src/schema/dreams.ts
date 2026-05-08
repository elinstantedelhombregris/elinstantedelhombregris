/**
 * Dreams domain.
 *
 * Map-friendly user submissions: each dream is a free-form aspiration
 * + categorical tags + (in v1) a province. Cities currently lack
 * coordinates per the v1 db state, so the `geographic_locations`
 * table only supplies province-level pinning today.
 */
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

 
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
    /** Province scope. Cities aren't pinned (lat/lng all null in v1). */
    provinceId: integer('province_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
    cityId: integer('city_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
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
  ],
);

export type Dream = typeof dreams.$inferSelect;
export type NewDream = typeof dreams.$inferInsert;
