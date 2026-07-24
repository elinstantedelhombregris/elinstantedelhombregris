/**
 * Semillas HTTP slice — el compromiso de tres frases (spec 2.5).
 *
 *   POST /api/semillas        — plantar (anónimo ok; rate-limited; CSRF allow-listed)
 *   GET  /api/semillas/count  — conteo público (solo aprobadas)
 */
import { getDb, SemillasRepository } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { optionalAuthenticate } from '../../middleware/auth.js';
import { anonSubmitRateLimit } from '../../middleware/rate-limit.js';

const router: RouterType = Router();

const frase = (nombre: string) =>
  z
    .string()
    .trim()
    .min(1, `Tu ${nombre} no puede quedar vacío.`)
    .max(280, 'Máximo 280 caracteres. Una semilla es una frase, no un ensayo.');

const plantarSchema = z.object({
  basta: frase('basta'),
  sueno: frase('sueño'),
  compromiso: frase('compromiso'),
});

router.post('/', anonSubmitRateLimit(), optionalAuthenticate, async (req, res, next) => {
  try {
    const input = plantarSchema.parse(req.body);
    const repo = new SemillasRepository(getDb());
    const insertArgs: Parameters<typeof repo.create>[0] = { ...input };
    if (req.user) insertArgs.userId = req.user.id;
    const semilla = await repo.create(insertArgs);
    res.status(201).json({ data: { id: semilla.id, createdAt: semilla.createdAt.toISOString() } });
  } catch (err) {
    next(err);
  }
});

router.get('/count', async (_req, res, next) => {
  try {
    const total = await new SemillasRepository(getDb()).countApproved();
    res.json({ data: { total } });
  } catch (err) {
    next(err);
  }
});

export { router as semillasRouter };
