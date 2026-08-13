import { describe, expect, it } from 'vitest';

import {
  declarado,
  derivado,
  esHipotesis,
  esMagnitud,
  hipotesis,
  medido,
  selloDe,
} from '../simulacion/procedencia.js';

import type { SelloDelModelo } from '../simulacion/procedencia.js';

const SELLO: SelloDelModelo = {
  modelo: 'llama3.1:8b-instruct-q4_K_M',
  digest: 'sha256:abcd',
  temperatura: 0,
  poblacionHuella: 'deadbeef',
  semilla: 7,
  generadaEn: 1_800_000_000_000,
};

describe('Magnitud', () => {
  it('un medido declara su fuente', () => {
    expect(medido(12, 'voces', 'dreams')).toEqual({
      valor: 12,
      unidad: 'voces',
      procedencia: { tipo: 'medido', fuente: 'dreams' },
    });
  });

  it('un declarado dice qué palanca lo movió', () => {
    expect(declarado(0.5, 'fracción', 'dispersion').procedencia).toEqual({
      tipo: 'declarado',
      palanca: 'dispersion',
    });
  });

  it('un derivado muestra su fórmula y de qué se derivó', () => {
    expect(derivado(0.25, 'fracción', 'alcance × persistencia', ['alcance', 'persistencia'])).toEqual({
      valor: 0.25,
      unidad: 'fracción',
      procedencia: {
        tipo: 'derivado',
        formula: 'alcance × persistencia',
        de: ['alcance', 'persistencia'],
      },
    });
  });

  it('esMagnitud distingue una Magnitud de un número suelto', () => {
    expect(esMagnitud(medido(1, 'voces', 'x'))).toBe(true);
    expect(esMagnitud(3)).toBe(false);
    expect(esMagnitud({ valor: 3, unidad: 'voces' })).toBe(false);
    expect(esMagnitud(null)).toBe(false);
  });

  it('una hipótesis también es una Magnitud: la guarda tiene que dejarla pasar', () => {
    // Si `esMagnitud` no reconociera la cuarta variante, la guarda «sin números
    // huérfanos» empezaría a marcar como huérfano justo el número del modelo,
    // que es el que más necesita procedencia.
    expect(esMagnitud(hipotesis(medido(1, 'voces', 'x'), SELLO))).toBe(true);
  });

  it('la hipótesis envuelve y no reemplaza: la fórmula sigue a la vista', () => {
    const envuelta = hipotesis(derivado(0.25, 'fracción', 'alcance × persistencia', ['alcance']), SELLO);
    expect(envuelta.procedencia).toEqual({
      tipo: 'hipotesis',
      sobre: { tipo: 'derivado', formula: 'alcance × persistencia', de: ['alcance'] },
      sello: SELLO,
    });
    expect(selloDe(envuelta.procedencia)).toEqual(SELLO);
    expect(esHipotesis(envuelta.procedencia)).toBe(true);
    // Un derivado común no lleva sello, y decirlo es la mitad del contrato.
    expect(selloDe({ tipo: 'derivado', formula: 'a × b', de: [] })).toBeNull();
  });
});
