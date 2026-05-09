/**
 * Integration tests for /api/blog/* — posts (read-only), like/unlike,
 * bookmark/unbookmark, comments, view tracking.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  blogPostBookmarks,
  blogPostComments,
  blogPostLikes,
  blogPostViews,
  blogPosts,
  BlogRepository,
  eq,
  getDb,
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

dsuite('Blog flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  let postId: number;
  let postSlug: string;

  beforeAll(async () => {
    user = await createTestUser('blog');
    session = await loginAndGetCookies(app, user);
    const repo = new BlogRepository(getDb());
    const stamp = String(Date.now());
    const post = await repo.create({
      slug: `test-post-${stamp}`,
      title: 'Test post',
      summary: 'Resumen.',
      content: '# Hola\n\nTest body.',
      authorId: user.id,
      status: 'published',
      publishedAt: new Date(),
    });
    postId = post.id;
    postSlug = post.slug;
  });

  afterAll(async () => {
    const db = getDb();
    await db.delete(blogPostLikes).where(eq(blogPostLikes.postId, postId));
    await db.delete(blogPostBookmarks).where(eq(blogPostBookmarks.postId, postId));
    await db.delete(blogPostViews).where(eq(blogPostViews.postId, postId));
    await db.delete(blogPostComments).where(eq(blogPostComments.postId, postId));
    await db.delete(blogPosts).where(eq(blogPosts.id, postId));
    await deleteTestUsers([user.email]);
  });

  it('GET /api/blog/posts is public + lists published posts', async () => {
    const res = await request.get('/api/blog/posts');
    expect(res.status).toBe(200);
    const slugs = (res.body.data as Array<{ slug: string }>).map((p) => p.slug);
    expect(slugs).toContain(postSlug);
  });

  it('GET /api/blog/posts/:slug returns the post', async () => {
    const res = await request.get(`/api/blog/posts/${postSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.post.id).toBe(postId);
  });

  it('GET /api/blog/posts/:slug returns 404 for unknown slug', async () => {
    const res = await request.get('/api/blog/posts/no-existe-blog-xyz');
    expect(res.status).toBe(404);
  });

  it('POST /api/blog/posts/:id/like is idempotent on re-like', async () => {
    const a = await csrfed(app, session).post(`/api/blog/posts/${String(postId)}/like`);
    expect(a.status).toBe(200);
    expect(a.body.data.ok).toBe(true);
    const b = await csrfed(app, session).post(`/api/blog/posts/${String(postId)}/like`);
    expect(b.status).toBe(200);
    expect(b.body.data.alreadyLiked).toBe(true);
  });

  it('DELETE /api/blog/posts/:id/like removes the like', async () => {
    const res = await csrfed(app, session).delete(`/api/blog/posts/${String(postId)}/like`);
    expect(res.status).toBe(200);
  });

  it('POST /api/blog/posts/:id/bookmark + DELETE roundtrip', async () => {
    const add = await csrfed(app, session).post(`/api/blog/posts/${String(postId)}/bookmark`);
    expect(add.status).toBe(200);
    const remove = await csrfed(app, session).delete(`/api/blog/posts/${String(postId)}/bookmark`);
    expect(remove.status).toBe(200);
  });

  it('POST /api/blog/posts/:id/comments creates a comment', async () => {
    const res = await csrfed(app, session)
      .post(`/api/blog/posts/${String(postId)}/comments`)
      .send({ body: 'Comentario de prueba.' });
    expect(res.status).toBe(201);
    expect(typeof res.body.data.comment.id).toBe('number');
  });

  it('POST /api/blog/posts/:id/comments rejects empty body', async () => {
    const res = await csrfed(app, session)
      .post(`/api/blog/posts/${String(postId)}/comments`)
      .send({ body: '' });
    expect(res.status).toBe(400);
  });

  it('GET /api/blog/posts/:id/comments lists the comment we just added', async () => {
    const res = await request.get(`/api/blog/posts/${String(postId)}/comments`);
    expect(res.status).toBe(200);
    expect(res.body.data.comments.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/blog/posts/:id/view records anonymous views', async () => {
    const res = await request
      .post(`/api/blog/posts/${String(postId)}/view`)
      .send({ sessionId: 'anon-1' });
    expect(res.status).toBe(200);
  });
});
