/**
 * Expediciones — matemática de progreso e hitos (spec §3.2).
 *
 * Hitos 25/50/100% → +10/+15/+25 brasas, cada uno se otorga UNA sola vez
 * (el otorgado queda persistido en `hitosOtorgados`). Al 100% la expedición
 * pasa a 'completa' (y la UI dispara la carta de expedición).
 */

import { GANANCIAS, MOTIVOS } from './brasas';
import type { EstadoExpedicion } from './types';

/** Umbrales de hito, en porcentaje. */
export const HITOS = [25, 50, 100] as const;
export type Hito = (typeof HITOS)[number];

/** Brasas por hito (spec §3.2). */
export const BRASAS_POR_HITO: Record<Hito, number> = {
  25: GANANCIAS.hito25,
  50: GANANCIAS.hito50,
  100: GANANCIAS.hito100,
};

/** Motivo de ledger por hito, rioplatense. */
export const MOTIVO_POR_HITO: Record<Hito, string> = {
  25: MOTIVOS.hito25,
  50: MOTIVOS.hito50,
  100: MOTIVOS.hito100,
};

const validarMeta = (meta: number): void => {
  if (!Number.isInteger(meta) || meta < 1) {
    throw new Error(`Meta inválida: ${meta} (tiene que ser un entero ≥ 1)`);
  }
};

/**
 * Progreso actual: porcentaje entero 0..100 (piso, tope 100 aunque haya
 * más entradas que meta) y estado.
 */
export const progresoExpedicion = (
  entradas: number,
  meta: number,
): { porcentaje: number; estado: EstadoExpedicion } => {
  validarMeta(meta);
  const n = Math.max(0, Math.floor(entradas));
  const porcentaje = Math.min(100, Math.floor((n / meta) * 100));
  return { porcentaje, estado: n >= meta ? 'completa' : 'activa' };
};

/**
 * Hitos recién cruzados y todavía no otorgados, en orden ascendente.
 * Si de un salto se pasa del 0% al 100%, devuelve los tres.
 */
export const hitosCruzados = (
  entradas: number,
  meta: number,
  yaOtorgados: readonly number[],
): Hito[] => {
  const { porcentaje } = progresoExpedicion(entradas, meta);
  return HITOS.filter((h) => porcentaje >= h && !yaOtorgados.includes(h));
};

/** Total de brasas que pagan estos hitos. */
export const brasasDeHitos = (hitos: readonly Hito[]): number =>
  hitos.reduce((acc, h) => acc + BRASAS_POR_HITO[h], 0);

/** Lo mínimo que el resumen necesita saber de un paso de plantilla. */
export interface PasoResumen {
  key: string;
  microUI: string;
}

/**
 * Una línea de resumen para la estrella que nace de una captura de
 * expedición: concatena, en el orden de los pasos, los valores con voz
 * propia — el texto corto, el chip elegido, el número contado. Las fotos
 * y los soles no se transcriben. Devuelve null si no hay nada que decir
 * (el texto de una estrella siempre fue opcional, spec §3.1).
 */
export const resumenDeCaptura = (
  pasos: readonly PasoResumen[],
  data: Record<string, unknown>,
): string | null => {
  const partes: string[] = [];
  for (const p of pasos) {
    const v = data[p.key];
    if (p.microUI === 'texto-corto' || p.microUI === 'chips') {
      if (typeof v === 'string' && v.trim().length > 0) partes.push(v.trim());
    } else if (p.microUI === 'contador') {
      if (typeof v === 'number' && Number.isFinite(v)) partes.push(String(v));
    }
  }
  return partes.length > 0 ? partes.join(' · ') : null;
};
