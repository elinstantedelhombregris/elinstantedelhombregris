import { ZodError } from 'zod';

import { logger } from '../lib/logger.js';

import type { NextFunction, Request, Response } from 'express';

/**
 * Application-level error subclass. Carries an HTTP status and an
 * optional Spanish (rioplatense) user-facing message.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** 404 fallback — must be registered after every route. */
export function notFoundHandler() {
  return (req: Request, res: Response): void => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `No encontramos la ruta ${req.method} ${req.path}.`,
      },
      requestId: res.locals.requestId,
    });
  };
}

/** Centralized error handler — must be last in the middleware chain. */
export function errorHandler() {
  return (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const { requestId } = res.locals;

    if (err instanceof ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los datos enviados no son válidos.',
          issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
        requestId,
      });
      return;
    }

    if (err instanceof HttpError) {
      res.status(err.status).json({
        error: { code: err.code, message: err.message, details: err.details },
        requestId,
      });
      return;
    }

    logger.error({ err, requestId, path: req.path, method: req.method }, 'Unhandled error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Algo salió mal. Estamos revisándolo.',
      },
      requestId,
    });
  };
}
