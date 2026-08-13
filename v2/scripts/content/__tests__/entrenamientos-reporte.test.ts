import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { relevarCorpus } from '../entrenamientos-reporte';

const CON_COLA = `Cuatro palabras propias acá.

### Idea fuerza

Cuando un aprendizaje se traduce en decisiones mejores, deja de ser información.`;

const frontmatter = (slug: string): string =>
  `---\nslug: ${slug}\ncourseSlug: curso-uno\ntitle: Lección\norderIndex: 1\nestimatedMinutes: 9\n---\n\n`;

/**
 * Corpus mínimo en un directorio temporal.
 * @param cuerpo El cuerpo de `leccion-uno.mdx`. Por defecto, uno con cola.
 * @param opciones `declararDeMas` agrega una entrada a course.json sin archivo;
 *   `archivoDeMas` agrega un archivo que course.json no declara.
 */
function corpusDePrueba(
  cuerpo: string = CON_COLA,
  opciones: { declararDeMas?: string; archivoDeMas?: string } = {},
): string {
  const raiz = mkdtempSync(join(tmpdir(), 'entrenamientos-'));
  const curso = join(raiz, 'content', 'courses', 'curso-uno');
  mkdirSync(curso, { recursive: true });

  const lessons = [{ key: '01-leccion-uno', title: 'Lección uno', duration: 9, orderIndex: 1 }];
  if (opciones.declararDeMas !== undefined) {
    lessons.push({ key: `02-${opciones.declararDeMas}`, title: 'Fantasma', duration: 9, orderIndex: 2 });
  }
  writeFileSync(join(curso, 'course.json'), JSON.stringify({ slug: 'curso-uno', lessons }));
  writeFileSync(join(curso, 'leccion-uno.mdx'), frontmatter('leccion-uno') + cuerpo);
  if (opciones.archivoDeMas !== undefined) {
    writeFileSync(
      join(curso, `${opciones.archivoDeMas}.mdx`),
      frontmatter(opciones.archivoDeMas) + cuerpo,
    );
  }
  return raiz;
}

describe('relevarCorpus', () => {
  it('separa palabras propias de palabras de cola y compara minutos', () => {
    const { filas } = relevarCorpus(corpusDePrueba());
    expect(filas).toHaveLength(1);
    expect(filas[0]).toMatchObject({
      curso: 'curso-uno',
      leccion: 'leccion-uno',
      palabrasPropias: 4,
      motivo: 'cola-limpia',
      minutosDeclarados: 9,
      minutosReales: 1,
    });
    expect(filas[0]?.palabrasCola).toBeGreaterThan(10);
  });

  it('una lección sin cola cuenta TODO su cuerpo como propio', () => {
    // La rama `corte.indice === null`. Sin este test, un cambio que colapse el
    // ternario a `cuerpo.slice(0, corte.indice)` daría `slice(0, null)` → '' → 0
    // palabras para las 9 lecciones sin cola del corpus, y la suite pasaría igual.
    const raiz = corpusDePrueba('Cuatro palabras propias acá.');
    const { filas } = relevarCorpus(raiz);
    expect(filas[0]).toMatchObject({ motivo: 'sin-cola', palabrasPropias: 4, palabrasCola: 0 });
  });

  it('no reporta anomalías cuando el índice y el disco se corresponden', () => {
    expect(relevarCorpus(corpusDePrueba()).anomalias).toEqual([]);
  });

  it('reporta la lección declarada en course.json cuyo archivo no existe', () => {
    const raiz = corpusDePrueba(undefined, { declararDeMas: 'leccion-fantasma' });
    expect(relevarCorpus(raiz).anomalias).toEqual([
      { curso: 'curso-uno', leccion: 'leccion-fantasma', clase: 'declarada-sin-archivo' },
    ]);
  });

  it('reporta el archivo que está en el disco y no en course.json', () => {
    const raiz = corpusDePrueba(undefined, { archivoDeMas: 'leccion-huerfana' });
    expect(relevarCorpus(raiz).anomalias).toEqual([
      { curso: 'curso-uno', leccion: 'leccion-huerfana', clase: 'archivo-sin-declarar' },
    ]);
  });
});
