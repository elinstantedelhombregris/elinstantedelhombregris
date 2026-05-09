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
import { resetConfig } from '../src/lib/config.js';

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

dsuite('Blog admin authoring (R.6)', () => {
  const app = createApp();
  let admin: TestUser;
  let adminSession: LoggedInSession;
  let nonAdmin: TestUser;
  let nonAdminSession: LoggedInSession;
  const createdPostIds: number[] = [];

  beforeAll(async () => {
    // Create the admin user FIRST so we know its username, then set
    // ADMIN_USERNAMES + reset config so the route handler picks it up.
    admin = await createTestUser('blogadmin');
    nonAdmin = await createTestUser('blognonadmin');
    process.env['ADMIN_USERNAMES'] = admin.username;
    resetConfig();
    adminSession = await loginAndGetCookies(app, admin);
    nonAdminSession = await loginAndGetCookies(app, nonAdmin);
  });

  afterAll(async () => {
    const db = getDb();
    for (const id of createdPostIds) {
      await db.delete(blogPosts).where(eq(blogPosts.id, id));
    }
    delete process.env['ADMIN_USERNAMES'];
    resetConfig();
    await deleteTestUsers([admin.email, nonAdmin.email]);
  });

  it('POST /api/blog/posts rejects non-admin with 403 NOT_ADMIN', async () => {
    const res = await csrfed(app, nonAdminSession).post('/api/blog/posts').send({
      slug: `nonadmin-${String(Date.now())}`,
      title: 'Should fail',
      content: 'no.',
    });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('NOT_ADMIN');
  });

  it('POST /api/blog/posts (admin) creates a draft', async () => {
    const slug = `admin-${String(Date.now())}`;
    const res = await csrfed(app, adminSession).post('/api/blog/posts').send({
      slug,
      title: 'Admin draft',
      content: '# Draft\n\nbody.',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.post.slug).toBe(slug);
    expect(res.body.data.post.status).toBe('draft');
    createdPostIds.push(res.body.data.post.id as number);
  });

  it('POST /api/blog/posts (admin) creates a published post with publishedAt set', async () => {
    const slug = `admin-pub-${String(Date.now())}`;
    const res = await csrfed(app, adminSession).post('/api/blog/posts').send({
      slug,
      title: 'Admin published',
      content: '# Pub\n\nbody.',
      status: 'published',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.post.status).toBe('published');
    expect(res.body.data.post.publishedAt).toBeTruthy();
    createdPostIds.push(res.body.data.post.id as number);
  });

  it('POST /api/blog/posts rejects an invalid slug', async () => {
    const res = await csrfed(app, adminSession).post('/api/blog/posts').send({
      slug: 'INVALID slug WITH SPACES',
      title: 'x',
      content: 'y',
    });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/blog/posts/:id (admin) updates the title', async () => {
    const id = createdPostIds[0]!;
    const res = await csrfed(app, adminSession).patch(`/api/blog/posts/${String(id)}`).send({
      title: 'Updated title',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.post.title).toBe('Updated title');
  });

  it('PATCH /api/blog/posts/:id (admin) auto-stamps publishedAt on draft → published', async () => {
    const id = createdPostIds[0]!;
    const res = await csrfed(app, adminSession).patch(`/api/blog/posts/${String(id)}`).send({
      status: 'published',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.post.status).toBe('published');
    expect(res.body.data.post.publishedAt).toBeTruthy();
  });

  it('PATCH /api/blog/posts/:id rejects non-admin with 403', async () => {
    const id = createdPostIds[0]!;
    const res = await csrfed(app, nonAdminSession).patch(`/api/blog/posts/${String(id)}`).send({
      title: 'hacked',
    });
    expect(res.status).toBe(403);
  });
});
