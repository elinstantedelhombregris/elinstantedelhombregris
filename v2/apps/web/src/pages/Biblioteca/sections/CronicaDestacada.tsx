import { Link } from 'wouter';

import { contar, ENTREGA_COUNT, ESTANTES, HREF_CRONICA_PAIS_QUE_VIENE } from '../biblioteca-data';

import { EncabezadoEstante } from './EncabezadoEstante';

/**
 * § adenda de la spec madre (docs/specs/2026-07-25-la-cronica-papel-y-tinta.md)
 * + spec 2026-08-20 §3: la gemela se divorcia — card clara con borde duro
 * para que la única oscura de la página sea el manifiesto. La línea keystone
 * de D2 queda verbatim: la advertencia de ficción llega antes del clic. Las
 * entregas salen del registry (cifra sin dato ⇒ el tramo se omite).
 */
const ESTANTE = ESTANTES.find((e) => e.ancla === 'cronica');

export function CronicaDestacada() {
  const entregas = ENTREGA_COUNT > 0 ? ` · ${contar(ENTREGA_COUNT, 'entrega', 'entregas')}` : '';
  return (
    <section id="cronica" className="scroll-mt-32 mx-auto max-w-[1100px] px-10 pb-14 max-[560px]:px-5">
      <EncabezadoEstante
        num={ESTANTE?.num ?? '04'}
        nombre={ESTANTE?.nombre ?? 'La crónica del país que viene'}
      />
      <Link
        href={HREF_CRONICA_PAIS_QUE_VIENE}
        className="border-tinta bg-papel-crudo mt-6 flex flex-wrap items-center gap-8 border-2 px-10 py-9 transition-transform duration-150 hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
        <span className="font-space border-violeta text-violeta whitespace-nowrap border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em]">
          Ficción especulativa
        </span>
        <span className="min-w-[260px] flex-1">
          <h3 className="font-anton text-tinta mb-1.5 text-[clamp(24px,3vw,36px)] leading-[1.05]">
            La crónica del país que viene
          </h3>
          <span className="text-tinta-75 block text-sm leading-[1.6]">
            No es una predicción. Es un ejercicio para ver que otro camino es posible.
          </span>
        </span>
        <span className="font-space text-violeta whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.08em]">
          Leer la crónica{entregas} →
        </span>
      </Link>
    </section>
  );
}
