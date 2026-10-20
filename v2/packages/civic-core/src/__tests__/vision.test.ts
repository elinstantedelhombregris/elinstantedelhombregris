import { describe, expect, it } from 'vitest';

import {
  leerAporte,
  leerVision,
  nivelDeLuzPorHabitante,
  type ConteoDeAporte,
} from '../vision/leer.js';

const conteo = (
  id: string,
  porRegion: ConteoDeAporte['porRegion'],
  over: Partial<ConteoDeAporte> = {},
): ConteoDeAporte => ({
  id,
  tema: 'salud',
  publicadaEn: '2026-10-01T00:00:00.000Z',
  porRegion,
  sinRegion: { opiniones: 0, acuerdos: 0 },
  pasos: 0,
  comparaciones: 0,
  primero: 0,
  ...over,
});

describe('leerAporte', () => {
  it('une cuando todas las regiones que cuentan llegan a 7 de cada 10', () => {
    const l = leerAporte(
      conteo('a', {
        NOA: { opiniones: 10, acuerdos: 8 },
        'Buenos Aires': { opiniones: 20, acuerdos: 15 },
      }),
    );
    expect(l.enDiscusion).toBe(true);
    expect(l.une).toBe(true);
    expect(l.peor).toBe(0.75);
  });

  it('una región por debajo de 7 de cada 10 lo saca de «une»', () => {
    const l = leerAporte(
      conteo('a', {
        NOA: { opiniones: 10, acuerdos: 6 },
        'Buenos Aires': { opiniones: 20, acuerdos: 19 },
      }),
    );
    expect(l.une).toBe(false);
    expect(l.divide).toBe(true);
  });

  it('una región con menos de cinco opiniones no cuenta ni muestra porcentaje', () => {
    const l = leerAporte(
      conteo('a', {
        NOA: { opiniones: 4, acuerdos: 0 },
        Centro: { opiniones: 10, acuerdos: 9 },
        'Buenos Aires': { opiniones: 10, acuerdos: 9 },
      }),
    );
    expect(l.regiones.find((r) => r.region === 'NOA')).toMatchObject({
      cuenta: false,
      acuerdo: null,
    });
    expect(l.une).toBe(true);
  });

  it('con menos de 20 opiniones o una sola región no entra en la visión', () => {
    expect(
      leerAporte(
        conteo('a', { NOA: { opiniones: 8, acuerdos: 8 }, NEA: { opiniones: 8, acuerdos: 8 } }),
      ).enDiscusion,
    ).toBe(false);
    expect(leerAporte(conteo('a', { NOA: { opiniones: 40, acuerdos: 40 } })).enDiscusion).toBe(
      false,
    );
  });

  it('los pasos no entran en el denominador', () => {
    const l = leerAporte(
      conteo(
        'a',
        { NOA: { opiniones: 10, acuerdos: 5 }, NEA: { opiniones: 10, acuerdos: 5 } },
        { pasos: 50 },
      ),
    );
    expect(l.acuerdo).toBe(0.5);
    expect(l.pasos).toBe(50);
  });

  it('la prioridad pide diez comparaciones y suaviza con +1/+2', () => {
    const r = { NOA: { opiniones: 20, acuerdos: 18 }, NEA: { opiniones: 20, acuerdos: 18 } };
    expect(leerAporte(conteo('a', r, { comparaciones: 9, primero: 9 })).prioridad).toBeNull();
    expect(leerAporte(conteo('a', r, { comparaciones: 10, primero: 8 })).prioridad).toBeCloseTo(
      9 / 12,
    );
  });

  it('la prioridad también pide que el aporte entre en la visión', () => {
    const pocas = { NOA: { opiniones: 6, acuerdos: 6 }, NEA: { opiniones: 6, acuerdos: 6 } };
    const l = leerAporte(conteo('a', pocas, { comparaciones: 12, primero: 10 }));
    expect(l.enDiscusion).toBe(false);
    expect(l.prioridad).toBeNull();
    expect(leerVision([conteo('a', pocas, { comparaciones: 12, primero: 10 })]).primero).toEqual(
      [],
    );
  });
});

describe('leerVision', () => {
  it('ordena «une» por la región que anda peor y cuenta las regiones', () => {
    const v = leerVision([
      conteo('flojo', {
        NOA: { opiniones: 10, acuerdos: 7 },
        NEA: { opiniones: 10, acuerdos: 10 },
      }),
      conteo(
        'firme',
        { NOA: { opiniones: 10, acuerdos: 9 }, NEA: { opiniones: 10, acuerdos: 9 } },
        { tema: 'vivienda' },
      ),
      conteo('nuevo', { NOA: { opiniones: 2, acuerdos: 2 } }),
    ]);
    expect(v.une).toEqual(['firme', 'flojo']);
    expect(v.recien).toEqual(['nuevo']);
    expect(v.enDiscusion).toBe(2);
    expect(v.cuentaPorRegion.NOA).toBe(2);
    expect(v.cuentaPorRegion.Patagonia).toBe(0);
    expect(v.porTema.get('salud')).toBe('flojo');
    expect(v.porTema.get('vivienda')).toBe('firme');
  });
});

describe('nivelDeLuzPorHabitante', () => {
  it('nadie es cero y la luz crece con la participación', () => {
    expect(nivelDeLuzPorHabitante(0, 1_000_000)).toBe(0);
    const bajo = nivelDeLuzPorHabitante(5, 3_000_000);
    const alto = nivelDeLuzPorHabitante(420, 3_121_000);
    expect(bajo).toBeGreaterThanOrEqual(1);
    expect(alto).toBe(5);
  });
});
