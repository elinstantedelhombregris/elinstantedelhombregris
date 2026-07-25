/**
 * Background check: confirm the 7 "interdependencia" (third cycle) ensayos
 * were migrated into v2/content/ensayos/*.mdx VERBATIM — the keystone rule.
 *
 * For each v1 source in Ensayos/interdependencia/NN-*.md:
 *   - a corresponding v2 MDX file exists, with frontmatter series ==
 *     'interdependencia' and orderIndex == NN
 *   - the v2 body (everything after the frontmatter block) is byte-identical
 *     to the v1 body (everything after the H1 title + optional H2 subtitle),
 *     modulo a single trailing-newline/leading-blank-line normalization
 *   - paragraph counts match exactly (split on blank lines)
 *
 * Self-contained: no workspace imports, so it stays runnable as a one-shot
 * from the repo root, independent of the migration script's internals.
 *
 * Run: ./apps/api/node_modules/.bin/tsx scripts/content/verify-ensayos-interdependencia.ts
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const SRC_DIR = resolve(REPO_ROOT, 'Ensayos/interdependencia');
const OUT_DIR = resolve(V2_ROOT, 'content/ensayos');

const ROMAN_HEADING = /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s/;

interface SourceDoc {
  title: string;
  subtitle: string;
  body: string;
}

function parseSource(raw: string): SourceDoc {
  const lines = raw.split('\n');
  let i = 0;
  while (i < lines.length && lines[i]!.trim() === '') i++;
  if (i >= lines.length || !lines[i]!.startsWith('# ')) {
    throw new Error('no H1 title found');
  }
  const title = lines[i]!.replace(/^# /, '').trim();
  i++;
  while (i < lines.length && lines[i]!.trim() === '') i++;

  let subtitle = '';
  if (i < lines.length && lines[i]!.startsWith('## ') && !ROMAN_HEADING.test(lines[i]!.replace(/^## /, '').trim())) {
    subtitle = lines[i]!.replace(/^## /, '').trim();
    i++;
    while (i < lines.length && lines[i]!.trim() === '') i++;
  }

  const body = lines.slice(i).join('\n').trimStart();
  return { title, subtitle, body };
}

function parseMdxBody(raw: string): string {
  if (!raw.startsWith('---\n')) throw new Error('v2 MDX has no frontmatter block');
  const rest = raw.slice(4);
  const endIdx = rest.indexOf('\n---\n');
  if (endIdx < 0) throw new Error('v2 MDX frontmatter block never closes');
  return rest.slice(endIdx + '\n---\n'.length).trimStart();
}

function frontmatterField(raw: string, key: string): string | undefined {
  const m = new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(raw);
  return m?.[1]?.trim();
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function sha(s: string): string {
  return createHash('sha256').update(s, 'utf-8').digest('hex');
}

interface Row {
  slug: string;
  file: string;
  srcParagraphs: number;
  outParagraphs: number;
  bodyMatch: boolean;
  seriesOk: boolean;
  orderIndexOk: boolean;
}

function main(): void {
  if (!existsSync(SRC_DIR)) {
    process.stderr.write(`FAIL source directory not found: ${SRC_DIR}\n`);
    process.exit(1);
  }

  const srcFiles = readdirSync(SRC_DIR)
    .filter((f) => /^\d\d-.*\.md$/.test(f))
    .sort();

  if (srcFiles.length !== 7) {
    process.stderr.write(
      `FAIL expected exactly 7 interdependencia source files, found ${String(srcFiles.length)}: ${srcFiles.join(', ')}\n`,
    );
    process.exit(1);
  }

  const rows: Row[] = [];
  const failures: string[] = [];

  for (const file of srcFiles) {
    const orderIndex = Number(file.slice(0, 2));
    const slug = file.replace(/^\d\d-/, '').replace(/\.md$/, '');
    const outPath = resolve(OUT_DIR, `${slug}.mdx`);

    if (!existsSync(outPath)) {
      failures.push(`${file}: missing v2 output ${slug}.mdx`);
      continue;
    }

    const srcRaw = readFileSync(resolve(SRC_DIR, file), 'utf-8');
    const outRaw = readFileSync(outPath, 'utf-8');

    const src = parseSource(srcRaw);
    const outBody = parseMdxBody(outRaw);

    const series = frontmatterField(outRaw, 'series');
    const orderIndexField = frontmatterField(outRaw, 'orderIndex');

    const seriesOk = series === 'interdependencia';
    const orderIndexOk = orderIndexField === String(orderIndex);
    const bodyMatch = sha(src.body) === sha(outBody);

    if (!seriesOk) failures.push(`${file}: series="${String(series)}", expected "interdependencia"`);
    if (!orderIndexOk)
      failures.push(`${file}: orderIndex="${String(orderIndexField)}", expected "${String(orderIndex)}"`);
    if (!bodyMatch) failures.push(`${file}: body differs from source (sha256 mismatch) — NOT verbatim`);

    const srcParagraphs = paragraphs(src.body).length;
    const outParagraphs = paragraphs(outBody).length;
    if (srcParagraphs !== outParagraphs) {
      failures.push(
        `${file}: paragraph count differs — source=${String(srcParagraphs)} v2=${String(outParagraphs)}`,
      );
    }

    rows.push({ slug, file, srcParagraphs, outParagraphs, bodyMatch, seriesOk, orderIndexOk });
  }

  process.stdout.write('slug'.padEnd(30) + 'src¶  v2¶  body  series  orderIndex\n');
  for (const r of rows) {
    process.stdout.write(
      `${r.slug.padEnd(30)}${String(r.srcParagraphs).padEnd(5)}${String(r.outParagraphs).padEnd(5)}${
        r.bodyMatch ? 'OK' : 'FAIL'
      }    ${r.seriesOk ? 'OK' : 'FAIL'}      ${r.orderIndexOk ? 'OK' : 'FAIL'}\n`,
    );
  }
  const totalSrcParagraphs = rows.reduce((n, r) => n + r.srcParagraphs, 0);
  const totalOutParagraphs = rows.reduce((n, r) => n + r.outParagraphs, 0);
  process.stdout.write(
    `\nTOTAL paragraphs: source=${String(totalSrcParagraphs)} v2=${String(totalOutParagraphs)}\n`,
  );
  process.stdout.write(`${String(rows.length)}/7 files checked.\n`);

  if (failures.length > 0) {
    process.stdout.write(`\n${String(failures.length)} FAILURE(S):\n`);
    for (const f of failures) process.stderr.write(`  FAIL ${f}\n`);
    process.exit(1);
  }

  process.stdout.write('\nOK — all 7 interdependencia ensayos are verbatim matches of their v1 source.\n');
}

main();
