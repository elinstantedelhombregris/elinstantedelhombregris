/**
 * Mandato Vivo domain — territorial citizen governance.
 *
 * v1 had `territoryMandates` (per-province mandate state) and
 * `mandateSuggestions` (citizens suggesting policy). We keep the same
 * two tables; the AI-driven mandato-engine cron writes derived state
 * from pulse signals.
 */
import { sql } from 'drizzle-orm';
import { index, integer, json, pgTable, real, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

 
import { geographicLocations } from './geographic';
import { users } from './users';

/**
 * One row per province (and one for the federal scope, province_id=null).
 * Updated by the mandato-engine cron from accumulated pulse signals.
 */
export const territoryMandates = pgTable(
  'territory_mandates',
  {
    id: serial('id').primaryKey(),
    provinceId: integer('province_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
    /** Cached top-N policy themes ranked by signal strength. JSON array. */
    topThemes: json('top_themes'),
    /** Cached aggregate sentiment score (-1..+1). */
    sentiment: real('sentiment'),
    pulseCount: integer('pulse_count').notNull().default(0),
    lastComputedAt: timestamp('last_computed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [uniqueIndex('territory_mandates_province_unique').on(t.provinceId)],
);

export type TerritoryMandate = typeof territoryMandates.$inferSelect;
export type NewTerritoryMandate = typeof territoryMandates.$inferInsert;

export const mandateSuggestions = pgTable(
  'mandate_suggestions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provinceId: integer('province_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
    /** Free-form policy suggestion. */
    body: text('body').notNull(),
    /** Computed thematic tag (matched by mandato-engine). */
    theme: text('theme'),
    /** 'pending' | 'matched' | 'archived' | 'flagged' */
    status: text('status').notNull().default('pending'),
    supportCount: integer('support_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('mandate_suggestions_province_idx').on(t.provinceId),
    index('mandate_suggestions_theme_idx').on(t.theme),
    index('mandate_suggestions_status_idx').on(t.status),
  ],
);

export type MandateSuggestion = typeof mandateSuggestions.$inferSelect;
export type NewMandateSuggestion = typeof mandateSuggestions.$inferInsert;
