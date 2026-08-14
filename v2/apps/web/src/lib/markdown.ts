/**
 * Tiny client-side markdown helper.
 *
 * Used by pages that import their content as raw text via Vite's
 * `?raw` suffix, then render it inside a `<MdxContent body>` block.
 *
 * Frontmatter (between leading `---` lines) is stripped before render.
 */
import { marked, Renderer, type Tokens } from 'marked';

const FRONTMATTER_RE = /^---\n[\s\S]*?\n---\n/;

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const renderer = new Renderer();
renderer.image = ({ href, title, text }) => {
  const source = escapeHtmlAttribute(href);
  const alt = escapeHtmlAttribute(text);
  const dimensions = href.startsWith('/media/bitacora/pilotos/diagramas/')
    ? ' width="1200" height="720"'
    : '';
  const image = `<img src="${source}" alt="${alt}" loading="lazy"${dimensions}>`;
  if (title === null) return image;
  return `<figure>${image}<figcaption>${escapeHtmlAttribute(title)}</figcaption></figure>`;
};

const renderParagraph = renderer.paragraph.bind(renderer);
renderer.paragraph = function paragraph(token: Tokens.Paragraph) {
  const [onlyToken] = token.tokens;
  if (token.tokens.length === 1 && onlyToken?.type === 'image') {
    return renderer.image(onlyToken as Tokens.Image);
  }
  return renderParagraph(token);
};

export function stripFrontmatter(raw: string): string {
  return raw.replace(FRONTMATTER_RE, '').trim();
}

export function renderMarkdown(raw: string): string {
  const body = stripFrontmatter(raw);
  // marked is synchronous when given { async: false } (the default).
  const result = marked.parse(body, { gfm: true, breaks: false, renderer });
  if (typeof result !== 'string') {
    throw new Error('marked.parse returned a Promise — expected string');
  }
  return result;
}
