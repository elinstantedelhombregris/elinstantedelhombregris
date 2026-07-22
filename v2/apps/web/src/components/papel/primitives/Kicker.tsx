import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

export type KickerColor = 'violeta' | 'papel' | 'tinta';

const COLOR_CLASSES: Record<KickerColor, string> = {
  violeta: 'text-violeta',
  papel: 'text-papel',
  tinta: 'text-tinta-50',
};

export interface KickerProps {
  color?: KickerColor;
  className?: string;
  children: ReactNode;
}

/**
 * Kicker mono §5 — `§ 0N — texto` o etiquetas de sección: 11px uppercase,
 * tracking amplio. `color` mapea al acento semántico (violeta por defecto);
 * el margen queda a cargo del llamador vía `className` (varía por sección).
 */
export function Kicker({ color = 'violeta', className, children }: KickerProps) {
  return (
    <div
      className={cn(
        'font-space text-[11px] uppercase tracking-[0.16em]',
        COLOR_CLASSES[color],
        className,
      )}
    >
      {children}
    </div>
  );
}
