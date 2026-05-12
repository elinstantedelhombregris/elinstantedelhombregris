/**
 * Pulso + propuestas HTTP slice.
 *
 * - POST /api/pulso         (anon allowed) — submit a citizen signal
 * - GET  /api/pulso         — list with filters (province, theme)
 * - GET  /api/propuestas    — list (province, status)
 * - GET  /api/propuestas/:id — get one
 * - POST /api/propuestas/:id/vote (auth) — cast -1 | 0 | +1
 *
 * The submit endpoint is intentionally light on auth so anyone can
 * leave a signal. The IP rate limit + CSRF (when authed) keep abuse
 * manageable. The mandato-engine cron classifies the signal later.
 */
import { getDb, PulsoRepository } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { anonSubmitRateLimit } from '../../middleware/rate-limit.js';
import { GamificationService } from '../gamification/service.js';

const router: RouterType = Router();

const submitSchema = z.object({
  body: z.string().trim().min(1, 'El texto no puede estar vacío.').max(2000, 'Máximo 2000 caracteres.'),
  provinceId: z.number().int().positive().optional(),
  source: z.enum(['mandato_form', 'community_post', 'comment']).default('mandato_form'),
});

const listSignalsQuery = z.object({
  provinceId: z.coerce.number().int().positive().optional(),
  theme: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

const listProposalsQuery = z.object({
  provinceId: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'voting', 'accepted', 'rejected', 'archived']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const voteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

router.post('/pulso', anonSubmitRateLimit(), optionalAuthenticate, async (req, res, next) => {
  try {
    const input = submitSchema.parse(req.body);
    const repo = new PulsoRepository(getDb());
    const insertInput: Parameters<typeof repo.addSignal>[0] = {
      body: input.body,
      source: input.source,
    };
    if (req.user) insertInput.userId = req.user.id;
    if (input.provinceId !== undefined) insertInput.provinceId = input.provinceId;
    const signal = await repo.addSignal(insertInput);
    let xpEvent: Awaited<ReturnType<GamificationService['safeRecord']>> = null;
    if (req.user) {
      xpEvent = await new GamificationService(getDb()).safeRecord({
        userId: req.user.id,
        kind: 'pulse_submitted',
        xpAwarded: 10,
        badgesToAward: ['first-pulse'],
      });
    }
    res.status(201).json({ data: xpEvent ? { id: signal.id, xpEvent } : { id: signal.id } });
  } catch (err) {
    next(err);
  }
});

router.get('/pulso', async (req, res, next) => {
  try {
    const filters = listSignalsQuery.parse(req.query);
    const repo = new PulsoRepository(getDb());
    const callOpts: Parameters<typeof repo.listSignals>[0] = { limit: filters.limit };
    if (filters.provinceId !== undefined) callOpts.provinceId = filters.provinceId;
    if (filters.theme !== undefined) callOpts.theme = filters.theme;
    const signals = await repo.listSignals(callOpts);
    res.json({
      data: signals.map((s) => ({
        id: s.id,
        body: s.body,
        provinceId: s.provinceId,
        theme: s.theme,
        sentiment: s.sentiment,
        source: s.source,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

const createProposalSchema = z.object({
  title: z.string().trim().min(3, 'El título es muy corto.').max(200, 'Máximo 200 caracteres.'),
  summary: z.string().trim().min(10, 'El resumen es muy corto.').max(500, 'Máximo 500 caracteres.'),
  bodyMarkdown: z.string().trim().max(5000, 'Máximo 5000 caracteres.').optional(),
  provinceId: z.number().int().positive().optional(),
});

router.post('/propuestas', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const input = createProposalSchema.parse(req.body);
    const repo = new PulsoRepository(getDb());
    const insertInput: Parameters<typeof repo.createProposal>[0] = {
      title: input.title,
      summary: input.summary,
      authorId: req.user.id,
      status: 'voting',
    };
    if (input.bodyMarkdown !== undefined) insertInput.bodyMarkdown = input.bodyMarkdown;
    if (input.provinceId !== undefined) insertInput.provinceId = input.provinceId;
    const proposal = await repo.createProposal(insertInput);

    const xpEvent = await new GamificationService(getDb()).safeRecord({
      userId: req.user.id,
      kind: 'propuesta_submitted',
      xpAwarded: 15,
      badgesToAward: ['propuesta-author'],
    });

    res.status(201).json({ data: xpEvent ? { proposal, xpEvent } : { proposal } });
  } catch (err) {
    next(err);
  }
});

router.get('/propuestas', async (req, res, next) => {
  try {
    const filters = listProposalsQuery.parse(req.query);
    const repo = new PulsoRepository(getDb());
    const callOpts: Parameters<typeof repo.listProposals>[0] = { limit: filters.limit };
    if (filters.provinceId !== undefined) callOpts.provinceId = filters.provinceId;
    if (filters.status !== undefined) callOpts.status = filters.status;
    const proposals = await repo.listProposals(callOpts);
    res.json({ data: proposals });
  } catch (err) {
    next(err);
  }
});

router.get('/propuestas/:id', async (req, res, next) => {
  try {
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
    const repo = new PulsoRepository(getDb());
    const proposal = await repo.findProposal(id);
    if (!proposal) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Propuesta no encontrada.' } });
      return;
    }
    res.json({ data: { proposal } });
  } catch (err) {
    next(err);
  }
});

router.post('/propuestas/:id/vote', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
    const { value } = voteSchema.parse(req.body);
    const repo = new PulsoRepository(getDb());
    await repo.castVote({ proposalId: id, userId: req.user.id, value });
    const proposal = await repo.findProposal(id);
    res.json({ data: { ok: true, voteScore: proposal?.voteScore ?? 0, voteCount: proposal?.voteCount ?? 0 } });
  } catch (err) {
    next(err);
  }
});

export { router as pulsoRouter };
