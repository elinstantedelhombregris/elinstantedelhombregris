/**
 * CERRADO: los slugs se repararon en 3.4 (ver spec
 * docs/specs/2026-07-24-manifiesto-y-bitacora-papel-y-tinta.md, decisiones 9
 * y 10, y scripts/content/repair-blog-slugs.ts); volver a correr este script
 * resucitaría los nombres viejos — es idempotente por nombre de archivo, así
 * que un slug de BLOG_SOURCES que ya no coincide con ningún archivo (porque
 * el repair lo renombró) se re-migraría con el slug corrupto de v1. No
 * correrlo de nuevo sobre contenido ya reparado.
 *
 * One-shot: migrate the v1 blog posts listed in BLOG_SOURCES (21 of v1's 22 —
 * SocialJusticeHub/shared/blogContent.ts `blogContentUpdates`) into v2 MDX
 * under v2/content/blog/. The 22nd v1 post, "¿Quién tiene el timón?", is
 * intentionally excluded: v2/content/blog/quien-tiene-el-timon.mdx already
 * covers that title as a hand-authored v2-native rewrite (see commit
 * bc804a5), not a verbatim migration, so it isn't tracked here.
 *
 * For each BlogSource (in array order):
 *   - Looks up the v1 entry by slug; collects misses into missing[].
 *   - Extracts the title from the first <h1> of the v1 HTML content.
 *   - Converts the HTML body to Markdown via htmlToMarkdown.
 *   - Writes v2/content/blog/<slug>.mdx with blog frontmatter.
 *
 * Idempotent: skips slugs that already exist in v2/content/blog/.
 *
 * Run: ./apps/api/node_modules/.bin/tsx scripts/content/migrate-blog-v1-to-v2.ts
 */
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { minutosDeLectura } from '@v2/shared';

import { BLOG_SOURCES, type BlogSource } from './blog-sources.js';
import { htmlToMarkdown } from './html-to-md.js';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const V1_BLOG_CONTENT = resolve(REPO_ROOT, 'SocialJusticeHub/shared/blogContent.ts');
const BLOG_OUT = resolve(V2_ROOT, 'content/blog');

interface V1BlogEntry {
  excerpt: string;
  content: string;
}

interface V1BlogModule {
  blogContentUpdates: Record<string, V1BlogEntry>;
}

async function loadV1Entries(): Promise<Record<string, V1BlogEntry>> {
  const mod = (await import(pathToFileURL(V1_BLOG_CONTENT).href)) as V1BlogModule;
  return mod.blogContentUpdates;
}

function extractTitle(slug: string, content: string): string {
  const m = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(content);
  if (!m) {
    throw new Error(`No <h1> title found in v1 content for slug: ${slug}`);
  }
  return (m[1] ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateReadingMinutes(body: string): number {
  const words = body
    .replace(/[#>*_`~\-\[\]()!]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  return minutosDeLectura(words);
}

function yamlEscape(s: string): string {
  if (s.includes("'")) {
    // Downstream registry parser strips outer quotes but does NOT
    // un-double YAML ''. Emit a double-quoted scalar instead.
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  if (/[:#]|^\s*-/.test(s) || /^['"]/.test(s) || /^\s/.test(s)) {
    return `'${s}'`;
  }
  return s;
}

function buildMdx(src: BlogSource, title: string, summary: string, body: string): string {
  const readingMinutes = estimateReadingMinutes(body);
  const tagsBlock = src.tags.map((t) => `  - ${t}`).join('\n');
  return `---
slug: ${src.slug}
title: ${yamlEscape(title)}
summary: ${yamlEscape(summary)}
type: blog
category: ${src.category}
publishedAt: ${src.publishedAt}
readingMinutes: ${readingMinutes}
tags:
${tagsBlock}
draft: false
---

${body}
`;
}

async function main(): Promise<void> {
  const entries = await loadV1Entries();
  const missing: string[] = [];
  let written = 0;
  let skipped = 0;

  for (const src of BLOG_SOURCES) {
    const entry = entries[src.slug];
    if (!entry) {
      missing.push(src.slug);
      continue;
    }

    const outPath = resolve(BLOG_OUT, `${src.slug}.mdx`);
    if (existsSync(outPath)) {
      process.stdout.write(`skip   ${src.slug} (already exists)\n`);
      skipped++;
      continue;
    }

    const title = extractTitle(src.slug, entry.content);
    const body = htmlToMarkdown(entry.content);
    const mdx = buildMdx(src, title, entry.excerpt.trim(), body);
    writeFileSync(outPath, mdx, 'utf-8');
    process.stdout.write(`wrote  ${src.slug}.mdx\n`);
    written++;
  }

  process.stdout.write(`\nDone: ${String(written)} written, ${String(skipped)} skipped.\n`);

  if (missing.length > 0) {
    process.stderr.write(`MISSING in v1 blogContentUpdates: ${missing.join(', ')}\n`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`);
  process.exit(1);
});
