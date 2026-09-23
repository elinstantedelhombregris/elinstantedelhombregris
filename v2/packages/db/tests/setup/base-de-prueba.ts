/** Setup de vitest: la misma guardia de D-014 que `apps/api`, para los tests de este paquete. */
import { expect } from 'vitest';

import { prepararBaseDeIntegracion } from '../helpers/neon-local.js';

const archivo = expect.getState().testPath ?? '';
if (/[\\/]tests[\\/]/.test(archivo)) prepararBaseDeIntegracion();
