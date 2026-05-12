/**
 * Integration tests for /api/gamification/* — me / badges / challenges /
 * leaderboard. Hits the real DB through createApp().
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import {
  createTestUser,
  csrfed,
  deleteTestUsers,
  hasDatabaseUrl,
  loginAndGetCookies,
} from './helpers/index.js';

import type { LoggedInSession, TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Gamification flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;

  beforeAll(async () => {
    user = await createTestUser('gamification');
    session = await loginAndGetCookies(app, user);
  });

  afterAll(async () => {
    await deleteTestUsers([user.email]);
  });

  it('GET /api/gamification/me returns a freshly-created level row', async () => {
    const res = await request
      .get('/api/gamification/me')
      .set('Cookie', session.cookieHeader);
    expect(res.status).toBe(200);
    expect(res.body.data.xp).toBe(0);
    expect(res.body.data.level).toBe(1);
    expect(Array.isArray(res.body.data.badges)).toBe(true);
    expect(Array.isArray(res.body.data.recentActivity)).toBe(true);
    expect(Array.isArray(res.body.data.inProgressChallenges)).toBe(true);
  });

  it('GET /api/gamification/me requires auth', async () => {
    const res = await request.get('/api/gamification/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/gamification/badges is public and returns the catalog', async () => {
    const res = await request.get('/api/gamification/badges');
    expect(res.status).toBe(200);
    expect(res.body.data.badges.length).toBeGreaterThanOrEqual(11);
    expect(res.body.data.badges.some((b: { slug: string }) => b.slug === 'civic-baseline')).toBe(true);
  });

  it('GET /api/gamification/challenges returns the seeded set without auth', async () => {
    const res = await request.get('/api/gamification/challenges');
    expect(res.status).toBe(200);
    expect(res.body.data.challenges.length).toBeGreaterThanOrEqual(5);
    const lectorDiario = res.body.data.challenges.find((c: { slug: string }) => c.slug === 'lector-diario');
    expect(lectorDiario).toBeTruthy();
    expect(lectorDiario.steps.length).toBe(1);
    expect(lectorDiario.progress).toBeNull();
  });

  it('GET /api/gamification/challenges includes progress when authed', async () => {
    const res = await request
      .get('/api/gamification/challenges')
      .set('Cookie', session.cookieHeader);
    expect(res.status).toBe(200);
    const lectorDiario = res.body.data.challenges.find((c: { slug: string }) => c.slug === 'lector-diario');
    expect(lectorDiario).toBeTruthy();
    // progress is null before this test runs ANY mutating call
    expect(lectorDiario.progress).toBeNull();
  });

  it('POST /challenges/:slug/start is idempotent', async () => {
    const r1 = await csrfed(app, session).post('/api/gamification/challenges/lector-diario/start');
    expect(r1.status).toBe(201);
    expect(r1.body.data.progress.status).toBe('in_progress');

    const r2 = await csrfed(app, session).post('/api/gamification/challenges/lector-diario/start');
    expect(r2.status).toBe(200);
    expect(r2.body.data.progress.id).toBe(r1.body.data.progress.id);
  });

  it('POST /challenges/:slug/advance auto-completes single-step challenge', async () => {
    const res = await csrfed(app, session)
      .post('/api/gamification/challenges/lector-diario/advance')
      .send({ orderIndex: 0 });
    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(true);
    expect(res.body.data.progress.status).toBe('completed');
  });

  it('POST /challenges/:slug/advance returns 409 if not started', async () => {
    const res = await csrfed(app, session)
      .post('/api/gamification/challenges/diagnostico-completo/advance')
      .send({ orderIndex: 0 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('NOT_STARTED');
  });

  it('GET /api/gamification/leaderboard?period=weekly returns 200', async () => {
    const res = await request.get('/api/gamification/leaderboard?period=weekly');
    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe('weekly');
    expect(Array.isArray(res.body.data.rows)).toBe(true);
  });

  it('GET /api/gamification/leaderboard?period=all_time returns 200', async () => {
    const res = await request.get('/api/gamification/leaderboard?period=all_time');
    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe('all_time');
    expect(res.body.data.periodStart).toBeNull();
  });

  it('rejects an invalid period value', async () => {
    const res = await request.get('/api/gamification/leaderboard?period=hourly');
    expect(res.status).toBe(400);
  });
});
