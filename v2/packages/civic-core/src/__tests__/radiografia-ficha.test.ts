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

  it('no se apaga entero porque la PRIMERA señal traiga el vector vacío', () => {
    // El largo se tomaba de `senales[0]`, así que un solo elemento mal
    // formado dejaba sin etiqueta a un núcleo con señales perfectas y con
    // cesión. El orden del array no puede decidir eso.
    const nucleo = [
      señal('a', [], null),
      señal('b', [1, 0], 'con cesión y con vector'),
      señal('c', [1, 0.1], 'con cesión también'),
    ];

    expect(fraseDelNucleo(nucleo)).not.toBeNull();
    expect(fraseDelNucleo(nucleo)?.texto).toMatch(/con cesión/);
  });

  it('tolera vectores de largo distinto dentro del mismo núcleo', () => {
    const nucleo = [señal('a', [1, 0, 0, 0], 'largo'), señal('b', [1, 0], 'corto')];

    expect(() => fraseDelNucleo(nucleo)).not.toThrow();
    expect(fraseDelNucleo(nucleo)).not.toBeNull();
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
    // La aserción anterior era `toBe(Math.round(km/10)*10)`, que compara el
    // valor contra sí mismo redondeado y por lo tanto pasa para cualquier
    // múltiplo de 10 — redondear a la CENTENA la sobrevivía. Se fija el
    // múltiplo de forma independiente y el valor dentro de una banda angosta.
    expect((par?.km ?? -1) % 10).toBe(0);
    expect(par?.km).toBeGreaterThan(3_600);
    expect(par?.km).toBeLessThan(3_700);
  });

  it('nunca publica 0 km para dos personas que no están en el mismo lugar', () => {
    // ~4 km: con redondeo a la decena y sin piso, esto daba «0 km», que no es
    // un redondeo sino otra afirmación — dice «en el mismo lugar».
    const par = dosMasLejanos([
      señal('a', [1, 0], 'x', { lat: -34.6, lng: -58.4 }),
      señal('b', [1, 0], 'x', { lat: -34.636, lng: -58.4 }),
    ]);

    expect(par?.km).toBe(10);
  });

  it('devuelve 0 km sólo cuando la distancia es de verdad 0', () => {
    const par = dosMasLejanos([
      señal('a', [1, 0], 'x', { lat: -34.6, lng: -58.4 }),
      señal('b', [1, 0], 'x', { lat: -34.6, lng: -58.4 }),
    ]);

    expect(par?.km).toBe(0);
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
