/**
 * Entry de la función de Vercel que sirve todo `/api/*` (ADR 0008 D1).
 *
 * Se construye la app una sola vez a nivel de módulo: entre invocaciones tibias
 * Vercel reusa el módulo y no se vuelve a armar nada. A diferencia de
 * `api/index.ts` de v1, acá NO se hace trabajo de datos en el arranque
 * (ADR 0008 D6).
 *
 * ## Por qué hay que reconstruir la URL
 *
 * El ruteo por sistema de archivos de Vercel publica cada archivo de `api/` en
 * su ruta exacta, así que `api/index.mjs` sólo atiende `/api/index`. Se probó
 * la ruta catch-all `api/[...path].mjs` contra un deploy real y **no alcanza**:
 * atiende un segmento (`/api/foo` llega) pero no dos (`/api/analytics/cifras`
 * devuelve el 404 de la plataforma, sin tocar la función).
 *
 * La salida es el rewrite explícito de `vercel.json`, que manda todo
 * `/api/*` a esta función con la ruta original en `__ruta`. El costo es que
 * `req.url` llega como `/api/index?__ruta=analytics/cifras`, y Express rutea
 * por `req.url` — así que hay que devolvérsela antes de pasarle el request.
 * Es el mismo problema y la misma solución que `api/index.ts` de v1.
 */
import { createApp } from '../app.js';

import type { IncomingMessage, ServerResponse } from 'node:http';

const app = createApp();

/** Nombre del parámetro que lleva la ruta original. Lo pone `vercel.json`. */
const PARAM_RUTA = '__ruta';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  // La base es ficticia: sólo sirve para poder parsear una URL relativa.
  const url = new URL(req.url ?? '/', 'http://interno');
  const ruta = url.searchParams.get(PARAM_RUTA);

  if (ruta !== null) {
    url.searchParams.delete(PARAM_RUTA);
    const query = url.searchParams.toString();
    req.url = `/api/${ruta}${query ? `?${query}` : ''}`;
  }

  app(req, res);
}
