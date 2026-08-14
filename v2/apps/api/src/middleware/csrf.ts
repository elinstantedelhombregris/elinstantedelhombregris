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
  /**
   * La ingesta de señales. Anónima por diseño —la conversión primaria del
   * sitio no pide cuenta— y por eso no hay sesión contra la que hacer el doble
   * envío de cookie. El techo es `anonSubmitRateLimit`, igual que las de al
   * lado.
   */
  { method: 'POST', path: '/api/v1/civic/senales' },
  { method: 'POST', path: '/api/semillas' },
  /**
   * Ingesta de campo del móvil (spec 4 §4). No hay cookie de sesión ni origen
   * de navegador del otro lado: es el outbox de `juego/` posteando desde una
   * app nativa, así que el doble envío de cookie no aplica. El techo es el
   * límite de tasa, y la autenticación por dispositivo llega con el contrato
   * de sync completo.
   */
  { method: 'POST', path: '/api/v1/civic/capturas' },
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
  /**
   * El olvido de una dirección: DELETE /api/v1/geo/direccion/:tabla/:id?c=…
   * (spec `2026-08-11-a-la-tierra.md` §4.5).
   *
   * Va como patrón EXACTO —un regex anclado, no una entrada de `ANON_ALLOWED`—
   * y es deliberado. Una entrada `'/api/v1/geo/direccion'` en la lista quedaría
   * exenta por la rama `path.startsWith(`${p}/`)` de acá arriba, que es
   * exactamente la que se va a borrar (Task 14 del plan de la tierra): esa rama
   * exime SUBRUTAS que nadie decidió eximir, y el día que `/direccion/...`
   * gane un `POST` hermano se lo llevaría puesto sin que nadie lo note.
   *
   * Se exime porque su autenticación no es la cookie: es el HMAC que viajó en
   * el recibo, y quien lo tiene es exactamente quien cargó la dirección. Del
   * otro lado puede no haber navegador —la app de campo no manda cookies— así
   * que el doble envío no tiene qué muestrear.
   */
  if (
    method === 'DELETE' &&
    /^\/api\/v1\/geo\/direccion\/[a-z_]{1,40}\/[A-Za-z0-9_-]{1,64}$/.test(path)
  ) {
    return true;
  }
  /**
   * El canal de escucha (`docs/specs/2026-08-12-lo-que-falta.md`): dejar una
   * falta, firmarla y retirar la propia. Los tres son anónimos por diseño —no
   * hay cuenta, así que no hay cookie de sesión que muestrear— y el techo de
   * los tres es el límite de tasa.
   *
   * Van como **tres patrones anclados** y no como entradas de `ANON_ALLOWED`,
   * por la misma razón que el olvido de una dirección de acá arriba: una
   * entrada `'/api/v1/faltas'` quedaría exenta por la rama
   * `path.startsWith(`${p}/`)`, que exime subrutas que nadie decidió eximir —y
   * el `PATCH` de admin de esta misma familia es exactamente la subruta que NO
   * se puede eximir.
   */
  const FALTA = /^\/api\/v1\/faltas\/[DIdi]-\d{1,6}$/;
  if (method === 'POST' && path === '/api/v1/faltas') return true;
  if (method === 'POST' && /^\/api\/v1\/faltas\/[DIdi]-\d{1,6}\/firmas$/.test(path)) return true;
  if (method === 'DELETE' && FALTA.test(path)) return true;
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
