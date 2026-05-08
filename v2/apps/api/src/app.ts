/**
 * Express app factory. Importable from tests without binding a port.
 */
import cookieParser from 'cookie-parser';
import express from 'express';

import { authEmailRouter } from './features/auth/email-routes.js';
import { authRouter } from './features/auth/routes.js';
import { twoFactorRouter } from './features/auth/two-factor-routes.js';
import { iniciativasRouter } from './features/iniciativas/routes.js';
import { lifeAreasRouter } from './features/life-areas/routes.js';
import { pulsoRouter } from './features/pulso/routes.js';
import { logger } from './lib/logger.js';
import { csrfProtect } from './middleware/csrf.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { generalRateLimit } from './middleware/rate-limit.js';
import { requestId } from './middleware/request-id.js';
import { corsMiddleware, securityHeaders } from './middleware/security.js';
import { healthRouter } from './routes/health.js';

import type { Express } from 'express';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Security must come first.
  app.use(securityHeaders());
  app.use(corsMiddleware());
  app.use(requestId());

  // Body parsing — 1 MB default. Routes that need more lift their own limit.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());

  // Rate limiting after body parse so the limiter can see the request.
  app.use('/api', generalRateLimit());

  // Routes
  app.use('/api/health', healthRouter);
  // Auth routes — register/login don't have a CSRF cookie yet, so CSRF
  // is enforced per-route on /me/refresh/logout where it matters. The
  // login/register endpoints are state-changing but rely on the
  // password / username uniqueness as their primary defense.
  app.use('/api/auth', authRouter);
  app.use('/api/auth', authEmailRouter);
  app.use('/api/auth', twoFactorRouter);

  // Public reads (no CSRF needed for GETs anyway, but mounted before
  // the global guard to keep them clearly identified).
  app.use('/api/iniciativas', iniciativasRouter);
  app.use('/api', pulsoRouter);
  app.use('/api/life-areas', lifeAreasRouter);

  // CSRF guard for everything else that mutates state.
  app.use('/api', csrfProtect);

  // Tail middleware
  app.use(notFoundHandler());
  app.use(errorHandler());

  logger.debug('Express app constructed');
  return app;
}
