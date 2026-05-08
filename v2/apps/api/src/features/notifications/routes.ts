/**
 * Notifications HTTP slice.
 *
 *   GET  /api/notifications              (auth) — list (?onlyUnread)
 *   GET  /api/notifications/unread-count (auth)
 *   POST /api/notifications/:id/read     (auth)
 *   POST /api/notifications/read-all     (auth)
 *   POST /api/notifications/:id/dismiss  (auth)
 */
import { getDb, NotificationsRepository } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  onlyUnread: z.coerce.boolean().default(false),
});

function parseId(idStr: string | string[] | undefined): number {
  if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
  const id = Number.parseInt(idStr, 10);
  if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
  return id;
}

router.get('/', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const { limit, onlyUnread } = listQuery.parse(req.query);
    const repo = new NotificationsRepository(getDb());
    const items = await repo.listForUser(req.user.id, { limit, onlyUnread });
    res.json({ data: { notifications: items } });
  } catch (err) {
    next(err);
  }
});

router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const repo = new NotificationsRepository(getDb());
    const count = await repo.unreadCount(req.user.id);
    res.json({ data: { count } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/read', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const repo = new NotificationsRepository(getDb());
    await repo.markRead(req.user.id, id);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const repo = new NotificationsRepository(getDb());
    await repo.markAllRead(req.user.id);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/dismiss', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const id = parseId(req.params.id);
    const repo = new NotificationsRepository(getDb());
    await repo.dismiss(req.user.id, id);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export { router as notificationsRouter };
