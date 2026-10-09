/**
 * Auth middleware: reads access token from the httpOnly cookie and
 * attaches a typed `req.user` to downstream handlers. Returns 401 on
 * missing/invalid token (or skips, in optionalAuth).
 *
 * The `req.user` typing is augmented in src/types/express.d.ts.
 */
import { getDb, UsersRepository } from '@v2/db';

import { COOKIE_ACCESS, verifyAccessToken } from '../features/auth/tokens.js';

import { HttpError } from './error-handler.js';

import type { NextFunction, Request, Response } from 'express';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  try {
    const usuario = await new UsersRepository(getDb()).findById(claims.sub);
    if (!usuario?.isActive) {
      res
        .status(401)
        .json({ error: { code: 'ACCOUNT_INACTIVE', message: 'Esta cuenta ya no está activa.' } });
      return;
    }
    req.user = { id: claims.sub, username: claims.username, email: claims.email };
    next();
  } catch (e) {
    next(e);
  }
}

export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const cookies = req.cookies as Record<string, string> | undefined;
  const token = cookies?.[COOKIE_ACCESS];
  if (token) {
    const claims = verifyAccessToken(token);
    if (claims) {
      try {
        const usuario = await new UsersRepository(getDb()).findById(claims.sub);
        if (usuario?.isActive)
          req.user = { id: claims.sub, username: claims.username, email: claims.email };
      } catch (e) {
        next(e);
        return;
      }
    }
  }
  next();
}

export function usuarioAutenticado(req: Request): AuthUser {
  if (!req.user) throw new HttpError(401, 'SESION_REQUERIDA', 'Ingresá para continuar.');
  return req.user;
}
