/**
 * Integration tests for the auth slice.
 *
 * Hits the real Neon dev database. Each test creates a uniquely-named
 * user and cleans up after itself. No mocks of the data layer — we
 * deliberately exercise the same Drizzle path production uses.
 *
 * Skipped when DATABASE_URL is unset (e.g. on a fresh clone before the
 * `.env` is in place); CI must export DATABASE_URL.
 */
import '../src/load-env.js';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../src/app.js';
import { eq, getDb, UsersRepository, users } from '@v2/db';

const hasDatabaseUrl = Boolean(process.env['DATABASE_URL']);
const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('POST /api/auth — full round-trip', () => {
  const app = createApp();
  const request = supertest(app);

  const stamp = Date.now();
  const username = `vitest_${stamp}`;
  const email = `vitest_${stamp}@test.local`;
  const password = 'correcthorsebatterystaple12';

  beforeAll(() => {
    // Sanity: the app shouldn't crash before any test runs.
    expect(typeof createApp).toBe('function');
  });

  afterAll(async () => {
    const repo = new UsersRepository(getDb());
    const u = await repo.findByEmail(email);
    if (u) {
      await getDb().delete(users).where(eq(users.id, u.id));
    }
  });

  it('rejects malformed register input with 400', async () => {
    const res = await request.post('/api/auth/register').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('registers a fresh user and sets all three auth cookies', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ username, email, password, name: 'Vitest User' });
    expect(res.status).toBe(201);
    expect(res.body.data.user.username).toBe(username);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.csrfToken).toMatch(/^[a-f0-9]{64}$/);

    const cookies = (res.headers['set-cookie'] as unknown as string[]) ?? [];
    const cookieNames = cookies.map((c: string) => c.split('=')[0]);
    expect(cookieNames).toContain('eihg_access');
    expect(cookieNames).toContain('eihg_refresh');
    expect(cookieNames).toContain('eihg_csrf');
  });

  it('rejects duplicate registration with 409 EMAIL_TAKEN', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ username: `${username}_2`, email, password, name: 'Vitest User' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rejects wrong password with 401 INVALID_CREDENTIALS', async () => {
    const res = await request.post('/api/auth/login').send({ identifier: email, password: 'wrongpass12345' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('logs in with correct credentials and returns a fresh CSRF token', async () => {
    const res = await request.post('/api/auth/login').send({ identifier: email, password });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.csrfToken).toMatch(/^[a-f0-9]{64}$/);
  });

  it('protects /me — 401 without cookies', async () => {
    const res = await request.get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('returns the user from /me when authenticated via cookies', async () => {
    const login = await request.post('/api/auth/login').send({ identifier: email, password });
    const cookieHeader = (login.headers['set-cookie'] as unknown as string[]).map((c: string) => c.split(';')[0]).join('; ');
    const res = await request.get('/api/auth/me').set('Cookie', cookieHeader);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
  });
});
