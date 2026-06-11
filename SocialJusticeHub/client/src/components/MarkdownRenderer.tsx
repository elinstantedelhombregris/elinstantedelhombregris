import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'light' | 'dark';
}

const INLINE_EMPHASIS = [
  { regex: /\*\*([^*]+)\*\*/g, replace: '<strong>$1</strong>' },
  { regex: /__([^_]+)__/g, replace: '<strong>$1</strong>' },
  { regex: /\*([^*]+)\*/g, replace: '<em>$1</em>' },
  { regex: /_([^_]+)_/g, replace: '<em>$1</em>' },
  { regex: /`([^`]+)`/g, replace: '<code>$1</code>' },
];

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const applyInlineFormatting = (text: string) => {
  let formatted = text;

  formatted = formatted.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  INLINE_EMPHASIS.forEach(({ regex, replace }) => {
    formatted = formatted.replace(regex, replace);
  });

  return formatted;
};

const convertMarkdownToHtml = (markdown: string) => {
  const lines = markdown.split(/\r?\n/);
  let html = '';
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const closeParagraph = () => {
    if (paragraphBuffer.length) {
      html += `<p>${paragraphBuffer.join(' ')}</p>`;
      paragraphBuffer = [];
    }
  };

  const closeLists = () => {
    if (inUl) {
      html += '</ul>';
      inUl = false;
    }
    if (inOl) {
      html += '</ol>';
      inOl = false;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      const quoteBody = blockquoteBuffer.join('<br/>');
      html += `<blockquote><p>${quoteBody}</p></blockquote>`;
      blockquoteBuffer = [];
      inBlockquote = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeParagraph();
      closeLists();
      closeBlockquote();
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      closeParagraph();
      closeLists();
      const quoteText = applyInlineFormatting(escapeHtml(trimmed.replace(/^>\s?/, '')));
      blockquoteBuffer.push(quoteText);
      inBlockquote = true;
      continue;
    }

    closeBlockquote();

    if (/^#{1,6}\s/.test(trimmed)) {
      closeParagraph();
      closeLists();
      const level = Math.min(trimmed.match(/^#{1,6}/)?.[0].length ?? 1, 6);
      const text = applyInlineFormatting(escapeHtml(trimmed.replace(/^#{1,6}\s/, '')));
      html += `<h${level}>${text}</h${level}>`;
      continue;
    }

    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      closeParagraph();
      closeLists();
      html += '<hr />';
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      closeParagraph();
      if (!inUl) {
        closeLists();
        html += '<ul>';
        inUl = true;
      }
      const text = applyInlineFormatting(escapeHtml(trimmed.replace(/^[-*+]\s+/, '')));
      html += `<li>${text}</li>`;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      closeParagraph();
      if (!inOl) {
        closeLists();
        html += '<ol>';
        inOl = true;
      }
      const text = applyInlineFormatting(escapeHtml(trimmed.replace(/^\d+\.\s+/, '')));
      html += `<li>${text}</li>`;
      continue;
    }

    paragraphBuffer.push(applyInlineFormatting(escapeHtml(trimmed)));
  }

  closeBlockquote();
  closeParagraph();
  closeLists();

  return html;
};

const isLikelyHtml = (content: string) => /<\/?[a-z][\s\S]*>/i.test(content.trim());

const LIGHT_PROSE = `prose prose-lg prose-slate max-w-none
        prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900 prose-headings:!text-slate-900
        prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight prose-h1:!text-slate-900
        prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8 prose-h2:leading-tight prose-h2:!text-slate-900
        prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6 prose-h3:leading-snug prose-h3:!text-slate-900
        prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-5 prose-h4:!text-slate-900
        prose-p:text-base prose-p:leading-relaxed prose-p:mb-6 prose-p:text-slate-800 prose-p:!text-slate-800
        prose-a:text-blue-600 prose-a:no-underline prose-a:font-semibold hover:prose-a:text-blue-800 hover:prose-a:underline prose-a:!text-blue-600
        prose-strong:text-slate-900 prose-strong:font-bold prose-strong:!text-slate-900
        prose-em:text-slate-800 prose-em:italic prose-em:!text-slate-800
        prose-ul:my-6 prose-ul:space-y-2
        prose-ol:my-6 prose-ol:space-y-2
        prose-li:text-slate-800 prose-li:leading-relaxed prose-li:!text-slate-800
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:rounded-2xl prose-blockquote:shadow-sm prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:text-slate-800 prose-blockquote:my-8 prose-blockquote:!text-slate-800
        prose-code:text-sm prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-slate-900 prose-code:!text-slate-900
        prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-6 prose-pre:overflow-x-auto
        prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8 prose-img:w-full
        prose-hr:border-slate-300 prose-hr:my-8
      `;

const DARK_PROSE = `prose prose-lg prose-invert max-w-none
  prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#F5F7FA]
  prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight
  prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10 prose-h2:leading-tight
  prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:leading-snug
  prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6
  prose-p:text-[1.0625rem] prose-p:leading-[1.85] prose-p:mb-6 prose-p:text-slate-300
  prose-a:text-violet-400 prose-a:no-underline prose-a:font-semibold hover:prose-a:text-violet-300 hover:prose-a:underline
  prose-strong:text-slate-100 prose-strong:font-bold
  prose-em:text-slate-200 prose-em:italic
  prose-ul:my-6 prose-ul:space-y-2
  prose-ol:my-6 prose-ol:space-y-2
  prose-li:text-slate-300 prose-li:leading-relaxed
  prose-blockquote:border-l-2 prose-blockquote:border-l-slate-400/60 prose-blockquote:bg-white/[0.04]
  prose-blockquote:rounded-r-2xl prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-8
  prose-blockquote:font-serif prose-blockquote:text-slate-200 prose-blockquote:not-italic
  prose-code:text-sm prose-code:bg-white/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-slate-200
  prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-white/10 prose-pre:text-slate-100 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:overflow-x-auto
  prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:my-8 prose-img:w-full
  prose-hr:border-0 prose-hr:h-px prose-hr:bg-gradient-to-r prose-hr:from-transparent prose-hr:via-slate-400/40 prose-hr:to-transparent prose-hr:my-10
`;

const MarkdownRenderer = ({ content, className = '', variant = 'light' }: MarkdownRendererProps) => {
  const parsedContent = useMemo(() => {
    if (!content) return '';
    const trimmed = content.trim();
    if (isLikelyHtml(trimmed)) {
      return trimmed;
    }
    return convertMarkdownToHtml(trimmed);
  }, [content]);

  const proseClasses = variant === 'dark' ? DARK_PROSE : LIGHT_PROSE;

  return (
    <div
      className={`${proseClasses} ${className}`}
      style={variant === 'light' ? { color: '#1e293b' } : undefined}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
};

export default MarkdownRenderer;
