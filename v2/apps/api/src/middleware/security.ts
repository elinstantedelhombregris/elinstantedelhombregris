import { CSP } from '@v2/shared/seguridad';
import cors from 'cors';
import helmet from 'helmet';

import { getConfig } from '../lib/config.js';

import type { CorsOptions } from 'cors';
import type { Request, RequestHandler } from 'express';

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
 * Las direcciones de la petición misma, como las ve el navegador. Con `trust proxy`,
 * `req.protocol` es el de afuera (https detrás de Vercel); el host puede venir en
 * `Host` o, detrás de un proxy, en `X-Forwarded-Host`.
 */
function origenesPropios(req: Request): Set<string> {
  const hosts = [req.get('x-forwarded-host'), req.get('host')].filter(
    (h): h is string => typeof h === 'string' && h.length > 0,
  );
  return new Set(hosts.map((h) => `${req.protocol}://${h}`));
}

/**
 * CORS allowlist.
 *
 * Origins are comma-separated in `CORS_ORIGINS`. Credentials always
 * enabled because cookie auth requires it.
 *
 * **El propio sitio no necesita estar en la lista.** El navegador manda `Origin` en cada
 * POST, PUT y DELETE aunque la página y la API compartan dirección (ADR 0008), y CORS no
 * gobierna el mismo origen. Hasta el 20/10/2026 este middleware suponía que el mismo
 * origen llegaba sin `Origin`: en local andaba porque Vite manda `localhost:5173`, que es
 * el valor por defecto de la lista, y en producción toda escritura desde el navegador
 * dependía de que `CORS_ORIGINS` nombrara el dominio — no lo nombraba, y respondía 500.
 */
export function corsMiddleware(): RequestHandler {
  const config = getConfig();
  const allowed = new Set(config.cors.origins);

  const options: CorsOptions = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Request-Id'],
    optionsSuccessStatus: 204,
  };

  return cors<Request>((req, callback) => {
    const origin = req.get('origin');
    // Sin Origin: curl o servidor a servidor.
    if (!origin) {
      callback(null, { ...options, origin: true });
      return;
    }
    if (allowed.has(origin) || origenesPropios(req).has(origin)) {
      callback(null, { ...options, origin });
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  });
}
