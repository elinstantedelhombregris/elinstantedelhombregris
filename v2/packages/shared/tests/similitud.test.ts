import { describe, expect, it } from 'vitest';

import { jaccard, sonGemelos, trigramas } from '../src/content/similitud';

describe('trigramas', () => {
  it('normaliza tildes, mayúsculas y puntuación', () => {
    expect(trigramas('Água, río')).toEqual(trigramas('agua rio'));
  });
});

describe('jaccard', () => {
  it('da 1 para textos idénticos y 0 para textos sin nada en común', () => {
    expect(jaccard(trigramas('la misma frase'), trigramas('la misma frase'))).toBe(1);
    expect(jaccard(trigramas('perro'), trigramas('kiwi'))).toBe(0);
  });
});

describe('sonGemelos', () => {
  it('marca cierres plantillados que sólo cambian una variable', () => {
    const a =
      'Para que esta idea no quede en el plano conceptual, conviene traducirla a decisiones observables dentro de tu municipio.';
    const b =
      'Para que esta idea no quede en el plano conceptual, conviene traducirla a decisiones observables dentro de tu hogar.';
    expect(sonGemelos(a, b)).toBe(true);
  });

  it('no marca cierres distintos sobre el mismo tema', () => {
    const a = 'En 2024 el Congreso trató doce proyectos girados a la comisión de presupuesto.';
    const b =
      'La ordenanza rosarina obliga a publicar el presupuesto en formato abierto desde 2019.';
    expect(sonGemelos(a, b)).toBe(false);
  });
});
