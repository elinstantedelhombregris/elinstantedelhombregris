import { describe, expect, it } from 'vitest';

import * as core from '../index.js';

describe('superficie pública', () => {
  it('la luz sale por el barril del paquete', () => {
    expect(typeof core.brilloDeCelda).toBe('function');
    expect(typeof core.nitidezDeCelda).toBe('function');
    expect(typeof core.intensidadDeBrillo).toBe('function');
    expect(typeof core.luzDeCelda).toBe('function');
    expect(typeof core.luzDeCeldas).toBe('function');
    expect(core.COEFICIENTES_LUZ.PARTICIPACION_PLENA).toBeGreaterThan(0);
  });
});
