import { useMemo } from 'react';

import { renderMarkdown } from '~/lib/markdown';
import { cn } from '~/lib/utils';

interface MdxPapelProps {
  raw: string;
  className?: string;
}

/**
 * Cuerpo MDX en prosa papel (spec 2.4; la reusan los lectores de Fase 3).
 * Render verbatim vía marked. Tipografía del sistema: Anton para los
 * títulos del documento, Archivo para el cuerpo, violeta solo en links.
 * Sin serifa en pantalla — la serifa es exclusiva de la edición impresa
 * (`.edicion-impresa`, index.css). Los encabezados llevan id (los pone
 * `renderMarkdown`) y `scroll-mt-24` para que un salto de índice no quede
 * tapado por el header fijo.
 */
export function MdxPapel({ raw, className }: MdxPapelProps) {
  const html = useMemo(() => renderMarkdown(raw), [raw]);
  return (
    <div
      className={cn(
        'prose max-w-none',
        'prose-headings:font-anton prose-headings:font-normal prose-headings:text-tinta prose-headings:scroll-mt-24',
        'prose-h1:text-[clamp(30px,4.4vw,52px)] prose-h1:leading-none prose-h1:mb-6',
        'prose-h2:text-[26px] prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-tight',
        'prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3',
        'prose-p:font-archivo prose-p:text-[17px] prose-p:leading-[1.75] prose-p:text-tinta-90 prose-p:[text-wrap:pretty]',
        'prose-li:text-tinta-90 prose-li:text-[17px] prose-strong:text-tinta',
        'prose-a:text-violeta prose-a:underline prose-a:decoration-1 hover:prose-a:text-violeta-hover',
        'prose-blockquote:border-l-2 prose-blockquote:border-tinta prose-blockquote:font-normal prose-blockquote:text-tinta-75',
        'prose-figure:my-10 prose-figure:border-2 prose-figure:border-tinta prose-figure:bg-papel-sombra prose-figure:shadow-[6px_6px_0_var(--color-tinta)]',
        'prose-img:m-0 prose-img:w-full prose-img:border-0',
        'prose-figcaption:font-space prose-figcaption:text-tinta-75 prose-figcaption:m-0 prose-figcaption:border-t prose-figcaption:border-tinta prose-figcaption:px-4 prose-figcaption:py-3 prose-figcaption:text-[11px] prose-figcaption:font-normal prose-figcaption:not-italic prose-figcaption:uppercase prose-figcaption:tracking-[0.07em]',
        'prose-table:font-archivo prose-table:block prose-table:max-w-full prose-table:overflow-x-auto prose-table:text-[14px] prose-th:border-tinta prose-th:bg-papel-sombra prose-th:px-3 prose-th:py-2 prose-td:border-papel-borde prose-td:px-3 prose-td:py-2',
        'prose-hr:border-papel-borde',
        // Notas al pie (D-081): la referencia en mono chico, la lista al final bajo una regla.
        '[&_.nota-ref]:font-space [&_.nota-ref]:text-[11px] [&_.nota-ref_a]:no-underline',
        '[&_.notas-al-pie]:border-papel-borde [&_.notas-al-pie]:mt-12 [&_.notas-al-pie]:border-t [&_.notas-al-pie]:pt-6',
        '[&_.notas-al-pie_li]:text-[14px] [&_.notas-al-pie_li]:leading-relaxed [&_.notas-al-pie_li]:text-tinta-75 [&_.nota-vuelta]:font-space [&_.nota-vuelta]:no-underline',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
