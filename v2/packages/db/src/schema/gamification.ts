/**
 * Gamification domain — consolidated from v1's 13 sprawling tables to 8.
 *
 * What we kept:
 *   - user_levels: XP totals + current level per user
 *   - challenges + challenge_steps + user_challenge_progress
 *   - badges + user_badges
 *   - daily_activity: stream of XP-earning events (replaces v1's
 *     userActions / userProgress / userCommitments / userDailyActivity)
 *   - rankings: weekly + monthly + province rankings collapsed into one
 *     table keyed by (period_kind, period_start[, scope]).
 */
import { sql } from 'drizzle-orm';
import { boolean, index, integer, json, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

 
import { geographicLocations } from './geographic';
import { users } from './users';

export const userLevels = pgTable(
  'user_levels',
  {
    userId: integer('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Total XP across all activities. Recompute-on-read disabled in favour of
     *  incremental updates from `daily_activity` writes. */
    xp: integer('xp').notNull().default(0),
    level: integer('level').notNull().default(1),
    streakDays: integer('streak_days').notNull().default(0),
    longestStreakDays: integer('longest_streak_days').notNull().default(0),
    /** Last day this user did anything XP-earning. Used to advance/reset streaks. */
    lastActiveDate: text('last_active_date'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
);

export type UserLevel = typeof userLevels.$inferSelect;
export type NewUserLevel = typeof userLevels.$inferInsert;

export const challenges = pgTable(
  'challenges',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    /** 'daily' | 'weekly' | 'monthly' | 'one_time' */
    cadence: text('cadence').notNull(),
    /** XP awarded on completion. */
    xpReward: integer('xp_reward').notNull().default(0),
    /** Optional badge id auto-awarded on completion. */
    badgeId: integer('badge_id'),
    isActive: boolean('is_active').notNull().default(true),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('challenges_slug_unique').on(t.slug),
    index('challenges_active_idx').on(t.isActive, t.cadence),
  ],
);

export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;

export const challengeSteps = pgTable(
  'challenge_steps',
  {
    id: serial('id').primaryKey(),
    challengeId: integer('challenge_id')
      .notNull()
      .references(() => challenges.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    orderIndex: integer('order_index').notNull(),
    /** Optional XP bonus for completing this specific step. */
    xpReward: integer('xp_reward').notNull().default(0),
  },
  (t) => [index('challenge_steps_challenge_idx').on(t.challengeId, t.orderIndex)],
);

export type ChallengeStep = typeof challengeSteps.$inferSelect;
export type NewChallengeStep = typeof challengeSteps.$inferInsert;

export const userChallengeProgress = pgTable(
  'user_challenge_progress',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    challengeId: integer('challenge_id')
      .notNull()
      .references(() => challenges.id, { onDelete: 'cascade' }),
    /** [stepId, ...] completed in order. */
    stepsCompleted: json('steps_completed').notNull().default(sql`'[]'::json`),
    /** 'in_progress' | 'completed' | 'abandoned' */
    status: text('status').notNull().default('in_progress'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex('user_challenge_progress_unique').on(t.userId, t.challengeId),
    index('user_challenge_progress_user_status_idx').on(t.userId, t.status),
  ],
);

export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
export type NewUserChallengeProgress = typeof userChallengeProgress.$inferInsert;

export const badges = pgTable(
  'badges',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    iconUrl: text('icon_url'),
    /** 'bronze' | 'silver' | 'gold' | 'platinum' */
    tier: text('tier').notNull().default('bronze'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('badges_slug_unique').on(t.slug)],
);

export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;

export const userBadges = pgTable(
  'user_badges',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    badgeId: integer('badge_id')
      .notNull()
      .references(() => badges.id, { onDelete: 'cascade' }),
    earnedAt: timestamp('earned_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('user_badges_unique').on(t.userId, t.badgeId),
    index('user_badges_user_idx').on(t.userId),
  ],
);

export type UserBadge = typeof userBadges.$inferSelect;
export type NewUserBadge = typeof userBadges.$inferInsert;

/**
 * Stream of XP-earning events. Replaces v1's userActions /
 * userProgress / userCommitments / userDailyActivity. We rely on this
 * to recompute streaks and to populate the activity feed.
 */
export const dailyActivity = pgTable(
  'daily_activity',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** ISO date YYYY-MM-DD in the user's local TZ (server enforces UTC for now). */
    activityDate: text('activity_date').notNull(),
    /** Discriminator: 'lesson_completed' | 'quiz_passed' | 'commitment_kept' | … */
    kind: text('kind').notNull(),
    /** XP earned by this event. */
    xpAwarded: integer('xp_awarded').notNull().default(0),
    /** Renderer payload — shape per kind. */
    payload: json('payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('daily_activity_user_date_idx').on(t.userId, t.activityDate.desc()),
    index('daily_activity_kind_idx').on(t.kind),
  ],
);

export type DailyActivity = typeof dailyActivity.$inferSelect;
export type NewDailyActivity = typeof dailyActivity.$inferInsert;

/**
 * Cached leaderboard rankings. Replaces v1's three separate ranking
 * tables (weekly/monthly/province) with a single shape keyed by
 * (period_kind, period_start, scope_kind, scope_id).
 */
export const rankings = pgTable(
  'rankings',
  {
    id: serial('id').primaryKey(),
    /** 'weekly' | 'monthly' | 'all_time' */
    periodKind: text('period_kind').notNull(),
    /** First day of the period (UTC). NULL for all_time. */
    periodStart: timestamp('period_start', { withTimezone: true }),
    /** 'global' | 'province' — what the ranking is scoped to. */
    scopeKind: text('scope_kind').notNull().default('global'),
    /** When scopeKind='province', the province id. NULL otherwise. */
    scopeId: integer('scope_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rank: integer('rank').notNull(),
    xp: integer('xp').notNull(),
    computedAt: timestamp('computed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('rankings_unique').on(t.periodKind, t.periodStart, t.scopeKind, t.scopeId, t.userId),
    index('rankings_period_scope_rank_idx').on(t.periodKind, t.periodStart, t.scopeKind, t.scopeId, t.rank),
  ],
);

export type Ranking = typeof rankings.$inferSelect;
export type NewRanking = typeof rankings.$inferInsert;
