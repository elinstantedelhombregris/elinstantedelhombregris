import { describe, expect, it } from 'vitest';
import { RANGOS, progresoHaciaProximo, proximoRango, rangoActual } from './rangos';

describe('rangos — umbrales exactos del spec §3.3', () => {
  it('la escalera completa', () => {
    expect(RANGOS.map((r) => [r.nombre, r.umbral])).toEqual([
      ['Chispa', 0],
      ['Vela', 100],
      ['Farol', 300],
      ['Fogata', 700],
      ['Faro', 1500],
      ['Aurora', 3000],
    ]);
  });

  it('bordes: un punto antes / el umbral exacto', () => {
    expect(rangoActual(0).nombre).toBe('Chispa');
    expect(rangoActual(99).nombre).toBe('Chispa');
    expect(rangoActual(100).nombre).toBe('Vela');
    expect(rangoActual(299).nombre).toBe('Vela');
    expect(rangoActual(300).nombre).toBe('Farol');
    expect(rangoActual(699).nombre).toBe('Farol');
    expect(rangoActual(700).nombre).toBe('Fogata');
    expect(rangoActual(1499).nombre).toBe('Fogata');
    expect(rangoActual(1500).nombre).toBe('Faro');
    expect(rangoActual(2999).nombre).toBe('Faro');
    expect(rangoActual(3000).nombre).toBe('Aurora');
    expect(rangoActual(99999).nombre).toBe('Aurora');
  });

  it('proximoRango apunta al siguiente umbral y en Aurora es null', () => {
    expect(proximoRango(0)?.nombre).toBe('Vela');
    expect(proximoRango(100)?.nombre).toBe('Farol');
    expect(proximoRango(2999)?.nombre).toBe('Aurora');
    expect(proximoRango(3000)).toBeNull();
  });

  it('progresoHaciaProximo: 0 al pisar el rango, fracción a mitad, 1 en Aurora', () => {
    expect(progresoHaciaProximo(0)).toBe(0);
    expect(progresoHaciaProximo(50)).toBeCloseTo(0.5);
    expect(progresoHaciaProximo(100)).toBe(0);
    expect(progresoHaciaProximo(200)).toBeCloseTo(0.5);
    expect(progresoHaciaProximo(1100)).toBeCloseTo(0.5); // (1100-700)/800
    expect(progresoHaciaProximo(3000)).toBe(1);
    expect(progresoHaciaProximo(9000)).toBe(1);
  });

  it('entradas raras se clampean a Chispa', () => {
    expect(rangoActual(-50).nombre).toBe('Chispa');
    expect(rangoActual(Number.NaN).nombre).toBe('Chispa');
  });
});
