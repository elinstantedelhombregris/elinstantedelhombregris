import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

/** Las piezas chicas que comparten las pantallas de Imaginar, sobre el kit papel. */

export const ROTULO =
  'font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.12em] leading-none';
export const CAMPO_PAPEL =
  'bg-papel-crudo border-tinta w-full rounded-none border-[1.5px] p-3.5 leading-relaxed text-tinta';
export const CHIP =
  'border-papel-borde bg-papel-crudo text-tinta min-h-11 border-[1.5px] px-3 py-2 text-sm transition-colors duration-150 hover:border-tinta';
export const CHIP_ELEGIDO = 'border-tinta bg-tinta text-papel hover:border-tinta';
export const ENLACE_VOLVER =
  'text-tinta-75 inline-flex min-h-11 items-center self-start text-[15px] underline underline-offset-4';

/**
 * El título de cada pantalla. Recibe el foco al cambiar de pantalla (`data-foco`), así
 * quien usa lector de pantalla oye dónde está.
 */
export function TituloDePantalla({
  nivel,
  children,
  className,
}: {
  nivel: 1 | 2;
  children: ReactNode;
  className?: string;
}) {
  const Etiqueta = nivel === 1 ? 'h1' : 'h2';
  return (
    <Etiqueta
      tabIndex={-1}
      data-foco
      className={cn(
        'font-anton text-tinta leading-[1.04] [text-wrap:balance] focus:outline-none',
        nivel === 1 ? 'text-[clamp(34px,9vw,44px)]' : 'text-[clamp(28px,7.5vw,34px)]',
        className,
      )}
    >
      {children}
    </Etiqueta>
  );
}
