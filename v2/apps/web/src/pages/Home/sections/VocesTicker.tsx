import { TEXTO_RESERVADO } from '@v2/shared';

import { useVocesRecientes } from '~/lib/queries/analytics';
import { cn } from '~/lib/utils';
import { CLASE_TEXTO, claseDe, leerTipoSenal } from '~/lib/vocabulario';

/**
 * Los últimos aportes publicados, en una cinta.
 *
 * - Se pausa con el mouse encima y con el foco adentro (la cinta es un `region`
 *   con tabindex, así que el teclado también llega).
 * - Con movimiento reducido no hay cinta: es una lista quieta y entera, sin
 *   recortar y sin la copia que hace el loop.
 * - Vacío real (cero aportes) muestra una línea en vez de la cinta; mientras
 *   carga no mostramos nada — nunca datos de demostración.
 */
export function VocesTicker() {
  const { data, isLoading } = useVocesRecientes(24);

  if (isLoading || data === undefined) {
    return <section className="border-tinta bg-papel-crudo h-[45px] border-y" aria-hidden="true" />;
  }

  const voces = data.filter((voz) => voz.texto !== TEXTO_RESERVADO);
  if (voces.length === 0) {
    return (
      <section
        aria-label="Últimos aportes"
        className="border-tinta bg-papel-crudo border-y px-5 py-[13px] text-center"
      >
        <span className="font-space text-tinta-75 text-[13px]">
          {/* Con aportes que solo traen el aviso de texto reservado sí hubo quien publicó: no se dice que nadie lo hizo. */}
          {data.length === 0
            ? 'Todavía nadie publicó un aporte.'
            : 'Los últimos aportes tienen el texto reservado por quien los escribió.'}
        </span>
      </section>
    );
  }

  return (
    <section
      aria-label="Últimos aportes"
      // tabindex para que el teclado pueda llegar y pausar: el foco adentro frena la cinta.
      tabIndex={0}
      className="group border-tinta bg-papel-crudo focus-visible:outline-violeta flex items-stretch overflow-hidden border-y focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:overflow-visible"
    >
      <p className="font-space text-tinta-75 border-tinta bg-papel-crudo relative z-10 flex shrink-0 items-center border-r px-3 text-[11px] uppercase tracking-[0.14em] min-[561px]:px-5">
        Últimos aportes
      </p>
      <div className="min-w-0 flex-1 overflow-hidden motion-reduce:overflow-visible">
        <div className="anim-marquee flex w-max py-[13px] group-hover:[animation-play-state:paused] group-focus:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:px-5">
          {[0, 1].map((copia) => (
            <ul
              key={copia}
              aria-hidden={copia === 1}
              className={cn('flex', copia === 1 && 'motion-reduce:hidden', 'motion-reduce:flex-wrap')}
            >
              {voces.map((voz) => {
                /**
                 * Sin sumidero: lo que no está en el canon sale con el gris
                 * neutro y no plegado contra un tipo real. Antes esto era
                 * `?? 'valor'`, y por eso un aporte de tipo «bastta» se pintaba
                 * como si fuera algo.
                 */
                const lectura = leerTipoSenal(voz.categoria);
                return (
                  <li
                    key={`${copia}-${voz.id}`}
                    className={cn(
                      'font-space whitespace-nowrap px-[34px] text-[13px] motion-reduce:whitespace-normal motion-reduce:px-0 motion-reduce:py-1 motion-reduce:pr-8',
                      lectura.reconocido ? CLASE_TEXTO[claseDe(lectura.tipo)] : 'text-tinta-75',
                    )}
                  >
                    «{voz.texto}»
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
