/**
 * Community feed HTTP slice.
 *
 *   GET  /api/community/posts          — list published feed
 *   GET  /api/community/posts/:id      — single post
 *   POST /api/community/posts          (auth) — create
 *   POST /api/community/posts/:id/like (auth)
 *   DELETE /api/community/posts/:id/like (auth)
 *   POST /api/community/posts/:id/save (auth)
 *   DELETE /api/community/posts/:id/save (auth)
 */
import { CommunityRepository, getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { notifyCommunityPostLiked } from '../notifications/producers.js';

const router: RouterType = Router();

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  kind: z.enum(['discussion', 'event', 'announcement', 'question']).optional(),
});

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(10_000),
  kind: z.enum(['discussion', 'event', 'announcement', 'question']).default('discussion'),
});

function parseId(idStr: string | string[] | undefined): number {
  if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
  const id = Number.parseInt(idStr, 10);
  if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
  return id;
}

router.get('/posts', async (req, res, next) => {
  try {
    const { limit, offset, kind } = listQuery.parse(req.query);
    const repo = new CommunityRepository(getDb());
    const callOpts: Parameters<typeof repo.listPosts>[0] = { limit, offset };
    if (kind !== undefined) callOpts.kind = kind;
    const posts = await repo.listPosts(callOpts);
    res.json({ data: { posts } });
  } catch (err) {
    next(err);
  }
});

router.get('/posts/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const repo = new CommunityRepository(getDb());
    const post = await repo.findPostById(id);
    if (!post) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post no encontrado.' } });
      return;
    }
    res.json({ data: { post } });
  } catch (err) {
    next(err);
  }
});

router.post('/posts', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const input = createSchema.parse(req.body);
    const repo = new CommunityRepository(getDb());
    const post = await repo.createPost({
      userId: req.user.id,
      title: input.title,
      content: input.content,
      kind: input.kind,
    });
    res.status(201).json({ data: { post } });
  } catch (err) {
    next(err);
  }
});

/**
 * Returns `true` only when this call actually changed state — used by
 * the like route to decide whether to fire a notification (so repeated
 * POSTs don't spam the post author).
 */
async function toggleInteraction(
  repo: CommunityRepository,
  kind: 'like' | 'save',
  postId: number,
  userId: number,
  add: boolean,
): Promise<boolean> {
  if (add) {
    if (await repo.hasInteraction(postId, userId, kind)) return false;
    await repo.addInteraction({ postId, userId, kind });
    if (kind === 'like') await repo.incrementPostCounter(postId, 'likeCount');
    return true;
  }
  await repo.removeInteraction(postId, userId, kind);
  if (kind === 'like') await repo.decrementPostCounter(postId, 'likeCount');
  return true;
}

router.post('/posts/:id/like', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const repo = new CommunityRepository(getDb());
    const changed = await toggleInteraction(repo, 'like', id, req.user.id, true);
    // Only notify on first like — repeated POSTs return early so the
    // post author doesn't get spammed.
    if (changed) {
      const post = await repo.findPostById(id);
      if (post && post.userId !== req.user.id) {
        void notifyCommunityPostLiked(post.userId, id, req.user.username);
      }
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
    const repo = new CommunityRepository(getDb());
    await toggleInteraction(repo, 'like', id, req.user.id, false);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/save', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const repo = new CommunityRepository(getDb());
    await toggleInteraction(repo, 'save', id, req.user.id, true);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.delete('/posts/:id/save', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const repo = new CommunityRepository(getDb());
    await toggleInteraction(repo, 'save', id, req.user.id, false);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export { router as communityRouter };
