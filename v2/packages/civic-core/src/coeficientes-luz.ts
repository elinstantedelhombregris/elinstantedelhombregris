/**
 * Los coeficientes de la luz — decisiones nuestras, no medidas.
 *
 * Mismo criterio que `simulacion/coeficientes.ts`: viven juntos, con su razón
 * escrita, y cambiarlos es cambiar una constante a la vista. La diferencia es
 * que éstos no viajan como `declarado` porque no son parte del motor de la
 * Simulación: gobiernan cómo se dibuja lo medido, no qué se modela.
 */
export interface CoeficientesLuz {
  /** Participación que se lee como celda plenamente encendida. */
  readonly PARTICIPACION_PLENA: number;
  /** Exponente de la rampa. Menor que 1 levanta la parte baja de la curva. */
  readonly CURVA: number;
}

export const COEFICIENTES_LUZ: CoeficientesLuz = {
  /**
   * 5% de los habitantes de una celda. Es un número alto y elegido a
   * conciencia: si el 5% de un barrio dejó una voz, ese barrio habló de
   * verdad. Poner la referencia más abajo haría que un puñado de personas
   * pintara una cuadra entera de plata viva, que es exactamente la mentira
   * que la normalización viene a evitar.
   *
   * Es una decisión de diseño sin datos todavía. Cuando entren voces reales
   * hay que volver acá y mirarlo de nuevo.
   */
  PARTICIPACION_PLENA: 0.05,

  /**
   * 0,45 — cerca de una raíz cuadrada. La participación real vive en el
   * extremo bajo de la escala: una rampa lineal dejaría el país entero
   * indistinguible del negro y la idea no se vería nunca. La curva levanta la
   * parte baja para que la diferencia entre «una voz» y «ninguna» sea visible,
   * sin que «una voz» parezca un barrio movilizado.
   */
  CURVA: 0.45,
};
