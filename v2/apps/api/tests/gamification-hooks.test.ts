/**
 * Integration tests for the XP hooks fired from feature routes:
 * pulse_submitted, propuesta_submitted, community_post_created,
 * content_read. Each test verifies (a) the xpEvent envelope, (b)
 * dedup suppresses the second grant where applicable, (c) milestone
 * badges are awarded exactly once.
 */
import '../src/load-env.js';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { BlogRepository, blogPostViews, blogPosts, eq, getDb } from '@v2/db';

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

dsuite('Gamification hooks', () => {
  const app = createApp();
  let user: TestUser;
  let session: LoggedInSession;
  let testPostId: number;

  beforeAll(async () => {
    user = await createTestUser('gamification-hooks');
    session = await loginAndGetCookies(app, user);
    // Create a dedicated published blog post for the content_read test so
    // we don't depend on other test suites' posts (which may be deleted
    // concurrently by their own afterAll).
    const repo = new BlogRepository(getDb());
    const stamp = String(Date.now());
    const post = await repo.create({
      slug: `gamification-hooks-test-${stamp}`,
      title: 'Post para prueba de gamificación',
      content: '# Contenido de prueba',
      authorId: user.id,
      status: 'published',
      publishedAt: new Date(),
    });
    testPostId = post.id;
  });

  afterAll(async () => {
    const db = getDb();
    await db.delete(blogPostViews).where(eq(blogPostViews.postId, testPostId));
    await db.delete(blogPosts).where(eq(blogPosts.id, testPostId));
    await deleteTestUsers([user.email]);
  });

  it('POST /api/pulso returns xpEvent + awards first-pulse', async () => {
    const res = await csrfed(app, session)
      .post('/api/pulso')
      .send({ body: 'Esto es una señal de prueba. Necesitamos más espacios verdes.' });
    expect(res.status).toBe(201);
    expect(res.body.data.xpEvent).toBeTruthy();
    expect(res.body.data.xpEvent.xpAwarded).toBe(10);
    expect(res.body.data.xpEvent.newBadges.some((b: { slug: string }) => b.slug === 'first-pulse')).toBe(true);
  });

  it('POST /api/pulso second time: xpEvent still fires (no dedup), but no new badge', async () => {
    const res = await csrfed(app, session)
      .post('/api/pulso')
      .send({ body: 'Segunda señal de prueba — el bus 12 nunca pasa.' });
    expect(res.status).toBe(201);
    expect(res.body.data.xpEvent.xpAwarded).toBe(10);
    expect(res.body.data.xpEvent.newBadges).toEqual([]);
  });

  it('POST /api/propuestas returns xpEvent + propuesta-author badge', async () => {
    const res = await csrfed(app, session)
      .post('/api/propuestas')
      .send({
        title: 'Propuesta de prueba',
        summary: 'Resumen suficientemente largo para pasar la validación.',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.xpEvent.xpAwarded).toBe(15);
    expect(res.body.data.xpEvent.newBadges.some((b: { slug: string }) => b.slug === 'propuesta-author')).toBe(true);
  });

  it('POST /api/community/posts fires +5 with daily dedup', async () => {
    const r1 = await csrfed(app, session)
      .post('/api/community/posts')
      .send({ title: 'Hola mundo', content: 'Primer post de la comunidad.', kind: 'discussion' });
    expect(r1.status).toBe(201);
    expect(r1.body.data.xpEvent?.xpAwarded).toBe(5);

    const r2 = await csrfed(app, session)
      .post('/api/community/posts')
      .send({ title: 'Otro post', content: 'Segundo post mismo día.', kind: 'discussion' });
    expect(r2.status).toBe(201);
    expect(r2.body.data.xpEvent).toBeUndefined();
  });

  it('POST /api/blog/posts/:id/view fires content_read once per slug-lifetime', async () => {
    const r1 = await csrfed(app, session)
      .post(`/api/blog/posts/${String(testPostId)}/view`)
      .send({});
    expect(r1.status).toBe(200);
    expect(r1.body.data.xpEvent?.xpAwarded).toBe(5);

    const r2 = await csrfed(app, session)
      .post(`/api/blog/posts/${String(testPostId)}/view`)
      .send({});
    expect(r2.status).toBe(200);
    expect(r2.body.data.xpEvent).toBeUndefined();
  });
});
