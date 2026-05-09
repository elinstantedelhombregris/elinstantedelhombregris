/**
 * Shared test helpers for integration tests.
 *
 * Pattern stolen from auth-flows.test.ts. The helpers below let each
 * flow file:
 *   - mint a fresh user without going through the rate-limited
 *     /api/auth/register endpoint;
 *   - log them in and grab the cookie jar + CSRF token;
 *   - issue authenticated, CSRF-tagged requests in one line.
 *
 * Tests run against the real Neon ci-test branch — see v2-ci.yml.
 */
import supertest from 'supertest';

import { eq, getDb, UsersRepository, users } from '@v2/db';

import { hashPassword } from '../../src/features/auth/password.js';

import type { Express } from 'express';

export interface TestUser {
  id: number;
  email: string;
  username: string;
  password: string;
}

export interface LoggedInSession {
  cookieHeader: string;
  csrfToken: string;
}

/**
 * Create a user directly via the repository — bypasses register's
 * 3/hour rate limit, which would block tests that need >3 users.
 */
export async function createTestUser(
  prefix: string,
  overrides: Partial<{ name: string; password: string }> = {},
): Promise<TestUser> {
  const stamp = `${String(Date.now())}_${String(Math.floor(Math.random() * 100000))}`;
  const email = `${prefix}_${stamp}@test.local`;
  const username = `${prefix}_${stamp}`.slice(0, 30);
  const password = overrides.password ?? 'correcthorsebatterystaple12';
  const name = overrides.name ?? prefix;
  const passwordHash = await hashPassword(password);
  const repo = new UsersRepository(getDb());
  const user = await repo.create({ username, email, name, passwordHash });
  return { id: user.id, email, username, password };
}

/**
 * POST /api/auth/login and return the cookie jar + CSRF token. The
 * cookieHeader is what supertest expects via .set('Cookie', ...).
 */
export async function loginAndGetCookies(
  app: Express,
  user: { email: string; password: string },
): Promise<LoggedInSession> {
  const request = supertest(app);
  const res = await request
    .post('/api/auth/login')
    .send({ identifier: user.email, password: user.password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${user.email}: ${String(res.status)} ${JSON.stringify(res.body)}`);
  }
  const cookies = (res.headers['set-cookie'] as unknown as string[]) ?? [];
  const cookieHeader = cookies.map((c) => c.split(';')[0] ?? '').join('; ');
  const csrfToken = res.body.data?.csrfToken as string | undefined;
  if (!csrfToken) throw new Error('csrfToken not returned from login');
  return { cookieHeader, csrfToken };
}

/**
 * Build a supertest request pre-configured with the session's cookie
 * jar and CSRF header. Use like:
 *   await csrfed(app, session).post('/api/...').send({...}).expect(200);
 */
export function csrfed(app: Express, session: LoggedInSession) {
  const request = supertest(app);
  return {
    get: (url: string) => request.get(url).set('Cookie', session.cookieHeader),
    post: (url: string) =>
      request
        .post(url)
        .set('Cookie', session.cookieHeader)
        .set('X-CSRF-Token', session.csrfToken),
    patch: (url: string) =>
      request
        .patch(url)
        .set('Cookie', session.cookieHeader)
        .set('X-CSRF-Token', session.csrfToken),
    put: (url: string) =>
      request
        .put(url)
        .set('Cookie', session.cookieHeader)
        .set('X-CSRF-Token', session.csrfToken),
    delete: (url: string) =>
      request
        .delete(url)
        .set('Cookie', session.cookieHeader)
        .set('X-CSRF-Token', session.csrfToken),
  };
}

export async function deleteTestUsers(emails: string[]): Promise<void> {
  const repo = new UsersRepository(getDb());
  for (const email of emails) {
    const u = await repo.findByEmail(email);
    if (u) await getDb().delete(users).where(eq(users.id, u.id));
  }
}

export const hasDatabaseUrl = Boolean(process.env['DATABASE_URL']);
