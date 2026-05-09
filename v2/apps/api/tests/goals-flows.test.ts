/**
 * Integration tests for /api/goals/* and /api/checkins/*.
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

dsuite('Goals + check-ins flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  let goalId: number;

  beforeAll(async () => {
    user = await createTestUser('goals');
    session = await loginAndGetCookies(app, user);
  });

  afterAll(async () => {
    await deleteTestUsers([user.email]);
  });

  it('GET /api/goals requires authentication', async () => {
    const res = await request.get('/api/goals');
    expect(res.status).toBe(401);
  });

  it('POST /api/goals creates a goal', async () => {
    const res = await csrfed(app, session).post('/api/goals').send({
      title: 'Sumarme a una iniciativa este mes',
      category: 'community',
      priority: 4,
    });
    expect(res.status).toBe(201);
    goalId = res.body.data.goal.id as number;
  });

  it('POST /api/goals rejects an invalid category', async () => {
    const res = await csrfed(app, session).post('/api/goals').send({
      title: 'Algo',
      category: 'no-existe',
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/goals lists the active goals for the user', async () => {
    const res = await csrfed(app, session).get('/api/goals');
    expect(res.status).toBe(200);
    const ids = (res.body.data.goals as Array<{ id: number }>).map((g) => g.id);
    expect(ids).toContain(goalId);
  });

  it('PATCH /api/goals/:id updates the goal', async () => {
    const res = await csrfed(app, session)
      .patch(`/api/goals/${String(goalId)}`)
      .send({ priority: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data.goal.priority).toBe(5);
  });

  it('POST /api/goals/:id/complete marks it completed', async () => {
    const res = await csrfed(app, session).post(`/api/goals/${String(goalId)}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.data.ok).toBe(true);
  });

  it('GET /api/checkins/current-week returns weekStart', async () => {
    const res = await csrfed(app, session).get('/api/checkins/current-week');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.weekStart).toBe('string');
  });

  it('POST /api/checkins creates a checkin', async () => {
    const weekStart = new Date();
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() === 0 ? 7 : weekStart.getUTCDay()) - 1));
    const res = await csrfed(app, session).post('/api/checkins').send({
      weekStart: weekStart.toISOString(),
      progressScore: 4,
      reflection: 'Buena semana.',
      actedOnGoals: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.checkin.progressScore).toBe(4);
  });

  it('POST /api/checkins upserts within the same week (200 on update, no duplicates)', async () => {
    const weekStart = new Date();
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() === 0 ? 7 : weekStart.getUTCDay()) - 1));
    const res = await csrfed(app, session).post('/api/checkins').send({
      weekStart: weekStart.toISOString(),
      progressScore: 2,
      reflection: 'Cambié de opinión.',
      actedOnGoals: false,
    });
    // Update branch returns 200, not 201.
    expect(res.status).toBe(200);
    expect(res.body.data.checkin.progressScore).toBe(2);
    const current = await csrfed(app, session).get('/api/checkins/current-week');
    expect(current.body.data.checkin.progressScore).toBe(2);
    expect(current.body.data.checkin.reflection).toBe('Cambié de opinión.');
  });
});
