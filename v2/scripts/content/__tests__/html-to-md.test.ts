import { describe, expect, it } from 'vitest';

import { htmlToMarkdown } from '../html-to-md';

describe('htmlToMarkdown', () => {
  it('1. strips the outer <article> wrapper', () => {
    expect(htmlToMarkdown('<article><p>hola</p></article>')).toBe('hola');
  });
});
