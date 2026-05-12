/**
 * Goals + weekly check-ins HTTP slice.
 *
 *   GET   /api/goals                    (auth) — active goals
 *   POST  /api/goals                    (auth) — create
 *   PATCH /api/goals/:id                (auth) — update
 *   POST  /api/goals/:id/complete       (auth) — mark completed
 *   GET   /api/checkins/current-week    (auth) — checkin for the running week
 *   POST  /api/checkins                 (auth) — submit
 */
import { GoalsRepository, getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { GamificationService, type XpEventPayload } from '../gamification/service.js';

const router: RouterType = Router();

const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['engagement', 'knowledge', 'community', 'impact', 'territorial']),
  priority: z.number().int().min(1).max(5).default(3),
  targetDate: z.string().datetime().optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  status: z.enum(['active', 'paused', 'completed', 'abandoned']).optional(),
});

const checkinSchema = z.object({
  weekStart: z.string().datetime(),
  progressScore: z.number().int().min(1).max(5),
  reflection: z.string().max(2000).optional(),
  actedOnGoals: z.boolean().default(false),
});

router.get('/goals', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const repo = new GoalsRepository(getDb());
    const goals = await repo.listActiveForUser(req.user.id);
    res.json({ data: { goals } });
  } catch (err) {
    next(err);
  }
});

router.post('/goals', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const input = createGoalSchema.parse(req.body);
    const repo = new GoalsRepository(getDb());
    const insertArgs: Parameters<typeof repo.createGoal>[0] = {
      userId: req.user.id,
      title: input.title,
      category: input.category,
      priority: input.priority,
    };
    if (input.description !== undefined) insertArgs.description = input.description;
    if (input.targetDate !== undefined) insertArgs.targetDate = new Date(input.targetDate);
    const goal = await repo.createGoal(insertArgs);
    res.status(201).json({ data: { goal } });
  } catch (err) {
    next(err);
  }
});

router.patch('/goals/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
    const patch = updateGoalSchema.parse(req.body);

    const repo = new GoalsRepository(getDb());
    const goal = await repo.findGoal(id);
    if (goal?.userId !== req.user.id) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Objetivo no encontrado.' } });
      return;
    }
    // Strip undefined values so exactOptionalPropertyTypes is happy.
    const cleanedPatch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) cleanedPatch[k] = v;
    }
    const updated = await repo.updateGoal(id, cleanedPatch);
    res.json({ data: { goal: updated } });
  } catch (err) {
    next(err);
  }
});

router.post('/goals/:id/complete', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
    const db = getDb();
    const repo = new GoalsRepository(db);
    const goal = await repo.findGoal(id);
    if (goal?.userId !== req.user.id) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Objetivo no encontrado.' } });
      return;
    }
    // Idempotency: completing an already-completed goal returns
    // success but DOES NOT grant XP again (prevents double-click /
    // replay XP farming).
    const wasAlreadyCompleted = goal.status === 'completed';
    await repo.completeGoal(id);
    let xpEvent: XpEventPayload | null = null;
    if (!wasAlreadyCompleted) {
      xpEvent = await new GamificationService(getDb()).safeRecord({
        userId: req.user.id,
        kind: 'goal_completed',
        xpAwarded: 50,
        badgesToAward: ['first-goal'],
      });
    }
    res.json({ data: xpEvent ? { ok: true, alreadyCompleted: wasAlreadyCompleted, xpEvent } : { ok: true, alreadyCompleted: wasAlreadyCompleted } });
  } catch (err) {
    next(err);
  }
});

/** Returns the Monday-00:00 UTC for a given date. */
function weekStartUtc(d: Date): Date {
  const copy = new Date(d.getTime());
  const day = copy.getUTCDay() === 0 ? 7 : copy.getUTCDay(); // Mon=1..Sun=7
  copy.setUTCDate(copy.getUTCDate() - (day - 1));
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

router.get('/checkins/current-week', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const repo = new GoalsRepository(getDb());
    const ws = weekStartUtc(new Date());
    const existing = await repo.findCurrentWeekCheckin(req.user.id, ws);
    res.json({ data: { weekStart: ws.toISOString(), checkin: existing ?? null } });
  } catch (err) {
    next(err);
  }
});

router.post('/checkins', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const input = checkinSchema.parse(req.body);
    const repo = new GoalsRepository(getDb());
    const insertArgs: Parameters<typeof repo.addCheckin>[0] = {
      userId: req.user.id,
      weekStart: new Date(input.weekStart),
      progressScore: input.progressScore,
      actedOnGoals: input.actedOnGoals,
    };
    if (input.reflection !== undefined) insertArgs.reflection = input.reflection;
    const { checkin, created } = await repo.addCheckin(insertArgs);
    res.status(created ? 201 : 200).json({ data: { checkin } });
  } catch (err) {
    next(err);
  }
});

export { router as goalsRouter };
