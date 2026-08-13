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

  it('k LIMITA de verdad: con k chico salen menos aristas que con k grande', () => {
    // Sin este test, reemplazar `.slice(0, k)` por `.slice(0, ids.length)`
    // —o sea ignorar k y devolver todos los pares— pasaba la suite entera.
    const vs = new Map<string, readonly number[]>([
      ['a', [1, 0, 0, 0, 0]],
      ['b', [0, 1, 0, 0, 0]],
      ['c', [0, 0, 1, 0, 0]],
      ['d', [0, 0, 0, 1, 0]],
      ['e', [0, 0, 0, 0, 1]],
    ]);
    const conUno = aristasMedidas(vs, 1);
    const conCuatro = aristasMedidas(vs, 4);

    // Cinco nodos, cada uno aporta a lo sumo una arista ⇒ 5 como techo duro.
    expect(conUno.length).toBeLessThanOrEqual(5);
    // Con k = n-1 salen todos los pares: C(5,2) = 10.
    expect(conCuatro).toHaveLength(10);
    expect(conUno.length).toBeLessThan(conCuatro.length);
  });

  it('con k mayor que la cantidad de vecinas no rompe ni duplica', () => {
    const vs = new Map<string, readonly number[]>([
      ['a', [1, 0]],
      ['b', [0, 1]],
      ['c', [1, 1]],
    ]);

    expect(aristasMedidas(vs, 99)).toHaveLength(3);
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
