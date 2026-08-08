import { haversineKm } from './geo.js';

import type { CoverageCell } from './coverage.js';

/**
 * Población y superficie por provincia — el denominador de todo.
 *
 * Población del censo 2022 (INDEC) en miles; superficie en miles de km². Las
 * claves son los nombres CANÓNICOS, los mismos que devuelve la API y los
 * mismos que trae el GeoJSON desde que se arregló D-012.
 *
 * Vivía adentro de `useModoAnalisis`. Salió acá cuando la Simulación necesitó
 * los mismos números: una tabla de denominadores duplicada es la forma más
 * silenciosa de que dos partes de la misma pantalla cuenten distinto.
 */
export interface ReferenciaProvincia {
  /** Habitantes, en miles. */
  pob: number;
  /** Superficie, en miles de km². */
  km2: number;
}

export const PROVINCIAS_REF: Record<string, ReferenciaProvincia> = {
  'Buenos Aires': { pob: 17569, km2: 307.6 },
  'Ciudad Autónoma de Buenos Aires': { pob: 3121, km2: 0.2 },
  Córdoba: { pob: 3978, km2: 165.3 },
  'Santa Fe': { pob: 3556, km2: 133.0 },
  Mendoza: { pob: 2014, km2: 148.8 },
  Tucumán: { pob: 1703, km2: 22.5 },
  Salta: { pob: 1440, km2: 155.5 },
  'Entre Ríos': { pob: 1426, km2: 78.8 },
  Misiones: { pob: 1281, km2: 29.8 },
  Chaco: { pob: 1129, km2: 99.6 },
  Corrientes: { pob: 1120, km2: 88.2 },
  'Santiago del Estero': { pob: 978, km2: 136.4 },
  'San Juan': { pob: 818, km2: 89.7 },
  Jujuy: { pob: 797, km2: 53.2 },
  'Río Negro': { pob: 747, km2: 203.0 },
  Neuquén: { pob: 726, km2: 94.1 },
  Formosa: { pob: 606, km2: 72.1 },
  Chubut: { pob: 604, km2: 224.7 },
  'San Luis': { pob: 540, km2: 76.7 },
  Catamarca: { pob: 429, km2: 102.6 },
  'La Rioja': { pob: 384, km2: 89.7 },
  'La Pampa': { pob: 366, km2: 143.4 },
  'Santa Cruz': { pob: 337, km2: 243.9 },
  'Tierra del Fuego': { pob: 191, km2: 21.6 },
};

/**
 * Área de una celda en km².
 *
 * Las celdas de un plan son rectángulos chicos, así que alcanza con medir dos
 * lados contiguos con haversine y multiplicarlos. A esta escala la curvatura
 * no cambia el resultado de forma que importe para un denominador estimado.
 */
export const areaCeldaKm2 = (cell: CoverageCell): number => {
  const [a, b, c] = cell.polygon;
  if (!a || !b || !c) return 0;
  return haversineKm(a, b) * haversineKm(b, c);
};

/**
 * Habitantes estimados de una celda — densidad provincial × área.
 *
 * **Es una estimación con método declarado, no una medición.** Asume densidad
 * pareja adentro de la provincia, que es falso: una celda rural bonaerense
 * recibe el promedio provincial y queda sobreestimada, y por lo tanto su
 * brillo queda subestimado. Lo que este método SÍ representa bien es el
 * contraste entre provincias, que es enorme y real — CABA contra Santa Cruz
 * son cuatro órdenes de magnitud.
 *
 * Quien lo use tiene que decirlo en pantalla. El día que haya población
 * grillada de verdad (`D-026`), se cambia esta función y nada más.
 *
 * Devuelve `null` —nunca `0`— cuando no se sabe en qué provincia cae la celda
 * o cuando esa provincia no está en la tabla. Inventarle una población
 * plausible sería exactamente la clase de número que este paquete existe para
 * no tener.
 */
export const habitantesDeCelda = (cell: CoverageCell, provincia: string | null): number | null => {
  if (provincia === null) return null;
  const ref = PROVINCIAS_REF[provincia];
  if (ref === undefined) return null;
  const densidad = (ref.pob * 1000) / (ref.km2 * 1000);
  return densidad * areaCeldaKm2(cell);
};
