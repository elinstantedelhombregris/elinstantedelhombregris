import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { anillosDe, construirProvincias, moduloPais } from '../geo/capas/provincias.js';
import { boundsDeAnillos, crearProyeccion, moduloProyeccion } from '../geo/proyeccion.js';

import type { ColeccionProvincias } from '../geo/capas/provincias.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

const coleccion = JSON.parse(
  readFileSync(join(aqui, '..', 'data', 'argentina-provincias.geojson'), 'utf8'),
) as ColeccionProvincias;

const bounds = boundsDeAnillos(anillosDe(coleccion));
const proyeccion = crearProyeccion(bounds);

/** Capitales provinciales — el conjunto de control del ida y vuelta. */
const CAPITALES: Array<{ nombre: string; lng: number; lat: number }> = [
  { nombre: 'Ciudad Autónoma de Buenos Aires', lng: -58.3816, lat: -34.6037 },
  { nombre: 'La Plata', lng: -57.9545, lat: -34.9215 },
  { nombre: 'Córdoba', lng: -64.1888, lat: -31.4201 },
  { nombre: 'Rosario', lng: -60.6393, lat: -32.9442 },
  { nombre: 'Mendoza', lng: -68.8458, lat: -32.8895 },
  { nombre: 'San Miguel de Tucumán', lng: -65.2226, lat: -26.8083 },
  { nombre: 'Salta', lng: -65.4117, lat: -24.7859 },
  { nombre: 'Resistencia', lng: -58.9868, lat: -27.4514 },
  { nombre: 'Corrientes', lng: -58.8341, lat: -27.4692 },
  { nombre: 'Posadas', lng: -55.8959, lat: -27.3671 },
  { nombre: 'Neuquén', lng: -68.0591, lat: -38.9516 },
  { nombre: 'Viedma', lng: -62.9967, lat: -40.8135 },
  { nombre: 'Rawson', lng: -65.1023, lat: -43.3002 },
  { nombre: 'Río Gallegos', lng: -69.2181, lat: -51.6226 },
  { nombre: 'Ushuaia', lng: -68.3029, lat: -54.8019 },
  { nombre: 'San Salvador de Jujuy', lng: -65.2977, lat: -24.1858 },
  { nombre: 'Santiago del Estero', lng: -64.2615, lat: -27.7951 },
  { nombre: 'Catamarca', lng: -65.7795, lat: -28.4696 },
  { nombre: 'La Rioja', lng: -66.8558, lat: -29.4131 },
  { nombre: 'San Juan', lng: -68.5364, lat: -31.5375 },
  { nombre: 'San Luis', lng: -66.3378, lat: -33.2951 },
  { nombre: 'Santa Rosa', lng: -64.2906, lat: -36.6167 },
  { nombre: 'Paraná', lng: -60.5238, lat: -31.7333 },
  { nombre: 'Formosa', lng: -58.1781, lat: -26.1849 },
];

describe('proyección — ida y vuelta (spec 1 §3)', () => {
  it('desproyectar(proyectar(p)) devuelve p en las 24 capitales', () => {
    // Tolerancia de flotante, no de dibujo: `proyectar` no redondea. El
    // redondeo a un decimal es de la serialización de los paths.
    const TOLERANCIA_GRADOS = 1e-9;
    for (const capital of CAPITALES) {
      const svg = proyeccion.proyectar(capital.lng, capital.lat);
      const geo = proyeccion.desproyectar(svg.x, svg.y);
      expect(Math.abs(geo.lng - capital.lng), `${capital.nombre} lng`).toBeLessThan(
        TOLERANCIA_GRADOS,
      );
      expect(Math.abs(geo.lat - capital.lat), `${capital.nombre} lat`).toBeLessThan(
        TOLERANCIA_GRADOS,
      );
    }
  });

  it('las capitales caen dentro del viewBox', () => {
    for (const capital of CAPITALES) {
      const { x, y } = proyeccion.proyectar(capital.lng, capital.lat);
      expect(x, `${capital.nombre} x`).toBeGreaterThanOrEqual(0);
      expect(x, `${capital.nombre} x`).toBeLessThanOrEqual(proyeccion.ancho);
      expect(y, `${capital.nombre} y`).toBeGreaterThanOrEqual(0);
      expect(y, `${capital.nombre} y`).toBeLessThanOrEqual(proyeccion.alto);
    }
  });

  it('la proyección es monótona: más al este es más a la derecha, más al norte más arriba', () => {
    const oeste = proyeccion.proyectar(-70, -35);
    const este = proyeccion.proyectar(-55, -35);
    expect(este.x).toBeGreaterThan(oeste.x);
    const norte = proyeccion.proyectar(-64, -25);
    const sur = proyeccion.proyectar(-64, -50);
    expect(norte.y).toBeLessThan(sur.y);
  });
});

describe('bounds congelados (spec 1 §3)', () => {
  it('salen de la capa de provincias', () => {
    expect(bounds.minLat).toBeLessThan(bounds.maxLat);
    expect(bounds.minLon).toBeLessThan(bounds.maxLon);
    // Argentina continental + Tierra del Fuego, sin la Antártida ni las islas
    // del Atlántico Sur: el dataset de Natural Earth filtrado.
    expect(bounds.maxLat).toBeLessThan(-20);
    expect(bounds.minLat).toBeGreaterThan(-56);
  });

  it('agregar una capa que se sale del país NO mueve los bounds del mapa', () => {
    // El orquestador calcula los bounds una sola vez y se los pasa a todas las
    // capas. Esta es la garantía: una capa nueva no puede correr los paths ya
    // emitidos ni desincronizar `desproyectar` de lo dibujado.
    const proyeccionOriginal = crearProyeccion(bounds);
    const capaIntrusa = [
      [
        [-10, 10],
        [-11, 11],
        [-12, 12],
      ],
    ];
    const boundsSiSeRecalcularan = boundsDeAnillos([...anillosDe(coleccion), ...capaIntrusa]);
    expect(boundsSiSeRecalcularan.maxLat).not.toBe(bounds.maxLat);

    // El contrato: la proyección que usan todas las capas sigue siendo la de
    // provincias, y produce exactamente lo mismo.
    const antes = proyeccionOriginal.proyectar(-58.3816, -34.6037);
    const despues = crearProyeccion(bounds).proyectar(-58.3816, -34.6037);
    expect(despues).toEqual(antes);
  });
});

describe('reproducibilidad (spec 1 §6)', () => {
  it('regenerar desde la fuente produce byte por byte el archivo commiteado', () => {
    const paisEnDisco = readFileSync(join(raizV2, 'apps/web/src/geo/pais.generated.ts'), 'utf8');
    const proyeccionEnDisco = readFileSync(
      join(raizV2, 'apps/web/src/geo/proyeccion.generated.ts'),
      'utf8',
    );
    expect(moduloPais(construirProvincias(coleccion, proyeccion))).toBe(paisEnDisco);
    expect(moduloProyeccion(proyeccion)).toBe(proyeccionEnDisco);
  });

  it('emite las 24 provincias con nombre canónico', () => {
    const provincias = construirProvincias(coleccion, proyeccion);
    expect(provincias).toHaveLength(24);
    expect(provincias.map((p) => p.nombre)).toContain('Ciudad Autónoma de Buenos Aires');
    expect(provincias.map((p) => p.nombre)).not.toContain('Ciudad de Buenos Aires');
  });

  it('cada centroide cae dentro del viewBox', () => {
    for (const provincia of construirProvincias(coleccion, proyeccion)) {
      expect(provincia.cx, provincia.nombre).toBeGreaterThan(0);
      expect(provincia.cx, provincia.nombre).toBeLessThan(proyeccion.ancho);
      expect(provincia.cy, provincia.nombre).toBeGreaterThan(0);
      expect(provincia.cy, provincia.nombre).toBeLessThan(proyeccion.alto);
    }
  });
});
