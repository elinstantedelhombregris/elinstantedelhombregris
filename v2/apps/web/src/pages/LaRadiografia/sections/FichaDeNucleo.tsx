import { MOTIVO_TEXTO_OMITIDO } from '@v2/shared';

import {
  colorDeClase,
  etiquetaDeClase,
  rotuloDeNucleo,
  type NucleoEnPantalla,
  type Tema,
} from '../radiografia-data';

/**
 * § La ficha del núcleo — nivel 1 (spec §5.4).
 *
 * Lo primero que dice **no es el tamaño: es la composición por clase** y qué
 * se hace con eso (§3.1). Que treinta señales digan casi lo mismo es evidencia
 * de que treinta señales dicen casi lo mismo, y nada más — ya es mucho, y no
 * es una corroboración.
 *
 * **Señales y no personas.** Todo lo que esta ficha cuenta son filas: el
 * número grande, la composición, los dos extremos de la distancia. Una persona
 * puede haber cargado veinte, y esta página no sabe cuántas personas hay
 * detrás — `senales` no trae actor. Decir «personas» acá sería afirmar algo
 * que no medimos, que es exactamente lo que la regla 5 prohíbe.
 *
 * La frase es una frase **real**, la de la señal más cercana al centro entre
 * las que cedieron licencia (R8). Nunca un resumen generado: la máquina elige
 * cuál mostrar, jamás qué decir.
 */

export interface FichaDeNucleoProps {
  nucleo: NucleoEnPantalla | null;
  tema: Tema;
  onCerrar: () => void;
}

export function FichaDeNucleo({ nucleo, tema, onCerrar }: FichaDeNucleoProps) {
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-papel-borde';

  if (!nucleo) {
    return (
      <aside aria-live="polite" className={`border-l ${borde} h-full p-6`}>
        <p className={`text-[15px] leading-[1.6] ${meta}`}>
          Clickeá un núcleo del cielo —o una fila de la lista— y acá se abre lo que dice, de qué
          clase es, y a cuántos kilómetros están las dos señales más lejanas que lo dicen.
        </p>
      </aside>
    );
  }

  const { rotulo, glosa, clase, mixto } = rotuloDeNucleo(nucleo.clases);

  return (
    <aside aria-live="polite" className={`border-l ${borde} h-full overflow-y-auto p-6`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className="font-space text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: mixto ? undefined : colorDeClase(clase ?? '', tema) }}
        >
          {rotulo}
        </span>
        <button
          type="button"
          onClick={onCerrar}
          className={`font-space text-[11px] uppercase tracking-[0.1em] ${meta} hover:text-violeta`}
        >
          Cerrar
        </button>
      </div>

      {nucleo.frase ? (
        <blockquote className={`font-archivo mb-5 text-[19px] leading-[1.4] ${texto}`}>
          «{nucleo.frase.texto}»
        </blockquote>
      ) : (
        <p className={`mb-5 text-[15px] leading-[1.5] ${meta}`}>
          Este núcleo existe, se cuenta y se mide, y no puede mostrar ninguna frase:{' '}
          {nucleo.textoOmitido ?? MOTIVO_TEXTO_OMITIDO}. El texto lo escribió una persona y el
          proyecto es custodio, no titular.
        </p>
      )}

      <dl className="grid grid-cols-2 gap-4">
        <Campo rotulo="Composición" meta={meta} texto={texto}>
          {glosa || '—'}
        </Campo>
        <Campo rotulo="Señales" meta={meta} texto={texto}>
          {nucleo.senales}
        </Campo>
        <Campo rotulo="Provincias" meta={meta} texto={texto}>
          {nucleo.provincias ?? '—'}
        </Campo>
        <Campo rotulo="Los dos más lejanos" meta={meta} texto={texto}>
          {nucleo.distancia ? `${String(nucleo.distancia.km)} km` : '—'}
        </Campo>
      </dl>

      <ul className={`mt-5 flex flex-wrap gap-3 border-t ${borde} pt-4`}>
        {Object.entries(nucleo.clases).map(([c, cuantas]) => (
          <li key={c} className={`font-space flex items-center gap-2 text-[12px] ${meta}`}>
            <span
              aria-hidden
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: colorDeClase(c, tema) }}
            />
            {etiquetaDeClase(c)} · {cuantas}
          </li>
        ))}
      </ul>

      {/* Regla 11, dicha con palabras y no sólo con color. Este párrafo es el
          motivo por el que la spec de esta página existe. */}
      <p className={`mt-5 text-[13px] leading-[1.55] ${meta}`}>
        {mixto
          ? 'Es un núcleo mixto y no se resuelve por mayoría: lo que es hecho sigue necesitando corroboración, y lo que es deseo sigue necesitando deliberarse.'
          : 'Converger no es corroborar. Que varias señales digan casi lo mismo es evidencia de eso y de nada más. Son señales, no personas: una sola persona puede haber cargado varias.'}
      </p>
    </aside>
  );
}

function Campo({
  rotulo,
  meta,
  texto,
  children,
}: {
  rotulo: string;
  meta: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className={`font-space mb-1 text-[11px] uppercase tracking-[0.1em] ${meta}`}>{rotulo}</dt>
      <dd className={`text-[15px] leading-[1.4] ${texto}`}>{children}</dd>
    </div>
  );
}
