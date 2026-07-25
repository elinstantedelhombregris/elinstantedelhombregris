/**
 * Background check: confirm every v1 course/lesson/quiz survived migration.
 *
 * For each v1 course directory:
 *   - v2 has matching <courseSlug>/ directory
 *   - course.json + quiz.json copied byte-equal
 *   - One MDX file per v1 lesson, with the expected frontmatter fields
 *   - frontmatter slug/courseSlug/title/orderIndex/estimatedMinutes match v1
 *   - Lesson body matches v1 contentFile (modulo leading whitespace trim)
 *
 * Self-contained: no workspace imports, no gray-matter; uses a minimal
 * frontmatter parser tailored to what the migration writes. This keeps
 * the verifier runnable as a one-shot from the repo root.
 *
 * Run: ./apps/api/node_modules/.bin/tsx scripts/content/verify-courses-migration.ts
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const COURSES_SRC = resolve(REPO_ROOT, 'SocialJusticeHub/content/courses');
const COURSES_OUT = resolve(V2_ROOT, 'content/courses');

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
  isPublished?: boolean;
  lessons: V1Lesson[];
}

type FrontmatterValue = string | number | boolean;
type Frontmatter = Record<string, FrontmatterValue>;

interface ParsedMdx {
  frontmatter: Frontmatter;
  body: string;
}

const FM_DELIM = /^---\s*$/m;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function lessonSlug(key: string): string {
  return key.replace(/^[0-9]+-/, '');
}

function listDirs(root: string): string[] {
  return readdirSync(root)
    .filter((name) => statSync(resolve(root, name)).isDirectory())
    .sort();
}

function sha(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

function parseFrontmatter(raw: string): ParsedMdx | null {
  if (!raw.startsWith('---')) return null;
  const rest = raw.slice(3);
  const endIdx = rest.search(FM_DELIM);
  if (endIdx < 0) return null;
  const yaml = rest.slice(0, endIdx);
  const body = rest.slice(endIdx).replace(/^---\s*\r?\n?/, '');
  const frontmatter: Frontmatter = {};
  for (const line of yaml.split('\n')) {
    if (line.trim() === '') continue;
    const m = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1]!;
    let value: string = m[2]!.trim();
    if (value === 'true') {
      frontmatter[key] = true;
      continue;
    }
    if (value === 'false') {
      frontmatter[key] = false;
      continue;
    }
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      frontmatter[key] = Number(value);
      continue;
    }
    // Single-quoted scalar with '' escape (what yamlString emits).
    if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) {
      value = value.slice(1, -1).replace(/''/g, "'");
    } else if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }
  return { frontmatter, body };
}

interface Issue {
  course: string;
  detail: string;
}

interface Summary {
  v1Courses: number;
  v2Courses: number;
  v1Lessons: number;
  v2Mdx: number;
  matchedLessons: number;
  issues: Issue[];
}

function validateLessonFrontmatter(fm: Frontmatter): string | null {
  for (const required of ['slug', 'courseSlug', 'title', 'orderIndex'] as const) {
    if (!(required in fm)) return `missing field: ${required}`;
  }
  if (typeof fm.slug !== 'string' || !SLUG_RE.test(fm.slug)) return `slug not kebab-case: ${String(fm.slug)}`;
  if (typeof fm.courseSlug !== 'string' || !SLUG_RE.test(fm.courseSlug))
    return `courseSlug not kebab-case: ${String(fm.courseSlug)}`;
  if (typeof fm.title !== 'string' || fm.title.length === 0) return 'title empty';
  if (typeof fm.orderIndex !== 'number' || !Number.isInteger(fm.orderIndex) || fm.orderIndex < 0)
    return `orderIndex invalid: ${String(fm.orderIndex)}`;
  if ('summary' in fm && typeof fm.summary !== 'string') return 'summary not string';
  if ('estimatedMinutes' in fm) {
    if (typeof fm.estimatedMinutes !== 'number' || !Number.isInteger(fm.estimatedMinutes) || fm.estimatedMinutes <= 0)
      return `estimatedMinutes invalid: ${String(fm.estimatedMinutes)}`;
  }
  if ('draft' in fm && typeof fm.draft !== 'boolean') return 'draft not boolean';
  return null;
}

function verify(): Summary {
  const summary: Summary = {
    v1Courses: 0,
    v2Courses: 0,
    v1Lessons: 0,
    v2Mdx: 0,
    matchedLessons: 0,
    issues: [],
  };

  const v1Dirs = listDirs(COURSES_SRC);
  summary.v1Courses = v1Dirs.length;

  const v2Dirs = existsSync(COURSES_OUT) ? listDirs(COURSES_OUT) : [];
  summary.v2Courses = v2Dirs.length;

  const v2Set = new Set(v2Dirs);
  const v1Set = new Set(v1Dirs);
  for (const d of v1Dirs) if (!v2Set.has(d)) summary.issues.push({ course: d, detail: 'missing from v2' });
  for (const d of v2Dirs) if (!v1Set.has(d)) summary.issues.push({ course: d, detail: 'unexpected v2-only directory' });

  for (const courseDir of v1Dirs) {
    const srcDir = resolve(COURSES_SRC, courseDir);
    const outDir = resolve(COURSES_OUT, courseDir);
    if (!existsSync(outDir)) continue;

    const courseJsonPath = resolve(srcDir, 'course.json');
    const courseJson = JSON.parse(readFileSync(courseJsonPath, 'utf-8')) as V1Course;
    const courseSlug = courseJson.slug || courseDir;
    summary.v1Lessons += courseJson.lessons.length;

    for (const metaFile of ['course.json', 'quiz.json'] as const) {
      const srcFile = resolve(srcDir, metaFile);
      const dstFile = resolve(outDir, metaFile);
      if (!existsSync(srcFile)) continue;
      if (!existsSync(dstFile)) {
        summary.issues.push({ course: courseSlug, detail: `${metaFile} missing in v2` });
        continue;
      }
      if (sha(readFileSync(srcFile)) !== sha(readFileSync(dstFile))) {
        summary.issues.push({ course: courseSlug, detail: `${metaFile} content differs from v1` });
      }
    }

    const mdxFiles = readdirSync(outDir).filter((f) => f.endsWith('.mdx'));
    summary.v2Mdx += mdxFiles.length;
    if (mdxFiles.length !== courseJson.lessons.length) {
      summary.issues.push({
        course: courseSlug,
        detail: `lesson count mismatch: v1=${String(courseJson.lessons.length)} v2=${String(mdxFiles.length)}`,
      });
    }

    for (const lesson of courseJson.lessons) {
      const slug = lessonSlug(lesson.key);
      const outFile = resolve(outDir, `${slug}.mdx`);
      if (!existsSync(outFile)) {
        summary.issues.push({ course: courseSlug, detail: `lesson missing: ${slug}` });
        continue;
      }
      const raw = readFileSync(outFile, 'utf-8');
      const parsed = parseFrontmatter(raw);
      if (!parsed) {
        summary.issues.push({ course: courseSlug, detail: `${slug}: no frontmatter` });
        continue;
      }
      const fmErr = validateLessonFrontmatter(parsed.frontmatter);
      if (fmErr) {
        summary.issues.push({ course: courseSlug, detail: `${slug}: frontmatter invalid — ${fmErr}` });
        continue;
      }
      const fm = parsed.frontmatter;
      if (fm.courseSlug !== courseSlug)
        summary.issues.push({ course: courseSlug, detail: `${slug}: courseSlug mismatch (got ${String(fm.courseSlug)})` });
      if (fm.slug !== slug)
        summary.issues.push({ course: courseSlug, detail: `${slug}: frontmatter slug=${String(fm.slug)} doesn't match filename` });
      if (fm.title !== lesson.title)
        summary.issues.push({ course: courseSlug, detail: `${slug}: title differs from v1 course.json` });
      if (fm.orderIndex !== lesson.orderIndex)
        summary.issues.push({
          course: courseSlug,
          detail: `${slug}: orderIndex v1=${String(lesson.orderIndex)} v2=${String(fm.orderIndex)}`,
        });
      if (typeof lesson.duration === 'number' && lesson.duration > 0 && fm.estimatedMinutes !== lesson.duration) {
        summary.issues.push({
          course: courseSlug,
          detail: `${slug}: estimatedMinutes v1=${String(lesson.duration)} v2=${String(fm.estimatedMinutes)}`,
        });
      }

      const v1Body = readFileSync(resolve(srcDir, lesson.contentFile), 'utf-8').replace(/^\s+/, '');
      const v2Body = parsed.body.replace(/^\s+/, '');
      if (sha(Buffer.from(v1Body)) !== sha(Buffer.from(v2Body))) {
        summary.issues.push({ course: courseSlug, detail: `${slug}: body content differs from v1` });
        continue;
      }
      summary.matchedLessons++;
    }
  }

  return summary;
}

function main(): void {
  const summary = verify();
  process.stdout.write(`v1 courses=${String(summary.v1Courses)} v2 courses=${String(summary.v2Courses)}\n`);
  process.stdout.write(`v1 lessons=${String(summary.v1Lessons)} v2 mdx files=${String(summary.v2Mdx)}\n`);
  process.stdout.write(`fully matched lessons=${String(summary.matchedLessons)}\n`);
  process.stdout.write(`issues=${String(summary.issues.length)}\n`);
  for (const issue of summary.issues) {
    process.stdout.write(`  - [${issue.course}] ${issue.detail}\n`);
  }
  if (summary.issues.length > 0) process.exit(1);
}

main();
