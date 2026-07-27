import { publicLocationUncertaintyKm } from '@v2/civic-core';

import type { LocationPrecision } from '@v2/civic-core';

import { kmAUnidades, proyectar } from '~/geo/proyeccion.generated';

/**
 * El render honesto de la precisión (spec 1 §5).
 *
 * Lo que v1 no hacía: dibujar cada señal según la precisión con la que fue
 * publicada, en vez de fingir que todas son puntos. El jitter que había acá
 * antes eran puntos inventados alrededor de un centroide provincial — adorno
 * inofensivo hasta que le pasás un lazo por encima, momento en el que se
 * convierte en una mentira medible.
 *
 * La regla: el halo ES el dato. Su radio no se elige por estética, sale de
 * `publicLocationUncertaintyKm` del núcleo compartido, que es la misma función
 * con la que el servidor decidió cuánto corrió el punto.
 */

export type ModoDibujo = 'lavado' | 'punto';

export interface DibujoSenal {
  modo: ModoDibujo;
  /** Radio del símbolo en unidades del viewBox, a escala 1. */
  radio: number;
  /**
   * Radio VERDADERO de la incertidumbre, en unidades del viewBox. Sin piso.
   *
   * Tuvo un piso de 3 unidades «para que se vea», y eso hacía que `100m` se
   * dibujara igual que `exact` — la deshonestidad exacta que este módulo
   * existe para evitar. A escala país la incertidumbre de 100 m mide 0,02
   * unidades: es invisible, y eso ES la verdad a esa escala. Aparece cuando se
   * hace zoom, que es cuando empieza a importar.
   */
  radioHalo: number;
  /**
   * `true` solo para `exact`. El punto exacto se dibuja con borde nítido; los
   * demás, sin borde, para que se lean blandos.
   *
   * Es lo que carga la información de precisión a escala país, donde ningún
   * halo llega a verse: la certeza se comunica por aspecto, no por tamaño.
   */
  nitido: boolean;
  /** Cómo se nombra esta precisión en la leyenda y en el lector de pantalla. */
  etiqueta: string;
}

const RADIO_PUNTO: Record<Exclude<LocationPrecision, 'province'>, number> = {
  exact: 3,
  '100m': 3,
  '500m': 2.8,
  neighborhood: 2.6,
  city: 2.4,
};

const ETIQUETA: Record<LocationPrecision, string> = {
  exact: 'en su punto exacto',
  '100m': 'a ±100 m',
  '500m': 'a ±500 m',
  neighborhood: 'en su barrio',
  city: 'en el centro de su localidad',
  province: 'a nivel provincia',
};

/**
 * A nivel provincia no hay un punto: hay una provincia. Se dibuja el lavado de
 * tinta sobre toda su forma, y el radio no aplica.
 */
export function dibujoDe(precision: LocationPrecision): DibujoSenal {
  if (precision === 'province') {
    return {
      modo: 'lavado',
      radio: 0,
      radioHalo: 0,
      nitido: false,
      etiqueta: ETIQUETA.province,
    };
  }
  // `exact` devuelve 0 km: sin halo, porque no hay incertidumbre que dibujar.
  const km = publicLocationUncertaintyKm(precision);
  return {
    modo: 'punto',
    radio: RADIO_PUNTO[precision],
    radioHalo: kmAUnidades(km),
    nitido: precision === 'exact',
    etiqueta: ETIQUETA[precision],
  };
}

/**
 * El halo se dibuja solo cuando dice algo: si a la escala actual es más chico
 * que el propio símbolo, dibujarlo sería exagerar la duda en vez de mostrarla.
 *
 * `escala` es cuánto se acercó el lienzo respecto del país (1 = país entero).
 * El símbolo encoge con el zoom, así que a partir de cierta altura el halo lo
 * supera y aparece — que es justo cuando la diferencia entre ±100 m y ±5 km
 * empieza a caer en cuadras distintas.
 */
export function haloVisible(dibujo: DibujoSenal, escala: number): boolean {
  return dibujo.radioHalo > dibujo.radio / escala;
}

export function etiquetaDePrecision(precision: LocationPrecision): string {
  return ETIQUETA[precision];
}

/** Toda precisión desconocida cae en la más gruesa: nunca se finge exactitud. */
export function precisionValida(valor: string): LocationPrecision {
  return valor in ETIQUETA ? (valor as LocationPrecision) : 'province';
}

/**
 * Opacidad del lavado provincial según cuántas señales lo sostienen.
 *
 * Escala logarítmica y con techo: la diferencia entre 1 y 10 voces importa
 * mucho más que entre 400 y 500, y un tope evita que Buenos Aires quede negra
 * y borre todo lo que haya adentro.
 */
export function opacidadLavado(cantidad: number): number {
  if (cantidad <= 0) return 0;
  return Math.min(0.42, 0.06 + Math.log10(cantidad + 1) * 0.13);
}

/** Punto en unidades del viewBox, o null si la señal no tiene coordenada. */
export function puntoDeSenal(
  lat: number | null,
  lng: number | null,
): { x: number; y: number } | null {
  if (lat === null || lng === null) return null;
  return proyectar(lng, lat);
}
