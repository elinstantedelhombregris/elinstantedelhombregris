# Migrate v1 Blog → v2 MDX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the 19 long-form posts from `SocialJusticeHub/shared/blogContent.ts` into MDX files under `v2/content/blog/`, then wire `v2/apps/web/src/pages/Blog.tsx` and `BlogPostDetail.tsx` to read from a build-time registry — mirroring the ensayos pattern already established in v2.

**Architecture:** A one-shot Node script (`v2/scripts/content/migrate-blog-v1-to-v2.ts`) reads `blogContent.ts` as a TypeScript module via tsx, converts each entry's HTML body to Markdown using a small in-script converter (no new deps), and writes `<slug>.mdx` files with frontmatter shaped like ensayos. A new `v2/apps/web/src/lib/blog-registry.ts` eager-loads those MDX files via `import.meta.glob`. `Blog.tsx` and `BlogPostDetail.tsx` are rewritten to consume the registry for read-only content (title/summary/body/tags/publishedAt). Existing like/comment mutations remain DB-backed; they will 404 against the v2 API until backend endpoints exist, which is pre-existing state and out of scope.

**Tech Stack:** TypeScript, tsx, Vite `import.meta.glob`, marked (already a dep), Vitest, pnpm workspaces.

---

## Scope notes

**In scope**
- Generate 19 MDX files under `v2/content/blog/<slug>.mdx`.
- HTML → Markdown converter for the tag vocabulary used in `blogContent.ts` (`<article>`, `<h1>`–`<h3>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, `<a>`, `<blockquote>`).
- Verification script that parses every emitted MDX and asserts schema invariants.
- `blog-registry.ts` mirroring `ensayos-registry.ts`.
- Rewrite `Blog.tsx` and `BlogPostDetail.tsx` to consume the registry (read-only).
- `pnpm verify` stays green.

**Out of scope**
- Backend `/api/blog/*` endpoints in v2 (do not exist yet; this plan does not add them).
- Wiring real like/comment/bookmark interactivity (mutations remain in `BlogPostDetail.tsx` calling endpoints that may 404; that is pre-existing and unchanged).
- Cover images, vlog/video posts (none present in `blogContentUpdates`; type defaults to `blog`).
- Pulling real `publishedAt` / `category` / `tags` from the v1 production DB (off-limits per project rule). The script uses synthetic, staggered publication dates; the user can hand-tune the SOURCES table afterward.

**Anti-goals**
- Do not introduce a new HTML-to-Markdown library (turndown, html-to-md, etc.); the source HTML uses a tight, fixed vocabulary that a ~80-line in-script converter handles deterministically.
- Do not import any v1 server/DB code from v2 runtime. The migration script may read `blogContent.ts` (a pure data module with no side effects) via tsx, but nothing in `apps/api` or `apps/web` may reference v1.

---

## File structure

**Created**
- `v2/scripts/content/migrate-blog-v1-to-v2.ts` — one-shot migration script.
- `v2/scripts/content/verify-blog-migration.ts` — verifier (mirrors `verify-courses-migration.ts`).
- `v2/scripts/content/__tests__/html-to-md.test.ts` — Vitest unit tests for the HTML→MD converter.
- `v2/apps/web/src/lib/blog-registry.ts` — build-time registry.
- `v2/apps/web/src/lib/__tests__/blog-registry.test.ts` — registry test.
- `v2/content/blog/<slug>.mdx` × 19 — generated content.

**Modified**
- `v2/apps/web/src/pages/Blog.tsx` — read from registry instead of `/api/blog/posts`.
- `v2/apps/web/src/pages/BlogPostDetail.tsx` — read post (title/summary/body/tags/publishedAt) from registry, lookup by slug; keep like/comment mutations untouched.

---

## Source data inventory (reference)

The 19 entries in `SocialJusticeHub/shared/blogContent.ts` (in source-file order — slugs from the dict keys):

1. `el-cansancio-sagrado-por-qu-ya-no-podemos-esperar`
2. `la-amabilidad-como-ingeniera-social`
3. `diseo-idealizado-la-argentina-posible`
4. `el-poder-del-pensamiento-sistmico-en-la-transformacin-social`
5. `la-tica-del-servicio-construyendo-una-sociedad-de-servidores`
6. `sistemas-vs-sntomas-cmo-pensar-como-ingeniero-social`
7. `la-amabilidad-como-estrategia-de-transformacin`
8. `aprender-para-ser-libres-la-educacin-como-acto-de-soberana`
9. `la-ciencia-de-la-confianza-el-capital-que-nadie-mide-pero-todos-necesitan`
10. `por-qu-nos-resistimos-a-cambiar-la-psicologa-de-la-transformacin`
11. `inteligencia-colectiva-por-qu-juntos-pensamos-mejor-de-lo-que-creemos`
12. `lo-que-le-debemos-al-futuro-responsabilidad-intergeneracional-como-diseo`
13. `las-fuerzas-del-cielo-el-poder-que-ya-tens-y-nadie-te-ense-a-usar`
14. `detectar-patrones-otro-poder-que-ya-tens-y-nadie-te-ense-a-usar`
15. `refinarse-o-repetirse`
16. `el-cristo-que-llevs-dentro`
17. `pago-por-inteligencia-artificial-y-por-la-ma`
18. `buscar-en-el-pasado-para-controlar-el-futuro`
19. `el-abrazo-que-no-supimos-sostener`

Each entry is `{ excerpt: string, content: string }` where `content` is an HTML `<article>` block. The dict key is `slugify(title)` per the helper in `blogContent.ts:1-7`. The H1 inside `content` carries the original title verbatim.

---

## Phase 1 — HTML → Markdown converter (TDD)

### Task 1: Scaffold the converter and tests directory

**Files:**
- Create: `v2/scripts/content/__tests__/html-to-md.test.ts`
- Create: `v2/scripts/content/html-to-md.ts`

- [ ] **Step 1: Confirm Vitest is available at the repo scripts level**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm vitest --version`
Expected: prints a version number (e.g. `2.x.x`). If "command not found", add `vitest` to the root `devDependencies` first with `pnpm add -Dw vitest` — but the project already runs `pnpm test:unit`, so Vitest is present.

- [ ] **Step 2: Write the first failing test — strip `<article>` wrapper**

Create `v2/scripts/content/__tests__/html-to-md.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { htmlToMarkdown } from '../html-to-md';

describe('htmlToMarkdown', () => {
  it('strips the outer <article> wrapper', () => {
    expect(htmlToMarkdown('<article><p>hola</p></article>')).toBe('hola');
  });
});
```

- [ ] **Step 3: Run and confirm it fails**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm vitest run scripts/content/__tests__/html-to-md.test.ts`
Expected: FAIL — cannot resolve `../html-to-md`.

- [ ] **Step 4: Create the minimal implementation**

Create `v2/scripts/content/html-to-md.ts`:

```ts
/**
 * HTML → Markdown converter for the fixed tag vocabulary used by
 * SocialJusticeHub/shared/blogContent.ts. Not a general-purpose
 * converter — only handles the tags actually present in the source.
 */
export function htmlToMarkdown(html: string): string {
  let out = html.trim();
  out = out.replace(/^<article[^>]*>\s*/i, '').replace(/\s*<\/article>\s*$/i, '');
  return out
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, inner: string) => inner.trim())
    .trim();
}
```

- [ ] **Step 5: Verify the test passes**

Run: `pnpm vitest run scripts/content/__tests__/html-to-md.test.ts`
Expected: PASS — 1 test.

- [ ] **Step 6: Commit**

```bash
git add v2/scripts/content/html-to-md.ts v2/scripts/content/__tests__/html-to-md.test.ts
git commit -m "feat(scripts): scaffold HTML→Markdown converter for blog migration"
```

---

### Task 2: Headings, paragraphs, line collapsing

**Files:**
- Modify: `v2/scripts/content/html-to-md.ts`
- Modify: `v2/scripts/content/__tests__/html-to-md.test.ts`

- [ ] **Step 1: Add failing tests for `<h1>`, `<h2>`, `<h3>` and paragraph spacing**

Append to `html-to-md.test.ts`:

```ts
  it('strips the leading <h1> (title lives in frontmatter)', () => {
    expect(htmlToMarkdown('<article><h1>Título</h1><p>cuerpo</p></article>')).toBe('cuerpo');
  });

  it('converts <h2> to ## and <h3> to ###', () => {
    const input = '<article><h2>Sección</h2><p>uno</p><h3>Sub</h3><p>dos</p></article>';
    expect(htmlToMarkdown(input)).toBe('## Sección\n\nuno\n\n### Sub\n\ndos');
  });

  it('joins paragraphs with a blank line', () => {
    const input = '<article><p>a</p><p>b</p><p>c</p></article>';
    expect(htmlToMarkdown(input)).toBe('a\n\nb\n\nc');
  });

  it('collapses internal whitespace inside a paragraph', () => {
    const input = '<article><p>\n  hola   mundo\n</p></article>';
    expect(htmlToMarkdown(input)).toBe('hola mundo');
  });
```

- [ ] **Step 2: Run and confirm new tests fail**

Run: `pnpm vitest run scripts/content/__tests__/html-to-md.test.ts`
Expected: 4 of 5 tests FAIL.

- [ ] **Step 3: Replace `html-to-md.ts` with a block-aware implementation**

Overwrite `v2/scripts/content/html-to-md.ts`:

```ts
/**
 * HTML → Markdown converter for the fixed tag vocabulary used by
 * SocialJusticeHub/shared/blogContent.ts. Not a general-purpose
 * converter — only handles the tags actually present in the source:
 * <article>, <h1>–<h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a>,
 * <blockquote>, <br>.
 */
type Block = { kind: 'heading'; level: 2 | 3; text: string } | { kind: 'para'; text: string } | { kind: 'quote'; text: string } | { kind: 'list'; ordered: boolean; items: string[] };

const BLOCK_RE = /<(h1|h2|h3|p|blockquote|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi;

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function renderInline(s: string): string {
  let out = s;
  out = out.replace(/<br\s*\/?>/gi, '\n');
  out = out.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_m, t: string) => `**${collapseWhitespace(t)}**`);
  out = out.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_m, t: string) => `*${collapseWhitespace(t)}*`);
  out = out.replace(/<a\s+[^>]*href=(['"])([^'"]+)\1[^>]*>([\s\S]*?)<\/a>/gi, (_m, _q, href: string, t: string) => `[${collapseWhitespace(t)}](${href})`);
  out = out.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
  return collapseWhitespace(out);
}

function parseListItems(inner: string): string[] {
  const items: string[] = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner)) !== null) {
    items.push(renderInline(m[1] ?? ''));
  }
  return items;
}

function renderBlock(b: Block): string {
  if (b.kind === 'heading') return `${'#'.repeat(b.level)} ${b.text}`;
  if (b.kind === 'para') return b.text;
  if (b.kind === 'quote') return b.text.split('\n').map((line) => `> ${line}`).join('\n');
  if (b.ordered) return b.items.map((it, i) => `${i + 1}. ${it}`).join('\n');
  return b.items.map((it) => `- ${it}`).join('\n');
}

export function htmlToMarkdown(html: string): string {
  let src = html.trim();
  src = src.replace(/^<article[^>]*>\s*/i, '').replace(/\s*<\/article>\s*$/i, '');

  const blocks: Block[] = [];
  let m: RegExpExecArray | null;
  BLOCK_RE.lastIndex = 0;
  while ((m = BLOCK_RE.exec(src)) !== null) {
    const tag = (m[1] ?? '').toLowerCase();
    const inner = m[2] ?? '';
    if (tag === 'h1') continue;
    if (tag === 'h2') blocks.push({ kind: 'heading', level: 2, text: renderInline(inner) });
    else if (tag === 'h3') blocks.push({ kind: 'heading', level: 3, text: renderInline(inner) });
    else if (tag === 'p') blocks.push({ kind: 'para', text: renderInline(inner) });
    else if (tag === 'blockquote') blocks.push({ kind: 'quote', text: renderInline(inner) });
    else if (tag === 'ul') blocks.push({ kind: 'list', ordered: false, items: parseListItems(inner) });
    else if (tag === 'ol') blocks.push({ kind: 'list', ordered: true, items: parseListItems(inner) });
  }

  return blocks.map(renderBlock).join('\n\n');
}
```

- [ ] **Step 4: Run and confirm all 5 tests pass**

Run: `pnpm vitest run scripts/content/__tests__/html-to-md.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add v2/scripts/content/html-to-md.ts v2/scripts/content/__tests__/html-to-md.test.ts
git commit -m "feat(scripts): block-aware HTML→Markdown for headings, paragraphs, whitespace"
```

---

### Task 3: Lists, blockquotes, and inline formatting

**Files:**
- Modify: `v2/scripts/content/__tests__/html-to-md.test.ts`

- [ ] **Step 1: Add the remaining failing tests**

Append:

```ts
  it('renders <ul><li>… into a dash list', () => {
    const input = '<article><ul><li>uno</li><li>dos</li></ul></article>';
    expect(htmlToMarkdown(input)).toBe('- uno\n- dos');
  });

  it('renders <ol><li>… into a numbered list', () => {
    const input = '<article><ol><li>uno</li><li>dos</li><li>tres</li></ol></article>';
    expect(htmlToMarkdown(input)).toBe('1. uno\n2. dos\n3. tres');
  });

  it('renders <blockquote> with a leading `> `', () => {
    const input = '<article><blockquote>frase</blockquote></article>';
    expect(htmlToMarkdown(input)).toBe('> frase');
  });

  it('renders <strong> and <em> as bold and italic', () => {
    const input = '<article><p>hola <strong>mundo</strong> y <em>fin</em></p></article>';
    expect(htmlToMarkdown(input)).toBe('hola **mundo** y *fin*');
  });

  it('rewrites <a href="x">label</a> as [label](x)', () => {
    const input = '<article><p>ver <a href="/recursos">recursos</a> ahora</p></article>';
    expect(htmlToMarkdown(input)).toBe('ver [recursos](/recursos) ahora');
  });

  it('decodes the HTML entities present in source content', () => {
    const input = '<article><p>caf&eacute; &amp; pan &quot;rico&quot;</p></article>';
    // We only decode &nbsp; &amp; &lt; &gt; &quot; &#39; — &eacute; passes through.
    expect(htmlToMarkdown(input)).toBe('caf&eacute; & pan "rico"');
  });

  it('preserves bold inside a list item', () => {
    const input = '<article><ul><li><strong>Clave:</strong> resto del item</li></ul></article>';
    expect(htmlToMarkdown(input)).toBe('- **Clave:** resto del item');
  });
```

- [ ] **Step 2: Run — all should pass already (the implementation in Task 2 covers these)**

Run: `pnpm vitest run scripts/content/__tests__/html-to-md.test.ts`
Expected: PASS — 13 tests.

If any FAIL, fix `html-to-md.ts` until green. The most likely failures: list-item inline conversion (make sure `renderInline` is called inside `parseListItems`) and blockquote line-prefix (single line is fine — `frase` → `> frase`).

- [ ] **Step 3: Commit**

```bash
git add v2/scripts/content/__tests__/html-to-md.test.ts
git commit -m "test(scripts): cover lists, blockquotes, inline formatting in HTML→MD"
```

---

## Phase 2 — Migration script

### Task 4: Define SOURCES metadata table

**Files:**
- Create: `v2/scripts/content/blog-sources.ts`

- [ ] **Step 1: Write the SOURCES table**

Create `v2/scripts/content/blog-sources.ts`. The script does not import v1 to enumerate slugs — it lists them explicitly so the user has a single place to tune dates, tags, and categories. The 19 slugs match the keys in `SocialJusticeHub/shared/blogContent.ts` exactly.

```ts
export interface BlogSource {
  slug: string;
  publishedAt: string;
  category: string;
  tags: readonly string[];
}

// Synthetic dates: staggered weekly working backwards from 2026-04-30 so
// the most recent post appears first when sorted desc. Tune by hand.
export const BLOG_SOURCES: readonly BlogSource[] = [
  { slug: 'el-cansancio-sagrado-por-qu-ya-no-podemos-esperar',                       publishedAt: '2026-04-30T00:00:00Z', category: 'diagnostico',     tags: ['lucidez', 'agotamiento', 'diseno-social'] },
  { slug: 'la-amabilidad-como-ingeniera-social',                                     publishedAt: '2026-04-23T00:00:00Z', category: 'ingenieria-social', tags: ['amabilidad', 'confianza', 'cultura-civica'] },
  { slug: 'diseo-idealizado-la-argentina-posible',                                   publishedAt: '2026-04-16T00:00:00Z', category: 'diseno',          tags: ['argentina', 'diseno-idealizado', 'metodo'] },
  { slug: 'el-poder-del-pensamiento-sistmico-en-la-transformacin-social',            publishedAt: '2026-04-09T00:00:00Z', category: 'ingenieria-social', tags: ['pensamiento-sistemico', 'transformacion'] },
  { slug: 'la-tica-del-servicio-construyendo-una-sociedad-de-servidores',            publishedAt: '2026-04-02T00:00:00Z', category: 'etica',           tags: ['servicio', 'etica', 'comunidad'] },
  { slug: 'sistemas-vs-sntomas-cmo-pensar-como-ingeniero-social',                    publishedAt: '2026-03-26T00:00:00Z', category: 'ingenieria-social', tags: ['sistemas', 'sintomas', 'diagnostico'] },
  { slug: 'la-amabilidad-como-estrategia-de-transformacin',                          publishedAt: '2026-03-19T00:00:00Z', category: 'ingenieria-social', tags: ['amabilidad', 'estrategia'] },
  { slug: 'aprender-para-ser-libres-la-educacin-como-acto-de-soberana',              publishedAt: '2026-03-12T00:00:00Z', category: 'educacion',       tags: ['educacion', 'soberania', 'libertad'] },
  { slug: 'la-ciencia-de-la-confianza-el-capital-que-nadie-mide-pero-todos-necesitan', publishedAt: '2026-03-05T00:00:00Z', category: 'confianza',       tags: ['confianza', 'capital-social'] },
  { slug: 'por-qu-nos-resistimos-a-cambiar-la-psicologa-de-la-transformacin',        publishedAt: '2026-02-26T00:00:00Z', category: 'psicologia',      tags: ['cambio', 'psicologia', 'resistencia'] },
  { slug: 'inteligencia-colectiva-por-qu-juntos-pensamos-mejor-de-lo-que-creemos',   publishedAt: '2026-02-19T00:00:00Z', category: 'colaboracion',    tags: ['inteligencia-colectiva', 'cooperacion'] },
  { slug: 'lo-que-le-debemos-al-futuro-responsabilidad-intergeneracional-como-diseo', publishedAt: '2026-02-12T00:00:00Z', category: 'etica',           tags: ['intergeneracional', 'futuro', 'responsabilidad'] },
  { slug: 'las-fuerzas-del-cielo-el-poder-que-ya-tens-y-nadie-te-ense-a-usar',       publishedAt: '2026-02-05T00:00:00Z', category: 'poder',           tags: ['poder', 'fuerzas-del-cielo'] },
  { slug: 'detectar-patrones-otro-poder-que-ya-tens-y-nadie-te-ense-a-usar',         publishedAt: '2026-01-29T00:00:00Z', category: 'poder',           tags: ['patrones', 'cognicion'] },
  { slug: 'refinarse-o-repetirse',                                                   publishedAt: '2026-01-22T00:00:00Z', category: 'crecimiento',     tags: ['crecimiento', 'practica'] },
  { slug: 'el-cristo-que-llevs-dentro',                                              publishedAt: '2026-01-15T00:00:00Z', category: 'espiritualidad',  tags: ['espiritualidad', 'identidad'] },
  { slug: 'pago-por-inteligencia-artificial-y-por-la-ma',                            publishedAt: '2026-01-08T00:00:00Z', category: 'tecnologia',      tags: ['ia', 'soberania-cognitiva'] },
  { slug: 'buscar-en-el-pasado-para-controlar-el-futuro',                            publishedAt: '2026-01-01T00:00:00Z', category: 'historia',        tags: ['memoria', 'historia', 'futuro'] },
  { slug: 'el-abrazo-que-no-supimos-sostener',                                       publishedAt: '2025-12-25T00:00:00Z', category: 'argentina',       tags: ['mundial', 'identidad', 'argentina'] },
];
```

- [ ] **Step 2: Commit**

```bash
git add v2/scripts/content/blog-sources.ts
git commit -m "feat(scripts): enumerate blog SOURCES with synthetic publishedAt and tags"
```

---

### Task 5: Migration script — title extraction and frontmatter

**Files:**
- Create: `v2/scripts/content/migrate-blog-v1-to-v2.ts`

- [ ] **Step 1: Write the migration script**

Create `v2/scripts/content/migrate-blog-v1-to-v2.ts`:

```ts
/**
 * One-shot: read SocialJusticeHub/shared/blogContent.ts and emit v2 MDX
 * files under v2/content/blog/<slug>.mdx with the frontmatter shape
 * consumed by apps/web/src/lib/blog-registry.ts.
 *
 * Run: pnpm tsx scripts/content/migrate-blog-v1-to-v2.ts
 *
 * Idempotent: skips slugs that already exist in v2/content/blog/.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BLOG_SOURCES, type BlogSource } from './blog-sources';
import { htmlToMarkdown } from './html-to-md';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const V1_BLOG_CONTENT_PATH = resolve(REPO_ROOT, 'SocialJusticeHub/shared/blogContent.ts');
const BLOG_OUT = resolve(V2_ROOT, 'content/blog');

interface V1Entry {
  excerpt: string;
  content: string;
}

async function loadV1Entries(): Promise<Record<string, V1Entry>> {
  // blogContent.ts is a pure data module (no side effects, no v1 imports).
  // tsx resolves the TS import natively.
  const mod = (await import(V1_BLOG_CONTENT_PATH)) as {
    blogContentUpdates: Record<string, V1Entry>;
  };
  return mod.blogContentUpdates;
}

function extractH1(html: string): string {
  const m = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (!m) throw new Error('no <h1> in content');
  return m[1]!.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function estimateReadingMinutes(body: string, wordsPerMinute = 220): number {
  const plain = body.replace(/[#>*_`\[\]()-]/g, ' ').split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(plain.length / wordsPerMinute));
}

function yamlEscape(s: string): string {
  if (/[:#]|^\s*-/.test(s) || /^['"]/.test(s)) {
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

function buildMdx(src: BlogSource, entry: V1Entry): string {
  const title = extractH1(entry.content);
  const body = htmlToMarkdown(entry.content);
  const readingMinutes = estimateReadingMinutes(body);
  const tagsBlock = src.tags.map((t) => `  - ${t}`).join('\n');

  return `---
slug: ${src.slug}
title: ${yamlEscape(title)}
summary: ${yamlEscape(entry.excerpt.trim())}
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
  let written = 0;
  let skipped = 0;
  const missing: string[] = [];

  for (const src of BLOG_SOURCES) {
    const v1 = entries[src.slug];
    if (!v1) {
      missing.push(src.slug);
      continue;
    }
    const outPath = resolve(BLOG_OUT, `${src.slug}.mdx`);
    if (existsSync(outPath)) {
      console.log(`skip   ${src.slug} (already exists)`);
      skipped++;
      continue;
    }
    writeFileSync(outPath, buildMdx(src, v1), 'utf-8');
    console.log(`wrote  ${src.slug}.mdx`);
    written++;
  }

  if (missing.length > 0) {
    console.error(`\nMISSING in v1 blogContent.ts: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log(`\nDone: ${written} written, ${skipped} skipped.`);
}

void main();
```

- [ ] **Step 2: Dry-run the script with the output directory empty**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm tsx scripts/content/migrate-blog-v1-to-v2.ts`
Expected: `wrote  …` × 19, then `Done: 19 written, 0 skipped.` Exit code 0. No "MISSING" line.

If a slug prints in MISSING, the slug in `blog-sources.ts` does not match the dict key in v1. The fix is to read `blogContent.ts` and copy the exact key string into `blog-sources.ts`. Do not rename either side.

- [ ] **Step 3: Re-run to confirm idempotency**

Run: `pnpm tsx scripts/content/migrate-blog-v1-to-v2.ts`
Expected: `skip   …` × 19, then `Done: 0 written, 19 skipped.`

- [ ] **Step 4: Spot-check one of the generated files**

Open `v2/content/blog/el-cansancio-sagrado-por-qu-ya-no-podemos-esperar.mdx`. Confirm:
- Frontmatter contains `slug`, `title: 'El Cansancio Sagrado: Por qué ya no podemos esperar'`, `summary`, `type: blog`, `category`, `publishedAt`, `readingMinutes` (a positive integer), `tags`, `draft: false`.
- Body starts with `## Cuando el agotamiento se convierte en brújula` (the first H2 inside the original `<article>`), NOT with the H1 title.
- Lists render as `- ` items, blockquotes as `> `, no leftover `<p>` / `<ul>` / `<strong>` tags.

If leftover tags are visible, fix `html-to-md.ts` (likely an unhandled variant like `<p class="…">` — the implementation already uses `[^>]*` so this is unlikely; check the actual offending tag).

- [ ] **Step 5: Commit (with content)**

```bash
git add v2/scripts/content/migrate-blog-v1-to-v2.ts v2/content/blog/
git commit -m "feat(content): migrate 19 v1 blog posts to v2 MDX"
```

---

### Task 6: Verification script

**Files:**
- Create: `v2/scripts/content/verify-blog-migration.ts`

- [ ] **Step 1: Write the verifier**

Create `v2/scripts/content/verify-blog-migration.ts`:

```ts
/**
 * Validates every MDX in v2/content/blog/:
 *   - file count matches BLOG_SOURCES length
 *   - frontmatter parses cleanly
 *   - required fields present and well-typed
 *   - slugs unique and match the filename
 *   - body is non-empty and contains no leftover HTML tags
 *
 * Run: pnpm tsx scripts/content/verify-blog-migration.ts
 * Exits 1 on any failure.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BLOG_SOURCES } from './blog-sources';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const BLOG_DIR = resolve(V2_ROOT, 'content/blog');

const REQUIRED_FIELDS = ['slug', 'title', 'summary', 'type', 'category', 'publishedAt', 'readingMinutes', 'tags', 'draft'] as const;

function parseFrontmatter(raw: string): Record<string, string> {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!m) throw new Error('missing frontmatter');
  const out: Record<string, string> = {};
  for (const line of m[1]!.split('\n')) {
    const kv = /^([a-zA-Z0-9_]+)\s*:\s*(.*)$/.exec(line);
    if (kv) out[kv[1]!] = kv[2]!;
  }
  return out;
}

function main(): void {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));
  const errors: string[] = [];

  if (files.length !== BLOG_SOURCES.length) {
    errors.push(`expected ${BLOG_SOURCES.length} MDX files, found ${files.length}`);
  }

  const slugs = new Set<string>();
  for (const file of files) {
    const path = resolve(BLOG_DIR, file);
    const raw = readFileSync(path, 'utf-8');
    let fm: Record<string, string>;
    try {
      fm = parseFrontmatter(raw);
    } catch (e) {
      errors.push(`${file}: ${(e as Error).message}`);
      continue;
    }
    for (const field of REQUIRED_FIELDS) {
      if (!(field in fm)) errors.push(`${file}: missing field ${field}`);
    }
    const slugFromFile = file.replace(/\.mdx$/, '');
    if (fm.slug !== slugFromFile) errors.push(`${file}: slug "${fm.slug ?? ''}" does not match filename`);
    if (slugs.has(slugFromFile)) errors.push(`${file}: duplicate slug`);
    slugs.add(slugFromFile);

    const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
    if (body.length === 0) errors.push(`${file}: empty body`);
    if (/<(p|h[1-3]|ul|ol|li|strong|em|a|article|blockquote)\b/i.test(body)) {
      errors.push(`${file}: body still contains HTML tags`);
    }
  }

  if (errors.length > 0) {
    for (const e of errors) console.error('FAIL ' + e);
    process.exit(1);
  }
  console.log(`OK — ${files.length} MDX files validated.`);
}

main();
```

- [ ] **Step 2: Run the verifier**

Run: `pnpm tsx scripts/content/verify-blog-migration.ts`
Expected: `OK — 19 MDX files validated.` Exit code 0.

If failures appear, fix the migration script and regenerate (delete a single file and re-run `migrate-blog-v1-to-v2.ts` to overwrite that one; the script skips existing files so to overwrite you must delete first).

- [ ] **Step 3: Commit**

```bash
git add v2/scripts/content/verify-blog-migration.ts
git commit -m "feat(scripts): verify-blog-migration asserts frontmatter and body invariants"
```

---

## Phase 3 — Blog registry

### Task 7: Registry with eager glob + Vitest test

**Files:**
- Create: `v2/apps/web/src/lib/blog-registry.ts`
- Create: `v2/apps/web/src/lib/__tests__/blog-registry.test.ts`

- [ ] **Step 1: Write the failing test**

Create `v2/apps/web/src/lib/__tests__/blog-registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { BLOG_POSTS, findBlogPost } from '../blog-registry';

describe('BLOG_POSTS registry', () => {
  it('loads 19 posts', () => {
    expect(BLOG_POSTS).toHaveLength(19);
  });

  it('every entry has slug/title/summary/body', () => {
    for (const p of BLOG_POSTS) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.summary.length).toBeGreaterThan(0);
      expect(p.body.length).toBeGreaterThan(0);
    }
  });

  it('sorts newest first by publishedAt', () => {
    for (let i = 1; i < BLOG_POSTS.length; i++) {
      expect(BLOG_POSTS[i - 1]!.publishedAt >= BLOG_POSTS[i]!.publishedAt).toBe(true);
    }
  });

  it('findBlogPost returns by slug, undefined for unknown', () => {
    const slug = BLOG_POSTS[0]!.slug;
    expect(findBlogPost(slug)?.slug).toBe(slug);
    expect(findBlogPost('does-not-exist')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web vitest run src/lib/__tests__/blog-registry.test.ts`

Note: if the web workspace name is different, list workspaces first with `pnpm -r list --depth -1` and adjust. Expected: FAIL — cannot resolve `../blog-registry`.

- [ ] **Step 3: Write the registry**

Create `v2/apps/web/src/lib/blog-registry.ts`:

```ts
/**
 * Build-time registry of blog posts.
 *
 * Mirrors ensayos-registry.ts: eager-load every MDX in v2/content/blog/,
 * parse the frontmatter, expose a flat readonly array sorted newest-first.
 */
import { stripFrontmatter } from './markdown';

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  type: 'blog' | 'vlog';
  category: string;
  publishedAt: string;
  readingMinutes: number;
  tags: readonly string[];
  body: string;
}

const files = import.meta.glob<string>('../../../../content/blog/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

interface ParsedFrontmatter {
  values: Record<string, unknown>;
  tags: readonly string[];
}

function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!match) return { values: {}, tags: [] };
  const fm: Record<string, unknown> = {};
  const tags: string[] = [];
  let mode: 'kv' | 'tags' = 'kv';
  for (const line of (match[1] ?? '').split('\n')) {
    if (mode === 'tags') {
      const t = /^\s+-\s+(.+?)\s*$/.exec(line);
      if (t) {
        tags.push(t[1]!);
        continue;
      }
      mode = 'kv';
    }
    if (line.trim() === 'tags:') {
      mode = 'tags';
      continue;
    }
    const m = /^([a-zA-Z0-9_]+)\s*:\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    const key = m[1]!;
    let value: string = m[2] ?? '';
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    if (value === 'true') fm[key] = true;
    else if (value === 'false') fm[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(value)) fm[key] = Number(value);
    else fm[key] = value;
  }
  return { values: fm, tags };
}

function readString(fm: Record<string, unknown>, key: string, fallback: string): string {
  const v = fm[key];
  return typeof v === 'string' ? v : fallback;
}
function readNumber(fm: Record<string, unknown>, key: string, fallback: number): number {
  const v = fm[key];
  return typeof v === 'number' ? v : fallback;
}

function buildRegistry(): BlogPost[] {
  const out: BlogPost[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const { values, tags } = parseFrontmatter(raw);
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '') ?? '';
    const type = readString(values, 'type', 'blog');
    out.push({
      slug: readString(values, 'slug', fallbackSlug),
      title: readString(values, 'title', '(sin título)'),
      summary: readString(values, 'summary', ''),
      type: type === 'vlog' ? 'vlog' : 'blog',
      category: readString(values, 'category', 'general'),
      publishedAt: readString(values, 'publishedAt', ''),
      readingMinutes: readNumber(values, 'readingMinutes', 0),
      tags,
      body: stripFrontmatter(raw),
    });
  }
  return out.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));
}

export const BLOG_POSTS: readonly BlogPost[] = buildRegistry();

export function findBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
```

- [ ] **Step 4: Run the test**

Run: `pnpm --filter @v2/web vitest run src/lib/__tests__/blog-registry.test.ts`
Expected: PASS — 4 tests.

If "loads 19 posts" fails with 0, the `import.meta.glob` path is wrong. From `apps/web/src/lib/`, the path to `v2/content/blog/` is `../../../../content/blog/*.mdx` (four `..` segments: `lib` → `src` → `web` → `apps` → `v2/`). This matches `ensayos-registry.ts:21`.

- [ ] **Step 5: Commit**

```bash
git add v2/apps/web/src/lib/blog-registry.ts v2/apps/web/src/lib/__tests__/blog-registry.test.ts
git commit -m "feat(web): build-time blog-registry mirroring ensayos pattern"
```

---

## Phase 4 — Wire `Blog.tsx` and `BlogPostDetail.tsx`

### Task 8: Replace `Blog.tsx` with registry-driven list

**Files:**
- Modify: `v2/apps/web/src/pages/Blog.tsx`

- [ ] **Step 1: Replace the file contents**

Overwrite `v2/apps/web/src/pages/Blog.tsx`:

```tsx
import { Link } from 'wouter';

import { BLOG_POSTS } from '~/lib/blog-registry';

export function Blog() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Blog</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          <span className="gradient-text">Lo que vamos pensando juntos.</span>
        </h1>
      </header>

      {BLOG_POSTS.length === 0 ? (
        <p className="text-center text-muted-foreground">Todavía no hay posts publicados. Pronto.</p>
      ) : (
        <ul className="space-y-4">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="glass block rounded-2xl p-6 transition-colors hover:border-iris-violet/50"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-2xl font-semibold">{post.title}</h2>
                  {post.readingMinutes > 0 ? (
                    <p className="font-mono text-xs text-muted-foreground">{post.readingMinutes} min</p>
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-3 text-foreground/80">{post.summary}</p>
                {post.publishedAt ? (
                  <p className="mt-4 font-mono text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default Blog;
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web type-check`
Expected: no errors. If `BlogListItem` is imported elsewhere, search for it and remove the import (`grep -rn "BlogListItem" v2/apps/web/src`).

- [ ] **Step 3: Commit**

```bash
git add v2/apps/web/src/pages/Blog.tsx
git commit -m "feat(web): Blog list reads from blog-registry instead of /api/blog/posts"
```

---

### Task 9: Rewrite `BlogPostDetail.tsx` — read content from registry, keep interactivity

**Files:**
- Modify: `v2/apps/web/src/pages/BlogPostDetail.tsx`

The existing detail page does three things: read `post` from `/api/blog/posts/:slug`, render `MdxContent`, and run like/comment mutations. We replace only the read side. The mutations stay; they call backend endpoints that may 404 in v2 today — pre-existing state, unchanged. We use the registry's `slug` (string) as the identifier path for the mutations instead of a numeric `postId` (the v2 backend, when it exists, will accept slugs).

- [ ] **Step 1: Rewrite the file**

Overwrite `v2/apps/web/src/pages/BlogPostDetail.tsx`:

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useRoute } from 'wouter';

import { MdxContent } from '~/components/MdxContent';
import { Button } from '~/components/ui/button';
import { api } from '~/lib/api';
import { readCsrfToken, useAuth } from '~/lib/auth';
import { findBlogPost } from '~/lib/blog-registry';

interface Comment {
  id: number;
  postId: number;
  userId: number;
  parentId: number | null;
  body: string;
  createdAt: string;
}

interface CommentsResponse {
  comments: Comment[];
}

interface CommentTreeProps {
  comments: Comment[];
  user: boolean;
  onReply: (id: number | null) => void;
  replyTo: number | null;
}

function CommentTree({ comments, user, onReply, replyTo }: CommentTreeProps) {
  const byParent = new Map<number | null, Comment[]>();
  for (const c of comments) {
    const key = c.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(c);
    byParent.set(key, list);
  }

  const seen = new Set<number>();

  function render(parent: number | null, depth: number): React.JSX.Element[] {
    const list = byParent.get(parent) ?? [];
    return list
      .filter((c) => !seen.has(c.id))
      .map((c) => {
        seen.add(c.id);
        return (
          <li
            key={c.id}
            className={`glass rounded-xl p-4 ${depth > 0 ? 'ml-6 border-l border-iris-violet/20' : ''}`}
          >
            <p className="text-sm text-foreground/85">{c.body}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <time dateTime={c.createdAt}>{new Date(c.createdAt).toLocaleDateString('es-AR')}</time>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    onReply(replyTo === c.id ? null : c.id);
                  }}
                  className="text-iris-violet hover:underline"
                >
                  {replyTo === c.id ? 'cancelar' : 'responder'}
                </button>
              ) : null}
            </div>
            {byParent.has(c.id) ? <ul className="mt-3 space-y-3">{render(c.id, depth + 1)}</ul> : null}
          </li>
        );
      });
  }

  return <ul className="space-y-3">{render(null, 0)}</ul>;
}

export function BlogPostDetail() {
  const [match, params] = useRoute<{ slug: string }>('/blog/:slug');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const slug = params?.slug ?? '';
  const post = slug ? findBlogPost(slug) : undefined;

  const commentsQuery = useQuery<CommentsResponse>({
    queryKey: ['blog', 'post', slug, 'comments'],
    queryFn: () => api.get<CommentsResponse>(`/api/blog/posts/${slug}/comments`),
    enabled: Boolean(post),
    retry: false,
  });

  const likeMutation = useMutation({
    mutationFn: async () => api.post(`/api/blog/posts/${slug}/like`, undefined, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['blog', 'post', slug, 'comments'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () =>
      api.post(`/api/blog/posts/${slug}/comments`, { body: draft, parentId: replyTo ?? undefined }, { csrfToken: readCsrfToken() }),
    onSuccess: () => {
      setDraft('');
      setReplyTo(null);
      void queryClient.invalidateQueries({ queryKey: ['blog', 'post', slug, 'comments'] });
    },
  });

  if (!match) return null;
  if (!post) {
    return (
      <main className="container mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold">Post no encontrado.</h1>
        <Button asChild className="mt-6">
          <Link href="/blog">Volver al blog</Link>
        </Button>
      </main>
    );
  }

  const comments = commentsQuery.data?.comments ?? [];

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold leading-tight">{post.title}</h1>
        {post.summary ? <p className="mt-3 text-lg text-muted-foreground">{post.summary}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          ) : null}
          {post.readingMinutes > 0 ? <span>· {post.readingMinutes} min</span> : null}
        </div>
        {post.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-iris-violet/10 px-3 py-0.5 text-xs text-iris-violet">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <MdxContent raw={post.body} />

      <div className="mt-10 flex items-center gap-3 border-t border-white/5 pt-6">
        <Button
          size="sm"
          variant="secondary"
          disabled={likeMutation.isPending || !user}
          onClick={() => {
            likeMutation.mutate();
          }}
        >
          ♥
        </Button>
        {!user ? (
          <p className="text-xs text-muted-foreground">
            <Link href="/ingresar" className="text-iris-violet hover:underline">Ingresá</Link> para reaccionar y comentar
          </p>
        ) : null}
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-xl font-semibold">Comentarios</h2>
        {user ? (
          <form
            className="mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) commentMutation.mutate();
            }}
          >
            {replyTo !== null ? (
              <p className="mb-2 text-xs text-muted-foreground">
                Respondiendo a comentario #{replyTo} ·{' '}
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null);
                  }}
                  className="text-iris-violet hover:underline"
                >
                  cancelar
                </button>
              </p>
            ) : null}
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
              }}
              placeholder={replyTo !== null ? 'Tu respuesta…' : 'Sumá tu comentario…'}
              className="min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={4000}
            />
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={commentMutation.isPending || !draft.trim()}>
                {commentMutation.isPending ? 'Enviando…' : 'Enviar'}
              </Button>
            </div>
          </form>
        ) : null}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay comentarios. Sé el primero.</p>
        ) : (
          <CommentTree comments={comments} user={Boolean(user)} onReply={setReplyTo} replyTo={replyTo} />
        )}
      </section>
    </main>
  );
}

export default BlogPostDetail;
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @v2/web type-check`
Expected: no errors.

- [ ] **Step 3: Manual smoke**

Run: `pnpm --filter @v2/web dev`
Visit: `http://localhost:5173/blog` → 19 posts listed in date order.
Click any post → detail page renders title, summary, body (with proper headings, lists, blockquotes), tags, and reading minutes.
Click a non-existent slug → "Post no encontrado."
Comments section shows "Todavía no hay comentarios" (the API call may 404 silently; that's expected pre-existing state).

If body shows broken markdown (e.g. raw `**` characters), open the corresponding MDX under `v2/content/blog/` and inspect — most likely an HTML quirk we didn't cover. Add a test in `html-to-md.test.ts` reproducing the issue, fix the converter, re-run `pnpm tsx scripts/content/migrate-blog-v1-to-v2.ts` after deleting the offending file.

- [ ] **Step 4: Commit**

```bash
git add v2/apps/web/src/pages/BlogPostDetail.tsx
git commit -m "feat(web): BlogPostDetail reads post body from blog-registry"
```

---

## Phase 5 — Verify and close out

### Task 10: Full verify

**Files:** none

- [ ] **Step 1: Run the full v2 verify**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm verify`
Expected: `lint` clean, `type-check` clean, `test` all green (the 4 new test files included), `build` succeeds.

If lint fails on the migration script's `process.exit(1)` or any other rule, fix in-place. If type-check fails on test files because Vitest types aren't configured for `scripts/`, either add a tsconfig include for `scripts/content/__tests__/` or move the unit test next to where Vitest already picks it up (under `apps/web/src/lib/__tests__/`). The plan keeps `html-to-md.test.ts` next to the script intentionally — adjust tsconfig rather than move the file.

- [ ] **Step 2: Run the verifier one more time**

Run: `pnpm tsx scripts/content/verify-blog-migration.ts`
Expected: `OK — 19 MDX files validated.`

- [ ] **Step 3: Final commit (only if `pnpm verify` produced lockfile or config changes)**

If nothing new is staged, skip. Otherwise:

```bash
git add -p   # review every hunk
git commit -m "chore(v2): post-migration cleanup"
```

---

## Self-review

**Spec coverage:** The user asked for option 1 — migrate v1 blog content to v2 MDX. Phase 1+2 produces the 19 MDX files. Phase 3+4 makes them visible in the existing `Blog`/`BlogPostDetail` pages. Phase 5 enforces the v2 quality gate (`pnpm verify`). The out-of-scope items (api endpoints, real publishedAt, vlog) are listed explicitly above so the user can call them out as follow-ups.

**Placeholder scan:** Every code block is concrete. `BLOG_SOURCES` is fully enumerated (19 rows). Frontmatter shape is fixed. No "TBD" / "handle edge cases" / "similar to Task N" patterns.

**Type consistency:** `BlogSource` (script side) carries `slug, publishedAt, category, tags`. `BlogPost` (registry side) carries `slug, title, summary, type, category, publishedAt, readingMinutes, tags, body`. The script writes exactly the fields the registry reads. `findBlogPost(slug)` returns `BlogPost | undefined` and is used in `BlogPostDetail.tsx` with that same shape.

**Gotcha worth flagging during execution:** the v1 slugify helper produces ASCII-only slugs (`\w` is ASCII in JS), so titles like "La Educación" became `la-educacin` in the dict keys. The `BLOG_SOURCES` table preserves those exact strings — do not "fix" them to `la-educacion`, or `migrate-blog-v1-to-v2.ts` will print 19 MISSING errors.
