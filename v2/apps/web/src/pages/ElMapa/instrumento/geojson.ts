import type { GeoPoint } from '@v2/civic-core';

/**
 * Cierra un anillo de polígono para GeoJSON, que exige primer punto = último.
 *
 * En su propio módulo y no junto al mapa: un archivo que exporta componentes y
 * funciones pierde el fast refresh de Vite.
 */
export function anilloCerrado(poligono: readonly GeoPoint[]): number[][] {
  const primero = poligono[0];
  if (!primero) return [];
  return [...poligono.map((p) => [p.lng, p.lat]), [primero.lng, primero.lat]];
}
