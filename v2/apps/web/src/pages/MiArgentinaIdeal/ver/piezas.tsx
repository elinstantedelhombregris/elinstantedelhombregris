import { useId } from 'react';
import { Link } from 'wouter';

import { IMAGINAR_HREF } from './formato';

import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

/** Una sección de Ver: filete de tinta arriba, título en Anton y una bajada. */
export function Seccion({
  titulo,
  bajada,
  children,
  className,
}: {
  titulo: string;
  bajada?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn('border-tinta flex flex-col gap-3 border-t-2 pt-5', className)}
    >
      <h2 id={id} className="font-anton text-[27px] font-normal leading-[1.05] [text-wrap:balance]">
        {titulo}
      </h2>
      {bajada ? <p className="text-tinta-75 max-w-[60ch] text-[15.5px]">{bajada}</p> : null}
      {children}
    </section>
  );
}

/** Una fila de aporte: la línea entre comillas y lo que se dice de ella. */
export function FilaAporte({ texto, children }: { texto: string; children?: ReactNode }) {
  return (
    <li className="border-papel-borde flex flex-col gap-2 border-b py-3 last:border-b-0">
      <p className="font-archivo text-[17.5px] font-semibold leading-[1.32] [text-wrap:pretty]">
        «{texto}»
      </p>
      {children}
    </li>
  );
}

/** El renglón chico en Space Mono que va debajo de un aporte. */
export function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'font-space text-tinta-50 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11.5px] tabular-nums tracking-[0.04em]',
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Los enlaces de Ver: subrayados, con un blanco táctil de 44 px y foco visible. */
export function EnlaceVer({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-tinta-75 hover:text-violeta focus-visible:outline-violeta inline-flex min-h-11 items-center text-[15px] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
    >
      {children}
    </Link>
  );
}

/**
 * La base en cero: qué falta para que aparezca algo, sin pedir perdón, y la invitación
 * a sumar el propio aporte.
 */
export function Vacio({ children }: { children: ReactNode }) {
  return (
    <div className="border-tinta-30 flex flex-col items-start gap-2 border border-dashed px-4 py-4">
      <p className="text-tinta-75 text-[15px] leading-relaxed">{children}</p>
      <EnlaceVer href={IMAGINAR_HREF} className="text-violeta font-bold">
        Sumá el tuyo →
      </EnlaceVer>
    </div>
  );
}
