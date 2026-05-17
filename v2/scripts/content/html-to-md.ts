/**
 * HTML → Markdown converter for the fixed tag vocabulary used by
 * SocialJusticeHub/shared/blogContent.ts. Not a general-purpose
 * converter — only handles the tags actually present in the source.
 */
type Block =
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'para'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] };

const BLOCK_RE = /<(h1|h2|h3|p|blockquote|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi;

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function renderInline(s: string): string {
  let out = s;
  out = out.replace(/<br\s*\/?>/gi, '\n');
  out = out.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_m, t: string) => `**${collapseWhitespace(t)}**`);
  out = out.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_m, t: string) => `*${collapseWhitespace(t)}*`);
  out = out.replace(/<a\s+[^>]*href=(['"])([^'"]+)\1[^>]*>([\s\S]*?)<\/a>/gi, (_m, _q, href: string, t: string) => `[${collapseWhitespace(t)}](${href})`);
  out = out.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
  return collapseWhitespace(out);
}

function parseListItems(inner: string): string[] {
  const items: string[] = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner)) !== null) {
    items.push(renderInline(m[1] ?? ''));
  }
  return items;
}

function renderBlock(b: Block): string {
  if (b.kind === 'heading') return `${'#'.repeat(b.level)} ${b.text}`;
  if (b.kind === 'para') return b.text;
  if (b.kind === 'quote') return b.text.split('\n').map((line) => `> ${line}`).join('\n');
  if (b.ordered) return b.items.map((it, i) => `${i + 1}. ${it}`).join('\n');
  return b.items.map((it) => `- ${it}`).join('\n');
}

export function htmlToMarkdown(html: string): string {
  let src = html.trim();
  src = src.replace(/^<article[^>]*>\s*/i, '').replace(/\s*<\/article>\s*$/i, '');

  const blocks: Block[] = [];
  let m: RegExpExecArray | null;
  BLOCK_RE.lastIndex = 0;
  while ((m = BLOCK_RE.exec(src)) !== null) {
    const tag = (m[1] ?? '').toLowerCase();
    const inner = m[2] ?? '';
    if (tag === 'h1') continue;
    if (tag === 'h2') blocks.push({ kind: 'heading', level: 2, text: renderInline(inner) });
    else if (tag === 'h3') blocks.push({ kind: 'heading', level: 3, text: renderInline(inner) });
    else if (tag === 'p') blocks.push({ kind: 'para', text: renderInline(inner) });
    else if (tag === 'blockquote') blocks.push({ kind: 'quote', text: renderInline(inner) });
    else if (tag === 'ul') blocks.push({ kind: 'list', ordered: false, items: parseListItems(inner) });
    else if (tag === 'ol') blocks.push({ kind: 'list', ordered: true, items: parseListItems(inner) });
  }

  return blocks.map(renderBlock).join('\n\n').trim();
}
