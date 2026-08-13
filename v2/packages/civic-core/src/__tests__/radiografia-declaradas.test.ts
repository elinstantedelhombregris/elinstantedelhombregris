import { describe, expect, it } from 'vitest';

import { aristasDeclaradas } from '../radiografia/grafo.js';

import type { Adhesion } from '../radiografia/tipos.js';

describe('aristas declaradas', () => {
  it('une dos señales a las que adhirió el mismo actor', () => {
    const adhesiones: readonly Adhesion[] = [
      { actorId: 'act1', senalId: 's1' },
      { actorId: 'act1', senalId: 's2' },
    ];
    const aristas = aristasDeclaradas(adhesiones, new Map());

    expect(aristas).toEqual([{ a: 's1', b: 's2', actores: 1 }]);
  });

  it('une la señal que alguien firma con la que ese mismo alguien adhiere', () => {
    const aristas = aristasDeclaradas(
      [{ actorId: 'act1', senalId: 's2' }],
      new Map([['s1', 'act1']]),
    );

    expect(aristas).toEqual([{ a: 's1', b: 's2', actores: 1 }]);
  });

  it('cuenta ACTORES DISTINTOS y no filas', () => {
    const adhesiones: readonly Adhesion[] = [
      { actorId: 'act1', senalId: 's1' },
      { actorId: 'act1', senalId: 's2' },
      { actorId: 'act1', senalId: 's1' }, // repetida: no suma
      { actorId: 'act2', senalId: 's1' },
      { actorId: 'act2', senalId: 's2' },
    ];
    const [arista] = aristasDeclaradas(adhesiones, new Map());

    expect(arista?.actores).toBe(2);
  });

  it('no emite una arista de una señal consigo misma', () => {
    const aristas = aristasDeclaradas(
      [{ actorId: 'act1', senalId: 's1' }],
      new Map([['s1', 'act1']]),
    );

    expect(aristas).toEqual([]);
  });

  it('devuelve vacío cuando un actor adhirió a una sola señal y no firmó ninguna', () => {
    expect(aristasDeclaradas([{ actorId: 'act1', senalId: 's1' }], new Map())).toEqual([]);
  });

  it('devuelve los pares ordenados y sin repetir', () => {
    const aristas = aristasDeclaradas(
      [
        { actorId: 'act1', senalId: 'z' },
        { actorId: 'act1', senalId: 'a' },
      ],
      new Map(),
    );

    expect(aristas).toEqual([{ a: 'a', b: 'z', actores: 1 }]);
  });
});
