import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import { TIPOS_VOZ_CIVICOS } from '../simulacion/tipos.js';

describe('coeficientes publicados', () => {
  it('el piso del mandato es 1 voz cada 1.000 habitantes', () => {
    expect(COEFICIENTES.PISO_MANDATO).toBe(100);
  });

  it('a resistencia máxima el piso se quintuplica', () => {
    // K = 4 → piso × (1 + 4×1) = piso × 5. La obstrucción total tiene que ser
    // superable y cara; si fuera insuperable el simulador enseñaría fatalismo.
    expect(COEFICIENTES.K_RESISTENCIA).toBe(4);
  });

  it('el período es el mes', () => {
    expect(COEFICIENTES.PERIODOS_POR_ANIO).toBe(12);
    expect(COEFICIENTES.MINIMO_PERIODOS).toBe(3);
  });
});

describe('tipos de voz', () => {
  it('son los seis del catálogo, en el orden canónico', () => {
    expect(TIPOS_VOZ_CIVICOS).toEqual([
      'basta',
      'sueño',
      'necesidad',
      'compromiso',
      'recurso',
      'valor',
    ]);
  });
});
