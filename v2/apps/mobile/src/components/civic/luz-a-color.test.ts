import { luzDeCelda } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { colorDeLuz, SIN_DATO, MUDA } from './luz-a-color';

const luz = (parcial: { voces?: number; habitantes?: number | null; verificables?: number; confirmaciones?: number }) =>
  luzDeCelda({
    cellId: 'c1',
    vocesDistintas: parcial.voces ?? 0,
    habitantes: parcial.habitantes === undefined ? 1000 : parcial.habitantes,
    verificables: parcial.verificables ?? 0,
    confirmaciones: parcial.confirmaciones ?? 0,
  });

describe('colorDeLuz', () => {
  it('nadie habló se pinta con el gris de celda muda', () => {
    expect(colorDeLuz(luz({ voces: 0 })).fill).toBe(MUDA);
  });

  it('sin denominador NO se pinta como muda: tiene su propio gris', () => {
    const sinDenominador = colorDeLuz(luz({ voces: 30, habitantes: null })).fill;
    expect(sinDenominador).toBe(SIN_DATO);
    expect(sinDenominador).not.toBe(MUDA);
  });

  it('más voces se pintan más claro que menos voces', () => {
    const poca = colorDeLuz(luz({ voces: 1 })).fill;
    const mucha = colorDeLuz(luz({ voces: 50 })).fill;
    expect(poca).not.toBe(mucha);
  });

  it('el foco viaja en el trazo: hechos sin confirmar dan trazo más débil', () => {
    const borrosa = colorDeLuz(luz({ voces: 50, verificables: 8, confirmaciones: 0 })).stroke;
    const nitida = colorDeLuz(luz({ voces: 50, verificables: 8, confirmaciones: 8 })).stroke;
    expect(borrosa).not.toBe(nitida);
  });

  it('una celda de puros sueños sale tan nítida como una toda confirmada', () => {
    const suenos = colorDeLuz(luz({ voces: 50, verificables: 0 })).stroke;
    const confirmada = colorDeLuz(luz({ voces: 50, verificables: 8, confirmaciones: 8 })).stroke;
    expect(suenos).toBe(confirmada);
  });

  it('devuelve siempre colores válidos, nunca undefined', () => {
    for (const l of [luz({}), luz({ habitantes: null }), luz({ voces: 999 })]) {
      const c = colorDeLuz(l);
      expect(c.fill).toMatch(/^(#|rgba)/);
      expect(c.stroke).toMatch(/^(#|rgba)/);
    }
  });
});
