import { describe, expect, it } from 'vitest';
import {
  diaDelAno,
  fechaLocalDeISO,
  indicePregunta,
  indicePreguntaExtra,
  indicesCompromisosDelDia,
} from './dia';

describe('diaDelAno', () => {
  it('calcula los bordes del calendario', () => {
    expect(diaDelAno('2026-01-01')).toBe(1);
    expect(diaDelAno('2026-02-28')).toBe(59);
    expect(diaDelAno('2026-12-31')).toBe(365);
    expect(diaDelAno('2028-12-31')).toBe(366); // bisiesto
  });

  it('rechaza fechas inválidas', () => {
    expect(() => diaDelAno('2026-02-30')).toThrow();
    expect(() => diaDelAno('ayer')).toThrow();
  });
});

describe('indicePregunta', () => {
  it('es determinista y cae en rango', () => {
    for (const f of ['2026-01-01', '2026-07-09', '2026-12-31']) {
      const i = indicePregunta(f, 89);
      expect(i).toBe(indicePregunta(f, 89));
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(89);
    }
  });

  it('rota día a día', () => {
    expect(indicePregunta('2026-07-09', 89)).not.toBe(indicePregunta('2026-07-10', 89));
  });

  it('rechaza totales inválidos', () => {
    expect(() => indicePregunta('2026-07-09', 0)).toThrow();
  });
});

describe('indicePreguntaExtra', () => {
  it('difiere de la pregunta del día si hay más de una', () => {
    for (const f of ['2026-01-01', '2026-07-09', '2026-11-23']) {
      expect(indicePreguntaExtra(f, 89)).not.toBe(indicePregunta(f, 89));
    }
  });

  it('con una sola pregunta devuelve la única', () => {
    expect(indicePreguntaExtra('2026-07-09', 1)).toBe(0);
  });
});

describe('indicesCompromisosDelDia', () => {
  const mazo = [
    { categoria: 'vecindad' },
    { categoria: 'vecindad' },
    { categoria: 'cuidado' },
    { categoria: 'cuidado' },
    { categoria: 'coraje' },
    { categoria: 'palabra' },
    { categoria: 'orden' },
    { categoria: 'belleza' },
    { categoria: 'belleza' },
  ];

  it('devuelve tres índices válidos de categorías distintas', () => {
    for (const f of ['2026-01-01', '2026-07-09', '2026-12-31']) {
      const idx = indicesCompromisosDelDia(f, mazo);
      expect(idx).toHaveLength(3);
      const cats = idx.map((i) => mazo[i]!.categoria);
      expect(new Set(cats).size).toBe(3);
      for (const i of idx) {
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(mazo.length);
      }
    }
  });

  it('es determinista y rota entre días', () => {
    expect(indicesCompromisosDelDia('2026-07-09', mazo)).toEqual(
      indicesCompromisosDelDia('2026-07-09', mazo),
    );
    const semana = ['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09'].map((f) =>
      JSON.stringify(indicesCompromisosDelDia(f, mazo)),
    );
    expect(new Set(semana).size).toBeGreaterThan(1);
  });

  it('mazo vacío → sin sugerencias; mazo chico → las que haya', () => {
    expect(indicesCompromisosDelDia('2026-07-09', [])).toEqual([]);
    expect(indicesCompromisosDelDia('2026-07-09', [{ categoria: 'x' }])).toEqual([0]);
  });
});

describe('fechaLocalDeISO', () => {
  it('convierte un timestamp local del mismo día a su fecha', () => {
    // Construye el ISO desde una fecha local conocida: el roundtrip no
    // depende del huso del entorno de test.
    const local = new Date(2026, 6, 9, 14, 30, 0);
    expect(fechaLocalDeISO(local.toISOString())).toBe('2026-07-09');
  });

  it('rechaza basura', () => {
    expect(() => fechaLocalDeISO('no-es-fecha')).toThrow();
  });
});
