import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { relevarCorpus } from '../entrenamientos-reporte';

function corpusDePrueba(): string {
  const raiz = mkdtempSync(join(tmpdir(), 'entrenamientos-'));
  const curso = join(raiz, 'content', 'courses', 'curso-uno');
  mkdirSync(curso, { recursive: true });
  writeFileSync(
    join(curso, 'course.json'),
    JSON.stringify({
      slug: 'curso-uno',
      lessons: [{ key: '01-leccion-uno', title: 'Lección uno', duration: 9, orderIndex: 1 }],
    }),
  );
  writeFileSync(
    join(curso, 'leccion-uno.mdx'),
    `---\nslug: leccion-uno\ncourseSlug: curso-uno\ntitle: Lección uno\norderIndex: 1\nestimatedMinutes: 9\n---\n\nCuatro palabras propias acá.\n\n### Idea fuerza\n\nCuando un aprendizaje se traduce en decisiones mejores, deja de ser información.`,
  );
  return raiz;
}

describe('relevarCorpus', () => {
  it('separa palabras propias de palabras de cola y compara minutos', () => {
    const filas = relevarCorpus(corpusDePrueba());
    expect(filas).toHaveLength(1);
    const fila = filas[0];
    if (!fila) throw new Error('Expected one row');
    expect(fila).toMatchObject({
      curso: 'curso-uno',
      leccion: 'leccion-uno',
      palabrasPropias: 4,
      motivo: 'cola-limpia',
      minutosDeclarados: 9,
      minutosReales: 1,
    });
    expect(fila.palabrasCola).toBeGreaterThan(10);
  });
});
