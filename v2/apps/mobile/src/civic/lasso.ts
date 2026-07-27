/**
 * El lazo vive en `@v2/civic-core`, compartido con la web.
 *
 * Es la pieza que hace que dibujar un área en el mapa del sitio y dibujarla en
 * el mapa de campo signifiquen exactamente lo mismo: el mismo `pointInPolygon`,
 * la misma decisión sobre qué queda adentro. Dos implementaciones habrían
 * dado dos recortes distintos del mismo territorio.
 */
export {
  pointInPolygon,
  polygonCenter,
  selectTerritoryPoints,
} from '@v2/civic-core';
export type { TerritoryPoint, TerritorySelection } from '@v2/civic-core';
