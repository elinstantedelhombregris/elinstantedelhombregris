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

const SIN_POBLACION = 'Sin población conocida: no hay denominador.';

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
  if (habitantes === null || habitantes <= 0) {
    return { tipo: 'sinDenominador', razon: SIN_POBLACION };
  }
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

/** La luz de una celda: los dos ejes más la intensidad ya lista para dibujar. */
export interface LuzCelda {
  cellId: string;
  brillo: Brillo;
  nitidez: Nitidez;
  /** `null` cuando no hay denominador. Quien dibuje elige el gris de `sinDato`. */
  intensidad: number | null;
}

export const luzDeCelda = (conteo: ConteoCelda): LuzCelda => {
  const brillo = brilloDeCelda(conteo);
  return {
    cellId: conteo.cellId,
    brillo,
    nitidez: nitidezDeCelda(conteo),
    intensidad: intensidadDeBrillo(brillo),
  };
};

export const luzDeCeldas = (conteos: readonly ConteoCelda[]): LuzCelda[] =>
  conteos.map(luzDeCelda);
