import '../../load-env.js';

import { logger } from '../../lib/logger.js';

import { prepararExportaciones } from './worker.js';

try {
  logger.info({ result: await prepararExportaciones() }, 'Exportaciones: lote terminado');
} catch (error) {
  logger.error(
    { errorName: error instanceof Error ? error.name : 'Error' },
    'Exportaciones: lote interrumpido',
  );
  process.exitCode = 1;
}
