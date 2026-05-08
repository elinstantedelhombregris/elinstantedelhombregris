/**
 * Civic Assessment domain.
 *
 * The product's "civic profile" survey: 60-question assessment scored
 * across multiple axes (engagement, knowledge, impact, etc.). Each user
 * may take it many times (`civic_assessments`); the latest scores are
 * cached in `civic_profiles` for fast dashboard reads.
 *
 * Question text and scoring weights live in code (`packages/shared/`),
 * not in the DB — they change in lockstep with new app releases.
 */
import { sql } from 'drizzle-orm';
import { index, integer, json, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const civicAssessments = pgTable(
  'civic_assessments',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** 'in_progress' | 'completed' | 'abandoned' */
    status: text('status').notNull().default('in_progress'),
    /** Snapshotted question version this assessment is responding to. */
    questionsVersion: text('questions_version').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('civic_assessments_user_idx').on(t.userId, t.createdAt.desc()),
    index('civic_assessments_status_idx').on(t.status),
  ],
);

export type CivicAssessment = typeof civicAssessments.$inferSelect;
export type NewCivicAssessment = typeof civicAssessments.$inferInsert;

export const civicAssessmentResponses = pgTable(
  'civic_assessment_responses',
  {
    id: serial('id').primaryKey(),
    assessmentId: integer('assessment_id')
      .notNull()
      .references(() => civicAssessments.id, { onDelete: 'cascade' }),
    questionId: text('question_id').notNull(),
    /** Numeric value (1..5 for Likert, 0/1 for boolean) — easier to
     *  aggregate than free-form. */
    value: real('value').notNull(),
    /** Free-form text for "explain your answer" follow-ups. */
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('civic_assessment_responses_assessment_idx').on(t.assessmentId)],
);

export type CivicAssessmentResponse = typeof civicAssessmentResponses.$inferSelect;
export type NewCivicAssessmentResponse = typeof civicAssessmentResponses.$inferInsert;

/**
 * Cached scores from the user's most recent completed assessment.
 * Recomputed on completion, read on every dashboard render.
 */
export const civicProfiles = pgTable(
  'civic_profiles',
  {
    userId: integer('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Per-axis scores keyed by axis id (e.g. { engagement: 72, ... }). */
    scores: json('scores').notNull(),
    /** Computed bucket: 'observador' | 'participante' | 'organizador' | ... */
    archetype: text('archetype'),
    lastAssessmentId: integer('last_assessment_id').references(() => civicAssessments.id),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
);

export type CivicProfile = typeof civicProfiles.$inferSelect;
export type NewCivicProfile = typeof civicProfiles.$inferInsert;
