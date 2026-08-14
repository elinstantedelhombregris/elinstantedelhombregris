import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { revisarCorpus } from '../entrenamientos-check';

function corpus(cuerpo: string, extra = ''): string {
  const raiz = mkdtempSync(join(tmpdir(), 'entrenamientos-check-'));
  const curso = join(raiz, 'content/courses/curso-uno');
  mkdirSync(curso, { recursive: true });
  writeFileSync(
    join(curso, 'course.json'),
    JSON.stringify({
      slug: 'curso-uno',
      title: 'Curso uno',
      description: 'Descripción',
      excerpt: 'Extracto',
      category: 'civica',
      level: 'beginner',
      duration: 1,
      orderIndex: 1,
      promesa: ['Resultado uno', 'Resultado dos', 'Resultado tres'],
      noCubre: ['Límite uno', 'Límite dos'],
      paraQuien: 'Personas curiosas',
      productoFinal: 'Una ficha',
      coverImage: '/course-art/civica.webp',
      fuentesBase: [
        { url: 'https://example.com/uno', titulo: 'Fuente uno', consultada: '2026-08-13' },
        { url: 'https://example.com/dos', titulo: 'Fuente dos', consultada: '2026-08-13' },
      ],
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      quizFile: 'quiz.json',
      lessons: [{ key: '01-leccion-uno', title: 'Lección uno', duration: 1, orderIndex: 1 }],
    }),
  );
  writeFileSync(
    join(curso, 'quiz.json'),
    JSON.stringify({ title: 'Práctica', description: 'Descripción', questions: [] }),
  );
  writeFileSync(
    join(curso, 'leccion-uno.mdx'),
    `---\nslug: leccion-uno\ncourseSlug: curso-uno\ntitle: Lección uno\norderIndex: 1\n${extra}---\n\n${cuerpo}\n`,
  );
  return raiz;
}

describe('revisarCorpus', () => {
  it('acepta una lección pendiente', async () =>
    expect(await revisarCorpus(corpus('Prosa corta.'))).toEqual([]));
  it('detecta una cola', async () =>
    expect(
      (
        await revisarCorpus(
          corpus(
            'Prosa.\n\n### Idea fuerza\n\nCuando un aprendizaje se traduce en decisiones mejores, ya está.',
          ),
        )
      ).join(' '),
    ).toMatch(/cola generada/i));
  it('detecta minutaje falso', async () =>
    expect((await revisarCorpus(corpus('palabra '.repeat(900)))).join(' ')).toMatch(/minutaje/i));
  it('detecta tuteo duro', async () =>
    expect((await revisarCorpus(corpus('Si tienes dudas.'))).join(' ')).toMatch(/tuteo/i));
  it('detecta h4', async () =>
    expect((await revisarCorpus(corpus('#### Cuarto nivel'))).join(' ')).toMatch(/encabezado/i));
  it('detecta estimatedMinutes', async () =>
    expect((await revisarCorpus(corpus('Prosa.', 'estimatedMinutes: 9\n'))).join(' ')).toContain(
      'estimatedMinutes',
    ));
});
