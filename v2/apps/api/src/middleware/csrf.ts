/**
 * Double-submit-cookie CSRF protection.
 *
 * The server sets a non-httpOnly `eihg_csrf` cookie at login. For every
 * state-changing request, the client must echo that token back in the
 * `X-CSRF-Token` header. An attacker on a different origin can't read
 * the cookie (same-origin policy on JS), so they can't forge the header.
 *
 * Safe methods (GET/HEAD/OPTIONS) are skipped.
 *
 * A small allow-list of public paths (login, register, anon-allowed
 * mutations) is also skipped — those routes have other defenses
 * (rate-limiting, password) and don't have a session cookie to sample.
 */
import { timingSafeEqual } from 'node:crypto';

import { COOKIE_CSRF } from '../features/auth/tokens.js';

import type { NextFunction, Request, Response } from 'express';


const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Anonymous-allowed mutating routes. These either pre-date the session
 * cookie (login, register, password reset) or are intentionally
 * unauthenticated by design (pulso submit, dream submit, blog view).
 *
 * Each entry is `${METHOD} ${pathStartsWith}` — exact method, prefix
 * match on the path so `/api/auth/email/verify` and
 * `/api/auth/email/send-verification` are both covered by `/api/auth/`.
 */
const ANON_ALLOWED: { method: string; prefix: string }[] = [
  { method: 'POST', prefix: '/api/auth/login' },
  { method: 'POST', prefix: '/api/auth/register' },
  { method: 'POST', prefix: '/api/auth/email/' },
  { method: 'POST', prefix: '/api/auth/password/' },
  { method: 'POST', prefix: '/api/auth/2fa/verify' },
  { method: 'POST', prefix: '/api/pulso' },
  { method: 'POST', prefix: '/api/open-data/dreams' },
  // Blog view tracking is mounted as POST /api/blog/posts/:id/view —
  // the `/view` suffix is what we test for after stripping the id.
];

function isAnonAllowed(method: string, path: string): boolean {
  for (const { method: m, prefix } of ANON_ALLOWED) {
    if (method === m && path.startsWith(prefix)) return true;
  }
  // /api/blog/posts/:id/view — match the literal suffix.
  if (method === 'POST' && /^\/api\/blog\/posts\/\d+\/view$/.test(path)) return true;
  return false;
}

function sameToken(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function csrfProtect(req: Request, res: Response, next: NextFunction): void {
  if (SAFE.has(req.method)) {
    next();
    return;
  }
  // Use originalUrl (with query stripped) — `req.path` is rewritten
  // when this middleware is mounted under `/api`, which would defeat
  // the prefix-based allow-list.
  const fullPath = (req.originalUrl.split('?')[0] ?? req.originalUrl);
  if (isAnonAllowed(req.method, fullPath)) {
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
