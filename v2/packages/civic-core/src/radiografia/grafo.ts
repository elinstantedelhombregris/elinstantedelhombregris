/**
 * El grafo de convergencia.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5
 *
 * **Este archivo es MEDICIÓN.** No importa `geometria.ts` (spec R10).
 */
import { similitudCoseno } from './similitud.js';

import type { Adhesion, AristaDeclarada, AristaMedida } from './tipos.js';

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

/**
 * Las aristas *declaradas*: las que afirmó una persona.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5.2
 *
 * Los nodos del grafo son **señales**, y un actor no es un nodo — así que una
 * adhesión no es directamente una arista. Se derivan dos formas, las dos
 * entre señales:
 *
 * - **co-adhesión**: un mismo actor adhirió a dos señales;
 * - **adhesión del autor**: el actor que firma una señal adhirió a otra.
 *
 * Se cuentan **actores distintos y no filas**, igual que la decisión 7 de
 * `docs/specs/2026-08-11-b-la-senal.md`: veinte actores de la misma persona
 * no son veinte afirmaciones, y dos filas del mismo actor tampoco.
 *
 * `autorDe` mapea `senalId → actorId` de quien la firma.
 */
export const TECHO_ADHESIONES_POR_ACTOR = 200;

export const aristasDeclaradas = (
  adhesiones: readonly Adhesion[],
  autorDe: ReadonlyMap<string, string>,
): AristaDeclarada[] => {
  // Las dos bolsas van SEPARADAS a propósito. Volcarlas en una sola —que es
  // como estaba— hace que las señales firmadas por un mismo actor se crucen
  // entre sí, y «compartimos autor» no es una afirmación sobre que dos señales
  // se parezcan. La spec §4.5.2 habilita co-adhesión y adhesión del autor, y
  // nada más: firmada × firmada no existe.
  const adheridasPor = new Map<string, Set<string>>();
  const firmadasPor = new Map<string, Set<string>>();
  const sumar = (bolsa: Map<string, Set<string>>, actorId: string, senalId: string): void => {
    const set = bolsa.get(actorId);
    if (set) set.add(senalId);
    else bolsa.set(actorId, new Set([senalId]));
  };

  for (const { actorId, senalId } of adhesiones) sumar(adheridasPor, actorId, senalId);
  for (const [senalId, actorId] of autorDe) {
    // Sólo entra el autor que además adhirió a algo: sin adhesión no hay
    // ninguna arista que su firma pueda sostener.
    if (adheridasPor.has(actorId)) sumar(firmadasPor, actorId, senalId);
  }

  const cuenta = new Map<string, Set<string>>();
  const anotar = (actorId: string, a: string, b: string): void => {
    if (a === b) return;
    const c = clave(a, b);
    const actores = cuenta.get(c);
    if (actores) actores.add(actorId);
    else cuenta.set(c, new Set([actorId]));
  };

  for (const [actorId, adheridas] of adheridasPor) {
    /*
     * Techo por actor. Esto es O(m²) en las señales de UN actor y sin límite
     * se come la máquina: medido, 4.000 adhesiones de un mismo actor generan
     * 7.998.000 aristas y ~3,6 GB de heap. Doscientas es un número alto para
     * una persona y bajo para un ataque. Un actor por encima del techo no
     * aporta aristas — sus adhesiones siguen contando en todo lo demás.
     *
     * El techo es visible acá y hay un test que lo fija; que además se muestre
     * en pantalla cuando exista el consumidor está anotado en `docs/DEUDAS.md`.
     */
    const lista = [...adheridas].sort().slice(0, TECHO_ADHESIONES_POR_ACTOR);

    // Co-adhesión: el mismo actor adhirió a dos señales.
    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        const a = lista[i];
        const b = lista[j];
        if (!a || !b) continue;
        anotar(actorId, a, b);
      }
    }

    // Adhesión del autor: la señal que firma ↔ cada señal a la que adhirió.
    const firmadas = [...(firmadasPor.get(actorId) ?? [])].sort();
    for (const firmada of firmadas) {
      for (const adherida of lista) anotar(actorId, firmada, adherida);
    }
  }

  return [...cuenta.entries()]
    .map(([c, actores]) => {
      const [a = '', b = ''] = c.split(PAR);
      return { a, b, actores: actores.size };
    })
    .sort((p, q) => q.actores - p.actores || (p.a < q.a ? -1 : p.a > q.a ? 1 : p.b < q.b ? -1 : 1));
};
