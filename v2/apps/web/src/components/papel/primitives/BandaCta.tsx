import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

export type BandaCtaFondo = 'violeta' | 'tinta';

const FONDO_CLASSES: Record<BandaCtaFondo, string> = {
  violeta: 'bg-violeta text-papel',
  tinta: 'bg-tinta text-papel',
};

export interface BandaCtaProps {
  fondo: BandaCtaFondo;
  className?: string;
  children: ReactNode;
}

/** Banda CTA §5 — sección full-bleed de cierre, fondo violeta o tinta. */
export function BandaCta({ fondo, className, children }: BandaCtaProps) {
  return (
    <section className={cn(FONDO_CLASSES[fondo], className)}>
      <div className="mx-auto max-w-[1440px] px-5 py-20 text-center min-[961px]:px-10">
        {children}
      </div>
    </section>
  );
}
