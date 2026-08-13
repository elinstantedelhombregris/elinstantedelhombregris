/**
 * Hipercubo latino y ranking de importancia — el método principal.
 *
 * Spec §3.6. Tres decisiones, cada una contra un error que se comete solo:
 *
 * 1. **Hipercubo latino y no grilla.** Una grilla de paso 50 sobre
 *    `participacion` evalúa 350 y 400 y se saltea la transición entera, que
 *    está en 438,15: reportaría sensibilidad cero en la palanca más importante
 *    del modelo. El hipercubo estratifica cada dimensión por separado, así que
 *    ningún tramo queda sin visitar por más gruesa que sea la muestra.
 * 2. **Spearman y no Pearson.** La respuesta es un escalón; Pearson mide
 *    linealidad y descontaría como «poco importante» una variable que decide
 *    todo de golpe. Spearman correlaciona rangos: le alcanza con que el orden
 *    se conserve.
 * 3. **El intervalo por bootstrap sobre las mismas muestras.** Es gratis:
 *    remuestrear un array no son corridas nuevas. Sin intervalo, un ranking de
 *    importancia con 200 muestras se lee como si sus decimales significaran
 *    algo.
 *
 * ## Una sola vara de «cuántas corridas alcanzan», compartida con `estimacion.ts`
 *
 * Este archivo no tenía piso de n y `estimacion.ts` cortaba en
 * `MINIMO_MUESTRAS`. Con cinco corridas la misma pantalla decía «5 corridas no
 * alcanzan para estimar dispersión» arriba y publicaba `ρ 0,71 · [0,73, 1,00]`
 * dos centímetros más abajo — **con el estimador puntual afuera de su propio
 * intervalo**, porque un bootstrap percentil sobre cinco muestras remuestrea
 * empates y se corre entero. Quien mira no tiene cómo saber cuál de los dos
 * creer.
 *
 * La vara es una y es la de `estimacion.ts`, por el mismo argumento y con el
 * mismo número: por debajo de `MINIMO_MUESTRAS`, un cuantil del remuestreo es
 * el extremo observado con otro nombre. Se importa de allá en vez de copiarse
 * — dos constantes con el mismo propósito es cómo empiezan a divergir.
 */

import { derivado } from '../../procedencia.js';
import { azarDe } from '../azar.js';
import { MINIMO_MUESTRAS } from '../estimacion.js';
import { DOMINIOS, muestrear } from '../variables.js';

import type { Magnitud } from '../../procedencia.js';
import type { ClaveVariable } from '../variables.js';

/**
 * El diseño: una fila por muestra, una columna por clave, ya en unidades de la
 * variable (no en [0, 1)).
 *
 * El azar entra por coordenada —`azarDe(semilla, muestra, dimensión, propósito)`—
 * y no por una corriente lineal. La consecuencia que un PRNG secuencial no da:
 * **agregar una dimensión no corre el azar de las demás**, así que dos barridos
 * con distinto número de variables siguen siendo comparables. Sin eso, un Monte
 * Carlo mide su propio reordenamiento y nadie se entera.
 */
const PROPOSITO_ESTRATO = 201;
const PROPOSITO_PERMUTA = 202;

export function hipercuboLatino(
  claves: readonly ClaveVariable[],
  muestras: number,
  semilla: number,
): readonly (readonly number[])[] {
  const n = Math.max(1, Math.round(muestras));
  const filas: number[][] = [];
  for (let i = 0; i < n; i++) filas.push([]);

  for (let d = 0; d < claves.length; d++) {
    const clave = claves[d];
    if (clave === undefined) continue;
    const dominio = DOMINIOS[clave];

    // Un estrato por muestra, y después se permutan los estratos entre filas.
    const orden: number[] = [];
    for (let i = 0; i < n; i++) orden.push(i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(azarDe(semilla, d, i, PROPOSITO_PERMUTA) * (i + 1));
      const a = orden[i];
      const b = orden[j];
      if (a !== undefined && b !== undefined) {
        orden[i] = b;
        orden[j] = a;
      }
    }

    for (let i = 0; i < n; i++) {
      const estrato = orden[i] ?? i;
      const dentro = azarDe(semilla, d, i, PROPOSITO_ESTRATO);
      const u = (estrato + dentro) / n;
      filas[i]?.push(muestrear(dominio, u));
    }
  }

  return filas;
}

/** Los rangos de un array, promediando los empates. */
export function rangos(valores: readonly number[]): number[] {
  const indices = valores.map((_, i) => i);
  indices.sort((a, b) => (valores[a] ?? 0) - (valores[b] ?? 0));

  const salida = new Array<number>(valores.length).fill(0);
  let i = 0;
  while (i < indices.length) {
    let j = i;
    while (j + 1 < indices.length && (valores[indices[j + 1] ?? 0] ?? 0) === (valores[indices[i] ?? 0] ?? 0)) {
      j += 1;
    }
    const promedio = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) {
      const indice = indices[k];
      if (indice !== undefined) salida[indice] = promedio;
    }
    i = j + 1;
  }
  return salida;
}

/**
 * Correlación de rangos de Spearman.
 *
 * Devuelve `null` —no `0`— cuando alguno de los dos lados es constante: sin
 * variación no hay correlación que medir, y un 0 ahí se leería «no se
 * relacionan», que es otra cosa. Es la misma regla de `brillo.ts`.
 */
export function spearman(x: readonly number[], y: readonly number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;
  const rx = rangos(x);
  const ry = rangos(y);

  let sumaX = 0;
  let sumaY = 0;
  for (let i = 0; i < rx.length; i++) {
    sumaX += rx[i] ?? 0;
    sumaY += ry[i] ?? 0;
  }
  const mediaX = sumaX / rx.length;
  const mediaY = sumaY / ry.length;

  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (let i = 0; i < rx.length; i++) {
    const dx = (rx[i] ?? 0) - mediaX;
    const dy = (ry[i] ?? 0) - mediaY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }
  if (varX === 0 || varY === 0) return null;
  return cov / Math.sqrt(varX * varY);
}

export type Importancia =
  | {
      readonly estado: 'medida';
      readonly clave: ClaveVariable;
      readonly correlacion: Magnitud;
      readonly p05: Magnitud;
      readonly p95: Magnitud;
      readonly n: number;
    }
  | {
      readonly estado: 'sinVariacion';
      readonly clave: ClaveVariable;
      readonly razon: string;
    }
  /**
   * Menos corridas que el piso. **No es lo mismo que `sinVariacion`**: allá se
   * midió y no se movió; acá no alcanza para medir, y decirlo con las palabras
   * de la otra sería afirmar un hecho sobre el modelo que nadie comprobó.
   */
  | {
      readonly estado: 'sinMuestras';
      readonly clave: ClaveVariable;
      readonly razon: string;
      readonly n: number;
    };

const PROPOSITO_BOOTSTRAP = 203;
const REMUESTREOS = 200;

/**
 * Importancia por correlación de rangos, con su intervalo por bootstrap.
 *
 * El bootstrap remuestrea las mismas corridas: no cuesta una corrida más. Y su
 * azar también entra por coordenada, así que el intervalo de la variable 3 no
 * cambia porque se haya agregado una variable 4 al barrido.
 *
 * El piso de n se comprueba **antes** que la constancia de los dos lados: con
 * cuatro corridas, «no varió» es un accidente de cuatro corridas y no una
 * propiedad del modelo, y publicarlo como propiedad sería sobreafirmar. Debajo
 * del piso la única respuesta honesta es cuántas corridas hicieron falta.
 */
export function importanciaDe(
  clave: ClaveVariable,
  entradas: readonly number[],
  salidas: readonly number[],
  semilla: number,
  dimension: number,
): Importancia {
  const corridas = Math.min(entradas.length, salidas.length);
  if (corridas < MINIMO_MUESTRAS) {
    return {
      estado: 'sinMuestras',
      clave,
      n: corridas,
      razon:
        `${String(corridas)} corridas no alcanzan para rankear importancia: por debajo de ` +
        `${String(MINIMO_MUESTRAS)}, un percentil del bootstrap es el extremo observado con otro ` +
        'nombre, y el ρ puede quedar afuera de su propio intervalo. Es la misma vara con la que ' +
        'se decide si hay dispersión que publicar.',
    };
  }

  const correlacion = spearman(entradas, salidas);
  if (correlacion === null) {
    return {
      estado: 'sinVariacion',
      clave,
      razon:
        'Uno de los dos lados no varió en todo el barrido: sin variación no hay correlación que ' +
        'medir, y un 0 se leería como «no se relacionan».',
    };
  }

  const muestras: number[] = [];
  // `spearman` ya devolvió null si los dos lados no median lo mismo, así que
  // acá `corridas` es la longitud de los dos.
  const n = corridas;
  for (let b = 0; b < REMUESTREOS; b++) {
    const ex: number[] = [];
    const sy: number[] = [];
    for (let i = 0; i < n; i++) {
      const j = Math.floor(azarDe(semilla, dimension, b * n + i, PROPOSITO_BOOTSTRAP) * n);
      ex.push(entradas[j] ?? 0);
      sy.push(salidas[j] ?? 0);
    }
    const r = spearman(ex, sy);
    if (r !== null) muestras.push(r);
  }
  muestras.sort((a, b) => a - b);

  const cuantil = (p: number): number => {
    if (muestras.length === 0) return correlacion;
    const i = Math.min(muestras.length - 1, Math.max(0, Math.round(p * (muestras.length - 1))));
    return muestras[i] ?? correlacion;
  };

  const formula = 'correlación de rangos de Spearman entre la variable y el objetivo';
  return {
    estado: 'medida',
    clave,
    correlacion: derivado(correlacion, 'ρ', formula, [clave, 'objetivo']),
    p05: derivado(cuantil(0.05), 'ρ', `${formula}, percentil 5 de ${String(REMUESTREOS)} remuestreos`, [clave]),
    p95: derivado(cuantil(0.95), 'ρ', `${formula}, percentil 95 de ${String(REMUESTREOS)} remuestreos`, [clave]),
    n,
  };
}
