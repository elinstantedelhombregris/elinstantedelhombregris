/**
 * La resolución de un punto a su provincia, contra la geometría real.
 *
 * D-001 en `docs/DEUDAS.md`: `province_id` se guardaba solo si el cliente lo
 * mandaba, así que una voz clavada en un punto exacto quedaba sin provincia y
 * desaparecía del coroplético, de los rankings y de todo lo que agrega por
 * territorio.
 *
 * No necesita base: es geometría contra un módulo generado.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { AREAS_PROVINCIAS, nombreProvinciaDePunto } from '../src/features/geographic/provincias.js';

/** Capitales, bien adentro de su provincia — nada de puntos de borde. */
const CAPITALES = [
  {
    ciudad: 'Obelisco',
    lat: -34.6037,
    lng: -58.3816,
    provincia: 'Ciudad Autónoma de Buenos Aires',
  },
  { ciudad: 'Córdoba', lat: -31.4201, lng: -64.1888, provincia: 'Córdoba' },
  { ciudad: 'Mendoza', lat: -32.8895, lng: -68.8458, provincia: 'Mendoza' },
  { ciudad: 'Rosario', lat: -32.9442, lng: -60.6505, provincia: 'Santa Fe' },
  { ciudad: 'Salta', lat: -24.7859, lng: -65.4117, provincia: 'Salta' },
  { ciudad: 'Zapala', lat: -38.8996, lng: -70.0658, provincia: 'Neuquén' },
];

describe('nombreProvinciaDePunto', () => {
  it.each(CAPITALES)('$ciudad cae en $provincia', ({ lat, lng, provincia }) => {
    expect(nombreProvinciaDePunto({ lat, lng })).toBe(provincia);
  });

  it('devuelve el nombre canónico de la base, no el del GeoJSON', () => {
    // El GeoJSON dice «Ciudad de Buenos Aires»; `geographic_locations` guarda
    // «Ciudad Autónoma de Buenos Aires». Sin normalizar, la búsqueda por
    // nombre no encuentra la fila y la voz se queda sin provincia igual —
    // el mismo bug, un paso más adelante.
    expect(nombreProvinciaDePunto({ lat: -34.6037, lng: -58.3816 })).toBe(
      'Ciudad Autónoma de Buenos Aires',
    );
  });

  it('devuelve null en el Atlántico', () => {
    expect(nombreProvinciaDePunto({ lat: -40, lng: -50 })).toBeNull();
  });

  it('devuelve null fuera del país', () => {
    expect(nombreProvinciaDePunto({ lat: 40.4168, lng: -3.7038 })).toBeNull();
  });
});

/**
 * D-011: la geometría vieja promediaba 29 vértices por provincia, y CABA era un
 * triángulo de tres puntos. Este bloque es el que la reemplaza — la capa del
 * IGN simplificada con Douglas-Peucker a 200 m (`scripts/build/geo/importar-ign.ts`).
 *
 * Medido contra la geometría vieja el 22/9/2026, antes de reemplazarla: once de
 * estos veinticuatro puntos salían mal — Neuquén capital, Plottier y Viedma en
 * la provincia de enfrente; Dock Sud en CABA y Salto (Uruguay) en Entre Ríos;
 * Liniers en provincia; Retiro, la Reserva, Aeroparque, Posadas y Puerto
 * Argentino en ninguna. Los demás están para fijar el otro lado de cada borde.
 * Si alguno vuelve a fallar, la tolerancia se subió demasiado.
 */
describe('nombreProvinciaDePunto en los bordes (D-011)', () => {
  const BORDES = [
    // Neuquén capital está sobre la confluencia del Limay y el Neuquén, que SON
    // el límite con Río Negro. La vieja la mandaba a Río Negro: ~250.000
    // personas atribuidas a la provincia que no es.
    { lugar: 'Neuquén capital', lat: -38.9516, lng: -68.0591, provincia: 'Neuquén' },
    { lugar: 'Plottier, sobre el Limay', lat: -38.9667, lng: -68.2333, provincia: 'Neuquén' },
    {
      lugar: 'Cipolletti, cruzando el Neuquén',
      lat: -38.9339,
      lng: -67.9903,
      provincia: 'Río Negro',
    },
    // El río Negro separa Viedma de Carmen de Patagones: dos provincias a 2 km.
    { lugar: 'Viedma', lat: -40.8135, lng: -62.9967, provincia: 'Río Negro' },
    { lugar: 'Carmen de Patagones', lat: -40.7984, lng: -62.98, provincia: 'Buenos Aires' },
    // El Paraná, entre Chaco y Corrientes y entre Misiones y Paraguay.
    { lugar: 'Resistencia', lat: -27.4514, lng: -58.9867, provincia: 'Chaco' },
    { lugar: 'Corrientes capital', lat: -27.4692, lng: -58.8306, provincia: 'Corrientes' },
    { lugar: 'Posadas', lat: -27.3671, lng: -55.8961, provincia: 'Misiones' },
    { lugar: 'Paraná', lat: -31.7319, lng: -60.5238, provincia: 'Entre Ríos' },
    { lugar: 'Santa Fe capital', lat: -31.6333, lng: -60.7, provincia: 'Santa Fe' },
    { lugar: 'San Nicolás', lat: -33.3303, lng: -60.227, provincia: 'Buenos Aires' },
    { lugar: 'Villa Constitución', lat: -33.2333, lng: -60.3333, provincia: 'Santa Fe' },
    // CABA: el triángulo cubría el microcentro y poco más.
    {
      lugar: 'Villa Lugano',
      lat: -34.676,
      lng: -58.473,
      provincia: 'Ciudad Autónoma de Buenos Aires',
    },
    { lugar: 'Liniers', lat: -34.6395, lng: -58.519, provincia: 'Ciudad Autónoma de Buenos Aires' },
    { lugar: 'Núñez', lat: -34.545, lng: -58.463, provincia: 'Ciudad Autónoma de Buenos Aires' },
    // El borde este: la voz de la luminaria quedaba sin provincia por esto.
    { lugar: 'Retiro', lat: -34.5911, lng: -58.3745, provincia: 'Ciudad Autónoma de Buenos Aires' },
    {
      lugar: 'Reserva Ecológica',
      lat: -34.613,
      lng: -58.356,
      provincia: 'Ciudad Autónoma de Buenos Aires',
    },
    {
      lugar: 'Aeroparque',
      lat: -34.558,
      lng: -58.416,
      provincia: 'Ciudad Autónoma de Buenos Aires',
    },
    // Y del otro lado de la General Paz y del Riachuelo, provincia.
    { lugar: 'Ciudadela', lat: -34.633, lng: -58.536, provincia: 'Buenos Aires' },
    { lugar: 'Dock Sud', lat: -34.648, lng: -58.345, provincia: 'Buenos Aires' },
    // Malvinas: la capa del IGN la incluye en Tierra del Fuego.
    { lugar: 'Puerto Argentino', lat: -51.6977, lng: -57.8517, provincia: 'Tierra del Fuego' },
    { lugar: 'Ushuaia', lat: -54.8019, lng: -68.303, provincia: 'Tierra del Fuego' },
  ];

  it.each(BORDES)('$lugar cae en $provincia', ({ lat, lng, provincia }) => {
    expect(nombreProvinciaDePunto({ lat, lng })).toBe(provincia);
  });

  it.each([
    // La vieja atribuía Salto a Entre Ríos: el polígono se comía el río Uruguay.
    { lugar: 'Salto (Uruguay)', lat: -31.3833, lng: -57.9667 },
    { lugar: 'Encarnación (Paraguay)', lat: -27.3306, lng: -55.8667 },
  ])('$lugar no es de ninguna provincia', ({ lat, lng }) => {
    expect(nombreProvinciaDePunto({ lat, lng })).toBeNull();
  });

  it('CABA dejó de ser un triángulo', () => {
    const caba = AREAS_PROVINCIAS.find((a) => a.nombre === 'Ciudad Autónoma de Buenos Aires');
    const poligonos =
      caba?.geometria.type === 'Polygon'
        ? [caba.geometria.coordinates]
        : (caba?.geometria.coordinates ?? []);
    const vertices = poligonos.reduce((n, p) => n + (p[0]?.length ?? 0), 0);
    expect(vertices).toBeGreaterThan(50);
  });
});

describe('el módulo generado', () => {
  it('no se desincronizó del GeoJSON que sirve la web', () => {
    // Son dos copias de la misma geometría: la web la pide por HTTP desde
    // `public/`, la API la tiene compilada porque en serverless no hay disco
    // confiable. Si divergen, el mapa y el conteo dejan de coincidir sin que
    // nada falle a la vista. Esta es la guarda.
    const fuente = JSON.parse(
      readFileSync(new URL('../../web/public/geo/provincias.geojson', import.meta.url), 'utf8'),
    ) as { features: { properties: { name: string } }[] };

    expect(AREAS_PROVINCIAS).toHaveLength(fuente.features.length);
    expect(AREAS_PROVINCIAS.map((a) => a.nombre).sort()).toEqual(
      fuente.features.map((f) => f.properties.name).sort(),
    );
  });

  it('trae las 24 jurisdicciones', () => {
    expect(AREAS_PROVINCIAS).toHaveLength(24);
  });

  it('usa los nombres canónicos, no los de Natural Earth', () => {
    // Mismo criterio que `scripts/build/__tests__/proyeccion.test.ts:135` para
    // el otro pipeline de geografía: el canon es «Ciudad Autónoma de Buenos
    // Aires».
    //
    // No es cosmético. El coroplético recorre las features del GeoJSON y para
    // cada una busca su conteo en un mapa indexado por el nombre que devuelve
    // la API. Con el nombre viejo, 23 provincias coinciden y CABA no — y CABA
    // es donde está el 100% de los datos. La provincia se resolvería bien y
    // el mapa la pintaría en cero igual.
    expect(AREAS_PROVINCIAS.map((a) => a.nombre)).not.toContain('Ciudad de Buenos Aires');
    expect(AREAS_PROVINCIAS.map((a) => a.nombre)).toContain('Ciudad Autónoma de Buenos Aires');
  });
});
