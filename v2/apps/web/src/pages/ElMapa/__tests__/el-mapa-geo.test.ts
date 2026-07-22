import { describe, expect, it } from 'vitest';

import { MAX_PUNTOS_PROVINCIA, puntosJitter } from '../el-mapa-geo';

describe('puntosJitter', () => {
  it('es determinista: mismo input, mismos puntos', () => {
    expect(puntosJitter(5, 100, 200)).toEqual(puntosJitter(5, 100, 200));
  });

  it('el primer punto es el centroide y el resto queda dentro del radio', () => {
    const puntos = puntosJitter(MAX_PUNTOS_PROVINCIA, 100, 200, 14);
    expect(puntos[0]).toEqual({ x: 100, y: 200 });
    for (const p of puntos) {
      expect(Math.hypot(p.x - 100, p.y - 200)).toBeLessThanOrEqual(14.001);
    }
  });

  it('n=0 devuelve vacío y n=1 solo el centro', () => {
    expect(puntosJitter(0, 10, 10)).toEqual([]);
    expect(puntosJitter(1, 10, 10)).toEqual([{ x: 10, y: 10 }]);
  });
});
