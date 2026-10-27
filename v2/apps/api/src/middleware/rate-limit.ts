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
    // Mirar tiene su propio techo y el freno por persona en la base: si contara acá, un
    // aula entera detrás de una IP agotaría el genérico en un minuto (D-138).
    skip: (req: Request) => req.originalUrl.startsWith('/api/v1/pila/'),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Demasiadas solicitudes. Intentá de nuevo en un momento.',
      },
    },
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

/**
 * Entrar con un proveedor externo (ADR 0012): la ida, la vuelta y el «Último paso». Un ingreso
 * gasta entre dos y cuatro pedidos, y un aula sale por una sola IP; la prueba de identidad la
 * hace el proveedor, así que el techo es sólo contra el abuso.
 */
export function ingresoExternoRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
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

/**
 * Dejar una falta en `/lo-que-falta`: 6 por hora por IP (`FALTAS_POR_HORA`).
 *
 * Más duro que `anonSubmitRateLimit` a propósito. Es el único acto del canal
 * que crea filas nuevas Y se publica al instante sin cola de revisión
 * (`docs/specs/2026-08-12-lo-que-falta.md` §2.2), así que es la superficie
 * que hay que cuidar. Se apila sobre el genérico, no lo reemplaza.
 */
export function dejarFaltaRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: getConfig().rateLimit.faltasPorHora,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Ya dejaste varias. Dale un rato y volvé — el registro no se va a ningún lado.',
      },
    },
  });
}

/**
 * Mirar (`/api/v1/pila`): `PILA_POR_HORA` pedidos por hora por IP (6.000 si no se dice).
 *
 * Alto a propósito: una escuela entera sale por una sola IP, y el lanzamiento en
 * persona (D1) no puede chocar con eso. El techo real es por persona y lo cuenta
 * el servicio en la base (`features/pila/service.ts`). Reemplaza al genérico, que
 * saltea esta ruta (D-138).
 */
export function pilaRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: getConfig().rateLimit.pilaPorHora,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Desde esta conexión llegaron muchos pedidos. Esperá un rato y volvé a mirar.',
      },
    },
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

/**
 * Publicar un aporte desde Imaginar: `APORTES_POR_HORA` por hora por IP (150 si no se dice).
 *
 * El genérico de envíos anónimos (30 por hora) es para formularios sueltos; un aula de treinta
 * que publica junta lo agotaría. Con el filtro de datos personales, los 13 reportes y la
 * retención de la coordinación, un aporte de más se saca; una persona que no pudo publicar,
 * no vuelve (D-138).
 */
export function aportarRateLimit(): RequestHandler {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: getConfig().rateLimit.aportesPorHora,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message:
          'Desde esta conexión se publicaron muchos aportes en esta hora. Guardá tu texto y probá en un rato.',
      },
    },
  });
}
