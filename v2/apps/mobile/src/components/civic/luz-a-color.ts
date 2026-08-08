/**
 * De luz a color — spec `docs/specs/2026-08-04-el-registro.md` §6.1.
 *
 * Tres estados y no dos. El que más importa es el tercero: una celda **sin
 * denominador** no se puede pintar del color de «nadie habló», porque oscuro
 * ya significa eso. Confundirlos hace que el mapa mienta justo en el campo,
 * que es donde no hay radio censal fino.
 *
 * Vive suelto y con tests porque es la regla que hace que el mapa no mienta:
 * enterrada adentro de un componente de mapa, nadie la volvería a mirar.
 */

import type { LuzCelda } from '@v2/civic-core';

/** Nadie habló todavía. Es la tarea, no un error. */
export const MUDA = '#241F17';
/** No sabemos cuánta gente vive acá. Nunca es lo mismo que la anterior. */
export const SIN_DATO = '#3A362D';

/** La plata: el país encendido. Hombre Gris → plata → argentum → Argentina. */
const PLATA = { r: 226, g: 232, b: 240 };

export interface ColorCelda {
  fill: string;
  stroke: string;
}

export const colorDeLuz = (luz: LuzCelda): ColorCelda => {
  if (luz.intensidad === null) {
    return { fill: SIN_DATO, stroke: 'rgba(140,138,130,0.45)' };
  }
  if (luz.intensidad === 0) {
    return { fill: MUDA, stroke: 'rgba(140,138,130,0.30)' };
  }
  // El relleno lleva el brillo; el trazo lleva el foco. Una celda puede estar
  // encendida y borrosa, y eso tiene que verse.
  const alfa = 0.10 + luz.intensidad * 0.70;
  return {
    fill: `rgba(${PLATA.r},${PLATA.g},${PLATA.b},${alfa.toFixed(3)})`,
    stroke: `rgba(${PLATA.r},${PLATA.g},${PLATA.b},${(0.25 + luz.foco * 0.55).toFixed(3)})`,
  };
};
