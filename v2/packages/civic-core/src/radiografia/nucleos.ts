/**
 * De aristas a núcleos.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5
 *
 * Un núcleo es una **componente conexa del grafo visible al umbral que el
 * lector eligió**. Que sea el mismo grafo que se dibuja no es un detalle de
 * implementación: es lo que garantiza que la métrica y el dibujo no puedan
 * discrepar (spec R5).
 *
 * **Este archivo es MEDICIÓN.** No importa `geometria.ts` (spec R10).
 */
import type { AristaMedida, Nucleo, Particion } from './tipos.js';

/** Union-find con compresión de camino. */
const raizDe = (padre: Map<string, string>, id: string): string => {
  let actual = id;
  let arriba = padre.get(actual) ?? actual;
  while (arriba !== actual) {
    const abuelo = padre.get(arriba) ?? arriba;
    padre.set(actual, abuelo);
    actual = abuelo;
    arriba = padre.get(actual) ?? actual;
  }
  return actual;
};

/**
 * Corta el grafo al umbral y devuelve sus componentes.
 *
 * `solas` **no es un residuo**: una señal que nadie repitió es una voz sola y
 * se muestra como tal, con el mismo peso tipográfico que el conteo de núcleos
 * (spec §6). Por eso sale del mismo cálculo y no de una resta hecha después.
 */
export const nucleosAlUmbral = (
  ids: readonly string[],
  aristas: readonly AristaMedida[],
  umbral: number,
): Particion => {
  const padre = new Map<string, string>(ids.map((id) => [id, id]));
  const tocadas = new Set<string>();

  for (const arista of aristas) {
    if (arista.similitud < umbral) continue;
    if (!padre.has(arista.a) || !padre.has(arista.b)) continue;
    tocadas.add(arista.a);
    tocadas.add(arista.b);
    const ra = raizDe(padre, arista.a);
    const rb = raizDe(padre, arista.b);
    if (ra !== rb) padre.set(ra, rb);
  }

  const porRaiz = new Map<string, string[]>();
  for (const id of ids) {
    if (!tocadas.has(id)) continue;
    const r = raizDe(padre, id);
    const grupo = porRaiz.get(r);
    if (grupo) grupo.push(id);
    else porRaiz.set(r, [id]);
  }

  const nucleos: Nucleo[] = [...porRaiz.values()]
    .map((grupo) => ({ ids: [...grupo].sort() }))
    // Orden estable y significativo: primero los grandes, y a igual tamaño
    // por el primer id, para que dos corridas del mismo dato den lo mismo.
    .sort((p, q) => q.ids.length - p.ids.length || ((p.ids[0] ?? '') < (q.ids[0] ?? '') ? -1 : 1));

  return { nucleos, solas: ids.filter((id) => !tocadas.has(id)) };
};
