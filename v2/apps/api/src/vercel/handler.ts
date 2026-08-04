/**
 * Entry de la función de Vercel que sirve todo `/api/*` (ADR 0008 D1).
 *
 * Una app de Express ya es `(req, res) => void`, así que la función es la app.
 * Se construye una sola vez a nivel de módulo: entre invocaciones tibias Vercel
 * reusa el módulo y no se vuelve a armar nada.
 *
 * A diferencia de `api/index.ts` de v1, acá NO se hace trabajo de datos en el
 * arranque (ADR 0008 D6): v1 llama a `initSampleData()` en cada cold start.
 *
 * Este archivo no se importa desde `apps/api/src/index.ts` —el proceso largo de
 * desarrollo y de los tests sigue siendo aquél, intacto.
 */
import { createApp } from '../app.js';

import type { Express } from 'express';

const app: Express = createApp();

export default app;
