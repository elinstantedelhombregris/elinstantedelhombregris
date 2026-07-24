import { beforeEach, describe, expect, it } from 'vitest';

import {
  borrarSemilla,
  guardarSemilla,
  LARGO_MAXIMO,
  leerSemilla,
  PASOS_SEMILLA,
  type SemillaGuardada,
} from '../sembrar-data';

describe('PASOS_SEMILLA — el canon de los tres pasos', () => {
  it('tiene exactamente 3 entradas, en orden basta/sueno/compromiso', () => {
    expect(PASOS_SEMILLA).toHaveLength(3);
    expect(PASOS_SEMILLA.map((p) => p.campo)).toEqual(['basta', 'sueno', 'compromiso']);
  });

  it('tiene los títulos exactos de la spec', () => {
    expect(PASOS_SEMILLA.map((p) => p.titulo)).toEqual(['Tu basta', 'Tu sueño', 'Tu compromiso']);
  });

  it('LARGO_MAXIMO es 280', () => {
    expect(LARGO_MAXIMO).toBe(280);
  });
});

describe('storage — basta_semilla', () => {
  const semilla: SemillaGuardada = {
    id: 1234,
    fecha: '2026-07-24T12:00:00.000Z',
    basta: 'Basta de prueba.',
    sueno: 'Sueño de prueba.',
    compromiso: 'Compromiso de prueba.',
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('guardarSemilla + leerSemilla hacen round-trip', () => {
    guardarSemilla(semilla);
    expect(leerSemilla()).toEqual(semilla);
  });

  it('borrarSemilla la elimina', () => {
    guardarSemilla(semilla);
    borrarSemilla();
    expect(leerSemilla()).toBeNull();
  });

  it('leerSemilla devuelve null con storage vacío', () => {
    expect(leerSemilla()).toBeNull();
  });

  it('leerSemilla devuelve null con JSON corrupto — no explota', () => {
    window.localStorage.setItem('basta_semilla', '{ esto no es json');
    expect(leerSemilla()).toBeNull();
  });

  it('leerSemilla devuelve null si falta el shape esperado', () => {
    window.localStorage.setItem('basta_semilla', JSON.stringify({ foo: 'bar' }));
    expect(leerSemilla()).toBeNull();
  });
});
