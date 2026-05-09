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
 * Each entry is `${METHOD} ${path}` — exact method, exact path or
 * "directory" path (ending in `/`) where the path must either equal
 * the entry exactly or extend it past the slash. This rules out
 * accidental greedy matches like `/api/pulso-evil` against
 * `/api/pulso`.
 */
const ANON_ALLOWED: { method: string; path: string }[] = [
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/email/' },
  { method: 'POST', path: '/api/auth/password/' },
  { method: 'POST', path: '/api/auth/2fa/verify' },
  { method: 'POST', path: '/api/pulso' },
  { method: 'POST', path: '/api/open-data/dreams' },
];

function isAnonAllowed(method: string, path: string): boolean {
  for (const { method: m, path: p } of ANON_ALLOWED) {
    if (method !== m) continue;
    if (p.endsWith('/')) {
      // Directory-style — match the prefix only when the next char
      // is past the trailing slash.
      if (path.startsWith(p)) return true;
    } else {
      // Exact-path or exact-path followed by `/` (defensive — none of
      // the current entries have sub-routes).
      if (path === p || path.startsWith(`${p}/`)) return true;
    }
  }
  // Blog view tracking: POST /api/blog/posts/:id/view
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
