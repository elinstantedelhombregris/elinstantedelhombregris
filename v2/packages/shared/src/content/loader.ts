/**
 * Content loader.
 *
 * Reads a directory of .mdx files, parses gray-matter frontmatter,
 * validates each file's frontmatter against a Zod schema, and returns
 * a typed array of (frontmatter + body) pairs.
 *
 * Used by build-time scripts (scripts/build-content.ts) to emit a
 * typed registry that the runtime can consume without hitting the
 * filesystem.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import matter from 'gray-matter';

import type { ZodSchema } from 'zod';

export interface ParsedContent<TFront> {
  /** Filename relative to the content directory (e.g. "06-belleza.mdx"). */
  file: string;
  frontmatter: TFront;
  body: string;
}

export interface LoaderError {
  file: string;
  message: string;
  issues?: { path: string; message: string }[];
}

export interface LoaderResult<TFront> {
  ok: ParsedContent<TFront>[];
  errors: LoaderError[];
}

async function listMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')))
    .map((entry) => entry.name)
    .sort();
}

/**
 * Load every .mdx/.md file in `dir` and validate its frontmatter
 * against `schema`. Returns parsed content + per-file errors. The
 * caller decides whether to halt the build on errors.
 */
export async function loadContentDir<TFront>(
  dir: string,
  schema: ZodSchema<TFront>,
): Promise<LoaderResult<TFront>> {
  const files = await listMdxFiles(dir);
  const ok: ParsedContent<TFront>[] = [];
  const errors: LoaderError[] = [];

  for (const file of files) {
    try {
      const path = join(dir, file);
      const raw = await readFile(path, 'utf8');
      const parsed = matter(raw);
      const validation = schema.safeParse(parsed.data);
      if (!validation.success) {
        errors.push({
          file,
          message: 'Frontmatter validation failed',
          issues: validation.error.issues.map((i) => ({
            path: i.path.join('.') || '(root)',
            message: i.message,
          })),
        });
        continue;
      }
      ok.push({ file, frontmatter: validation.data, body: parsed.content });
    } catch (err) {
      errors.push({
        file,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { ok, errors };
}
