import { describe, expect, it } from 'vitest';

import { PROVINCIAS_REF } from '../poblacion.js';
import { NOMBRES_DE_PROVINCIA, PROVINCIAS_CANONICAS } from '../provincias-canonicas.js';

/**
 * La lista de las 24, ahora que es una sola y la leen cuatro consumidores que
 * no pueden importarla uno del otro: el seed, el relleno, el test de la
 * migración y el test del mapa de la web.
 *
 * Lo que se afirma acá es lo que los otros cuatro dan por hecho. Ninguno de
 * ellos puede notar un `georefId` repetido o un nombre duplicado: el seed
 * insertaría 23 filas y diría 24, y el mapa pintaría una provincia dos veces.
 */
describe('PROVINCIAS_CANONICAS', () => {
  it('son 24, y ni el nombre ni el ISO ni el id del Estado se repiten', () => {
    expect(PROVINCIAS_CANONICAS).toHaveLength(24);
    for (const clave of ['name', 'isoCode', 'georefId'] as const) {
      const valores = PROVINCIAS_CANONICAS.map((provincia) => provincia[clave]);
      expect(new Set(valores).size, clave).toBe(24);
      expect(
        valores.filter((valor) => valor.trim() === ''),
        clave,
      ).toEqual([]);
    }
  });

  it('el `georefId` es el código de dos dígitos del INDEC', () => {
    // Es la clave por la que reconcilia el seed y la que lleva el `ON CONFLICT`.
    // Un id de tres dígitos o con un espacio adelante no falla al insertar:
    // falla al reconciliar, que es un año después y en otra corrida.
    for (const provincia of PROVINCIAS_CANONICAS) {
      expect(provincia.georefId, provincia.name).toMatch(/^[0-9]{2}$/);
    }
  });

  it('las coordenadas son números que caen adentro del país', () => {
    for (const provincia of PROVINCIAS_CANONICAS) {
      const lat = Number(provincia.latitude);
      const lng = Number(provincia.longitude);
      expect(Number.isFinite(lat) && Number.isFinite(lng), provincia.name).toBe(true);
      expect(lat, provincia.name).toBeGreaterThan(-56);
      expect(lat, provincia.name).toBeLessThan(-21);
      expect(lng, provincia.name).toBeGreaterThan(-74);
      expect(lng, provincia.name).toBeLessThan(-53);
    }
  });

  it('`NOMBRES_DE_PROVINCIA` son los mismos nombres, ordenados en castellano', () => {
    expect([...NOMBRES_DE_PROVINCIA].sort()).toEqual(
      [...PROVINCIAS_CANONICAS.map((provincia) => provincia.name)].sort(),
    );
    // El orden del castellano no es el de los code points: «Córdoba» va antes
    // que «Corrientes» porque la `ó` se ordena como una `o`, y por code point
    // U+00F3 está después de toda la ASCII.
    expect(NOMBRES_DE_PROVINCIA.indexOf('Córdoba')).toBeLessThan(
      NOMBRES_DE_PROVINCIA.indexOf('Corrientes'),
    );
  });

  it('la tabla de población habla de las mismas 24 y con los mismos nombres', () => {
    // `PROVINCIAS_REF` se llavea por nombre canónico y `habitantesDeCelda`
    // devuelve `null` cuando no encuentra la clave — o sea que una divergencia
    // de un solo caracter no rompe nada: apaga el brillo de una provincia
    // entera y no lo dice. Las dos tablas viven en este paquete desde que la
    // lista dejó de estar en `packages/db`, así que la afirmación ahora se
    // puede escribir.
    expect(Object.keys(PROVINCIAS_REF).sort()).toEqual([...NOMBRES_DE_PROVINCIA].sort());
  });
});
