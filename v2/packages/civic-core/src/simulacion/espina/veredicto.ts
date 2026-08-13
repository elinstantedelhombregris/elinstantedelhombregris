/**
 * El veredicto del mandato — spec §3.5 y arreglo #5 del §6.1.
 *
 * `RetratoTerritorio.tieneMandato` era un `boolean` pelado: el **único** campo
 * del resultado sin procedencia, y justamente la afirmación que alguien captura
 * en pantalla («mi provincia tiene mandato»). La guarda «sin números
 * huérfanos» no lo cazaba porque no es un número.
 *
 * Ahora no sale un `hay: true` sin las tres magnitudes que lo produjeron, y un
 * `false` dice **por qué** faltó — que es la mitad de la utilidad del
 * instrumento: «te faltan voces» y «te falta sostenerlo» son dos consejos
 * distintos para dos personas distintas.
 *
 * `hayMandato()` no se toca: se la llama una vez por clave del eje.
 */

import { COEFICIENTES } from '../coeficientes.js';
import { hayMandato } from '../mandato.js';

import type { Coeficientes } from '../coeficientes.js';
import type { Magnitud } from '../procedencia.js';

export type FaltaDeMandato = 'ninguna' | 'piso' | 'constancia' | 'las dos';

export interface Veredicto {
  readonly hay: boolean;
  readonly voces: Magnitud;
  readonly umbral: Magnitud;
  readonly sostenidos: Magnitud;
  readonly falta: FaltaDeMandato;
}

/**
 * Un umbral ≤ 0 cuenta como piso faltante y no como piso cruzado.
 *
 * Es el caso de un territorio sin población conocida: no hay denominador, así
 * que no hay piso que cruzar. Decir que lo cruzó porque cero voces alcanzan un
 * umbral de cero sería el peor de los dos errores posibles — un mandato
 * regalado justo donde no sabemos nada.
 */
export function veredictoDe(
  voces: Magnitud,
  umbral: Magnitud,
  sostenidos: Magnitud,
  coeficientes: Coeficientes = COEFICIENTES,
): Veredicto {
  const hay = hayMandato(voces.valor, umbral.valor, sostenidos.valor, coeficientes);
  const faltaPiso = !(umbral.valor > 0 && voces.valor >= umbral.valor);
  const faltaConstancia = sostenidos.valor < coeficientes.MINIMO_PERIODOS;
  const falta: FaltaDeMandato =
    faltaPiso && faltaConstancia
      ? 'las dos'
      : faltaPiso
        ? 'piso'
        : faltaConstancia
          ? 'constancia'
          : 'ninguna';

  return { hay, voces, umbral, sostenidos, falta };
}
