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
import { fileURLToPath } from 'node:url';

import {
  blogFrontmatterSchema,
  ensayoFrontmatterSchema,
  planFrontmatterSchema,
} from '@v2/shared/content';
import { loadContentDir } from '@v2/shared/content/loader';
import type { LoaderError } from '@v2/shared/content/loader';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

interface PipelineSummary {
  domain: string;
  ok: number;
  errors: LoaderError[];
}

async function run(): Promise<PipelineSummary[]> {
  const summaries: PipelineSummary[] = [];

  const blog = await loadContentDir(`${ROOT}content/blog`, blogFrontmatterSchema);
  summaries.push({ domain: 'blog', ok: blog.ok.length, errors: blog.errors });

  const ensayos = await loadContentDir(`${ROOT}content/ensayos`, ensayoFrontmatterSchema);
  summaries.push({ domain: 'ensayos', ok: ensayos.ok.length, errors: ensayos.errors });

  const planes = await loadContentDir(`${ROOT}content/planes`, planFrontmatterSchema);
  summaries.push({ domain: 'planes', ok: planes.ok.length, errors: planes.errors });

  // Course lessons live one directory deeper. We list course-slug dirs.
  // For now: just stub — proper recursive walk lands when courses get
  // their first MDX lesson.

  return summaries;
}

async function main(): Promise<void> {
  const result = await run();

  let hadErrors = false;
  for (const summary of result) {
    process.stdout.write(
      `[${summary.domain}] ok=${String(summary.ok)} errors=${String(summary.errors.length)}\n`,
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
