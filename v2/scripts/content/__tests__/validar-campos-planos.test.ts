import { describe, expect, it } from 'vitest';

import { PLANES_SOURCES, type FuentePlan } from '../planes-sources';
import { validarCamposPlanos } from '../validar-campos-planos';

/**
 * Fila base limpia: ningún campo lleva comilla simple ni salto de línea.
 * Cada test parte de acá y ensucia un solo campo para aislar la causa.
 */
function filaLimpia(overrides: Partial<FuentePlan> = {}): FuentePlan {
  return {
    code: 'PLANTEST',
    slug: 'plantest',
    title: 'Un título sin sobresaltos',
    nombreInstitucional: 'Plan Nacional de Pruebas',
    summary: 'Un resumen tranquilo, sin comillas ni saltos de línea.',
    orderIndex: 99,
    isMeta: false,
    archivoFuente: 'PLANTEST_Argentina_ES.md',
    ...overrides,
  };
}

describe('validarCamposPlanos (guardia de comillas simples y saltos de línea)', () => {
  it('lanza si title trae una comilla simple, nombrando el code y el campo', () => {
    const fuente = filaLimpia({ title: "Che, no te olvidés d'esto" });
    expect(() => validarCamposPlanos(fuente)).toThrowError(/PLANTEST/);
    expect(() => validarCamposPlanos(fuente)).toThrowError(/title/);
  });

  it('lanza si summary trae un salto de línea, nombrando el code y el campo', () => {
    const fuente = filaLimpia({ summary: 'Primera línea.\nSegunda línea.' });
    expect(() => validarCamposPlanos(fuente)).toThrowError(/PLANTEST/);
    expect(() => validarCamposPlanos(fuente)).toThrowError(/summary/);
  });

  it('lanza si nombreInstitucional trae una comilla simple, nombrando el code y el campo', () => {
    const fuente = filaLimpia({ nombreInstitucional: "Plan Nacional d'Algo" });
    expect(() => validarCamposPlanos(fuente)).toThrowError(/PLANTEST/);
    expect(() => validarCamposPlanos(fuente)).toThrowError(/nombreInstitucional/);
  });

  it('lanza si nombreInstitucional trae un salto de línea, nombrando el code y el campo', () => {
    const fuente = filaLimpia({ nombreInstitucional: 'Plan Nacional\nde Algo' });
    expect(() => validarCamposPlanos(fuente)).toThrowError(/PLANTEST/);
    expect(() => validarCamposPlanos(fuente)).toThrowError(/nombreInstitucional/);
  });

  it('no lanza para una fila limpia', () => {
    expect(() => validarCamposPlanos(filaLimpia())).not.toThrow();
  });

  it('la tabla real PLANES_SOURCES pasa la guardia — las 23 filas actuales', () => {
    expect(PLANES_SOURCES).toHaveLength(23);
    for (const fuente of PLANES_SOURCES) {
      expect(() => validarCamposPlanos(fuente), `${fuente.code} no pasó la guardia`).not.toThrow();
    }
  });
});
