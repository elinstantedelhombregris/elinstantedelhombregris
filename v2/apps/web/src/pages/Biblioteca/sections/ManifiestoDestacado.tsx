import { Link } from 'wouter';

import { HREF_MANIFIESTO } from '../biblioteca-data';

/**
 * § 2 de la spec — el manifiesto destacado. Card oscura de ancho completo,
 * un solo link. Sin cifras: el manifiesto no tiene registry propio y un
 * «seis partes, cinco minutos» hardcodeado violaría la directiva de datos
 * (spec, Decisión 11). La etiqueta es la receta de tag §5 compuesta inline
 * sobre oscuro (§9b: repetir la receta antes que abstraer).
 */
export function ManifiestoDestacado() {
  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-14 max-[560px]:px-5">
      <Link
        href={HREF_MANIFIESTO}
        className="bg-tinta text-papel flex flex-wrap items-center gap-8 px-10 py-9 transition-transform duration-150 hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
        <span className="font-space border-violeta-claro text-violeta-claro whitespace-nowrap border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em]">
          Documento fundacional
        </span>
        <span className="min-w-[260px] flex-1">
          <h2 className="font-anton mb-1.5 text-[clamp(24px,3vw,36px)] leading-[1.05]">
            El manifiesto del hombre gris
          </h2>
          <span className="text-oscuro-secundario block text-sm leading-[1.6]">
            No es un programa: es un espejo. Si algo te resuena, ahí empieza.
          </span>
        </span>
        <span className="font-space text-violeta-claro whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.08em]">
          Leerlo entero →
        </span>
      </Link>
    </section>
  );
}
