import { Link } from 'wouter';

import { cn } from '~/lib/utils';

export interface FilaIndiceProps {
  num: string;
  titulo: string;
  href: string;
  className?: string;
}

/**
 * Fila de índice §5 — listas de planes/ensayos: numeración mono tinta-30 ·
 * título · flecha. Grilla 56px/1fr/40px baseline-aligned, hover
 * papel-presionado.
 */
export function FilaIndice({ num, titulo, href, className }: FilaIndiceProps) {
  return (
    <Link
      href={href}
      className={cn(
        'grid grid-cols-[56px_1fr_40px] items-baseline gap-5 border-b border-papel-borde px-2 py-4 text-tinta transition-colors duration-150 hover:bg-papel-presionado',
        className,
      )}
    >
      <span className="font-space text-tinta-30 text-sm">{num}</span>
      <span className="text-[17px] leading-snug">{titulo}</span>
      <span className="font-space text-tinta-50 justify-self-end">→</span>
    </Link>
  );
}
