/**
 * La medición de parecido entre dos señales.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5
 *
 * **Este archivo es MEDICIÓN.** No importa `geometria.ts` ni ninguna
 * constante φ, y hay una guarda que lo verifica
 * (`radiografia-guardas.test.ts`). Poner φ adentro de un número medido sería
 * ponerle un número lindo a un dato que no lo pidió (spec R10).
 */

/**
 * Coseno del ángulo entre dos vectores. Rango [-1, 1].
 *
 * Devuelve `0` —y no `NaN`— cuando alguno es el vector cero: un texto sin
 * palabras no se parece a nada, y propagar `NaN` haría que un solo caso
 * borde envenenara el ordenamiento de todo el grafo.
 */
export const similitudCoseno = (a: readonly number[], b: readonly number[]): number => {
  if (a.length !== b.length) {
    throw new Error(`vectores de distinto largo: ${a.length} vs ${b.length}`);
  }
  let punto = 0;
  let normaA = 0;
  let normaB = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    punto += x * y;
    normaA += x * x;
    normaB += y * y;
  }
  if (normaA === 0 || normaB === 0) return 0;
  return punto / (Math.sqrt(normaA) * Math.sqrt(normaB));
};
