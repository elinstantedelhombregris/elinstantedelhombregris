import { Link } from 'wouter';

import { PLAN_COUNT, PLANES_TEASER } from '../landing-data';

/**
 * § 03 — La prueba de que se puede. Tres planes REALES del registro MDX
 * (grilla con juntas de tinta: gap de 1px sobre fondo tinta).
 */
export function PlanesTeaser() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-[88px] min-[961px]:px-10">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-space text-violeta mb-4 text-[11px] uppercase tracking-[0.16em]">
            § 03 — La prueba de que se puede
          </div>
          <h2 className="font-anton text-[clamp(40px,5vw,72px)] leading-none max-[960px]:text-[44px]">
            Un tipo común ya escribió
            <br />
            <span className="text-violeta">{PLAN_COUNT} planes de país.</span>
          </h2>
          <p className="text-tinta-50 mt-4 max-w-[520px] text-pretty text-base leading-relaxed">
            Sin cargo, sin equipo, sin permiso. No para que los sigas: para que la excusa de «no se
            puede» se quede sin trabajo.
          </p>
        </div>
        <Link
          href="/planes"
          className="font-space text-violeta hover:text-violeta-hover whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.08em] transition-colors"
        >
          Ver la prueba completa ↗
        </Link>
      </div>

      <div className="border-tinta bg-tinta grid grid-cols-3 gap-px border max-[960px]:grid-cols-1">
        {PLANES_TEASER.map((plan, i) => (
          <Link
            key={plan.slug}
            href={`/planes/${plan.slug}`}
            className="bg-papel text-tinta hover:bg-papel-crudo flex min-h-[230px] flex-col gap-3.5 p-[26px] pt-[30px] transition-colors duration-200"
          >
            <div className="font-space text-tinta-50 flex w-full items-center justify-between gap-3 text-[11px] uppercase tracking-[0.1em]">
              <span className="truncate">{plan.title}</span>
              <span className="shrink-0">
                {String(i + 1).padStart(2, '0')}/{PLAN_COUNT}
              </span>
            </div>
            <div className="font-anton text-[34px] leading-none">{plan.code}</div>
            <p className="text-tinta-75 m-0 line-clamp-4 text-pretty text-[15px] leading-[1.55]">
              {plan.summary}
            </p>
            <span className="font-space text-violeta mt-auto text-xs">Leer resumen →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
