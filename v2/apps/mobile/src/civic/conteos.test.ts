import { planTerritorialCoverage } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { conteosPorCelda, type SenalParaConteo } from './conteos';

/**
 * `planTerritorialCoverage` devuelve `CoveragePlan`, NO `CoveragePlan | null`:
 * ante una entrada mala devuelve un plan inválido, no ausencia. Así que no
 * lleva guarda de nulidad — el lint la marcaría como condición innecesaria.
 */
const plan = () =>
  planTerritorialCoverage(
    { points: [
      { lat: -34.62, lng: -58.45 },
      { lat: -34.58, lng: -58.45 },
      { lat: -34.58, lng: -58.37 },
      { lat: -34.62, lng: -58.37 },
    ] },
    { cellCount: 4 },
  );

/** Un punto adentro de la primera celda del plan. */
const enPrimeraCelda = (p: ReturnType<typeof plan>) => {
  const c = p.cells[0];
  if (!c) throw new Error('debería haber celda');
  return c.center;
};

const senal = (parcial: Partial<SenalParaConteo> & Pick<SenalParaConteo, 'lat' | 'lng'>): SenalParaConteo => ({
  actorKey: 'actor-1',
  verificable: false,
  confirmada: false,
  ...parcial,
});

describe('conteosPorCelda', () => {
  it('devuelve un conteo por celda del plan, en el mismo orden', () => {
    const p = plan();
    const conteos = conteosPorCelda([], p.cells, () => 'Córdoba');
    expect(conteos).toHaveLength(p.cells.length);
    expect(conteos.map((c) => c.cellId)).toEqual(p.cells.map((c) => c.id));
  });

  it('cuenta personas distintas, no señales', () => {
    const p = plan();
    const punto = enPrimeraCelda(p);
    const conteos = conteosPorCelda(
      [
        senal({ ...punto, actorKey: 'ana' }),
        senal({ ...punto, actorKey: 'ana' }),
        senal({ ...punto, actorKey: 'ana' }),
        senal({ ...punto, actorKey: 'beto' }),
      ],
      p.cells,
      () => 'Córdoba',
    );
    const primera = conteos[0];
    if (!primera) throw new Error('debería haber conteo');
    expect(primera.vocesDistintas).toBe(2);
  });

  it('una deliberable cuenta para las voces pero no para las verificables', () => {
    const p = plan();
    const punto = enPrimeraCelda(p);
    const conteos = conteosPorCelda(
      [senal({ ...punto, actorKey: 'ana', verificable: false })],
      p.cells,
      () => 'Córdoba',
    );
    const primera = conteos[0];
    if (!primera) throw new Error('debería haber conteo');
    expect(primera.vocesDistintas).toBe(1);
    expect(primera.verificables).toBe(0);
  });

  it('cuenta verificables y confirmaciones por separado', () => {
    const p = plan();
    const punto = enPrimeraCelda(p);
    const conteos = conteosPorCelda(
      [
        senal({ ...punto, actorKey: 'ana', verificable: true, confirmada: true }),
        senal({ ...punto, actorKey: 'beto', verificable: true, confirmada: false }),
      ],
      p.cells,
      () => 'Córdoba',
    );
    const primera = conteos[0];
    if (!primera) throw new Error('debería haber conteo');
    expect(primera.verificables).toBe(2);
    expect(primera.confirmaciones).toBe(1);
  });

  it('una señal fuera del plan no entra en ninguna celda', () => {
    const p = plan();
    const conteos = conteosPorCelda(
      [senal({ lat: 10, lng: 10, actorKey: 'ana' })],
      p.cells,
      () => 'Córdoba',
    );
    expect(conteos.every((c) => c.vocesDistintas === 0)).toBe(true);
  });

  it('sin provincia resuelta la celda queda sin denominador, no en cero', () => {
    const p = plan();
    const conteos = conteosPorCelda([], p.cells, () => null);
    expect(conteos.every((c) => c.habitantes === null)).toBe(true);
  });
});
