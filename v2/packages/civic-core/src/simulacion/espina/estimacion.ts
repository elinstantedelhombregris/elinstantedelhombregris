/**
 * La incertidumbre es un tipo, no un dibujo — spec §3.6.
 *
 * Cuatro variantes y ninguna quinta, y la disciplina es la misma que
 * `brillo.ts` ya tiene con `sinDenominador`: **nunca un 0 para decir «no sé»**.
 *
 * - `'exacta'` **no es un intervalo de ancho cero.** El modo forma es
 *   determinista: decir «±0» sugeriría que se midió una varianza y dio cero,
 *   cuando lo que pasa es que no hay varianza que medir. Un modelo incapaz de
 *   dudar no es un modelo más certero.
 * - `'sinDominio'` es lo que impide el tornado mentiroso. Una palanca que el
 *   motor no lee no da una barra de largo cero —que se leería como «no
 *   importa»—: da una fila gris con la razón escrita. Es la diferencia entre
 *   «lo medimos y no mueve» y «no está enchufada».
 * - `'sinDato'` cubre el caso que el pedido nombra como «varianza no estimable
 *   con N corridas»: con pocas muestras, un p05 y un p95 son los extremos
 *   disfrazados de percentiles.
 *
 * Y lo que esto **no** mide, dicho acá para que no se lea como lo que no es
 * (§8.4): la dispersión que sale de un barrido es la que produce **el rango que
 * la persona declaró**. No es el intervalo de confianza de un pronóstico. Que
 * el piso sean 100 voces cada 100.000 o que el período sea el mes no se estima
 * con corridas: se declara, y se barre aparte.
 */

import { declarado, derivado } from '../procedencia.js';

import type { Magnitud } from '../procedencia.js';
import type { ClaveVariable } from './variables.js';

/**
 * Debajo de veinte muestras no se publican percentiles.
 *
 * Es el mismo régimen de honestidad que `UMBRAL_PORCENTAJE` en el Mandato
 * Vivo, con el número más chico que corresponde: con 20 muestras el p05 y el
 * p95 todavía son los extremos observados, y arriba de eso empiezan a ser una
 * lectura. Se elige un número y se escribe, en vez de dibujar una banda que
 * nadie puede sostener.
 */
export const MINIMO_MUESTRAS = 20;

export type Estimacion =
  | {
      tipo: 'muestra';
      centro: Magnitud;
      p05: Magnitud;
      p25: Magnitud;
      p75: Magnitud;
      p95: Magnitud;
      minimo: Magnitud;
      maximo: Magnitud;
      n: number;
    }
  | { tipo: 'exacta'; valor: Magnitud }
  | { tipo: 'sinDominio'; clave: ClaveVariable; razon: string }
  | { tipo: 'sinDato'; razon: string };

/**
 * Percentil por interpolación lineal sobre la muestra ordenada.
 *
 * `valores` tiene que venir ordenado; ordenarlo acá adentro haría que estimar
 * siete percentiles ordenara siete veces el mismo array, que en un barrido de
 * mil corridas es la diferencia entre un instante y un rato.
 */
export function percentil(ordenados: readonly number[], p: number): number {
  if (ordenados.length === 0) return 0;
  const primero = ordenados[0] ?? 0;
  if (ordenados.length === 1) return primero;

  const posicion = Math.min(1, Math.max(0, p)) * (ordenados.length - 1);
  const abajo = Math.floor(posicion);
  const arriba = Math.min(ordenados.length - 1, abajo + 1);
  const a = ordenados[abajo] ?? primero;
  const b = ordenados[arriba] ?? a;
  return a + (b - a) * (posicion - abajo);
}

/**
 * La estimación de una muestra de corridas.
 *
 * El centro es la **mediana** y no el promedio: la respuesta del motor es un
 * escalón —medido, el borde de `participacion` está en 438,15 y a los costados
 * el resultado no se mueve—, así que un promedio cae en un valor que ninguna
 * corrida produjo. La mediana siempre es un valor que alguna corrida dio.
 */
export function estimarDeMuestras(
  valores: readonly number[],
  unidad: string,
  formula: string,
  de: readonly string[],
): Estimacion {
  const n = valores.length;
  if (n === 0) return { tipo: 'sinDato', razon: 'No se corrió ninguna muestra.' };

  if (n < MINIMO_MUESTRAS) {
    return {
      tipo: 'sinDato',
      razon:
        `${String(n)} corridas no alcanzan para estimar dispersión: por debajo de ` +
        `${String(MINIMO_MUESTRAS)}, un p05 y un p95 son los extremos observados con otro nombre.`,
    };
  }

  const ordenados = [...valores].sort((a, b) => a - b);
  const minimo = ordenados[0] ?? 0;
  const maximo = ordenados[n - 1] ?? 0;

  if (minimo === maximo) {
    return {
      tipo: 'exacta',
      valor: derivado(minimo, unidad, `${formula} (las ${String(n)} corridas dieron lo mismo)`, de),
    };
  }

  const m = (valor: number): Magnitud => derivado(valor, unidad, formula, de);
  return {
    tipo: 'muestra',
    centro: m(percentil(ordenados, 0.5)),
    p05: m(percentil(ordenados, 0.05)),
    p25: m(percentil(ordenados, 0.25)),
    p75: m(percentil(ordenados, 0.75)),
    p95: m(percentil(ordenados, 0.95)),
    minimo: m(minimo),
    maximo: m(maximo),
    n,
  };
}

/**
 * Un motor determinista sobre un eje: un valor, y se dice que es exacto.
 *
 * **Lleva su `n` en la fórmula, y no es adorno.** «Todas las corridas dieron lo
 * mismo» es una afirmación cuyo peso depende de cuántas fueron: con 200 dice
 * algo del dominio barrido, con 4 puede ser un accidente de cuatro sorteos.
 * `estimarDeMuestras` ya lo escribía así cuando el mínimo y el máximo coinciden
 * (`estimacion.ts:110`); este atajo —el de `barrer.ts`, que corta antes de
 * llegar allá— publicaba la misma conclusión sin decir sobre cuántas se apoya.
 *
 * No lleva piso de muestras a propósito, y ahí se aparta de `estimarDeMuestras`:
 * un p05 y un p95 sobre cuatro corridas son los extremos observados disfrazados
 * de percentil, pero «las cuatro dieron 0,25» es cierto con cuatro. Lo que
 * había que arreglar no era el permiso, era la frase.
 */
export const estimacionExacta = (valor: Magnitud, n: number): Estimacion => ({
  tipo: 'exacta',
  valor: derivado(
    valor.valor,
    valor.unidad,
    `${valor.procedencia.tipo === 'derivado' ? valor.procedencia.formula : 'valor del objetivo'} (las ${String(n)} corridas dieron lo mismo)`,
    valor.procedencia.tipo === 'derivado' ? valor.procedencia.de : [],
  ),
});

/** Una variable que el motor no lee. Nunca una barra de largo cero. */
export const estimacionSinDominio = (clave: ClaveVariable, razon: string): Estimacion => ({
  tipo: 'sinDominio',
  clave,
  razon,
});

/** El valor que se muestra cuando hay que mostrar uno solo. */
export function centroDe(estimacion: Estimacion): Magnitud | null {
  switch (estimacion.tipo) {
    case 'muestra':
      return estimacion.centro;
    case 'exacta':
      return estimacion.valor;
    case 'sinDominio':
    case 'sinDato':
      return null;
  }
}

/**
 * El ancho de la banda, cuando hay banda.
 *
 * Devuelve `null` —no `0`— para las tres variantes que no son muestra, por la
 * misma razón por la que `intensidadDeBrillo` devuelve `null` sin denominador:
 * lo más probable que adivine quien dibuje para un valor ausente es `0`, y ahí
 * vuelve exactamente la confusión que este módulo prohíbe.
 */
export function anchoDe(estimacion: Estimacion): Magnitud | null {
  if (estimacion.tipo !== 'muestra') return null;
  return declarado(
    estimacion.p95.valor - estimacion.p05.valor,
    estimacion.p95.unidad,
    'p95 − p05 del rango declarado',
  );
}
