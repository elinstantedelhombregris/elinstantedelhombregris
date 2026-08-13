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
import { haversineKm } from '../geo.js';

import { similitudCoseno } from './similitud.js';

import type { AristaMedida, Nucleo, Particion, SenalParaNucleo } from './tipos.js';

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
    // Se escribe como prueba POSITIVA y no como descarte (`< umbral`) porque
    // con `NaN` el descarte falla ABIERTO: `NaN < 0.99` es falso, así que una
    // arista sin similitud se pegaba a cualquier umbral, incluso a 1. Con
    // `!(x >= u)` un NaN —en la similitud o en el umbral— cae afuera, que es
    // el lado correcto para fallar: sin medición no hay convergencia.
    if (!(arista.similitud >= umbral)) continue;
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

/**
 * La frase que rotula un núcleo: la señal **real** más cercana a su centro.
 *
 * Nunca un resumen generado (spec R8, y regla 6 de la constitución de
 * producto: la máquina sugiere, no determina). La máquina elige *cuál*
 * mostrar; nunca *qué decir*.
 *
 * El centro se calcula sobre **todas** las señales del núcleo, tengan cesión
 * o no —el centro del núcleo es el centro del núcleo—, pero sólo puede
 * prestar su frase una señal **con cesión de licencia** (spec §4.5.4). Si
 * ninguna la tiene, devuelve `null` y quien llama muestra el motivo.
 */
export const fraseDelNucleo = (
  senales: readonly SenalParaNucleo[],
): { id: string; texto: string } | null => {
  if (senales.length === 0) return null;

  // El largo sale del MÁXIMO de todos los vectores y no del primero: mirando
  // sólo `senales[0]` un núcleo entero se quedaba sin etiqueta porque el
  // elemento que quedó primero traía el vector vacío, aunque el resto
  // estuviera perfecto y con cesión.
  const dimensiones = senales.reduce((maximo, s) => Math.max(maximo, s.vector.length), 0);
  if (dimensiones === 0) return null;

  /** Rellena con ceros para que un vector corto no haga tirar al coseno. */
  const alLargo = (v: readonly number[]): readonly number[] =>
    v.length === dimensiones ? v : Array.from({ length: dimensiones }, (_, i) => v[i] ?? 0);

  const centro = new Array<number>(dimensiones).fill(0);
  for (const s of senales) {
    for (let i = 0; i < dimensiones; i++) {
      centro[i] = (centro[i] ?? 0) + (s.vector[i] ?? 0);
    }
  }

  let elegida: { id: string; texto: string } | null = null;
  let mejor = -Infinity;
  for (const s of senales) {
    if (s.texto === null) continue;
    const cerca = similitudCoseno(alLargo(s.vector), centro);
    // Desempate por id: dos señales igual de centrales no pueden alternar
    // entre corridas o la etiqueta del núcleo parpadearía sin motivo.
    if (cerca > mejor || (cerca === mejor && elegida !== null && s.id < elegida.id)) {
      mejor = cerca;
      elegida = { id: s.id, texto: s.texto };
    }
  }
  return elegida;
};

/**
 * El par de señales del núcleo geográficamente más distante.
 *
 * Es el número que convierte «todos quieren lo mismo» de consigna en
 * medición. Sale del **punto engrosado** —quien construye `SenalParaNucleo`
 * ya pasó por `publicLocation`— y se redondea a la decena de kilómetros
 * (spec R13): la precisión almacenada es un espejo de lo que declaró el
 * cliente, no una protección, y publicar un número al kilómetro sobre
 * domicilios sería publicar un padrón.
 */
export const dosMasLejanos = (
  senales: readonly SenalParaNucleo[],
): { a: string; b: string; km: number } | null => {
  const conPunto = senales.filter(
    (s): s is SenalParaNucleo & { punto: NonNullable<SenalParaNucleo['punto']> } =>
      s.punto !== null,
  );
  if (conPunto.length < 2) return null;

  let mejor: { a: string; b: string; km: number } | null = null;
  for (let i = 0; i < conPunto.length; i++) {
    for (let j = i + 1; j < conPunto.length; j++) {
      const p = conPunto[i];
      const q = conPunto[j];
      if (!p || !q) continue;
      const km = haversineKm(p.punto, q.punto);
      if (!mejor || km > mejor.km) {
        mejor = p.id < q.id ? { a: p.id, b: q.id, km } : { a: q.id, b: p.id, km };
      }
    }
  }
  if (!mejor) return null;
  // Redondeo a la decena, con un piso de 10 para toda distancia positiva.
  // Sin el piso, cualquier par a menos de 5 km publicaba «0 km», que no es
  // un redondeo sino otra afirmación: dice «en el mismo lugar». Redondear
  // para arriba nunca acerca a dos personas más de lo que están, que es el
  // lado seguro. El 0 queda reservado para la distancia que de verdad es 0.
  const redondeada = Math.round(mejor.km / 10) * 10;
  return { a: mejor.a, b: mejor.b, km: mejor.km > 0 ? Math.max(10, redondeada) : 0 };
};
