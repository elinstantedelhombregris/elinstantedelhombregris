import { deDonde, giroDe } from './lugar';

import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

export interface PapelitoProps {
  id: string;
  texto: string;
  provincia: string | null;
  tema: string | null;
  /** Sin inclinación: la vista previa de Publicar y las listas. */
  quieto?: boolean;
  /** El aporte propio, marcado en violeta. */
  propio?: boolean;
  /** Lo que va al pie a la derecha («Tocá para ver más»). */
  pie?: ReactNode;
  /** Los sellos, encima de todo. */
  children?: ReactNode;
  className?: string;
}

/**
 * La tarjeta de un aporte: quién lo imagina, la línea y el tema. Es la misma pieza en
 * Imaginar (vista previa), Mirar (la pila), Ver (tu aporte) y la imagen para compartir.
 */
export function Papelito({
  id,
  texto,
  provincia,
  tema,
  quieto,
  propio,
  pie,
  children,
  className,
}: PapelitoProps) {
  return (
    <article
      className={cn(
        'bg-papel-crudo border-papel-borde relative flex flex-col justify-between gap-5 border px-5 pb-4 pt-6 shadow-[0_1px_0_#D8D4C8,0_14px_26px_-18px_rgba(22,19,14,0.3)]',
        propio && 'ring-violeta ring-2',
        className,
      )}
      style={{ transform: quieto ? undefined : `rotate(${giroDe(id)}deg)` }}
    >
      <p className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.12em]">
        Alguien de {deDonde(provincia)} imagina
      </p>
      <p className="font-archivo text-tinta text-[25px] font-semibold leading-[1.27] [text-wrap:pretty]">
        «{texto}»
      </p>
      <p className="font-space text-tinta-50 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.08em]">
        <span>
          <span aria-hidden className="bg-violeta mr-2 inline-block h-2 w-2 align-[1px]" />
          {tema ?? 'Sin tema'}
        </span>
        {pie}
      </p>
      {children}
    </article>
  );
}
