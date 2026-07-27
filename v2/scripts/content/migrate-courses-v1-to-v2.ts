/**
 * One-shot: migrate v1 courses (SocialJusticeHub/content/courses/<slug>/) into v2 shape.
 *
 * For each v1 course:
 *   - Reads course.json (course metadata + lesson metadata)
 *   - For each lesson, reads its raw .md body and writes
 *     v2/content/courses/<courseSlug>/<lessonSlug>.mdx with frontmatter
 *     matching lessonFrontmatterSchema.
 *   - Preserves course.json + quiz.json at v2/content/courses/<courseSlug>/
 *     so course-level metadata + quiz questions survive for later DB seed.
 *
 * Idempotent: skips files that already exist. Pass --force to overwrite.
 *
 * Run: pnpm tsx scripts/content/migrate-courses-v1-to-v2.ts
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const COURSES_SRC = resolve(REPO_ROOT, 'SocialJusticeHub/content/courses');
const COURSES_OUT = resolve(V2_ROOT, 'content/courses');

const FORCE = process.argv.includes('--force');

interface V1Lesson {
  key: string;
  title: string;
  description?: string;
  duration?: number;
  orderIndex: number;
  contentFile: string;
}

interface V1Course {
  slug: string;
  title: string;
  description?: string;
  isPublished?: boolean;
  lessons: V1Lesson[];
}

interface Stats {
  coursesProcessed: number;
  lessonsWritten: number;
  lessonsSkipped: number;
  metaFilesCopied: number;
  metaFilesSkipped: number;
  errors: string[];
}

function lessonSlug(key: string): string {
  return key.replace(/^[0-9]+-/, '');
}

function yamlString(s: string): string {
  // Wrap in single quotes when value contains YAML-special chars, leading/trailing
  // whitespace, or is empty; double single-quotes to escape.
  if (s === '' || /[:#&*!|>%@`{}\[\],]|^\s|\s$|^['"-]/.test(s)) {
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

function buildLessonMdx(courseSlug: string, lesson: V1Lesson, body: string, draft: boolean): string {
  const slug = lessonSlug(lesson.key);
  const lines: string[] = ['---'];
  lines.push(`slug: ${slug}`);
  lines.push(`courseSlug: ${courseSlug}`);
  lines.push(`title: ${yamlString(lesson.title)}`);
  if (lesson.description && lesson.description.trim() !== '') {
    // lessonFrontmatterSchema caps summary at 500; v1 max is 213 — safe.
    lines.push(`summary: ${yamlString(lesson.description.trim())}`);
  }
  lines.push(`orderIndex: ${String(lesson.orderIndex)}`);
  if (typeof lesson.duration === 'number' && lesson.duration > 0) {
    lines.push(`estimatedMinutes: ${String(lesson.duration)}`);
  }
  lines.push(`draft: ${draft ? 'true' : 'false'}`);
  lines.push('---');
  lines.push('');
  lines.push(body.replace(/^\s+/, ''));
  return lines.join('\n');
}

function listCourseDirs(srcRoot: string): string[] {
  return readdirSync(srcRoot)
    .filter((name) => {
      const p = resolve(srcRoot, name);
      return statSync(p).isDirectory();
    })
    .sort();
}

function migrateCourse(courseDir: string, stats: Stats): void {
  const srcDir = resolve(COURSES_SRC, courseDir);
  const courseJsonPath = resolve(srcDir, 'course.json');
  if (!existsSync(courseJsonPath)) {
    stats.errors.push(`${courseDir}: missing course.json`);
    return;
  }
  const course = JSON.parse(readFileSync(courseJsonPath, 'utf-8')) as V1Course;
  const courseSlug = course.slug || courseDir;
  const draft = course.isPublished === false;

  const outDir = resolve(COURSES_OUT, courseSlug);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // 1) Preserve course.json + quiz.json verbatim for downstream DB seed.
  for (const metaFile of ['course.json', 'quiz.json'] as const) {
    const srcFile = resolve(srcDir, metaFile);
    if (!existsSync(srcFile)) continue;
    const dstFile = resolve(outDir, metaFile);
    if (existsSync(dstFile) && !FORCE) {
      stats.metaFilesSkipped++;
      continue;
    }
    writeFileSync(dstFile, readFileSync(srcFile));
    stats.metaFilesCopied++;
  }

  // 2) Write each lesson as MDX.
  for (const lesson of course.lessons) {
    const bodyPath = resolve(srcDir, lesson.contentFile);
    if (!existsSync(bodyPath)) {
      stats.errors.push(`${courseSlug}/${lesson.key}: contentFile missing (${lesson.contentFile})`);
      continue;
    }
    const body = readFileSync(bodyPath, 'utf-8');
    const slug = lessonSlug(lesson.key);
    const outFile = resolve(outDir, `${slug}.mdx`);
    if (existsSync(outFile) && !FORCE) {
      stats.lessonsSkipped++;
      continue;
    }
    const mdx = buildLessonMdx(courseSlug, lesson, body, draft);
    writeFileSync(outFile, mdx, 'utf-8');
    stats.lessonsWritten++;
  }

  stats.coursesProcessed++;
}

function main(): void {
  if (!existsSync(COURSES_SRC)) {
    process.stderr.write(`v1 courses source not found at ${COURSES_SRC}\n`);
    process.exit(1);
  }
  if (!existsSync(COURSES_OUT)) mkdirSync(COURSES_OUT, { recursive: true });

  const stats: Stats = {
    coursesProcessed: 0,
    lessonsWritten: 0,
    lessonsSkipped: 0,
    metaFilesCopied: 0,
    metaFilesSkipped: 0,
    errors: [],
  };

  for (const courseDir of listCourseDirs(COURSES_SRC)) {
    migrateCourse(courseDir, stats);
  }

  process.stdout.write(`courses=${String(stats.coursesProcessed)}\n`);
  process.stdout.write(`lessons written=${String(stats.lessonsWritten)} skipped=${String(stats.lessonsSkipped)}\n`);
  process.stdout.write(`meta files copied=${String(stats.metaFilesCopied)} skipped=${String(stats.metaFilesSkipped)}\n`);
  if (stats.errors.length > 0) {
    process.stderr.write(`errors=${String(stats.errors.length)}\n`);
    for (const err of stats.errors) process.stderr.write(`  - ${err}\n`);
    process.exit(1);
  }
}

main();
