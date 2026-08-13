import { describe, expect, it } from 'vitest';

import { separarMdx } from '../src/content/mdx';

const RAW = `---\nslug: una-leccion\ntitle: Una lección\n---\n\n## Cuerpo\n\nProsa.\n`;

describe('separarMdx', () => {
  it('reconstruye el archivo exacto: encabezado + cuerpo === raw', () => {
    const { encabezado, cuerpo } = separarMdx(RAW);
    expect(encabezado + cuerpo).toBe(RAW);
  });

  it('el encabezado incluye los dos delimitadores y nada más', () => {
    const { encabezado } = separarMdx(RAW);
    expect(encabezado.startsWith('---\n')).toBe(true);
    expect(encabezado.trimEnd().endsWith('---')).toBe(true);
    expect(encabezado).toContain('slug: una-leccion');
    expect(encabezado).not.toContain('## Cuerpo');
  });

  it('un archivo sin frontmatter es todo cuerpo', () => {
    expect(separarMdx('## Sólo cuerpo')).toEqual({ encabezado: '', cuerpo: '## Sólo cuerpo' });
  });

  it('un frontmatter sin cerrar no se parte: es todo cuerpo', () => {
    const roto = '---\nslug: x\n';
    expect(separarMdx(roto)).toEqual({ encabezado: '', cuerpo: roto });
  });
});
