import rateLimit from 'express-rate-limit';

import { getConfig } from '../lib/config.js';

import type { Request, RequestHandler } from 'express';

/**
 * General-purpose rate limiter applied to every API request.
 * Override per-route with stricter limits where needed (auth, etc.).
 */
export function generalRateLimit(): RequestHandler {
  const config = getConfig();
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes. Intentá de nuevo en un momento.' } },
  });
}

const SPANISH_LIMITED = {
  error: {
    code: 'RATE_LIMITED',
    message: 'Demasiados intentos. Esperá un rato antes de probar de nuevo.',
  },
};

/**
 * Login attempts: 5 per 15 minutes per IP+identifier.
 * Pinning to identifier prevents one IP from locking out a victim by
 * spamming guesses against the victim's username.
 */
export function loginRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const body = (req.body ?? {}) as { identifier?: unknown };
      const id = typeof body.identifier === 'string' ? body.identifier.toLowerCase() : '';
      return `${req.ip ?? 'unknown'}::${id}`;
    },
    message: SPANISH_LIMITED,
  });
}

/** Registration: 3 per hour per IP. */
export function registerRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: SPANISH_LIMITED,
  });
}

/** Password reset request: 1 per hour per IP+email. */
export function passwordResetRequestRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const body = (req.body ?? {}) as { email?: unknown };
      const email = typeof body.email === 'string' ? body.email.toLowerCase() : '';
      return `${req.ip ?? 'unknown'}::${email}`;
    },
    message: SPANISH_LIMITED,
  });
}

/** Email verification send: 3 per hour per IP. */
export function emailVerificationRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: SPANISH_LIMITED,
  });
}

/**
 * Anonymous citizen submissions (pulso, dreams). Tighter than the
 * general 120/min so a single IP can't fill the public dataset
 * with garbage. 30 per hour per IP.
 */
export function anonSubmitRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: SPANISH_LIMITED,
  });
}

/** 2FA verify: 5 per 15 minutes per IP+ticket-prefix. */
export function twoFactorVerifyRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const body = (req.body ?? {}) as { ticket?: unknown };
      const ticket = typeof body.ticket === 'string' ? body.ticket.slice(0, 32) : '';
      return `${req.ip ?? 'unknown'}::${ticket}`;
    },
    message: SPANISH_LIMITED,
  });
}
