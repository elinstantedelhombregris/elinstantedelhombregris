import { describe, expect, it } from 'vitest';

import {
  formatoPorcentaje,
  humanizarTema,
  plegarTipos,
  regimenDe,
  topeBrechas,
  UMBRAL_PORCENTAJE,
  urgenciaDeBrecha,
} from '../mandato-regimen';

describe('regimenDe', () => {
  it('0 → cero · 1..99 → palitos · ≥100 → porcentaje', () => {
    expect(regimenDe(0)).toBe('cero');
    expect(regimenDe(1)).toBe('palitos');
    expect(regimenDe(UMBRAL_PORCENTAJE - 1)).toBe('palitos');
    expect(regimenDe(UMBRAL_PORCENTAJE)).toBe('porcentaje');
  });
});

describe('formatoPorcentaje', () => {
  it('formatea es-AR con un decimal', () => {
    expect(formatoPorcentaje(184, 1000)).toBe('18,4%');
    expect(formatoPorcentaje(500, 1000)).toBe('50%');
  });
});

describe('urgenciaDeBrecha (fórmula publicada, no juicio editorial)', () => {
  it('ofrecen 0 → crítica · ofrecen < piden → alta · ofrecen ≥ piden → cubierta', () => {
    expect(urgenciaDeBrecha(380, 0)).toBe('crítica');
    expect(urgenciaDeBrecha(510, 120)).toBe('alta');
    expect(urgenciaDeBrecha(720, 890)).toBe('cubierta si se organiza');
  });
});

describe('humanizarTema', () => {
  it('snake_case → palabras', () => {
    expect(humanizarTema('salud_publica')).toBe('salud publica');
  });
});

describe('plegarTipos', () => {
  it('pliega null y categorías fuera de catálogo en valor, y ordena desc', () => {
    expect(
      plegarTipos([
        { tipo: 'basta', total: 5 },
        { tipo: null, total: 2 },
        { tipo: 'otra_cosa', total: 1 },
        { tipo: 'sueño', total: 9 },
      ]),
    ).toEqual([
      { tipo: 'sueño', total: 9 },
      { tipo: 'basta', total: 5 },
      { tipo: 'valor', total: 3 },
    ]);
  });
});

describe('topeBrechas (spec §4.III «tope 6» — no la aplica el API)', () => {
  const brecha = (provincia: string, piden: number, ofrecen: number) => ({ provincia, piden, ofrecen });

  it('ordena por urgencia (piden − ofrecen) desc y recorta a las primeras 6', () => {
    const ocho = [
      brecha('a', 10, 0), // urgencia 10
      brecha('b', 10, 9), // urgencia 1
      brecha('c', 20, 0), // urgencia 20
      brecha('d', 5, 5), // urgencia 0
      brecha('e', 15, 2), // urgencia 13
      brecha('f', 8, 1), // urgencia 7
      brecha('g', 30, 1), // urgencia 29
      brecha('h', 12, 0), // urgencia 12
    ];
    expect(topeBrechas(ocho)).toEqual([
      brecha('g', 30, 1),
      brecha('c', 20, 0),
      brecha('e', 15, 2),
      brecha('h', 12, 0),
      brecha('a', 10, 0),
      brecha('f', 8, 1),
    ]);
  });

  it('exactamente 6 devuelve las 6, reordenadas si vienen desordenadas', () => {
    const seis = [
      brecha('a', 1, 0), // 1
      brecha('b', 9, 0), // 9
      brecha('c', 5, 0), // 5
      brecha('d', 3, 0), // 3
      brecha('e', 7, 0), // 7
      brecha('f', 2, 0), // 2
    ];
    expect(topeBrechas(seis)).toEqual([
      brecha('b', 9, 0),
      brecha('e', 7, 0),
      brecha('c', 5, 0),
      brecha('d', 3, 0),
      brecha('f', 2, 0),
      brecha('a', 1, 0),
    ]);
  });

  it('menos de 6 devuelve todas, ordenadas', () => {
    expect(topeBrechas([brecha('a', 1, 1), brecha('b', 9, 0)])).toEqual([brecha('b', 9, 0), brecha('a', 1, 1)]);
  });

  it('vacío devuelve vacío', () => {
    expect(topeBrechas([])).toEqual([]);
  });
});
