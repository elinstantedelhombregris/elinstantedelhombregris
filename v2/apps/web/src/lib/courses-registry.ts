/**
 * Registry de entrenamientos — build-time, con globs MIXTOS.
 *
 * Los 31 `course.json` (336 KB) van eager: el catálogo los necesita en la
 * primera pintura. Los 329 cuerpos (2,0 MB) y los 31 `quiz.json` van
 * PEREZOSOS: se baja una lección cuando se abre una lección. Es la primera
 * vez que el contenido del proyecto no entra en un glob eager, y la
 * respuesta es pereza, no backend (spec 3.5, Decisión 4).
 */
import {
  courseJsonSchema,
  derivarSlugDeLeccion,
  normalizarPregunta,
  quizJsonSchema,
  type PreguntaNormalizada,
} from '@v2/shared';

import { stripFrontmatter } from './markdown';

export interface LeccionEntry {
  slug: string;
  titulo: string;
  minutos: number;
  /** orderIndex del course.json — puede arrancar en 0. La URL usa la posición, no esto. */
  orden: number;
}

export interface CursoEntry {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  orderIndex: number;
  isFeatured: boolean;
  lecciones: readonly LeccionEntry[];
}

/** Prefijo relativo compartido por las tres claves de glob — no es, en sí, un glob. */
const RAIZ = '../../../../content/courses';

// Vite exige un literal estático en `import.meta.glob`: no se puede interpolar
// `RAIZ` acá adentro. La constante de arriba solo arma las claves de búsqueda
// de `cuerpos`/`practicas`, que si son un literal con el mismo prefijo.
const indices = import.meta.glob<unknown>('../../../../content/courses/*/course.json', {
  eager: true,
  import: 'default',
});
const cuerpos = import.meta.glob<string>('../../../../content/courses/*/*.mdx', {
  query: '?raw',
  import: 'default',
});
const practicas = import.meta.glob<string>('../../../../content/courses/*/quiz.json', {
  query: '?raw',
  import: 'default',
});

function construirRegistry(): CursoEntry[] {
  const entradas: CursoEntry[] = [];
  for (const crudo of Object.values(indices)) {
    const parsed = courseJsonSchema.safeParse(crudo);
    if (!parsed.success) continue; // build-content es el que grita; acá no se rompe la página
    const c = parsed.data;
    entradas.push({
      slug: c.slug,
      title: c.title,
      description: c.description,
      excerpt: c.excerpt,
      category: c.category,
      level: c.level,
      duration: c.duration,
      orderIndex: c.orderIndex,
      isFeatured: c.isFeatured,
      lecciones: [...c.lessons]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((l) => ({
          slug: derivarSlugDeLeccion(l.key),
          titulo: l.title,
          minutos: l.duration,
          orden: l.orderIndex,
        })),
    });
  }
  return entradas.sort((a, b) => a.orderIndex - b.orderIndex);
}

export const CURSOS: readonly CursoEntry[] = construirRegistry();
export const CURSO_COUNT = CURSOS.length;
export const LECCION_COUNT = CURSOS.reduce((n, c) => n + c.lecciones.length, 0);

export function findCursoBySlug(slug: string): CursoEntry | undefined {
  return CURSOS.find((c) => c.slug === slug);
}

/** Cuerpo MDX de una lección, sin frontmatter. `null` si la clave no existe. */
export async function cargarLeccion(cursoSlug: string, leccionSlug: string): Promise<string | null> {
  const cargar = cuerpos[`${RAIZ}/${cursoSlug}/${leccionSlug}.mdx`];
  if (!cargar) return null;
  return stripFrontmatter(await cargar());
}

export interface PracticaEntry {
  descripcion: string;
  preguntas: readonly PreguntaNormalizada[];
}

/** Quiz normalizado de un curso. `null` si no existe o no valida. */
export async function cargarPractica(cursoSlug: string): Promise<PracticaEntry | null> {
  const cargar = practicas[`${RAIZ}/${cursoSlug}/quiz.json`];
  if (!cargar) return null;
  const parsed = quizJsonSchema.safeParse(JSON.parse(await cargar()) as unknown);
  if (!parsed.success) return null;
  const preguntas = parsed.data.questions
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(normalizarPregunta)
    .filter((p): p is PreguntaNormalizada => p !== null);
  return { descripcion: parsed.data.description, preguntas };
}
