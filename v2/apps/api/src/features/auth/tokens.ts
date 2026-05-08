/**
 * JWT helpers + cookie names. The cookies are httpOnly so the browser
 * can never expose the access token to JavaScript. CSRF protection is
 * handled separately via a non-httpOnly token cookie that the client
 * echoes back in the X-CSRF-Token header.
 */
import jwt from 'jsonwebtoken';

import { getConfig } from '../../lib/config.js';

import type { Response } from 'express';


export const COOKIE_ACCESS = 'eihg_access';
export const COOKIE_REFRESH = 'eihg_refresh';
export const COOKIE_CSRF = 'eihg_csrf';

interface AccessClaims {
  sub: number;
  username: string;
  email: string;
  type: 'access';
}

interface RefreshClaims {
  sub: number;
  jti: string;
  type: 'refresh';
}

export function signAccessToken(payload: Omit<AccessClaims, 'type'>): string {
  const cfg = getConfig();
  const opts: jwt.SignOptions = {
    expiresIn: cfg.auth.accessTokenTtl as jwt.SignOptions['expiresIn'] & string,
    issuer: 'basta-app',
    audience: 'basta-users',
  };
  return jwt.sign({ ...payload, type: 'access' }, cfg.auth.jwtSecret, opts);
}

export function signRefreshToken(payload: Omit<RefreshClaims, 'type'>): string {
  const cfg = getConfig();
  const opts: jwt.SignOptions = {
    expiresIn: cfg.auth.refreshTokenTtl as jwt.SignOptions['expiresIn'] & string,
    issuer: 'basta-app',
    audience: 'basta-users',
  };
  return jwt.sign({ ...payload, type: 'refresh' }, cfg.auth.jwtSecret, opts);
}

function verifyToken<T extends { type: 'access' | 'refresh' }>(token: string, expectedType: T['type']): T | null {
  const cfg = getConfig();
  try {
    const decoded = jwt.verify(token, cfg.auth.jwtSecret, {
      issuer: 'basta-app',
      audience: 'basta-users',
    });
    if (typeof decoded === 'string') return null;
    const payload = decoded as unknown as { type?: string };
    if (payload.type === expectedType) {
      return decoded as unknown as T;
    }
    return null;
  } catch {
    return null;
  }
}

export function verifyAccessToken(token: string): AccessClaims | null {
  return verifyToken<AccessClaims>(token, 'access');
}

export function verifyRefreshToken(token: string): RefreshClaims | null {
  return verifyToken<RefreshClaims>(token, 'refresh');
}

interface CookieOptions {
  maxAgeSec?: number;
  httpOnly?: boolean;
}

function baseCookieOptions(opts: CookieOptions = {}): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  domain?: string;
  maxAge?: number;
} {
  const cfg = getConfig();
  const o: ReturnType<typeof baseCookieOptions> = {
    httpOnly: opts.httpOnly ?? true,
    secure: cfg.auth.cookieSecure,
    sameSite: 'lax',
    path: '/',
  };
  if (cfg.auth.cookieDomain) o.domain = cfg.auth.cookieDomain;
  if (opts.maxAgeSec) o.maxAge = opts.maxAgeSec * 1000;
  return o;
}

/** Set the auth cookie pair on a response. */
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string, csrfToken: string): void {
  res.cookie(COOKIE_ACCESS, accessToken, baseCookieOptions({ maxAgeSec: 60 * 15 })); // 15 min
  res.cookie(COOKIE_REFRESH, refreshToken, baseCookieOptions({ maxAgeSec: 60 * 60 * 24 * 30 })); // 30 days
  // CSRF token is readable by JS so the client can echo it back in a header.
  res.cookie(COOKIE_CSRF, csrfToken, baseCookieOptions({ httpOnly: false, maxAgeSec: 60 * 60 * 24 * 30 }));
}

export function clearAuthCookies(res: Response): void {
  const opts = baseCookieOptions();
  res.clearCookie(COOKIE_ACCESS, opts);
  res.clearCookie(COOKIE_REFRESH, opts);
  res.clearCookie(COOKIE_CSRF, { ...opts, httpOnly: false });
}
