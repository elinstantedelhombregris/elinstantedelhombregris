/**
 * El grafo de convergencia.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5
 *
 * **Este archivo es MEDICIÓN.** No importa `geometria.ts` (spec R10).
 */
import { similitudCoseno } from './similitud.js';

import type { AristaMedida } from './tipos.js';

const PAR = '\u0000';

/** Clave canónica de un par no dirigido. */
const clave = (a: string, b: string): string => (a < b ? `${a}${PAR}${b}` : `${b}${PAR}${a}`);

/**
 * Para cada señal, sus `k` vecinas más parecidas por coseno.
 *
 * El resultado es **no dirigido y sin pares repetidos**: se emite la unión de
 * los k-NN de cada lado, que es lo correcto porque «ser vecina de» no es
 * simétrico —`b` puede estar entre las k mejores de `a` sin que `a` esté
 * entre las k mejores de `b`— y descartar ese caso perdería aristas reales.
 *
 * Es O(n²) en comparaciones. A escala del corpus que esta página va a tener
 * en su primer año, eso corre en milisegundos; el día que duela, el k-NN se
 * mueve al índice HNSW de la base (spec §4.4) sin cambiar esta firma.
 */
export const aristasMedidas = (
  vectores: ReadonlyMap<string, readonly number[]>,
  k: number,
): AristaMedida[] => {
  const ids = [...vectores.keys()];
  if (ids.length < 2 || k < 1) return [];

  const vistas = new Set<string>();
  const salida: AristaMedida[] = [];

  for (const id of ids) {
    const v = vectores.get(id);
    if (!v) continue;

    const vecinas = ids
      .filter((otro) => otro !== id)
      .map((otro) => ({ otro, similitud: similitudCoseno(v, vectores.get(otro) ?? []) }))
      // Desempate por id para que el resultado sea estable entre corridas: sin
      // esto, dos vecinas con la misma similitud pueden alternar y el grafo
      // cambia sin que cambie el dato.
      .sort((p, q) => q.similitud - p.similitud || (p.otro < q.otro ? -1 : 1))
      .slice(0, k);

    for (const { otro, similitud } of vecinas) {
      const c = clave(id, otro);
      if (vistas.has(c)) continue;
      vistas.add(c);
      salida.push(id < otro ? { a: id, b: otro, similitud } : { a: otro, b: id, similitud });
    }
  }

  return salida;
};
