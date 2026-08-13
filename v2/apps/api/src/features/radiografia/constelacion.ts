/**
 * Dónde se dibuja cada cosa. **Esto es PRESENTACIÓN y nada más.**
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §5.6, R10.
 *
 * φ gobierna la presentación y jamás la medición. Este archivo es el único de
 * la feature que toca `esferaDeFibonacci` y `espiralAurea`; `service.ts` le
 * pide posiciones y no sabe cómo salen, y ni la similitud, ni el umbral, ni el
 * conteo de núcleos, ni un kilómetro publicado pasan por acá. Poner φ adentro
 * de un número medido sería ponerle un número lindo a un dato que no lo pidió.
 *
 * Que las posiciones vengan del servidor y no del navegador tampoco es
 * casualidad: la lista ordenable y la constelación son **el mismo estado**
 * (R11), y dos cálculos del mismo acomodo son dos verdades que pueden
 * discrepar.
 */
import { esferaDeFibonacci, espiralAurea } from '@v2/civic-core';

import type { Punto3 } from '@v2/civic-core';

/**
 * El radio del disco donde se acomodan las señales de un núcleo, en unidades
 * de la esfera unitaria. Chico a propósito: un núcleo tiene que leerse como
 * una mancha y no como una nube que se mete adentro de la de al lado.
 */
const RADIO_DE_NUCLEO = 0.18;

/**
 * Una base ortonormal del plano tangente a la esfera en `n`.
 *
 * Sin esto, la espiral de un núcleo se dibujaría siempre sobre el plano XY y
 * los núcleos cerca de los polos quedarían vistos de canto: sus señales se
 * apilarían en una línea y no se podrían clickear, que es exactamente el
 * problema que la esfera de Fibonacci vino a resolver un nivel más arriba.
 */
const baseTangente = (n: Punto3): readonly [Punto3, Punto3] => {
  // Un auxiliar que no sea casi paralelo a `n`, o el producto vectorial da
  // un vector de largo ~0 y la base se degenera.
  const aux: Punto3 = Math.abs(n.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
  const cruz = (a: Punto3, b: Punto3): Punto3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  });
  const normalizar = (v: Punto3): Punto3 => {
    const largo = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return largo === 0 ? { x: 1, y: 0, z: 0 } : { x: v.x / largo, y: v.y / largo, z: v.z / largo };
  };
  const u = normalizar(cruz(aux, n));
  return [u, normalizar(cruz(n, u))];
};

const redondear = (n: number): number => Number(n.toFixed(6));

/**
 * Los centros del cielo: un punto por núcleo y un punto por voz sola.
 *
 * Las **voces solas entran en el mismo reparto** y no en una bandeja aparte:
 * una señal que nadie repitió no es un residuo, es una voz sola y se muestra
 * con el mismo peso (spec §6). Sacarlas de la esfera las mandaría al fondo de
 * la escena, que es una afirmación visual que el dato no sostiene.
 */
export const centrosDelCielo = (nucleos: number, solas: number): readonly Punto3[] =>
  esferaDeFibonacci(nucleos + solas);

/** Las posiciones de las señales de un núcleo, alrededor de su centro. */
export const miembrosDelNucleo = (centro: Punto3, cuantas: number): readonly Punto3[] => {
  const [u, v] = baseTangente(centro);
  return espiralAurea(cuantas, RADIO_DE_NUCLEO).map((p) => ({
    x: redondear(centro.x + u.x * p.x + v.x * p.y),
    y: redondear(centro.y + u.y * p.x + v.y * p.y),
    z: redondear(centro.z + u.z * p.x + v.z * p.y),
  }));
};

/** El centro tal cual, para una voz sola: es su propio núcleo de uno. */
export const puntoDeVozSola = (centro: Punto3): Punto3 => ({
  x: redondear(centro.x),
  y: redondear(centro.y),
  z: redondear(centro.z),
});
