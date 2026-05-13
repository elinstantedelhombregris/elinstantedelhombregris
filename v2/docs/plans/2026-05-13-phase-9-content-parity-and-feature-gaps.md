# Phase 9 — Content parity and feature gaps — Implementation plan

**Date:** 2026-05-13
**Spec:** [`docs/specs/2026-05-13-phase-9-content-parity-and-feature-gaps-design.md`](../specs/2026-05-13-phase-9-content-parity-and-feature-gaps-design.md)
**Phase:** 9 of the v2 rebuild
**Status:** Ready to execute

Twelve tasks. Each task is sized to one commit. Each commit leaves `pnpm verify` green.

---

## Existing surface facts (used throughout the plan)

- Build/verify commands (run from `v2/`):
  - `pnpm install` — refresh deps after any package.json edit.
  - `pnpm --filter @v2/web build` — verifies registry + page lazy-loads compile.
  - `pnpm --filter @v2/api test:integration` — runs the api integration suite (132 tests baseline).
  - `pnpm --filter @v2/web test:unit` — runs the web component suite.
  - `pnpm verify` — full lint + type-check + tests + build.
- The ensayos registry lives at `apps/web/src/lib/ensayos-registry.ts` and scans `content/ensayos/*.mdx` with `import.meta.glob`. Adding files needs **no** registry edit.
- The plans registry has the same shape (`apps/web/src/lib/plans-registry.ts` → `content/planes/*.mdx`) — reference it when building IniciativaDocumento.
- `MdxContent` (`apps/web/src/components/MdxContent.tsx`) renders raw MDX. Pass the raw string; it strips frontmatter itself.
- The wouter app router lives at `apps/web/src/App.tsx`. Add new routes by following the existing `lazy()` + `<Route path=... component=... />` pattern (see Manifiesto, line ~43).
- `apps/web/src/lib/api.ts` is the cookie-first fetch helper. Use it for all api calls — never raw `fetch`.
- API integration tests follow `tests/<feature>-flows.test.ts`. Use the existing `tests/_helpers.ts` for register/login (look at any current `*-flows.test.ts` for the pattern).

---

## Build & verify commands

```bash
# Single-shot verify (use after every task):
pnpm verify

# Targeted iteration while writing:
pnpm --filter @v2/web type-check
pnpm --filter @v2/web test:unit
pnpm --filter @v2/api type-check
pnpm --filter @v2/api test:integration
```

---

## Workstream 9A — Ensayos content migration

### Task 1: Migrate 13 ensayos from `Ensayos/` to `v2/content/ensayos/`

**Goal:** `v2/content/ensayos/` goes from 1 → 14 MDX files.

- [ ] **Step 1: Write the migration script**

Create `v2/scripts/content/migrate-ensayos-v1-to-v2.ts`:

```typescript
/**
 * One-shot: read v1 markdown ensayos and emit v2 MDX with the frontmatter
 * shape consumed by apps/web/src/lib/ensayos-registry.ts.
 *
 * Run: pnpm tsx scripts/content/migrate-ensayos-v1-to-v2.ts
 *
 * Idempotent: skips slugs that already exist in v2/content/ensayos/.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const ENSAYOS_SRC = resolve(REPO_ROOT, 'Ensayos');
const ENSAYOS_OUT = resolve(V2_ROOT, 'content/ensayos');

interface SourceFile {
  series: 'primer-ciclo' | 'indagaciones';
  orderIndex: number;
  srcRelative: string;
  slug: string;
  summary: string;
  tags: string[];
}

const SOURCES: SourceFile[] = [
  // Primer ciclo
  { series: 'primer-ciclo', orderIndex: 1, srcRelative: 'presidencia, democracia y belleza/01-presidencia.md', slug: 'presidencia',
    summary: 'Por qué una sola persona sentada en una sola silla nunca pudo ni va a poder gobernar un país de 45 millones — y qué construir en su lugar.',
    tags: ['presidencia', 'arquitectura', 'republica', 'argentina'] },
  { series: 'primer-ciclo', orderIndex: 2, srcRelative: 'presidencia, democracia y belleza/02-democracia.md', slug: 'democracia',
    summary: 'La democracia tal como la heredamos no es una conversación entre iguales; es un ritual cada cuatro años que tapa qué decisiones nunca se nos consultaron.',
    tags: ['democracia', 'representacion', 'republica'] },
  { series: 'primer-ciclo', orderIndex: 3, srcRelative: 'presidencia, democracia y belleza/03-poder.md', slug: 'poder',
    summary: 'La palabra poder fue el caballo de Troya: la usamos como sustantivo cuando en realidad es siempre un verbo, una relación viva entre los que actúan.',
    tags: ['poder', 'lenguaje', 'politica'] },
  { series: 'primer-ciclo', orderIndex: 4, srcRelative: 'presidencia, democracia y belleza/04-arquitectura.md', slug: 'arquitectura',
    summary: 'Si la presidencia es una idea estúpida y el poder no es un objeto, ¿qué arquitectura cívica nos queda para sostener una república sin trono?',
    tags: ['arquitectura', 'infraestructura', 'autogobierno'] },
  { series: 'primer-ciclo', orderIndex: 5, srcRelative: 'presidencia, democracia y belleza/05-soberania.md', slug: 'soberania',
    summary: 'Cada vez que tu identidad, tu plata, tu memoria y tu deliberación viven en infraestructuras que no son tuyas, perdés soberanía aunque nadie haya cruzado la frontera.',
    tags: ['soberania', 'infraestructura', 'datos'] },
  // belleza is already migrated as 06-belleza.mdx — skip
  { series: 'primer-ciclo', orderIndex: 7, srcRelative: 'presidencia, democracia y belleza/07-carta.md', slug: 'carta-al-nieto',
    summary: 'Una carta a quien aún no nació, explicando qué hicimos con el país que le vamos a dejar — y por qué construir importa más que ganar elecciones.',
    tags: ['carta', 'futuro', 'legado'] },
  // Indagaciones
  { series: 'indagaciones', orderIndex: 1, srcRelative: 'indagaciones/01-fabrica-obediencia.md', slug: 'fabrica-obediencia',
    summary: 'Sobre lo que la escuela argentina enseña sin nombrarlo: obedecer, esperar permiso, repetir lo que ya está dicho.',
    tags: ['educacion', 'obediencia', 'autoridad'] },
  { series: 'indagaciones', orderIndex: 2, srcRelative: 'indagaciones/02-caudillo-camino-sin-camino.md', slug: 'caudillo-camino-sin-camino',
    summary: 'Sobre por qué seguimos buscando un líder que nos salve, y qué pasaría si dejáramos de buscarlo.',
    tags: ['liderazgo', 'caudillismo', 'argentina'] },
  { series: 'indagaciones', orderIndex: 3, srcRelative: 'indagaciones/03-miedo-y-devenir.md', slug: 'miedo-y-devenir',
    summary: 'Sobre la economía emocional de un país que vive entre el miedo a perder y la nostalgia de no haber sido — y cómo sale del laberinto.',
    tags: ['miedo', 'emocion', 'argentina'] },
  { series: 'indagaciones', orderIndex: 4, srcRelative: 'indagaciones/04-libertad-de-lo-conocido.md', slug: 'libertad-de-lo-conocido',
    summary: 'Sobre cómo soltar la Argentina heredada para ver la real, sin el ruido de las identidades prestadas.',
    tags: ['libertad', 'identidad', 'desapego'] },
  { series: 'indagaciones', orderIndex: 5, srcRelative: 'indagaciones/05-conocerse-sin-espejo.md', slug: 'conocerse-sin-espejo',
    summary: 'Sobre el autoconocimiento como acto político: una república sólo es adulta si sus ciudadanos también lo son.',
    tags: ['autoconocimiento', 'politica', 'madurez'] },
  { series: 'indagaciones', orderIndex: 6, srcRelative: 'indagaciones/06-amor-sin-apego.md', slug: 'amor-sin-apego',
    summary: 'Sobre la militancia como dependencia, la lealtad sin propiedad, y el amor que no necesita encadenar para sostenerse.',
    tags: ['amor', 'militancia', 'lealtad'] },
  { series: 'indagaciones', orderIndex: 7, srcRelative: 'indagaciones/07-sensibilidad-como-infraestructura.md', slug: 'sensibilidad-como-infraestructura',
    summary: 'Sobre la naturaleza, la belleza y el silencio como tecnologías cívicas — tan reales como una ruta o un tribunal.',
    tags: ['sensibilidad', 'belleza', 'silencio'] },
];

const PUBLISHED_AT_PRIMER = '2026-04-15T00:00:00Z';
const PUBLISHED_AT_INDAG = '2026-04-29T00:00:00Z';

function readSource(srcRelative: string): { title: string; subtitle: string; body: string } {
  const raw = readFileSync(resolve(ENSAYOS_SRC, srcRelative), 'utf-8');
  const lines = raw.split('\n');

  // Find first '# Title'
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i >= lines.length || !lines[i].startsWith('# ')) {
    throw new Error(`No H1 title found in ${srcRelative}`);
  }
  const title = lines[i].replace(/^# /, '').trim();
  i++;

  // Skip blanks
  while (i < lines.length && lines[i].trim() === '') i++;

  // Optional subtitle (## but NOT '## I.'/'## II.' …)
  let subtitle = '';
  if (i < lines.length && lines[i].startsWith('## ')) {
    const next = lines[i].replace(/^## /, '').trim();
    if (!/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s/.test(next)) {
      subtitle = next;
      i++;
      while (i < lines.length && lines[i].trim() === '') i++;
    }
  }

  const body = lines.slice(i).join('\n').trimStart();
  return { title, subtitle, body };
}

function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

function yamlEscape(s: string): string {
  // Single-quote-wrap if contains : or # or starts with - or has weird chars
  if (/[:#]|^\s*-/.test(s) || /^['"]/.test(s)) {
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

function buildMdx(src: SourceFile): string {
  const { title, subtitle, body } = readSource(src.srcRelative);
  const readingMinutes = estimateReadingMinutes(body);
  const publishedAt = src.series === 'primer-ciclo' ? PUBLISHED_AT_PRIMER : PUBLISHED_AT_INDAG;
  const tagsBlock = src.tags.map((t) => `  - ${t}`).join('\n');

  return `---
slug: ${src.slug}
title: ${yamlEscape(title)}
subtitle: ${yamlEscape(subtitle)}
summary: ${yamlEscape(src.summary)}
series: ${src.series}
orderIndex: ${src.orderIndex}
publishedAt: ${publishedAt}
readingMinutes: ${readingMinutes}
tags:
${tagsBlock}
draft: false
---

${body}`;
}

function main(): void {
  let written = 0;
  let skipped = 0;
  for (const src of SOURCES) {
    const outPath = resolve(ENSAYOS_OUT, `${src.slug}.mdx`);
    if (existsSync(outPath)) {
      console.log(`skip   ${src.slug} (already exists)`);
      skipped++;
      continue;
    }
    const mdx = buildMdx(src);
    writeFileSync(outPath, mdx, 'utf-8');
    console.log(`wrote  ${src.slug}.mdx`);
    written++;
  }
  console.log(`\nDone: ${written} written, ${skipped} skipped.`);
}

main();
```

- [ ] **Step 2: Run the migration**

```bash
cd v2
pnpm tsx scripts/content/migrate-ensayos-v1-to-v2.ts
```

Expected: `13 written, 1 skipped` (belleza.mdx already exists, but its slug is `belleza` and won't collide — actually it does because the existing file is `06-belleza.mdx` and the script writes `belleza.mdx`; the file at `06-belleza.mdx` will not collide with the new `belleza.mdx`. Resolve by renaming the existing file to `belleza.mdx` before running, OR removing the existing file and letting the script write a fresh one — its frontmatter already has `slug: belleza` so renaming preserves the slug).

Do this first:

```bash
mv v2/content/ensayos/06-belleza.mdx v2/content/ensayos/belleza.mdx
```

Then run the script. The output then is `13 written, 0 skipped` (since `belleza.mdx` is not in SOURCES). After this, the migration script is no longer needed but committed for audit trail.

- [ ] **Step 3: Verify**

```bash
ls v2/content/ensayos/*.mdx | wc -l    # expect: 14
pnpm --filter @v2/web build
```

Build must succeed. Bundle should include each ensayo body in `ensayos-registry-*.js`.

Open `http://localhost:5173/ensayos` (after `pnpm dev`) and verify:
- 14 entries, grouped: 7 primer-ciclo + 7 indagaciones
- Each ordered correctly (1..7 within each series)
- Click into one → body renders with H2 sections intact

- [ ] **Step 4: Commit**

```bash
git add v2/content/ensayos/ v2/scripts/content/migrate-ensayos-v1-to-v2.ts
git commit -m "feat(content): migrate 13 ensayos to v2 — primer-ciclo + indagaciones"
```

Commit body: brief mention of slug list. Push after Task 12.

---

## Workstream 9B — Iniciativas client pages

### Task 2: `useIniciativa` hook + `IniciativaDetail` page

- [ ] **Step 1: Add queries**

Create `apps/web/src/queries/iniciativas.ts`:

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '~/lib/api';

export interface Iniciativa {
  id: number;
  slug: string;
  title: string;
  summary: string;
  kind: 'plan' | 'mission' | 'community' | 'territorial';
  planCode: string | null;
  bodyMarkdown: string | null;
  coverImageUrl: string | null;
  status: string;
  memberCount: number;
  createdAt: string;
}

export function useIniciativa(slug: string) {
  return useQuery({
    queryKey: ['iniciativa', slug],
    queryFn: async () => {
      const res = await api.get<{ data: { iniciativa: Iniciativa } }>(`/api/iniciativas/${slug}`);
      return res.data.iniciativa;
    },
  });
}

export function useJoinIniciativa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.post(`/api/iniciativas/${id}/join`, {}),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ['iniciativa'] });
      void qc.invalidateQueries({ queryKey: ['iniciativa-membership', id] });
    },
  });
}

export function useLeaveIniciativa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => api.post(`/api/iniciativas/${id}/leave`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['iniciativa'] });
    },
  });
}
```

> Inspect `apps/web/src/lib/api.ts` first — if the method names differ (`api.get` / `api.post` vs `apiRequest('GET', …)`), adjust to match. The pattern from Phase 8 queries (`apps/web/src/queries/gamification.ts`) is canonical.

- [ ] **Step 2: Build the detail page**

Create `apps/web/src/pages/IniciativaDetail.tsx`:

```tsx
import { Link, Redirect, useRoute } from 'wouter';
import { useIniciativa, useJoinIniciativa, useLeaveIniciativa } from '~/queries/iniciativas';
import { Button } from '~/components/ui/button';

export function IniciativaDetail() {
  const [, params] = useRoute<{ slug: string }>('/iniciativas/:slug');
  const slug = params?.slug ?? '';
  const { data, isLoading, isError } = useIniciativa(slug);
  const join = useJoinIniciativa();
  const leave = useLeaveIniciativa();

  if (isLoading) {
    return <main className="container mx-auto max-w-3xl px-4 py-20">Cargando…</main>;
  }
  if (isError || !data) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-20">
        <p>No encontramos esta iniciativa.</p>
        <Link href="/comunidad" className="text-iris-violet underline">
          Volver a la comunidad
        </Link>
      </main>
    );
  }

  if (data.kind === 'plan') {
    return <Redirect to={`/planes/${data.slug}`} />;
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Iniciativa · {data.kind}
        </p>
        <h1 className="font-serif text-3xl font-semibold md:text-4xl">{data.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{data.summary}</p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
        <div>
          <p className="text-muted-foreground">Estado</p>
          <p className="font-medium">{data.status}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Miembros</p>
          <p className="font-medium">{data.memberCount}</p>
        </div>
      </section>

      <div className="mb-12 flex flex-wrap gap-3">
        <Button onClick={() => join.mutate(data.id)} disabled={join.isPending}>
          Unirme
        </Button>
        <Button variant="outline" onClick={() => leave.mutate(data.id)} disabled={leave.isPending}>
          Salir
        </Button>
        {data.bodyMarkdown ? (
          <Link href={`/iniciativas/${data.slug}/documento`}>
            <Button variant="ghost">Ver documento completo</Button>
          </Link>
        ) : null}
      </div>
    </main>
  );
}

export default IniciativaDetail;
```

- [ ] **Step 3: Component test**

Create `apps/web/src/pages/__tests__/IniciativaDetail.test.tsx` (mirror the existing `HeaderSection.test.tsx` pattern from Phase 8):

```tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';

vi.mock('~/queries/iniciativas', () => ({
  useIniciativa: () => ({
    data: {
      id: 1,
      slug: 'mejor-barrio',
      title: 'Mejor barrio',
      summary: 'Iniciativa de prueba',
      kind: 'community',
      planCode: null,
      bodyMarkdown: null,
      coverImageUrl: null,
      status: 'open',
      memberCount: 3,
      createdAt: '2026-05-13T00:00:00Z',
    },
    isLoading: false,
    isError: false,
  }),
  useJoinIniciativa: () => ({ mutate: vi.fn(), isPending: false }),
  useLeaveIniciativa: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('wouter', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wouter')>();
  return {
    ...actual,
    useRoute: () => [true, { slug: 'mejor-barrio' }],
    Redirect: () => null,
    Link: ({ children, ...rest }: { children: React.ReactNode } & Record<string, unknown>) => <a {...rest}>{children}</a>,
  };
});

import { IniciativaDetail } from '../IniciativaDetail';

describe('IniciativaDetail', () => {
  it('renders title, summary and member count', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <IniciativaDetail />
      </QueryClientProvider>,
    );
    expect(screen.getByText('Mejor barrio')).toBeInTheDocument();
    expect(screen.getByText('Iniciativa de prueba')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Verify**

```bash
pnpm --filter @v2/web type-check
pnpm --filter @v2/web test:unit
```

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(web): IniciativaDetail page + useIniciativa hooks"
```

### Task 3: `IniciativaDocumento` page

- [ ] **Step 1: Build the page**

Create `apps/web/src/pages/IniciativaDocumento.tsx`:

```tsx
import { Link, useRoute } from 'wouter';
import { MdxContent } from '~/components/MdxContent';
import { useIniciativa } from '~/queries/iniciativas';

export function IniciativaDocumento() {
  const [, params] = useRoute<{ slug: string }>('/iniciativas/:slug/documento');
  const slug = params?.slug ?? '';
  const { data, isLoading, isError } = useIniciativa(slug);

  if (isLoading) {
    return <main className="container mx-auto max-w-3xl px-4 py-20">Cargando…</main>;
  }
  if (isError || !data || !data.bodyMarkdown) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-20">
        <p>No hay documento para esta iniciativa.</p>
        <Link href={`/iniciativas/${slug}`} className="text-iris-violet underline">
          Volver a la iniciativa
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <Link href={`/iniciativas/${data.slug}`} className="text-sm text-iris-violet underline">
          ← Volver a {data.title}
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-semibold md:text-4xl">{data.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{data.summary}</p>
      </header>
      <article className="prose prose-invert max-w-none">
        <MdxContent raw={data.bodyMarkdown} />
      </article>
    </main>
  );
}

export default IniciativaDocumento;
```

- [ ] **Step 2: Verify + commit**

```bash
pnpm --filter @v2/web type-check
git add apps/web/src/pages/IniciativaDocumento.tsx
git commit -m "feat(web): IniciativaDocumento page — long-form view"
```

### Task 4: Wire iniciativa routes in App.tsx

- [ ] **Step 1: Register lazy imports + routes**

Edit `apps/web/src/App.tsx`. Following the existing pattern:

```tsx
const IniciativaDetail = lazy(async () => {
  const m = await import('~/pages/IniciativaDetail');
  return { default: m.IniciativaDetail };
});
const IniciativaDocumento = lazy(async () => {
  const m = await import('~/pages/IniciativaDocumento');
  return { default: m.IniciativaDocumento };
});
```

Add inside the `<Switch>` block:

```tsx
<Route path="/iniciativas/:slug/documento" component={IniciativaDocumento} />
<Route path="/iniciativas/:slug" component={IniciativaDetail} />
```

Order matters in wouter — the `/documento` route must come before the bare `:slug` route, or the bare route swallows it.

- [ ] **Step 2: Verify + commit**

```bash
pnpm verify
git commit -m "feat(web): mount /iniciativas/:slug{,/documento} routes"
```

---

## Workstream 9C — Pulso / Propuesta detail pages

### Task 5: API — `GET /api/pulso/:id` endpoint + test

- [ ] **Step 1: Add the route**

Edit `apps/api/src/features/pulso/routes.ts`. Add after the existing `GET /pulso` handler (~line 73):

```typescript
router.get('/pulso/:id', optionalAuthenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'id debe ser entero positivo' } });
    }
    const signal = await pulsoService.getSignalById(id);
    if (!signal) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Pulso no encontrado' } });
    }
    const isOwner = req.user && req.user.id === signal.userId;
    const payload = {
      ...signal,
      userId: isOwner ? signal.userId : null,
    };
    return res.json({ data: { signal: payload } });
  } catch (err) {
    return next(err);
  }
});
```

In `apps/api/src/features/pulso/service.ts`, add:

```typescript
export async function getSignalById(id: number) {
  return pulsoRepository.getSignalById(id);
}
```

In `packages/db/src/repositories/pulso.ts`, add:

```typescript
async getSignalById(id: number) {
  const [row] = await db.select().from(pulseSignals).where(eq(pulseSignals.id, id)).limit(1);
  return row ?? null;
}
```

- [ ] **Step 2: Integration test**

In `apps/api/tests/pulso-flows.test.ts`, append inside the existing `describe('Pulso + propuestas flows', …)`:

```typescript
describe('GET /api/pulso/:id', () => {
  it('returns the signal by id', async () => {
    const owner = await registerAndLogin();
    const created = await owner.client.post('/api/pulso', {
      text: 'Falta agua en mi barrio',
      provincia: 'Buenos Aires',
    });
    const id = created.data.signal.id;

    const anon = await anonClient();
    const res = await anon.get(`/api/pulso/${id}`);
    expect(res.status).toBe(200);
    expect(res.data.signal.id).toBe(id);
    expect(res.data.signal.userId).toBe(null);   // anonymous viewer → redacted
  });

  it('returns 404 on missing id', async () => {
    const anon = await anonClient();
    const res = await anon.get('/api/pulso/999999');
    expect(res.status).toBe(404);
  });

  it('returns 400 on non-numeric id', async () => {
    const anon = await anonClient();
    const res = await anon.get('/api/pulso/abc');
    expect(res.status).toBe(400);
  });
});
```

> Tweak the helper names (`registerAndLogin`, `anonClient`) to match what's already in `tests/_helpers.ts`.

- [ ] **Step 3: Verify + commit**

```bash
pnpm --filter @v2/api test:integration -- pulso-flows
git commit -m "feat(api): GET /api/pulso/:id with owner-redaction"
```

### Task 6: Web queries — pulso, propuesta, vote

- [ ] **Step 1: Add queries**

Create `apps/web/src/queries/mandato.ts`:

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '~/lib/api';

export interface PulseSignal {
  id: number;
  text: string;
  provincia: string | null;
  categoria: string | null;
  urgencia: string | null;
  sentimiento: string | null;
  userId: number | null;
  createdAt: string;
}

export interface Propuesta {
  id: number;
  title: string;
  body: string;
  status: string;
  voteCount: number;
  createdAt: string;
}

export function usePulsoById(id: number) {
  return useQuery({
    queryKey: ['pulso', id],
    queryFn: async () => {
      const res = await api.get<{ data: { signal: PulseSignal } }>(`/api/pulso/${id}`);
      return res.data.signal;
    },
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function usePropuestaById(id: number) {
  return useQuery({
    queryKey: ['propuesta', id],
    queryFn: async () => {
      const res = await api.get<{ data: { propuesta: Propuesta } }>(`/api/propuestas/${id}`);
      return res.data.propuesta;
    },
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useVotePropuesta(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (value: 1 | -1) => api.post(`/api/propuestas/${id}/vote`, { value }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['propuesta', id] });
    },
  });
}
```

- [ ] **Step 2: Verify + commit**

```bash
pnpm --filter @v2/web type-check
git commit -m "feat(web): pulso/propuesta query hooks"
```

### Task 7: `PulsoDetail` page

- [ ] **Step 1: Build it**

Create `apps/web/src/pages/PulsoDetail.tsx`:

```tsx
import { Link, useRoute } from 'wouter';
import { usePulsoById } from '~/queries/mandato';

export function PulsoDetail() {
  const [, params] = useRoute<{ id: string }>('/mandato-vivo/pulso/:id');
  const id = Number(params?.id ?? 0);
  const { data, isLoading, isError } = usePulsoById(id);

  if (isLoading) {
    return <main className="container mx-auto max-w-3xl px-4 py-20">Cargando…</main>;
  }
  if (isError || !data) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-20">
        <p>No encontramos este pulso.</p>
        <Link href="/mandato-vivo" className="text-iris-violet underline">
          Volver al Mandato Vivo
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Pulso #{data.id}</p>
        <h1 className="font-serif text-2xl font-semibold md:text-3xl">{data.text}</h1>
      </header>
      <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
        <div>
          <dt className="text-muted-foreground">Provincia</dt>
          <dd className="font-medium">{data.provincia ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Categoría</dt>
          <dd className="font-medium">{data.categoria ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Urgencia</dt>
          <dd className="font-medium">{data.urgencia ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Sentimiento</dt>
          <dd className="font-medium">{data.sentimiento ?? '—'}</dd>
        </div>
      </dl>
    </main>
  );
}

export default PulsoDetail;
```

- [ ] **Step 2: Verify + commit**

```bash
pnpm --filter @v2/web type-check
git commit -m "feat(web): /mandato-vivo/pulso/:id PulsoDetail page"
```

### Task 8: `PropuestaDetail` page (with vote)

- [ ] **Step 1: Build it**

Create `apps/web/src/pages/PropuestaDetail.tsx`:

```tsx
import { Link, useRoute } from 'wouter';
import { usePropuestaById, useVotePropuesta } from '~/queries/mandato';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/hooks/useAuth';

export function PropuestaDetail() {
  const [, params] = useRoute<{ id: string }>('/mandato-vivo/propuesta/:id');
  const id = Number(params?.id ?? 0);
  const { data, isLoading, isError } = usePropuestaById(id);
  const vote = useVotePropuesta(id);
  const { user } = useAuth();

  if (isLoading) {
    return <main className="container mx-auto max-w-3xl px-4 py-20">Cargando…</main>;
  }
  if (isError || !data) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-20">
        <p>No encontramos esta propuesta.</p>
        <Link href="/mandato-vivo" className="text-iris-violet underline">
          Volver al Mandato Vivo
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Propuesta #{data.id} · {data.status}
        </p>
        <h1 className="font-serif text-3xl font-semibold md:text-4xl">{data.title}</h1>
        <p className="mt-4 whitespace-pre-line text-lg text-muted-foreground">{data.body}</p>
      </header>

      <section className="mb-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-muted-foreground">Votos: <span className="font-medium text-foreground">{data.voteCount}</span></p>
        <div className="ml-auto flex gap-2">
          <Button onClick={() => vote.mutate(1)} disabled={!user || vote.isPending}>+1</Button>
          <Button variant="outline" onClick={() => vote.mutate(-1)} disabled={!user || vote.isPending}>-1</Button>
        </div>
      </section>
      {!user ? (
        <p className="text-sm text-muted-foreground">
          <Link href="/ingresar" className="text-iris-violet underline">Ingresá</Link> para votar.
        </p>
      ) : null}
    </main>
  );
}

export default PropuestaDetail;
```

> If `useAuth` exposes user state differently, adapt the destructure. Check `apps/web/src/hooks/useAuth.ts` first.

- [ ] **Step 2: Component test**

Create `apps/web/src/pages/__tests__/PropuestaDetail.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';

vi.mock('~/queries/mandato', () => ({
  usePropuestaById: () => ({
    data: { id: 1, title: 'Más agua', body: 'Texto', status: 'open', voteCount: 3, createdAt: '2026-05-13' },
    isLoading: false,
    isError: false,
  }),
  useVotePropuesta: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('~/hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('wouter', async (orig) => {
  const actual = await orig<typeof import('wouter')>();
  return { ...actual, useRoute: () => [true, { id: '1' }], Link: ({ children, ...rest }: any) => <a {...rest}>{children}</a> };
});

import { PropuestaDetail } from '../PropuestaDetail';

describe('PropuestaDetail', () => {
  it('disables vote buttons when logged out', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <PropuestaDetail />
      </QueryClientProvider>,
    );
    expect(screen.getByRole('button', { name: '+1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '-1' })).toBeDisabled();
    expect(screen.getByText(/Ingresá/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Verify + commit**

```bash
pnpm --filter @v2/web test:unit
git commit -m "feat(web): /mandato-vivo/propuesta/:id PropuestaDetail page + vote"
```

### Task 9: Wire mandato detail routes in App.tsx

- [ ] **Step 1: Register lazy imports + routes**

```tsx
const PulsoDetail = lazy(async () => {
  const m = await import('~/pages/PulsoDetail');
  return { default: m.PulsoDetail };
});
const PropuestaDetail = lazy(async () => {
  const m = await import('~/pages/PropuestaDetail');
  return { default: m.PropuestaDetail };
});
```

In `<Switch>` (before the bare `/mandato-vivo` route):

```tsx
<Route path="/mandato-vivo/pulso/:id" component={PulsoDetail} />
<Route path="/mandato-vivo/propuesta/:id" component={PropuestaDetail} />
```

- [ ] **Step 2: Verify + commit**

```bash
pnpm verify
git commit -m "feat(web): mount /mandato-vivo/{pulso,propuesta}/:id routes"
```

---

## Workstream 9D — Static / informational pages

### Task 10: `/bienvenida` Bienvenida onboarding page

- [ ] **Step 1: Build it**

Create `apps/web/src/pages/Bienvenida.tsx`:

```tsx
import { Link } from 'wouter';
import { Button } from '~/components/ui/button';

export function Bienvenida() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Bienvenida</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          Bienvenido a <span className="gradient-text">¡BASTA!</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Acá empieza. Tres pasos para entender de qué se trata y qué podés hacer hoy.
        </p>
      </header>

      <ol className="space-y-8">
        <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-iris-violet">Paso 1</p>
          <h2 className="font-serif text-2xl">¿Qué es ¡BASTA!?</h2>
          <p className="mt-3 text-muted-foreground">
            Un marco de gobernanza popular: 22 PLANes que diseña la gente, ejecuta el Estado, y nadie administra como dueño.
            Leé el <Link href="/manifiesto" className="text-iris-violet underline">manifiesto</Link> para arrancar.
          </p>
        </li>
        <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-iris-violet">Paso 2</p>
          <h2 className="font-serif text-2xl">Auto-evaluá tu posición cívica</h2>
          <p className="mt-3 text-muted-foreground">
            Un cuestionario de 8 minutos te ubica entre observador, participante, organizador y arquitecto.
            Después podés volver a mirar cómo evolucionás.
          </p>
          <Link href="/auto-evaluacion-civica">
            <Button className="mt-4">Empezar la auto-evaluación</Button>
          </Link>
        </li>
        <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-iris-violet">Paso 3</p>
          <h2 className="font-serif text-2xl">Empezá por una área de tu vida</h2>
          <p className="mt-3 text-muted-foreground">
            Trabajar en uno mismo es trabajar en la república. Las 12 áreas te muestran dónde estás y qué podés mover.
          </p>
          <Link href="/areas">
            <Button variant="outline" className="mt-4">Ver áreas de vida</Button>
          </Link>
        </li>
      </ol>
    </main>
  );
}

export default Bienvenida;
```

- [ ] **Step 2: Register route**

`apps/web/src/App.tsx`:

```tsx
const Bienvenida = lazy(async () => {
  const m = await import('~/pages/Bienvenida');
  return { default: m.Bienvenida };
});
```

```tsx
<Route path="/bienvenida" component={Bienvenida} />
```

- [ ] **Step 3: Verify + commit**

```bash
pnpm --filter @v2/web build
git commit -m "feat(web): /bienvenida onboarding page"
```

### Task 11: `/apoyo` ApoyaAlMovimiento page

- [ ] **Step 1: Build it**

Create `apps/web/src/pages/ApoyaAlMovimiento.tsx`:

```tsx
import { Link } from 'wouter';
import { Button } from '~/components/ui/button';

const CHANNELS = [
  {
    title: 'Compartí',
    body: 'Hacé llegar el manifiesto y los ensayos a tres personas que te importan. La distribución no es accesoria — es el trabajo.',
    cta: 'Ir al manifiesto',
    href: '/manifiesto',
  },
  {
    title: 'Sumá tu pulso',
    body: 'Cada señal que registrás alimenta el mapa del Mandato Vivo. Lo que tu calle, tu escuela y tu hospital necesitan no aparece si no lo nombrás.',
    cta: 'Registrar un pulso',
    href: '/mandato-vivo',
  },
  {
    title: 'Aportá contenido',
    body: 'Si escribís, dibujás, programás o filmás: hay lugar. Mandanos un ensayo, una idea o un PR a la plataforma.',
    cta: 'Ver ensayos',
    href: '/ensayos',
  },
] as const;

export function ApoyaAlMovimiento() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-20">
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Apoyá al movimiento</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          Tres formas concretas de <span className="gradient-text">empujar</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Sin plata, sin permiso, sin esperar a que alguien autorice. Lo que hagas hoy mueve el dial.
        </p>
      </header>

      <div className="space-y-6">
        {CHANNELS.map((c) => (
          <article key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-serif text-2xl">{c.title}</h2>
            <p className="mt-3 text-muted-foreground">{c.body}</p>
            <Link href={c.href}>
              <Button variant="outline" className="mt-4">{c.cta}</Button>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export default ApoyaAlMovimiento;
```

- [ ] **Step 2: Register route**

```tsx
const ApoyaAlMovimiento = lazy(async () => {
  const m = await import('~/pages/ApoyaAlMovimiento');
  return { default: m.ApoyaAlMovimiento };
});
```

```tsx
<Route path="/apoyo" component={ApoyaAlMovimiento} />
```

- [ ] **Step 3: Link from footer**

Open `apps/web/src/components/Footer.tsx` (or wherever the global footer lives — check `Header.tsx` neighbors). Add a link:

```tsx
<Link href="/apoyo" className="text-muted-foreground hover:text-foreground">Apoyá al movimiento</Link>
```

If there is no footer yet, skip this step and add it as part of Task 12 along with the privacy link.

- [ ] **Step 4: Verify + commit**

```bash
pnpm --filter @v2/web build
git commit -m "feat(web): /apoyo ApoyaAlMovimiento page"
```

### Task 12: `/politica-privacidad` PoliticaPrivacidad page (MDX)

- [ ] **Step 1: Author the MDX**

Create `v2/content/legal/privacidad.mdx`:

```mdx
---
slug: privacidad
title: Política de Privacidad
updatedAt: 2026-05-13
---

## ¿Qué datos guardamos?

Cuando creás una cuenta en El Instante del Hombre Gris, guardamos tu correo, una contraseña hasheada con bcrypt (nadie en el equipo la puede leer), y los datos que vos cargás a la plataforma — auto-evaluación cívica, pulsos, propuestas, áreas de vida.

Para que la sesión funcione usamos cookies httpOnly: el navegador las manda con cada pedido pero JavaScript no las puede leer. No usamos cookies de terceros, ni pixels de Facebook, ni Google Analytics.

## ¿Para qué los usamos?

Para que la plataforma haga lo que prometemos: mostrarte tu progreso, ubicar tus pulsos en el mapa territorial, agregarte a la clasificación cívica, alimentar el Mandato Vivo. Nada de tus datos personales se vende, se comparte con terceros, ni se procesa para fines publicitarios.

## ¿Quién los puede ver?

Tu correo y datos privados los ve el equipo de desarrollo cuando es indispensable para arreglar bugs. Tus pulsos pueden hacerse visibles agregados en el mapa público; tu nombre aparece sólo si elegís hacerlo visible en tu perfil.

## ¿Cómo los borrás?

Mandando un mail a `privacidad@elinstantedelhombregris.org` con el asunto "Borrame". Borramos tu cuenta y los datos personales asociados en 30 días. Los pulsos agregados anónimamente quedan; el dato individual no.

## ¿Qué cambió?

Esta política reemplaza la anterior versión 1 del 2026-03-01. Cambios principales:
- Migración de JWT en localStorage a cookies httpOnly + CSRF (más seguro).
- Eliminación de cualquier rastro de scripts de terceros.

Si tenés preguntas, escribinos.
```

- [ ] **Step 2: Build the page**

Create `apps/web/src/pages/PoliticaPrivacidad.tsx`:

```tsx
import { MdxContent } from '~/components/MdxContent';
import privacidadRaw from '../../../../content/legal/privacidad.mdx?raw';

export function PoliticaPrivacidad() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-20">
      <header className="mb-10">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Legal</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">Política de Privacidad</h1>
      </header>
      <article className="prose prose-invert max-w-none">
        <MdxContent raw={privacidadRaw} />
      </article>
    </main>
  );
}

export default PoliticaPrivacidad;
```

- [ ] **Step 3: Register route + footer links**

`apps/web/src/App.tsx`:

```tsx
const PoliticaPrivacidad = lazy(async () => {
  const m = await import('~/pages/PoliticaPrivacidad');
  return { default: m.PoliticaPrivacidad };
});
```

```tsx
<Route path="/politica-privacidad" component={PoliticaPrivacidad} />
```

If a `Footer` component exists, add:

```tsx
<Link href="/politica-privacidad" className="text-muted-foreground hover:text-foreground">Privacidad</Link>
<Link href="/apoyo" className="text-muted-foreground hover:text-foreground">Apoyar</Link>
```

- [ ] **Step 4: Final verify**

```bash
pnpm verify
```

All of: lint, type-check, web unit tests, api integration tests (≥ 135 now), web build, api build — must pass.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(web): /politica-privacidad MDX page + footer links"
```

---

## Phase 9 — Done definition

After Task 12 lands and CI is green on `main`:

- `v2/content/ensayos/` contains 14 MDX files; both series render at `/ensayos` and each one resolves via `/ensayos/:slug`.
- `/iniciativas/:slug` and `/iniciativas/:slug/documento` mounted, served, and at least one component test asserts their rendering.
- `/mandato-vivo/pulso/:id` and `/mandato-vivo/propuesta/:id` mounted. `GET /api/pulso/:id` shipped with 3 integration tests (200, 404, 400). The propuesta page disables voting for anonymous users.
- `/bienvenida`, `/apoyo`, `/politica-privacidad` mounted. Privacy + Apoyo linked from the global footer if present.
- Integration test count rises from 132 → ≥ 135.
- Web unit test count rises from 17 → ≥ 19 (1 IniciativaDetail + 1 PropuestaDetail).
- All 12 commits pushed to `main`, every commit leaves `pnpm verify` green.

---

## Self-review notes (verified before plan was finalized)

- **Source files exist**: 14 source markdown files confirmed at `Ensayos/presidencia, democracia y belleza/` and `Ensayos/indagaciones/` (run `ls Ensayos/presidencia*/` to verify before Task 1).
- **Frontmatter contract verified**: `apps/web/src/lib/ensayos-registry.ts` parses `slug, title, subtitle, summary, series, orderIndex, publishedAt, readingMinutes` — the migration emits all of them.
- **API shape verified**: `iniciativas` exposes `GET /:slug` + join/leave; `propuestas` exposes `GET /:id` + `POST /:id/vote`; only `GET /api/pulso/:id` is new.
- **Route ordering**: in wouter, `/iniciativas/:slug/documento` and `/mandato-vivo/pulso/:id` must be declared **before** the generic siblings to avoid being swallowed.
- **Tests sized correctly**: 3 new integration tests + 2 new component tests is consistent with Phase 8's per-task test discipline.
- **No backwards-compat shims**: there are no existing users of these routes in v2 — we're adding net new surface. No `// removed` comments, no fallback paths.
- **No god-files grown**: each new page lives in its own file under 250 LOC; no edits to `routes.ts` exceeding 50 lines.
- **Hand-written summaries**: the 13 ensayo summaries are not auto-generated; each was written from the essay's actual argument (see spec).
- **Defer list is honest**: course system, public profile, community CRUD, mandato territorial pages and admin feedback are explicitly deferred to Phase 10 — not left as silent gaps.
