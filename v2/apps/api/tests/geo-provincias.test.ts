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
  { ciudad: 'Obelisco', lat: -34.6037, lng: -58.3816, provincia: 'Ciudad Autónoma de Buenos Aires' },
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

  it('LIMITACIÓN CONOCIDA (D-011): erra en ciudades pegadas a un límite', () => {
    // La geometría que tenemos promedia 29 vértices por provincia. Alcanza
    // para el interior y no alcanza para un límite que sigue un río: Neuquén
    // capital está sobre el Limay, que ES el límite con Río Negro, y cae del
    // lado equivocado por unos 10 km. Son ~250.000 personas mal atribuidas.
    //
    // Este test afirma lo que HOY pasa, no lo que debería pasar. Cuando entre
    // geometría decente va a fallar — y ese día se borra, que es el punto.
    expect(nombreProvinciaDePunto({ lat: -38.9516, lng: -68.0591 })).toBe('Río Negro');
  });
});

describe('el módulo generado', () => {
  it('no se desincronizó del GeoJSON que sirve la web', () => {
    // Son dos copias de la misma geometría: la web la pide por HTTP desde
    // `public/`, la API la tiene compilada porque en serverless no hay disco
    // confiable. Si divergen, el mapa y el conteo dejan de coincidir sin que
    // nada falle a la vista. Esta es la guarda.
    const fuente = JSON.parse(
      readFileSync(
        new URL('../../web/public/geo/provincias.geojson', import.meta.url),
        'utf8',
      ),
    ) as { features: { properties: { name: string } }[] };

    expect(AREAS_PROVINCIAS).toHaveLength(fuente.features.length);
    expect(AREAS_PROVINCIAS.map((a) => a.nombre).sort()).toEqual(
      fuente.features.map((f) => f.properties.name).sort(),
    );
  });

  it('trae las 24 jurisdicciones', () => {
    expect(AREAS_PROVINCIAS).toHaveLength(24);
  });
});
