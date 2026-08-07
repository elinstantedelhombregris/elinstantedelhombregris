import { describe, expect, it } from 'vitest';

import { brilloDeCelda, intensidadDeBrillo, nitidezDeCelda } from '../brillo.js';
import { COEFICIENTES_LUZ } from '../coeficientes-luz.js';

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

describe('nitidezDeCelda', () => {
  it('es la fracción de verificables que alguien confirmó', () => {
    const n = nitidezDeCelda(conteo({ verificables: 4, confirmaciones: 3 }));
    expect(n.tipo).toBe('valor');
    if (n.tipo !== 'valor') return;
    expect(n.fraccion).toBeCloseTo(0.75);
  });

  it('una celda de puros sueños no tiene nitidez cero: no tiene nitidez', () => {
    const n = nitidezDeCelda(conteo({ vocesDistintas: 9, verificables: 0 }));
    expect(n.tipo).toBe('inaplicable');
    if (n.tipo !== 'inaplicable') return;
    expect(n.razon).toBe('No hay hechos que comprobar en esta celda.');
  });

  it('hechos sin confirmar sí valen cero: eso es estar borrosa', () => {
    const n = nitidezDeCelda(conteo({ verificables: 5, confirmaciones: 0 }));
    expect(n.tipo).toBe('valor');
    if (n.tipo !== 'valor') return;
    expect(n.fraccion).toBe(0);
  });

  it('no pasa de 1 aunque haya más confirmaciones que hechos', () => {
    const n = nitidezDeCelda(conteo({ verificables: 2, confirmaciones: 7 }));
    if (n.tipo !== 'valor') throw new Error('debería tener valor');
    expect(n.fraccion).toBe(1);
  });

  it('no depende del brillo: se puede estar encendida y borrosa', () => {
    const c = conteo({ vocesDistintas: 500, habitantes: 1000, verificables: 3, confirmaciones: 0 });
    const b = brilloDeCelda(c);
    const n = nitidezDeCelda(c);
    if (b.tipo !== 'valor' || n.tipo !== 'valor') throw new Error('los dos deberían tener valor');
    expect(b.participacion).toBeGreaterThan(0.4);
    expect(n.fraccion).toBe(0);
  });
});

describe('intensidadDeBrillo', () => {
  it('la participación de referencia llega a la intensidad plena', () => {
    const b = brilloDeCelda(conteo({
      vocesDistintas: COEFICIENTES_LUZ.PARTICIPACION_PLENA * 1000,
      habitantes: 1000,
    }));
    expect(intensidadDeBrillo(b)).toBeCloseTo(1);
  });

  it('sin denominador no hay intensidad: devuelve null, no cero', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 40, habitantes: null }));
    expect(intensidadDeBrillo(b)).toBeNull();
  });

  it('nadie hablando es intensidad cero', () => {
    expect(intensidadDeBrillo(brilloDeCelda(conteo({ vocesDistintas: 0 })))).toBe(0);
  });

  it('satura: el doble de la referencia no se pasa de 1', () => {
    const b = brilloDeCelda(conteo({
      vocesDistintas: COEFICIENTES_LUZ.PARTICIPACION_PLENA * 2000,
      habitantes: 1000,
    }));
    expect(intensidadDeBrillo(b)).toBe(1);
  });

  it('una participación chiquita ya se ve, que es el punto de que la rampa no sea lineal', () => {
    // Una sola voz en mil habitantes: 0,1% de participación.
    const b = brilloDeCelda(conteo({ vocesDistintas: 1, habitantes: 1000 }));
    const i = intensidadDeBrillo(b);
    expect(i).not.toBeNull();
    if (i === null) return;
    expect(i).toBeGreaterThan(0.001);
  });

  it('crece de forma monótona con la participación', () => {
    const de = (voces: number): number => {
      const i = intensidadDeBrillo(brilloDeCelda(conteo({ vocesDistintas: voces, habitantes: 1000 })));
      if (i === null) throw new Error('debería haber intensidad');
      return i;
    };
    expect(de(1)).toBeLessThan(de(5));
    expect(de(5)).toBeLessThan(de(20));
    expect(de(20)).toBeLessThan(de(50));
  });
});
