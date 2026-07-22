import { Slot } from '@radix-ui/react-slot';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export type BotonPapelVariant = 'violeta' | 'tinta' | 'fantasma';

/**
 * Superficie sobre la que vive el botón. `papel` (default) es el recipe
 * §5 tal cual. `oscuro` es para botones dentro de una banda ya violeta/tinta
 * (p. ej. `<BandaCta fondo="violeta">`), donde el recipe indica «en oscuro,
 * hover a papel/tinta» — el botón invierte sus colores para no fundirse
 * con el fondo.
 */
export type BotonPapelSurface = 'papel' | 'oscuro';

const BASE = 'font-space px-7 py-[18px] text-[13px] uppercase tracking-[0.08em]';

const VARIANT_SURFACE_CLASSES: Record<BotonPapelVariant, Record<BotonPapelSurface, string>> = {
  violeta: {
    papel:
      'bg-violeta text-papel font-bold transition-all duration-200 hover:bg-tinta hover:-translate-y-0.5',
    oscuro: 'bg-papel text-tinta font-bold transition-transform duration-200 hover:-translate-y-0.5',
  },
  tinta: {
    papel: 'bg-tinta text-papel font-bold transition-colors duration-200 hover:bg-violeta',
    oscuro: 'bg-violeta text-papel font-bold transition-colors duration-200 hover:bg-tinta',
  },
  fantasma: {
    papel:
      'border border-tinta text-tinta transition-colors duration-200 hover:bg-tinta hover:text-papel',
    oscuro:
      'border border-papel text-papel transition-colors duration-200 hover:bg-papel hover:text-tinta',
  },
};

const DISABLED_CLASSES = 'text-tinta-30 border border-tinta-30 cursor-not-allowed';

export interface BotonPapelProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BotonPapelVariant;
  surface?: BotonPapelSurface;
  loading?: boolean;
  /** Renderiza el hijo (p. ej. un `<Link>` de wouter) en vez de un `<button>`. */
  asChild?: boolean;
}

/**
 * Botón papel §5 — 3 variantes (violeta/tinta/fantasma) x 2 superficies.
 * Estados §5 «Estados»: deshabilitado = tinta-30 + cursor-not-allowed
 * (nunca opacity); cargando = texto reemplazado por «— ▌» con blink-cursor,
 * el label real queda invisible (no `display:none`) para fijar el ancho.
 */
export const BotonPapel = forwardRef<HTMLButtonElement, BotonPapelProps>(
  (
    {
      variant = 'violeta',
      surface = 'papel',
      loading = false,
      disabled = false,
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const inactivo = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(
          BASE,
          VARIANT_SURFACE_CLASSES[variant][surface],
          disabled && DISABLED_CLASSES,
          className,
        )}
        disabled={asChild ? undefined : inactivo}
        aria-disabled={inactivo || undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="grid">
            <span aria-hidden className="invisible col-start-1 row-start-1">
              {children}
            </span>
            <span aria-hidden className="col-start-1 row-start-1">
              — <span className="anim-blink-cursor">▌</span>
            </span>
            <span className="sr-only">Cargando</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
BotonPapel.displayName = 'BotonPapel';
