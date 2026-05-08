/**
 * Coaching domain.
 *
 * AI-driven coaching conversations. Each session is a thread of
 * messages between the user and the AICompleter (Groq by default).
 * Templates seed the prompt library curators use for system messages.
 */
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const coachingSessions = pgTable(
  'coaching_sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title'),
    /** 'open' | 'archived' */
    status: text('status').notNull().default('open'),
    /** Optional template that seeded the session. */
    templateId: integer('template_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [index('coaching_sessions_user_idx').on(t.userId, t.updatedAt.desc())],
);

export type CoachingSession = typeof coachingSessions.$inferSelect;
export type NewCoachingSession = typeof coachingSessions.$inferInsert;

export const coachingMessages = pgTable(
  'coaching_messages',
  {
    id: serial('id').primaryKey(),
    sessionId: integer('session_id')
      .notNull()
      .references(() => coachingSessions.id, { onDelete: 'cascade' }),
    /** 'user' | 'assistant' | 'system' */
    role: text('role').notNull(),
    content: text('content').notNull(),
    /** Provider that generated the message ('groq', 'anthropic', etc.). */
    provider: text('provider'),
    /** Token usage for billing/quota tracking. */
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('coaching_messages_session_idx').on(t.sessionId, t.createdAt)],
);

export type CoachingMessage = typeof coachingMessages.$inferSelect;
export type NewCoachingMessage = typeof coachingMessages.$inferInsert;

/**
 * Curator-authored prompt templates. Surfaced as starting points in the
 * coaching UI. Live editable by admins; not user-generated.
 */
export const coachingPrompts = pgTable(
  'coaching_prompts',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    /** The actual system message body sent to the LLM. */
    systemPrompt: text('system_prompt').notNull(),
    /** Suggested conversation opener for the assistant. */
    starterMessage: text('starter_message'),
    /** Audience tag — empty = visible to everyone. */
    audience: text('audience'),
    isActive: integer('is_active').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [index('coaching_prompts_active_idx').on(t.isActive)],
);

export type CoachingPrompt = typeof coachingPrompts.$inferSelect;
export type NewCoachingPrompt = typeof coachingPrompts.$inferInsert;
