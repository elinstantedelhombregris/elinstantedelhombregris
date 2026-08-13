/**
 * Los tipos del motor de convergencia.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5
 *
 * El motor no conoce la tabla `senales` ni ninguna fila de base: recibe lo
 * mínimo que necesita para medir, y quien lo llama se encarga de traducir.
 * Eso es lo que le permite correr contra un JSONL de juguete antes de que la
 * tabla exista (spec §8).
 */
import type { GeoPoint } from '../types.js';

/** Lo mínimo que el motor necesita de una señal para agruparla. */
export interface SenalParaNucleo {
  readonly id: string;
  readonly vector: readonly number[];
  /**
   * El texto **sólo si hay cesión de licencia** (spec §4.5.4). `null` cuando
   * no la hay: la señal cuenta, se dibuja y se mide igual, pero no puede
   * prestar su frase como etiqueta de un núcleo.
   */
  readonly texto: string | null;
  /**
   * El punto **engrosado**, nunca el crudo (spec R13). Quien construye este
   * objeto ya pasó por `publicLocation`. `null` cuando la señal no tiene punto.
   */
  readonly punto: GeoPoint | null;
}

/** Una arista *medida*: la infiere la máquina desde los vectores. */
export interface AristaMedida {
  /** Ordenado: `a < b` como string, para que el par no se repita. */
  readonly a: string;
  readonly b: string;
  readonly similitud: number;
}

/**
 * Una arista *declarada*: la afirmó una persona (spec R6). Nunca se dibuja
 * con el mismo trazo que una medida.
 */
export interface AristaDeclarada {
  readonly a: string;
  readonly b: string;
  /** Actores **distintos** que sostienen esta arista, no filas (spec §4.5.2). */
  readonly actores: number;
}

/** Una fila de `adhesiones`, reducida a lo que el motor necesita. */
export interface Adhesion {
  readonly actorId: string;
  readonly senalId: string;
}

export interface Nucleo {
  readonly ids: readonly string[];
}

/**
 * El resultado de cortar el grafo a un umbral. `solas` no es un residuo: una
 * señal que nadie repitió es una voz sola y se muestra como tal (spec §6).
 */
export interface Particion {
  readonly nucleos: readonly Nucleo[];
  readonly solas: readonly string[];
}
