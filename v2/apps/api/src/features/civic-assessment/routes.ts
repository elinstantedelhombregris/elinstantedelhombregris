/**
 * Civic assessment HTTP slice.
 *
 *   GET  /api/civic-assessment/questions  — public catalog
 *   POST /api/civic-assessment/start      (auth) — create new in-progress
 *   GET  /api/civic-assessment/current    (auth) — open one if any
 *   POST /api/civic-assessment/:id/respond (auth) — upsert response
 *   POST /api/civic-assessment/:id/complete (auth) — score + persist profile
 *   GET  /api/civic-assessment/profile    (auth) — latest scored profile
 */
import { CivicAssessmentRepository, getDb } from '@v2/db';
import {
  archetypeFor,
  CIVIC_QUESTIONS,
  CIVIC_QUESTIONS_VERSION,
  scoreCivic,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();

const respondSchema = z.object({
  questionId: z.string().min(1),
  value: z.number().int().min(1).max(5),
  note: z.string().max(2000).optional(),
});

router.get('/questions', (_req, res) => {
  res.json({ data: { version: CIVIC_QUESTIONS_VERSION, questions: CIVIC_QUESTIONS } });
});

router.post('/start', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const repo = new CivicAssessmentRepository(getDb());
    const a = await repo.startAssessment(req.user.id, CIVIC_QUESTIONS_VERSION);
    res.status(201).json({ data: { assessment: a } });
  } catch (err) {
    next(err);
  }
});

router.get('/current', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const repo = new CivicAssessmentRepository(getDb());
    const a = await repo.getCurrentForUser(req.user.id);
    if (!a) {
      res.json({ data: { assessment: null, responses: [] } });
      return;
    }
    const responses = await repo.listResponses(a.id);
    res.json({ data: { assessment: a, responses } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/respond', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
    const input = respondSchema.parse(req.body);

    const repo = new CivicAssessmentRepository(getDb());
    const assessment = await repo.findById(id);
    if (assessment?.userId !== req.user.id) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Assessment no encontrado.' } });
      return;
    }
    const insertArgs: Parameters<typeof repo.addResponse>[0] = {
      assessmentId: id,
      questionId: input.questionId,
      value: input.value,
    };
    if (input.note !== undefined) insertArgs.note = input.note;
    await repo.addResponse(insertArgs);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/complete', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');

    const repo = new CivicAssessmentRepository(getDb());
    const assessment = await repo.findById(id);
    if (assessment?.userId !== req.user.id) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Assessment no encontrado.' } });
      return;
    }

    const responses = await repo.listResponses(id);
    const map: Record<string, number> = {};
    for (const r of responses) map[r.questionId] = r.value;
    const scores = scoreCivic(map);
    const archetype = archetypeFor(scores);

    await repo.complete(id);
    const profile = await repo.upsertProfile({
      userId: req.user.id,
      scores,
      archetype,
      lastAssessmentId: id,
    });

    res.json({ data: { profile } });
  } catch (err) {
    next(err);
  }
});

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const repo = new CivicAssessmentRepository(getDb());
    const profile = await repo.getProfile(req.user.id);
    res.json({ data: { profile: profile ?? null } });
  } catch (err) {
    next(err);
  }
});

export { router as civicAssessmentRouter };
