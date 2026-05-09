/**
 * Integration tests for /api/notifications/* — list, mark-read,
 * unread-count, dismiss. All endpoints require auth.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { getDb, NotificationsRepository } from '@v2/db';

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

dsuite('Notifications flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  const seededIds: number[] = [];

  beforeAll(async () => {
    user = await createTestUser('notifs');
    session = await loginAndGetCookies(app, user);
    const repo = new NotificationsRepository(getDb());
    const a = await repo.enqueue({
      userId: user.id,
      kind: 'system_message',
      title: 'Bienvenida',
      body: 'Gracias por sumarte.',
    });
    const b = await repo.enqueue({
      userId: user.id,
      kind: 'system_message',
      title: 'Segunda',
      body: 'Otra notificación.',
    });
    seededIds.push(a.id, b.id);
  });

  afterAll(async () => {
    await deleteTestUsers([user.email]);
  });

  it('GET /api/notifications requires authentication', async () => {
    const res = await request.get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('GET /api/notifications lists the user\'s notifications', async () => {
    const res = await csrfed(app, session).get('/api/notifications');
    expect(res.status).toBe(200);
    const list = res.body.data.notifications as Array<{ id: number; readAt: string | null }>;
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/notifications/unread-count returns >= 2 initially', async () => {
    const res = await csrfed(app, session).get('/api/notifications/unread-count');
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/notifications/:id/read marks one as read', async () => {
    const id = seededIds[0]!;
    const res = await csrfed(app, session).post(`/api/notifications/${String(id)}/read`);
    expect(res.status).toBe(200);
    expect(res.body.data.ok).toBe(true);
  });

  it('POST /api/notifications/read-all clears unread count', async () => {
    const res = await csrfed(app, session).post('/api/notifications/read-all');
    expect(res.status).toBe(200);
    const count = await csrfed(app, session).get('/api/notifications/unread-count');
    expect(count.body.data.count).toBe(0);
  });

  it('POST /api/notifications/:id/dismiss removes one', async () => {
    const id = seededIds[1]!;
    const res = await csrfed(app, session).post(`/api/notifications/${String(id)}/dismiss`);
    expect(res.status).toBe(200);
  });
});
