#!/usr/bin/env tsx
/**
 * Build-time content validator + (eventually) typed registry generator.
 *
 * Reads every .mdx file under content/{blog,ensayos,courses,planes},
 * validates its frontmatter against the corresponding Zod schema, and
 * prints a summary. Halts the build with non-zero exit on any error.
 *
 * The next iteration emits a generated TypeScript file under
 * packages/shared/src/content/registry.generated.ts so the web app
 * can list essays/posts without a filesystem read at runtime.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import {
  blogFrontmatterSchema,
  courseJsonSchema,
  cronicaFrontmatterSchema,
  derivarSlugDeLeccion,
  ensayoFrontmatterSchema,
  lessonFrontmatterSchema,
  normalizarPregunta,
  planFrontmatterSchema,
  quizJsonSchema,
} from '@v2/shared/content';
import { loadContentDir } from '@v2/shared/content/loader';
import type { LoaderError } from '@v2/shared/content/loader';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

interface PipelineSummary {
  domain: string;
  ok: number;
  errors: LoaderError[];
  /** Solo lo trae `courses` — dos conteos que ningún otro dominio tiene. */
  extra?: string;
}

/** Rutas locales `](/algo)` referenciadas por un cuerpo MDX. */
function extraerRutasLocales(cuerpo: string): string[] {
  const rutas: string[] = [];
  const regex = /]\((\/[^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(cuerpo)) !== null) {
    const ruta = m[1];
    if (ruta) rutas.push(ruta);
  }
  return rutas;
}

async function existeAsset(root: string, rutaAbsoluta: string): Promise<boolean> {
  try {
    await stat(`${root}apps/web/public${rutaAbsoluta}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Dominio `courses`: recorre `content/courses/*​/`, valida `course.json` y
 * `quiz.json` contra sus schemas, valida las lecciones con
 * `lessonFrontmatterSchema`, y cruza los tres contra la única regla que
 * puede desalinearlos (spec 3.5, «El validador»).
 */
async function loadCourses(root: string): Promise<PipelineSummary & { lessons: number; questions: number }> {
  const dir = `${root}content/courses`;
  const errors: LoaderError[] = [];
  let ok = 0;
  let lessons = 0;
  let questions = 0;
  const slugsVistos = new Set<string>();

  const entries = (await readdir(dir, { withFileTypes: true })).filter((e) => e.isDirectory());

  for (const entry of entries) {
    const cursoDir = `${dir}/${entry.name}`;
    const courseFile = `${entry.name}/course.json`;

    let cursoCrudo: unknown;
    try {
      cursoCrudo = JSON.parse(await readFile(`${cursoDir}/course.json`, 'utf8'));
    } catch (err) {
      errors.push({
        file: courseFile,
        message: `No se pudo leer course.json: ${err instanceof Error ? err.message : String(err)}`,
      });
      continue;
    }

    const curso = courseJsonSchema.safeParse(cursoCrudo);
    if (!curso.success) {
      errors.push({
        file: courseFile,
        message: 'course.json no valida contra courseJsonSchema',
        issues: curso.error.issues.map((i) => ({ path: i.path.join('.') || '(root)', message: i.message })),
      });
      continue;
    }
    const c = curso.data;

    // 1. el directorio se llama como el slug; slug no repetido.
    if (c.slug !== entry.name) {
      errors.push({ file: courseFile, message: `slug "${c.slug}" no coincide con el directorio "${entry.name}"` });
    }
    if (slugsVistos.has(c.slug)) {
      errors.push({ file: courseFile, message: `slug de curso repetido: "${c.slug}"` });
    }
    slugsVistos.add(c.slug);

    // 2. suma de lessons[].duration === duration del curso.
    const sumaDuracion = c.lessons.reduce((n, l) => n + l.duration, 0);
    if (sumaDuracion !== c.duration) {
      errors.push({
        file: courseFile,
        message: `duration del curso (${String(c.duration)}) no coincide con la suma de lessons[].duration (${String(sumaDuracion)})`,
      });
    }

    // Cuerpos .mdx del directorio (loadContentDir ya filtra .mdx/.md).
    const cuerpos = await loadContentDir(cursoDir, lessonFrontmatterSchema);
    for (const err of cuerpos.errors) {
      errors.push({ file: `${entry.name}/${err.file}`, message: err.message, issues: err.issues });
    }
    const archivosPresentes = new Set(cuerpos.ok.map((p) => p.file.replace(/\.mdx?$/, '')));

    // 3. cada lessons[].key → derivarSlugDeLeccion → existe <slug>.mdx.
    // 5b. sin orderIndex de lección repetidos.
    const slugsEsperados = new Set<string>();
    const orderIndexesVistos = new Set<number>();
    for (const l of c.lessons) {
      const slugLeccion = derivarSlugDeLeccion(l.key);
      slugsEsperados.add(slugLeccion);
      if (!archivosPresentes.has(slugLeccion)) {
        errors.push({
          file: courseFile,
          message: `lección "${l.key}" (slug "${slugLeccion}") no tiene .mdx en el directorio`,
        });
      }
      if (orderIndexesVistos.has(l.orderIndex)) {
        errors.push({ file: courseFile, message: `orderIndex de lección repetido: ${String(l.orderIndex)}` });
      }
      orderIndexesVistos.add(l.orderIndex);
    }

    // 4. cada .mdx del directorio está listado en lessons[].
    for (const slugArchivo of archivosPresentes) {
      if (!slugsEsperados.has(slugArchivo)) {
        errors.push({ file: courseFile, message: `.mdx "${slugArchivo}" no está listado en lessons[] de course.json` });
      }
    }

    // 5a. courseSlug del frontmatter === slug del curso.
    // 7. todo `](/algo)` del cuerpo existe en apps/web/public/.
    for (const pieza of cuerpos.ok) {
      if (pieza.frontmatter.courseSlug !== c.slug) {
        errors.push({
          file: `${entry.name}/${pieza.file}`,
          message: `courseSlug del frontmatter ("${pieza.frontmatter.courseSlug}") no coincide con el slug del curso ("${c.slug}")`,
        });
      }
      for (const ruta of extraerRutasLocales(pieza.body)) {
        // eslint-disable-next-line no-await-in-loop -- validación secuencial, volumen chico (329 cuerpos).
        if (!(await existeAsset(root, ruta))) {
          errors.push({ file: `${entry.name}/${pieza.file}`, message: `referencia rota: "${ruta}" no existe en apps/web/public/` });
        }
      }
    }
    lessons += cuerpos.ok.length;

    // 6. quiz.json valida y normalizarPregunta() resuelve TODAS las preguntas.
    const quizFile = `${entry.name}/${c.quizFile}`;
    try {
      const quizCrudo: unknown = JSON.parse(await readFile(`${cursoDir}/${c.quizFile}`, 'utf8'));
      const quiz = quizJsonSchema.safeParse(quizCrudo);
      if (!quiz.success) {
        errors.push({
          file: quizFile,
          message: 'quiz.json no valida contra quizJsonSchema',
          issues: quiz.error.issues.map((i) => ({ path: i.path.join('.') || '(root)', message: i.message })),
        });
      } else {
        for (const pregunta of quiz.data.questions) {
          if (normalizarPregunta(pregunta) === null) {
            errors.push({
              file: quizFile,
              message: `normalizarPregunta no resuelve la pregunta con orderIndex ${String(pregunta.orderIndex)}`,
            });
          }
        }
        questions += quiz.data.questions.length;
      }
    } catch (err) {
      errors.push({
        file: quizFile,
        message: `No se pudo leer quiz.json: ${err instanceof Error ? err.message : String(err)}`,
      });
    }

    ok += 1;
  }

  return {
    domain: 'courses',
    ok,
    errors,
    lessons,
    questions,
    extra: `lessons=${String(lessons)} questions=${String(questions)}`,
  };
}

async function run(): Promise<PipelineSummary[]> {
  const summaries: PipelineSummary[] = [];

  const blog = await loadContentDir(`${ROOT}content/blog`, blogFrontmatterSchema);
  summaries.push({ domain: 'blog', ok: blog.ok.length, errors: blog.errors });

  const ensayos = await loadContentDir(`${ROOT}content/ensayos`, ensayoFrontmatterSchema);
  summaries.push({ domain: 'ensayos', ok: ensayos.ok.length, errors: ensayos.errors });

  const planes = await loadContentDir(`${ROOT}content/planes`, planFrontmatterSchema);
  summaries.push({ domain: 'planes', ok: planes.ok.length, errors: planes.errors });

  const cronica = await loadContentDir(`${ROOT}content/cronica`, cronicaFrontmatterSchema);
  summaries.push({ domain: 'cronica', ok: cronica.ok.length, errors: cronica.errors });

  const courses = await loadCourses(ROOT);
  summaries.push(courses);

  return summaries;
}

async function main(): Promise<void> {
  const result = await run();

  let hadErrors = false;
  for (const summary of result) {
    const extra = summary.extra ? ` ${summary.extra}` : '';
    process.stdout.write(
      `[${summary.domain}] ok=${String(summary.ok)}${extra} errors=${String(summary.errors.length)}\n`,
    );
    for (const err of summary.errors) {
      hadErrors = true;
      process.stderr.write(`  ${summary.domain}/${err.file}: ${err.message}\n`);
      if (err.issues) {
        for (const i of err.issues) {
          process.stderr.write(`    - ${i.path}: ${i.message}\n`);
        }
      }
    }
  }

  if (hadErrors) {
    process.exit(1);
  }
}

main().catch((err) => {
  process.stderr.write(`build-content failed: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
