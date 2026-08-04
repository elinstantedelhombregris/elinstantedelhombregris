/**
 * Entry de cron de Vercel para el job de rankings (ADR 0008 D3).
 *
 * El horario vive en `v2/vercel.json`; acá está sólo el handler que la
 * plataforma invoca, y la guardia que lo separa del internet abierto: un
 * endpoint público que recalcula rankings es un DoS gratis.
 *
 * Reemplaza a `apps/api/api/cron/gamification-rankings.ts`, que quedaba en una
 * ruta que Vercel nunca iba a leer con Root Directory = `v2` (ADR 0008 D2).
 */
import { runRankingCron } from '../features/gamification/cron.js';
import { logger } from '../lib/logger.js';

import type { IncomingMessage, ServerResponse } from 'node:http';

/** Devuelve true si el request trae el `CRON_SECRET` esperado. */
function autorizado(req: IncomingMessage): boolean {
  const esperado = process.env.CRON_SECRET;
  // Sin secreto configurado no se corre: es preferible un cron muerto y
  // ruidoso a un endpoint abierto que quema base y cuota.
  if (!esperado) return false;
  return req.headers.authorization === `Bearer ${esperado}`;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (!autorizado(req)) {
    logger.warn('gamification-rankings: invocación sin CRON_SECRET válido');
    res.statusCode = 401;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED' } }));
    return;
  }

  try {
    const result = await runRankingCron();
    logger.info({ result }, 'gamification-rankings: ok');
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ data: result }));
  } catch (err) {
    logger.error({ err }, 'gamification-rankings: failed');
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: { code: 'CRON_FAILED' } }));
  }
}
