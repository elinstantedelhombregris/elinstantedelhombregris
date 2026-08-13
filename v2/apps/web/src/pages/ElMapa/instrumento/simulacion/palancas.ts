import type { Palancas } from '@v2/civic-core';

/**
 * El punto de partida de la Simulación.
 *
 * Vive separado del panel por el fast refresh de Vite: un archivo que exporta
 * componentes Y constantes pierde el hot reload de esos componentes. Es regla
 * del tooling, la misma que separó `catalogo-modos.ts`.
 *
 * No arranca en cero a propósito. Con participación 0 los dos lados de la
 * cortina serían idénticos y la primera impresión sería que la herramienta no
 * hace nada; 200 cada 100.000 es el doble del piso, así que abre mostrando un
 * país que efectivamente cambia.
 */
export const PALANCAS_INICIALES: Palancas = {
  participacion: 200,
  dispersion: 0.6,
  /**
   * Las CUATRO CLASES del canon, parejas — el mismo reparto con que abre
   * `escenarioBase` en la espina, porque es el único que no afirma nada.
   *
   * Eran los seis tipos viejos, con `valor` adentro: un vocabulario que ningún
   * cálculo leía y que sobrevivía justamente por eso. La palanca es la clase y
   * no el tipo porque la clase es la que toca maquinaria — `hecho` y `acto` se
   * corroboran, `deseo` se delibera, `meta` se responde.
   */
  composicion: { hecho: 0.25, deseo: 0.25, acto: 0.25, meta: 0.25 },
  horizonte: 2,
  resistencia: 0.3,
  constancia: 0.7,
  cumplimiento: 0.5,
};
