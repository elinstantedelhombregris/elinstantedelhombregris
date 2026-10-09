import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLugarSincronizado } from './useLugarSincronizado';

import type { LugarMapa } from '~/pages/ElMapa/instrumento/BusquedaTerritorial';

const lugar = (id: number, name: string): LugarMapa => ({
  id,
  provinceId: id,
  name,
  level: 'province',
  latitude: null,
  longitude: null,
});
/** Las props del hook admiten un lugar o ninguno; sin esto TypeScript infiere solo «un lugar». */
const inicial = (l: LugarMapa | null): { l: LugarMapa | null } => ({ l });
const mendoza = lugar(50, 'Mendoza');
const cordoba = lugar(14, 'Córdoba');

describe('useLugarSincronizado', () => {
  it('arranca con el lugar del mapa, sin aviso', () => {
    const { result } = renderHook(({ l }) => useLugarSincronizado(l), {
      initialProps: inicial(mendoza),
    });
    expect(result.current.lugar).toBe(mendoza);
    expect(result.current.aviso).toBeNull();
  });

  it('cuando el mapa cambia de lugar lo toma y avisa que cambió', () => {
    const { result, rerender } = renderHook(({ l }) => useLugarSincronizado(l), {
      initialProps: inicial(mendoza),
    });
    rerender({ l: cordoba });
    expect(result.current.lugar).toBe(cordoba);
    expect(result.current.aviso).toBe('Cambiaste de lugar: ahora es Córdoba.');
  });

  it('el primer lugar que llega después de no tener ninguno no es un cambio: no avisa', () => {
    const { result, rerender } = renderHook(({ l }) => useLugarSincronizado(l), {
      initialProps: inicial(null),
    });
    rerender({ l: mendoza });
    expect(result.current.lugar).toBe(mendoza);
    expect(result.current.aviso).toBeNull();
  });

  it('si el mapa deja de mirar un lugar, el aporte vuelve a ser de todo el país y lo avisa', () => {
    const { result, rerender } = renderHook(({ l }) => useLugarSincronizado(l), {
      initialProps: inicial(mendoza),
    });
    rerender({ l: null });
    expect(result.current.lugar).toBeNull();
    expect(result.current.aviso).toBe('Cambiaste de lugar: ahora es todo el país.');
  });

  it('el mismo lugar con otra identidad de objeto no pisa una elección hecha a mano', () => {
    const { result, rerender } = renderHook(({ l }) => useLugarSincronizado(l), {
      initialProps: inicial(mendoza),
    });
    act(() => {
      result.current.elegir(null);
    });
    expect(result.current.lugar).toBeNull();
    rerender({ l: { ...mendoza } });
    expect(result.current.lugar).toBeNull();
    expect(result.current.aviso).toBeNull();
  });

  it('elegir a mano apaga el aviso', () => {
    const { result, rerender } = renderHook(({ l }) => useLugarSincronizado(l), {
      initialProps: inicial(mendoza),
    });
    rerender({ l: cordoba });
    expect(result.current.aviso).not.toBeNull();
    act(() => {
      result.current.elegir(mendoza);
    });
    expect(result.current.lugar).toBe(mendoza);
    expect(result.current.aviso).toBeNull();
  });
});
