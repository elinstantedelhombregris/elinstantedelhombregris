import { describe, expect, it } from 'vitest';

import { similitudCoseno } from '../radiografia/similitud.js';

describe('similitud coseno', () => {
  it('da 1 para el mismo vector', () => {
    expect(similitudCoseno([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
  });

  it('da 0 para vectores ortogonales', () => {
    expect(similitudCoseno([1, 0], [0, 1])).toBeCloseTo(0, 10);
  });

  it('da -1 para vectores opuestos', () => {
    expect(similitudCoseno([1, 0], [-1, 0])).toBeCloseTo(-1, 10);
  });

  it('ignora la magnitud: sólo importa la dirección', () => {
    expect(similitudCoseno([1, 1], [7, 7])).toBeCloseTo(1, 10);
  });

  it('da 0 si alguno es el vector cero, en vez de NaN', () => {
    expect(similitudCoseno([0, 0], [1, 1])).toBe(0);
    expect(similitudCoseno([0, 0], [0, 0])).toBe(0);
  });

  it('tira si los largos no coinciden, en vez de comparar basura', () => {
    expect(() => similitudCoseno([1, 2], [1, 2, 3])).toThrow(/distinto largo/);
  });
});
