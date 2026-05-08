/**
 * Double-submit-cookie CSRF protection.
 *
 * The server sets a non-httpOnly `eihg_csrf` cookie at login. For every
 * state-changing request, the client must echo that token back in the
 * `X-CSRF-Token` header. An attacker on a different origin can't read
 * the cookie (same-origin policy on JS), so they can't forge the header.
 *
 * Safe methods (GET/HEAD/OPTIONS) are skipped.
 */
import { timingSafeEqual } from 'node:crypto';

import { COOKIE_CSRF } from '../features/auth/tokens.js';

import type { NextFunction, Request, Response } from 'express';


const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

function sameToken(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function csrfProtect(req: Request, res: Response, next: NextFunction): void {
  if (SAFE.has(req.method)) {
    next();
    return;
  }
  const cookies = req.cookies as Record<string, string> | undefined;
  const cookieToken = cookies?.[COOKIE_CSRF];
  const headerToken = req.header('x-csrf-token');
  if (!cookieToken || !headerToken || !sameToken(cookieToken, headerToken)) {
    res.status(403).json({
      error: { code: 'CSRF_FAILED', message: 'Token CSRF inválido.' },
      requestId: res.locals.requestId,
    });
    return;
  }
  next();
}
