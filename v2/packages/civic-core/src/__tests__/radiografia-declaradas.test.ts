import { describe, expect, it } from 'vitest';

import { TECHO_ADHESIONES_POR_ACTOR, aristasDeclaradas } from '../radiografia/grafo.js';

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

  it('NUNCA une dos señales por el solo hecho de compartir autor', () => {
    // El bug que este test existe para que no vuelva: las bolsas de adheridas
    // y firmadas estaban mezcladas, así que una vez que el autor adhería a
    // cualquier cosa, todas SUS señales se cruzaban entre sí. La spec §4.5.2
    // habilita co-adhesión y adhesión del autor — nunca firmada × firmada.
    const aristas = aristasDeclaradas(
      [{ actorId: 'act1', senalId: 'ajena' }],
      new Map([
        ['mia1', 'act1'],
        ['mia2', 'act1'],
        ['mia3', 'act1'],
      ]),
    );
    const pares = aristas.map((e) => `${e.a}-${e.b}`).sort();

    // Sólo las tres legítimas: cada señal firmada con la ajena que adhirió.
    expect(pares).toEqual(['ajena-mia1', 'ajena-mia2', 'ajena-mia3']);
    expect(pares).not.toContain('mia1-mia2');
    expect(pares).not.toContain('mia1-mia3');
    expect(pares).not.toContain('mia2-mia3');
  });

  it('un autor que no adhirió a nada no aporta ninguna arista', () => {
    expect(aristasDeclaradas([], new Map([['mia1', 'act1'], ['mia2', 'act1']]))).toEqual([]);
  });

  it('pone techo a las adhesiones de un solo actor, para no explotar en O(m²)', () => {
    // Medido antes del techo: 4.000 adhesiones de un mismo actor daban
    // 7.998.000 aristas y ~3,6 GB de heap.
    const muchas = Array.from({ length: TECHO_ADHESIONES_POR_ACTOR + 50 }, (_, i) => ({
      actorId: 'act1',
      senalId: `s${String(i).padStart(4, '0')}`,
    }));
    const aristas = aristasDeclaradas(muchas, new Map());
    const techo = TECHO_ADHESIONES_POR_ACTOR;

    expect(aristas).toHaveLength((techo * (techo - 1)) / 2);
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
