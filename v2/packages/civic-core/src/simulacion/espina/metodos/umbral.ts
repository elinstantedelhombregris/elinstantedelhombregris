/**
 * La búsqueda de umbrales por bisección — el titular del módulo.
 *
 * Spec §2.8. Por el escalón medido, la pregunta útil **no** es «cuánto sube el
 * alcance por cada punto de participación» —la derivada es 0 en casi todo el
 * dominio e infinita en un punto— sino **«¿a partir de qué participación gana
 * mandato mi provincia?»**. Es un número por territorio, se encuentra en unas
 * quince corridas, y es además el número que le sirve a una persona real.
 *
 * Por eso las elasticidades no entran: publicar «elasticidad de la legitimidad
 * respecto de la participación = 0,0» sería técnicamente correcto y
 * completamente engañoso.
 *
 * **La bisección supone monotonía**, y acá se supone con motivo y se verifica
 * en los bordes: más participación es más voces en cada territorio (el reparto
 * es proporcional a un total que crece), y más voces no puede sacar un mandato
 * que ya estaba. Si en el tope del dominio el territorio sigue sin mandato, la
 * respuesta es `inalcanzable` con el tope a la vista, no un número inventado.
 */

import { declarado, derivado } from '../../procedencia.js';
import { conVariable, DOMINIOS } from '../variables.js';

import type { Magnitud } from '../../procedencia.js';
import type { Escenario } from '../escenario.js';

export type UmbralDeTerritorio =
  | {
      readonly estado: 'yaTiene';
      readonly territorioId: string;
      readonly razon: string;
    }
  | {
      readonly estado: 'encontrado';
      readonly territorioId: string;
      readonly participacion: Magnitud;
      readonly corridas: number;
    }
  | {
      readonly estado: 'inalcanzable';
      readonly territorioId: string;
      readonly tope: Magnitud;
      readonly razon: string;
    };

export interface OpcionesUmbral {
  /** Cuándo dejar de partir. 0,01 voces cada 100.000 es más fino que una voz. */
  readonly tolerancia: number;
  readonly maximoDeCorridas: number;
}

export const OPCIONES_UMBRAL: OpcionesUmbral = { tolerancia: 0.01, maximoDeCorridas: 40 };

/**
 * A partir de qué participación cada territorio gana mandato.
 *
 * `tieneMandato` recibe el escenario ya movido y contesta por un territorio.
 * Quién corre el motor no es asunto de este archivo: sirve igual para el modo
 * forma en el hilo principal y para un worker.
 */
export function umbralesDeParticipacion(
  base: Escenario,
  territorios: readonly string[],
  tieneMandato: (esc: Escenario, territorioId: string) => boolean,
  opciones: OpcionesUmbral = OPCIONES_UMBRAL,
): { umbrales: readonly UmbralDeTerritorio[]; corridas: number } {
  const dominio = DOMINIOS.participacion;
  const umbrales: UmbralDeTerritorio[] = [];
  let corridasTotales = 0;

  for (const territorioId of territorios) {
    let corridas = 0;

    const escMinimo = conVariable(base, 'participacion', dominio.minimo);
    corridas += 1;
    if (tieneMandato(escMinimo, territorioId)) {
      umbrales.push({
        estado: 'yaTiene',
        territorioId,
        razon:
          'Con la participación en el mínimo del dominio ya tiene mandato: lo que lo sostiene no ' +
          'es la voz que este barrido mueve.',
      });
      corridasTotales += corridas;
      continue;
    }

    const escMaximo = conVariable(base, 'participacion', dominio.maximo);
    corridas += 1;
    if (!tieneMandato(escMaximo, territorioId)) {
      umbrales.push({
        estado: 'inalcanzable',
        territorioId,
        tope: declarado(dominio.maximo, 'voces cada 100 mil hab.', dominio.razon),
        razon:
          'Ni en el tope del dominio cruza el piso y lo sostiene. Con estas otras palancas, la ' +
          'participación sola no le alcanza.',
      });
      corridasTotales += corridas;
      continue;
    }

    let bajo = dominio.minimo;
    let alto = dominio.maximo;
    while (alto - bajo > opciones.tolerancia && corridas < opciones.maximoDeCorridas) {
      const medio = (bajo + alto) / 2;
      corridas += 1;
      if (tieneMandato(conVariable(base, 'participacion', medio), territorioId)) alto = medio;
      else bajo = medio;
    }

    umbrales.push({
      estado: 'encontrado',
      territorioId,
      participacion: derivado(
        alto,
        'voces cada 100 mil hab.',
        'la participación más baja que le da mandato, por bisección',
        ['participacion', 'veredicto'],
      ),
      corridas,
    });
    corridasTotales += corridas;
  }

  return { umbrales, corridas: corridasTotales };
}
