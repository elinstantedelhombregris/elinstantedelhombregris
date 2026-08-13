import cors from 'cors';
import helmet from 'helmet';

import { getConfig } from '../lib/config.js';

import type { CorsOptions } from 'cors';
import type { RequestHandler } from 'express';


/**
 * Helmet with a tight CSP.
 *
 * **Ningún host de terceros aparece en esta política, y ése es el
 * punto.** `img-src`, `connect-src` y `font-src` nombran sólo `'self'`,
 * más los esquemas `data:`/`blob:` que produce la propia app. Si estás
 * por agregar un host acá, estás por entregarle a alguien más la
 * dirección IP de cada persona que abre la página: empaquetá el recurso,
 * como ya están empaquetados `/maps/`, `/fonts/` y `/tiles/`.
 *
 * Notes:
 *   - No `'unsafe-eval'` in any environment.
 *   - `'unsafe-inline'` styles allowed only because Tailwind/Radix may
 *     emit them at runtime; investigate before tightening further.
 *   - El mapa entero sale de este origen desde el 12/8/2026 (D-003): el
 *     estilo en `/maps/oscuro.json`, los glyphs en `/fonts/` y las
 *     teselas en un único `.pmtiles` bajo `/tiles/` que el navegador lee
 *     por rangos de bytes. Hasta ese día hacían falta seis hosts ajenos
 *     —cinco de Carto y uno de openmaptiles— y eran la última fuga de IP
 *     a terceros que le quedaba al producto.
 */
export function securityHeaders(): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
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
