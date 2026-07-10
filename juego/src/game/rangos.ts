/**
 * Rangos — progresión por brasas acumuladas históricas, no por balance
 * (spec §3.3). Gastar jamás te baja de rango.
 */

import type { Rango } from './types';

/** Umbrales canónicos, en orden ascendente. */
export const RANGOS: readonly Rango[] = [
  { nombre: 'Chispa', umbral: 0 },
  { nombre: 'Vela', umbral: 100 },
  { nombre: 'Farol', umbral: 300 },
  { nombre: 'Fogata', umbral: 700 },
  { nombre: 'Faro', umbral: 1500 },
  { nombre: 'Aurora', umbral: 3000 },
] as const;

const clamp = (totalGanado: number): number =>
  Number.isFinite(totalGanado) ? Math.max(0, totalGanado) : 0;

/** Rango vigente: el mayor umbral alcanzado (100 exacto ya es Vela). */
export const rangoActual = (totalGanado: number): Rango => {
  const total = clamp(totalGanado);
  let actual = RANGOS[0]!;
  for (const r of RANGOS) {
    if (total >= r.umbral) actual = r;
  }
  return actual;
};

/** El rango que sigue, o null si ya sos Aurora. */
export const proximoRango = (totalGanado: number): Rango | null => {
  const total = clamp(totalGanado);
  for (const r of RANGOS) {
    if (total < r.umbral) return r;
  }
  return null;
};

/**
 * Progreso 0..1 dentro del tramo actual (0 al pisar el rango, 1 al llegar
 * al siguiente). En Aurora devuelve 1: el cielo ya amaneció.
 */
export const progresoHaciaProximo = (totalGanado: number): number => {
  const total = clamp(totalGanado);
  const actual = rangoActual(total);
  const proximo = proximoRango(total);
  if (proximo === null) return 1;
  return (total - actual.umbral) / (proximo.umbral - actual.umbral);
};
