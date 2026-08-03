import { describe, expect, it } from 'vitest';

import { simular } from '../simulacion/simular.js';

import type { EntradaSimulacion, Palancas, Territorio } from '../simulacion/tipos.js';

const TERRITORIOS: Territorio[] = [
  { id: 'grande', nombre: 'Grande', poblacion: 4_000_000, km2: 100 },
  { id: 'chico', nombre: 'Chico', poblacion: 1_000_000, km2: 100 },
];

const PALANCAS: Palancas = {
  participacion: 200,
  dispersion: 1,
  composicion: { basta: 1, sueño: 0, necesidad: 0, compromiso: 0, recurso: 0, valor: 0 },
  horizonte: 2,
  resistencia: 0,
  constancia: 1,
  cumplimiento: 1,
};

const entrada = (over: Partial<Palancas> = {}): EntradaSimulacion => ({
  palancas: { ...PALANCAS, ...over },
  base: { voces: [], ahora: 1_800_000_000_000 },
  territorios: TERRITORIOS,
});

describe('simular', () => {
  it('devuelve los dos retratos y su diferencia', () => {
    const r = simular(entrada());
    expect(r.silencio.porTerritorio.size).toBe(2);
    expect(r.voz.porTerritorio.size).toBe(2);
    expect(r.diferencia.porTerritorio.size).toBe(2);
  });

  it('la diferencia es la resta, territorio por territorio', () => {
    const r = simular(entrada());
    const voz = r.voz.porTerritorio.get('grande')?.voces.valor ?? 0;
    const silencio = r.silencio.porTerritorio.get('grande')?.voces.valor ?? 0;
    expect(r.diferencia.porTerritorio.get('grande')?.delta.valor).toBe(voz - silencio);
  });

  it('cuenta los territorios que ganan mandato', () => {
    const r = simular(entrada());
    expect(r.diferencia.territoriosQueGananMandato.valor).toBe(2);
    expect(r.diferencia.porTerritorio.get('grande')?.ganaMandato).toBe(true);
  });
});
