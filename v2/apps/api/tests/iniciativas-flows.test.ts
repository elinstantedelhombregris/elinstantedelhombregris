/**
 * Integration tests for /api/iniciativas/* — list, get, join, leave.
 * Joining is idempotent (re-joining an iniciativa returns alreadyMember).
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  eq,
  getDb,
  iniciativaMembers,
  iniciativas,
  IniciativasRepository,
} from '@v2/db';

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

dsuite('Iniciativas flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  let iniciativaId: number;
  let iniciativaSlug: string;

  beforeAll(async () => {
    user = await createTestUser('inicia');
    session = await loginAndGetCookies(app, user);
    const repo = new IniciativasRepository(getDb());
    const stamp = String(Date.now());
    const created = await repo.create({
      slug: `test-iniciativa-${stamp}`,
      title: 'Test iniciativa',
      summary: 'Una iniciativa de prueba',
      kind: 'community',
      status: 'open',
      createdByUserId: user.id,
    });
    iniciativaId = created.id;
    iniciativaSlug = created.slug;
  });

  afterAll(async () => {
    const db = getDb();
    await db.delete(iniciativaMembers).where(eq(iniciativaMembers.iniciativaId, iniciativaId));
    await db.delete(iniciativas).where(eq(iniciativas.id, iniciativaId));
    await deleteTestUsers([user.email]);
  });

  it('GET /api/iniciativas lists items', async () => {
    const res = await request.get('/api/iniciativas?limit=50');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const slugs = (res.body.data as Array<{ slug: string }>).map((i) => i.slug);
    expect(slugs).toContain(iniciativaSlug);
  });

  it('GET /api/iniciativas filters by kind', async () => {
    const res = await request.get('/api/iniciativas?kind=community');
    expect(res.status).toBe(200);
    for (const it of res.body.data as Array<{ kind: string }>) {
      expect(it.kind).toBe('community');
    }
  });

  it('GET /api/iniciativas/:slug returns the iniciativa', async () => {
    const res = await request.get(`/api/iniciativas/${iniciativaSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.iniciativa.slug).toBe(iniciativaSlug);
  });

  it('GET /api/iniciativas/:slug returns 404 for unknown slug', async () => {
    const res = await request.get('/api/iniciativas/no-existe-jamas-xyz');
    expect(res.status).toBe(404);
  });

  it('POST /api/iniciativas/:id/join without csrf cookie is 403 CSRF_FAILED', async () => {
    const res = await request.post(`/api/iniciativas/${String(iniciativaId)}/join`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_FAILED');
  });

  it('POST /api/iniciativas/:id/join adds the user as member', async () => {
    const res = await csrfed(app, session).post(`/api/iniciativas/${String(iniciativaId)}/join`);
    expect(res.status).toBe(200);
    expect(res.body.data.ok).toBe(true);
  });

  it('POST /api/iniciativas/:id/join is idempotent on re-join', async () => {
    const res = await csrfed(app, session).post(`/api/iniciativas/${String(iniciativaId)}/join`);
    expect(res.status).toBe(200);
    expect(res.body.data.alreadyMember).toBe(true);
  });

  it('POST /api/iniciativas/:id/leave removes the membership', async () => {
    const res = await csrfed(app, session).post(`/api/iniciativas/${String(iniciativaId)}/leave`);
    expect(res.status).toBe(200);
  });
});
