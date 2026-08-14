import type { RectanguloGeo } from '~/components/mapa/rectangulo-inscripto';

import { anillosDeGeometria, rectanguloInscripto } from '~/components/mapa/rectangulo-inscripto';

/**
 * El rectángulo de cada provincia del archivo que sirve la web — el «en algún
 * lugar de acá adentro» del sembrado, y nada más que eso.
 *
 * ## Por qué existe
 *
 * `sembrarCelda` reparte los puntos de una celda dentro de un rectángulo en
 * grados. La cosecha del motor no trae ninguno: trae `(territorioId, período,
 * clase) → voces`, y `PRECISION_QUE_CONOCE_EL_GENERADOR` es `'province'`. O sea
 * que el rectángulo **no sale del dato**: hay que derivarlo de la figura de la
 * provincia, que es lo único que dice dónde está esa provincia.
 *
 * ## Lo que este archivo NO hace
 *
 * No calcula el rectángulo. La cuenta —y la única que promete contención— vive
 * en `~/components/mapa/rectangulo-inscripto`, al lado del pintor que la
 * consume, porque este mismo archivo tuvo su propia versión durante un rato y
 * divergió: encogía la caja hasta igualar el área del polígono, que **no
 * garantiza contención**, y sembraba el 21,6 % de la superficie afuera de la
 * provincia mientras la pantalla declaraba lo contrario. Acá quedó sólo lo que
 * es propio de esta superficie: recorrer el `FeatureCollection` y llavear por
 * nombre.
 *
 * Módulo puro: entra el GeoJSON crudo, sale un mapa de rectángulos. Sin React,
 * sin mapa, sin red. Vive separado de `CapaSembrada.tsx` por la regla de fast
 * refresh que ya separó `coropletico.ts` de `CapaProvincias.tsx`.
 */

const esLista = (v: unknown): v is readonly unknown[] => Array.isArray(v);

/**
 * Los rectángulos de un `FeatureCollection`, llaveados por el NOMBRE de la
 * provincia — la misma clave con la que el retrato indexa sus territorios y con
 * la que el coroplético recorre las features. Una traducción menos es un lugar
 * menos donde CABA se vuelva a llamar distinto (D-012).
 *
 * Valida la forma del GeoJSON sin confiar en que llegó bien, igual que
 * `coropletico.ts`: lo que no se puede leer no entra al mapa. Y una provincia
 * cuya figura no admite ningún rectángulo adentro tampoco entra —
 * `rectanguloInscripto` devuelve `null` y acá se omite—, así que quien llama la
 * cuenta como territorio sin dibujo y lo dice en pantalla en vez de dibujarla en
 * cualquier parte.
 */
export function rectangulosDeProvincias(geometria: unknown): ReadonlyMap<string, RectanguloGeo> {
  const salida = new Map<string, RectanguloGeo>();
  if (typeof geometria !== 'object' || geometria === null) return salida;

  const coleccion = geometria as { type?: unknown; features?: unknown };
  if (coleccion.type !== 'FeatureCollection' || !esLista(coleccion.features)) return salida;

  for (const cruda of coleccion.features) {
    if (typeof cruda !== 'object' || cruda === null) continue;
    const feature = cruda as { properties?: unknown; geometry?: unknown };
    const propiedades = feature.properties;
    if (typeof propiedades !== 'object' || propiedades === null) continue;
    const nombre = (propiedades as { name?: unknown }).name;
    if (typeof nombre !== 'string' || nombre === '') continue;

    const rectangulo = rectanguloInscripto(anillosDeGeometria(feature.geometry));
    if (rectangulo !== null) salida.set(nombre, rectangulo);
  }

  return salida;
}
