import cors from 'cors';
import helmet from 'helmet';

import { getConfig } from '../lib/config.js';

import type { CorsOptions } from 'cors';
import type { RequestHandler } from 'express';


/**
 * Helmet with a tight CSP.
 *
 * Notes:
 *   - No `'unsafe-eval'` in any environment.
 *   - `'unsafe-inline'` styles allowed only because Tailwind/Radix may
 *     emit them at runtime; investigate before tightening further.
 *   - The style.json itself is self-hosted under `/maps/`. Map tiles,
 *     fonts, and sprites still come from carto's CDN — full vector
 *     tile self-hosting is impractical at this size — so we explicitly
 *     allow `tiles.basemaps.cartocdn.com` in connect-src + img-src.
 *     The origin is pinned (not a wildcard) and used only inside the
 *     mapStyle JSON we control.
 */
export function securityHeaders(): RequestHandler {
  const cartoTiles = 'https://tiles.basemaps.cartocdn.com';
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', cartoTiles],
        connectSrc: ["'self'", cartoTiles],
        fontSrc: ["'self'", 'data:', cartoTiles],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        workerSrc: ["'self'", 'blob:'],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
}

/**
 * CORS allowlist.
 *
 * Origins are comma-separated in `CORS_ORIGINS`. Credentials always
 * enabled because cookie auth requires it.
 */
export function corsMiddleware(): RequestHandler {
  const config = getConfig();
  const allowed = new Set(config.cors.origins);

  const options: CorsOptions = {
    origin: (origin, callback) => {
      // Same-origin / curl / server-to-server have no Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowed.has(origin)) {
        callback(null, origin);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Request-Id'],
    optionsSuccessStatus: 204,
  };

  return cors(options);
}
