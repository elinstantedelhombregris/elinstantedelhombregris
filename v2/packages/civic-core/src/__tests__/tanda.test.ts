import { describe, expect, it } from 'vitest';

import { armarTanda, type CandidatoDeTanda } from '../pila/tanda.js';

const c = (id: string, over: Partial<CandidatoDeTanda> = {}): CandidatoDeTanda => ({
  id,
  respuestas: 10,
  opinionesDeMiRegion: 10,
  publicadaEn: '2026-10-01T00:00:00.000Z',
  tema: null,
  provinciaIso: 'AR-B',
  ...over,
});

describe('armarTanda', () => {
  it('pone primero los aportes con menos respuestas', () => {
    const t = armarTanda(
      [c('a', { respuestas: 30 }), c('b', { respuestas: 2 }), c('c', { respuestas: 9 })],
      { provinciaIso: null },
    );
    expect(t).toEqual(['b', 'c', 'a']);
  });

  it('la falta de mi región le gana a la cantidad de respuestas', () => {
    const t = armarTanda(
      [
        c('poco', { respuestas: 1, opinionesDeMiRegion: 9 }),
        c('falta', { respuestas: 80, opinionesDeMiRegion: 4, provinciaIso: 'AR-A' }),
      ],
      { provinciaIso: 'AR-Y' },
    );
    expect(t[0]).toBe('falta');
  });

  it('sin región conocida no hay urgencia por región', () => {
    const t = armarTanda(
      [
        c('poco', { respuestas: 1, opinionesDeMiRegion: 0 }),
        c('mucho', { respuestas: 80, opinionesDeMiRegion: 0 }),
      ],
      { provinciaIso: null },
    );
    expect(t).toEqual(['poco', 'mucho']);
  });

  it('el tercer lugar prefiere mi provincia y después mi región', () => {
    const base = [
      c('1', { respuestas: 1 }),
      c('2', { respuestas: 2 }),
      c('3', { respuestas: 3 }),
      c('4', { respuestas: 4 }),
    ];
    const conProvincia = armarTanda(
      [...base, c('jujuy', { respuestas: 50, provinciaIso: 'AR-Y' })],
      { provinciaIso: 'AR-Y' },
    );
    expect(conProvincia[2]).toBe('jujuy');
    const conRegion = armarTanda([...base, c('salta', { respuestas: 50, provinciaIso: 'AR-A' })], {
      provinciaIso: 'AR-Y',
    });
    expect(conRegion[2]).toBe('salta');
  });

  it('no pone cuatro seguidos del mismo tema si hay alternativa', () => {
    const lista = ['a', 'b', 'c', 'd', 'e'].map((id, i) => c(id, { respuestas: i, tema: 'salud' }));
    const t = armarTanda([...lista, c('otro', { respuestas: 99, tema: 'vivienda' })], {
      provinciaIso: null,
    });
    expect(t.slice(0, 4)).toEqual(['a', 'b', 'c', 'otro']);
  });

  it('con menos candidatos que el tamaño devuelve todos, y es determinista', () => {
    const lista = [
      c('x', { respuestas: 3 }),
      c('y', { respuestas: 3, publicadaEn: '2026-09-01T00:00:00.000Z' }),
    ];
    expect(armarTanda(lista, { provinciaIso: null })).toEqual(['y', 'x']);
    expect(armarTanda(lista, { provinciaIso: null })).toEqual(
      armarTanda([...lista].reverse(), { provinciaIso: null }),
    );
  });

  it('respeta el tamaño', () => {
    const lista = Array.from({ length: 25 }, (_, i) =>
      c(`a${String(i).padStart(2, '0')}`, { respuestas: i }),
    );
    expect(armarTanda(lista, { provinciaIso: null })).toHaveLength(10);
  });
});
