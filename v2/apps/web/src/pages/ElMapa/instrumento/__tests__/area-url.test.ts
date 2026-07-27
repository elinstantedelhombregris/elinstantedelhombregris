import { describe, expect, it } from 'vitest';

import {
  codificarArea,
  decodificarArea,
  escribirAreaEnHash,
  leerAreaDelHash,
  simplificar,
} from '../area-url';

import type { GeoPoint } from '@v2/civic-core';

const AREA: GeoPoint[] = [
  { lat: -34.58, lng: -58.42 },
  { lat: -34.58, lng: -58.36 },
  { lat: -34.63, lng: -58.36 },
  { lat: -34.63, lng: -58.42 },
];

/** Un trazo a mano alzada real: cientos de vértices. */
const trazoLargo = (n: number): GeoPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    lat: -34.6 + Math.sin(i / 12) * 0.03,
    lng: -58.4 + Math.cos(i / 12) * 0.03,
  }));

describe('el área citable (spec 3 §5.5)', () => {
  it('ida y vuelta: lo que se codifica se recupera', () => {
    const vuelta = decodificarArea(codificarArea(AREA));
    expect(vuelta).toHaveLength(AREA.length);
    vuelta.forEach((punto, i) => {
      expect(punto.lat).toBeCloseTo(AREA[i]?.lat ?? 0, 4);
      expect(punto.lng).toBeCloseTo(AREA[i]?.lng ?? 0, 4);
    });
  });

  it('un trazo de 400 vértices entra en una URL manejable', () => {
    const codificada = codificarArea(trazoLargo(400));
    expect(decodificarArea(codificada).length).toBeLessThanOrEqual(60);
    // ~5 caracteres por vértice: un lazo a mano alzada sin simplificar haría
    // una URL de miles de caracteres que muchos clientes truncan.
    expect(codificada.length).toBeLessThan(700);
  });

  it('la simplificación conserva el primero y el último vértice', () => {
    const trazo = trazoLargo(400);
    const simple = simplificar(trazo);
    expect(simple[0]).toEqual(trazo[0]);
    expect(simple[simple.length - 1]).toEqual(trazo[trazo.length - 1]);
  });

  it('un polígono corto no se toca', () => {
    expect(simplificar(AREA)).toEqual(AREA);
  });

  it('basura en la URL devuelve vacío en vez de romper la página', () => {
    expect(decodificarArea('no-es-una-polilinea!!!')).toEqual([]);
    expect(decodificarArea('')).toEqual([]);
    expect(decodificarArea('@@@')).toEqual([]);
  });

  it('menos de tres vértices no es un área', () => {
    const dos = codificarArea([
      { lat: -34.6, lng: -58.4 },
      { lat: -34.61, lng: -58.41 },
    ]);
    expect(decodificarArea(dos)).toEqual([]);
  });
});

describe('el hash de la página', () => {
  it('escribir y leer devuelve el mismo recorte y las mismas capas', () => {
    const hash = escribirAreaEnHash(AREA, ['voz', 'pulso']);
    expect(hash.startsWith('#instrumento?')).toBe(true);

    const leido = leerAreaDelHash(hash);
    expect(leido?.capas).toEqual(['voz', 'pulso']);
    expect(leido?.poligono).toHaveLength(4);
  });

  it('un hash sin área devuelve null — el instrumento abre vacío', () => {
    expect(leerAreaDelHash('#instrumento')).toBeNull();
    expect(leerAreaDelHash('')).toBeNull();
    expect(leerAreaDelHash('#instrumento?capas=voz')).toBeNull();
  });

  it('un área corrupta devuelve null en vez de dibujar cualquier cosa', () => {
    expect(leerAreaDelHash('#instrumento?area=%40%40%40')).toBeNull();
  });
});
