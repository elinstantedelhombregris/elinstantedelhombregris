import { useId } from 'react';

import type { ButtonHTMLAttributes, MouseEvent } from 'react';

import { cn } from '~/lib/utils';

interface Props extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'aria-disabled'
> {
  /**
   * Por qué el botón no hace nada todavía. Con un motivo el botón queda
   * bloqueado y el motivo se ve al lado; sin motivo (`null`) el botón anda.
   */
  motivo: string | null;
  /** Mientras se envía: el clic se ignora, sin motivo que mostrar. */
  ocupado?: boolean;
  tono?: 'violeta' | 'papel';
}

/**
 * Un botón bloqueado que dice por qué.
 *
 * Un `disabled` mudo saca al botón del teclado y deja a quien lo usa sin saber
 * qué le falta. Acá el botón sigue enfocable (`aria-disabled`), el motivo está
 * siempre a la vista y el clic no hace nada mientras haya motivo — también se
 * ignora el envío del formulario.
 */
export function BotonConMotivo({
  motivo,
  ocupado = false,
  tono = 'violeta',
  className,
  onClick,
  children,
  ...resto
}: Props) {
  const id = useId();
  const bloqueado = motivo !== null || ocupado;
  const alHacerClic = (e: MouseEvent<HTMLButtonElement>) => {
    if (bloqueado) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  return (
    <>
      <button
        {...resto}
        aria-disabled={bloqueado || undefined}
        aria-busy={ocupado || undefined}
        aria-describedby={motivo !== null ? id : undefined}
        onClick={alHacerClic}
        className={cn(
          'font-space border-tinta min-h-11 border px-5 py-3 text-xs font-bold uppercase tracking-wide transition-colors',
          bloqueado
            ? 'border-tinta-30 bg-papel-presionado text-tinta-50 cursor-not-allowed'
            : tono === 'violeta'
              ? 'bg-violeta text-papel hover:bg-tinta'
              : 'bg-papel text-tinta hover:bg-tinta hover:text-papel',
          className,
        )}
      >
        {children}
      </button>
      {motivo !== null ? (
        <p id={id} className="font-space text-tinta-75 basis-full text-xs leading-relaxed">
          {motivo}
        </p>
      ) : null}
    </>
  );
}
