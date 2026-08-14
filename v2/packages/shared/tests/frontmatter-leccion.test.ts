import { describe, expect, it } from 'vitest';

import { lessonFrontmatterSchema } from '../src/content/frontmatter';

const BASE = { slug: 'una-leccion', courseSlug: 'un-curso', title: 'Una lección', orderIndex: 1 };

describe('lessonFrontmatterSchema', () => {
  it('parte pendiente y sin referencias', () => {
    const parsed = lessonFrontmatterSchema.parse(BASE);
    expect(parsed.cierre).toBe('pendiente');
    expect(parsed.fuentes).toEqual([]);
    expect(parsed.planes).toEqual([]);
  });
  it('acepta el contrato completo', () => {
    const parsed = lessonFrontmatterSchema.parse({
      ...BASE,
      cierre: 'completo',
      fuentes: [
        {
          url: 'https://www.argentina.gob.ar/',
          titulo: 'Argentina.gob.ar',
          consultada: '2026-08-13',
        },
      ],
      revisarAntesDe: '2027-02-01',
      planes: ['PLANREP'],
      ensayos: ['conocerse-sin-espejo'],
    });
    expect(parsed.cierre).toBe('completo');
  });
  it('rechaza fechas ambiguas', () => {
    expect(() =>
      lessonFrontmatterSchema.parse({ ...BASE, revisarAntesDe: '01/02/2027' }),
    ).toThrow();
  });
});
