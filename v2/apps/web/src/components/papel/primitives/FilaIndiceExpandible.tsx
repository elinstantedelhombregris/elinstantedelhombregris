import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

export interface FilaIndiceExpandibleProps {
  /** Numeración de expediente («01», «00» para el meta). */
  num: string;
  /** Columna del título — el llamador compone código/nombre adentro. */
  encabezado: ReactNode;
  abierta: boolean;
  onToggle: () => void;
  /** id del panel, cableado a aria-controls. */
  idPanel: string;
  className?: string;
  /** Contenido del pliegue (tesis + «Leer el documento →»). */
  children: ReactNode;
}

/**
 * Fila de índice §5, variante expandible +/− (spec 2.4 — la que la ley
 * dejó apuntada). La fila es un botón real de ancho completo; el glifo
 * final alterna + (cerrada, tinta-50) / − (abierta, violeta); el panel
 * entra con fadeup sangrado a la columna del título. El borde inferior
 * vive en el contenedor: fila y panel comparten la junta.
 */
export function FilaIndiceExpandible({
  num,
  encabezado,
  abierta,
  onToggle,
  idPanel,
  className,
  children,
}: FilaIndiceExpandibleProps) {
  return (
    <div className={cn('border-papel-borde border-b', className)}>
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={idPanel}
        onClick={onToggle}
        className="hover:bg-papel-presionado grid w-full grid-cols-[56px_1fr_40px] items-baseline gap-5 px-2 py-4 text-left text-tinta transition-colors duration-150 max-[560px]:grid-cols-[44px_1fr_32px]"
      >
        <span className="font-space text-tinta-30 text-sm">{num}</span>
        <span className="min-w-0">{encabezado}</span>
        <span
          aria-hidden
          className={cn('font-space justify-self-end text-lg', abierta ? 'text-violeta' : 'text-tinta-50')}
        >
          {abierta ? '−' : '+'}
        </span>
      </button>
      {abierta ? (
        <div id={idPanel} className="anim-fadeup-rapido px-2 pb-6 pl-[76px] max-[560px]:pl-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
