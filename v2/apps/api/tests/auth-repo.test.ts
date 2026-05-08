/**
 * AuthRepository integration tests against the real Neon dev DB.
 *
 * Covers the load-bearing methods: session create + lookup + revoke,
 * email verification round-trip, password reset round-trip, 2FA upsert
 * + enable + disable.
 */
import '../src/load-env.js';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AuthRepository, eq, getDb, UsersRepository, users } from '@v2/db';

const hasDatabaseUrl = Boolean(process.env['DATABASE_URL']);
const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('AuthRepository', () => {
  const stamp = Date.now();
  const email = `auth_repo_${String(stamp)}@test.local`;
  let userId: number;
  let users_repo: UsersRepository;
  let auth_repo: AuthRepository;

  beforeAll(async () => {
    users_repo = new UsersRepository(getDb());
    auth_repo = new AuthRepository(getDb());
    const u = await users_repo.create({
      username: `auth_repo_${String(stamp)}`,
      email,
      name: 'Auth Repo Test',
      passwordHash: 'placeholder',
    });
    userId = u.id;
  });

  afterAll(async () => {
    // Cascade deletes via FK take care of dependent rows.
    await getDb().delete(users).where(eq(users.id, userId));
  });

  describe('sessions', () => {
    it('creates, finds, revokes', async () => {
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
      const created = await auth_repo.createSession({ userId, jti: `jti-${String(stamp)}-1`, expiresAt });
      expect(created.userId).toBe(userId);

      const found = await auth_repo.findActiveSessionByJti(created.jti);
      expect(found?.id).toBe(created.id);

      await auth_repo.revokeSession(created.jti);
      const afterRevoke = await auth_repo.findActiveSessionByJti(created.jti);
      expect(afterRevoke).toBeUndefined();
    });

    it('does not return expired sessions as active', async () => {
      const expiresAt = new Date(Date.now() - 1000); // already expired
      const s = await auth_repo.createSession({ userId, jti: `jti-${String(stamp)}-expired`, expiresAt });
      const found = await auth_repo.findActiveSessionByJti(s.jti);
      expect(found).toBeUndefined();
    });
  });

  describe('email verification', () => {
    it('creates and consumes a token exactly once', async () => {
      const token = `verify-${String(stamp)}-1`;
      await auth_repo.createEmailVerificationToken(userId, token, new Date(Date.now() + 60_000));

      const first = await auth_repo.consumeEmailVerificationToken(token);
      expect(first?.userId).toBe(userId);

      const second = await auth_repo.consumeEmailVerificationToken(token);
      expect(second).toBeNull();
    });

    it('rejects unknown tokens', async () => {
      const result = await auth_repo.consumeEmailVerificationToken('does-not-exist');
      expect(result).toBeNull();
    });

    it('rejects expired tokens', async () => {
      const token = `verify-${String(stamp)}-expired`;
      await auth_repo.createEmailVerificationToken(userId, token, new Date(Date.now() - 1000));
      const result = await auth_repo.consumeEmailVerificationToken(token);
      expect(result).toBeNull();
    });
  });

  describe('password reset', () => {
    it('creates, consumes once, then rejects', async () => {
      const token = `reset-${String(stamp)}-1`;
      await auth_repo.createPasswordResetToken(userId, token, new Date(Date.now() + 60_000));
      const first = await auth_repo.consumePasswordResetToken(token);
      expect(first?.userId).toBe(userId);
      const second = await auth_repo.consumePasswordResetToken(token);
      expect(second).toBeNull();
    });
  });

  describe('two-factor', () => {
    it('upserts, enables, finds, disables', async () => {
      const upsert = await auth_repo.upsertTwoFactorSecret(userId, 'secret-1');
      expect(upsert.enabled).toBe(false);

      await auth_repo.enableTwoFactor(userId);
      const found = await auth_repo.findTwoFactorSecret(userId);
      expect(found?.enabled).toBe(true);

      // Re-upsert resets enabled flag (e.g. user re-enrolling).
      const reupsert = await auth_repo.upsertTwoFactorSecret(userId, 'secret-2');
      expect(reupsert.enabled).toBe(false);
      expect(reupsert.secret).toBe('secret-2');

      await auth_repo.disableTwoFactor(userId);
      const afterDisable = await auth_repo.findTwoFactorSecret(userId);
      expect(afterDisable).toBeUndefined();
    });

    it('replaceBackupCodes wipes old codes and inserts new ones', async () => {
      await auth_repo.upsertTwoFactorSecret(userId, 'secret-3');
      await auth_repo.replaceBackupCodes(userId, ['hash1', 'hash2', 'hash3']);
      const codes = await auth_repo.listUnusedBackupCodes(userId);
      expect(codes).toHaveLength(3);

      await auth_repo.replaceBackupCodes(userId, ['hashA']);
      const newCodes = await auth_repo.listUnusedBackupCodes(userId);
      expect(newCodes).toHaveLength(1);
      expect(newCodes[0]?.codeHash).toBe('hashA');

      const code = newCodes[0];
      if (code) {
        await auth_repo.markBackupCodeUsed(code.id);
        const remaining = await auth_repo.listUnusedBackupCodes(userId);
        expect(remaining).toHaveLength(0);
      }

      await auth_repo.disableTwoFactor(userId);
    });
  });
});
