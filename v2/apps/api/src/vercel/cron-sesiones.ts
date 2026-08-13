/**
 * Entry de cron de Vercel para el barrido de sesiones vencidas (ADR 0008 D3).
 *
 * El horario vive en `v2/vercel.json`; acá está sólo el handler que la
 * plataforma invoca, con la misma guarda de `CRON_SECRET` que el de rankings.
 *
 * Lo que este cron sostiene es una promesa escrita: la política de privacidad
 * dice que las sesiones —con su dirección IP— se guardan 90 días desde que
 * vencen. Si esta función deja de correr, esa frase deja de ser cierta.
 */
import { barrerSesionesVencidas } from '../features/auth/cron-sesiones.js';
import { logger } from '../lib/logger.js';

import { autorizadoPorCronSecret } from './cron-secret.js';

import type { IncomingMessage, ServerResponse } from 'node:http';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!autorizadoPorCronSecret(req)) {
    logger.warn('sesiones-barrido: invocación sin CRON_SECRET válido');
    res.statusCode = 401;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED' } }));
    return;
  }

  try {
    const result = await barrerSesionesVencidas();
    logger.info({ result }, 'sesiones-barrido: ok');
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ data: result }));
  } catch (err) {
    logger.error({ err }, 'sesiones-barrido: failed');
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: { code: 'CRON_FAILED' } }));
  }
}
