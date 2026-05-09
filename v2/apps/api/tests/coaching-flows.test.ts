/**
 * Integration tests for /api/coaching/* — sessions + messages.
 *
 * The AICompleter is overridden with the StubCompleter so tests don't
 * call out to Groq/Anthropic.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { setAICompleter } from '../src/lib/ai/index.js';
import { StubCompleter } from '../src/lib/ai/stub.js';

import {
  createTestUser,
  csrfed,
  deleteTestUsers,
  hasDatabaseUrl,
  loginAndGetCookies,
} from './helpers/index.js';

import type { LoggedInSession, TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Coaching flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  let sessionId: number;

  beforeAll(async () => {
    setAICompleter(new StubCompleter());
    user = await createTestUser('coach');
    session = await loginAndGetCookies(app, user);
  });

  afterAll(async () => {
    await deleteTestUsers([user.email]);
  });

  it('GET /api/coaching/sessions requires authentication', async () => {
    const res = await request.get('/api/coaching/sessions');
    expect(res.status).toBe(401);
  });

  it('POST /api/coaching/sessions starts a new session', async () => {
    const res = await csrfed(app, session).post('/api/coaching/sessions').send({ title: 'Primer encuentro' });
    expect(res.status).toBe(201);
    sessionId = res.body.data.session.id as number;
  });

  it('GET /api/coaching/sessions lists the new session', async () => {
    const res = await csrfed(app, session).get('/api/coaching/sessions');
    expect(res.status).toBe(200);
    const ids = (res.body.data.sessions as Array<{ id: number }>).map((s) => s.id);
    expect(ids).toContain(sessionId);
  });

  it('GET /api/coaching/sessions/:id returns the session + (initially empty) messages', async () => {
    const res = await csrfed(app, session).get(`/api/coaching/sessions/${String(sessionId)}`);
    expect(res.status).toBe(200);
    expect(res.body.data.session.id).toBe(sessionId);
    expect(Array.isArray(res.body.data.messages)).toBe(true);
  });

  it('POST /api/coaching/sessions/:id/messages persists user + stub-assistant turns', async () => {
    const res = await csrfed(app, session)
      .post(`/api/coaching/sessions/${String(sessionId)}/messages`)
      .send({ content: '¿Cómo arranco a militar mi barrio?' });
    expect(res.status).toBe(200);
    expect(res.body.data.message.role).toBe('assistant');
    expect(res.body.data.message.provider).toBe('stub');
    expect(res.body.data.message.content).toContain('[stub-completer]');

    // Verify both turns landed in the message log.
    const after = await csrfed(app, session).get(`/api/coaching/sessions/${String(sessionId)}`);
    expect(after.body.data.messages.length).toBeGreaterThanOrEqual(2);
    const roles = (after.body.data.messages as Array<{ role: string }>).map((m) => m.role);
    expect(roles).toContain('user');
    expect(roles).toContain('assistant');
  });

  it('rejects an empty message body with 400', async () => {
    const res = await csrfed(app, session)
      .post(`/api/coaching/sessions/${String(sessionId)}/messages`)
      .send({ content: '' });
    expect(res.status).toBe(400);
  });

  it("returns 404 when accessing someone else's session", async () => {
    const res = await csrfed(app, session).get('/api/coaching/sessions/99999999');
    expect(res.status).toBe(404);
  });
});
