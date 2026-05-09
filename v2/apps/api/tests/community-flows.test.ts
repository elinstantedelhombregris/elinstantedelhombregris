/**
 * Integration tests for /api/community/* — feed, create, like/save toggle.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { communityPostInteractions, communityPosts, eq, getDb } from '@v2/db';

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

dsuite('Community feed flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  let postId: number;

  beforeAll(async () => {
    user = await createTestUser('comm');
    session = await loginAndGetCookies(app, user);
  });

  afterAll(async () => {
    if (postId) {
      const db = getDb();
      await db.delete(communityPostInteractions).where(eq(communityPostInteractions.postId, postId));
      await db.delete(communityPosts).where(eq(communityPosts.id, postId));
    }
    await deleteTestUsers([user.email]);
  });

  it('POST /api/community/posts without csrf cookie is 403 CSRF_FAILED', async () => {
    const res = await request.post('/api/community/posts').send({ title: 't', content: 'c' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_FAILED');
  });

  it('POST /api/community/posts creates a post', async () => {
    const res = await csrfed(app, session).post('/api/community/posts').send({
      title: 'Hola comunidad',
      content: 'Un post de prueba para la comunidad.',
      kind: 'discussion',
    });
    expect(res.status).toBe(201);
    postId = res.body.data.post.id as number;
  });

  it('POST /api/community/posts rejects empty title', async () => {
    const res = await csrfed(app, session).post('/api/community/posts').send({ title: '', content: 'c' });
    expect(res.status).toBe(400);
  });

  it('GET /api/community/posts lists posts (public)', async () => {
    const res = await request.get('/api/community/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.posts)).toBe(true);
  });

  it('GET /api/community/posts/:id returns the post', async () => {
    const res = await request.get(`/api/community/posts/${String(postId)}`);
    expect(res.status).toBe(200);
    expect(res.body.data.post.id).toBe(postId);
  });

  it('GET /api/community/posts/:id 404s for unknown id', async () => {
    const res = await request.get('/api/community/posts/99999999');
    expect(res.status).toBe(404);
  });

  it('POST /api/community/posts/:id/like increments likeCount', async () => {
    const res = await csrfed(app, session).post(`/api/community/posts/${String(postId)}/like`);
    expect(res.status).toBe(200);
    const after = await request.get(`/api/community/posts/${String(postId)}`);
    expect(after.body.data.post.likeCount).toBe(1);
  });

  it('DELETE /api/community/posts/:id/like decrements back to 0', async () => {
    const res = await csrfed(app, session).delete(`/api/community/posts/${String(postId)}/like`);
    expect(res.status).toBe(200);
    const after = await request.get(`/api/community/posts/${String(postId)}`);
    expect(after.body.data.post.likeCount).toBe(0);
  });

  it('POST /api/community/posts/:id/save + DELETE roundtrip', async () => {
    const add = await csrfed(app, session).post(`/api/community/posts/${String(postId)}/save`);
    expect(add.status).toBe(200);
    const remove = await csrfed(app, session).delete(`/api/community/posts/${String(postId)}/save`);
    expect(remove.status).toBe(200);
  });
});
