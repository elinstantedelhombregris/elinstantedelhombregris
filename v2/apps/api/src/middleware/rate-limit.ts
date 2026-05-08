import rateLimit from 'express-rate-limit';

import { getConfig } from '../lib/config.js';

import type { RequestHandler } from 'express';

/**
 * General-purpose rate limiter applied to every API request.
 * Override per-route with stricter limits where needed (auth, etc.).
 */
export function generalRateLimit(): RequestHandler {
  const config = getConfig();
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes. Intentá de nuevo en un momento.' } },
  });
}
