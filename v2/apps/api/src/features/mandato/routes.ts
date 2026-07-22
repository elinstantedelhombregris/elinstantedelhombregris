/**
 * Mandato HTTP slice — read-only.
 *
 *   GET /api/mandato/documento — the aggregate document feed (spec 2.3)
 */
import { getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';

import { buildDocumento } from './service.js';

const router: RouterType = Router();

router.get('/documento', async (_req, res, next) => {
  try {
    res.json({ data: await buildDocumento(getDb()) });
  } catch (err) {
    next(err);
  }
});

export { router as mandatoRouter };
