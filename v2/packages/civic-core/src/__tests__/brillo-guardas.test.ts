import { describe, expect, it } from 'vitest';

import { brilloDeCelda, intensidadDeBrillo, luzDeCelda, nitidezDeCelda, type ConteoCelda } from '../brillo.js';

import { conteo } from './_conteo.js';

describe('guardas de la luz', () => {
  /**
   * Regla 8 de la Constitución: las recompensas premian utilidad, no volumen
   * bruto. `ConteoCelda` no tiene un campo de «señales» a propósito — si
   * alguien lo agrega y el brillo empieza a usarlo, esta guarda no alcanza a
   * verlo, pero el contrato de tipos sí.
   */
  it('una persona sola pesa menos que cinco personas', () => {
    const unaPersona = intensidadDeBrillo(brilloDeCelda(conteo({ vocesDistintas: 1 })));
    const cincoPersonas = intensidadDeBrillo(brilloDeCelda(conteo({ vocesDistintas: 5 })));
    expect(unaPersona).not.toBeNull();
    expect(cincoPersonas).not.toBeNull();
    if (unaPersona === null || cincoPersonas === null) return;
    expect(cincoPersonas).toBeGreaterThan(unaPersona);
  });

  /**
   * Spec §3, R3: las deliberables no son un residuo. Una voz que deja un
   * sueño enciende la celda igual que una que reporta una farola rota. Si no
   * encendiera, serían decoración.
   */
  it('una voz deliberable enciende igual que una verificable', () => {
    const soloSuenos = luzDeCelda(conteo({ vocesDistintas: 10, verificables: 0 }));
    const soloHechos = luzDeCelda(conteo({ vocesDistintas: 10, verificables: 10, confirmaciones: 0 }));
    expect(soloSuenos.intensidad).toBe(soloHechos.intensidad);
  });

  /**
   * Spec §6.1: una celda sin denominador nunca se dibuja oscura, porque
   * oscuro ya significa «nadie habló».
   */
  it('no saber cuánta gente vive acá nunca se confunde con que nadie habló', () => {
    const nadieHablo = luzDeCelda(conteo({ vocesDistintas: 0, habitantes: 1000 }));
    const noSabemos = luzDeCelda(conteo({ vocesDistintas: 50, habitantes: null }));
    expect(nadieHablo.intensidad).toBe(0);
    expect(noSabemos.intensidad).toBeNull();
    expect(nadieHablo.intensidad).not.toBe(noSabemos.intensidad);
  });

  /**
   * Spec §6: brillo y nitidez son independientes. El caso que un solo número
   * no puede contar es la celda encendida y borrosa.
   */
  it('encendida y borrosa es un estado representable', () => {
    const luz = luzDeCelda(conteo({
      vocesDistintas: 50, habitantes: 1000, verificables: 8, confirmaciones: 0,
    }));
    expect(luz.intensidad).toBeGreaterThan(0.5);
    expect(luz.nitidez.tipo).toBe('valor');
    if (luz.nitidez.tipo !== 'valor') return;
    expect(luz.nitidez.fraccion).toBe(0);
  });

  /** Ningún resultado sale sin poder decir de dónde vino. */
  it('todo valor viaja con su fórmula o con su razón', () => {
    const casos: ConteoCelda[] = [
      conteo({ vocesDistintas: 5, verificables: 2, confirmaciones: 1 }),
      conteo({ habitantes: null }),
      conteo({ verificables: 0 }),
    ];
    for (const c of casos) {
      const b = brilloDeCelda(c);
      const n = nitidezDeCelda(c);
      expect(b.tipo === 'valor' ? b.formula : b.razon).toBeTruthy();
      expect(n.tipo === 'valor' ? n.formula : n.razon).toBeTruthy();
    }
  });
});
