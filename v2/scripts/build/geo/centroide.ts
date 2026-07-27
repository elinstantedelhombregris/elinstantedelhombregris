import { redondearUnidad } from './proyeccion.js';

import type { Proyeccion } from './proyeccion.js';

/**
 * Centroide por fórmula del cordón (shoelace) del anillo exterior, en
 * coordenadas del viewBox. Extraído de `build-mapa-argentina.ts` para que lo
 * compartan provincias y departamentos.
 *
 * Es el ancla del lavado de tinta de una región y de su etiqueta. Para
 * polígonos cóncavos puede caer afuera de la forma; para las provincias
 * argentinas no pasa, y para departamentos se acepta: el centroide es dónde
 * se apoya el número, no dónde está nadie.
 */
export function centroideSvg(
  anillo: readonly (readonly number[])[],
  proyeccion: Proyeccion,
): { cx: number; cy: number } {
  let area = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < anillo.length - 1; i += 1) {
    const a = proyeccion.proyectar(anillo[i]?.[0] ?? 0, anillo[i]?.[1] ?? 0);
    const b = proyeccion.proyectar(anillo[i + 1]?.[0] ?? 0, anillo[i + 1]?.[1] ?? 0);
    const cruz = a.x * b.y - b.x * a.y;
    area += cruz;
    sx += (a.x + b.x) * cruz;
    sy += (a.y + b.y) * cruz;
  }
  area /= 2;
  if (Math.abs(area) < 1e-9) {
    // Anillo degenerado: promedio simple antes que dividir por cero.
    const n = Math.max(1, anillo.length);
    let px = 0;
    let py = 0;
    for (const coord of anillo) {
      const p = proyeccion.proyectar(coord[0] ?? 0, coord[1] ?? 0);
      px += p.x;
      py += p.y;
    }
    return { cx: redondearUnidad(px / n), cy: redondearUnidad(py / n) };
  }
  return {
    cx: redondearUnidad(sx / (6 * area)),
    cy: redondearUnidad(sy / (6 * area)),
  };
}
