import { describe, expect, it } from 'vitest';

import { dosMasLejanos, fraseDelNucleo } from '../radiografia/nucleos.js';

import type { SenalParaNucleo } from '../radiografia/tipos.js';

const señal = (
  id: string,
  vector: readonly number[],
  texto: string | null,
  punto: { lat: number; lng: number } | null = null,
): SenalParaNucleo => ({ id, vector, texto, punto });

describe('la frase del núcleo', () => {
  it('elige la señal más cercana al centro', () => {
    const nucleo = [
      señal('a', [1, 0], 'lejos por un lado'),
      señal('b', [0, 1], 'lejos por el otro'),
      señal('c', [1, 1], 'justo en el medio'),
    ];

    expect(fraseDelNucleo(nucleo)?.texto).toBe('justo en el medio');
  });

  it('NUNCA usa una señal sin cesión, aunque sea la más cercana al centro', () => {
    const nucleo = [
      señal('a', [1, 0], 'con cesión, lejos'),
      señal('b', [0, 1], 'con cesión, lejos'),
      señal('c', [1, 1], null), // la del centro, sin cesión
    ];
    const frase = fraseDelNucleo(nucleo);

    expect(frase?.id).not.toBe('c');
    expect(frase?.texto).toMatch(/con cesión/);
  });

  it('devuelve null si ninguna del núcleo tiene cesión', () => {
    expect(fraseDelNucleo([señal('a', [1, 0], null), señal('b', [0, 1], null)])).toBeNull();
  });

  it('devuelve null para un núcleo vacío', () => {
    expect(fraseDelNucleo([])).toBeNull();
  });
});

describe('los dos más lejanos', () => {
  it('encuentra el par más distante y redondea a la decena de kilómetros', () => {
    const nucleo = [
      señal('ushuaia', [1, 0], 'x', { lat: -54.8, lng: -68.3 }),
      señal('quiaca', [1, 0], 'x', { lat: -22.1, lng: -65.6 }),
      señal('cordoba', [1, 0], 'x', { lat: -31.4, lng: -64.2 }),
    ];
    const par = dosMasLejanos(nucleo);

    expect([par?.a, par?.b].sort()).toEqual(['quiaca', 'ushuaia']);
    expect(par?.km).toBe(Math.round((par?.km ?? 0) / 10) * 10);
    expect(par?.km).toBeGreaterThan(3_500);
    expect(par?.km).toBeLessThan(4_000);
  });

  it('ignora las señales sin punto', () => {
    const nucleo = [
      señal('a', [1, 0], 'x', { lat: -34.6, lng: -58.4 }),
      señal('b', [1, 0], 'x', null),
      señal('c', [1, 0], 'x', { lat: -31.4, lng: -64.2 }),
    ];

    expect([dosMasLejanos(nucleo)?.a, dosMasLejanos(nucleo)?.b].sort()).toEqual(['a', 'c']);
  });

  it('devuelve null si hay menos de dos señales con punto', () => {
    expect(dosMasLejanos([señal('a', [1, 0], 'x', { lat: -34.6, lng: -58.4 })])).toBeNull();
    expect(dosMasLejanos([])).toBeNull();
  });
});
