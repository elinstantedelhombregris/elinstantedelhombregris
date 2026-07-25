#!/usr/bin/env tsx
/**
 * One-shot: repair the blog slugs that v1's slugify corrupted by dropping
 * diacritics instead of transliterating them (spec 3.4, decisiones 9 y 10).
 *
 * For each content/blog/*.mdx:
 *   - reads `slug` and `title` from the frontmatter
 *   - computes `slugCanonico(title)`
 *   - if it differs from the current `slug`:
 *       (a) rewrites the `slug:` line to the canonical slug
 *       (b) records the old slug under `legacySlugs:` (creates the block if
 *           absent, appends to it if already present)
 *       (c) renames the file to `<canonical-slug>.mdx` (content first,
 *           `renameSync` second, so history follows the content)
 *
 * Idempotent: a file whose slug is already canonical is left untouched —
 * running this twice in a row reports `cambiados=0`.
 *
 * The body — everything after the frontmatter's closing `---` — is never
 * read for meaning and never rewritten; only the YAML block is edited.
 *
 * Run: ./apps/api/node_modules/.bin/tsx scripts/content/repair-blog-slugs.ts
 */
import { readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { slugCanonico } from '@v2/shared/content';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const BLOG_DIR = resolve(V2_ROOT, 'content/blog');

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"')))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

interface Repair {
  /** Frontmatter + body with the slug rewritten and legacySlugs recorded. */
  raw: string;
  /** New basename (with extension) the file should be renamed to. */
  fileName: string;
  oldSlug: string;
  newSlug: string;
}

/** Returns `null` when the file's slug is already canonical (no-op). */
function repairFrontmatter(raw: string, fileLabel: string): Repair | null {
  const fmMatch = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!fmMatch) throw new Error(`no frontmatter block: ${fileLabel}`);
  const yaml = fmMatch[1] ?? '';
  const body = raw.slice(fmMatch[0].length);
  const lines = yaml.split('\n');

  const slugIdx = lines.findIndex((l) => /^slug:\s*/.test(l));
  if (slugIdx < 0) throw new Error(`no slug: line: ${fileLabel}`);
  const oldSlug = unquote(lines[slugIdx]!.replace(/^slug:\s*/, ''));

  const titleIdx = lines.findIndex((l) => /^title:\s*/.test(l));
  if (titleIdx < 0) throw new Error(`no title: line: ${fileLabel}`);
  const title = unquote(lines[titleIdx]!.replace(/^title:\s*/, ''));

  const newSlug = slugCanonico(title);
  if (newSlug === oldSlug) return null;

  lines[slugIdx] = `slug: ${newSlug}`;

  const legacyKeyIdx = lines.findIndex((l) => /^legacySlugs:\s*$/.test(l));
  if (legacyKeyIdx >= 0) {
    let insertAt = legacyKeyIdx + 1;
    while (insertAt < lines.length && /^ {2}- /.test(lines[insertAt] ?? '')) insertAt++;
    lines.splice(insertAt, 0, `  - ${oldSlug}`);
  } else {
    lines.splice(slugIdx + 1, 0, 'legacySlugs:', `  - ${oldSlug}`);
  }

  const newRaw = `---\n${lines.join('\n')}\n---\n${body}`;
  return { raw: newRaw, fileName: `${newSlug}.mdx`, oldSlug, newSlug };
}

function main(): void {
  const files = readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .sort();

  let changed = 0;
  for (const file of files) {
    const filePath = resolve(BLOG_DIR, file);
    const raw = readFileSync(filePath, 'utf-8');
    const repair = repairFrontmatter(raw, file);
    if (!repair) continue;

    writeFileSync(filePath, repair.raw, 'utf-8');
    const newPath = resolve(BLOG_DIR, repair.fileName);
    renameSync(filePath, newPath);
    changed++;
    process.stdout.write(`repaired  ${repair.oldSlug} -> ${repair.newSlug}\n`);
  }

  process.stdout.write(`cambiados=${String(changed)} total=${String(files.length)}\n`);
}

main();
