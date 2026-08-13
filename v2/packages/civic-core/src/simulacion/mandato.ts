import { COEFICIENTES } from './coeficientes.js';

import type { Coeficientes } from './coeficientes.js';
import type { Territorio } from './tipos.js';

/**
 * La regla del mandato — spec §5.3.
 *
 * Un territorio tiene mandato cuando cruza el piso y lo sostiene. Las dos
 * condiciones importan: cruzarlo una vez es un pico, y un pico no gobierna.
 *
 * Los coeficientes entran por parámetro con `COEFICIENTES` de default. No es
 * ceremonia: un barrido que sólo mueve palancas y deja fijos el piso, la
 * constante de resistencia y el mínimo de períodos está midiendo media
 * pregunta, y «¿cuánto de lo que veo depende de que el piso sea 100?» es una
 * pregunta legítima que hasta ahora no tenía por dónde entrar. El default hace
 * que ningún call site viejo cambie.
 */

const acotar = (valor: number, minimo: number, maximo: number): number =>
  Math.min(maximo, Math.max(minimo, valor));

/** El piso, en voces cada 100.000 habitantes, corregido por la resistencia. */
export function pisoEfectivo(
  resistencia: number,
  coeficientes: Coeficientes = COEFICIENTES,
): number {
  return coeficientes.PISO_MANDATO * (1 + coeficientes.K_RESISTENCIA * acotar(resistencia, 0, 1));
}

/** El piso llevado a voces absolutas para un territorio. */
export function umbralDe(territorio: Territorio, piso: number): number {
  return (piso * Math.max(0, territorio.poblacion)) / 100_000;
}

/** Cuántos períodos tiene el horizonte. Nunca menos de uno. */
export function periodosDelHorizonte(
  horizonte: number,
  coeficientes: Coeficientes = COEFICIENTES,
): number {
  return Math.max(1, Math.round(horizonte * coeficientes.PERIODOS_POR_ANIO));
}

/**
 * Cuántos de esos períodos se sostiene la voz.
 *
 * En estallido (`constancia` 0) es uno solo: todo el esfuerzo en un momento.
 * En goteo pleno son todos. En el medio, interpola.
 */
export function periodosSostenidos(constancia: number, periodosTotales: number): number {
  const c = acotar(constancia, 0, 1);
  return Math.max(1, Math.round(1 + c * (Math.max(1, periodosTotales) - 1)));
}

export function hayMandato(
  voces: number,
  umbral: number,
  sostenidos: number,
  coeficientes: Coeficientes = COEFICIENTES,
): boolean {
  if (umbral <= 0) return false;
  return voces >= umbral && sostenidos >= coeficientes.MINIMO_PERIODOS;
}
