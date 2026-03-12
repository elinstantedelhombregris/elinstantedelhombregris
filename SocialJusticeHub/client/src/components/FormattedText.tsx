/**
 * FormattedText — Renders AI-generated text beautifully.
 *
 * Detects and formats:
 * - Headers (lines starting with # or ALL CAPS lines)
 * - Bullet points (- or • or * prefixed)
 * - Numbered lists (1. 2. 3.)
 * - Bold text (**text**)
 * - Section dividers (═══ or --- or ___)
 * - Quoted text ("text" at start of line)
 * - Empty lines as spacing
 */

function parseLine(text: string): JSX.Element {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function isHeader(line: string): boolean {
  if (line.startsWith('#')) return true;
  // ALL CAPS line with 3+ chars, possibly with emoji
  const stripped = line.replace(/[^\p{L}\s]/gu, '').trim();
  return stripped.length >= 3 && stripped === stripped.toUpperCase() && /[A-ZÁ-Ú]/.test(stripped);
}

function isSectionDivider(line: string): boolean {
  const trimmed = line.trim();
  return /^[═─━─\-_]{3,}$/.test(trimmed) || /^[═]{3,}/.test(trimmed);
}

export default function FormattedText({
  text,
  variant = 'default',
}: {
  text: string;
  variant?: 'default' | 'document' | 'analysis';
}) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listBuffer: { type: 'bullet' | 'number'; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    const ListTag = listBuffer.type === 'number' ? 'ol' : 'ul';
    elements.push(
      <ListTag
        key={`list-${elements.length}`}
        className={`space-y-1.5 mb-4 ${
          listBuffer.type === 'number'
            ? 'list-decimal list-inside'
            : 'list-none'
        }`}
      >
        {listBuffer.items.map((item, i) => (
          <li
            key={i}
            className={`text-slate-300 text-sm leading-relaxed ${
              listBuffer!.type === 'bullet' ? 'flex items-start gap-2' : ''
            }`}
          >
            {listBuffer!.type === 'bullet' && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 mt-2 flex-shrink-0" />
            )}
            <span>{parseLine(item)}</span>
          </li>
        ))}
      </ListTag>
    );
    listBuffer = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    // Section divider
    if (isSectionDivider(trimmed)) {
      flushList();
      elements.push(
        <div key={`div-${i}`} className="my-5 border-t border-white/5" />
      );
      continue;
    }

    // Header: # Title or ALL CAPS
    if (isHeader(trimmed)) {
      flushList();
      const headerText = trimmed.replace(/^#+\s*/, '');
      const level = trimmed.startsWith('###') ? 3 : trimmed.startsWith('##') ? 2 : 1;
      const sizes = {
        1: 'text-lg md:text-xl font-bold text-white mt-6 mb-3',
        2: 'text-base md:text-lg font-bold text-white mt-5 mb-2',
        3: 'text-sm font-bold text-slate-200 mt-4 mb-2 uppercase tracking-wide',
      };
      elements.push(
        <h3 key={`h-${i}`} className={sizes[level as 1 | 2 | 3] || sizes[2]}>
          {headerText}
        </h3>
      );
      continue;
    }

    // Bullet list: - or • or *
    const bulletMatch = trimmed.match(/^[-•*]\s+(.+)/);
    if (bulletMatch) {
      if (listBuffer?.type !== 'bullet') {
        flushList();
        listBuffer = { type: 'bullet', items: [] };
      }
      listBuffer!.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered list: 1. or 1)
    const numberMatch = trimmed.match(/^\d+[.)]\s+(.+)/);
    if (numberMatch) {
      if (listBuffer?.type !== 'number') {
        flushList();
        listBuffer = { type: 'number', items: [] };
      }
      listBuffer!.items.push(numberMatch[1]);
      continue;
    }

    // Quote line
    if (trimmed.startsWith('"') || trimmed.startsWith('«')) {
      flushList();
      elements.push(
        <blockquote key={`q-${i}`} className="pl-4 border-l-2 border-purple-500/30 my-3 italic text-slate-400 text-sm leading-relaxed">
          {parseLine(trimmed)}
        </blockquote>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-slate-300 text-sm leading-relaxed mb-3">
        {parseLine(trimmed)}
      </p>
    );
  }

  flushList();

  const containerClass = variant === 'document'
    ? 'bg-white/[0.03] border border-purple-500/10 rounded-2xl p-5 md:p-8'
    : variant === 'analysis'
    ? 'bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8'
    : '';

  return (
    <div className={containerClass}>
      {elements}
    </div>
  );
}
