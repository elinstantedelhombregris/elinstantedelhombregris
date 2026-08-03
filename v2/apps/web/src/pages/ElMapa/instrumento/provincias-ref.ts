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
