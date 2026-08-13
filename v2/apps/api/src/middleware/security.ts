import { CSP } from '@v2/shared/seguridad';
import cors from 'cors';
import helmet from 'helmet';

import { getConfig } from '../lib/config.js';

import type { CorsOptions } from 'cors';
import type { RequestHandler } from 'express';


/**
 * Helmet with a tight CSP.
 *
 * **La política ya no se escribe acá.** Vive en
 * `packages/shared/src/seguridad/csp.ts`, con la justificación de cada permiso,
 * porque desde el 13/8/2026 la emiten dos superficies: este middleware para
 * `/api/*` y el bloque `headers` de `vercel.json` para el documento. Hasta ese
 * día la emitía sólo Express —que en producción no sirve una sola página—, así
 * que la CSP viajaba donde no protegía nada y faltaba donde corre el JavaScript
 * (D-048). Si vas a cambiar un permiso, cambialo en la tabla compartida: acá
 * sólo se elige el transporte.
 *
 * `useDefaults: false` no es cosmético. Con los defaults de helmet, tres
 * directivas —`frame-ancestors`, `script-src-attr` y
 * `upgrade-insecure-requests`— salían en el header sin estar escritas en
 * ningún archivo nuestro; `vercel.json`, que no tiene helmet, las habría
 * perdido en silencio. Ahora la tabla es la política entera.
 */
export function securityHeaders(): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: { ...CSP },
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
