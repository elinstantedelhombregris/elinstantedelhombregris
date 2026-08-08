/**
 * La luz de una celda — spec `docs/specs/2026-08-04-el-registro.md` §6.
 *
 * Dos variables independientes sobre los mismos conteos: el **brillo** dice
 * cuánta gente habló y la **nitidez** dice cuánto se comprobó. Una celda puede
 * estar encendida y borrosa, que es el caso más interesante y el que un solo
 * número no puede contar.
 *
 * La regla de la que sale todo el módulo: **nunca devolver `0` para significar
 * «no sé»**. Cero es un dato — «nadie habló», «nada se confirmó» — y pintar la
 * ignorancia con el mismo color que el silencio hace que el mapa mienta justo
 * donde menos se lo puede permitir, que es el campo sin radio censal fino.
 *
 * Vive en la raíz del paquete y no en `simulacion/` porque mide datos reales.
 * La Simulación modela un país posible; esto describe el que hay.
 */

import { COEFICIENTES_LUZ } from './coeficientes-luz.js';

/** Los conteos ya agregados de una celda. Quién los cuenta es problema de quien llama. */
export interface ConteoCelda {
  cellId: string;
  /**
   * Personas distintas que hablaron, no señales. Si contara señales, un solo
   * vecino entusiasta encendería su cuadra él solo — regla 8 de la
   * Constitución de producto, y la puerta de entrada del brigading.
   */
  vocesDistintas: number;
  /** Habitantes estimados. `null` cuando no hay denominador conocido. */
  habitantes: number | null;
  /** Señales verificables presentes: necesidad, ¡basta!, recurso. */
  verificables: number;
  /** Confirmaciones registradas sobre esas verificables. */
  confirmaciones: number;
}

export type Brillo =
  | { tipo: 'valor'; participacion: number; formula: string }
  | { tipo: 'sinDenominador'; razon: string };

/** Mismo texto que `simulacion/retrato.ts`: los dos hablan del mismo hueco. */
const SIN_POBLACION = 'Sin población conocida: no hay denominador.';

/**
 * No es lo mismo no saber cuánta gente vive acá que saber que no vive nadie.
 * Una celda sobre el agua, un parque o una franja industrial tienen población
 * conocida y vale cero. Las dos caen en `sinDenominador` —ninguna sirve para
 * dividir— pero decirle «sin población conocida» a la segunda es falso.
 */
const POBLACION_CERO = 'Población estimada en cero: no hay denominador.';

/**
 * Cuánta gente habló, como fracción de la que vive ahí.
 *
 * Normalizado por población porque sin denominador el mapa dibuja densidad de
 * población en vez de participación: el microcentro brillaría más que un
 * pueblo donde habló el 40% de la gente. Regla 5 de la Constitución —
 * «la participación no equivale a representatividad».
 */
export const brilloDeCelda = (conteo: ConteoCelda): Brillo => {
  const habitantes = conteo.habitantes;
  if (habitantes === null) return { tipo: 'sinDenominador', razon: SIN_POBLACION };
  if (habitantes <= 0) return { tipo: 'sinDenominador', razon: POBLACION_CERO };
  const crudo = Math.max(0, conteo.vocesDistintas) / habitantes;
  return {
    tipo: 'valor',
    participacion: Math.min(1, crudo),
    formula: 'voces distintas ÷ habitantes',
  };
};

export type Nitidez =
  | { tipo: 'valor'; fraccion: number; formula: string }
  | { tipo: 'inaplicable'; razon: string };

const SIN_HECHOS = 'No hay hechos que comprobar en esta celda.';

/**
 * Cuánto de lo afirmado sobre esta celda pasó por un segundo par de ojos.
 *
 * Sólo los hechos se corroboran: los sueños, valores y compromisos se
 * deliberan — regla 11 de la Constitución. Por eso una celda de puras
 * deliberables no da nitidez cero, da `inaplicable`: cero significa «hay
 * hechos sin confirmar», y ahí no hay ningún hecho pendiente. La ausencia de
 * pregunta no se pinta como mala respuesta.
 */
export const nitidezDeCelda = (conteo: ConteoCelda): Nitidez => {
  const verificables = Math.max(0, conteo.verificables);
  if (verificables === 0) return { tipo: 'inaplicable', razon: SIN_HECHOS };
  const crudo = Math.max(0, conteo.confirmaciones) / verificables;
  return {
    tipo: 'valor',
    fraccion: Math.min(1, crudo),
    formula: 'confirmaciones ÷ señales verificables',
  };
};

/**
 * De participación a intensidad visual, 0 a 1.
 *
 * Devuelve `null` —no `0`— cuando no hay denominador. Quien dibuje tiene que
 * elegir el gris de `sinDato` en ese caso, nunca el oscuro: oscuro ya
 * significa «nadie habló».
 */
export const intensidadDeBrillo = (brillo: Brillo): number | null => {
  if (brillo.tipo !== 'valor') return null;
  const relativa = Math.min(1, brillo.participacion / COEFICIENTES_LUZ.PARTICIPACION_PLENA);
  return Math.pow(relativa, COEFICIENTES_LUZ.CURVA);
};

/**
 * De nitidez a foco visual, 0 a 1.
 *
 * Devuelve un `number` pelado y no `number | null`, al revés que
 * `intensidadDeBrillo`, y la asimetría es deliberada: `sinDenominador` no tiene
 * ninguna intensidad definida —no sabemos nada— mientras que `inaplicable` sí
 * tiene aspecto definido. Spec §6: una celda de puras deliberables «se dibuja
 * encendida y nítida, porque no hay nada pendiente de comprobar». Por eso vale
 * 1 y no 0: cero es «hay hechos sin confirmar».
 *
 * Existe para que esta decisión se tome UNA vez, acá, y no la adivinen por
 * separado el mapa del teléfono y la lente de la web. Lo más probable que
 * adivine cualquiera de los dos para un valor ausente es `0`, que reinstala
 * exactamente la confusión que este módulo prohíbe.
 */
export const focoDeNitidez = (nitidez: Nitidez): number =>
  nitidez.tipo === 'valor' ? nitidez.fraccion : 1;

/** La luz de una celda: los dos ejes y los dos valores ya listos para dibujar. */
export interface LuzCelda {
  cellId: string;
  brillo: Brillo;
  nitidez: Nitidez;
  /** `null` cuando no hay denominador. Quien dibuje elige el gris de `sinDato`. */
  intensidad: number | null;
  /** Nunca `null`: `inaplicable` tiene aspecto definido, y es nítido. */
  foco: number;
}

export const luzDeCelda = (conteo: ConteoCelda): LuzCelda => {
  const brillo = brilloDeCelda(conteo);
  const nitidez = nitidezDeCelda(conteo);
  return {
    cellId: conteo.cellId,
    brillo,
    nitidez,
    intensidad: intensidadDeBrillo(brillo),
    foco: focoDeNitidez(nitidez),
  };
};

export const luzDeCeldas = (conteos: readonly ConteoCelda[]): LuzCelda[] =>
  conteos.map(luzDeCelda);
