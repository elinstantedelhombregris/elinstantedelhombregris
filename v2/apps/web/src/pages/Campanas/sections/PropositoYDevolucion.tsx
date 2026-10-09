import { CalendarDays } from 'lucide-react';

import { esEjemploLocal, fechaCampana } from '../presentacion';

import type { CampanaPublica } from '@v2/shared';

export function PropositoYDevolucion({ campana: c }: { campana: CampanaPublica }) {
  return (
    <section
      className="mt-9 grid gap-8 md:grid-cols-[1.2fr_1fr]"
      aria-label="Propósito y devolución de la campaña"
    >
      <div>
        <h2 className="font-anton text-3xl">Para qué abrimos esta campaña</h2>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed">{c.contrato.proposito}</p>
        <h3 className="font-anton mt-7 text-xl">A quiénes queremos escuchar</h3>
        <p className="mt-3 leading-relaxed">{c.contrato.participantes}</p>
      </div>
      <div className="bg-papel-crudo border-tinta border p-6">
        <h2 className="font-anton text-3xl">Qué podés esperar</h2>
        <p className="text-tinta-75 mt-3 text-sm leading-relaxed">
          La devolución es el texto que publica quien coordina la campaña con lo que se leyó.
        </p>
        <p className="mt-4 leading-relaxed">{c.contrato.devolucion}</p>
        <p className="mt-5 flex items-start gap-2 text-sm">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {esEjemploLocal(c) ? 'Fecha ilustrativa: ' : 'Fecha prevista: '}
          {fechaCampana(c.contrato.fechaDevolucion)}
        </p>
        <div className="border-tinta/25 mt-5 border-t pt-5 text-sm leading-relaxed">
          <p className="font-space text-tinta-50 text-[10px] uppercase tracking-[.12em]">
            Qué efecto puede tener
          </p>
          <p className="text-tinta-75 mt-2">{c.contrato.efecto}</p>
        </div>
      </div>
    </section>
  );
}
