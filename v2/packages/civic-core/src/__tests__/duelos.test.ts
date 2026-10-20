import { describe, expect, it } from 'vitest';

import { clavePar, proximoDuelo, tocaDuelo } from '../pila/duelos.js';

describe('duelos', () => {
  it('la clave del par no depende del orden', () => {
    expect(clavePar('a', 'b')).toBe(clavePar('b', 'a'));
  });

  it('compara el acuerdo más reciente con el más antiguo sin duelo', () => {
    expect(proximoDuelo(['a', 'b', 'c'], new Set(), new Set())).toEqual(['a', 'c']);
    expect(proximoDuelo(['a', 'b', 'c'], new Set(), new Set(['a']))).toEqual(['b', 'c']);
  });

  it('no repite un par ya comparado', () => {
    expect(proximoDuelo(['a', 'c'], new Set([clavePar('a', 'c')]), new Set())).toBeNull();
  });

  it('con menos de dos acuerdos no hay duelo', () => {
    expect(proximoDuelo([], new Set(), new Set())).toBeNull();
    expect(proximoDuelo(['a'], new Set(), new Set())).toBeNull();
  });

  it('toca después de la cuarta y la octava respuesta, dos veces como mucho', () => {
    expect(tocaDuelo(4, 0)).toBe(true);
    expect(tocaDuelo(8, 1)).toBe(true);
    expect(tocaDuelo(8, 2)).toBe(false);
    expect(tocaDuelo(5, 0)).toBe(false);
  });
});
