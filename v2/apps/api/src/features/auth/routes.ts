/**
 * Auth HTTP slice.
 *
 * Validates input → calls service → sets cookies → returns user.
 * Never returns the raw access/refresh tokens in the JSON body — they
 * live in httpOnly cookies. The CSRF token is returned both as a
 * non-httpOnly cookie (for the browser) and in the JSON (so SPAs that
 * boot from a fresh Set-Cookie can read it without an extra fetch).
 */
import { AuthRepository, getDb, UsersRepository } from '@v2/db';
import { loginInputSchema, registerInputSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { loginRateLimit, registerRateLimit } from '../../middleware/rate-limit.js';

import { verifyPassword } from './password.js';
import { AuthService } from './service.js';
import {
  COOKIE_REFRESH,
  clearAuthCookies,
  setAuthCookies,
  verifyRefreshToken,
} from './tokens.js';
import { signTwoFaTicket } from './two-factor-routes.js';

const router: RouterType = Router();

function buildService(): AuthService {
  const db = getDb();
  return new AuthService(new UsersRepository(db), new AuthRepository(db));
}

function fingerprint(req: { header: (n: string) => string | undefined; ip?: string | undefined }) {
  return {
    userAgent: req.header('user-agent'),
    ipAddress: req.ip,
  };
}

router.post('/register', registerRateLimit(), async (req, res, next) => {
  try {
    const input = registerInputSchema.parse(req.body);
    const result = await buildService().register(input, fingerprint(req));
    setAuthCookies(res, result.accessToken, result.refreshToken, result.csrfToken);
    res.status(201).json({ data: { user: result.user, csrfToken: result.csrfToken } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', loginRateLimit(), async (req, res, next) => {
  try {
    const input = loginInputSchema.parse(req.body);
    const db = getDb();
    const usersRepo = new UsersRepository(db);
    const authRepo = new AuthRepository(db);

    // Resolve + verify in one place — bcrypt is expensive, never run it twice.
    const candidate =
      (await usersRepo.findByEmail(input.identifier)) ??
      (await usersRepo.findByUsername(input.identifier));
    if (!candidate || !(await verifyPassword(input.password, candidate.passwordHash))) {
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos.' },
      });
      return;
    }
    if (!candidate.isActive) {
      res.status(401).json({
        error: { code: 'ACCOUNT_INACTIVE', message: 'Tu cuenta está desactivada.' },
      });
      return;
    }

    // 2FA short-circuit: if the user has TOTP enabled, don't issue
    // cookies yet — return a partial-auth ticket and let the front
    // end collect the code via /api/auth/2fa/verify.
    const twoFa = await authRepo.findTwoFactorSecret(candidate.id);
    if (twoFa?.enabled) {
      res.json({
        data: {
          needsTwoFactor: true,
          ticket: signTwoFaTicket(candidate.id),
        },
      });
      return;
    }

    // Standard path: skip the password check (already done above) and
    // jump straight to issuing tokens.
    const result = await buildService().loginAlreadyVerified(candidate.id, fingerprint(req));
    setAuthCookies(res, result.accessToken, result.refreshToken, result.csrfToken);
    res.json({ data: { user: result.user, csrfToken: result.csrfToken } });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refresh = cookies?.[COOKIE_REFRESH];
    if (refresh) {
      const claims = verifyRefreshToken(refresh);
      if (claims) {
        await buildService().logout(claims.jti);
      }
    }
    clearAuthCookies(res);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
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
    const result = await buildService().rotate(claims.jti, fingerprint(req));
    setAuthCookies(res, result.accessToken, result.refreshToken, result.csrfToken);
    res.json({ data: { user: result.user, csrfToken: result.csrfToken } });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
