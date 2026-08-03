/**
 * Los coeficientes publicados — spec §3.4.
 *
 * No son medidos ni los mueve la persona: son decisiones nuestras. Viven acá,
 * juntos y con su razón escrita, y viajan como `{ tipo: 'declarado' }`. No se
 * disfrazan de medidos, y cambiarlos es cambiar una constante a la vista.
 */
export interface Coeficientes {
  /** Voces cada 100.000 habitantes que constituyen mandato. */
  PISO_MANDATO: number;
  /** Cuánto multiplica al piso la resistencia máxima. */
  K_RESISTENCIA: number;
  /** Períodos sostenidos mínimos para que el mandato cuente. */
  MINIMO_PERIODOS: number;
  /** Períodos que tiene un año. */
  PERIODOS_POR_ANIO: number;
}

export const COEFICIENTES: Coeficientes = {
  /**
   * 100 cada 100.000 es 1 de cada 1.000 habitantes. Es el orden de magnitud
   * de un petitorio barrial que se toma en serio: bajo para ser alcanzable,
   * alto para que un puñado de personas no sea un mandato.
   */
  PISO_MANDATO: 100,

  /**
   * A resistencia 1 el piso se quintuplica. La obstrucción total tiene que
   * ser superable y cara: si fuera insuperable, el simulador enseñaría
   * fatalismo, y si fuera gratis enseñaría ingenuidad.
   */
  K_RESISTENCIA: 4,

  /**
   * Tres meses sosteniendo el piso. Menos que eso es un pico, y un pico no
   * gobierna — es lo que «El que grita» existe para mostrar.
   */
  MINIMO_PERIODOS: 3,

  /** El período es el mes. */
  PERIODOS_POR_ANIO: 12,
};
