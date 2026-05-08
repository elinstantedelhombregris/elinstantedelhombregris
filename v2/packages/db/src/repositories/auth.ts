/**
 * AuthRepository — sessions, verification tokens, password resets, 2FA.
 *
 * The token-string-based tables (email verification, password reset,
 * 2FA backup codes) accept a *plain* token from the caller and hash it
 * with SHA-256 internally. Callers pass the plain token they delivered
 * to the user; the table only ever stores the hash.
 */
import { createHash } from 'node:crypto';

import { and, eq, gt, isNull } from 'drizzle-orm';

import {
  authSessions,
  emailVerificationTokens,
  passwordResetTokens,
  twoFactorBackupCodes,
  twoFactorSecrets,
} from '../schema/auth.js';

import type { Db } from '../client.js';
import type {
  AuthSession,
  NewAuthSession,
  TwoFactorBackupCode,
  TwoFactorSecret,
} from '../schema/auth.js';

function hashToken(plain: string): string {
  return createHash('sha256').update(plain, 'utf8').digest('hex');
}

export class AuthRepository {
  constructor(private readonly db: Db) {}

  // ---------- Sessions ----------

  async createSession(input: NewAuthSession): Promise<AuthSession> {
    const [row] = await this.db.insert(authSessions).values(input).returning();
    if (!row) throw new Error('Failed to insert auth session');
    return row;
  }

  async findActiveSessionByJti(jti: string): Promise<AuthSession | undefined> {
    const now = new Date();
    const [row] = await this.db
      .select()
      .from(authSessions)
      .where(and(eq(authSessions.jti, jti), isNull(authSessions.revokedAt), gt(authSessions.expiresAt, now)))
      .limit(1);
    return row;
  }

  async revokeSession(jti: string): Promise<void> {
    await this.db.update(authSessions).set({ revokedAt: new Date() }).where(eq(authSessions.jti, jti));
  }

  async revokeAllUserSessions(userId: number): Promise<void> {
    await this.db
      .update(authSessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)));
  }

  // ---------- Email verification ----------

  async createEmailVerificationToken(userId: number, plainToken: string, expiresAt: Date): Promise<void> {
    await this.db.insert(emailVerificationTokens).values({
      userId,
      tokenHash: hashToken(plainToken),
      expiresAt,
    });
  }

  async consumeEmailVerificationToken(plainToken: string): Promise<{ userId: number } | null> {
    const tokenHash = hashToken(plainToken);
    const now = new Date();
    const [row] = await this.db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          isNull(emailVerificationTokens.usedAt),
          gt(emailVerificationTokens.expiresAt, now),
        ),
      )
      .limit(1);
    if (!row) return null;
    await this.db
      .update(emailVerificationTokens)
      .set({ usedAt: now })
      .where(eq(emailVerificationTokens.id, row.id));
    return { userId: row.userId };
  }

  // ---------- Password reset ----------

  async createPasswordResetToken(userId: number, plainToken: string, expiresAt: Date): Promise<void> {
    await this.db.insert(passwordResetTokens).values({
      userId,
      tokenHash: hashToken(plainToken),
      expiresAt,
    });
  }

  async consumePasswordResetToken(plainToken: string): Promise<{ userId: number } | null> {
    const tokenHash = hashToken(plainToken);
    const now = new Date();
    const [row] = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      )
      .limit(1);
    if (!row) return null;
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, row.id));
    return { userId: row.userId };
  }

  /** Delete every reset token for a user (e.g. after they change password). */
  async clearPasswordResetTokens(userId: number): Promise<void> {
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }

  // ---------- 2FA ----------

  async upsertTwoFactorSecret(userId: number, secret: string): Promise<TwoFactorSecret> {
    const existing = await this.db
      .select()
      .from(twoFactorSecrets)
      .where(eq(twoFactorSecrets.userId, userId))
      .limit(1);
    if (existing[0]) {
      const [row] = await this.db
        .update(twoFactorSecrets)
        .set({ secret, enabled: false, enabledAt: null, updatedAt: new Date() })
        .where(eq(twoFactorSecrets.userId, userId))
        .returning();
      if (!row) throw new Error('Failed to update 2FA secret');
      return row;
    }
    const [row] = await this.db.insert(twoFactorSecrets).values({ userId, secret }).returning();
    if (!row) throw new Error('Failed to insert 2FA secret');
    return row;
  }

  async findTwoFactorSecret(userId: number): Promise<TwoFactorSecret | undefined> {
    const [row] = await this.db.select().from(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId)).limit(1);
    return row;
  }

  async enableTwoFactor(userId: number): Promise<void> {
    await this.db
      .update(twoFactorSecrets)
      .set({ enabled: true, enabledAt: new Date(), updatedAt: new Date() })
      .where(eq(twoFactorSecrets.userId, userId));
  }

  async disableTwoFactor(userId: number): Promise<void> {
    await this.db.delete(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
    await this.db.delete(twoFactorBackupCodes).where(eq(twoFactorBackupCodes.userId, userId));
  }

  async recordTwoFactorUsed(userId: number): Promise<void> {
    await this.db
      .update(twoFactorSecrets)
      .set({ lastUsedAt: new Date(), updatedAt: new Date() })
      .where(eq(twoFactorSecrets.userId, userId));
  }

  // ---------- 2FA backup codes ----------

  async replaceBackupCodes(userId: number, codeHashes: string[]): Promise<void> {
    await this.db.delete(twoFactorBackupCodes).where(eq(twoFactorBackupCodes.userId, userId));
    if (codeHashes.length === 0) return;
    await this.db
      .insert(twoFactorBackupCodes)
      .values(codeHashes.map((codeHash) => ({ userId, codeHash })));
  }

  async listUnusedBackupCodes(userId: number): Promise<TwoFactorBackupCode[]> {
    return this.db
      .select()
      .from(twoFactorBackupCodes)
      .where(and(eq(twoFactorBackupCodes.userId, userId), isNull(twoFactorBackupCodes.usedAt)));
  }

  async markBackupCodeUsed(id: number): Promise<void> {
    await this.db.update(twoFactorBackupCodes).set({ usedAt: new Date() }).where(eq(twoFactorBackupCodes.id, id));
  }
}
