/**
 * Life areas domain — Wheel-of-Life style self-assessment over 12 areas
 * with 60 subcategories. Aggressively consolidated from v1's 21 tables.
 *
 * Kept (10 tables):
 *   - life_areas (catalog of 12)
 *   - life_area_subcategories (catalog of 60, 5 per area)
 *   - life_area_quiz_questions (catalog)
 *   - life_area_quiz_responses (per-user, currentValue + desiredValue)
 *   - user_life_area_state (per-user-per-area: score, level, mastery,
 *     streak, currency — all aggregations folded into one row)
 *   - life_area_actions (catalog)
 *   - life_area_action_completions (per-user)
 *   - life_area_milestones (per-user achievement records)
 *   - life_area_xp_log (event stream for area-specific XP)
 *   - life_area_chests (per-user, periodic rewards)
 *
 * Dropped from v1 (folded into other tables):
 *   - life_area_levels / streaks / mastery / currency → user_life_area_state
 *   - life_area_indicators → life_area_milestones (kind discriminator)
 *   - life_area_notifications → general `notifications`
 *   - life_area_social_interactions → community interactions
 *   - life_area_community_stats → compute on read
 *   - life_area_badges + user_life_area_badges → general `badges` with
 *     life_area_id tagged in payload
 *   - life_area_challenges + user_life_area_challenges → general
 *     `challenges` with life_area_id tagged in payload
 *   - life_area_quizzes → only questions kept; the v1 "quiz" wrapper
 *     was a metadata-only table.
 */
import { sql } from 'drizzle-orm';
import { boolean, index, integer, json, pgTable, real, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const lifeAreas = pgTable(
  'life_areas',
  {
    id: serial('id').primaryKey(),
    /** 'salud' | 'dinero' | 'relaciones' | 'trabajo' | 'crecimiento' | … */
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    iconName: text('icon_name'),
    /** Tailwind-friendly CSS color token (matches the design system). */
    accentColor: text('accent_color'),
    orderIndex: integer('order_index').notNull(),
    isActive: boolean('is_active').notNull().default(true),
  },
  (t) => [uniqueIndex('life_areas_slug_unique').on(t.slug)],
);

export type LifeArea = typeof lifeAreas.$inferSelect;
export type NewLifeArea = typeof lifeAreas.$inferInsert;

export const lifeAreaSubcategories = pgTable(
  'life_area_subcategories',
  {
    id: serial('id').primaryKey(),
    lifeAreaId: integer('life_area_id')
      .notNull()
      .references(() => lifeAreas.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    orderIndex: integer('order_index').notNull(),
  },
  (t) => [
    uniqueIndex('life_area_subcategories_unique').on(t.lifeAreaId, t.slug),
    index('life_area_subcategories_area_idx').on(t.lifeAreaId, t.orderIndex),
  ],
);

export type LifeAreaSubcategory = typeof lifeAreaSubcategories.$inferSelect;
export type NewLifeAreaSubcategory = typeof lifeAreaSubcategories.$inferInsert;

export const lifeAreaQuizQuestions = pgTable(
  'life_area_quiz_questions',
  {
    id: serial('id').primaryKey(),
    lifeAreaId: integer('life_area_id')
      .notNull()
      .references(() => lifeAreas.id, { onDelete: 'cascade' }),
    subcategoryId: integer('subcategory_id').references(() => lifeAreaSubcategories.id, { onDelete: 'set null' }),
    /** 'current' (where you are) | 'desired' (where you want to be) */
    category: text('category').notNull().default('current'),
    /** 'scale' (0-10) | 'mc' (multiple choice) | 'text' (free form) */
    questionType: text('question_type').notNull().default('scale'),
    prompt: text('prompt').notNull(),
    /** For mc questions: array of choices. */
    choices: json('choices'),
    orderIndex: integer('order_index').notNull(),
    isActive: boolean('is_active').notNull().default(true),
  },
  (t) => [
    index('life_area_quiz_questions_area_idx').on(t.lifeAreaId, t.orderIndex),
    index('life_area_quiz_questions_category_idx').on(t.category),
  ],
);

export type LifeAreaQuizQuestion = typeof lifeAreaQuizQuestions.$inferSelect;
export type NewLifeAreaQuizQuestion = typeof lifeAreaQuizQuestions.$inferInsert;

/**
 * Per-user response to a quiz question. Frontend uses 0-10 scale,
 * backend stores 0-100 via SCORE_MAPPING (preserved from v1 memory).
 * Both currentValue + desiredValue live on the same row when the
 * question category is 'current' (the desired pair is fetched/written
 * by question id pair logic in the application service).
 */
export const lifeAreaQuizResponses = pgTable(
  'life_area_quiz_responses',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: integer('question_id')
      .notNull()
      .references(() => lifeAreaQuizQuestions.id, { onDelete: 'cascade' }),
    /** Backend-scaled 0-100. Null when textValue is set. */
    currentValue: integer('current_value'),
    desiredValue: integer('desired_value'),
    /** Free-form text response for question_type='text'. */
    textValue: text('text_value'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex('life_area_quiz_responses_unique').on(t.userId, t.questionId),
    index('life_area_quiz_responses_user_idx').on(t.userId),
  ],
);

export type LifeAreaQuizResponse = typeof lifeAreaQuizResponses.$inferSelect;
export type NewLifeAreaQuizResponse = typeof lifeAreaQuizResponses.$inferInsert;

/**
 * Per-user-per-area aggregated state. Replaces v1's separate
 * lifeAreaScores / lifeAreaLevels / lifeAreaStreaks / lifeAreaMastery
 * / lifeAreaCurrency tables. One row per (user, life_area).
 */
export const userLifeAreaState = pgTable(
  'user_life_area_state',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lifeAreaId: integer('life_area_id')
      .notNull()
      .references(() => lifeAreas.id, { onDelete: 'cascade' }),
    /** Current score 0-100, computed from quiz responses. */
    currentScore: real('current_score').notNull().default(0),
    /** Desired score 0-100. */
    desiredScore: real('desired_score').notNull().default(0),
    /** Cached gap = desired - current. */
    gap: real('gap').notNull().default(0),
    xp: integer('xp').notNull().default(0),
    level: integer('level').notNull().default(1),
    /** 0-100 mastery, blends score + actions completed. */
    mastery: integer('mastery').notNull().default(0),
    /** Per-area "currency" earned via actions/challenges. Spent on chests. */
    currency: integer('currency').notNull().default(0),
    streakDays: integer('streak_days').notNull().default(0),
    longestStreakDays: integer('longest_streak_days').notNull().default(0),
    lastActiveDate: text('last_active_date'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex('user_life_area_state_unique').on(t.userId, t.lifeAreaId),
    index('user_life_area_state_user_idx').on(t.userId),
  ],
);

export type UserLifeAreaState = typeof userLifeAreaState.$inferSelect;
export type NewUserLifeAreaState = typeof userLifeAreaState.$inferInsert;

export const lifeAreaActions = pgTable(
  'life_area_actions',
  {
    id: serial('id').primaryKey(),
    lifeAreaId: integer('life_area_id')
      .notNull()
      .references(() => lifeAreas.id, { onDelete: 'cascade' }),
    subcategoryId: integer('subcategory_id').references(() => lifeAreaSubcategories.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    /** XP awarded on completion. */
    xpReward: integer('xp_reward').notNull().default(10),
    /** Currency awarded on completion. */
    currencyReward: integer('currency_reward').notNull().default(0),
    /** Estimated minutes — used for action triage. */
    estimatedMinutes: integer('estimated_minutes'),
    isActive: boolean('is_active').notNull().default(true),
  },
  (t) => [index('life_area_actions_area_idx').on(t.lifeAreaId)],
);

export type LifeAreaAction = typeof lifeAreaActions.$inferSelect;
export type NewLifeAreaAction = typeof lifeAreaActions.$inferInsert;

export const lifeAreaActionCompletions = pgTable(
  'life_area_action_completions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    actionId: integer('action_id')
      .notNull()
      .references(() => lifeAreaActions.id, { onDelete: 'cascade' }),
    /** Optional reflection text the user attached. */
    reflection: text('reflection'),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('life_area_action_completions_user_idx').on(t.userId, t.completedAt.desc()),
    index('life_area_action_completions_action_idx').on(t.actionId),
  ],
);

export type LifeAreaActionCompletion = typeof lifeAreaActionCompletions.$inferSelect;
export type NewLifeAreaActionCompletion = typeof lifeAreaActionCompletions.$inferInsert;

/**
 * Per-user achievements within an area. Replaces v1's separate
 * lifeAreaIndicators table — kind discriminator covers both indicators
 * (e.g. "first 7-day streak") and milestones ("100 actions completed").
 */
export const lifeAreaMilestones = pgTable(
  'life_area_milestones',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lifeAreaId: integer('life_area_id')
      .notNull()
      .references(() => lifeAreas.id, { onDelete: 'cascade' }),
    /** 'streak' | 'score' | 'actions' | 'level_up' | 'custom' */
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    /** Whether the user has chosen to share this milestone publicly. */
    sharedAt: timestamp('shared_at', { withTimezone: true }),
    achievedAt: timestamp('achieved_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('life_area_milestones_user_area_idx').on(t.userId, t.lifeAreaId, t.achievedAt.desc())],
);

export type LifeAreaMilestone = typeof lifeAreaMilestones.$inferSelect;
export type NewLifeAreaMilestone = typeof lifeAreaMilestones.$inferInsert;

export const lifeAreaXpLog = pgTable(
  'life_area_xp_log',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lifeAreaId: integer('life_area_id')
      .notNull()
      .references(() => lifeAreas.id, { onDelete: 'cascade' }),
    /** Discriminator: 'action_completed' | 'milestone' | 'streak_bonus' | … */
    kind: text('kind').notNull(),
    xpDelta: integer('xp_delta').notNull(),
    sourceId: integer('source_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('life_area_xp_log_user_idx').on(t.userId, t.createdAt.desc())],
);

export type LifeAreaXpLog = typeof lifeAreaXpLog.$inferSelect;
export type NewLifeAreaXpLog = typeof lifeAreaXpLog.$inferInsert;

/**
 * Periodic reward chests. Awarded for streaks, milestones, level-ups.
 * `claimedAt` set when the user opens the chest and the reward is
 * applied to user_life_area_state.currency / xp.
 */
export const lifeAreaChests = pgTable(
  'life_area_chests',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lifeAreaId: integer('life_area_id')
      .notNull()
      .references(() => lifeAreas.id, { onDelete: 'cascade' }),
    /** 'common' | 'rare' | 'epic' */
    tier: text('tier').notNull().default('common'),
    /** Reward payload — { currency: 50, xp: 100, ... }. */
    reward: json('reward').notNull(),
    claimedAt: timestamp('claimed_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('life_area_chests_user_unclaimed_idx').on(t.userId, t.claimedAt),
    index('life_area_chests_area_idx').on(t.lifeAreaId),
  ],
);

export type LifeAreaChest = typeof lifeAreaChests.$inferSelect;
export type NewLifeAreaChest = typeof lifeAreaChests.$inferInsert;
