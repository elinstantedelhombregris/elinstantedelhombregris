/**
 * φ — y sólo para la presentación.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §5.6, R10
 *
 * **Este archivo es PRESENTACIÓN.** Ningún módulo de medición —`similitud`,
 * `grafo`, `nucleos`— puede importarlo, y `radiografia-guardas.test.ts` falla
 * si alguno lo hace. Poner φ adentro del umbral, del número de núcleos o de
 * una distancia publicada sería ponerle un número lindo a un dato que no lo
 * pidió.
 *
 * Lo que φ sí compra acá es **utilidad medible**: con los centroides
 * repartidos al azar sobre la esfera se apelmazan de un lado y dejan huecos
 * del otro, y quedan núcleos escondidos detrás de otros — existen en el dato
 * y no se pueden clickear. El ángulo áureo es el método estándar para
 * repartir puntos en una esfera sin apelmazar; es la misma ley que ordena las
 * semillas del girasol.
 */

export const PHI = (1 + Math.sqrt(5)) / 2;

/** 360°/φ² ≈ 137,50776°, en radianes. */
export const ANGULO_AUREO = Math.PI * (3 - Math.sqrt(5));

export interface Punto3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Punto2 {
  readonly x: number;
  readonly y: number;
}

/** `n` puntos casi equidistantes sobre la esfera unitaria. */
export const esferaDeFibonacci = (n: number): Punto3[] => {
  if (n <= 0) return [];
  if (n === 1) return [{ x: 0, y: 0, z: 1 }];

  const puntos: Punto3[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const radio = Math.sqrt(Math.max(0, 1 - y * y));
    const angulo = i * ANGULO_AUREO;
    puntos.push({ x: Math.cos(angulo) * radio, y, z: Math.sin(angulo) * radio });
  }
  return puntos;
};

/**
 * `n` puntos en espiral áurea dentro de un disco de `radio`.
 *
 * Para acomodar las señales adentro de un núcleo cuando el lector entra al
 * nivel 1. El `√((i + ½)/n)` es lo que reparte el área parejo: sin él la
 * espiral se amontona en el centro.
 */
export const espiralAurea = (n: number, radio: number): Punto2[] => {
  if (n <= 0) return [];
  return Array.from({ length: n }, (_, i) => {
    const r = radio * Math.sqrt((i + 0.5) / n);
    const angulo = i * ANGULO_AUREO;
    return { x: Math.cos(angulo) * r, y: Math.sin(angulo) * r };
  });
};

/** Escala modular φ: 1 · 1,618 · 2,618 · 4,236 — radios de nodo y grosores. */
export const escalaModular = (paso: number): number => PHI ** paso;
