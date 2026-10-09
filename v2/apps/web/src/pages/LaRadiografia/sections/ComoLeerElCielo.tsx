import { CLASES_SENAL } from '@v2/civic-core';

import { colorDeClase, NOMBRE_DE_CLASE, QUE_SE_HACE, type Tema } from '../radiografia-data';

/**
 * § Cómo leer el cielo — la leyenda que faltaba.
 *
 * La revisión del 19/8 encontró el círculo cerrado: la única leyenda de color
 * vivía adentro de la ficha, y la ficha sólo aparece después de tocar un
 * grupo — había que entender el dibujo para poder abrir la explicación del
 * dibujo. Se quitó en algún momento y la revisión del 9/10 la pidió de vuelta:
 * «grupo», la palabra que organiza la página entera, volvía a no definirse en
 * ninguna superficie.
 *
 * Esto es una leyenda, no un tutorial: qué es cada cosa que se ve, los cuatro
 * colores con su verbo, y qué se puede tocar. Va antes de la imagen por la
 * misma razón que la procedencia va en la cabecera: primero se sabe qué se
 * está mirando, después se mira.
 *
 * Los nombres de las clases son los de todo el sitio (`CLASE_ROTULO`, vía
 * `NOMBRE_DE_CLASE`) y los verbos salen de `QUE_SE_HACE` —la misma tabla que
 * usa la ficha— con el «esto» recortado. Y ni un hexadecimal: el color sale
 * entero de `colorDeClase`, que es lo que la guarda del color verifica.
 */

export interface ComoLeerElCieloProps {
  readonly tema: Tema;
}

/** `esto se corrobora` → `se corrobora`: el verbo pelado, para la leyenda. */
const verboDeClase = (clase: (typeof CLASES_SENAL)[number]): string =>
  QUE_SE_HACE[clase].replace(/^esto /, '');

export function ComoLeerElCielo({ tema }: ComoLeerElCieloProps) {
  const nocturno = tema === 'nocturno';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-papel-borde';

  return (
    <section aria-label="Cómo leer el cielo" className={`mb-6 border-y ${borde} py-4`}>
      <p className={`font-space mb-2 text-[11px] font-bold uppercase tracking-[0.1em] ${meta}`}>
        Cómo leer el cielo
      </p>

      <p className={`mb-3 max-w-[78ch] text-pretty text-[15px] leading-[1.55] ${texto}`}>
        Cada punto es <strong className="font-semibold">un aporte</strong>: una frase que alguien
        cargó. Una línea une dos aportes cuyo texto se parece. Los puntos que dicen casi lo mismo
        forman <strong className="font-semibold">un grupo</strong>: aportes parecidos, cargados por
        separado.
      </p>

      <ul
        className="mb-3 flex flex-wrap gap-x-6 gap-y-1.5"
        aria-label="Los colores, por tipo de aporte"
      >
        {CLASES_SENAL.map((clase) => (
          <li key={clase} className={`flex items-center gap-2 text-[14px] ${texto}`}>
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: colorDeClase(clase, tema) }}
            />
            <span>
              <strong className="font-semibold">{NOMBRE_DE_CLASE[clase]}</strong> —{' '}
              {verboDeClase(clase)}
            </span>
          </li>
        ))}
      </ul>

      <p className={`max-w-[78ch] text-[13px] leading-[1.5] ${meta}`}>
        El cielo gira solo y se puede arrastrar. Tocá un grupo, o una fila de la lista de más abajo,
        y se abre lo que dice. El deslizador que está debajo del cielo decide qué tan parecido tiene
        que ser «lo mismo»: movelo y el cielo se rearma.
      </p>
    </section>
  );
}
