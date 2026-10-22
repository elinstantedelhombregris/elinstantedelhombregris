import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

export type SuperficieDeEscena = 'papel' | 'noche';

/** La franja de controles que flota al pie de una escena. */
export function BarraDeEscena({
  superficie,
  children,
}: {
  superficie: SuperficieDeEscena;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'font-space absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 px-3 py-3 text-[11px] uppercase tracking-[0.08em] sm:px-4',
        superficie === 'papel'
          ? 'text-tinta bg-gradient-to-t from-[#F2EFE7] via-[#F2EFE7]/90 to-transparent'
          : 'text-oscuro-texto bg-gradient-to-t from-[#16130E] via-[#16130E]/85 to-transparent',
      )}
    >
      {children}
    </div>
  );
}

/** Un botón de escena. Con `presionado` se comporta como una opción de un grupo. */
export function BotonDeEscena({
  superficie,
  presionado,
  onClick,
  children,
}: {
  superficie: SuperficieDeEscena;
  presionado?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const activo = presionado === true;
  return (
    <button
      type="button"
      aria-pressed={presionado}
      onClick={onClick}
      className={cn(
        'border px-3 py-2 uppercase tracking-[0.08em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        superficie === 'papel'
          ? activo
            ? 'border-tinta bg-tinta text-papel focus-visible:outline-violeta'
            : 'border-tinta text-tinta hover:bg-papel-presionado focus-visible:outline-violeta'
          : activo
            ? 'border-oscuro-texto bg-oscuro-texto text-tinta focus-visible:outline-violeta-claro'
            : 'border-oscuro-borde text-oscuro-texto hover:border-oscuro-texto focus-visible:outline-violeta-claro',
      )}
    >
      {children}
    </button>
  );
}
