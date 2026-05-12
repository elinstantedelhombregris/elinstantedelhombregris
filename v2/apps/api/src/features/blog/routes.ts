/**
 * Blog HTTP slice — posts, comments, likes, bookmarks, view tracking.
 *
 *   GET   /api/blog/posts              — published list (limit, offset)
 *   GET   /api/blog/posts/:slug        — post + tags
 *   POST  /api/blog/posts/:id/like     (auth)
 *   DELETE /api/blog/posts/:id/like    (auth)
 *   POST  /api/blog/posts/:id/bookmark (auth)
 *   DELETE /api/blog/posts/:id/bookmark (auth)
 *   GET   /api/blog/posts/:id/comments
 *   POST  /api/blog/posts/:id/comments (auth)
 *   POST  /api/blog/posts/:id/view     (anon ok)
 */
import { BlogRepository, GamificationRepository, getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { getConfig } from '../../lib/config.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { GamificationService } from '../gamification/service.js';
import { notifyBlogCommentPosted, notifyBlogPostLiked } from '../notifications/producers.js';

const router: RouterType = Router();

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const commentSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  parentId: z.number().int().positive().optional(),
});

const viewSchema = z.object({
  sessionId: z.string().max(64).optional(),
});

const createPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(140)
    .regex(/^[a-z0-9-]+$/, 'El slug solo admite minúsculas, números y guiones.'),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1),
  status: z.enum(['draft', 'published']).default('draft'),
});

const updatePostSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

function parseId(idStr: string | string[] | undefined): number {
  if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
  const id = Number.parseInt(idStr, 10);
  if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
  return id;
}

function requireAdmin(username: string): void {
  const allowed = new Set(getConfig().admin.usernames);
  if (!allowed.has(username)) {
    throw new HttpError(403, 'NOT_ADMIN', 'Esta acción requiere permisos de administrador.');
  }
}

router.get('/posts', async (req, res, next) => {
  try {
    const { limit, offset } = listQuery.parse(req.query);
    const repo = new BlogRepository(getDb());
    const posts = await repo.listPublished({ limit, offset });
    res.json({
      data: posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        coverImageUrl: p.coverImageUrl,
        publishedAt: p.publishedAt,
        likeCount: p.likeCount,
        viewCount: p.viewCount,
        commentCount: p.commentCount,
        bookmarkCount: p.bookmarkCount,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/posts/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (typeof slug !== 'string') throw new HttpError(400, 'INVALID_SLUG', 'Slug requerido.');
    const repo = new BlogRepository(getDb());
    const post = await repo.findBySlug(slug);
    if (post?.status !== 'published') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post no encontrado.' } });
      return;
    }
    const tags = await repo.listTags(post.id);
    res.json({ data: { post, tags } });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/like', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const repo = new BlogRepository(getDb());
    try {
      await repo.addLike({ postId: id, userId: req.user.id });
    } catch (e) {
      if (e instanceof Error && /unique/i.test(e.message)) {
        res.json({ data: { ok: true, alreadyLiked: true } });
        return;
      }
      throw e;
    }
    // Best-effort notify the post author (skip self-likes).
    const post = await repo.findById(id);
    if (post && post.authorId !== req.user.id) {
      void notifyBlogPostLiked(post.authorId, id, req.user.username);
    }
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.delete('/posts/:id/like', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const repo = new BlogRepository(getDb());
    await repo.removeLike(id, req.user.id);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/bookmark', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const repo = new BlogRepository(getDb());
    try {
      await repo.addBookmark({ postId: id, userId: req.user.id });
    } catch (e) {
      if (e instanceof Error && /unique/i.test(e.message)) {
        res.json({ data: { ok: true, alreadyBookmarked: true } });
        return;
      }
      throw e;
    }
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.delete('/posts/:id/bookmark', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const repo = new BlogRepository(getDb());
    await repo.removeBookmark(id, req.user.id);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.get('/posts/:id/comments', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const repo = new BlogRepository(getDb());
    const comments = await repo.listComments(id);
    res.json({ data: { comments } });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/comments', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const input = commentSchema.parse(req.body);
    const repo = new BlogRepository(getDb());
    const insertArgs: Parameters<typeof repo.addComment>[0] = {
      postId: id,
      userId: req.user.id,
      body: input.body,
    };
    if (input.parentId !== undefined) insertArgs.parentId = input.parentId;
    const comment = await repo.addComment(insertArgs);
    // Best-effort notify the post author (skip self-comments).
    const post = await repo.findById(id);
    if (post && post.authorId !== req.user.id) {
      void notifyBlogCommentPosted(post.authorId, id, req.user.username);
    }
    res.status(201).json({ data: { comment } });
  } catch (err) {
    next(err);
  }
});

router.post('/posts', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    requireAdmin(req.user.username);
    const input = createPostSchema.parse(req.body);
    const repo = new BlogRepository(getDb());
    const insertArgs: Parameters<typeof repo.create>[0] = {
      slug: input.slug,
      title: input.title,
      content: input.content,
      authorId: req.user.id,
      status: input.status,
    };
    if (input.summary !== undefined) insertArgs.summary = input.summary;
    if (input.status === 'published') insertArgs.publishedAt = new Date();
    const post = await repo.create(insertArgs);
    res.status(201).json({ data: { post } });
  } catch (err) {
    next(err);
  }
});

router.patch('/posts/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    requireAdmin(req.user.username);
    const id = parseId(req.params.id);
    const patch = updatePostSchema.parse(req.body);
    const repo = new BlogRepository(getDb());
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) cleaned[k] = v;
    }
    // Auto-stamp publishedAt the first time a draft transitions to published.
    if (patch.status === 'published') {
      const existing = await repo.findById(id);
      if (existing?.publishedAt === null) cleaned.publishedAt = new Date();
    }
    const post = await repo.update(id, cleaned);
    if (!post) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post no encontrado.' } });
      return;
    }
    res.json({ data: { post } });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/view', optionalAuthenticate, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const input = viewSchema.parse(req.body ?? {});
    const repo = new BlogRepository(getDb());
    const insertArgs: Parameters<typeof repo.recordView>[0] = { postId: id };
    if (req.user) insertArgs.userId = req.user.id;
    if (input.sessionId !== undefined) insertArgs.sessionId = input.sessionId;
    await repo.recordView(insertArgs);

    let xpEvent: Awaited<ReturnType<GamificationService['safeRecord']>> = null;
    if (req.user) {
      const post = await repo.findById(id);
      if (post) {
        // Count prior content_read events to know whether to grant
        // lector-curioso (>=5) / lector-voraz (>=25). The service is
        // idempotent on already-owned badges so passing both eagerly is fine.
        const gamificationRepo = new GamificationRepository(getDb());
        const recent = await gamificationRepo.listRecentActivity(req.user.id, 10_000);
        const priorReads = recent.filter((r) => r.kind === 'content_read').length;
        const slugsToBadge: string[] = [];
        if (priorReads + 1 >= 5) slugsToBadge.push('lector-curioso');
        if (priorReads + 1 >= 25) slugsToBadge.push('lector-voraz');
        xpEvent = await new GamificationService(getDb()).safeRecord({
          userId: req.user.id,
          kind: 'content_read',
          xpAwarded: 5,
          dedup: 'content_read',
          contentKind: 'blog',
          contentSlug: post.slug,
          payload: { kind: 'blog', slug: post.slug, postId: post.id },
          badgesToAward: slugsToBadge,
        });
      }
    }
    res.json({ data: xpEvent ? { ok: true, xpEvent } : { ok: true } });
  } catch (err) {
    next(err);
  }
});

export { router as blogRouter };
