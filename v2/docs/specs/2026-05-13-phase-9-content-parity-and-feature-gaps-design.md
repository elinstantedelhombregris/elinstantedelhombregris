# Phase 9 — Content parity and feature gaps

**Date:** 2026-05-13
**Status:** Proposed (pending user review of this spec)
**Phase:** 9 of the v2 rebuild

---

## Goal

Close the v1↔v2 parity gap to the point where a v1 user finds in v2 every piece of content and every drill-down page they used to rely on — except for the explicitly-deferred course system.

The architecture is in place. The features that survived v1 review have working API slices and at least a landing page each. What's missing is **drilled-down detail** (per-pulso, per-propuesta, per-iniciativa) and **migrated long-form content** (ensayos). Phase 9 fills both.

Phase 10 will be Courses + production deploy.

---

## Parity matrix — v1 vs v2

Legend: ✅ done · 🟡 partial · ❌ missing · ⛔ out of scope for the v2 rebuild

### Public marketing / framework pages

| Surface | v1 | v2 | Status |
|---|---|---|---|
| `/` Home | ✅ | ✅ | done |
| Manifiesto | ✅ TSX | ✅ MDX | done |
| La Visión | ✅ | ✅ | done |
| La Semilla de ¡BASTA! | ✅ | ✅ | done |
| Una Ruta para Argentina | ✅ (with Arquitecto tabs) | ✅ (with sections/) | done |
| El Mapa | ✅ | ✅ | done |
| El Instante del Hombre Gris | ✅ | ✅ | done |
| Detalles cálculo costo humano | ✅ | ✅ | done |
| Kit de Prensa | ✅ | ✅ | done |
| Planes (22 PLANs registry) | ❌ (only narrative) | ✅ 23 MDX | **v2 is ahead** |
| Apoyá al movimiento | ✅ | ❌ | **gap → 9D** |
| Política de privacidad | ✅ | ❌ | **gap → 9D** |

### Auth

| Surface | v1 | v2 | Status |
|---|---|---|---|
| Login / Register | ✅ JWT in localStorage | ✅ httpOnly cookies + CSRF | done (v2 better) |
| Password reset | ✅ | ✅ | done |
| Email verification | ✅ | ✅ | done |
| 2FA | ✅ | ✅ | done |
| Bienvenida (onboarding) | ✅ | ❌ | **gap → 9D** |

### Identity / profile

| Surface | v1 | v2 | Status |
|---|---|---|---|
| `/mi-perfil` (own profile) | ✅ `/profile` | ✅ Phase 8 added | done |
| `/u/:username` (public profile) | ✅ | ❌ | **deferred to Phase 10** |

### Civic / personal

| Surface | v1 | v2 | Status |
|---|---|---|---|
| Civic Assessment | ✅ | ✅ | done |
| Life Areas dashboard + quiz + detail | ✅ | ✅ | done |
| Goals + weekly check-in | ✅ | ✅ | done |
| Coaching chat | ✅ Groq | ✅ Anthropic | done |
| Gamification (XP, badges, challenges, leaderboard, streaks) | 🟡 partial UI | ✅ full surface (Phase 8) | done |

### El Mandato Vivo

| Surface | v1 | v2 | Status |
|---|---|---|---|
| Mandato Vivo landing | ✅ `/el-mandato-vivo` | ✅ `/mandato-vivo` | done |
| Pulso submit + list | ✅ | ✅ `POST/GET /api/pulso` | done |
| Pulso detail page | ✅ `/mandato/pulso/:id` | ❌ (no `GET /api/pulso/:id`) | **gap → 9C** |
| Propuesta detail + vote | ✅ `/mandato/propuesta/:id` | 🟡 API only (`GET /api/propuestas/:id`, `POST /:id/vote`) | **gap → 9C** |
| Mandato territorial pages (`/mandato/:level/:name`) | ✅ | ❌ | **deferred — no public API yet** |

### Iniciativas

| Surface | v1 | v2 | Status |
|---|---|---|---|
| Iniciativa list | ✅ (under Una Ruta) | 🟡 API only (`GET /api/iniciativas`) | **gap → 9B** |
| Iniciativa detail | ✅ `/recursos/ruta/iniciativas/:slug` | 🟡 API only (`GET /api/iniciativas/:slug`) | **gap → 9B** |
| Iniciativa documento (long-form) | ✅ `/recursos/ruta/iniciativas/:slug/documento` | 🟡 `bodyMarkdown` in row, no page | **gap → 9B** |
| Join / leave iniciativa | ✅ | ✅ API ready | done |
| `/mision/:slug` (mission detail) | ✅ | ❌ (folded into iniciativa kind='mission') | **covered by 9B** |

### Community

| Surface | v1 | v2 | Status |
|---|---|---|---|
| Community feed | ✅ | ✅ | done |
| Like / save / view tracking | ✅ | ✅ | done |
| Community post create UI per type (`/community/{job,project,resource}/create`) | ✅ | ❌ | **deferred to Phase 10** |
| Resource detail `/resources/:id` | ✅ | ❌ | **deferred to Phase 10** |

### Content

| Surface | v1 | v2 | Status |
|---|---|---|---|
| Blog list + detail | ✅ | ✅ | done |
| Blog admin authoring | ✅ | ✅ `/blog/escribir` | done |
| Ensayos list + detail | ✅ 14 essays (7 primer-ciclo + 7 indagaciones) | 🟡 **1 of 14 migrated** (`06-belleza.mdx`) | **keystone gap → 9A** |
| Courses (32 cursos) | ✅ | ❌ DB schema only, no API, no UI | **deferred to Phase 10** |

### Notifications, data, analytics

| Surface | v1 | v2 | Status |
|---|---|---|---|
| Notifications page + bell | ✅ | ✅ | done |
| Datos Abiertos | ✅ | ✅ | done |
| Explorar Datos (radiografía map) | ✅ | ✅ | done |
| InsightDashboard / Tablero | ✅ `/dashboard` | ✅ `/tablero` | done |

### Heavy / experimental

| Surface | v1 | v2 | Status |
|---|---|---|---|
| El Arquitecto 3D viz | ✅ embedded | ⛔ ADR 0003 — defer | out of scope |
| AR.js scenes | ✅ | ⛔ ADR 0004 — drop | out of scope |
| Blockchain attestations | ✅ unused | ⛔ ADR 0005 — drop | out of scope |
| Embeddings / NLP (xenova) | ✅ | ⛔ ADR 0006 — defer | out of scope |
| ¡BASTA! cancionero | ❌ | ❌ | not in either; skill exists for authoring |

---

## Shape

Four workstreams, internally parallel-safe (no shared files):

1. **9A — Ensayos content migration.** 13 MDX files. Keystone for the project (per user feedback memory).
2. **9B — Iniciativas client pages.** List + detail + documento. Consumes the existing `/api/iniciativas` slice.
3. **9C — Pulso/Propuesta detail pages.** Drill-downs on `/mandato-vivo`. One small API addition (`GET /api/pulso/:id`); rest is UI.
4. **9D — Static / informational pages.** Bienvenida, Apoyo, Política de Privacidad.

---

## Out of scope (explicitly deferred)

- **Course system** (lessons, quizzes, progress, 32-course content migration). This is a phase-sized workstream of its own. → Phase 10.
- **Public profile** `/u/:username`. Requires public-shape user fields (display name, avatar, optional bio) and access-control review. → Phase 10.
- **Community CRUD subpages** (`/community/{job,project,resource}/create`, edit variants, `/resources/:id`). The feed works; authoring UIs are a quality-of-life follow-up. → Phase 10 or later.
- **Mandato territorial pages** (`/mandato/:level/:name`). `mandato/` slice has no public routes — would need API design first. → future phase.
- **Admin feedback panel** (`/admin/feedback`). Admin tooling is a separate concern.
- **¡BASTA! cancionero.** Not in v1; net-new feature, separate scope.
- **Production deployment** (Vercel project + DNS + monitoring). → Phase 10.

---

## 9A — Ensayos content migration

### Goal

`v2/content/ensayos/` goes from 1 to 14 MDX files. Both series render in the list and read correctly through `/ensayos/:slug`.

### Source of truth

Two folders in the repo root:

- `Ensayos/presidencia, democracia y belleza/01-…07-carta.md` — 7 first-cycle essays (Spanish rioplatense; the loose `Ensayos/0?-*.md` siblings are older English drafts and must be ignored).
- `Ensayos/indagaciones/01-…07-sensibilidad-como-infraestructura.md` — 7 indagaciones essays.

Total: 14 source files. `06-belleza.mdx` is already migrated → 13 to produce.

### Output shape

Each migrated MDX file matches the frontmatter contract enforced by `apps/web/src/lib/ensayos-registry.ts`:

```yaml
---
slug: <kebab>
title: <title>
subtitle: <subtitle>
summary: <one-sentence pitch>
series: primer-ciclo | indagaciones
orderIndex: 1..7
publishedAt: 2026-04-15T00:00:00Z   # placeholder, same for whole series
readingMinutes: <int>
tags: [list]
draft: false
---

<body markdown — title + subtitle H1/H2 stripped; H2 numbered sections preserved>
```

The body strips the first `# Title` and first non-numbered `## Subtitle` lines (the registry's `stripFrontmatter` only removes the frontmatter block). Numbered `## I.`, `## II.`, …, sections must remain.

### Slug + order table

| File | series | orderIndex | slug | type |
|---|---|---|---|---|
| `presidencia, democracia y belleza/01-presidencia.md` | primer-ciclo | 1 | `presidencia` | ensayo |
| `…/02-democracia.md` | primer-ciclo | 2 | `democracia` | ensayo |
| `…/03-poder.md` | primer-ciclo | 3 | `poder` | ensayo |
| `…/04-arquitectura.md` | primer-ciclo | 4 | `arquitectura` | ensayo |
| `…/05-soberania.md` | primer-ciclo | 5 | `soberania` | ensayo |
| `…/06-belleza.md` | primer-ciclo | 6 | `belleza` | **already done** |
| `…/07-carta.md` | primer-ciclo | 7 | `carta-al-nieto` | carta |
| `indagaciones/01-fabrica-obediencia.md` | indagaciones | 1 | `fabrica-obediencia` | ensayo |
| `indagaciones/02-caudillo-camino-sin-camino.md` | indagaciones | 2 | `caudillo-camino-sin-camino` | ensayo |
| `indagaciones/03-miedo-y-devenir.md` | indagaciones | 3 | `miedo-y-devenir` | ensayo |
| `indagaciones/04-libertad-de-lo-conocido.md` | indagaciones | 4 | `libertad-de-lo-conocido` | ensayo |
| `indagaciones/05-conocerse-sin-espejo.md` | indagaciones | 5 | `conocerse-sin-espejo` | ensayo |
| `indagaciones/06-amor-sin-apego.md` | indagaciones | 6 | `amor-sin-apego` | ensayo |
| `indagaciones/07-sensibilidad-como-infraestructura.md` | indagaciones | 7 | `sensibilidad-como-infraestructura` | ensayo |

### Approach

One-shot migration script — `scripts/content/migrate-ensayos-v1-to-v2.ts` (Node ESM, run with `tsx`):

1. Read each source `.md` under `Ensayos/<series-dir>/`.
2. Parse the first `# Title` and `## Subtitle` lines into frontmatter.
3. Compute `readingMinutes = ceil(wordCount / 220)`.
4. Author a one-sentence `summary` per essay (table below — these are NOT auto-generated; hand-written so they reflect the essay's actual argument).
5. Emit `v2/content/ensayos/<slug>.mdx` with frontmatter + body (title/subtitle stripped).
6. Run once, commit the 13 generated files, then delete the script (it's a one-off; no need to keep it under `scripts/` long-term — but commit it in the same PR so the trail is auditable).

The Ensayos list page (`v2/apps/web/src/pages/Ensayos.tsx`) already groups by `series` — no UI changes needed once frontmatter is correct.

### Hand-written summaries (1 sentence each)

- presidencia → "Por qué una sola persona sentada en una sola silla nunca pudo ni va a poder gobernar un país de 45 millones — y qué construir en su lugar."
- democracia → "La democracia tal como la heredamos no es una conversación entre iguales; es un ritual cada cuatro años que tapa qué decisiones nunca se nos consultaron."
- poder → "La palabra poder fue el caballo de Troya: la usamos como si fuera un sustantivo, una cosa que se gana o se reparte, cuando en realidad es siempre un verbo, una relación viva entre los que actúan."
- arquitectura → "Si la presidencia es una idea estúpida y el poder no es un objeto, ¿qué arquitectura cívica nos queda para sostener una república sin trono?"
- soberania → "Cada vez que tu identidad, tu plata, tu memoria y tu deliberación viven en infraestructuras que no son tuyas, perdés soberanía aunque nadie haya cruzado la frontera."
- carta-al-nieto → "Una carta a quien aún no nació, explicando qué hicimos con el país que le vamos a dejar — y por qué construir importa más que ganar elecciones."
- fabrica-obediencia → "Sobre lo que la escuela argentina enseña sin nombrarlo: obedecer, esperar permiso, repetir lo que ya está dicho."
- caudillo-camino-sin-camino → "Sobre por qué seguimos buscando un líder que nos salve, y qué pasaría si dejáramos de buscarlo."
- miedo-y-devenir → "Sobre la economía emocional de un país que vive entre el miedo a perder y la nostalgia de no haber sido — y cómo sale del laberinto."
- libertad-de-lo-conocido → "Sobre cómo soltar la Argentina heredada para ver la real, sin el ruido de las identidades prestadas."
- conocerse-sin-espejo → "Sobre el autoconocimiento como acto político: una república sólo es adulta si sus ciudadanos también lo son."
- amor-sin-apego → "Sobre la militancia como dependencia, la lealtad sin propiedad, y el amor que no necesita encadenar para sostenerse."
- sensibilidad-como-infraestructura → "Sobre la naturaleza, la belleza y el silencio como tecnologías cívicas — tan reales como una ruta o un tribunal."

### Verification

- 14 files in `v2/content/ensayos/`.
- `pnpm --filter @v2/web build` succeeds; bundle includes all 14 in the registry.
- Manual smoke: `/ensayos` shows 14 entries grouped by series; `/ensayos/presidencia` renders.

---

## 9B — Iniciativas client pages

### Goal

Surface the existing iniciativas API on the client.

### API (already shipped, no changes needed)

- `GET /api/iniciativas` — list (filters: kind, status, planCode).
- `GET /api/iniciativas/:slug` — detail (joined with member count, milestones, tasks).
- `POST /api/iniciativas/:id/join` — auth.
- `POST /api/iniciativas/:id/leave` — auth.

### Pages

| Path | Component | Auth | Purpose |
|---|---|---|---|
| `/iniciativas/:slug` | `IniciativaDetail` | public | Summary card, member count, status, milestones, tasks, join/leave button (auth-gated). For `kind === 'plan'`, redirect to `/planes/:slug` since that's the canonical long-form home. |
| `/iniciativas/:slug/documento` | `IniciativaDocumento` | public | Full `bodyMarkdown` rendered with the existing `MdxContent` component. Header + back-link to `/iniciativas/:slug`. |

No top-level `/iniciativas` index page in Phase 9 — iniciativas are linked from `/comunidad` and `/una-ruta-para-argentina` already, and a list page is post-launch. (Defer ratifies the "do less" instinct.)

### Hook + queries

`apps/web/src/queries/iniciativas.ts`:

```ts
export function useIniciativa(slug: string) { /* useQuery on /api/iniciativas/:slug */ }
export function useJoinIniciativa() { /* useMutation */ }
export function useLeaveIniciativa() { /* useMutation */ }
```

### Tests

- Component test for `IniciativaDetail` with a fixture API response.
- Component test for `IniciativaDocumento` rendering the markdown.

---

## 9C — Pulso / Propuesta detail pages

### Goal

Drill-down view from `/mandato-vivo` into a single pulso or propuesta.

### API additions

- **New endpoint**: `GET /api/pulso/:id` → returns the single signal with redacted PII (user_id only if owner, otherwise null), classifier output (categoría, urgencia, sentimiento), and aggregate vote count if it has been promoted to a propuesta.
  - Integration test: returns 200 with the row, 404 on missing.

`GET /api/propuestas/:id` already exists; `POST /api/propuestas/:id/vote` already exists. No new endpoints there.

### Pages

| Path | Component | Auth | Purpose |
|---|---|---|---|
| `/mandato-vivo/pulso/:id` | `PulsoDetail` | public | Show the raw signal, its classifier output (categoría, urgencia), territorial scope, and a link to any derived propuesta. |
| `/mandato-vivo/propuesta/:id` | `PropuestaDetail` | public; vote auth-required | Show propuesta title, body, status history, vote tally, and a vote button (`+1` / `-1`). |

### Hook + queries

`apps/web/src/queries/mandato.ts`:

```ts
export function usePulsoById(id: number) { /* useQuery */ }
export function usePropuestaById(id: number) { /* useQuery */ }
export function useVotePropuesta() { /* useMutation, invalidates ['propuesta', id] */ }
```

### Tests

- Integration test for `GET /api/pulso/:id` (happy path, 404, redaction of `userId` when caller ≠ owner).
- Component test for `PropuestaDetail` showing vote button enabled only when logged in.

---

## 9D — Static / informational pages

### Goal

Three small pages that v1 has and v2 doesn't.

| Path | Component | Source | Auth | Notes |
|---|---|---|---|---|
| `/bienvenida` | `Bienvenida` | hand-written TSX with sections | auth-required | Post-registration onboarding. Three-step explainer: ¿Qué es ¡BASTA!? → ¿Qué podés hacer hoy? → Recorrido sugerido. Link to `/auto-evaluacion-civica` and `/areas`. |
| `/apoyo` | `ApoyaAlMovimiento` | hand-written TSX | public | How to support the movement: compartir, sumar pulsos, contribuir contenido, eventualmente donar. Section per channel. No payments wiring this phase — just the page. |
| `/politica-privacidad` | `PoliticaPrivacidad` | MDX in `content/legal/privacidad.mdx` rendered via `MdxContent` | public | Privacy policy. Adapt v1 content; refresh dates and the cookie/JWT section to reflect v2's httpOnly architecture. |

### Footer / nav wiring

`/politica-privacidad` and `/apoyo` link from the global footer. `/bienvenida` is the redirect target after a successful registration that completed email verification.

---

## Done definition

After Task 12 lands and CI is green on `main`:

- `v2/content/ensayos/` contains 14 MDX files; all 14 render at `/ensayos` and via `/ensayos/:slug`.
- `/iniciativas/:slug` and `/iniciativas/:slug/documento` mounted; consume `/api/iniciativas/:slug`; integration test stays green.
- `/mandato-vivo/pulso/:id` and `/mandato-vivo/propuesta/:id` mounted; `GET /api/pulso/:id` shipped with integration test.
- `/bienvenida`, `/apoyo`, `/politica-privacidad` mounted; footer links to the last two.
- `pnpm verify` green; integration test count rises from 132 to **≥ 135** (1 new pulso detail test + at least 2 new component tests for iniciativas + propuesta).
- 12 commits pushed to `main`, each leaving `pnpm verify` green.

---

## Self-review notes (verified before plan was finalized)

- **Inventory verified**: both v1 and v2 surface inventories produced by parallel exploration agents on 2026-05-13. Gaps cross-checked against `apps/web/src/App.tsx` (route registry) and `apps/api/src/features/*` (route mounts).
- **Source files exist**: 14 source markdown files confirmed at `Ensayos/presidencia, democracia y belleza/` and `Ensayos/indagaciones/`. The English-language siblings at `Ensayos/0?-*.md` are explicitly ignored.
- **Frontmatter contract verified**: read `apps/web/src/lib/ensayos-registry.ts`; the migration's emitted frontmatter matches its accepted fields.
- **API gap is minimal**: only `GET /api/pulso/:id` is new. `iniciativas`, `propuestas`, and the rest already exist with the right shape.
- **Sized**: 12 tasks, each one-commit-sized, mirrors the cadence proven across Phase 8.
- **No course system creep**: Courses live in their own DB schema with zero API and zero UI; pulling them in now would double the phase. Explicit defer to Phase 10.
- **No public-profile creep**: Phase 9 surfaces drill-downs, not new identity primitives. `/u/:username` defers cleanly with the rest of public-shape work.
