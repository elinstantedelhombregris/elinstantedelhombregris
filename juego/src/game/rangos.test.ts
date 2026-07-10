import { describe, expect, it } from 'vitest';
import {
  RANGOS,
  ascensoPendiente,
  progresoHaciaProximo,
  proximoRango,
  rangoActual,
  rangoPorNombre,
} from './rangos';

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

describe('rangoPorNombre', () => {
  it('encuentra los seis rangos por nombre exacto', () => {
    for (const r of RANGOS) {
      expect(rangoPorNombre(r.nombre)).toEqual(r);
    }
  });

  it('nombres desconocidos devuelven null (dato viejo o corrupto)', () => {
    expect(rangoPorNombre('Reliquia')).toBeNull();
    expect(rangoPorNombre('vela')).toBeNull(); // sensible a mayúsculas
    expect(rangoPorNombre('')).toBeNull();
  });
});

describe('ascensoPendiente — el cruce de umbral que dispara la celebración', () => {
  it('sin cruce no hay ascenso', () => {
    expect(ascensoPendiente('Chispa', 0)).toBeNull();
    expect(ascensoPendiente('Chispa', 99)).toBeNull();
    expect(ascensoPendiente('Vela', 299)).toBeNull();
  });

  it('cruzar el umbral asciende (100 exacto ya es Vela)', () => {
    expect(ascensoPendiente('Chispa', 100)?.nombre).toBe('Vela');
    expect(ascensoPendiente('Vela', 300)?.nombre).toBe('Farol');
    expect(ascensoPendiente('Faro', 3000)?.nombre).toBe('Aurora');
  });

  it('cruce múltiple de una: devuelve solo el más alto', () => {
    expect(ascensoPendiente('Chispa', 750)?.nombre).toBe('Fogata');
  });

  it('persistido null se trata como base 0: nadie asciende a Chispa', () => {
    expect(ascensoPendiente(null, 0)).toBeNull();
    expect(ascensoPendiente(null, 5)).toBeNull();
    expect(ascensoPendiente(null, 150)?.nombre).toBe('Vela');
  });

  it('nombre corrupto no rompe: base 0', () => {
    expect(ascensoPendiente('Reliquia', 50)).toBeNull();
    expect(ascensoPendiente('Reliquia', 100)?.nombre).toBe('Vela');
  });

  it('un persistido mayor que el vigente jamás desciende ni celebra', () => {
    expect(ascensoPendiente('Faro', 100)).toBeNull();
  });
});
