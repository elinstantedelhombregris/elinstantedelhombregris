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
 *   - The style.json under `/maps/` and the glyphs under `/fonts/` are
 *     both self-hosted: nothing outside this origin serves the map's
 *     typography. Map tiles still come from carto's CDN, so we
 *     explicitly allow carto's origins in connect-src + img-src. They
 *     are pinned one by one (not a wildcard) and used only inside the
 *     mapStyle JSON we control.
 *
 *     OJO — allowing only `tiles.basemaps.cartocdn.com` is NOT enough,
 *     y es el error que había acá. Ese host sirve el `tiles.json`, pero
 *     apunta las teselas a CUATRO hosts distintos (`tiles-a` …
 *     `tiles-d`). Verificado contra el endpoint real: el estilo cargaba
 *     y las teselas se bloqueaban, que es la peor forma de fallar — un
 *     mapa vacío sin error visible.
 */
export function securityHeaders(): RequestHandler {
  const cartoTiles = [
    'https://tiles.basemaps.cartocdn.com',
    'https://tiles-a.basemaps.cartocdn.com',
    'https://tiles-b.basemaps.cartocdn.com',
    'https://tiles-c.basemaps.cartocdn.com',
    'https://tiles-d.basemaps.cartocdn.com',
  ];
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', ...cartoTiles],
        connectSrc: ["'self'", ...cartoTiles],
        fontSrc: ["'self'", 'data:', ...cartoTiles],
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
