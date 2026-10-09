import { useId } from 'react';

import { type Tema } from '../radiografia-data';
import { type OrigenDeLaVista } from '../radiografia-vista';

/**
 * § El deslizador de umbral — el mando principal (spec R7, §4.6).
 *
 * El lector define qué tan parecido es «lo mismo». Nosotros no elegimos un
 * umbral y lo presentamos como la verdad: elegimos uno provisorio, lo
 * declaramos en pantalla, y le damos la perilla a quien mira.
 *
 * `0,72` no sale de 1/φ ni de ningún número lindo (R10): es provisorio, no se
 * puede calibrar sin corpus, y la spec §4.6 lo dice con esas palabras.
 */

export interface DeslizadorUmbralProps {
  umbral: number;
  onCambiar: (umbral: number) => void;
  /** De dónde sale lo que se está viendo. Los cuatro estados se dicen distinto. */
  origen: OrigenDeLaVista;
  nucleos: number;
  solas: number;
  tema: Tema;
  /** Rango del mando. Los dos por defecto son los de la página viva (§4.6). */
  min?: number;
  max?: number;
  /**
   * La etiqueta del mando.
   *
   * La página monta **dos** deslizadores: el del corpus vivo y el del ejemplo
   * de los tres escenarios. Con la misma etiqueta en los dos, quien navega con
   * un lector de pantalla escucha dos veces «qué tan parecido es lo mismo» y no
   * tiene forma de saber cuál de las dos constelaciones está por mover.
   */
  etiqueta?: string;
  /**
   * El pie que explica de dónde sale el valor inicial.
   *
   * Es un parámetro y no una constante porque el mando lo comparten dos
   * corpus con dos calibraciones distintas: la página viva arranca en 0,72,
   * calibrado —provisoriamente— para un modelo de verdad, y el ejemplo de los
   * tres escenarios arranca en 0,40, que es lo que mide el `EmbebedorFalso`.
   * Imprimir «0,72» debajo de un deslizador que arranca en 0,40 sería un pie
   * que contradice el número que tiene al lado.
   */
  nota?: string;
}

/**
 * Cada estado dice la verdad de su estado. El tercero —`esperando`— es el que
 * cuesta y el que importa: bajar el umbral pide aristas que el servidor no
 * mandó, y el navegador no puede fundir islas con un grafo al que le falta la
 * mitad. Antes que dibujar más islas de las que hay, se dice que se está
 * esperando.
 */
const GLOSA: Readonly<Record<OrigenDeLaVista, string>> = {
  medido: 'Bajá el nivel y los grupos se juntan; subilo y se separan.',
  recalculado:
    'Recalculado acá mientras se mide este corte: las provincias y los kilómetros llegan con la respuesta.',
  esperando: 'Esto es todavía el corte anterior: el nuevo se está midiendo.',
  exacto:
    'Este corte se calcula entero acá, en los dos sentidos: el ejemplo trae todas las relaciones, así que bajar el nivel no deja nada afuera.',
};

/** El pie de la página viva. El ejemplo pasa el suyo. */
const NOTA_POR_DEFECTO =
  'El valor inicial, 0,72, es provisorio: no se puede calibrar sin una cantidad suficiente de aportes.';

export function DeslizadorUmbral({
  umbral,
  onCambiar,
  origen,
  nucleos,
  solas,
  tema,
  min = 0.3,
  max = 0.95,
  nota = NOTA_POR_DEFECTO,
  etiqueta = 'Qué tan parecido es «lo mismo»',
}: DeslizadorUmbralProps) {
  const nocturno = tema === 'nocturno';
  const rotulo = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  // El id se genera y no se escribe: la página viva y el ejemplo de los tres
  // escenarios montan este mando dos veces en el mismo documento, y dos
  // `<label for="umbral-de-convergencia">` mandan a la misma perilla — con lo
  // cual una de las dos etiquetas apunta al deslizador equivocado.
  const idBase = useId();
  const idDelMando = `${idBase}-umbral`;
  const idDeLaGlosa = `${idBase}-glosa`;

  return (
    <div className={`border-t ${nocturno ? 'border-oscuro-borde' : 'border-papel-borde'} pt-5`}>
      <label
        htmlFor={idDelMando}
        className={`font-space mb-3 block text-[11px] font-bold uppercase tracking-[0.14em] ${rotulo}`}
      >
        {etiqueta}
      </label>

      <div className="flex items-center gap-4">
        <input
          id={idDelMando}
          type="range"
          min={min}
          max={max}
          step={0.01}
          value={umbral}
          onChange={(e) => {
            onCambiar(Number(e.target.value));
          }}
          aria-describedby={idDeLaGlosa}
          className="accent-violeta h-1 flex-1 cursor-pointer"
        />
        <output
          htmlFor={idDelMando}
          className={`font-space w-[64px] text-right text-[20px] font-bold tabular-nums ${texto}`}
        >
          {umbral.toFixed(2).replace('.', ',')}
        </output>
      </div>

      <p id={idDeLaGlosa} className={`mt-3 text-[14px] leading-[1.55] ${rotulo}`}>
        {/* El conteo de aportes sin grupo va en el MISMO renglón y con el mismo
            peso que el de grupos (§6). Un aporte que nadie repitió no es un
            fracaso del sistema: está solo, y se muestra como tal. */}
        <strong className={texto}>{nucleos > 0 ? nucleos : 'Ningún'}</strong>{' '}
        {nucleos > 1 ? 'grupos' : 'grupo'} ·{' '}
        <strong className={texto}>{solas > 0 ? solas : 'ninguno'}</strong> sin grupo.{' '}
        {GLOSA[origen]}
      </p>

      <p className={`mt-2 text-[13px] leading-[1.5] ${rotulo}`}>{nota}</p>
    </div>
  );
}
