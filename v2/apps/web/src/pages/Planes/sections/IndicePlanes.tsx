import { useState } from 'react';
import { Link } from 'wouter';

import { PLAN_COUNT, PLAN_META, PLANES, numeroDeExpediente } from '../la-prueba-data';

import type { PlanRegistryEntry } from '~/lib/plans-registry';

import { FilaIndiceExpandible } from '~/components/papel/primitives';

/** §2 + §3 de la spec — el índice de los {N} + el plan meta. Apertura única. */
export function IndicePlanes() {
  const [abierto, setAbierto] = useState<string | null>(null);

  const fila = (plan: PlanRegistryEntry, num: string) => (
    <FilaIndiceExpandible
      key={plan.slug}
      num={num}
      idPanel={`panel-${plan.slug}`}
      abierta={abierto === plan.slug}
      onToggle={() => { setAbierto(abierto === plan.slug ? null : plan.slug); }}
      encabezado={
        <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span
            className={`font-anton text-2xl tracking-[0.01em] ${abierto === plan.slug ? 'text-violeta' : 'text-tinta'}`}
          >
            {plan.code}
          </span>
          <span className="text-tinta-75 text-[15px] leading-snug">{plan.title}</span>
        </span>
      }
    >
      {plan.summary ? (
        <p className="text-tinta-90 mb-3 max-w-[720px] text-base leading-relaxed [text-wrap:pretty]">
          {plan.summary}
        </p>
      ) : null}
      <Link
        href={`/planes/${plan.slug}`}
        className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
      >
        Leer el documento →
      </Link>
    </FilaIndiceExpandible>
  );

  return (
    <section className="mx-auto max-w-[1440px] px-10 pb-[72px] max-[560px]:px-5">
      <h2 className="font-space text-tinta-50 mb-5 text-[11px] uppercase tracking-[0.16em]">
        Los {PLAN_COUNT} planes · tocá para abrir
      </h2>
      <div className="border-tinta border-t">
        {PLANES.map((plan, i) => fila(plan, numeroDeExpediente(i)))}
      </div>

      {PLAN_META ? (
        <>
          <h2 className="font-space text-tinta-50 mb-5 mt-14 text-[11px] uppercase tracking-[0.16em]">
            El plan meta · fuera de la cuenta
          </h2>
          <div className="border-tinta border-t">{fila(PLAN_META, '00')}</div>
          <p className="font-space text-tinta-30 mt-3 text-[10px] uppercase tracking-[0.12em]">
            PLANRUTA no es un plan más: es el manual de cómo arrancar los otros {PLAN_COUNT}.
          </p>
        </>
      ) : null}
    </section>
  );
}
