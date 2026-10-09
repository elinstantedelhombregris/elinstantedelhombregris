import { Link } from 'wouter';

import { PLANES_TEASER } from '../landing-data';

import { Kicker } from '~/components/papel/primitives';
import { PLAN_COUNT } from '~/pages/Planes/la-prueba-data';

export function PlanesTeaser() {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 min-[961px]:grid-cols-[.8fr_1.2fr] min-[961px]:gap-16 min-[961px]:px-10 min-[961px]:py-20">
      <div>
        <Kicker className="mb-6">§ 03 — El ejemplo</Kicker>
        <h2 className="font-anton text-[clamp(38px,4.6vw,64px)] leading-[1.04]">{PLAN_COUNT} temas del país,<br /><span className="text-violeta">pensados de cero.</span></h2>
        <p className="text-tinta-75 mt-5 max-w-[460px] text-pretty text-[17px] leading-relaxed">Un PLAN es un tema del país pensado de punta a punta, como ejemplo abierto para discutir, cuestionar y mejorar con otras personas.</p>
        <Link href="/planes" className="font-space text-violeta mt-4 inline-flex min-h-11 items-center text-xs underline underline-offset-4">Ver todos los ejemplos ↗</Link>
      </div>
      <ol className="border-tinta border-t-2">
        {PLANES_TEASER.map((plan, i) => (
          <li key={plan.slug} className="border-papel-borde border-b">
            <Link href={`/planes/${plan.slug}`} className="group hover:bg-papel-crudo grid grid-cols-[26px_1fr] gap-4 py-6 transition-colors motion-reduce:transition-none min-[561px]:gap-6">
              <span aria-hidden className="font-space text-tinta-50 pt-1 text-[11px]">{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-anton text-balance text-[clamp(23px,2.6vw,34px)] leading-[1.1]">{plan.title}</h3>
                  <span aria-hidden className="font-space text-violeta text-xl transition-transform group-hover:translate-x-1 motion-reduce:transform-none">↗</span>
                </div>
                <p className="font-space text-tinta-50 mt-3 text-[10px] uppercase leading-relaxed tracking-[.08em]">{plan.code}</p>
                <p className="text-tinta-75 mt-3 line-clamp-3 max-w-[620px] text-pretty text-[15px] leading-relaxed">{plan.summary}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
