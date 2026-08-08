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

  it('devuelve siempre colores válidos, nunca undefined ni NaN', () => {
    for (const l of [luz({}), luz({ habitantes: null }), luz({ voces: 999 })]) {
      const c = colorDeLuz(l);
      expect(c.fill).toMatch(/^(#|rgba)/);
      expect(c.stroke).toMatch(/^(#|rgba)/);
      expect(c.fill).not.toContain('NaN');
      expect(c.stroke).not.toContain('NaN');
    }
  });
});

/**
 * El alfa de un `rgba(r,g,b,a)`. Devuelve `null` para los grises sólidos, que
 * son hexadecimales y no llevan alfa.
 */
const alfaDe = (color: string): number | null => {
  const m = /^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/.exec(color);
  return m?.[1] === undefined ? null : Number(m[1]);
};

/**
 * La dirección de la rampa, que es lo único que un test de desigualdad no
 * puede cuidar. Si alguien invirtiera la fórmula —`1 - intensidad` en vez de
 * `intensidad`— los colores seguirían siendo distintos y el test de arriba
 * seguiría en verde, pero el mapa diría exactamente lo contrario de la verdad:
 * las celdas donde nadie habló saldrían encendidas.
 */
describe('la rampa apunta para el lado correcto', () => {
  it('más voces, más alfa: el brillo crece de forma monótona', () => {
    const alfas = [1, 5, 20, 50].map((voces) => {
      const a = alfaDe(colorDeLuz(luz({ voces })).fill);
      if (a === null) throw new Error(`con ${voces} voces debería haber alfa`);
      return a;
    });
    for (let i = 1; i < alfas.length; i += 1) {
      const previo = alfas[i - 1];
      const actual = alfas[i];
      if (previo === undefined || actual === undefined) throw new Error('faltó un alfa');
      expect(actual).toBeGreaterThan(previo);
    }
  });

  it('más confirmaciones, más alfa en el trazo: el foco también crece', () => {
    const borrosa = alfaDe(colorDeLuz(luz({ voces: 50, verificables: 8, confirmaciones: 0 })).stroke);
    const media = alfaDe(colorDeLuz(luz({ voces: 50, verificables: 8, confirmaciones: 4 })).stroke);
    const nitida = alfaDe(colorDeLuz(luz({ voces: 50, verificables: 8, confirmaciones: 8 })).stroke);
    if (borrosa === null || media === null || nitida === null) throw new Error('debería haber alfa');
    expect(media).toBeGreaterThan(borrosa);
    expect(nitida).toBeGreaterThan(media);
  });
});
