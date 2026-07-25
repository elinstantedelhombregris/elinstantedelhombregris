import type { PreguntaNormalizada } from '@v2/shared';

import { cn } from '~/lib/utils';

export interface PreguntaPracticaProps {
  pregunta: PreguntaNormalizada;
  /** 0-based — el legend la muestra +1 (spec, «Pregunta {i} de {n}»). */
  indice: number;
  total: number;
  /** `null` = sin contestar todavía. */
  elegida: number | null;
  onElegir: (opcion: number) => void;
}

/**
 * Una pregunta de la práctica — página 3.5 «Página D»
 * (docs/specs/2026-07-24-entrenamientos-papel-y-tinta.md). Presentacional
 * puro: el estado (`Map<number, number>`) vive en `PracticaDetail`, esta
 * pieza solo pinta. Sin `elegida`, radios reales habilitados; con
 * `elegida`, el `<fieldset>` queda `disabled` (tokens tinta-30, nunca
 * opacity — §5 «Estados»), la opción marcada, y si erró, la correcta se
 * resalta en verde junto a la explicación real del `quiz.json`. Ninguna
 * pregunta se puede volver a contestar (Decisión 13).
 */
export function PreguntaPractica({ pregunta, indice, total, elegida, onElegir }: PreguntaPracticaProps) {
  const contestada = elegida !== null;
  const acerto = contestada && elegida === pregunta.correcta;

  return (
    <fieldset disabled={contestada} className="border-papel-borde border-t px-0 py-7 first:border-t-0 first:pt-0">
      <legend className="font-space text-tinta-50 mb-4 text-[11px] uppercase tracking-[0.12em]">
        Pregunta {indice + 1} de {total}
      </legend>
      <p className="text-tinta-90 mb-6 max-w-[660px] text-pretty text-[17px] leading-[1.6]">{pregunta.enunciado}</p>
      <div className="flex flex-col gap-3">
        {pregunta.opciones.map((opcion, i) => {
          const esElegida = elegida === i;
          const marcarCorrecta = contestada && !acerto && i === pregunta.correcta;
          return (
            <label
              key={i}
              className={cn(
                'flex min-h-11 items-center gap-3 text-base',
                contestada ? 'cursor-not-allowed' : 'cursor-pointer',
                esElegida && acerto && 'text-verde',
                esElegida && !acerto && 'text-sello',
                marcarCorrecta && 'text-verde',
                contestada && !esElegida && !marcarCorrecta && 'text-tinta-30',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2',
                  esElegida ? 'border-violeta bg-violeta' : 'border-tinta',
                  marcarCorrecta && 'border-verde bg-verde',
                  contestada && !esElegida && !marcarCorrecta && 'border-tinta-30',
                )}
              >
                {esElegida || marcarCorrecta ? (
                  <span className="text-papel text-[10px] leading-none">✓</span>
                ) : null}
              </span>
              <input
                type="radio"
                name={`pregunta-${String(indice)}`}
                checked={esElegida}
                disabled={contestada}
                onChange={() => {
                  onElegir(i);
                }}
                className="sr-only"
              />
              {opcion}
            </label>
          );
        })}
      </div>
      {contestada ? (
        <div aria-live="polite" className="mt-5">
          <p
            className={cn(
              'font-space mb-2 text-xs font-bold uppercase tracking-[0.08em]',
              acerto ? 'text-verde' : 'text-sello',
            )}
          >
            {acerto ? 'Esa era.' : 'No era esa.'}
          </p>
          <p
            className={cn(
              'anim-fadeup-rapido text-tinta-90 border-l-2 pl-4 text-base leading-[1.6]',
              acerto ? 'border-verde' : 'border-sello',
            )}
          >
            {pregunta.explicacion}
          </p>
        </div>
      ) : null}
    </fieldset>
  );
}
