import { describe, expect, it } from 'vitest';

import {
  dibujoDe,
  etiquetaDePrecision,
  haloVisible,
  opacidadLavado,
  precisionValida,
  puntoDeSenal,
} from '../precision';

import type { LocationPrecision } from '@v2/civic-core';

import { MAPA_ALTO, MAPA_ANCHO } from '~/geo/proyeccion.generated';

describe('render honesto de la precisión (spec 1 §5)', () => {
  it('a nivel provincia no hay punto: hay lavado', () => {
    const d = dibujoDe('province');
    expect(d.modo).toBe('lavado');
    expect(d.radio).toBe(0);
    expect(d.radioHalo).toBe(0);
  });

  it('exact se dibuja como punto nítido SIN halo', () => {
    // El halo es incertidumbre dibujada. Si el punto es exacto no hay
    // incertidumbre, así que dibujar un halo sería inventar duda.
    const d = dibujoDe('exact');
    expect(d.modo).toBe('punto');
    expect(d.radioHalo).toBe(0);
    expect(d.radio).toBeGreaterThan(0);
  });

  it('cuanto más gruesa la precisión, más grande el halo', () => {
    const escalonadas: LocationPrecision[] = ['100m', '500m', 'neighborhood', 'city'];
    const halos = escalonadas.map((p) => dibujoDe(p).radioHalo);
    expect(halos).toEqual([...halos].sort((a, b) => a - b));
    expect(new Set(halos).size).toBe(halos.length);
  });

  it('el halo NO tiene piso: a escala país ±100 m es invisible, y eso es la verdad', () => {
    // Tuvo un piso de 3 unidades «para que se vea» y eso hacía que 100m se
    // dibujara idéntico a exact — la mentira que este módulo existe para
    // evitar. Un halo inflado exagera la duda igual que uno ausente la esconde.
    const cien = dibujoDe('100m');
    expect(cien.radioHalo).toBeGreaterThan(0);
    expect(haloVisible(cien, 1)).toBe(false);
  });

  it('el halo aparece al acercarse, que es cuando la diferencia importa', () => {
    const ciudad = dibujoDe('city');
    expect(haloVisible(ciudad, 1)).toBe(false);
    // A 30x — dentro de una provincia chica — ±5 km ya son cuadras distintas.
    expect(haloVisible(ciudad, 30)).toBe(true);
  });

  it('exact nunca muestra halo, por más zoom que se haga', () => {
    const exacto = dibujoDe('exact');
    expect(haloVisible(exacto, 1)).toBe(false);
    expect(haloVisible(exacto, 500)).toBe(false);
  });

  it('solo exact se dibuja nítido — el aspecto carga la certeza a escala país', () => {
    expect(dibujoDe('exact').nitido).toBe(true);
    for (const p of ['100m', '500m', 'neighborhood', 'city', 'province'] as LocationPrecision[]) {
      expect(dibujoDe(p).nitido, p).toBe(false);
    }
  });

  it('cada precisión se nombra en castellano, para la leyenda y el lector de pantalla', () => {
    expect(etiquetaDePrecision('exact')).toMatch(/exacto/);
    expect(etiquetaDePrecision('city')).toMatch(/localidad/);
    expect(etiquetaDePrecision('province')).toMatch(/provincia/);
  });

  it('una precisión desconocida cae en la más gruesa — nunca se finge exactitud', () => {
    expect(precisionValida('cualquier-cosa')).toBe('province');
    expect(precisionValida('')).toBe('province');
    expect(precisionValida('exact')).toBe('exact');
  });
});

describe('opacidad del lavado', () => {
  it('sin señales no se pinta nada', () => {
    expect(opacidadLavado(0)).toBe(0);
    expect(opacidadLavado(-3)).toBe(0);
  });

  it('crece con la cantidad pero tiene techo, para no borrar lo que hay adentro', () => {
    expect(opacidadLavado(10)).toBeGreaterThan(opacidadLavado(1));
    expect(opacidadLavado(10_000)).toBeLessThanOrEqual(0.42);
  });

  it('la diferencia entre pocas señales pesa más que entre muchas', () => {
    const saltoChico = opacidadLavado(10) - opacidadLavado(1);
    const saltoGrande = opacidadLavado(500) - opacidadLavado(400);
    expect(saltoChico).toBeGreaterThan(saltoGrande);
  });
});

describe('puntoDeSenal', () => {
  it('sin coordenada no hay punto', () => {
    expect(puntoDeSenal(null, null)).toBeNull();
    expect(puntoDeSenal(-34.6, null)).toBeNull();
    expect(puntoDeSenal(null, -58.4)).toBeNull();
  });

  it('el Obelisco cae dentro del lienzo', () => {
    const p = puntoDeSenal(-34.6037, -58.3816);
    expect(p).not.toBeNull();
    expect(p?.x).toBeGreaterThan(0);
    expect(p?.x).toBeLessThan(MAPA_ANCHO);
    expect(p?.y).toBeGreaterThan(0);
    expect(p?.y).toBeLessThan(MAPA_ALTO);
  });

  it('Ushuaia cae más al sur y más al oeste que el Obelisco', () => {
    const caba = puntoDeSenal(-34.6037, -58.3816);
    const ushuaia = puntoDeSenal(-54.8019, -68.3029);
    expect(ushuaia?.y).toBeGreaterThan(caba?.y ?? 0);
    expect(ushuaia?.x).toBeLessThan(caba?.x ?? 0);
  });
});
