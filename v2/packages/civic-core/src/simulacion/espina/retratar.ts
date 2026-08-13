/**
 * De cosecha a retrato — la mitad de la espina que no sabe qué modo la produjo.
 *
 * Spec §5.1. `armarRetrato` ya aceptaba un conteo externo, así que las dos
 * dinámicas entran por el mismo lugar y salen con los mismos cuatro escalares
 * comparables. Eso es lo que permite que el mandato, la procedencia, la
 * cobertura, el barrido y la cortina sean **uno solo**.
 *
 * Dos cosas que acá se derivan y antes se imponían:
 *
 * - `sostenidos` son los períodos con voz de cada territorio, contados de la
 *   cosecha. Antes el lado simulado le asignaba el mismo número a todos, hasta
 *   a los que no recibían una sola voz.
 * - el piso sale de `esc.ajustes.resistencia` y de `esc.coeficientes`, que son
 *   los mismos que obedecen los dos modos.
 */

import { pisoEfectivo } from '../mandato.js';
import { armarRetrato } from '../retrato.js';

import { periodosConVozPorTerritorio, vocesPorTerritorio , filtrarPorClase } from './cosecha.js';

import type { Cosecha } from './cosecha.js';
import type { EjeDeMandato, Escenario, Pais } from './escenario.js';
import type { SelloDelModelo } from '../procedencia.js';
import type { Retrato } from '../tipos.js';

/**
 * La cosecha que corresponde al eje del mandato.
 *
 * `tipo` y `tema` **tiran**. La cosecha lleva territorio × período × clase, así
 * que un mandato por tipo o por tema no es computable desde acá y no lo será
 * hasta que la cosecha lleve esos ejes (rebanadas 2 y 5). Devolver el retrato
 * de todas las clases haciéndolo pasar por el de un tipo sería mucho peor que
 * romper: nadie lo notaría, y el ranking de temas que la spec previa pedía
 * saldría lleno de números que no significan lo que dicen.
 */
export function aplicarEje(cosecha: Cosecha, eje: EjeDeMandato): Cosecha {
  switch (eje.eje) {
    case 'ninguno':
      return cosecha;
    case 'clase':
      return filtrarPorClase(cosecha, eje.clave);
    case 'tipo':
    case 'tema':
      throw new Error(
        `El eje «${eje.eje}» no es computable desde una cosecha de territorio × período × clase. ` +
          'Entra cuando la cosecha lleve ese eje; hasta entonces, pedirlo tiene que romper.',
      );
  }
}

/**
 * El sello viaja aparte y no adentro del `Escenario` a propósito: el escenario
 * es lo citable y se comparte por URL, y el sello describe la corrida del
 * modelo que escribió la población, que es otra cosa y no viaja en un link.
 */
export function retratar(
  cosecha: Cosecha,
  esc: Escenario,
  pais: Pais,
  sello: SelloDelModelo | null = null,
): Retrato {
  const delEje = aplicarEje(cosecha, esc.eje);

  return armarRetrato({
    conteo: vocesPorTerritorio(delEje),
    sostenidosPorTerritorio: periodosConVozPorTerritorio(delEje),
    periodosTotales: delEje.periodos,
    piso: pisoEfectivo(esc.ajustes.resistencia, esc.coeficientes),
    territorios: pais.territorios,
    fuente:
      cosecha.autoridad === 'hipotesis'
        ? 'una población generada por un modelo, no medida'
        : 'participación × población ÷ 100.000, repartida por dispersión',
    esMedido: false,
    coeficientes: esc.coeficientes,
    sello: cosecha.autoridad === 'hipotesis' ? sello : null,
  });
}
