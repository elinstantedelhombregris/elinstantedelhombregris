/**
 * Integration tests for /api/civic-assessment/* — start → respond →
 * complete → archetype → profile.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CIVIC_QUESTIONS } from '@v2/shared';

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

dsuite('Civic assessment flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  let assessmentId: number;

  beforeAll(async () => {
    user = await createTestUser('civic');
    session = await loginAndGetCookies(app, user);
  });

  afterAll(async () => {
    await deleteTestUsers([user.email]);
  });

  it('GET /api/civic-assessment/questions is public + returns the catalog', async () => {
    const res = await request.get('/api/civic-assessment/questions');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.version).toBe('string');
    expect(res.body.data.questions.length).toBeGreaterThanOrEqual(CIVIC_QUESTIONS.length);
  });

  it('POST /api/civic-assessment/start is rejected without auth + csrf', async () => {
    const res = await request.post('/api/civic-assessment/start');
    expect([401, 403]).toContain(res.status);
  });

  it('POST /api/civic-assessment/start creates an in-progress assessment', async () => {
    const res = await csrfed(app, session).post('/api/civic-assessment/start');
    expect(res.status).toBe(201);
    expect(typeof res.body.data.assessment.id).toBe('number');
    assessmentId = res.body.data.assessment.id as number;
  });

  it('GET /api/civic-assessment/current returns the in-progress one', async () => {
    const res = await csrfed(app, session).get('/api/civic-assessment/current');
    expect(res.status).toBe(200);
    expect(res.body.data.assessment?.id).toBe(assessmentId);
  });

  it('POST /api/civic-assessment/:id/respond saves a response', async () => {
    const first = CIVIC_QUESTIONS[0];
    if (!first) throw new Error('No civic questions to use in test');
    const res = await csrfed(app, session)
      .post(`/api/civic-assessment/${String(assessmentId)}/respond`)
      .send({ questionId: first.id, value: 4 });
    expect(res.status).toBe(200);
    expect(res.body.data.ok).toBe(true);
  });

  it('POST /api/civic-assessment/:id/respond rejects invalid values', async () => {
    const first = CIVIC_QUESTIONS[0];
    if (!first) throw new Error('No civic questions to use in test');
    const res = await csrfed(app, session)
      .post(`/api/civic-assessment/${String(assessmentId)}/respond`)
      .send({ questionId: first.id, value: 99 });
    expect(res.status).toBe(400);
  });

  it('POST /api/civic-assessment/:id/complete scores + persists profile', async () => {
    // Answer every question with a middling value so scoring has data.
    for (const q of CIVIC_QUESTIONS) {
      await csrfed(app, session)
        .post(`/api/civic-assessment/${String(assessmentId)}/respond`)
        .send({ questionId: q.id, value: 3 });
    }
    const res = await csrfed(app, session).post(`/api/civic-assessment/${String(assessmentId)}/complete`);
    expect(res.status).toBe(200);
    expect(typeof res.body.data.profile.archetype).toBe('string');
  });

  it('GET /api/civic-assessment/profile returns the latest profile', async () => {
    const res = await csrfed(app, session).get('/api/civic-assessment/profile');
    expect(res.status).toBe(200);
    expect(res.body.data.profile?.archetype).toBeTruthy();
  });
});
