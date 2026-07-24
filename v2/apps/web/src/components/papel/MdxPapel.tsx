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
 * (`.edicion-impresa`, index.css).
 */
export function MdxPapel({ raw, className }: MdxPapelProps) {
  const html = useMemo(() => renderMarkdown(raw), [raw]);
  return (
    <div
      className={cn(
        'prose max-w-none',
        'prose-headings:font-anton prose-headings:font-normal prose-headings:text-tinta',
        'prose-h1:text-[clamp(30px,4.4vw,52px)] prose-h1:leading-none prose-h1:mb-6',
        'prose-h2:text-[26px] prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-tight',
        'prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3',
        'prose-p:font-archivo prose-p:text-[17px] prose-p:leading-[1.75] prose-p:text-tinta-90 prose-p:[text-wrap:pretty]',
        'prose-li:text-tinta-90 prose-li:text-[17px] prose-strong:text-tinta',
        'prose-a:text-violeta prose-a:underline prose-a:decoration-1 hover:prose-a:text-violeta-hover',
        'prose-blockquote:border-l-2 prose-blockquote:border-tinta prose-blockquote:font-normal prose-blockquote:text-tinta-75',
        'prose-hr:border-papel-borde',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
