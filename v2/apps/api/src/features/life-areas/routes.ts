/**
 * Life areas HTTP slice.
 *
 *   GET  /api/life-areas                — list of 12 areas
 *   GET  /api/life-areas/:slug          — area detail (subcategories + questions)
 *   POST /api/life-areas/quiz/responses — upsert one or many responses
 *   GET  /api/life-areas/me/state       — per-user state across all areas (auth)
 *
 * Frontend uses 0-10 scale; backend stores 0-100. SCORE_MAPPING_FACTOR
 * lives here so the contract is explicit.
 */
import { GamificationRepository, getDb, LifeAreasRepository } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { logger } from '../../lib/logger.js';
import { authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

import { rescoreUser } from './scoring.js';

const router: RouterType = Router();

/** Scale up: frontend 0-10 → backend 0-100. */
const SCALE_FACTOR = 10;

const responseSchema = z.object({
  questionId: z.number().int().positive(),
  /** Frontend value: 0-10 (scale) or any string (text). */
  value: z.union([z.number().min(0).max(10), z.string().max(2000)]),
});
const responsesBatchSchema = z.object({
  responses: z.array(responseSchema).min(1).max(120),
});

router.get('/', async (_req, res, next) => {
  try {
    const repo = new LifeAreasRepository(getDb());
    const areas = await repo.listAreas();
    res.json({ data: { areas } });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (typeof slug !== 'string') throw new HttpError(400, 'INVALID_SLUG', 'Slug requerido.');
    const repo = new LifeAreasRepository(getDb());
    const area = await repo.findAreaBySlug(slug);
    if (!area) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Área no encontrada.' } });
      return;
    }
    const [subcategories, questions] = await Promise.all([
      repo.listSubcategories(area.id),
      repo.listQuestions(area.id),
    ]);
    res.json({ data: { area, subcategories, questions } });
  } catch (err) {
    next(err);
  }
});

router.post('/quiz/responses', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const { responses } = responsesBatchSchema.parse(req.body);
    const repo = new LifeAreasRepository(getDb());

    // We need the question metadata to know area + category to pair
    // current+desired into a single response row.
    // Group incoming by questionId; each scale response becomes one
    // upsert keyed by (user, question).
    const saved = [];
    for (const r of responses) {
      const isText = typeof r.value === 'string';
      const inputArgs: Parameters<typeof repo.upsertResponse>[0] = {
        userId: req.user.id,
        questionId: r.questionId,
      };
      if (isText) inputArgs.textValue = r.value as string;
      else inputArgs.currentValue = Math.round((r.value as number) * SCALE_FACTOR);


      const row = await repo.upsertResponse(inputArgs);
      saved.push(row);
    }

    // Recompute aggregates after the batch lands. Cheap at this scale.
    await rescoreUser(req.user.id);

    // Best-effort XP for the quiz batch — but only the first time
    // today, so retaking the quiz repeatedly doesn't farm XP.
    try {
      const gamification = new GamificationRepository(getDb());
      const today = new Date().toISOString().slice(0, 10);
      const alreadyToday = await gamification.hasActivityOnDate(req.user.id, 'quiz_completed', today);
      if (!alreadyToday) {
        await gamification.logActivity({
          userId: req.user.id,
          kind: 'quiz_completed',
          xpAwarded: 25,
          activityDate: today,
        });
      }
    } catch (gErr) {
      logger.warn({ err: gErr, userId: req.user.id }, 'gamification log failed for quiz_completed');
    }

    res.json({ data: { saved: saved.length } });
  } catch (err) {
    next(err);
  }
});

router.get('/me/state', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const repo = new LifeAreasRepository(getDb());
    const state = await repo.listStateForUser(req.user.id);
    res.json({ data: { state } });
  } catch (err) {
    next(err);
  }
});

export { router as lifeAreasRouter };
