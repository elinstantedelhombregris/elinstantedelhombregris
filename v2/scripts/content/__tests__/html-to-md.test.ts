import { describe, expect, it } from 'vitest';

import { htmlToMarkdown } from '../html-to-md';

describe('htmlToMarkdown', () => {
  it('1. strips the outer <article> wrapper', () => {
    expect(htmlToMarkdown('<article><p>hola</p></article>')).toBe('hola');
  });

  it('2. strips the leading <h1> (title lives in frontmatter)', () => {
    expect(htmlToMarkdown('<article><h1>Título</h1><p>cuerpo</p></article>')).toBe('cuerpo');
  });

  it('3. <h2> → ## and <h3> → ###', () => {
    expect(
      htmlToMarkdown('<article><h2>Sección</h2><p>uno</p><h3>Sub</h3><p>dos</p></article>'),
    ).toBe('## Sección\n\nuno\n\n### Sub\n\ndos');
  });

  it('4. paragraphs joined by a blank line', () => {
    expect(htmlToMarkdown('<article><p>a</p><p>b</p><p>c</p></article>')).toBe('a\n\nb\n\nc');
  });

  it('5. internal whitespace inside a paragraph collapses', () => {
    expect(htmlToMarkdown('<article><p>\n  hola   mundo\n</p></article>')).toBe('hola mundo');
  });

  it('6. <ul><li> → dash list', () => {
    expect(htmlToMarkdown('<article><ul><li>uno</li><li>dos</li></ul></article>')).toBe(
      '- uno\n- dos',
    );
  });

  it('7. <ol><li> → numbered list', () => {
    expect(
      htmlToMarkdown('<article><ol><li>uno</li><li>dos</li><li>tres</li></ol></article>'),
    ).toBe('1. uno\n2. dos\n3. tres');
  });

  it('8. <blockquote> → > prefix', () => {
    expect(htmlToMarkdown('<article><blockquote>frase</blockquote></article>')).toBe('> frase');
  });

  it('9. <strong> → **bold** and <em> → *italic*', () => {
    expect(
      htmlToMarkdown('<article><p>hola <strong>mundo</strong> y <em>fin</em></p></article>'),
    ).toBe('hola **mundo** y *fin*');
  });

  it('10. <a href> → [label](href)', () => {
    expect(
      htmlToMarkdown('<article><p>ver <a href="/recursos">recursos</a> ahora</p></article>'),
    ).toBe('ver [recursos](/recursos) ahora');
  });

  it('11. entity decoding limited to the supported set', () => {
    expect(
      htmlToMarkdown('<article><p>caf&eacute; &amp; pan &quot;rico&quot;</p></article>'),
    ).toBe('caf&eacute; & pan "rico"');
  });

  it('12. bold preserved inside a list item', () => {
    expect(
      htmlToMarkdown('<article><ul><li><strong>Clave:</strong> resto del item</li></ul></article>'),
    ).toBe('- **Clave:** resto del item');
  });
});
