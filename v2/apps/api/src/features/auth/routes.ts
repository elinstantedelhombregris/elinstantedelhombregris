/**
 * Auth HTTP slice. Validates input → calls service → sets cookies → returns user.
 * Never returns the raw access/refresh tokens in the JSON body.
 */
import { getDb, UsersRepository } from '@v2/db';
import { loginInputSchema, registerInputSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { authenticate } from '../../middleware/auth.js';

import { AuthService } from './service.js';
import { clearAuthCookies, COOKIE_REFRESH, setAuthCookies, signAccessToken, signRefreshToken, verifyRefreshToken } from './tokens.js';

const router: RouterType = Router();

function buildService(): AuthService {
  return new AuthService(new UsersRepository(getDb()));
}

router.post('/register', async (req, res, next) => {
  try {
    const input = registerInputSchema.parse(req.body);
    const result = await buildService().register(input);
    setAuthCookies(res, result.accessToken, result.refreshToken, result.csrfToken);
    res.status(201).json({ data: { user: result.user, csrfToken: result.csrfToken } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const input = loginInputSchema.parse(req.body);
    const result = await buildService().login(input);
    setAuthCookies(res, result.accessToken, result.refreshToken, result.csrfToken);
    res.json({ data: { user: result.user, csrfToken: result.csrfToken } });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookies(res);
  res.json({ data: { ok: true } });
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'No autenticado.' } });
      return;
    }
    const repo = new UsersRepository(getDb());
    const user = await repo.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'No encontramos tu usuario.' } });
      return;
    }
    res.json({
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          location: user.location,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
          onboardingCompleted: user.onboardingCompleted,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refresh = cookies?.[COOKIE_REFRESH];
    if (!refresh) {
      res.status(401).json({ error: { code: 'NO_REFRESH', message: 'Falta token de refresh.' } });
      return;
    }
    const claims = verifyRefreshToken(refresh);
    if (!claims) {
      res.status(401).json({ error: { code: 'INVALID_REFRESH', message: 'Refresh inválido.' } });
      return;
    }
    const repo = new UsersRepository(getDb());
    const user = await repo.findById(claims.sub);
    if (!user?.isActive) {
      res.status(401).json({ error: { code: 'USER_INACTIVE', message: 'Usuario inactivo.' } });
      return;
    }
    const newAccess = signAccessToken({ sub: user.id, username: user.username, email: user.email });
    const newRefresh = signRefreshToken({ sub: user.id, jti: claims.jti });
    const cookies2 = req.cookies as Record<string, string> | undefined;
    const csrfToken = cookies2?.eihg_csrf ?? '';
    setAuthCookies(res, newAccess, newRefresh, csrfToken);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
