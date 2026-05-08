import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

/**
 * Attach a request ID to every incoming request.
 *
 * Honors `X-Request-Id` if the client provides one (e.g. for tracing
 * across services), otherwise generates a fresh UUID.
 */
export function requestId() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const incoming = req.header('x-request-id');
    const id = incoming && incoming.length <= 128 ? incoming : randomUUID();
    res.locals.requestId = id;
    res.setHeader('x-request-id', id);
    next();
  };
}
