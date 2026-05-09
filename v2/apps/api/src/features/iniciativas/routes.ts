/**
 * Iniciativas HTTP slice.
 *
 * - GET /api/iniciativas — list (filters: kind, status, limit)
 * - GET /api/iniciativas/:slug — by slug
 * - POST /api/iniciativas/:id/join (auth) — current user joins
 * - POST /api/iniciativas/:id/leave (auth) — current user leaves
 *
 * Listing is public. Joining requires auth + CSRF (the global csrf
 * guard is mounted before /api/iniciativas in app.ts).
 */
import { getDb, IniciativasRepository } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { notifyIniciativaMemberJoined } from '../notifications/producers.js';

const router: RouterType = Router();

const listQuerySchema = z.object({
  kind: z.enum(['plan', 'mission', 'community', 'territorial']).optional(),
  status: z.enum(['draft', 'open', 'in_progress', 'paused', 'archived', 'completed']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

router.get('/', async (req, res, next) => {
  try {
    const filters = listQuerySchema.parse(req.query);
    const repo = new IniciativasRepository(getDb());
    const callOpts: Parameters<typeof repo.list>[0] = { limit: filters.limit };
    if (filters.kind !== undefined) callOpts.kind = filters.kind;
    if (filters.status !== undefined) callOpts.status = filters.status;
    const items = await repo.list(callOpts);
    res.json({
      data: items.map((it) => ({
        id: it.id,
        slug: it.slug,
        title: it.title,
        summary: it.summary,
        kind: it.kind,
        planCode: it.planCode,
        status: it.status,
        memberCount: it.memberCount,
        coverImageUrl: it.coverImageUrl,
        updatedAt: it.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (typeof slug !== 'string') throw new HttpError(400, 'INVALID_SLUG', 'Slug requerido.');
    const repo = new IniciativasRepository(getDb());
    const item = await repo.findBySlug(slug);
    if (!item) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Iniciativa no encontrada.' } });
      return;
    }
    res.json({ data: { iniciativa: item } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/join', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');

    const repo = new IniciativasRepository(getDb());
    const iniciativa = await repo.findById(id);
    if (!iniciativa) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Iniciativa no encontrada.' } });
      return;
    }
    try {
      await repo.addMember({ iniciativaId: id, userId: req.user.id, role: 'member' });
    } catch (sqlErr) {
      // Composite unique violation = already a member. Idempotent success.
      if (sqlErr instanceof Error && /unique/i.test(sqlErr.message)) {
        res.json({ data: { ok: true, alreadyMember: true } });
        return;
      }
      throw sqlErr;
    }
    // Best-effort notify the owner.
    if (iniciativa.createdByUserId && iniciativa.createdByUserId !== req.user.id) {
      void notifyIniciativaMemberJoined(
        iniciativa.createdByUserId,
        id,
        iniciativa.slug,
        req.user.username,
      );
    }
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/leave', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');

    const repo = new IniciativasRepository(getDb());
    await repo.removeMember(id, req.user.id);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export { router as iniciativasRouter };
