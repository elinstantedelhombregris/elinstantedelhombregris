import { useMemo } from 'react';

import { renderMarkdown } from '~/lib/markdown';
import { cn } from '~/lib/utils';

interface MdxContentProps {
  raw: string;
  className?: string;
}

/**
 * Render a raw markdown / MDX body (frontmatter is stripped).
 *
 * The output uses Tailwind Typography's prose classes so headings,
 * blockquotes, etc. inherit the dark theme. Custom prose tweaks live
 * in apps/web/tailwind.config.ts (mostly: serif headings, iris-violet
 * accent on links, off-white body text).
 *
 * The HTML comes from `marked` which sanitizes by default in v15+.
 * Content is authored locally and bundled at build time, so we don't
 * need an extra DOMPurify pass — but we keep `prose` constrained to
 * known-good elements just in case.
 */
export function MdxContent({ raw, className }: MdxContentProps) {
  const html = useMemo(() => renderMarkdown(raw), [raw]);
  return (
    <div
      className={cn(
        'prose prose-invert max-w-none',
        'prose-headings:font-serif prose-headings:tracking-tight',
        'prose-h1:text-4xl prose-h1:mb-4',
        'prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4',
        'prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3',
        'prose-p:text-foreground/90 prose-p:leading-relaxed',
        'prose-a:text-iris-violet prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-foreground',
        'prose-blockquote:border-l-iris-violet prose-blockquote:text-foreground/80',
        'prose-em:text-foreground/85',
        'prose-hr:border-white/10',
        className,
      )}
       
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
