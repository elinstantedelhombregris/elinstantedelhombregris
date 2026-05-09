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
import { BlogRepository, getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
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

function parseId(idStr: string | string[] | undefined): number {
  if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
  const id = Number.parseInt(idStr, 10);
  if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
  return id;
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

router.post('/posts/:id/view', optionalAuthenticate, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const input = viewSchema.parse(req.body ?? {});
    const repo = new BlogRepository(getDb());
    const insertArgs: Parameters<typeof repo.recordView>[0] = { postId: id };
    if (req.user) insertArgs.userId = req.user.id;
    if (input.sessionId !== undefined) insertArgs.sessionId = input.sessionId;
    await repo.recordView(insertArgs);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export { router as blogRouter };
