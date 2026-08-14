/** Elimina campos heredados sin lector y corrige voz visible en los JSON. */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MUERTOS_CURSO = [
  'seoTitle',
  'seoDescription',
  'searchSummary',
  'ogImageUrl',
  'thumbnailUrl',
  'indexable',
  'lastReviewedAt',
  'schemaVersion',
  'authorId',
  'legacyCourseId',
  'videoUrl',
  'rekeys',
] as const;
const MUERTOS_LECCION = [
  'seoTitle',
  'seoDescription',
  'searchSummary',
  'indexable',
  'videoUrl',
  'documentUrl',
  'legacyLessonId',
  'contentFile',
  'type',
  'isRequired',
] as const;
const MUERTOS_QUIZ = ['passingScore', 'timeLimit', 'maxAttempts', 'legacyQuizId'] as const;
const MUERTOS_PREGUNTA = ['legacyQuestionId'] as const;

const reemplazos: [RegExp, string][] = [
  [/\bDescubre\b/g, 'Descubrí'],
  [/\bAprende\b/g, 'Aprendé'],
  [/\bEntiende\b/g, 'Entendé'],
  [/\bExplora\b/g, 'Explorá'],
  [/\bConoce\b/g, 'Conocé'],
  [/\bDomina\b/g, 'Dominá'],
  [/\bDiseña\b/g, 'Diseñá'],
  [/\bTransforma\b/g, 'Transformá'],
  [/\bConstruye\b/g, 'Construí'],
  [/\bNavega\b/g, 'Navegá'],
  [/\bCrea\b/g, 'Creá'],
  [/\bConvierte\b/g, 'Convertí'],
  [/\bAnaliza\b/g, 'Analizá'],
  [/\bComprende\b/g, 'Comprendé'],
  [/\bFortalece\b/g, 'Fortalecé'],
  [/\bIdentifica\b/g, 'Identificá'],
  [/\bDefine\b/g, 'Definí'],
  [/\bDesarrolla\b/g, 'Desarrollá'],
  [/\bProfundiza\b/g, 'Profundizá'],
  [/\bPotencia\b/g, 'Potenciá'],
  [/\bLidera\b/g, 'Liderá'],
  [/\bComunica\b/g, 'Comunicá'],
  [/\bOrganiza\b/g, 'Organizá'],
  [/\bEvalúa\b/g, 'Evaluá'],
];

function vozRioplatense(texto: string): string {
  return reemplazos.reduce((t, [re, reemplazo]) => t.replace(re, reemplazo), texto);
}

const limpiar = (objeto: Record<string, unknown>, claves: readonly string[]): void => {
  // JSON.stringify omite `undefined`; evitamos `delete` dinámico y el archivo
  // resultante sigue sin contener ninguna de estas claves heredadas.
  for (const clave of claves) objeto[clave] = undefined;
};

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = resolve(raiz, 'content/courses');
let cursos = 0;

for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const cursoDir = join(dir, curso.name);
  const rutaCurso = join(cursoDir, 'course.json');
  const indice = JSON.parse(readFileSync(rutaCurso, 'utf-8')) as Record<string, unknown> & {
    lessons: Record<string, unknown>[];
  };
  limpiar(indice, MUERTOS_CURSO);
  for (const leccion of indice.lessons) limpiar(leccion, MUERTOS_LECCION);
  for (const campo of ['title', 'description', 'excerpt'] as const) {
    const valor = indice[campo];
    if (typeof valor === 'string') indice[campo] = vozRioplatense(valor);
  }
  for (const leccion of indice.lessons) {
    for (const campo of ['title', 'description'] as const) {
      const valor = leccion[campo];
      if (typeof valor === 'string') leccion[campo] = vozRioplatense(valor);
    }
  }
  writeFileSync(rutaCurso, `${JSON.stringify(indice, null, 2)}\n`);

  const rutaQuiz = join(cursoDir, 'quiz.json');
  const quiz = JSON.parse(readFileSync(rutaQuiz, 'utf-8')) as Record<string, unknown> & {
    questions: Record<string, unknown>[];
  };
  limpiar(quiz, MUERTOS_QUIZ);
  for (const pregunta of quiz.questions) limpiar(pregunta, MUERTOS_PREGUNTA);
  writeFileSync(rutaQuiz, `${JSON.stringify(quiz, null, 2)}\n`);
  cursos += 1;
}

process.stdout.write(`fuente limpia y voz revisada en ${String(cursos)} cursos\n`);
