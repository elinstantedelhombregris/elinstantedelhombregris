import { useId } from 'react';

import { Papelito } from '../comun/Papelito';

import { AvisoRespuesta } from './AvisoRespuesta';
import { BotonesRespuesta } from './BotonesRespuesta';
import { PapelitoArrastrable } from './PapelitoArrastrable';

import type { AvisoDeRespuesta } from './avisos';
import type { TarjetaPila, ValorDeOpinion } from '@v2/shared';

export interface PantallaTarjetaProps {
  tarjeta: TarjetaPila;
  /** La que asoma detrás, para que se vea que es una pila de papeles. */
  siguiente: TarjetaPila | null;
  saliendo: ValorDeOpinion | null;
  aviso: AvisoDeRespuesta | null;
  onResponder: (valor: ValorDeOpinion) => void;
  onAbrir: () => void;
  onSalio: () => void;
}

/** Un aporte de otra persona arriba de la mesa, las tres respuestas y lo que se dice después. */
export function PantallaTarjeta({
  tarjeta,
  siguiente,
  saliendo,
  aviso,
  onResponder,
  onAbrir,
  onSalio,
}: PantallaTarjetaProps) {
  const ayuda = useId();
  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[352px]">
        {siguiente ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 translate-y-3 scale-[0.955] opacity-80"
          >
            <Papelito
              id={siguiente.id}
              texto={siguiente.texto}
              provincia={siguiente.provincia?.nombre ?? null}
              tema={siguiente.tema?.etiqueta ?? null}
              className="h-full"
            />
          </div>
        ) : null}
        <PapelitoArrastrable
          key={tarjeta.id}
          tarjeta={tarjeta}
          saliendo={saliendo}
          onResponder={onResponder}
          onAbrir={onAbrir}
          onSalio={onSalio}
          ayuda={ayuda}
        />
      </div>
      <BotonesRespuesta onResponder={onResponder} ocupado={saliendo !== null} conAtajos />
      <AvisoRespuesta aviso={aviso} />
      <p id={ayuda} className="font-space text-tinta-50 text-center text-[12px]">
        Deslizá la tarjeta, o usá ← ↓ →.
      </p>
    </div>
  );
}
