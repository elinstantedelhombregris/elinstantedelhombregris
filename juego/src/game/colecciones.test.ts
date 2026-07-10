import { describe, expect, it } from 'vitest';
import { CONSTELACIONES } from '../content/constelaciones';
import {
  completadasAlAgregar,
  computeColecciones,
  expandirReceta,
  puntosDeConstelacion,
} from './colecciones';
import type { ConstelacionReceta, Star, TipoEstrella } from './types';

let seq = 0;
const star = (
  tipo: TipoEstrella,
  extra?: Partial<Pick<Star, 'id' | 'createdAt' | 'constelacionId'>>,
): Star => ({
  id: extra?.id ?? `s${String(seq).padStart(3, '0')}`,
  tipo,
  texto: null,
  photoUri: null,
  lat: null,
  lng: null,
  fundadora: false,
  nocturna: false,
  fugaz: false,
  expeditionId: null,
  expeditionStepKey: null,
  constelacionId: extra?.constelacionId ?? null,
  createdAt: extra?.createdAt ?? `2026-07-01T10:${String(seq++).padStart(2, '0')}:00Z`,
});

const receta = (
  id: string,
  r: ConstelacionReceta['receta'],
): ConstelacionReceta => ({ id, receta: r });

describe('computeColecciones — progreso', () => {
  it('receta satisfecha exactamente → completada, sin faltantes', () => {
    const stars = [star('need'), star('need'), star('recurso')];
    const { progresos } = computeColecciones(stars, [
      receta('cuidado', { need: 2, recurso: 1 }),
    ]);
    expect(progresos[0]).toEqual({
      constelacionId: 'cuidado',
      completada: true,
      porTipo: { need: { tiene: 2, necesita: 2 }, recurso: { tiene: 1, necesita: 1 } },
      faltantes: {},
    });
  });

  it('progreso parcial reporta faltantes por tipo', () => {
    const { progresos } = computeColecciones(
      [star('need')],
      [receta('cuidado', { need: 2, value: 1 })],
    );
    expect(progresos[0]!.completada).toBe(false);
    expect(progresos[0]!.porTipo).toEqual({
      need: { tiene: 1, necesita: 2 },
      value: { tiene: 0, necesita: 1 },
    });
    expect(progresos[0]!.faltantes).toEqual({ need: 1, value: 1 });
  });

  it('el excedente no infla: tiene se recorta a necesita', () => {
    const stars = [star('dream'), star('dream'), star('dream')];
    const { progresos } = computeColecciones(stars, [receta('c', { dream: 2 })]);
    expect(progresos[0]!.porTipo.dream).toEqual({ tiene: 2, necesita: 2 });
  });

  it('las estrellas de amistad no cuentan para ninguna receta', () => {
    const { progresos } = computeColecciones(
      [star('amistad'), star('amistad')],
      [receta('c', { need: 1 })],
    );
    expect(progresos[0]!.porTipo.need).toEqual({ tiene: 0, necesita: 1 });
  });
});

describe('computeColecciones — asignación greedy cronológica', () => {
  it('una completada consume sus estrellas: no se reutilizan', () => {
    const stars = [star('need'), star('need'), star('need')];
    const { progresos, asignaciones } = computeColecciones(stars, [
      receta('a', { need: 2 }),
      receta('b', { need: 2 }),
    ]);
    expect(progresos[0]!.completada).toBe(true);
    expect(progresos[1]!.completada).toBe(false);
    expect(progresos[1]!.porTipo.need).toEqual({ tiene: 1, necesita: 2 });
    expect(progresos[1]!.faltantes).toEqual({ need: 1 });
    expect(Object.values(asignaciones).filter((c) => c === 'a')).toHaveLength(2);
  });

  it('consume las más antiguas (createdAt ascendente)', () => {
    const vieja = star('need', { id: 'vieja', createdAt: '2026-07-01T00:00:00Z' });
    const media = star('need', { id: 'media', createdAt: '2026-07-02T00:00:00Z' });
    const nueva = star('need', { id: 'nueva', createdAt: '2026-07-03T00:00:00Z' });
    const { asignaciones } = computeColecciones(
      [nueva, vieja, media], // orden de entrada revuelto a propósito
      [receta('a', { need: 2 })],
    );
    expect(asignaciones).toEqual({ vieja: 'a', media: 'a' });
  });

  it('el orden de contenido decide quién completa cuando ambas podrían', () => {
    const stars = [star('basta'), star('basta')];
    const { progresos } = computeColecciones(stars, [
      receta('primera', { basta: 2 }),
      receta('segunda', { basta: 2 }),
    ]);
    expect(progresos.map((p) => p.completada)).toEqual([true, false]);
  });

  it('las incompletas comparten el pool libre entre sí', () => {
    const stars = [star('value')];
    const { progresos } = computeColecciones(stars, [
      receta('a', { value: 2 }),
      receta('b', { value: 3 }),
    ]);
    // Ninguna completa: la misma estrella libre les muestra progreso a ambas.
    expect(progresos[0]!.porTipo.value).toEqual({ tiene: 1, necesita: 2 });
    expect(progresos[1]!.porTipo.value).toEqual({ tiene: 1, necesita: 3 });
  });

  it('mismo cielo → misma asignación (determinismo)', () => {
    const stars = [star('need'), star('recurso'), star('need'), star('value')];
    const cs = [receta('a', { need: 2 }), receta('b', { recurso: 1, value: 1 })];
    const r1 = computeColecciones(stars, cs);
    const r2 = computeColecciones([...stars].reverse(), cs);
    expect(r1.asignaciones).toEqual(r2.asignaciones);
  });
});

describe('computeColecciones — completación pegajosa', () => {
  it('las estrellas persistidas con constelacionId no se pueden robar', () => {
    // 'a' viene antes en el contenido y pide 2 need; 'b' ya completó con la
    // need persistida. 'a' NO se la roba aunque tenga prioridad de orden.
    const persistida = star('need', { id: 'de-b', constelacionId: 'b' });
    const libre = star('need', { id: 'libre' });
    const { progresos, asignaciones } = computeColecciones(
      [persistida, libre],
      [receta('a', { need: 2 }), receta('b', { need: 1 })],
    );
    expect(progresos[0]!.completada).toBe(false);
    expect(progresos[0]!.porTipo.need).toEqual({ tiene: 1, necesita: 2 });
    expect(progresos[1]!.completada).toBe(true);
    expect(asignaciones).toEqual({}); // nada nuevo para persistir
  });

  it('asignaciones devuelve SOLO lo nuevo (lo persistido no se repite)', () => {
    const yaAsignada = star('need', { id: 'vieja', constelacionId: 'c' });
    const libre = star('recurso', { id: 'fresca' });
    const { asignaciones } = computeColecciones(
      [yaAsignada, libre],
      [receta('c', { need: 1, recurso: 1 })],
    );
    expect(asignaciones).toEqual({ fresca: 'c' });
  });
});

describe('completadasAlAgregar', () => {
  it('detecta la constelación recién completada', () => {
    const antes = [star('need')];
    const nueva = star('recurso');
    const ids = completadasAlAgregar(antes, nueva, [
      receta('cuidado', { need: 1, recurso: 1 }),
    ]);
    expect(ids).toEqual(['cuidado']);
  });

  it('agregar una estrella jamás des-completa lo ya completado', () => {
    // Antes: 'b' completa (consume la única need). Llega otra need: 'a'
    // (prioritaria en orden, pide 2) no le roba a 'b' — y no completa nada.
    const antes = [star('need')];
    const nueva = star('need');
    const cs = [receta('a', { need: 2 }), receta('b', { need: 1 })];
    expect(completadasAlAgregar(antes, nueva, cs)).toEqual([]);
  });

  it('la estrella nueva se consume una sola vez entre recetas rivales', () => {
    const antes = [star('need'), star('value')];
    const nueva = star('recurso');
    const ids = completadasAlAgregar(antes, nueva, [
      receta('a', { need: 1, recurso: 1 }),
      receta('b', { value: 1, recurso: 1 }),
    ]);
    // 'a' consume la recurso nueva; a 'b' le sigue faltando una recurso.
    expect(ids).toEqual(['a']);
  });

  it('si no completa nada, lista vacía', () => {
    expect(
      completadasAlAgregar([], star('need'), [receta('a', { need: 2 })]),
    ).toEqual([]);
  });
});

describe('expandirReceta + puntosDeConstelacion — la silueta del álbum', () => {
  it('expande en orden canónico de señal', () => {
    expect(expandirReceta({ recurso: 1, need: 2, dream: 1 })).toEqual([
      'dream',
      'need',
      'need',
      'recurso',
    ]);
  });

  it('los primeros `tiene` puntos de cada tipo se encienden', () => {
    const puntos = puntosDeConstelacion(
      { need: 3, value: 1 },
      { need: { tiene: 2, necesita: 3 }, value: { tiene: 0, necesita: 1 } },
    );
    expect(puntos).toEqual([
      { tipo: 'need', encendido: true },
      { tipo: 'need', encendido: true },
      { tipo: 'need', encendido: false },
      { tipo: 'value', encendido: false },
    ]);
  });

  it('progreso vacío → todo apagado; completo → todo encendido', () => {
    const receta = { basta: 2 } as const;
    expect(puntosDeConstelacion(receta, {}).every((p) => !p.encendido)).toBe(true);
    expect(
      puntosDeConstelacion(receta, { basta: { tiene: 2, necesita: 2 } }).every(
        (p) => p.encendido,
      ),
    ).toBe(true);
  });

  it('las 8 constelaciones del contenido llenan su silueta exacta', () => {
    expect(CONSTELACIONES).toHaveLength(8);
    for (const c of CONSTELACIONES) {
      expect(expandirReceta(c.receta)).toHaveLength(c.silueta.length);
    }
  });
});
