import { prepararExportaciones } from '../features/exportaciones/worker.js';
import { logger } from '../lib/logger.js';

import { autorizadoPorCronSecret } from './cron-secret.js';

import type { IncomingMessage, ServerResponse } from 'node:http';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader('content-type', 'application/json');
  if (!autorizadoPorCronSecret(req)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED' } }));
    return;
  }
  try {
    res.statusCode = 200;
    res.end(JSON.stringify({ data: await prepararExportaciones() }));
  } catch (error) {
    logger.error(
      { errorName: error instanceof Error ? error.name : 'Error' },
      'Exportaciones: cron interrumpido',
    );
    res.statusCode = 500;
    res.end(JSON.stringify({ error: { code: 'CRON_FAILED' } }));
  }
}
