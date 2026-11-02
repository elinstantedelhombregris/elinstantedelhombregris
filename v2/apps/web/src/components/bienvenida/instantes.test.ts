import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { instantes } from './instantes';

const plain = (value: string) =>
  value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

describe('50 instantes publicados', () => {
  it('conserva las citas literales, énfasis y rutas de los textos publicados', () => {
    expect(instantes).toHaveLength(50);
    expect(new Set(instantes.map((entry) => entry.id)).size).toBe(50);
    expect(new Set(instantes.map((entry) => entry.quote)).size).toBe(50);
    for (const entry of instantes) {
      const source = readFileSync(
        path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          '../../../../../',
          entry.sourceFile.replace(/^v2\//, ''),
        ),
        'utf8',
      );
      const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
      expect(plain(body), entry.id).toContain(plain(entry.quote));
      expect(entry.quote).toContain(entry.highlight);
      expect(source).not.toMatch(/^draft:\s*true\s*$/m);
      const slug = /^slug:\s*["']?([a-z0-9-]+)/m.exec(source)?.[1];
      expect(slug).toBeTruthy();
      const prefix =
        entry.family === 'Manifiesto' ? '' : entry.family === 'Bitácora' ? '/bitacora' : '/ensayos';
      expect(entry.url).toBe(prefix ? `${prefix}/${slug ?? ''}` : '/manifiesto');
    }
  });
  it('conserva solo las dos composiciones con la imagen a la izquierda', () => {
    expect(new Set(instantes.map((entry) => entry.layout))).toEqual(
      new Set(['pliego', 'contratapa']),
    );
    for (const layout of ['pliego', 'contratapa'])
      expect(instantes.filter((entry) => entry.layout === layout)).toHaveLength(25);
  });
});
