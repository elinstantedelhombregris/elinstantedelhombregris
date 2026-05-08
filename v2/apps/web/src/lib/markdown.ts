/**
 * Tiny client-side markdown helper.
 *
 * Used by pages that import their content as raw text via Vite's
 * `?raw` suffix, then render it inside a `<MdxContent body>` block.
 *
 * Frontmatter (between leading `---` lines) is stripped before render.
 */
import { marked } from 'marked';

const FRONTMATTER_RE = /^---\n[\s\S]*?\n---\n/;

export function stripFrontmatter(raw: string): string {
  return raw.replace(FRONTMATTER_RE, '').trim();
}

export function renderMarkdown(raw: string): string {
  const body = stripFrontmatter(raw);
  // marked is synchronous when given { async: false } (the default).
  const result = marked.parse(body, { gfm: true, breaks: false });
  if (typeof result !== 'string') {
    throw new Error('marked.parse returned a Promise — expected string');
  }
  return result;
}
