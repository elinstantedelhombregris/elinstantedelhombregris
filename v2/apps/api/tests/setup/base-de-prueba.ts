/**
 * Setup de vitest: los archivos de `tests/` (integración) cargan `.env` y pasan
 * por la guardia de D-014 antes de tocar una base. Los unitarios de `src/` no
 * cargan nada.
 */
import { expect } from 'vitest';

const archivo = expect.getState().testPath ?? '';
if (/[\\/]tests[\\/]/.test(archivo)) {
  await import('../../src/load-env.js');
  const { prepararBaseDeIntegracion } = await import('@v2/db/testing/neon-local');
  prepararBaseDeIntegracion();
}
