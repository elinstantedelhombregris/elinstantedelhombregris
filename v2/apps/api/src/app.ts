/**
 * Express app factory. Importable from tests without binding a port.
 */
import cookieParser from 'cookie-parser';
import express from 'express';


import { logger } from './lib/logger.js';
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

  // Tail middleware
  app.use(notFoundHandler());
  app.use(errorHandler());

  logger.debug('Express app constructed');
  return app;
}
