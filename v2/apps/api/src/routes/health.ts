import { Router } from 'express';

import type { Router as RouterType } from 'express';

const router: RouterType = Router();

/**
 * GET /api/health
 *
 * Liveness probe. Returns 200 when the process is responsive. Database
 * health is checked separately at /api/health/db (added in Phase 1)
 * because that touch can latency-amplify cold starts on serverless.
 */
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as healthRouter };
