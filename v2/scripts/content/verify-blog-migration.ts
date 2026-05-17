/**
 * Background check: confirm every generated blog MDX is well-formed and that
 * its frontmatter survives the unquoting logic the downstream registry uses.
 *
 * For each v2/content/blog/<slug>.mdx:
 *   - exactly BLOG_SOURCES.length files, one per source slug
 *   - filename basename === frontmatter slug
 *   - required frontmatter keys present, typed/shaped correctly
 *   - tags is a non-empty YAML block list
 *   - body is non-empty, contains no leftover HTML tags or BRHARDBREAK sentinel
 *   - title/summary survive the registry's one-quote-strip roundtrip cleanly
 *
 * Self-contained: no workspace imports, no gray-matter; a minimal frontmatter
 * parser tailored to exactly what the migration writes. Runnable one-shot.
 *
 * Run: ./apps/api/node_modules/.bin/tsx scripts/content/verify-blog-migration.ts
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BLOG_SOURCES } from './blog-sources';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const BLOG_DIR = resolve(V2_ROOT, 'content/blog');

const REQUIRED_KEYS = [
  'slug',
  'title',
  'summary',
  'type',
  'category',
  'publishedAt',
  'readingMinutes',
  'tags',
  'draft',
] as const;

const SLUG_RE = /^[a-z0-9-]+$/;
const PUBLISHED_AT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const HTML_TAG_RE = /<\/?(article|p|h[1-3]|ul|ol|li|strong|em|a|blockquote|br)\b/i;
const SENTINEL = 'BRHARDBREAK';

interface ParsedMdx {
  fields: Record<string, string>;
  tags: string[];
  body: string;
}

const failures: string[] = [];

function fail(file: string, detail: string): void {
  failures.push(`FAIL [${file}] ${detail}`);
}

/**
 * Parse the exact frontmatter shape the migration emits: a leading
 * `---\n … \n---\n` block. Scalar `key: value` lines land in `fields` with
 * their raw (still-quoted) value. The `tags:` key introduces a YAML block
 * list of `  - <tag>` lines, collected into `tags`. Everything after the
 * closing delimiter is `body`. Returns null when no frontmatter block.
 */
function parseFrontmatter(raw: string): ParsedMdx | null {
  if (!raw.startsWith('---\n')) return null;
  const rest = raw.slice(4);
  const endIdx = rest.indexOf('\n---\n');
  if (endIdx < 0) return null;
  const yaml = rest.slice(0, endIdx);
  const body = rest.slice(endIdx + '\n---\n'.length);

  const fields: Record<string, string> = {};
  const tags: string[] = [];
  let inTags = false;
  for (const line of yaml.split('\n')) {
    const listItem = /^ {2}- (.*)$/.exec(line);
    if (inTags && listItem) {
      tags.push(listItem[1]!.trim());
      continue;
    }
    const kv = /^([A-Za-z_][A-Za-z0-9_]*):[ \t]?(.*)$/.exec(line);
    if (!kv) {
      inTags = false;
      continue;
    }
    const key = kv[1]!;
    const value = kv[2]!;
    if (key === 'tags') {
      inTags = true;
      fields[key] = value;
      continue;
    }
    inTags = false;
    fields[key] = value;
  }
  return { fields, tags, body };
}

/**
 * The unquoting logic the downstream registry will use: strip ONE leading
 * and ONE trailing char IFF the value starts and ends with the same quote
 * char (either ' or "). No un-doubling of anything.
 */
function registryUnquote(value: string): string {
  if (value.length >= 2) {
    const first = value[0]!;
    const last = value[value.length - 1]!;
    if ((first === "'" || first === '"') && first === last) {
      return value.slice(1, -1);
    }
  }
  return value;
}

function verifyFile(file: string, raw: string): void {
  const fileSlug = basename(file, '.mdx');

  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    fail(file, 'no frontmatter block (expected leading ---\\n … \\n---\\n)');
    return;
  }
  const { fields, tags, body } = parsed;

  // Check 3: required keys present.
  for (const key of REQUIRED_KEYS) {
    if (!(key in fields)) fail(file, `missing required frontmatter key: ${key}`);
  }

  // Check 2 (per-file half): filename basename === frontmatter slug.
  if ('slug' in fields && fields.slug !== fileSlug) {
    fail(file, `frontmatter slug=${String(fields.slug)} doesn't match filename basename ${fileSlug}`);
  }

  // Check 4: typed/shaped scalar invariants.
  if ('type' in fields && fields.type !== 'blog') {
    fail(file, `type must be 'blog', got: ${String(fields.type)}`);
  }
  if ('draft' in fields) {
    if (fields.draft !== 'false') fail(file, `draft must parse to boolean false, got: ${String(fields.draft)}`);
  }
  if ('readingMinutes' in fields) {
    const rm = fields.readingMinutes;
    if (!/^\d+$/.test(rm) || Number(rm) < 1) {
      fail(file, `readingMinutes must be an integer >= 1, got: ${String(rm)}`);
    }
  }
  if ('publishedAt' in fields && !PUBLISHED_AT_RE.test(fields.publishedAt!)) {
    fail(file, `publishedAt must match YYYY-MM-DDThh:mm:ssZ, got: ${String(fields.publishedAt)}`);
  }
  if ('slug' in fields && !SLUG_RE.test(fields.slug!)) {
    fail(file, `slug must match ^[a-z0-9-]+$, got: ${String(fields.slug)}`);
  }

  // Check 6: tags is a non-empty block list, each tag non-empty.
  if (tags.length === 0) {
    fail(file, 'tags must be a non-empty YAML block list');
  }
  for (const tag of tags) {
    if (tag.length === 0) fail(file, 'tags contains an empty tag entry');
  }

  // Check 4 (title/summary non-empty) + Check 8 (registry roundtrip).
  for (const key of ['title', 'summary'] as const) {
    if (!(key in fields)) continue;
    const rawValue = fields[key]!;
    const unquoted = registryUnquote(rawValue);
    if (unquoted.trim().length === 0) {
      fail(file, `${key} is empty after unquoting`);
    }
    if (unquoted.includes("''")) {
      fail(file, `${key} still contains a doubled single-quote after registry unquote: ${unquoted}`);
    }
    if (unquoted.length >= 2) {
      const f = unquoted[0]!;
      const l = unquoted[unquoted.length - 1]!;
      if ((f === "'" || f === '"') && f === l) {
        fail(file, `${key} still wrapped in quotes after registry unquote: ${unquoted}`);
      }
    }
  }

  // Check 7: body non-empty, no leftover HTML, no leaked sentinel.
  if (body.trim().length === 0) {
    fail(file, 'body is empty after trim');
  }
  if (HTML_TAG_RE.test(body)) {
    fail(file, 'body contains leftover HTML tags');
  }
  if (body.includes(SENTINEL)) {
    fail(file, `body contains leaked sentinel ${SENTINEL}`);
  }
}

function main(): void {
  if (!existsSync(BLOG_DIR)) {
    process.stderr.write(`FAIL blog directory not found: ${BLOG_DIR}\n`);
    process.exit(1);
  }

  const files = readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .sort();

  // Check 1: file count === BLOG_SOURCES.length.
  if (files.length !== BLOG_SOURCES.length) {
    failures.push(
      `FAIL file count mismatch: found ${String(files.length)} .mdx, expected ${String(BLOG_SOURCES.length)}`,
    );
  }

  // Check 2 (sources half): every source slug has a corresponding file.
  const fileSlugs = new Set(files.map((f) => basename(f, '.mdx')));
  for (const src of BLOG_SOURCES) {
    if (!fileSlugs.has(src.slug)) {
      failures.push(`FAIL source slug has no MDX file: ${src.slug}`);
    }
  }

  // Check 5: slugs unique across files (filename basenames are the slugs).
  const seen = new Map<string, number>();
  for (const f of files) {
    const s = basename(f, '.mdx');
    seen.set(s, (seen.get(s) ?? 0) + 1);
  }
  for (const [slug, count] of seen) {
    if (count > 1) failures.push(`FAIL duplicate slug across files: ${slug} (${String(count)}x)`);
  }

  for (const f of files) {
    const raw = readFileSync(resolve(BLOG_DIR, f), 'utf-8');
    verifyFile(f, raw);
  }

  if (failures.length > 0) {
    for (const line of failures) process.stderr.write(`${line}\n`);
    process.exit(1);
  }

  process.stdout.write(`OK — ${String(files.length)} MDX files validated.\n`);
}

main();
