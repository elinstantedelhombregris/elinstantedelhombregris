/**
 * Auth middleware: reads access token from the httpOnly cookie and
 * attaches a typed `req.user` to downstream handlers. Returns 401 on
 * missing/invalid token (or skips, in optionalAuth).
 *
 * The `req.user` typing is augmented in src/types/express.d.ts.
 */
import { COOKIE_ACCESS, verifyAccessToken } from '../features/auth/tokens.js';

import type { NextFunction, Request, Response } from 'express';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const cookies = req.cookies as Record<string, string> | undefined;
  const token = cookies?.[COOKIE_ACCESS];
  if (!token) {
    res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Necesitás iniciar sesión.' },
      requestId: res.locals.requestId,
    });
    return;
  }
  const claims = verifyAccessToken(token);
  if (!claims) {
    res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Tu sesión expiró. Iniciá sesión de nuevo.' },
      requestId: res.locals.requestId,
    });
    return;
  }
  req.user = { id: claims.sub, username: claims.username, email: claims.email };
  next();
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const cookies = req.cookies as Record<string, string> | undefined;
  const token = cookies?.[COOKIE_ACCESS];
  if (token) {
    const claims = verifyAccessToken(token);
    if (claims) {
      req.user = { id: claims.sub, username: claims.username, email: claims.email };
    }
  }
  next();
}
