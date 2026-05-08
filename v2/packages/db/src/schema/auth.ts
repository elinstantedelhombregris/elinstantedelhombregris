/**
 * Auth domain schema — everything that supports the user identity but
 * isn't part of the user row itself: sessions, email verification,
 * password resets, 2FA.
 *
 * `users.passwordHash` lives on the users table; everything *temporary*
 * lives here so it can be deleted independently when used or expired.
 */
import { sql } from 'drizzle-orm';
import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// `.js` extension intentionally omitted: drizzle-kit's CJS loader
// resolves with no-extension paths; tsx and the runtime ESM loader
// handle both.
 
import { users } from './users';

/**
 * Refresh-token sessions.
 *
 * One row per active refresh token. The token itself is JWT-signed and
 * not stored — we only keep the `jti` (JWT id) so we can revoke a
 * specific token without invalidating every other session.
 *
 * On refresh, the old `jti` is revoked and a new row inserted (rotate).
 * On logout, the row's `revokedAt` is set.
 */
export const authSessions = pgTable(
  'auth_sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    /** JWT id from the refresh token. Unique. */
    jti: text('jti').notNull(),

    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),

    /** Last fingerprinting we have for the client. Best-effort, may be null. */
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
  },
  (t) => [
    uniqueIndex('auth_sessions_jti_unique').on(t.jti),
    index('auth_sessions_user_idx').on(t.userId),
    index('auth_sessions_expires_idx').on(t.expiresAt),
  ],
);

export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;

/**
 * Email verification tokens.
 *
 * Plaintext token (random hex) is sent to the user via email. We keep
 * a hash for lookup so an attacker reading the DB can't fabricate
 * verifications. `usedAt` is set on consumption; old rows are pruned
 * by a periodic job.
 */
export const emailVerificationTokens = pgTable(
  'email_verification_tokens',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('email_verification_tokens_hash_unique').on(t.tokenHash),
    index('email_verification_tokens_user_idx').on(t.userId),
  ],
);

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

/**
 * Password reset tokens. Same shape as email verification but separate
 * table so a single SQL `DELETE` can wipe all reset tokens for a user
 * without touching email-verification flow.
 */
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('password_reset_tokens_hash_unique').on(t.tokenHash),
    index('password_reset_tokens_user_idx').on(t.userId),
  ],
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Two-factor authentication setup.
 *
 * One row per user once they've set up 2FA. `secret` is the TOTP base32
 * shared secret encrypted at rest (we don't bother in dev; rotation
 * handled at a future ADR). `enabled` separates "set up but not yet
 * verified" from "active".
 */
export const twoFactorSecrets = pgTable(
  'two_factor_secrets',
  {
    userId: integer('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    secret: text('secret').notNull(),
    enabled: boolean('enabled').notNull().default(false),
    enabledAt: timestamp('enabled_at', { withTimezone: true }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
);

export type TwoFactorSecret = typeof twoFactorSecrets.$inferSelect;
export type NewTwoFactorSecret = typeof twoFactorSecrets.$inferInsert;

/**
 * Single-use 2FA backup codes. Each code is hashed (bcrypt) so a DB
 * read can't expose the codes. `usedAt` is set on consumption.
 */
export const twoFactorBackupCodes = pgTable(
  'two_factor_backup_codes',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    codeHash: text('code_hash').notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('two_factor_backup_codes_user_idx').on(t.userId)],
);

export type TwoFactorBackupCode = typeof twoFactorBackupCodes.$inferSelect;
export type NewTwoFactorBackupCode = typeof twoFactorBackupCodes.$inferInsert;
