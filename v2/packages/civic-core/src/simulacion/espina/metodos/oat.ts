/**
 * Una variable por vez — el tornado.
 *
 * Spec §3.6. Entra porque es la única lectura que alguien no técnico lee sin
 * entrenamiento. Pero **nunca solo**: la respuesta del motor es un escalón
 * —medido, el borde de `participacion` está en 438,15 y una grilla de paso 50
 * evalúa 350 y 400 y no ve nada— así que el tornado va siempre con la nube al
 * lado, para que el escalón se **vea** en vez de quedar promediado adentro de
 * una barra.
 *
 * Dos decisiones que separan esto de un tornado de planilla:
 *
 * - **La monotonía se MIDE sobre los puntos intermedios**, no se supone. Una
 *   variable que sube y después baja es información de primera clase y no un
 *   promedio que esconder: `noMonotona` es una salida, no una excepción.
 * - **Una variable que el motor no lee no da una barra de largo cero**, da una
 *   fila con su razón. Una barra en cero se lee «la medimos y no importa», que
 *   es una afirmación completamente distinta y falsa.
 *
 * ## «Cuánto mueve» es UNA definición, no dos
 *
 * Había dos acá adentro y nadie lo había notado: la barra publicaba `bajo` y
 * `alto` —los dos **extremos del rango declarado**— y por otro lado `amplitud`
 * —el **recorrido observado**, máximo − mínimo sobre todos los puntos—. Para una
 * variable monótona coinciden; para una que sube y después baja, no. Medido con
 * `participacion = 180`, `constancia = 0,6` y `resistencia = 0`: `horizonte`
 * ordenaba primero con amplitud 0,6667 y dibujaba una barra de 0,600, y
 * `participacion` ordenaba segundo con 0,625 y dibujaba 0,625. **El ojo leía lo
 * contrario de lo que decía la lista.** Una barra que ordena mal es peor que no
 * tener tornado, porque parece conocimiento.
 *
 * Se elige el **recorrido observado** —`minimo`, `maximo`, `amplitud`— y es lo
 * que se ordena y lo que se dibuja. El argumento: una variable que sube y vuelve
 * al mismo lugar tiene `|alto − bajo| = 0` y **movió el resultado de punta a
 * punta**; ordenarla última sería afirmar que no mueve nada, que es falso.
 * `bajo` y `alto` siguen publicándose porque contestan otra pregunta —dónde
 * empieza y dónde termina el recorrido— pero **ya no son la longitud de la
 * barra**.
 *
 * ## La unidad sale del objetivo, no de una constante
 *
 * `bajo`, `alto` y `amplitud` fijaban `'fracción'` a mano. Con
 * `objetivo = territoriosConMandato` —cuyo `Resumen` declara `territorios`—
 * salía `{ valor: 4, unidad: 'fracción' }`: la primitiva de honestidad cargando
 * un dato falso. La unidad la dice `leerObjetivo(corrida, objetivo).unidad`, que
 * es la del número que efectivamente se midió.
 */

import { declarado, derivado } from '../../procedencia.js';
import { leerObjetivo } from '../corrida.js';
import { estimacionSinDominio } from '../estimacion.js';
import {
  CLASE_DE_VARIABLE,
  conVariable,
  conectadaEn,
  DOMINIOS,
  leerVariable,
  muestrear,
  razonDeNoConectada,
} from '../variables.js';

import type { Magnitud } from '../../procedencia.js';
import type { Corrida, Objetivo } from '../corrida.js';
import type { Escenario } from '../escenario.js';
import type { Estimacion } from '../estimacion.js';
import type { ClaseDeVariable, ClaveVariable, ModoDeCorrida } from '../variables.js';

export type Monotonia = 'creciente' | 'decreciente' | 'noMonotona' | 'plana';

export interface PuntoDeBarra {
  readonly entrada: number;
  readonly salida: number;
}

export type BarraDeTornado =
  | {
      readonly estado: 'medida';
      readonly clave: ClaveVariable;
      readonly clase: ClaseDeVariable;
      /** El objetivo en el PISO del rango declarado. Dónde empieza el recorrido. */
      readonly bajo: Magnitud;
      /** El objetivo en el TOPE del rango declarado. Dónde termina. */
      readonly alto: Magnitud;
      /**
       * El menor y el mayor valor OBSERVADOS sobre el rango.
       *
       * No siempre son `bajo` y `alto`: una variable no monótona pasa por
       * afuera de sus dos extremos. Esto es lo que se dibuja, y `amplitud` —lo
       * que se ordena— es exactamente `maximo − minimo`.
       */
      readonly minimo: Magnitud;
      readonly maximo: Magnitud;
      readonly amplitud: Magnitud;
      readonly monotonia: Monotonia;
      readonly puntos: readonly PuntoDeBarra[];
      readonly razonDelRango: Magnitud;
    }
  | {
      readonly estado: 'noConectada';
      readonly clave: ClaveVariable;
      readonly clase: ClaseDeVariable;
      readonly incertidumbre: Estimacion;
    };

/** Igualdad con tolerancia: un cambio de 1e-12 no es una tendencia. */
const IGUALES = 1e-12;

export function monotoniaDe(salidas: readonly number[]): Monotonia {
  let sube = false;
  let baja = false;
  for (let i = 1; i < salidas.length; i++) {
    const previo = salidas[i - 1] ?? 0;
    const actual = salidas[i] ?? 0;
    if (actual - previo > IGUALES) sube = true;
    if (previo - actual > IGUALES) baja = true;
  }
  if (sube && baja) return 'noMonotona';
  if (sube) return 'creciente';
  if (baja) return 'decreciente';
  return 'plana';
}

export interface OpcionesOat {
  readonly pasos: number;
  readonly objetivo: Objetivo;
  readonly modo: ModoDeCorrida;
}

/**
 * Barre cada clave por separado desde su escenario base.
 *
 * `correrUno` recibe el escenario ya modificado y devuelve la corrida reducida;
 * quién lo corre —el modo forma, el modo gente, un worker— no es asunto de este
 * archivo, y por eso el método sirve para los dos modos sin una rama.
 */
export function barrerUnaPorVez(
  base: Escenario,
  claves: readonly ClaveVariable[],
  correrUno: (esc: Escenario) => Corrida,
  opciones: OpcionesOat,
): { barras: readonly BarraDeTornado[]; corridas: number } {
  const barras: BarraDeTornado[] = [];
  let corridas = 0;
  const pasos = Math.max(2, Math.round(opciones.pasos));

  for (const clave of claves) {
    const clase = CLASE_DE_VARIABLE[clave];

    if (!conectadaEn(clave, opciones.modo)) {
      barras.push({
        estado: 'noConectada',
        clave,
        clase,
        incertidumbre: estimacionSinDominio(clave, razonDeNoConectada(clave, opciones.modo)),
      });
      continue;
    }

    const dominio = DOMINIOS[clave];
    const puntos: PuntoDeBarra[] = [];
    /** La del objetivo medido, nunca una constante. `null` hasta la primera corrida. */
    let unidad: string | null = null;
    for (let i = 0; i < pasos; i++) {
      const entrada = muestrear(dominio, i / (pasos - 1));
      const esc = conVariable(base, clave, entrada);
      const corrida = correrUno(esc);
      corridas += 1;
      const medida = leerObjetivo(corrida, opciones.objetivo);
      unidad = medida.unidad;
      // Se relee del escenario: `conVariable` acota y redondea, así que el
      // valor que la barra reporta es el que el motor realmente usó.
      puntos.push({ entrada: leerVariable(esc, clave) ?? entrada, salida: medida.valor });
    }

    if (unidad === null) {
      // `pasos` es al menos 2, así que esto no puede pasar. Se tira en vez de
      // poner una unidad por defecto: inventar «fracción» para un objetivo que
      // se cuenta en territorios es el defecto que este archivo acaba de cerrar.
      throw new Error(
        `El barrido de «${clave}» no produjo ninguna corrida, así que no hay unidad del objetivo ` +
          'que copiar. Una barra con la unidad inventada es peor que ninguna barra.',
      );
    }

    const salidas = puntos.map((p) => p.salida);
    const primero = salidas[0] ?? 0;
    const ultimo = salidas[salidas.length - 1] ?? 0;
    let minimo = primero;
    let maximo = primero;
    for (const s of salidas) {
      if (s < minimo) minimo = s;
      if (s > maximo) maximo = s;
    }

    barras.push({
      estado: 'medida',
      clave,
      clase,
      bajo: derivado(primero, unidad, `${opciones.objetivo} en el piso del rango declarado`, [clave]),
      alto: derivado(ultimo, unidad, `${opciones.objetivo} en el tope del rango declarado`, [clave]),
      minimo: derivado(
        minimo,
        unidad,
        `el menor ${opciones.objetivo} observado sobre el rango declarado`,
        [clave],
      ),
      maximo: derivado(
        maximo,
        unidad,
        `el mayor ${opciones.objetivo} observado sobre el rango declarado`,
        [clave],
      ),
      amplitud: derivado(
        maximo - minimo,
        unidad,
        `máximo − mínimo de ${opciones.objetivo} sobre el rango declarado`,
        [clave],
      ),
      monotonia: monotoniaDe(salidas),
      puntos,
      razonDelRango: declarado(dominio.maximo, 'tope del rango', dominio.razon),
    });
  }

  return { barras, corridas };
}
