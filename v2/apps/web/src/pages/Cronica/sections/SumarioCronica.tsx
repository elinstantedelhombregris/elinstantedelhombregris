import { CAPITULO_COUNT, idCapitulo, numeroDeCapitulo } from '../cronica-data';

import { CRONICA_CHAPTERS } from '~/lib/cronica-registry';

/** Sumario (spec 3.6): ancla nativa por capítulo. No se imprime: es navegación. */
export function SumarioCronica() {
  return (
    <nav aria-label="Los capítulos de la crónica" className="mt-10 print:hidden">
      <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.16em]">
        El recorrido · {CAPITULO_COUNT} capítulos
      </p>
      {CRONICA_CHAPTERS.map((capitulo, i) => (
        <a
          key={capitulo.slug}
          href={`#${idCapitulo(capitulo)}`}
          className="border-papel-borde hover:bg-papel-presionado text-tinta grid grid-cols-[56px_1fr_40px] items-baseline gap-5 border-b px-2 py-4 transition-colors duration-150 max-[560px]:grid-cols-[44px_1fr_32px]"
        >
          <span className="font-space text-tinta-30 text-sm">{numeroDeCapitulo(i)}</span>
          <span>
            <span className="block text-[17px] leading-snug">{capitulo.title}</span>
            <span className="font-space text-tinta-50 mt-1 block text-[11px] uppercase tracking-[0.1em]">
              {capitulo.subtitle}
            </span>
          </span>
          <span className="font-space text-tinta-50 justify-self-end">→</span>
        </a>
      ))}
    </nav>
  );
}
