import { ESCENARIO_BRONCA } from './escenario-1-bronca';
import { ESCENARIO_RECLAMO } from './escenario-2-reclamo';
import { CONTRADICCION_CORROBORADA } from './escenario-3-corroboracion';
import { ESCENARIO_DATO } from './escenario-3-dato';
import { PADRON, PROVINCIA_MUDA } from './padron';

import type { Escenario } from './tipos';

/**
 * Los tres escenarios de La Radiografía — la superficie pública.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §12 y
 * `docs/specs/2026-08-01-el-mapa-simulacion.md` §5.4.
 *
 * Tres corpus de 63 voces cada uno, las mismas 44 personas, los mismos 8
 * territorios, los mismos 12 meses. **Lo único que cambia es la calidad de lo
 * que la gente escribió**, y por eso la lección queda aislada: la diferencia
 * entre los tres no se puede atribuir al volumen ni al alcance, porque el
 * volumen y el alcance son idénticos.
 *
 * Lo que el ejemplo enseña, en tres renglones:
 *
 *  1. **La bronca converge más que la precisión.** El escenario 1 produce la
 *     constelación más linda de las tres y no habilita ningún mandato.
 *  2. **La imagen más impresionante es la menos útil.** Ahí está la defensa de
 *     esta página contra su peor uso: ser una máquina de fabricar consenso.
 *  3. **La composición no entra en la legitimidad.** Qué dice la gente cambia
 *     *qué se puede hacer*, no *cuánto representa*.
 */

export const LOS_TRES_ESCENARIOS: readonly Escenario[] = [
  ESCENARIO_BRONCA,
  ESCENARIO_RECLAMO,
  ESCENARIO_DATO,
];

/**
 * El umbral al que este ejemplo cuenta lo que dice que cuenta — **0,40**, y no
 * el 0,72 de la página.
 *
 * No es un número lindo ni una preferencia: es el resultado de medir. Corriendo
 * el motor de verdad sobre estos tres corpus con el `EmbebedorFalso` de
 * `civic-core`, a 0,40 sale exactamente la historia que el ejemplo existe para
 * mostrar, y hay un test que la afirma:
 *
 * | escenario | núcleos | el mayor | voces solas |
 * |---|---|---|---|
 * | La bronca | 6 | **31 de 63** | 19 |
 * | El reclamo | 8 | 11 | 30 |
 * | El dato | 10 | 5 | 37 |
 *
 * Ahí está el hallazgo entero en tres filas: **cuanto más preciso escribe la
 * gente, más se rompe la imagen**. La bronca da un grupo que se come casi la
 * mitad del corpus y no habilita nada; el dato da diez chiquitos y habilita una
 * obligación con plazo.
 *
 * **Estos números son los de la segunda versión del escenario 1.** La primera
 * daba un solo núcleo de 60 sobre 63, y esa cifra estaba inflada a mano: 58 de
 * las 63 frases repetían «nada», y cinco terminaban con la coletilla literal
 * «acá nunca cambia nada». Sacando esas tres palabras el mayor caía a 24. Se
 * reescribieron las 63 sin muleta —ningún token de contenido en más del 13 %
 * del corpus— y la lección quedó igual de en pie con la mitad del brillo. Está
 * contado en `escenario-1-bronca.ts`.
 *
 * **Y qué es esta convergencia.** `EmbebedorFalso` es una bolsa de palabras:
 * todo lo que junta, lo junta por palabras compartidas. **Toda convergencia que
 * muestre este ejemplo es léxica por construcción**, y con este motor no se
 * puede demostrar una tesis sobre significado. Lo que sí se puede demostrar —y
 * es lo que el ejemplo demuestra— es que la bronca tiene un vocabulario chico y
 * compartido y la precisión no. `BolsaDePalabras` lo dice en la pantalla.
 *
 * **Por qué 0,40 y no el 0,72 de `UMBRAL_INICIAL`.** El `UMBRAL_INICIAL` está
 * calibrado —provisoriamente, y la spec §4.6 lo dice— para un modelo de
 * embeddings de verdad, donde dos paráfrasis de la misma queja quedan a 0,8 o
 * más. El `EmbebedorFalso` es una bolsa de palabras con hash: no sabe que
 * «guita» y «plata» son lo mismo, así que todos sus cosenos viven más abajo y
 * la escala entera se corre. El día que este ejemplo corra contra el embebedor
 * real, este número se recalibra midiendo otra vez — no se hereda.
 */
export const UMBRAL_DEL_EJEMPLO = 0.4;

/**
 * El sello, para pasarle a `SelloSintetico` de la Simulación.
 *
 * **Se reusa ese componente, no se escribe uno nuevo.** La frase del centro es
 * la misma de siempre y no se negocia: «Nadie dijo ninguna de estas cosas.»
 *
 * `sello: null` porque acá no hubo modelo. Ojo con eso: el componente, con
 * `null`, imprime «escrito por una regla determinista, sin modelo», y **este
 * corpus tampoco lo escribió una regla — lo escribió una persona a mano**. Por
 * eso la `advertencia` lo dice con todas las letras, que es el único campo
 * libre que el componente ofrece. El pie del sello queda impreciso hasta que
 * `SelloDelModelo` admita una procedencia «escrita a mano», y eso se toca en el
 * archivo de la Simulación, no acá.
 */
export const SELLO_DEL_EJEMPLO = {
  sello: null,
  huella: 'ejemplo-3x63',
  personas: new Set(PADRON.map((p) => p.actor)).size,
  advertencia:
    'Las 63 frases de cada escenario las escribió una persona a mano para este ejemplo: no las dijo nadie, no salieron de la base y no las generó un modelo. Los barrios, las calles, las escuelas y los centros de salud son inventados. Las provincias son las reales, porque la cobertura tiene que poder decir algo cierto sobre un mapa cierto.',
} as const;

/**
 * La cobertura y el sesgo de este corpus, declarados por el corpus mismo —
 * regla 2: **toda síntesis muestra cobertura y sesgo**, y no en un pie.
 *
 * Lo que este ejemplo no puede ver, dicho antes de que alguien saque una
 * conclusión de él:
 */
export const COBERTURA_Y_SESGO: readonly string[] = [
  `De ${PROVINCIA_MUDA} no habló nadie. Está en el padrón, con población y con territorio, y con cero voces: el núcleo más grande del escenario 1 dice «el país está mal» sin una sola voz de acá.`,
  'Dieciséis de las veinticuatro provincias no están ni en el padrón. De ellas el ejemplo no dice nada, y «no dice nada» no es «no pasa nada».',
  'Son 63 señales de 44 personas. Las señales no son personas: una sola persona cargó dos en varios casos, y cualquier lectura que cuente filas como si fueran habitantes está inflada.',
  'Todo el corpus está escrito en el mismo dialecto y por la misma mano. Un corpus real tendría lenguas, registros y errores que este no tiene, y esa uniformidad hace que la máquina converja más fácil de lo que convergería en la calle.',
  'Los siete territorios con voz son urbanos o periurbanos salvo uno. El ejemplo no representa el campo, y su cifra de alcance no debería leerse como si lo hiciera.',
  `Dos señales del escenario 3 están corroboradas y se contradicen: no coinciden en ${CONTRADICCION_CORROBORADA.sobre}. Una dice ${CONTRADICCION_CORROBORADA.diceA}; la otra, ${CONTRADICCION_CORROBORADA.diceB}. ${CONTRADICCION_CORROBORADA.queHaceElRegistro}`,
  'Todo lo que se junta acá se junta por palabras compartidas: los vectores los hizo una bolsa de palabras, no un modelo de lenguaje. Con este motor no se puede demostrar nada sobre el significado de lo que la gente escribió, y este ejemplo no lo intenta.',
];

export { ESCENARIO_BRONCA } from './escenario-1-bronca';
export { ESCENARIO_RECLAMO, FALSO_AMIGO, NUCLEO_MIXTO } from './escenario-2-reclamo';
export { CONTRADICCION_CORROBORADA } from './escenario-3-corroboracion';
export { ESCENARIO_DATO } from './escenario-3-dato';
export {
  AHORA,
  PADRON,
  PROVINCIA_MUDA,
  TERRITORIOS,
  TERRITORIOS_POR_ID,
  armarVoces,
} from './padron';
export {
  REGLA_DEL_MANDATO,
  cifrasDeCorroboracion,
  cifrasDeLegitimidad,
  coberturaDe,
  retratoDe,
} from './cifras';
export { estaCorroborada, claseDeVoz, vozVerificable } from './tipos';
export type { Cobertura, CifrasDeCorroboracion, CifrasDeLegitimidad } from './cifras';
export type { ContradiccionCorroborada } from './escenario-3-corroboracion';
export type {
  Corroboracion,
  Dicho,
  DichoConFecha,
  Escenario,
  MandatoDelEscenario,
  VeredictoDeCorroboracion,
  Voz,
} from './tipos';
export type { IdDeVoz, TerritorioDelEjemplo } from './padron';
