import type { ValorDeOpinion } from '@v2/shared';

import { cn } from '~/lib/utils';

const BOTONES: readonly {
  valor: ValorDeOpinion;
  rotulo: string;
  marca: string;
  atajo: string;
}[] = [
  { valor: 'desacuerdo', rotulo: 'Yo no', marca: '✕', atajo: 'ArrowLeft' },
  { valor: 'paso', rotulo: 'Paso', marca: '↓', atajo: 'ArrowDown' },
  { valor: 'acuerdo', rotulo: 'Yo también', marca: '✓', atajo: 'ArrowRight' },
];

export interface BotonesRespuestaProps {
  onResponder: (valor: ValorDeOpinion) => void;
  /**
   * La respuesta que ya dio esta persona, en la página del aporte. Con `undefined`
   * (Mirar) los botones no se marcan: cada tarjeta es una pregunta nueva.
   */
  marcada?: ValorDeOpinion | null;
  /** Mientras la tarjeta vuela: un segundo clic no responde dos veces. */
  ocupado?: boolean;
  /** Los atajos de teclado viven en Mirar; los botones sólo los anuncian. */
  conAtajos?: boolean;
  className?: string;
}

/**
 * Las tres respuestas, siempre visibles debajo de la tarjeta y de 44 px de alto
 * como mínimo: deslizar es un atajo, no la única forma (spec §4, «El gesto»).
 * Es la misma pieza en Mirar y en la página de un aporte de la campaña.
 */
export function BotonesRespuesta({
  onResponder,
  marcada,
  ocupado = false,
  conAtajos = false,
  className,
}: BotonesRespuestaProps) {
  return (
    <div
      role="group"
      aria-label="Tu respuesta"
      className={cn('grid grid-cols-[1fr_0.8fr_1.25fr] gap-2', className)}
    >
      {BOTONES.map((b) => {
        const principal = b.valor === 'acuerdo';
        const elegida = marcada === b.valor;
        return (
          <button
            key={b.valor}
            type="button"
            aria-pressed={marcada === undefined ? undefined : elegida}
            aria-keyshortcuts={conAtajos ? b.atajo : undefined}
            aria-disabled={ocupado || undefined}
            onClick={() => {
              if (!ocupado) onResponder(b.valor);
            }}
            className={cn(
              'font-space min-h-11 border px-1.5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.06em] transition-colors',
              elegida
                ? 'bg-tinta border-tinta text-papel'
                : principal
                  ? 'bg-violeta border-violeta text-papel hover:bg-tinta hover:border-tinta'
                  : 'border-tinta text-tinta hover:bg-papel-presionado',
            )}
          >
            <span aria-hidden className="mr-1.5">
              {b.marca}
            </span>
            {b.rotulo}
          </button>
        );
      })}
    </div>
  );
}
