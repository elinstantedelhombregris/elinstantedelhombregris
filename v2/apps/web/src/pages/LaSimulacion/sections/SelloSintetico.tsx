import { NADIE_LO_DIJO } from '../simulacion-lectura';

import type { SelloDelModelo } from '@v2/civic-core';

import { Sello } from '~/components/papel/primitives';


/**
 * § El sello de sintético — permanente, y sin forma de cerrarse.
 *
 * La frase del centro es la misma que llevaba la simulación del mapa del 11 de
 * agosto y se queda tal cual: **«Nadie dijo ninguna de estas cosas.»** No es un
 * aviso legal ni una nota al pie: es la afirmación más importante de la
 * pantalla, y por eso está arriba de los resultados y no debajo.
 *
 * Cuatro cosas que dice, y ninguna es decorativa:
 *
 *  1. que el elenco lo escribió un modelo, con su nombre y su digest — la D5 de
 *     la ADR 0009 pide que la procedencia viaje **por corrida**, no en un pie;
 *  2. que el corpus semilla es una sola voz, la del proyecto (regla 5);
 *  3. que lo que sale es una hipótesis sobre una población posible, no una
 *     medición del país (regla 6);
 *  4. que el lado medido de la comparación sigue siendo el único medido.
 *
 * Cuando el elenco lo escribió una regla y no un modelo, el sello **lo dice**
 * en vez de inventar un nombre de modelo: una población fabricada por una
 * fórmula no es una hipótesis de modelo, y darle un sello falso sería peor que
 * no tener ninguno.
 */

export interface SelloSinteticoProps {
  readonly sello: SelloDelModelo | null;
  readonly huella: string;
  readonly personas: number;
  readonly advertencia: string;
  /**
   * Cómo se escribió el corpus cuando NO hubo modelo. Por defecto, la regla
   * determinista — que es lo que son los elencos fabricados de la Simulación.
   * El ejemplo de La Radiografía lo escribió una persona a mano, y su pie
   * decía «escrito por una regla» porque este campo no existía: un sello que
   * existe para decir la procedencia no puede decirla mal.
   */
  readonly sinModelo?: string;
}

export function SelloSintetico({
  sello,
  huella,
  personas,
  advertencia,
  sinModelo = 'escrito por una regla determinista, sin modelo',
}: SelloSinteticoProps) {
  return (
    <section
      aria-label="De dónde salen estas voces"
      className="border-sello mb-8 border-y-2 border-dashed py-6"
    >
      <div className="flex flex-wrap items-start gap-6">
        <Sello color="rojo" rotate={-3}>
          Población sintética
        </Sello>

        <div className="min-w-[260px] flex-1">
          <p className="font-anton text-tinta text-[22px] leading-[1.15]">{NADIE_LO_DIJO}</p>
          <p className="text-tinta-75 mt-2 max-w-[62ch] text-[15px] leading-[1.55]">{advertencia}</p>
          <p className="font-space text-tinta-50 mt-3 text-[11px] uppercase tracking-[0.1em]">
            {personas.toLocaleString('es-AR')} personas · elenco {huella} ·{' '}
            {sello === null
              ? sinModelo
              : `escrito por ${sello.modelo} (${sello.digest.slice(0, 12)}) a temperatura ${String(
                  sello.temperatura,
                )}`}
          </p>
        </div>
      </div>
    </section>
  );
}
