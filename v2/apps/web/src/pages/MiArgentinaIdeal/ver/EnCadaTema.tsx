import { Seccion, Vacio } from './piezas';

import type { VisionCampana } from '@v2/shared';

/**
 * Los trece temas, cada uno con su aporte más compartido según la regla federal. Leída de
 * corrido es un retrato en trece líneas; un tema sin aporte que cumpla la regla lo dice.
 */
export function EnCadaTema({ temas }: { temas: VisionCampana['temas'] }) {
  return (
    <Seccion
      titulo="En cada tema"
      bajada="El aporte que más se comparte en todo el país, tema por tema."
    >
      <dl>
        {temas.map((t) => (
          <div
            key={t.clave}
            className="border-papel-borde grid grid-cols-[96px_1fr] items-baseline gap-2.5 border-b py-2.5 last:border-b-0"
          >
            <dt className="font-space text-tinta-50 text-[10.5px] font-bold uppercase tracking-[0.12em]">
              {t.etiqueta}
            </dt>
            <dd>
              {t.aporte ? (
                <p className="text-[15.5px] leading-snug">«{t.aporte.texto}»</p>
              ) : (
                <p className="text-tinta-50 text-[14px] leading-snug">
                  Todavía ningún aporte de {t.etiqueta.toLocaleLowerCase('es-AR')} se comparte en
                  todo el país.
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {temas.every((t) => !t.aporte) ? (
        <Vacio>
          Un tema se llena cuando uno de sus aportes cumple la misma regla de «Lo que nos une».
        </Vacio>
      ) : null}
    </Seccion>
  );
}
