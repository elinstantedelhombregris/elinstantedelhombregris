import { simular } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { coropleticoDe, coropleticoDiferencia, maximoDe } from '../simulacion/coropletico';

import type { EntradaSimulacion, Territorio } from '@v2/civic-core';

const TERRITORIOS: Territorio[] = [
  { id: 'Córdoba', nombre: 'Córdoba', poblacion: 4_000_000, km2: 165_300 },
  { id: 'Formosa', nombre: 'Formosa', poblacion: 606_000, km2: 72_100 },
];

/** Geometría mínima: solo importan los nombres, no las formas. */
const GEOMETRIA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'Córdoba' }, geometry: { type: 'Polygon', coordinates: [] } },
    { type: 'Feature', properties: { name: 'Formosa' }, geometry: { type: 'Polygon', coordinates: [] } },
    { type: 'Feature', properties: { name: 'Tierra del Fuego' }, geometry: { type: 'Polygon', coordinates: [] } },
  ],
};

const ENTRADA: EntradaSimulacion = {
  palancas: {
    participacion: 300,
    dispersion: 1,
    composicion: { basta: 1, sueño: 0, necesidad: 0, compromiso: 0, recurso: 0, valor: 0 },
    horizonte: 2,
    resistencia: 0,
    constancia: 1,
    cumplimiento: 1,
  },
  base: { voces: [], ahora: 1_800_000_000_000 },
  territorios: TERRITORIOS,
};

const prop = (fc: ReturnType<typeof coropleticoDe>, nombre: string) =>
  fc?.features.find((f) => f.properties.name === nombre)?.properties;

describe('coropleticoDe', () => {
  const resultado = simular(ENTRADA);

  it('pega el valor de cada territorio en su feature', () => {
    const fc = coropleticoDe(GEOMETRIA, resultado.voz);
    expect(prop(fc, 'Córdoba')?.valor).toBeGreaterThan(0);
    expect(prop(fc, 'Formosa')?.valor).toBeGreaterThan(0);
  });

  it('marca como sin dato la provincia que el retrato no conoce', () => {
    // Tierra del Fuego está en la geometría y no en los territorios. Pintarla
    // en cero diría «acá no habla nadie», que es distinto de «no sé».
    const fc = coropleticoDe(GEOMETRIA, resultado.voz);
    expect(prop(fc, 'Tierra del Fuego')?.sinDato).toBe(1);
    expect(prop(fc, 'Tierra del Fuego')?.valor).toBe(0);
  });

  it('marca las que tienen mandato', () => {
    const fc = coropleticoDe(GEOMETRIA, resultado.voz);
    expect(prop(fc, 'Córdoba')?.tieneMandato).toBe(1);
  });

  it('sin geometría devuelve null en vez de romper', () => {
    expect(coropleticoDe(null, resultado.voz)).toBeNull();
    expect(coropleticoDe({ type: 'Cualquiera' }, resultado.voz)).toBeNull();
  });

  it('el máximo nunca es cero, para no dividir por cero en la rampa', () => {
    const vacio = coropleticoDe(GEOMETRIA, resultado.silencio);
    expect(maximoDe(vacio)).toBeGreaterThan(0);
  });
});

describe('coropleticoDiferencia', () => {
  const resultado = simular(ENTRADA);

  it('lleva el delta con signo', () => {
    const fc = coropleticoDiferencia(GEOMETRIA, resultado.diferencia);
    expect(prop(fc, 'Córdoba')?.valor).toBeGreaterThan(0);
  });

  it('la provincia que no está en la diferencia queda sin dato, no en cero', () => {
    const fc = coropleticoDiferencia(GEOMETRIA, resultado.diferencia);
    expect(prop(fc, 'Tierra del Fuego')?.sinDato).toBe(1);
  });

  it('marca las que ganan mandato', () => {
    const fc = coropleticoDiferencia(GEOMETRIA, resultado.diferencia);
    expect(prop(fc, 'Córdoba')?.tieneMandato).toBe(1);
  });
});
