/**
 * Ensayos domain — long-form essay series.
 *
 * Content lives as MDX in `v2/content/ensayos/` (not in the database).
 * The DB tracks per-user interaction state: bookmarks, reading
 * progress, completion. The list of essays themselves is built at
 * compile time from the MDX files and exposed via @v2/shared.
 */
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const ensayoBookmarks = pgTable(
  'ensayo_bookmarks',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Slug from the MDX frontmatter (e.g. "la-libertad-de-las-libertades"). */
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('ensayo_bookmarks_unique').on(t.userId, t.slug)],
);

export type EnsayoBookmark = typeof ensayoBookmarks.$inferSelect;
export type NewEnsayoBookmark = typeof ensayoBookmarks.$inferInsert;

/**
 * Per-essay reading state for a user. Updated as the user scrolls
 * through the essay (debounced client-side). `progressPct` is 0-100;
 * `readAt` is set when the user reaches the end at least once.
 */
export const ensayoReadingProgress = pgTable(
  'ensayo_reading_progress',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    progressPct: integer('progress_pct').notNull().default(0),
    /** Total seconds the user has spent on the page (sum across visits). */
    timeSpentSec: integer('time_spent_sec').notNull().default(0),
    /** First time the user reached >=95% scroll. */
    readAt: timestamp('read_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex('ensayo_reading_progress_unique').on(t.userId, t.slug),
    index('ensayo_reading_progress_user_read_idx').on(t.userId, t.readAt),
  ],
);

export type EnsayoReadingProgress = typeof ensayoReadingProgress.$inferSelect;
export type NewEnsayoReadingProgress = typeof ensayoReadingProgress.$inferInsert;
