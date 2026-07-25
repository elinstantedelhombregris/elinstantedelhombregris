/**
 * Schemas de los dos JSON de un entrenamiento + el normalizador de preguntas.
 *
 * `content/courses/<slug>/course.json` es el índice del curso (metadata +
 * lista de lecciones) y `quiz.json` su práctica. Los cuerpos son MDX y los
 * valida `lessonFrontmatterSchema`.
 *
 * Los campos que v1 dejó y el sitio no mira (seoTitle, ogImageUrl,
 * legacyCourseId, rekeys…) NO se declaran: Zod los descarta, y así el
 * schema documenta exactamente qué usa la página.
 */
import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugSchema = z.string().min(1).max(100).regex(slugRegex, 'Slugs must be kebab-case alphanumeric.');

export const courseLessonJsonSchema = z.object({
  /** Clave v1 con prefijo numérico: «02-agere-…». El slug se deriva. */
  key: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  duration: z.number().int().positive(),
  /** Un curso arranca en 0 — de ahí el nonnegative (verificado 2026-07-24). */
  orderIndex: z.number().int().nonnegative(),
  contentFile: z.string().min(1),
});
export type CourseLessonJson = z.infer<typeof courseLessonJsonSchema>;

export const courseJsonSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.string().min(1).max(60),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  /** Minutos totales; coincide con la suma de las lecciones en los 31. */
  duration: z.number().int().positive(),
  orderIndex: z.number().int().positive(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  requiresAuth: z.boolean(),
  quizFile: z.string().min(1),
  lessons: z.array(courseLessonJsonSchema).min(1),
});
export type CourseJson = z.infer<typeof courseJsonSchema>;

export const quizQuestionJsonSchema = z.object({
  question: z.string().min(1),
  type: z.enum(['multiple_choice', 'true_false']),
  /** MC trae 4; TF trae null o ['Verdadero','Falso'] (6 casos). */
  options: z.array(z.string().min(1)).nullable().optional(),
  /** Cuatro formas reales: índice, booleano, etiqueta de opción, 'Verdadero'/'Falso'. */
  correctAnswer: z.union([z.number().int().nonnegative(), z.boolean(), z.string().min(1)]),
  explanation: z.string().min(1),
  points: z.number().int().positive(),
  orderIndex: z.number().int().positive(),
});
export type QuizQuestionJson = z.infer<typeof quizQuestionJsonSchema>;

export const quizJsonSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  questions: z.array(quizQuestionJsonSchema).min(1),
});
export type QuizJson = z.infer<typeof quizJsonSchema>;

export interface PreguntaNormalizada {
  enunciado: string;
  opciones: string[];
  /** Índice de la opción correcta dentro de `opciones`. */
  correcta: number;
  explicacion: string;
}

const VERDADERO = 'Verdadero';
const FALSO = 'Falso';

/** Comillas envolventes — rectas o tipográficas — al inicio/fin de un string. */
const COMILLAS_INICIO = /^["“”]+/;
const COMILLAS_FIN = /["“”]+$/;

/**
 * Quita comillas que envuelven el string entero. Algunas opciones v1 quedaron
 * escritas como «"texto"» (comilla literal adentro del JSON) mientras
 * `correctAnswer` repite el mismo texto sin ellas — un solo caso real hoy
 * (`content/courses/liderazgo-distribuido/quiz.json`, orderIndex 4), pero es
 * una forma del contenido, no algo que se cure editando el archivo.
 */
function sinComillasEnvolventes(s: string): string {
  return s.replace(COMILLAS_INICIO, '').replace(COMILLAS_FIN, '');
}

/**
 * Traduce las cuatro formas de `correctAnswer` a una sola. Devuelve `null`
 * cuando no resuelve — y `null` es un error de build (build-content), nunca
 * un estado de UI.
 */
export function normalizarPregunta(q: QuizQuestionJson): PreguntaNormalizada | null {
  const base = { enunciado: q.question, explicacion: q.explanation };
  if (q.type === 'true_false') {
    const opciones = [VERDADERO, FALSO];
    if (typeof q.correctAnswer === 'boolean') {
      return { ...base, opciones, correcta: q.correctAnswer ? 0 : 1 };
    }
    if (q.correctAnswer === VERDADERO) return { ...base, opciones, correcta: 0 };
    if (q.correctAnswer === FALSO) return { ...base, opciones, correcta: 1 };
    return null;
  }
  const opciones = q.options ?? [];
  if (opciones.length < 2) return null;
  if (typeof q.correctAnswer === 'number') {
    return q.correctAnswer < opciones.length ? { ...base, opciones, correcta: q.correctAnswer } : null;
  }
  if (typeof q.correctAnswer === 'string') {
    const iExacto = opciones.indexOf(q.correctAnswer);
    if (iExacto !== -1) return { ...base, opciones, correcta: iExacto };
    // Fallback tolerante: compara ignorando comillas envolventes en cualquiera
    // de los dos lados. `opciones` nunca se reescribe — el contenido es verbatim.
    const correctaSinComillas = sinComillasEnvolventes(q.correctAnswer);
    const iTolerante = opciones.findIndex((o) => sinComillasEnvolventes(o) === correctaSinComillas);
    return iTolerante === -1 ? null : { ...base, opciones, correcta: iTolerante };
  }
  return null;
}

/** Slug de lección desde la key v1 — misma regla con la que el migrador escribió los archivos. */
export function derivarSlugDeLeccion(key: string): string {
  return key.replace(/^\d+-/, '');
}
