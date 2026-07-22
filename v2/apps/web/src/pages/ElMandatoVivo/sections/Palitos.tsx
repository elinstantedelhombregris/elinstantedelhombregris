import { cn } from '~/lib/utils';

export interface PalitosProps {
  /** Conteo real — el régimen del llamador (mandato-regimen.ts) garantiza n < 100. */
  n: number;
  /** Clase de relleno semántico del tipo (`RELLENO_TIPO_OSCURO[tipo]`). */
  claseRelleno: string;
}

interface GrupoProps {
  trazos: number;
  claseRelleno: string;
  delayBase: number;
}

/** Un grupo de tally: hasta 4 barritas verticales (2×18px) + la 5ta cruzada, rotada −60°. */
function Grupo({ trazos, claseRelleno, delayBase }: GrupoProps) {
  const barras = Math.min(trazos, 4);

  return (
    <div className="relative flex items-end gap-[3px]">
      {Array.from({ length: barras }, (_, i) => (
        <span
          key={i}
          className={cn('anim-semgrow inline-block w-[2px] origin-bottom', claseRelleno)}
          style={{ height: '18px', animationDelay: `${((delayBase + i) * 0.03).toFixed(3)}s` }}
        />
      ))}
      {trazos === 5 ? (
        <span
          className={cn('anim-semgrow absolute left-1/2 top-0 w-[2px] origin-center', claseRelleno)}
          style={{
            height: '18px',
            transform: 'translateX(-50%) rotate(-60deg)',
            animationDelay: `${((delayBase + 4) * 0.03).toFixed(3)}s`,
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * Palitos §10.6 — tally marks para conteos < 100: grupos de 4 barritas +
 * 1 cruzada, `anim-semgrow` escalonado. Puramente decorativo (`aria-hidden`):
 * el número mono de al lado (fuera de este componente, en el llamador) es
 * el dato accesible.
 */
export function Palitos({ n, claseRelleno }: PalitosProps) {
  const gruposCompletos = Math.floor(n / 5);
  const resto = n % 5;
  const grupos = [...Array.from({ length: gruposCompletos }, () => 5), ...(resto > 0 ? [resto] : [])];

  return (
    <div aria-hidden className="flex flex-wrap items-end gap-[8px]">
      {grupos.map((trazos, g) => (
        <Grupo key={g} trazos={trazos} claseRelleno={claseRelleno} delayBase={g * 5} />
      ))}
    </div>
  );
}
