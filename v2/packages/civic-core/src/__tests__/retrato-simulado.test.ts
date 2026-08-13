import { describe, expect, it } from 'vitest';

import { retratoSimulado } from '../simulacion/retrato.js';

import type { EstadoMedido, Palancas, Retrato, Territorio } from '../simulacion/tipos.js';

const TERRITORIOS: Territorio[] = [
  { id: 'grande', nombre: 'Grande', poblacion: 4_000_000, km2: 100 },
  { id: 'chico', nombre: 'Chico', poblacion: 1_000_000, km2: 100 },
];

const BASE: EstadoMedido = { voces: [], ahora: 1_800_000_000_000 };

const palancas = (over: Partial<Palancas> = {}): Palancas => ({
  participacion: 200,
  dispersion: 1,
  composicion: { basta: 1, sueño: 0, necesidad: 0, compromiso: 0, recurso: 0, valor: 0 },
  horizonte: 2,
  resistencia: 0,
  constancia: 1,
  cumplimiento: 1,
  ...over,
});

const sumaVoces = (r: Retrato): number =>
  [...r.porTerritorio.values()].reduce((a, t) => a + t.voces.valor, 0);

describe('retratoSimulado', () => {
  it('la participación se convierte en voces sobre la población total', () => {
    // 200 cada 100.000 sobre 5.000.000 → 10.000 voces.
    expect(sumaVoces(retratoSimulado(palancas(), BASE, TERRITORIOS))).toBe(10_000);
  });

  it('lo que cuenta viene marcado como derivado, no como medido', () => {
    const r = retratoSimulado(palancas(), BASE, TERRITORIOS);
    expect(r.porTerritorio.get('grande')?.voces.procedencia.tipo).toBe('derivado');
  });

  it('la resistencia sube el piso y puede tumbar un mandato', () => {
    const sinResistencia = retratoSimulado(palancas(), BASE, TERRITORIOS);
    const conResistencia = retratoSimulado(palancas({ resistencia: 1 }), BASE, TERRITORIOS);
    expect(sinResistencia.porTerritorio.get('grande')?.veredicto.hay).toBe(true);
    expect(conResistencia.porTerritorio.get('grande')?.veredicto.hay).toBe(false);
  });

  it('más voz recupera el mandato que la resistencia había tumbado', () => {
    // La lección central: la obstrucción se tapa con voz.
    const recuperado = retratoSimulado(
      palancas({ resistencia: 1, participacion: 1000 }),
      BASE,
      TERRITORIOS,
    );
    expect(recuperado.porTerritorio.get('grande')?.veredicto.hay).toBe(true);
  });

  it('el estallido no sostiene: sin constancia no hay mandato', () => {
    const estallido = retratoSimulado(palancas({ constancia: 0 }), BASE, TERRITORIOS);
    expect(estallido.porTerritorio.get('grande')?.veredicto.hay).toBe(false);
  });

  it('la dispersión reparte el mismo total sin crear voces', () => {
    const concentrado = retratoSimulado(palancas({ dispersion: 0 }), BASE, TERRITORIOS);
    const repartido = retratoSimulado(palancas({ dispersion: 1 }), BASE, TERRITORIOS);
    expect(sumaVoces(concentrado)).toBe(sumaVoces(repartido));
    expect(concentrado.porTerritorio.get('chico')?.voces.valor).toBe(0);
    expect(repartido.porTerritorio.get('chico')?.voces.valor).toBeGreaterThan(0);
  });
});
