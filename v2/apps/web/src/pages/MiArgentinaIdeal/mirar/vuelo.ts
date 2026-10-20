import type { ValorDeOpinion } from '@v2/shared';

/** Lo que hay que correr la tarjeta para que cuente como respuesta (spec §4, «El gesto»). */
export const UMBRAL_ARRASTRE = 90;
/** Para «Paso» el arrastre tiene que ir hacia abajo, no en diagonal. */
const DESVIO_MAXIMO_DE_PASO = 60;

/** Qué respuesta es un arrastre que terminó en (dx, dy), o `null` si vuelve a su lugar. */
export function respuestaDelArrastre(dx: number, dy: number): ValorDeOpinion | null {
  if (dx > UMBRAL_ARRASTRE) return 'acuerdo';
  if (dx < -UMBRAL_ARRASTRE) return 'desacuerdo';
  if (dy > UMBRAL_ARRASTRE && Math.abs(dx) < DESVIO_MAXIMO_DE_PASO) return 'paso';
  return null;
}

export interface Vuelo {
  x?: number;
  y?: number;
  opacity: number;
}

/**
 * Adónde va la tarjeta después de contestar. Con movimiento reducido no vuela:
 * sólo se desvanece, sin ningún desplazamiento.
 */
export function vueloDe(valor: ValorDeOpinion, reducido: boolean): Vuelo {
  if (reducido) return { opacity: 0 };
  const lado = valor === 'acuerdo' ? 1 : valor === 'desacuerdo' ? -1 : 0;
  return { x: lado * 560, y: valor === 'paso' ? 420 : 24, opacity: 0 };
}

export const acotar = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
