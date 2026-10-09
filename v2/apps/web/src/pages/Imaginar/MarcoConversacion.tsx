import type { ReactNode } from 'react';

import { MarcoParticipacion } from '~/components/participacion/Elementos';

export function MarcoConversacion({
  integrada,
  titulo,
  entrada,
  children,
}: {
  integrada: boolean;
  titulo: string;
  entrada: string;
  children: ReactNode;
}) {
  if (!integrada)
    return (
      <MarcoParticipacion titulo={titulo} entrada={entrada}>
        {children}
      </MarcoParticipacion>
    );
  return (
    <section aria-label="Conversación idealizada" className="text-tinta">
      <p className="font-space text-violeta text-[11px] uppercase tracking-[.14em]">
        Una vida posible
      </p>
      <p className="text-tinta-75 mt-3 text-sm leading-relaxed">{entrada}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
