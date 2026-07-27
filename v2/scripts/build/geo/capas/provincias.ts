import { centroideSvg } from '../centroide.js';
import { redondearUnidad } from '../proyeccion.js';

import type { Proyeccion } from '../proyeccion.js';

/**
 * Capa de provincias — la altitud «país».
 *
 * Portada desde `build-mapa-argentina.ts`. Los 24 paths salen **idénticos**;
 * la proyección y el centroide ahora vienen de módulos compartidos, porque los
 * bounds los congela el orquestador desde ESTA capa (spec 1 §3).
 *
 * Única diferencia de salida: dos centroides se corren 0,1 unidad sobre un
 * lienzo de 1000 (Neuquén 86.9→86.8, Tierra del Fuego 147.3→147.4). El script
 * viejo calculaba el shoelace sobre coordenadas ya redondeadas a un decimal,
 * metiendo el error del dibujo adentro del centroide; ahora se proyecta exacto
 * y se redondea al final. El centroide es dónde se apoya el número de la
 * provincia, así que el efecto visible es ninguno — pero queda escrito porque
 * es un cambio de salida y el test de reproducibilidad lo va a fijar.
 */

export interface FeatureProvincia {
  properties: { name: string };
  geometry: { type: 'Polygon'; coordinates: number[][][] };
}

export interface ColeccionProvincias {
  features: FeatureProvincia[];
}

export interface ProvinciaSvg {
  nombre: string;
  path: string;
  cx: number;
  cy: number;
  /** [minX, minY, maxX, maxY] en unidades del viewBox — el encuadre del zoom. */
  bbox: [number, number, number, number];
}

/** Nombres del GeoJSON → nombre canónico del seed de geographic_locations. */
const RENOMBRES: Record<string, string> = {
  'Ciudad de Buenos Aires': 'Ciudad Autónoma de Buenos Aires',
};

/** Todos los anillos de la colección — la fuente de los bounds congelados. */
export function anillosDe(coleccion: ColeccionProvincias): number[][][] {
  return coleccion.features.flatMap((feature) => feature.geometry.coordinates);
}

function pathDe(feature: FeatureProvincia, proyeccion: Proyeccion): string {
  return feature.geometry.coordinates
    .map((anillo) => {
      const puntos = anillo.map((coord) => {
        const p = proyeccion.proyectar(coord[0] ?? 0, coord[1] ?? 0);
        return `${String(redondearUnidad(p.x))},${String(redondearUnidad(p.y))}`;
      });
      return `M${puntos.join(' L')} Z`;
    })
    .join(' ');
}

/** Encuadre de la provincia entera, incluidas sus islas y anillos sueltos. */
function bboxDe(feature: FeatureProvincia, proyeccion: Proyeccion): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const anillo of feature.geometry.coordinates) {
    for (const coord of anillo) {
      const p = proyeccion.proyectar(coord[0] ?? 0, coord[1] ?? 0);
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  return [
    redondearUnidad(minX),
    redondearUnidad(minY),
    redondearUnidad(maxX),
    redondearUnidad(maxY),
  ];
}

export function construirProvincias(
  coleccion: ColeccionProvincias,
  proyeccion: Proyeccion,
): ProvinciaSvg[] {
  return coleccion.features
    .map((feature) => {
      const nombre = RENOMBRES[feature.properties.name] ?? feature.properties.name;
      const anilloExterior = feature.geometry.coordinates[0] ?? [];
      return {
        nombre,
        path: pathDe(feature, proyeccion),
        ...centroideSvg(anilloExterior, proyeccion),
        bbox: bboxDe(feature, proyeccion),
      };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export function moduloPais(provincias: readonly ProvinciaSvg[]): string {
  const lineas = provincias
    .map(
      (p) =>
        `  { nombre: ${JSON.stringify(p.nombre)}, cx: ${String(p.cx)}, cy: ${String(p.cy)}, bbox: [${p.bbox.map(String).join(', ')}], path: ${JSON.stringify(p.path)} },`,
    )
    .join('\n');

  return `/**
 * GENERADO por scripts/build/geo/index.ts — NO EDITAR A MANO.
 * Fuente: scripts/build/data/argentina-provincias.geojson
 * (Natural Earth, dominio público).
 *
 * La altitud «país» de la spec 1 §4: las 24 provincias. El viewBox y la
 * proyección viven en './proyeccion.generated.ts' — este módulo solo trae
 * geometría ya proyectada.
 *
 * Regenerar (desde v2/):
 *   ./apps/api/node_modules/.bin/tsx scripts/build/geo/index.ts
 */
export interface ProvinciaSvg {
  /** Nombre canónico — coincide con geographic_locations.name. */
  nombre: string;
  /** Path SVG proyectado. */
  path: string;
  /** Centroide en unidades del viewBox — ancla del lavado y de la etiqueta. */
  cx: number;
  cy: number;
  /** [minX, minY, maxX, maxY] — el encuadre al que vuela el zoom de altitud. */
  bbox: readonly [number, number, number, number];
}

export const PROVINCIAS_SVG: readonly ProvinciaSvg[] = [
${lineas}
];
`;
}
