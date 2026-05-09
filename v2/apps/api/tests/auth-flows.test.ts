/**
 * Integration tests for the Phase 2 auth flows:
 *   - refresh-token rotation (old jti invalidated)
 *   - logout revokes session
 *   - email verification roundtrip
 *   - password reset roundtrip
 *   - 2FA setup → enable
 *
 * Hits the real Neon dev database. Each test creates a uniquely-named
 * user and cleans up. The email sender is replaced with a capturing
 * stub so we can read the token that would have been sent.
 */
import '../src/load-env.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import speakeasy from 'speakeasy';
import supertest from 'supertest';

import { eq, getDb, UsersRepository, users } from '@v2/db';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/features/auth/password.js';
import {
  type EmailMessage,
  type EmailSender,
  setEmailSender,
} from '../src/lib/email.js';

class CapturingEmailSender implements EmailSender {
  public sent: EmailMessage[] = [];

  send(message: EmailMessage): Promise<void> {
    this.sent.push(message);
    return Promise.resolve();
  }
}

function extractTokenFromEmail(message: EmailMessage): string {
  const m = /token=([a-f0-9]{32,})/i.exec(message.text);
  if (!m) throw new Error(`No token in email: ${message.text}`);
  return m[1] ?? '';
}

const hasDatabaseUrl = Boolean(process.env['DATABASE_URL']);
const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Phase 2 auth flows', () => {
  const app = createApp();
  const request = supertest(app);
  const stamp = Date.now();
  const password = 'correcthorsebatterystaple12';
  const emailA = `flow_a_${String(stamp)}@test.local`;
  const emailB = `flow_b_${String(stamp)}@test.local`;
  const emailC = `flow_c_${String(stamp)}@test.local`;
  const emailD = `flow_d_${String(stamp)}@test.local`;
  const emailE = `flow_e_${String(stamp)}@test.local`;
  let mailbox: CapturingEmailSender;

  beforeAll(async () => {
    mailbox = new CapturingEmailSender();
    setEmailSender(mailbox);
    // Pre-create users via the repository to bypass the per-IP
    // register rate limit (3/hour) which would block the 4th setup.
    const repo = new UsersRepository(getDb());
    const passwordHash = await hashPassword(password);
    await Promise.all([
      repo.create({ username: `flow_rot_${String(stamp)}`, email: emailA, name: 'Rotation', passwordHash }),
      repo.create({ username: `flow_logout_${String(stamp)}`, email: emailB, name: 'Logout', passwordHash }),
      repo.create({ username: `flow_verify_${String(stamp)}`, email: emailC, name: 'Verify', passwordHash }),
      repo.create({ username: `flow_reset_${String(stamp)}`, email: emailD, name: 'Reset', passwordHash }),
      repo.create({ username: `flow_2fa_${String(stamp)}`, email: emailE, name: 'TwoFA', passwordHash }),
    ]);
  });

  beforeEach(() => {
    mailbox.sent = [];
  });

  afterAll(async () => {
    const repo = new UsersRepository(getDb());
    for (const email of [emailA, emailB, emailC, emailD, emailE]) {
      const u = await repo.findByEmail(email);
      if (u) await getDb().delete(users).where(eq(users.id, u.id));
    }
  });

  describe('refresh-token rotation', () => {
    it('rotates jti on /refresh and invalidates the prior session', async () => {
      const login = await request.post('/api/auth/login').send({ identifier: emailA, password });
      expect(login.status).toBe(200);
      const cookies1 = (login.headers['set-cookie'] as unknown as string[]) ?? [];
      const cookieHeader1 = cookies1.map((c) => c.split(';')[0]).join('; ');
      const csrf1 = login.body.data.csrfToken as string;

      // First refresh succeeds, gives new cookies.
      const r1 = await request
        .post('/api/auth/refresh')
        .set('Cookie', cookieHeader1)
        .set('X-CSRF-Token', csrf1);
      expect(r1.status).toBe(200);
      const cookies2 = (r1.headers['set-cookie'] as unknown as string[]) ?? [];
      expect(cookies2.length).toBeGreaterThan(0);

      // The OLD refresh cookie can no longer be used: 401.
      const r2 = await request
        .post('/api/auth/refresh')
        .set('Cookie', cookieHeader1)
        .set('X-CSRF-Token', csrf1);
      expect(r2.status).toBe(401);
      expect(r2.body.error.code).toBe('INVALID_REFRESH');
    });

    it('logout revokes the active session', async () => {
      const login = await request.post('/api/auth/login').send({ identifier: emailB, password });
      const cookies = (login.headers['set-cookie'] as unknown as string[]) ?? [];
      const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');
      const csrf = login.body.data.csrfToken as string;

      const lo = await request
        .post('/api/auth/logout')
        .set('Cookie', cookieHeader)
        .set('X-CSRF-Token', csrf);
      expect(lo.status).toBe(200);

      // The refresh cookie is now revoked (server-side); the cookie
      // jar is cleared, but even if a client still had it, /refresh
      // should refuse.
      const after = await request
        .post('/api/auth/refresh')
        .set('Cookie', cookieHeader)
        .set('X-CSRF-Token', csrf);
      expect(after.status).toBe(401);
    });
  });

  describe('email verification', () => {
    it('roundtrips: send → verify → user.emailVerified flips to true', async () => {
      const send = await request.post('/api/auth/email/send-verification').send({ email: emailC });
      expect(send.status).toBe(200);
      expect(mailbox.sent).toHaveLength(1);
      const sentMessage = mailbox.sent[0];
      if (!sentMessage) throw new Error('No message captured');
      const token = extractTokenFromEmail(sentMessage);

      const verify = await request.post('/api/auth/email/verify').send({ token });
      expect(verify.status).toBe(200);

      const usersRepo = new UsersRepository(getDb());
      const u = await usersRepo.findByEmail(emailC);
      expect(u?.emailVerified).toBe(true);
    });

    it('rejects an invalid or already-used token', async () => {
      const r = await request.post('/api/auth/email/verify').send({ token: 'definitely-not-a-real-token' });
      expect(r.status).toBe(400);
      expect(r.body.error.code).toBe('INVALID_VERIFICATION');
    });
  });

  describe('password reset', () => {
    it('roundtrips: request → reset → old password no longer works → new one does', async () => {
      const req = await request.post('/api/auth/password/request-reset').send({ email: emailD });
      expect(req.status).toBe(200);
      expect(mailbox.sent.length).toBeGreaterThanOrEqual(1);
      const last = mailbox.sent[mailbox.sent.length - 1];
      if (!last) throw new Error('No reset email captured');
      const token = extractTokenFromEmail(last);

      const newPassword = 'brandNewSecurePassword99';
      const reset = await request.post('/api/auth/password/reset').send({ token, newPassword });
      expect(reset.status).toBe(200);

      // Old password fails.
      const oldLogin = await request.post('/api/auth/login').send({ identifier: emailD, password });
      expect(oldLogin.status).toBe(401);

      // New password works.
      const newLogin = await request.post('/api/auth/login').send({ identifier: emailD, password: newPassword });
      expect(newLogin.status).toBe(200);
    });

    it('returns 200 for unknown emails (no enumeration leak)', async () => {
      const r = await request.post('/api/auth/password/request-reset').send({ email: 'definitely-not-here@nowhere.test' });
      expect(r.status).toBe(200);
    });
  });

  describe('2FA TOTP', () => {
    it('setup → enable → backup codes returned', async () => {
      // Use the rotation user (reuse account). Login first to get cookies.
      const login = await request.post('/api/auth/login').send({ identifier: emailA, password });
      expect(login.status).toBe(200);
      const cookies = (login.headers['set-cookie'] as unknown as string[]) ?? [];
      const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');
      const csrf = login.body.data.csrfToken as string;

      const setup = await request
        .post('/api/auth/2fa/setup')
        .set('Cookie', cookieHeader)
        .set('X-CSRF-Token', csrf);
      expect(setup.status).toBe(200);
      expect(setup.body.data.secret).toBeTypeOf('string');
      expect(setup.body.data.qrDataUrl).toMatch(/^data:image\/png;base64,/);

      const secret = setup.body.data.secret as string;
      const code = speakeasy.totp({ secret, encoding: 'base32' });

      const enable = await request
        .post('/api/auth/2fa/enable')
        .set('Cookie', cookieHeader)
        .set('X-CSRF-Token', csrf)
        .send({ code });
      expect(enable.status).toBe(200);
      expect(enable.body.data.backupCodes).toHaveLength(10);
      for (const c of enable.body.data.backupCodes as string[]) {
        expect(c).toMatch(/^[A-Z0-9]{5}-[A-Z0-9]{5}$/);
      }

      // Disable, with current password — clean up for repeat runs.
      const disable = await request
        .post('/api/auth/2fa/disable')
        .set('Cookie', cookieHeader)
        .set('X-CSRF-Token', csrf)
        .send({ currentPassword: password });
      expect(disable.status).toBe(200);
    });

    it('rejects 2fa/enable with a wrong code', async () => {
      const login = await request.post('/api/auth/login').send({ identifier: emailA, password });
      const cookies = (login.headers['set-cookie'] as unknown as string[]) ?? [];
      const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');
      const csrf = login.body.data.csrfToken as string;

      await request
        .post('/api/auth/2fa/setup')
        .set('Cookie', cookieHeader)
        .set('X-CSRF-Token', csrf);
      const enable = await request
        .post('/api/auth/2fa/enable')
        .set('Cookie', cookieHeader)
        .set('X-CSRF-Token', csrf)
        .send({ code: '000000' });
      expect(enable.status).toBe(400);
      expect(enable.body.error.code).toBe('INVALID_2FA_CODE');
    });
  });

  describe('login → 2FA challenge → verify (R.3)', () => {
    it('login returns needsTwoFactor + ticket; verify mints cookies', async () => {
      // Enroll user E in 2FA.
      const login1 = await request.post('/api/auth/login').send({ identifier: emailE, password });
      expect(login1.status).toBe(200);
      const cookies1 = (login1.headers['set-cookie'] as unknown as string[]) ?? [];
      const cookieHeader1 = cookies1.map((c) => c.split(';')[0]).join('; ');
      const csrf1 = login1.body.data.csrfToken as string;

      const setup = await request
        .post('/api/auth/2fa/setup')
        .set('Cookie', cookieHeader1)
        .set('X-CSRF-Token', csrf1);
      expect(setup.status).toBe(200);
      const secret = setup.body.data.secret as string;
      const enrollCode = speakeasy.totp({ secret, encoding: 'base32' });
      const enable = await request
        .post('/api/auth/2fa/enable')
        .set('Cookie', cookieHeader1)
        .set('X-CSRF-Token', csrf1)
        .send({ code: enrollCode });
      expect(enable.status).toBe(200);

      // Now logout and try to login again — should get the 2FA challenge.
      await request
        .post('/api/auth/logout')
        .set('Cookie', cookieHeader1)
        .set('X-CSRF-Token', csrf1);
      const login2 = await request.post('/api/auth/login').send({ identifier: emailE, password });
      expect(login2.status).toBe(200);
      expect(login2.body.data.needsTwoFactor).toBe(true);
      expect(typeof login2.body.data.ticket).toBe('string');
      expect(login2.body.data.user).toBeUndefined();
      expect(login2.headers['set-cookie']).toBeUndefined();

      // Submit the TOTP — should mint cookies + return user.
      const ticket = login2.body.data.ticket as string;
      const totpCode = speakeasy.totp({ secret, encoding: 'base32' });
      const verify = await request.post('/api/auth/2fa/verify').send({ ticket, code: totpCode });
      expect(verify.status).toBe(200);
      expect(verify.body.data.user.email).toBe(emailE);
      const verifyCookies = (verify.headers['set-cookie'] as unknown as string[]) ?? [];
      expect(verifyCookies.length).toBeGreaterThan(0);
      const cookieNames = verifyCookies.map((c) => c.split('=')[0]);
      expect(cookieNames).toContain('eihg_access');
      expect(cookieNames).toContain('eihg_refresh');
      expect(cookieNames).toContain('eihg_csrf');
    });

    it('rejects /2fa/verify with an invalid ticket', async () => {
      const r = await request
        .post('/api/auth/2fa/verify')
        .send({ ticket: 'definitely-not-a-real-jwt', code: '000000' });
      expect(r.status).toBe(401);
      expect(r.body.error.code).toBe('INVALID_TICKET');
    });
  });
});
