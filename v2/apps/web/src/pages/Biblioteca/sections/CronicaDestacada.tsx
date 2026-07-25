import { Link } from 'wouter';

import { HREF_CRONICA_PAIS_QUE_VIENE } from '../biblioteca-data';

/**
 * § adenda de la spec de la biblioteca (docs/specs/2026-07-25-la-cronica-papel-y-tinta.md)
 * — el bloque que abre la puerta a la novela (D9), entre la vidriera de
 * entrenamientos y la bitácora. Mismo recipe que `ManifiestoDestacado`
 * (§9b: repetir antes de inventar) — la etiqueta y la línea son las únicas
 * que cambian. La línea reusa verbatim la frase keystone de D2: la
 * advertencia de ficción llega antes del clic.
 */
export function CronicaDestacada() {
  return (
    <section id="cronica" className="scroll-mt-20 mx-auto max-w-[1100px] px-10 pb-14 max-[560px]:px-5">
      <Link
        href={HREF_CRONICA_PAIS_QUE_VIENE}
        className="bg-tinta text-papel flex flex-wrap items-center gap-8 px-10 py-9 transition-transform duration-150 hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
        <span className="font-space border-violeta-claro text-violeta-claro whitespace-nowrap border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em]">
          Ficción especulativa
        </span>
        <span className="min-w-[260px] flex-1">
          <h2 className="font-anton mb-1.5 text-[clamp(24px,3vw,36px)] leading-[1.05]">
            La crónica del país que viene
          </h2>
          <span className="text-oscuro-secundario block text-sm leading-[1.6]">
            No es una predicción. Es un ejercicio para ver que otro camino es posible.
          </span>
        </span>
        <span className="font-space text-violeta-claro whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.08em]">
          Leer la crónica →
        </span>
      </Link>
    </section>
  );
}
