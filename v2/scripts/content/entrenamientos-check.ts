/** Guardia permanente del corpus de entrenamientos. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contarPalabrasRenderizables,
  derivarSlugDeLeccion,
  detectarCola,
  detectarTuteo,
  jaccard,
  lessonFrontmatterSchema,
  minutosDeLectura,
  parsearCierre,
  trigramas,
  UMBRAL_GEMELOS,
  validarCierre,
} from '@v2/shared';
import { loadContentDir } from '@v2/shared/content/loader';

const PISO_PALABRAS = 600;
const CAMPOS_MUERTOS =
  /"(?:seoTitle|seoDescription|searchSummary|ogImageUrl|thumbnailUrl|videoUrl|legacyCourseId|legacyLessonId|contentFile|passingScore|timeLimit|maxAttempts)"\s*:/;
const PREGUNTA_DE_RECONOCIMIENTO =
  /¿Cuál es (?:el foco principal|la idea central) de la lección|La lección se (?:centra|concentra) en/iu;

function slugsValidos(raiz: string): Set<string> {
  const set = new Set<string>();
  for (const dominio of ['planes', 'ensayos', 'cronica'] as const) {
    const dir = resolve(raiz, 'content', dominio);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx')))
      set.add(basename(f, '.mdx'));
  }
  for (const c of readdirSync(resolve(raiz, 'content/courses'), { withFileTypes: true })) {
    if (c.isDirectory()) set.add(c.name);
  }
  return set;
}

export async function revisarCorpus(raiz: string): Promise<string[]> {
  const errores: string[] = [];
  const dir = resolve(raiz, 'content/courses');
  const validos = slugsValidos(raiz);
  const firmas: { id: string; firma: Set<string> }[] = [];

  for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const cursoDir = join(dir, curso.name);
    const rutaIndice = join(cursoDir, 'course.json');
    const indiceRaw = readFileSync(rutaIndice, 'utf-8');
    if (CAMPOS_MUERTOS.test(indiceRaw))
      errores.push(`${curso.name}: course.json conserva campos sin lector`);
    const indice = JSON.parse(indiceRaw) as {
      duration: number;
      isPublished?: boolean;
      promesa?: string[];
      noCubre?: string[];
      paraQuien?: string;
      productoFinal?: string;
      coverImage?: string;
      fuentesBase?: { url: string; titulo: string; consultada: string }[];
      lessons: { key: string; duration: number }[];
    };
    const quizRaw = readFileSync(join(cursoDir, 'quiz.json'), 'utf-8');
    if (CAMPOS_MUERTOS.test(quizRaw))
      errores.push(`${curso.name}: quiz.json conserva campos sin lector`);
    if (PREGUNTA_DE_RECONOCIMIENTO.test(quizRaw))
      errores.push(`${curso.name}: quiz conserva una pregunta que sólo repite el tema`);
    const declarados = new Map(
      indice.lessons.map((l) => [derivarSlugDeLeccion(l.key), l.duration] as const),
    );
    const { ok, errors } = await loadContentDir(cursoDir, lessonFrontmatterSchema);
    for (const e of errors) {
      const detalle = (e.issues ?? []).map((i) => `${i.path}: ${i.message}`).join('; ');
      errores.push(`${curso.name}/${e.file}: ${e.message} ${detalle}`.trim());
    }

    let cursoTerminado = ok.length > 0;
    const vistos = new Set<string>();
    for (const { file, frontmatter, body: cuerpo } of ok) {
      const slug = basename(file, '.mdx');
      const id = `${curso.name}/${slug}`;
      vistos.add(slug);
      if (/^estimatedMinutes:/m.test(readFileSync(join(cursoDir, file), 'utf-8')))
        errores.push(`${id}: estimatedMinutes sigue en el frontmatter`);
      const declarado = declarados.get(slug);
      if (declarado === undefined) {
        errores.push(`${id}: falta en course.json`);
        continue;
      }
      if (detectarCola(cuerpo).motivo !== 'sin-cola')
        errores.push(`${id}: reapareció la cola generada`);
      const palabras = contarPalabrasRenderizables(cuerpo);
      const minutos = minutosDeLectura(palabras);
      if (declarado !== minutos)
        errores.push(`${id}: minutaje ${String(declarado)} ≠ ${String(minutos)}`);

      // «Tú debes» es el lema literal del Gran Dragón de Nietzsche en dos
      // lecciones. Las citas se preservan; la voz editorial sí se controla.
      const vozSinCitaNietzsche = cuerpo
        .replace(/["“][^"”\n]*\b(?:tú )?debes\b[^"”\n]*["”]/giu, '')
        .replace(/'[^'\n]*\b(?:tú )?debes\b[^'\n]*'/giu, '')
        .replace(/\btú debes\b/giu, '');
      for (const h of detectarTuteo(vozSinCitaNietzsche).filter((x) => x.lista === 'dura'))
        errores.push(`${id}: tuteo «${h.forma}»`);
      if (/^#{4,6} /m.test(cuerpo)) errores.push(`${id}: encabezado por debajo de h3`);
      if (/<table/i.test(cuerpo)) errores.push(`${id}: tabla HTML cruda`);
      if (/\p{Extended_Pictographic}/u.test(cuerpo)) errores.push(`${id}: emoji en el cuerpo`);

      const primera = cuerpo.trim().split('\n')[0] ?? '';
      if (
        frontmatter.summary !== undefined &&
        jaccard(trigramas(primera), trigramas(frontmatter.summary)) > 0.7
      )
        errores.push(`${id}: abre repitiendo el summary`);
      const tituloEscapado = frontmatter.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`^#{1,3} +${tituloEscapado} *$`, 'm').test(cuerpo))
        errores.push(`${id}: encabezado idéntico al título`);

      const cierre = parsearCierre(cuerpo);
      const estadoCierre = frontmatter.cierre ?? 'pendiente';
      const fuentes = frontmatter.fuentes ?? [];
      const planes = frontmatter.planes ?? [];
      const ensayos = frontmatter.ensayos ?? [];
      for (const problema of validarCierre(cierre, estadoCierre, {
        slugsValidos: validos,
        tieneFuentes: fuentes.length > 0,
        ...(frontmatter.summary === undefined ? {} : { summary: frontmatter.summary }),
      }))
        errores.push(`${id}: ${problema}`);
      for (const puente of [...planes, ...ensayos]) {
        if (!validos.has(puente)) errores.push(`${id}: referencia inexistente «${puente}»`);
      }
      if (cierre.puente !== null)
        firmas.push({
          id,
          firma: trigramas([cierre.caso, cierre.palanca, cierre.puente].filter(Boolean).join(' ')),
        });

      if (estadoCierre === 'pendiente') cursoTerminado = false;
      else if (palabras < PISO_PALABRAS)
        errores.push(`${id}: ${String(palabras)} palabras; piso ${String(PISO_PALABRAS)}`);
      if (
        frontmatter.revisarAntesDe !== undefined &&
        frontmatter.revisarAntesDe < new Date().toISOString().slice(0, 10)
      ) {
        process.stderr.write(
          `aviso — ${id}: venció revisarAntesDe (${frontmatter.revisarAntesDe})\n`,
        );
      }
    }

    for (const slug of declarados.keys())
      if (!vistos.has(slug)) errores.push(`${curso.name}/${slug}: declarado sin archivo`);
    const suma = indice.lessons.reduce((n, l) => n + l.duration, 0);
    if (indice.duration !== suma)
      errores.push(`${curso.name}: duration ${String(indice.duration)} ≠ suma ${String(suma)}`);
    if (indice.isPublished) {
      if ((indice.promesa?.length ?? 0) < 3)
        errores.push(`${curso.name}: publicado sin tres resultados observables`);
      if ((indice.noCubre?.length ?? 0) < 2)
        errores.push(`${curso.name}: publicado sin dos límites honestos`);
      if (!indice.paraQuien?.trim()) errores.push(`${curso.name}: publicado sin público explícito`);
      if (!indice.productoFinal?.trim())
        errores.push(`${curso.name}: publicado sin producto final`);
      if (!indice.coverImage?.startsWith('/course-art/'))
        errores.push(`${curso.name}: publicado sin portada editorial local`);
      if ((indice.fuentesBase?.length ?? 0) < 2)
        errores.push(`${curso.name}: publicado sin dos fuentes base`);
    }
    if (cursoTerminado && (indice.promesa === undefined || indice.noCubre === undefined))
      errores.push(`${curso.name}: terminado sin promesa/noCubre`);
  }

  for (let i = 0; i < firmas.length; i += 1) {
    for (let j = i + 1; j < firmas.length; j += 1) {
      const a = firmas[i];
      const b = firmas[j];
      if (a === undefined || b === undefined) continue;
      const similitud = jaccard(a.firma, b.firma);
      if (similitud > UMBRAL_GEMELOS)
        errores.push(`cierres gemelos (${similitud.toFixed(2)}): ${a.id} y ${b.id}`);
    }
  }
  return errores;
}

if (process.argv[1]?.endsWith('entrenamientos-check.ts')) {
  void revisarCorpus(resolve(dirname(fileURLToPath(import.meta.url)), '../..')).then((errores) => {
    if (errores.length > 0) {
      process.stderr.write(
        `${errores.join('\n')}\n\n${String(errores.length)} problemas en el corpus\n`,
      );
      process.exitCode = 1;
      return;
    }
    process.stdout.write('corpus de entrenamientos: en regla\n');
  });
}
