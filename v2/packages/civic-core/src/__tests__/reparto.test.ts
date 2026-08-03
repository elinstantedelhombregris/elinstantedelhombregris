import { describe, expect, it } from 'vitest';

import { repartir } from '../simulacion/reparto.js';

import type { Territorio } from '../simulacion/tipos.js';

const TERRITORIOS: Territorio[] = [
  { id: 'grande', nombre: 'Grande', poblacion: 800_000, km2: 100 },
  { id: 'chico', nombre: 'Chico', poblacion: 200_000, km2: 100 },
];

const suma = (m: ReadonlyMap<string, number>): number => [...m.values()].reduce((a, b) => a + b, 0);

describe('repartir', () => {
  it('con dispersión 1 reparte en proporción a la población', () => {
    const r = repartir(1000, TERRITORIOS, 1, new Map());
    expect(r.get('grande')).toBe(800);
    expect(r.get('chico')).toBe(200);
  });

  it('con dispersión 0 todo va donde ya se habla más', () => {
    const r = repartir(1000, TERRITORIOS, 0, new Map([['chico', 5]]));
    expect(r.get('chico')).toBe(1000);
    expect(r.get('grande')).toBe(0);
  });

  it('sin voces previas, la concentración cae en el más poblado', () => {
    const r = repartir(1000, TERRITORIOS, 0, new Map());
    expect(r.get('grande')).toBe(1000);
  });

  it('conserva el total: los redondeos no crean ni pierden voces', () => {
    // 3 territorios y 100 voces: los cocientes no son enteros. Con redondeo
    // ingenuo la suma daría 99 o 101, y un total que no cierra es exactamente
    // la clase de mentira que este motor no puede permitirse.
    const tres: Territorio[] = [
      { id: 'a', nombre: 'A', poblacion: 1, km2: 1 },
      { id: 'b', nombre: 'B', poblacion: 1, km2: 1 },
      { id: 'c', nombre: 'C', poblacion: 1, km2: 1 },
    ];
    expect(suma(repartir(100, tres, 1, new Map()))).toBe(100);
  });

  it('es determinista ante empates', () => {
    const tres: Territorio[] = [
      { id: 'c', nombre: 'C', poblacion: 1, km2: 1 },
      { id: 'a', nombre: 'A', poblacion: 1, km2: 1 },
      { id: 'b', nombre: 'B', poblacion: 1, km2: 1 },
    ];
    const primera = repartir(100, tres, 1, new Map());
    const segunda = repartir(100, tres, 1, new Map());
    expect([...primera.entries()].sort()).toEqual([...segunda.entries()].sort());
  });

  it('un total de cero reparte ceros', () => {
    expect(suma(repartir(0, TERRITORIOS, 1, new Map()))).toBe(0);
  });
});
