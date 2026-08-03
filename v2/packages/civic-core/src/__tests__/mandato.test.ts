import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import {
  hayMandato,
  periodosDelHorizonte,
  periodosSostenidos,
  pisoEfectivo,
  umbralDe,
} from '../simulacion/mandato.js';

import type { Territorio } from '../simulacion/tipos.js';

const TERRITORIO: Territorio = { id: 't', nombre: 'T', poblacion: 1_000_000, km2: 10 };

describe('pisoEfectivo', () => {
  it('sin resistencia es el piso publicado', () => {
    expect(pisoEfectivo(0)).toBe(COEFICIENTES.PISO_MANDATO);
  });

  it('a resistencia máxima se quintuplica', () => {
    expect(pisoEfectivo(1)).toBe(COEFICIENTES.PISO_MANDATO * 5);
  });

  it('recorta valores fuera de rango en vez de extrapolar', () => {
    expect(pisoEfectivo(-3)).toBe(COEFICIENTES.PISO_MANDATO);
    expect(pisoEfectivo(9)).toBe(COEFICIENTES.PISO_MANDATO * 5);
  });
});

describe('umbralDe', () => {
  it('escala el piso por la población del territorio', () => {
    // 100 cada 100.000, sobre 1.000.000 de habitantes → 1.000 voces.
    expect(umbralDe(TERRITORIO, 100)).toBe(1000);
  });
});

describe('períodos', () => {
  it('el horizonte se cuenta en meses', () => {
    expect(periodosDelHorizonte(2)).toBe(24);
  });

  it('el horizonte mínimo es un período', () => {
    expect(periodosDelHorizonte(0)).toBe(1);
  });

  it('en estallido se sostiene un solo período', () => {
    expect(periodosSostenidos(0, 24)).toBe(1);
  });

  it('en goteo pleno se sostienen todos', () => {
    expect(periodosSostenidos(1, 24)).toBe(24);
  });

  it('a media constancia se sostiene la mitad', () => {
    expect(periodosSostenidos(0.5, 25)).toBe(13);
  });
});

describe('hayMandato', () => {
  it('exige cruzar el umbral Y sostenerlo', () => {
    expect(hayMandato(1000, 1000, COEFICIENTES.MINIMO_PERIODOS)).toBe(true);
    expect(hayMandato(999, 1000, COEFICIENTES.MINIMO_PERIODOS)).toBe(false);
    expect(hayMandato(5000, 1000, COEFICIENTES.MINIMO_PERIODOS - 1)).toBe(false);
  });

  it('un umbral de cero no regala mandatos', () => {
    // Un territorio sin población no puede tener mandato: no hay a quién
    // representar. Sin esto, el 0 >= 0 lo volvería siempre verdadero.
    expect(hayMandato(0, 0, 99)).toBe(false);
  });
});
