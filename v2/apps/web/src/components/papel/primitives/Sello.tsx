import type { CSSProperties, ReactNode } from 'react';

import { cn } from '~/lib/utils';

export type SelloColor = 'rojo' | 'verde' | 'violeta';

const COLOR_CLASSES: Record<SelloColor, string> = {
  rojo: 'border-sello text-sello',
  verde: 'border-verde text-verde',
  violeta: 'border-violeta text-violeta',
};

export interface SelloProps {
  color: SelloColor;
  /** Grados de rotación; rango del sistema -8° a +6°. Default -4° (§5). */
  rotate?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Sello (stamp) §5 / firma award §10.5 — entra con `anim-stampin`.
 * La rotación se aplica vía `style` (no una clase `rotate-*`) porque el
 * grado es un prop numérico arbitrario que Tailwind no puede compilar en
 * build time. Nota: el recipe pide `border:2px`, pero la única instancia
 * shipeada (HeroBasta) usa `border-[3px]` — replicamos Home (ver informe).
 */
export function Sello({ color, rotate = -4, className, style, children }: SelloProps) {
  return (
    <span
      className={cn(
        'anim-stampin font-space inline-block border-[3px] px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.18em]',
        COLOR_CLASSES[color],
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      {children}
    </span>
  );
}
