import { describe, expect, it } from 'vitest';

import { COEFICIENTES_LUZ } from '../coeficientes-luz.js';
import * as core from '../index.js';

describe('superficie pública', () => {
  it('la luz sale por el barril del paquete', () => {
    expect(typeof core.brilloDeCelda).toBe('function');
    expect(typeof core.nitidezDeCelda).toBe('function');
    expect(typeof core.intensidadDeBrillo).toBe('function');
    expect(typeof core.focoDeNitidez).toBe('function');
    expect(typeof core.luzDeCelda).toBe('function');
    expect(typeof core.luzDeCeldas).toBe('function');
    expect(core.COEFICIENTES_LUZ.PARTICIPACION_PLENA).toBeGreaterThan(0);
  });
});

/**
 * Los dos números que deciden cómo se ve el país entero. Mismo criterio que
 * `coeficientes.test.ts` para los de la Simulación: se fijan con su razón al
 * lado, para que cambiarlos sea un acto deliberado y no un renglón que se
 * mueve sin que nadie lo note. El comentario de `coeficientes-luz.ts` dice que
 * hay que volver a mirarlos cuando entren voces reales — y es justo entonces
 * cuando esta guarda gana lo que cuesta.
 */
describe('coeficientes de la luz', () => {
  it('la celda se lee plenamente encendida cuando habló el 5%', () => {
    expect(COEFICIENTES_LUZ.PARTICIPACION_PLENA).toBe(0.05);
  });

  it('la rampa va cerca de una raíz cuadrada, no de una recta', () => {
    // Menor que 1 levanta la parte baja de la curva, que es donde vive la
    // participación real. En 1 el país entero sería indistinguible del negro.
    expect(COEFICIENTES_LUZ.CURVA).toBe(0.45);
    expect(COEFICIENTES_LUZ.CURVA).toBeLessThan(1);
  });
});
