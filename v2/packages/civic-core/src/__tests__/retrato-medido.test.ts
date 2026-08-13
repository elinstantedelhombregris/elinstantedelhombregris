import { describe, expect, it } from 'vitest';

import { retratoMedido } from '../simulacion/retrato.js';

import type { EstadoMedido, Territorio, VozMedida } from '../simulacion/tipos.js';

/**
 * 31 días: más largo que el período del motor (365,25/12 ≈ 30,4), así cada
 * paso cae en un período distinto sin depender del redondeo.
 */
const MES = 31 * 24 * 3600 * 1000;
const AHORA = 1_800_000_000_000;

const TERRITORIOS: Territorio[] = [
  { id: 'caba', nombre: 'CABA', poblacion: 3_121_000, km2: 200 },
  { id: 'formosa', nombre: 'Formosa', poblacion: 606_000, km2: 72_100 },
  { id: 'vacio', nombre: 'Vacío', poblacion: 0, km2: 10 },
];

const voz = (territorioId: string, mesesAtras: number): VozMedida => ({
  territorioId,
  tipo: { reconocido: true, tipo: 'basta' },
  fecha: AHORA - mesesAtras * MES,
});

const base = (voces: VozMedida[]): EstadoMedido => ({ voces, ahora: AHORA });

describe('retratoMedido', () => {
  it('cuenta las voces reales por territorio', () => {
    const r = retratoMedido(base([voz('caba', 0), voz('caba', 1), voz('formosa', 0)]), TERRITORIOS);
    expect(r.porTerritorio.get('caba')?.voces.valor).toBe(2);
    expect(r.porTerritorio.get('formosa')?.voces.valor).toBe(1);
  });

  it('todo lo que cuenta viene marcado como medido', () => {
    const r = retratoMedido(base([voz('caba', 0)]), TERRITORIOS);
    expect(r.porTerritorio.get('caba')?.voces.procedencia.tipo).toBe('medido');
  });

  it('un territorio sin población queda fuera de todo total, con su razón', () => {
    const r = retratoMedido(base([voz('caba', 0)]), TERRITORIOS);
    expect(r.sinDato.map((s) => s.territorioId)).toEqual(['vacio']);
    expect(r.sinDato[0]?.razon).toMatch(/población/i);
    expect(r.porTerritorio.has('vacio')).toBe(false);
  });

  it('la cobertura es la fracción de territorios que dejaron de estar mudos', () => {
    // 1 de 2 territorios con dato habla → 0,5. «vacio» no entra al denominador.
    const r = retratoMedido(base([voz('caba', 0)]), TERRITORIOS);
    expect(r.cobertura.valor).toBeCloseTo(0.5);
  });

  it('sin voces, todo es cero y nada explota', () => {
    const r = retratoMedido(base([]), TERRITORIOS);
    expect(r.cobertura.valor).toBe(0);
    expect(r.legitimidad.valor).toBe(0);
    expect(r.alcance.valor).toBe(0);
  });

  it('la legitimidad es alcance por persistencia', () => {
    const r = retratoMedido(base([voz('caba', 0)]), TERRITORIOS);
    expect(r.legitimidad.valor).toBeCloseTo(r.alcance.valor * r.persistencia.valor);
    expect(r.legitimidad.procedencia).toEqual({
      tipo: 'derivado',
      formula: 'alcance × persistencia',
      de: ['alcance', 'persistencia'],
    });
  });

  it('un territorio que cruza el piso y lo sostiene tiene mandato', () => {
    // Formosa: 606.000 hab → umbral 606 voces. Repartidas en 4 meses distintos.
    const muchas = Array.from({ length: 700 }, (_, i) => voz('formosa', i % 4));
    const r = retratoMedido(base(muchas), TERRITORIOS);
    expect(r.porTerritorio.get('formosa')?.veredicto.hay).toBe(true);
  });

  it('un pico que no se sostiene no es mandato', () => {
    // Las mismas 700 voces, todas el mismo mes: 1 período < MINIMO_PERIODOS.
    const pico = Array.from({ length: 700 }, () => voz('formosa', 0));
    const r = retratoMedido(base(pico), TERRITORIOS);
    expect(r.porTerritorio.get('formosa')?.veredicto.hay).toBe(false);
  });
});
