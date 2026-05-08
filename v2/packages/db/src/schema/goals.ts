/**
 * Goals domain.
 *
 * User-set civic goals + weekly check-ins. The cadence is intentionally
 * simple (weekly reflection); coaching prompts adapt to streak + goal
 * progress.
 */
import { sql } from 'drizzle-orm';
import { boolean, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const civicGoals = pgTable(
  'civic_goals',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    /** 'engagement' | 'knowledge' | 'community' | 'impact' | 'territorial' */
    category: text('category').notNull(),
    /** Self-rated importance (1..5). Used to prioritize coaching prompts. */
    priority: integer('priority').notNull().default(3),
    /** 'active' | 'paused' | 'completed' | 'abandoned' */
    status: text('status').notNull().default('active'),
    targetDate: timestamp('target_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('civic_goals_user_status_idx').on(t.userId, t.status),
    index('civic_goals_category_idx').on(t.category),
  ],
);

export type CivicGoal = typeof civicGoals.$inferSelect;
export type NewCivicGoal = typeof civicGoals.$inferInsert;

export const weeklyCheckins = pgTable(
  'weekly_checkins',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Monday of the week this check-in covers (UTC). */
    weekStart: timestamp('week_start', { withTimezone: true }).notNull(),
    /** Self-reported progress score (1..5). */
    progressScore: integer('progress_score').notNull(),
    /** Free-form: what went well / what didn't. */
    reflection: text('reflection'),
    /** Did the user actually take action? */
    actedOnGoals: boolean('acted_on_goals').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('weekly_checkins_user_week_idx').on(t.userId, t.weekStart.desc())],
);

export type WeeklyCheckin = typeof weeklyCheckins.$inferSelect;
export type NewWeeklyCheckin = typeof weeklyCheckins.$inferInsert;
