import { describe, expect, it } from 'vitest';

import { brilloDeCelda } from '../brillo.js';

import { conteo } from './_conteo.js';

describe('brilloDeCelda', () => {
  it('es la fracción de habitantes que habló', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 40, habitantes: 1000 }));
    expect(b.tipo).toBe('valor');
    if (b.tipo !== 'valor') return;
    expect(b.participacion).toBeCloseTo(0.04);
  });

  it('sin habitantes no vale cero: vale sin denominador', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 40, habitantes: null }));
    expect(b.tipo).toBe('sinDenominador');
    if (b.tipo !== 'sinDenominador') return;
    expect(b.razon).toBe('Sin población conocida: no hay denominador.');
  });

  it('cero habitantes es lo mismo que no saber cuántos hay', () => {
    expect(brilloDeCelda(conteo({ habitantes: 0 })).tipo).toBe('sinDenominador');
  });

  it('una celda con denominador y sin voces sí vale cero', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 0, habitantes: 1000 }));
    expect(b.tipo).toBe('valor');
    if (b.tipo !== 'valor') return;
    expect(b.participacion).toBe(0);
  });

  it('lleva la fórmula a la vista', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 1 }));
    if (b.tipo !== 'valor') throw new Error('debería tener valor');
    expect(b.formula).toBe('voces distintas ÷ habitantes');
  });

  it('no pasa de 1 aunque hablen más personas que habitantes estimados', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 2000, habitantes: 1000 }));
    if (b.tipo !== 'valor') throw new Error('debería tener valor');
    expect(b.participacion).toBe(1);
  });
});
