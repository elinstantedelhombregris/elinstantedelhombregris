import { TEXTO_CONSENTIMIENTO_ACTOR } from '@v2/shared';

import { useAdherir } from '~/lib/queries/senales';
import { cn } from '~/lib/utils';

/**
 * «Yo también» — el gesto más barato del producto, y el que más gente va a hacer.
 *
 * Escribir una señal pide tiempo, teclado y ganas. Esto pide un segundo. Por eso
 * enciende la celda igual que una señal escrita: si no moviera el brillo, el
 * mapa terminaría midiendo a quien tuvo tiempo de escribir y no a quien está.
 *
 * **No es un voto y el botón no puede parecerlo.** No hay pulgar, no hay
 * «apoyo», no hay barra de progreso hacia nada. El número dice cuánta gente
 * dice que también le pasa, y la línea de abajo lo aclara cuando hay más de
 * uno — porque un contador grande al lado de un texto se lee como un resultado
 * si nadie dice lo contrario.
 */
export interface BotonAdherirProps {
  readonly idPublico: string;
  readonly total: number;
  readonly mia: boolean;
}

export function BotonAdherir({ idPublico, total, mia }: BotonAdherirProps) {
  const adherir = useAdherir(idPublico);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={mia}
          disabled={adherir.isPending}
          onClick={() => {
            adherir.mutate(!mia);
          }}
          className={cn(
            'font-space border-tinta min-h-[44px] border px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors',
            mia ? 'bg-tinta text-papel' : 'text-tinta hover:bg-papel-presionado',
            adherir.isPending && 'opacity-60',
          )}
        >
          {mia ? 'A mí también me pasa ✓' : 'A mí también me pasa'}
        </button>

        {total > 0 ? (
          <span className="font-space text-tinta-75 text-[13px] tabular-nums">
            {total === 1 ? 'Una persona más dijo lo mismo' : `${String(total)} personas dijeron lo mismo`}
          </span>
        ) : null}
      </div>

      {/* Sólo cuando hay un número que se pueda leer mal. Con cero o uno, la
          aclaración sería ruido; con varios, es necesaria. */}
      {total > 1 ? (
        <p className="font-space text-tinta-50 max-w-[58ch] text-[11px] leading-relaxed">
          Esto no es una votación y nadie está midiendo quién gana: es cuánta gente dice que
          también le pasa.
        </p>
      ) : null}

      {/* El permiso se pide donde se usa. Adherir crea el identificador si no
          existe, así que la línea va acá y no escondida en una política. */}
      {mia ? null : (
        <p className="font-space text-tinta-50 max-w-[58ch] text-[11px] leading-relaxed">
          {TEXTO_CONSENTIMIENTO_ACTOR}
        </p>
      )}

      {adherir.isError ? (
        <p role="alert" className="font-space text-sello text-[11px]">
          No se pudo registrar. Probá de nuevo.
        </p>
      ) : null}
    </div>
  );
}
