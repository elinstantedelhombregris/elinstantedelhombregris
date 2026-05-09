/**
 * Express app factory. Importable from tests without binding a port.
 */
import cookieParser from 'cookie-parser';
import express from 'express';

import { authEmailRouter } from './features/auth/email-routes.js';
import { authRouter } from './features/auth/routes.js';
import { twoFactorRouter } from './features/auth/two-factor-routes.js';
import { blogRouter } from './features/blog/routes.js';
import { civicAssessmentRouter } from './features/civic-assessment/routes.js';
import { coachingRouter } from './features/coaching/routes.js';
import { communityRouter } from './features/community/routes.js';
import { goalsRouter } from './features/goals/routes.js';
import { iniciativasRouter } from './features/iniciativas/routes.js';
import { lifeAreasRouter } from './features/life-areas/routes.js';
import { notificationsRouter } from './features/notifications/routes.js';
import { openDataRouter } from './features/open-data/routes.js';
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

  // CSRF guard runs before all feature routers. Safe methods
  // (GET/HEAD/OPTIONS) and a small allow-list of public mutations
  // (login, register, password/email flows, 2fa/verify, anonymous
  // pulso + dream submission, blog view tracking) bypass the check.
  // Everything else must echo the eihg_csrf cookie value as
  // X-CSRF-Token. See middleware/csrf.ts for the allow-list.
  app.use('/api', csrfProtect);

  // Auth routes. Most endpoints are exempted at the middleware level
  // (login/register/email/password/2fa-verify); refresh, logout, /me,
  // 2fa-setup/enable/disable require the CSRF header.
  app.use('/api/auth', authRouter);
  app.use('/api/auth', authEmailRouter);
  app.use('/api/auth', twoFactorRouter);

  // Feature routes. GETs pass through CSRF unchanged. Mutating
  // endpoints expect X-CSRF-Token + matching cookie.
  app.use('/api/iniciativas', iniciativasRouter);
  app.use('/api', pulsoRouter);
  app.use('/api/life-areas', lifeAreasRouter);
  app.use('/api/civic-assessment', civicAssessmentRouter);
  app.use('/api', goalsRouter);
  app.use('/api/coaching', coachingRouter);
  app.use('/api/blog', blogRouter);
  app.use('/api/community', communityRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/open-data', openDataRouter);

  // Tail middleware
  app.use(notFoundHandler());
  app.use(errorHandler());

  logger.debug('Express app constructed');
  return app;
}
