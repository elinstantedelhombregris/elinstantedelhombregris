import { ChipTipo } from '~/components/papel/primitives';
import {
  CLASES_SENAL,
  CLASE_GLOSA,
  CLASE_ROTULO,
  CUANDO_NO_ES,
  TIPOS_DE_CLASE,
  claseDe,
  type TipoSenal,
} from '~/lib/vocabulario';


/**
 * Los nueve tipos, agrupados por sus cuatro clases.
 *
 * ## Por qué agrupados y no en una fila de nueve
 *
 * Nueve chips sueltos son una lista que hay que leer entera para elegir. Las
 * cuatro clases son la pregunta anterior y más fácil —¿esto que estás por
 * escribir **ya pasa**, lo **querés**, lo **vas a hacer**, o **no lo sabés**?—
 * y una vez contestada quedan entre uno y cinco tipos. Además es la lectura que
 * el sistema necesita: la clase decide qué máquina corre después (los hechos se
 * corroboran, los deseos se deliberan) y verla al elegir es lo que hace que la
 * elección signifique algo.
 *
 * ## Por qué «cuándo no es esto» va en pantalla
 *
 * Tres pares se pisan y son la única razón por la que alguien elige mal:
 * `basta`/`necesidad` (¿estaba y se rompió, o nunca estuvo?),
 * `recurso`/`práctica` (¿lo prestás vos, o ya funciona sin vos?) y
 * `propuesta`/`compromiso` (¿lo hace otro, o lo hacés vos?). Decirlo en el
 * momento de elegir cuesta una línea; corregirlo después cuesta una migración.
 */
export interface SelectorDeTipoProps {
  readonly valor: TipoSenal | null;
  readonly onElegir: (tipo: TipoSenal) => void;
}

export function SelectorDeTipo({ valor, onElegir }: SelectorDeTipoProps) {
  return (
    <div role="group" aria-label="De qué estás hablando" className="mb-4">
      {CLASES_SENAL.map((clase) => (
        <div key={clase} className="border-papel-borde mb-3 border-b pb-3 last:mb-0 last:border-0">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-space text-tinta text-[11px] font-bold uppercase tracking-[0.14em]">
              {CLASE_ROTULO[clase]}
            </span>
            <span className="font-archivo text-tinta-75 text-[13px]">{CLASE_GLOSA[clase]}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIPOS_DE_CLASE[clase].map((tipo) => (
              <button
                key={tipo}
                type="button"
                aria-pressed={valor === tipo}
                onClick={() => {
                  onElegir(tipo);
                }}
                className="min-h-[44px]"
              >
                <ChipTipo tipo={tipo} active={valor === tipo} />
              </button>
            ))}
          </div>
        </div>
      ))}

      {valor === null ? null : (
        <p className="font-archivo text-tinta-75 mt-1 text-[13px] leading-relaxed">
          <span className="text-tinta-75 font-bold">{CLASE_ROTULO[claseDe(valor)]}.</span>{' '}
          {CUANDO_NO_ES[valor]}
        </p>
      )}
    </div>
  );
}
