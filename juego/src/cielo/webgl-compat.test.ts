import { describe, expect, it, vi } from 'vitest';

import { asegurarPrecisionWebGLParaCanvasKit } from './webgl-compat';

describe('compatibilidad WebGL de CanvasKit', () => {
  it('reemplaza únicamente una respuesta null por valores seguros', () => {
    const getShaderPrecisionFormat = vi.fn(
      (_shaderType: number, _precisionType: number) => null,
    );
    const prototipo = { getShaderPrecisionFormat };

    asegurarPrecisionWebGLParaCanvasKit([prototipo]);

    expect(prototipo.getShaderPrecisionFormat(1, 2)).toEqual({
      rangeMin: 0,
      rangeMax: 0,
      precision: 0,
    });
    expect(getShaderPrecisionFormat).toHaveBeenCalledWith(1, 2);
  });

  it('conserva intacta una respuesta válida y no envuelve dos veces', () => {
    const precision = { rangeMin: 127, rangeMax: 127, precision: 23 };
    const original = vi.fn(
      (_shaderType: number, _precisionType: number) => precision,
    );
    const prototipo = { getShaderPrecisionFormat: original };

    asegurarPrecisionWebGLParaCanvasKit([prototipo]);
    const primeraFuncionEnvuelta = prototipo.getShaderPrecisionFormat;
    asegurarPrecisionWebGLParaCanvasKit([prototipo]);

    expect(prototipo.getShaderPrecisionFormat).toBe(primeraFuncionEnvuelta);
    expect(prototipo.getShaderPrecisionFormat(3, 4)).toBe(precision);
  });
});
