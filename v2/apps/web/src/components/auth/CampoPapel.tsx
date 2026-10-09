import { forwardRef, type InputHTMLAttributes } from 'react';

import { CAMPO } from '~/components/participacion/constantes';
import { cn } from '~/lib/utils';

export interface CampoPapelProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  etiqueta: string;
  /** Una pista visible desde el principio, antes de que algo falle. */
  ayuda?: string | undefined;
  error?: string | undefined;
}

/**
 * Un campo de formulario sobre papel: etiqueta, borde de tinta, pista y error en `sello`.
 *
 * Existe porque `components/ui/input.tsx` es del chrome oscuro (`border-white/10 bg-white/5`:
 * 1,04:1 sobre papel) y otras rutas todavía lo usan, así que no se retoca. Sirve tanto para
 * `react-hook-form` (reenvía el `ref`) como para un campo controlado.
 */
export const CampoPapel = forwardRef<HTMLInputElement, CampoPapelProps>(
  ({ id, etiqueta, ayuda, error, className, ...props }, ref) => {
    const idAyuda = ayuda ? `${id}-ayuda` : undefined;
    const idError = error ? `${id}-error` : undefined;
    const describe = [idAyuda, idError].filter(Boolean).join(' ');
    return (
      <div>
        <label htmlFor={id} className="text-tinta text-sm font-medium">
          {etiqueta}
        </label>
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe || undefined}
          className={cn(CAMPO, 'text-tinta', error && 'border-sello', className)}
          {...props}
        />
        {ayuda ? (
          <p id={idAyuda} className="text-tinta-75 mt-1 text-sm">
            {ayuda}
          </p>
        ) : null}
        {error ? (
          <p id={idError} role="alert" className="text-sello mt-1 text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
CampoPapel.displayName = 'CampoPapel';
