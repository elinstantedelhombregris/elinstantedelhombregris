/**
 * Users domain schema.
 *
 * Single-purpose, ≤ 300 LOC per the project's hard cap (see
 * docs/AI_AGENT_GREENFIELD_INSTRUCTIONS.md §2.3).
 *
 * Auth-related tables (sessions, refresh tokens, email verification,
 * password reset, 2FA) live in `auth.ts` to keep this file focused on
 * the user identity itself.
 */
import { sql } from 'drizzle-orm';
import { boolean, index, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),

    // Identity
    username: text('username').notNull(),
    email: text('email').notNull(),
    name: text('name').notNull(),

    // Credentials — bcrypt hash, never plain
    passwordHash: text('password_hash').notNull(),

    // Optional profile
    location: text('location'),
    bio: text('bio'),
    avatarUrl: text('avatar_url'),

    // Account lifecycle
    isActive: boolean('is_active').notNull().default(true),
    emailVerified: boolean('email_verified').notNull().default(false),
    onboardingCompleted: boolean('onboarding_completed').notNull().default(false),

    // Privacy / preferences
    dataShareOptOut: boolean('data_share_opt_out').notNull().default(false),

    // Audit timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('users_username_unique').on(table.username),
    uniqueIndex('users_email_unique').on(table.email),
    index('users_active_idx').on(table.isActive),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
