import { pointInPolygon } from './lasso.js';

import type { GeoPoint } from './types.js';

/**
 * Resolver un punto a su provincia — D-001 en `docs/DEUDAS.md`.
 *
 * Función pura. Recibe el punto y las áreas ya parseadas, y devuelve un
 * NOMBRE, no un id: quién resuelve ese nombre a una fila de la base es
 * problema de quien llama. Así esto sigue corriendo igual en Node, en el
 * navegador y en Hermes, que es la regla de este paquete.
 *
 * Por qué existe: `provinceId` se guardaba solo si el cliente lo mandaba, así
 * que una voz clavada en un punto exacto quedaba sin provincia y desaparecía
 * de todo lo que agrega por territorio.
 */

/** Un anillo en orden GeoJSON: pares [longitud, latitud]. */
export type AnilloGeoJson = readonly (readonly number[])[];

/** Un polígono: anillo exterior primero, huecos después. */
export type PoligonoGeoJson = readonly AnilloGeoJson[];

export interface GeometriaPoligono {
  type: 'Polygon';
  coordinates: PoligonoGeoJson;
}

export interface GeometriaMultiPoligono {
  type: 'MultiPolygon';
  coordinates: readonly PoligonoGeoJson[];
}

export interface AreaProvincia {
  nombre: string;
  geometria: GeometriaPoligono | GeometriaMultiPoligono;
}

/**
 * Un MultiPolygon es una lista de polígonos; un Polygon es uno solo. Se
 * normalizan a lo mismo para no ramificar en el resto del módulo.
 *
 * Importa soportar los dos: Tierra del Fuego y Buenos Aires tienen islas, y
 * con datos mejores que los actuales van a llegar como MultiPolygon. Mirar
 * solo el primer anillo dejaría esas voces sin provincia — el mismo bug otra
 * vez, más chico y más difícil de ver.
 */
function poligonosDe(geometria: AreaProvincia['geometria']): readonly PoligonoGeoJson[] {
  return geometria.type === 'Polygon' ? [geometria.coordinates] : geometria.coordinates;
}

/** [lng, lat] → GeoPoint. Descarta pares incompletos en vez de inventar un 0. */
function aPuntos(anillo: AnilloGeoJson): GeoPoint[] {
  return anillo.flatMap(([lng, lat]) =>
    lng === undefined || lat === undefined ? [] : [{ lat, lng }],
  );
}

/**
 * Un punto pertenece al polígono si cae dentro del anillo exterior y fuera de
 * todos los huecos. Un hueco es territorio ajeno enclavado: contarlo propio le
 * atribuiría la voz a la provincia equivocada.
 */
function contiene(punto: GeoPoint, poligono: PoligonoGeoJson): boolean {
  const [exterior, ...huecos] = poligono;
  if (exterior === undefined) return false;
  if (!pointInPolygon(punto, aPuntos(exterior))) return false;
  return !huecos.some((hueco) => pointInPolygon(punto, aPuntos(hueco)));
}

/** El nombre de la provincia que contiene el punto, o `null` si ninguna lo hace. */
export function provinciaDelPunto(
  punto: GeoPoint,
  areas: readonly AreaProvincia[],
): string | null {
  for (const area of areas) {
    if (poligonosDe(area.geometria).some((poligono) => contiene(punto, poligono))) {
      return area.nombre;
    }
  }
  return null;
}
