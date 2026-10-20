import { describe, expect, it } from 'vitest';

import { fraseDeAviso } from '../mirar/avisos';
import { armarItems, dueloQueToca, mirarNuevo, reducirMirar } from '../mirar/recorrido';
import { respuestaDelArrastre, vueloDe } from '../mirar/vuelo';

import type { TandaPila, TarjetaPila } from '@v2/shared';

const tarjeta = (id: string): TarjetaPila => ({
  id,
  texto: `Aporte ${id}`,
  origen: null,
  provincia: null,
  tema: null,
});

describe('el gesto', () => {
  it('más de 90 px a un lado o hacia abajo es una respuesta', () => {
    expect(respuestaDelArrastre(91, 0)).toBe('acuerdo');
    expect(respuestaDelArrastre(-91, 10)).toBe('desacuerdo');
    expect(respuestaDelArrastre(10, 95)).toBe('paso');
    expect(respuestaDelArrastre(80, 80)).toBeNull();
    expect(respuestaDelArrastre(70, 120)).toBeNull();
  });

  it('con movimiento reducido no vuela: sólo se desvanece', () => {
    expect(vueloDe('acuerdo', true)).toEqual({ opacity: 0 });
    expect(vueloDe('paso', true)).toEqual({ opacity: 0 });
    expect(vueloDe('acuerdo', false).x).toBeGreaterThan(0);
    expect(vueloDe('desacuerdo', false).x).toBeLessThan(0);
    expect(vueloDe('paso', false).y).toBeGreaterThan(0);
  });
});

describe('lo que se dice después de contestar', () => {
  it('cuenta a los demás que dijeron lo mismo', () => {
    expect(fraseDeAviso({ valor: 'acuerdo', coinciden: 23, regionCompleta: null })).toBe(
      'Vos y 23 personas más.',
    );
    expect(fraseDeAviso({ valor: 'desacuerdo', coinciden: 4, regionCompleta: null })).toBe(
      'Vos y 4 personas más dijeron que no.',
    );
    expect(fraseDeAviso({ valor: 'acuerdo', coinciden: 1, regionCompleta: null })).toBe(
      'Vos y una persona más.',
    );
    expect(fraseDeAviso({ valor: 'acuerdo', coinciden: 0, regionCompleta: null })).toBe(
      'Sos de los primeros en verlo.',
    );
  });

  it('la región que completa le gana a todo, y con «Paso» no se dice nada', () => {
    expect(
      fraseDeAviso({ valor: 'desacuerdo', coinciden: 9, regionCompleta: { region: 'Patagonia' } }),
    ).toBe('Con tu respuesta, la Patagonia ya cuenta en este aporte.');
    expect(fraseDeAviso({ valor: 'paso', coinciden: null, regionCompleta: null })).toBeNull();
  });
});

describe('el recorrido de la tanda', () => {
  const tanda = (ids: string[], acuerdos: string[] = []): TandaPila => ({
    tarjetas: ids.map(tarjeta),
    estado: {
      provincia: null,
      preguntarProvincia: false,
      yaAporto: false,
      paresComparados: [],
      acuerdos,
    },
  });

  it('la tarjeta de escribir va sexta, o al final si hay menos', () => {
    const seis = armarItems(['1', '2', '3', '4', '5', '6', '7'].map(tarjeta), true);
    expect(seis[5]?.tipo).toBe('escribir');
    const tres = armarItems(['1', '2', '3'].map(tarjeta), true);
    expect(tres.map((i) => i.tipo)).toEqual(['aporte', 'aporte', 'aporte', 'escribir']);
    expect(armarItems([], true)).toEqual([]);
  });

  it('los acuerdos del estado de la tanda cuentan para el duelo si se conoce su texto', () => {
    // «a» se dijo en otra tanda de esta visita; «z» en otra visita y no se conoce.
    let e = reducirMirar(mirarNuevo(), {
      tipo: 'empezar',
      tanda: tanda(['a']),
      desdeImaginar: true,
    });
    e = reducirMirar(e, { tipo: 'respondio', valor: 'acuerdo' });
    e = reducirMirar(e, { tipo: 'avanzar' });
    e = reducirMirar(e, {
      tipo: 'empezar',
      tanda: tanda(['b', 'c', 'd', 'f'], ['z', 'a']),
      desdeImaginar: true,
    });
    for (const valor of ['acuerdo', 'desacuerdo', 'paso'] as const) {
      e = reducirMirar(e, { tipo: 'respondio', valor });
      e = reducirMirar(e, { tipo: 'avanzar' });
    }
    e = reducirMirar(e, { tipo: 'respondio', valor: 'paso' });
    const t = e.tanda;
    expect(t && dueloQueToca(t, e.servidor, e.sesion)?.map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('reportar no cuenta como respuesta ni deja el aporte para un duelo', () => {
    let e = reducirMirar(mirarNuevo(), {
      tipo: 'empezar',
      tanda: tanda(['a', 'b']),
      desdeImaginar: true,
    });
    e = reducirMirar(e, { tipo: 'reporto' });
    expect(e.tanda?.respondidas).toBe(0);
    expect(e.tanda?.indice).toBe(1);
    expect(e.sesion.reportados).toEqual(['a']);
    expect(e.tanda?.vistos.map((v) => v.valor)).toEqual(['reportado']);
  });
});
