import { describe, expect, it } from 'vitest';

import { aristasMedidas } from '../radiografia/grafo.js';

const claveDe = (a: string, b: string) => (a < b ? `${a}-${b}` : `${b}-${a}`);

describe('aristas medidas', () => {
  it('no repite un par ni lo emite en las dos direcciones', () => {
    const vs = new Map<string, readonly number[]>([
      ['a', [1, 0]],
      ['b', [0.99, 0.14]],
      ['c', [0.98, 0.2]],
    ]);
    const aristas = aristasMedidas(vs, 2);
    const claves = aristas.map((e) => claveDe(e.a, e.b));

    expect(new Set(claves).size).toBe(claves.length);
    expect(aristas.every((e) => e.a < e.b)).toBe(true);
  });

  it('conecta a cada señal con sus k más parecidas', () => {
    const vs = new Map<string, readonly number[]>([
      ['a', [1, 0, 0]],
      ['b', [0.9, 0.1, 0]],
      ['c', [0, 1, 0]],
      ['d', [0, 0, 1]],
    ]);
    const aristas = aristasMedidas(vs, 1);

    expect(aristas.some((e) => claveDe(e.a, e.b) === 'a-b')).toBe(true);
  });

  it('no conecta una señal consigo misma', () => {
    const vs = new Map<string, readonly number[]>([
      ['a', [1, 0]],
      ['b', [0, 1]],
    ]);

    expect(aristasMedidas(vs, 5).every((e) => e.a !== e.b)).toBe(true);
  });

  it('devuelve vacío con menos de dos señales', () => {
    expect(aristasMedidas(new Map(), 12)).toEqual([]);
    expect(aristasMedidas(new Map([['a', [1, 0]]]), 12)).toEqual([]);
  });

  it('guarda la similitud en cada arista', () => {
    const vs = new Map<string, readonly number[]>([
      ['a', [1, 0]],
      ['b', [1, 0]],
    ]);
    const [arista] = aristasMedidas(vs, 1);

    expect(arista?.similitud).toBeCloseTo(1, 10);
  });
});
