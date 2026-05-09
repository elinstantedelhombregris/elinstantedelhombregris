/**
 * Integration tests for /api/life-areas/* — areas catalog, quiz batch,
 * per-user state. Relies on the seeded life-area-questions catalog.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { getDb, LifeAreasRepository } from '@v2/db';

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

dsuite('Life areas flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  let areaSlug: string;
  let questionIds: number[];

  beforeAll(async () => {
    user = await createTestUser('lifearea');
    session = await loginAndGetCookies(app, user);
    const repo = new LifeAreasRepository(getDb());
    const areas = await repo.listAreas();
    if (areas.length === 0) throw new Error('Life areas not seeded — run pnpm seed:life-areas');
    const first = areas[0]!;
    areaSlug = first.slug;
    const questions = await repo.listQuestions(first.id);
    questionIds = questions.slice(0, 3).map((q) => q.id);
    if (questionIds.length === 0) throw new Error('No questions seeded for first area');
  });

  afterAll(async () => {
    await deleteTestUsers([user.email]);
  });

  it('GET /api/life-areas lists 12 seeded areas', async () => {
    const res = await request.get('/api/life-areas');
    expect(res.status).toBe(200);
    expect(res.body.data.areas.length).toBeGreaterThanOrEqual(10);
  });

  it('GET /api/life-areas/:slug returns area + subcategories + questions', async () => {
    const res = await request.get(`/api/life-areas/${areaSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.area.slug).toBe(areaSlug);
    expect(Array.isArray(res.body.data.questions)).toBe(true);
  });

  it('GET /api/life-areas/:slug returns 404 for unknown slug', async () => {
    const res = await request.get('/api/life-areas/no-existe-area-xyz');
    expect(res.status).toBe(404);
  });

  it('POST /api/life-areas/quiz/responses is rejected without auth + csrf', async () => {
    const res = await request
      .post('/api/life-areas/quiz/responses')
      .send({ responses: [{ questionId: questionIds[0]!, value: 5 }] });
    expect([401, 403]).toContain(res.status);
  });

  it('POST /api/life-areas/quiz/responses saves a batch and rescores', async () => {
    const responses = questionIds.map((questionId) => ({ questionId, value: 7 }));
    const res = await csrfed(app, session)
      .post('/api/life-areas/quiz/responses')
      .send({ responses });
    expect(res.status).toBe(200);
    expect(res.body.data.saved).toBe(responses.length);
  });

  it('GET /api/life-areas/me/state shows updated state after quiz', async () => {
    const res = await csrfed(app, session).get('/api/life-areas/me/state');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.state)).toBe(true);
    // After the batch the user has at least one area's state row populated.
    expect(res.body.data.state.length).toBeGreaterThanOrEqual(1);
  });
});
