import { cn } from '~/lib/utils';
import { CLASE_FONDO, claseDe, type TipoSenal } from '~/lib/vocabulario';

/**
 * El chip de un tipo de señal.
 *
 * **El color sale de la CLASE, no del tipo** (spec B §2.4). Antes esto tenía un
 * `Record<TipoVoz, string>` de seis entradas, una por tipo; con nueve tipos esa
 * tabla necesitaría nueve colores que se distingan en AA a seis píxeles, y no
 * existen. Además no es lo que hay que leer de un vistazo: la lectura que
 * importa es «esto se comprueba / esto se delibera», y el nombre del tipo ya
 * está escrito adentro del chip.
 *
 * La consecuencia buena: agregar un décimo tipo no toca este archivo. Hay que
 * clasificarlo en `CLASE_DE_TIPO`, que es exhaustivo y no compila sin él.
 */
export type { TipoSenal };

export interface ChipTipoProps {
  tipo: TipoSenal;
  active?: boolean;
  className?: string;
}

export function ChipTipo({ tipo, active = false, className }: ChipTipoProps) {
  return (
    <span
      className={cn(
        'font-space inline-block border border-tinta px-[14px] py-[9px] text-[11px] font-bold uppercase tracking-[0.08em] text-tinta',
        active && `${CLASE_FONDO[claseDe(tipo)]} text-papel`,
        className,
      )}
    >
      {tipo}
    </span>
  );
}
