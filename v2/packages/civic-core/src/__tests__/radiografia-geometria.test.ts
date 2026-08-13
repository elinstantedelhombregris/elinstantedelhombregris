import { describe, expect, it } from 'vitest';

import {
  ANGULO_AUREO,
  PHI,
  escalaModular,
  esferaDeFibonacci,
  espiralAurea,
} from '../radiografia/geometria.js';

describe('las constantes', () => {
  it('φ y el ángulo áureo son los que dicen ser', () => {
    expect(PHI).toBeCloseTo(1.618033988, 8);
    // 360°/φ² = 137,50776…°
    expect((ANGULO_AUREO * 180) / Math.PI).toBeCloseTo(137.50776405, 6);
  });
});

describe('la esfera de Fibonacci', () => {
  it('devuelve n puntos, todos sobre la esfera unitaria', () => {
    const puntos = esferaDeFibonacci(100);

    expect(puntos).toHaveLength(100);
    for (const p of puntos) {
      expect(Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)).toBeCloseTo(1, 10);
    }
  });

  it('no apelmaza: ningún par queda demasiado junto', () => {
    const puntos = esferaDeFibonacci(100);
    let minimo = Infinity;
    for (let i = 0; i < puntos.length; i++) {
      for (let j = i + 1; j < puntos.length; j++) {
        const p = puntos[i];
        const q = puntos[j];
        if (!p || !q) continue;
        minimo = Math.min(minimo, Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z));
      }
    }
    // El motivo de existir de esta función: con colocación al azar el mínimo
    // se va a cero y hay núcleos escondidos detrás de otros, que existen en el
    // dato y no se pueden clickear.
    expect(minimo).toBeGreaterThan(0.15);
  });

  it('es determinista', () => {
    expect(esferaDeFibonacci(37)).toEqual(esferaDeFibonacci(37));
  });

  it('aguanta los bordes', () => {
    expect(esferaDeFibonacci(0)).toEqual([]);
    expect(esferaDeFibonacci(-3)).toEqual([]);
    expect(esferaDeFibonacci(1)).toHaveLength(1);
  });
});

describe('la espiral áurea', () => {
  it('mantiene todos los puntos dentro del radio', () => {
    for (const p of espiralAurea(50, 10)) {
      expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(10 + 1e-9);
    }
  });

  it('devuelve n puntos y vacío para n = 0', () => {
    expect(espiralAurea(12, 5)).toHaveLength(12);
    expect(espiralAurea(0, 5)).toEqual([]);
  });
});

describe('la escala modular', () => {
  it('es 1 · 1,618 · 2,618 · 4,236', () => {
    expect(escalaModular(0)).toBeCloseTo(1, 10);
    expect(escalaModular(1)).toBeCloseTo(1.618034, 6);
    expect(escalaModular(2)).toBeCloseTo(2.618034, 6);
    expect(escalaModular(3)).toBeCloseTo(4.236068, 6);
  });
});
