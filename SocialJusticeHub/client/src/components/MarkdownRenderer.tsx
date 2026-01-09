import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
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

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  const parsedContent = useMemo(() => {
    if (!content) return '';
    const trimmed = content.trim();
    if (isLikelyHtml(trimmed)) {
      return trimmed;
    }
    return convertMarkdownToHtml(trimmed);
  }, [content]);

  return (
    <div 
      className={`prose prose-lg prose-slate max-w-none ${className}
        prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900
        prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight
        prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-8 prose-h2:leading-tight
        prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6 prose-h3:leading-snug
        prose-p:text-base prose-p:leading-relaxed prose-p:mb-6 prose-p:text-slate-900
        prose-a:text-blue-600 prose-a:no-underline prose-a:font-semibold hover:prose-a:text-blue-800 hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-bold
        prose-em:text-slate-800 prose-em:italic
        prose-ul:my-6 prose-ul:space-y-2
        prose-ol:my-6 prose-ol:space-y-2
        prose-li:text-slate-900 prose-li:leading-relaxed
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-gradient-to-r prose-blockquote:from-blue-50 prose-blockquote:to-indigo-50 prose-blockquote:rounded-2xl prose-blockquote:shadow-sm prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:text-gray-800 prose-blockquote:my-8
        prose-code:text-sm prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-gray-800
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-6 prose-pre:overflow-x-auto
        prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8 prose-img:w-full
        prose-hr:border-gray-300 prose-hr:my-8
      `}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
};

export default MarkdownRenderer;
