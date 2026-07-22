# Papel y Tinta — Master Plan: the production platform

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Phases 2–8 commission per-page plans; each page plan is written with superpowers:writing-plans at the moment its phase starts, using the page card in this document as its spec input.

**Goal:** Ship the complete, production-ready ¡BASTA! platform: every route redesigned in the Papel y Tinta system, the design doc upgraded to v1.1 so it can actually govern the build, the missing surfaces (mapa real, entrenamientos, sembrar) constructed, and the v1 dark chrome deleted.

**Architecture:** Fix the design system first (Phase 0), extract the foundation the pages share (Phase 1), then migrate page-by-page down the §8 anatomy in five page phases, then cut over and delete the old system, then harden for ship. Each page follows §11 discipline: spec → build → verify → `PAPEL_ROUTES` → commit.

**Tech Stack:** React 18 + Vite + Tailwind (papel tokens) + wouter + @tanstack/react-query · Express + Drizzle + Neon (`cool-bird-63087148`) · MDX content in `v2/content/` · Vitest + Playwright.

## Global Constraints

- All rules in `v2/CLAUDE.md` apply: pages ≤ 300 LOC (slice into `pages/Foo/sections/`), no `any`, no `console.*`, JWT in httpOnly cookies, `pnpm verify` green before every commit, Conventional Commits with scope.
- `docs/design-system/README.md` is law for everything visual and verbal. After Phase 0 it is law *without exceptions* — if a page needs something the doc doesn't cover, the doc gets amended in the same PR.
- Spanish rioplatense voseo in every user-facing string. `¡BASTA!` always with both signs. «Comillas angulares». Never "únete/registrate" — «sembrá», «soltá tu voz».
- The 22 PLANes are **prueba, no doctrina**. Every invented metric carries `* datos de demostración`.
- One conversation = one page (§11). Never touch header/footer/other pages while building a page.
- v1 production DB (`sparkling-field-92271073`) is off-limits. Never import from `SocialJusticeHub/`.
- Every new endpoint ships ≥ 1 integration test; every non-trivial component ≥ 1 component test.
- Keystone texts (manifiesto, ensayos, novela chapters) are preserved **verbatim** — presentation-only redesign. All other v1 copy is rewritten, never pasted.

## Program map

| Phase | Delivers | Gate |
|---|---|---|
| 0 | Design system v1.1 — contradictions fixed, gaps specified | Doc review |
| 1 | Foundation — papel primitives, despertar wired, live counter, anim wrappers | `pnpm verify` |
| 2 | El recorrido: La idea · El mapa (real) · El mandato · La prueba · Sembrar | Per-page DoD |
| 3 | La biblioteca: hub · lectores (ensayo/manifiesto/crónica) · bitácora · **entrenamientos (new build)** · content parity | Per-page DoD |
| 4 | Soporte: apoyo · kit de prensa · legal · 404 · auth · bienvenida · evaluación | Per-page DoD |
| 5 | La plataforma (logged-in): tablero · perfil · áreas · objetivos · desafíos · comunidad · coaching · notificaciones | Per-page DoD |
| 6 | La prensa de datos: explorar-datos · datos-abiertos · costo humano | Per-page DoD |
| 7 | Cutover: PAPEL_ROUTES → all, v1 chrome/tokens/fonts DELETED | Grep-clean |
| 8 | Ship hardening: SEO/OG, print, a11y, perf, e2e journeys | Ship checklist |

## Decisions (recommended defaults — override before Phase 2 if you disagree)

- **D1 · Print serif.** §10.8 demands a "serif del sistema" that doesn't exist. Default: system serif stack (`Georgia, 'Times New Roman', serif`) **print-only** — zero font payload, fits the diario metaphor. No new webfont.
- **D2 · Icons.** README bans icons; the logged-in app already uses lucide everywhere. Default ruling: editorial/public pages → zero icons, typographic glyphs only (`→ ↗ ↺ ▌ ¡ !`); app chrome → lucide allowed **functional-only** (close, menu, external), 16 px, stroke tinta, never decorative, never colored.
- **D3 · Map tech.** Default: **no map library.** Inline SVG Argentina (Natural Earth provinces GeoJSON → precomputed paths), fill `#E4E0D3`, borders tinta, `pulse-dot` markers, tally-numbered clusters — exactly what the specimen mocks. Street-level pan/zoom would need an ADR later; the civic map doesn't need it.
- **D4 · Entrenamientos.** §8 says "6 entrenamientos", content has ~30 courses. Default: biblioteca surfaces **6 curated entrenamientos**; full catálogo behind «ver los 30 →».
- **D5 · Despertar mechanic.** Implemented veil (full-viewport `mix-blend-saturation`, 1400 ms) ≠ spec (accent-only `saturate(.4)`, 1 s). Default: **keep the veil** (built, simpler, stronger) and respec §10.7 to match it.
- **D6 · Content gaps.** Blog 20/22, ensayos 14/~21. Default: migrate everything; anything intentionally dropped gets listed in the Phase 3 parity task for explicit approval.

---

## Phase 0 — Design System v1.1

The audit found seven doc-vs-reality contradictions and eighteen coverage gaps. This phase makes the README able to govern the remaining ~40 pages.

### Task 0.1: Resolve §9 — two implementation tracks

**Files:**
- Modify: `docs/design-system/README.md` (§9)
- Modify: `docs/design-system/tokens.css`

**Interfaces:**
- Produces: the rule every later page task follows for styling (`bg-papel` Tailwind tokens in the app; inline hex only in `.dc.html` specimens).

- [ ] **Step 1: Replace §9 in README.md** with:

```markdown
## 9. Reglas de implementación

Hay DOS pistas y no se mezclan:

**9a. Design Components (`.dc.html`, previews).** Todo estilo inline con hex
literales; `<helmet>` solo para fonts, `@keyframes` y resets. Nunca `var(--token)`.

**9b. La app React (`apps/web`).** Los tokens Tailwind son canónicos: `bg-papel`,
`text-tinta`, `text-violeta`, `border-sello`, `font-anton/archivo/space`, etc.
(definidos en `tailwind.config.ts` desde los valores de `tokens.css`). En TSX está
PROHIBIDO el hex literal — si falta un token, se agrega a `tokens.css` +
`tailwind.config.ts` en el mismo PR. Keyframes canónicos en `index.css` con
wrappers `.anim-*`. Repetir la receta antes que abstraer sigue valiendo para
layout; los componentes compartidos viven en `components/papel/primitives/`.
- Móvil: colapsar a 1 columna, padding 20px, targets ≥44px.
```

- [ ] **Step 2: Add the missing hover token.** In `tokens.css` after `--violeta`: `--violeta-hover: #3D1BA3;` and rename `--violeta-oscuro-bg` → `--violeta-claro: #9D85E8;` (matching Tailwind's `violeta.claro`). Add `#3D1BA3` to README §2 acentos.
- [ ] **Step 3: Commit** — `docs(design): v1.1 — split §9 into dc/app tracks, add violeta-hover token`

### Task 0.2: Reconcile keyframes and despertar with reality

**Files:**
- Modify: `docs/design-system/README.md` (§6, §10.7)

- [ ] **Step 1: §6** — rename `pulse` → `pulse-dot`, `blink` → `blink-cursor` (the app's names win; the specimens are previews and keep theirs). Note in §6: "En la app los nombres canónicos son los de `index.css`."
- [ ] **Step 2: §10.7** — respec el despertar to the built mechanic (D5): "Velo gris de viewport completo (`mix-blend-mode:saturation`, opacidad .6) que se disuelve en 1.4 s al primer gesto (`despertar()` en `lib/despertar.ts`). Disparadores canónicos: CTA «Dejar mi voz en el mapa», CTA header «Sembrar tu voz», primera voz soltada."
- [ ] **Step 3: Commit** — `docs(design): v1.1 — keyframe names and despertar match the app`

### Task 0.3: Rulings — print, icons, data-viz

**Files:**
- Modify: `docs/design-system/README.md` (§10.8, new §12, new §13)

- [ ] **Step 1: §10.8** — apply D1: "La edición impresa usa la serifa del sistema (`Georgia, 'Times New Roman', serif`) SOLO en `@media print`. En pantalla nunca hay serifa. Cada lector define `@media print`: sin nav/footer/grano, folio `¡BASTA! · edición del lector · {fecha}`."
- [ ] **Step 2: Add §12 — Iconos** (D2):

```markdown
## 12. Iconos

- Páginas editoriales/públicas: CERO íconos. Solo glifos tipográficos → ↗ ↺ ▌ ¡ !
- La plataforma (páginas con sesión): lucide permitido SOLO funcional (cerrar, menú,
  link externo, campana), 16px, stroke tinta o tinta-50, nunca decorativo ni de color.
- Logros y gamificación NO usan íconos: usan sellos y palitos (§10.5, §10.6).
```

- [ ] **Step 3: Add §13 — La prensa de datos** (the data-viz ruling the aesthetic needs):

```markdown
## 13. La prensa de datos

Tres niveles, sin excepciones:
1. **Palitos** (§10.6) para conteos < 100.
2. **Barras horizontales** solo dentro de documentos (mandato, informes): fondo
   `#241F17` en oscuro / `#ECE8DC` en claro, relleno del color semántico, valor en
   Space Mono al final de la barra. Animación `growbar`.
3. **Prensa** para viz complejas (flujos, convergencia, mapas de calor): SOLO dentro
   de páginas-documento; monocromo tinta + UN acento semántico; sin gradientes, sin
   3D, sin ejes decorativos; toda cifra en Space Mono; siempre con fuente y fecha al
   pie. Si una viz no se entiende en 10 segundos, se reemplaza por una tabla.
```

- [ ] **Step 4: Commit** — `docs(design): v1.1 — print serif, icon policy, prensa de datos`

### Task 0.4: The missing specs — scales, states, forms, patterns

**Files:**
- Modify: `docs/design-system/README.md` (§4 additions, §5 additions)

- [ ] **Step 1: Extend §4** with the three scales (make the app's de-facto values official):

```markdown
Escala de espaciado (px): 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 80 · 120.
Ritmo entre secciones 80–120; padding de card 24 (móvil) / 32; juntas de grilla 1px.
Breakpoints canónicos: móvil <560 · tablet 560–960 · desktop 960–1140 · ancho >1140.
En Tailwind: max-[560px], min-[561px], min-[961px], min-[1141px]. No inventar otros.
Z-index: contenido 0 · header 40 · menú móvil 45 · popover/modal 50 · velo despertar
60 · grano 70 (siempre arriba, pointer-events:none).
```

- [ ] **Step 2: Extend §5** with component states + full form kit + patterns:

```markdown
Estados
- Deshabilitado: color tinta-30, borde tinta-30, cursor not-allowed. Nunca opacity.
- Cargando (botón): texto reemplazado por «— ▌» con blink-cursor; ancho fijo.
- Error de campo: borde 2px rojo-sello + mensaje mono 11px rojo-sello debajo.
- Éxito: sello verde o mensaje mono verde. Nada de toasts flotantes verdes.

Formularios (kit completo)
- Select: nativo estilizado — borde 1px tinta, fondo papel-crudo, flecha ▾ tipográfica.
- Checkbox/radio: cuadrado/círculo 18px borde tinta; marcado = fondo violeta, tilde papel.
- Toggle: pastilla rectangular sin radius; OFF papel-presionado / ON violeta; etiqueta mono.
- Requerido: asterisco violeta en la etiqueta mono. Ayuda: mono 10px tinta-50.

Búsqueda, filtros y paginación
- Búsqueda: input mono con prefijo «buscar:» y cursor ▌; resultados en filas de índice.
- Filtros: chips §5; activo = fondo semántico. Línea de conteo mono: «{n} resultados».
- Paginación: botón «cargar más ↓» (nunca scroll infinito ni numeritos).
- Filtro sin resultados: «Nada con ese filtro. Probá con menos.»

Tablas
- Extensión de la fila de índice: encabezados mono 11px uppercase tinta-50, orden con
  ▲▼ tipográficos, borde inferior 1px tinta en el header, hover papel-presionado.
  Header sticky permitido. Sin zebra.

Modales, toasts, tooltips
- Modal = documento papel-sobre-oscuro (§5) centrado sobre velo rgba(22,19,14,.7);
  cierre «✕» tipográfico arriba a la derecha. Un modal por vez.
- Toast = sello que cae (stampin) en la esquina inferior derecha + línea mono; se va
  solo a los 4s. Catálogo de sellos cerrado (§10.5) — el toast usa esos textos.
- Tooltip: mono 10px, fondo papel-presionado, borde 1px tinta, sin flecha, sin delay
  artificial.

Skeletons
- Bloques papel-presionado del tamaño real del contenido con pulso de opacidad .5→.8
  (1.2s). Junto al primer skeleton, microcopy de carga (§10.9).

Páginas de error
- 404: expediente — kicker «expediente extraviado», título Anton «No está acá.», sello
  rojo EXTRAVIADO rotado, CTA «Volver al inicio →». 500: «Esto se rompió. Lo decimos
  porque publicamos todo.» + link al estado.
```

- [ ] **Step 3: Commit** — `docs(design): v1.1 — scales, states, forms, search, tables, modals, errors`

### Task 0.5: Platform + outreach specs (auth, email, SEO/OG, §8 fixes)

**Files:**
- Modify: `docs/design-system/README.md` (new §14, §8 fix)

- [ ] **Step 1: Add §14 — La plataforma y la difusión:**

```markdown
## 14. La plataforma y la difusión

Auth: formularios papel mínimos, kicker «entrada», tono «anónimo si querés» — la
cuenta es opcional y se dice. Nada de beneficios inventados por registrarse.
Emails: una columna papel (#F2EFE7), fuentes del sistema, wordmark texto con ¡! en
violeta, un solo CTA, footer con «te escribimos solo cuando pasa algo».
SEO/OG: título «{Página} — ¡BASTA!»; descripciones en voseo, sin marketing. Imagen
OG: card papel 1200×630 con ¡BASTA! gigante entintado + kicker de la página (una
plantilla, texto variable). Favicon: «¡» violeta sobre papel.
Gamificación: XP y rachas se cuentan con palitos; logros son sellos del catálogo;
niveles con numeración de expediente («Exp. N° 004»). Cero barras de progreso salvo
dentro de documentos; cero íconos de trofeo.
```

- [ ] **Step 2: Fix §8** — apply D4: "…La biblioteca (manifiesto + 21 ensayos en 3 ciclos + **6 entrenamientos curados (catálogo completo de 30 detrás de «ver todos»)** + bitácora)…"
- [ ] **Step 3: Bump the doc date** (v1.1 · julio 2026) per §11.4. **Commit** — `docs(design): v1.1 — platform/auth/email/SEO specs, §8 numbers`

### Task 0.6: Repo hygiene from the audits

**Files:**
- Delete: `v2/BASTA site redesign.zip` (same-day snapshot of `docs/design-system/`, redundant)
- Delete: `v2/apps/web/dist/` from the tree; add `dist/` to `v2/.gitignore` if missing

- [ ] **Step 1:** `git rm "v2/BASTA site redesign.zip" && git rm -r --cached v2/apps/web/dist` (verify `.gitignore` covers `dist/`).
- [ ] **Step 2: Commit** — `chore(repo): drop design-system zip snapshot and committed dist artifacts`

---

## Phase 1 — Foundation (shared by every page that follows)

### Task 1.1: Papel primitives extracted from Home

**Files:**
- Create: `apps/web/src/components/papel/primitives/Kicker.tsx`, `BotonPapel.tsx`, `Sello.tsx`, `ChipTipo.tsx`, `NotaDemo.tsx`, `FilaIndice.tsx`, `BandaCta.tsx`, `index.ts`
- Modify: `apps/web/src/pages/Home/sections/*.tsx` (consume primitives)
- Test: `apps/web/src/components/papel/primitives/primitives.test.tsx`

**Interfaces:**
- Produces: `<Kicker color?>`, `<BotonPapel variant='violeta'|'tinta'|'fantasma' surface?='papel'|'oscuro' loading? disabled?>` (surface ratified post-review: CtaBand's inverted buttons on violeta bg required it), `<Sello color='rojo'|'verde'|'violeta' rotate?>{texto}</Sello>`, `<ChipTipo tipo active?>`, `<NotaDemo/>` (renders `* datos de demostración`), `<FilaIndice num titulo href/>` (trailing glyph is a static `→`; expandable `+/−` rows are a Phase 2.4 spec decision), `<BandaCta fondo='violeta'|'tinta'>`. Every page phase consumes these; recipes come verbatim from README §5 (Tailwind track per §9b). FilaIndice/ChipTipo/NotaDemo have no Home consumer — each Phase 2 page spec that first uses one includes a smoke test of it in real composition.

- [ ] **Step 1: Write component tests** (render each primitive; assert classes/text: BotonPapel disabled → `text-tinta-30`; NotaDemo → text `* datos de demostración`; Sello rotates).
- [ ] **Step 2:** Run tests, expect FAIL (components missing).
- [ ] **Step 3:** Implement the seven primitives translating README §5 recipes to papel Tailwind tokens (no hex in TSX, per §9b).
- [ ] **Step 4:** Refactor Home sections to consume them; `pnpm verify` green (Home must render pixel-identical — snapshot the sections test before/after).
- [ ] **Step 5: Commit** — `feat(web): papel primitives extracted from Home per design v1.1`

### Task 1.2: Wire the despertar (it currently can never fire)

**Files:**
- Modify: `apps/web/src/pages/Home/sections/HeroBasta.tsx` (CTA «Dejar mi voz en el mapa»), `apps/web/src/components/papel/PapelHeader.tsx` (CTA «Sembrar tu voz»)
- Test: `apps/web/src/lib/despertar.test.ts`

**Interfaces:**
- Consumes: `despertar()` from `apps/web/src/lib/despertar.ts:23`.
- Produces: the site actually transitions gris→color on first action; later pages (mapa submit, sembrar step 1) call the same `despertar()`.

- [ ] **Step 1: Test:** clicking the hero CTA calls `despertar()` and `useDespierto()` flips to true (jsdom, localStorage `basta_despierto`).
- [ ] **Step 2:** FAIL. **Step 3:** add `onClick={despertar}` to both CTAs (navigation unaffected). **Step 4:** PASS + manual browser check: veil dissolves in 1.4 s. **Step 5: Commit** — `fix(web): despertar fires on first CTA — the site was permanently gray`

### Task 1.3: Live voces counter (kill the hardcoded "12.496")

**Files:**
- Modify: `apps/api/src/features/analytics/routes.ts` (add `GET /voces-count`), `packages/db/src/repositories/dreams.ts` (add `countAll()`)
- Modify: `apps/web/src/components/papel/papel-nav.ts` + `PapelHeader.tsx` (react-query fetch, fallback to demo constant + asterisk while loading/error)
- Test: `apps/api/src/features/analytics/analytics.test.ts` (integration, real Postgres branch)

**Interfaces:**
- Produces: `GET /api/analytics/voces-count` → wire body `{ data: { total: number } }` per the app-wide envelope that `lib/api.ts` unwraps (ratified post-review; client-visible contract via `api.get` is `{ total }`). Counts APPROVED dreams only (`countApproved()` on the dreams repository — public number matches public data). Header shows `{total} voces · falta la tuya` formatted `es-AR`, demo-constant fallback while loading/error. Home `CifrasStrip` reuses the same `useVocesCount()` query in Phase 2.

- [ ] **Step 1:** Integration test: seed 3 dreams → endpoint returns `{ total: 3 }`. **Step 2:** FAIL. **Step 3:** implement repository `countAll()` + route. **Step 4:** PASS. **Step 5:** wire header query (keep `* datos de demostración` only for metrics still fake). **Step 6: Commit** — `feat(api,web): live voces counter behind the FOMO tagline`

### Task 1.4: Complete the anim toolkit

**Files:**
- Modify: `apps/web/src/index.css` (add `.anim-dropin`, `.anim-growbar`, `.anim-semgrow`, `.anim-leafpop` wrappers for the already-defined keyframes; add skeleton pulse keyframe `pulso-papel` per §5)

- [ ] **Step 1:** Add the wrappers + skeleton keyframe, mirroring the existing `.anim-*` pattern (`index.css:186-200`), all inside the `prefers-reduced-motion` guard scheme.
- [ ] **Step 2:** `pnpm verify`. **Commit** — `feat(web): anim wrappers for map/seed/skeleton — toolkit complete for page phases`

---

## Phases 2–6 — The pages

**Protocol per page (every card below):** (1) write the page spec in `docs/specs/` from the card + specimen + README v1.1, using superpowers:writing-plans for its task plan; (2) build with primitives; (3) DoD: kicker + título Anton + CTA · ONE interacción firma · rito de la tinta on the H1 · asterisks on remaining demo data · responsive 1-column, targets ≥ 44 px · voseo · route in `PAPEL_ROUTES` · ≤ 300 LOC · `pnpm verify` · browser-verified desktop + mobile with screenshots · AA + reduced-motion.

**Copy rule per page:** the spec's first line is *quién llega y qué tiene que creer o hacer al irse*. All prose rewritten under §7 — v1 copy is reference, not source (keystone texts excepted).

### Phase 2 — El recorrido público

| # | Page | Route (canonical) | Specimen screen | Sections / notes |
|---|---|---|---|---|
| 2.1 | **La idea** | `/la-idea` (redirects: `/la-vision`, `/el-instante-del-hombre-gris`) | LA IDEA caps I–III | Cap I el hombre gris (grayscale→color, absorbs ElInstante content) · Cap II el método (diseña/administra/ejecuta) · Cap III sin líder. Merges two v1 pages into one journey — fixes the v1 fragmentation. |
| 2.2 | **El mapa** | `/el-mapa` | EL MAPA | **New build** (D3: SVG provinces, no map lib): mapa + pulse-dot voces · panel «Soltá tu voz» (6 type-chips + textarea + submit → sello RECIBIDA + `despertar()`) · popover voz seleccionada · feed «últimas voces». Wire to dreams/pulso API. Primary conversion of the whole site. |
| 2.3 | **El mandato** | `/mandato-vivo` (+ `/pulso/:id`, `/propuesta/:id` as document sub-views) | EL MANDATO | Página oscura + documento papel: preámbulo · diagnóstico rankeado (% grande) · recursos · brechas críticas con tags de urgencia · sello EJEMPLO. Uses §13 barras. Absorbs the "convergencia" story so it's told once, here — not three times as in v1. |
| 2.4 | **La prueba** | `/planes` + `/planes/:slug` | LOS 22 PLANES | Callout «No es doctrina» · filter chips (§5 search/filter kit) · expandable plan rows · method cards. `PlanDetail` = papel-sobre-oscuro reader with sello EJEMPLO + print edition. Content: `content/planes/` (22 + PLANRUTA). |
| 2.5 | **Sembrar** | `/sembrar` (redirect: `/la-semilla-de-basta`) | SEMBRAR | 3-step wizard (§5 stepper — now documented) · certificado semilla (semgrow/leafpop) · sello PLANTADA · print/share · `despertar()` on step 1. |

### Phase 3 — La biblioteca (+ the course system build)

| # | Page | Route | Specimen | Sections / notes |
|---|---|---|---|---|
| 3.1 | **La biblioteca** | `/biblioteca` | LA BIBLIOTECA | Manifiesto destacado · 3 ciclos de ensayos · 6 entrenamientos curados (D4) + «ver los 30 →» · bitácora · CTA. Replaces v1's "Recursos" concept. |
| 3.2 | **Lector ensayo** | `/ensayos/:slug` (index folds into biblioteca; `/ensayos` redirects) | LECTOR: ENSAYO | Reader shell 760–860px · prev/next · end-CTA · print edition (D1). Text verbatim. |
| 3.3 | **Lector manifiesto** | `/manifiesto` | EL MANIFIESTO | The v1 wall-of-text becomes the flagship lector: 8 sections with document rhythm, sello LEÍDO ENTERO at true end, print edition. Text verbatim. |
| 3.4 | **Bitácora** | `/bitacora` + `/bitacora/:slug` (redirects from `/blog/*`; `BlogAuthor` tool stays app-side) | LECTOR: CRÓNICA | Index as filas de índice + crónica reader. |
| 3.5 | **Entrenamientos** | `/entrenamientos`, `/:slug`, `/:slug/leccion/:n`, `/:slug/practica` | LECTOR: ENTRENAMIENTO | **NEW CONSTRUCTION**: API feature slice `courses` (schema + repos already exist in `packages/db` — build routes/service/validation + integration tests), catálogo, course landing, lección reader with «Lecciones» list, quiz. 391 MDX files ship dark today with zero surface. |
| 3.6 | **La crónica del país que viene** | `/cronica` | LECTOR: CRÓNICA | v1's Una Ruta novela (5 chapters) becomes a proper lector — fixes the four-paradigms-on-one-URL failure. `UnaRutaParaArgentina` route redirects to `/la-idea` (or `/planes`, decided in the 2.1 spec); el Arquitecto becomes `/arquitecto` app tool (Phase 5). |
| 3.7 | **Content parity close** | — | — | Blog 20→22, ensayos 14→21 migrated to MDX (D6); dropped items listed for approval. Registries + counts verified by test. |

### Phase 4 — Soporte y entrada

| # | Pages | Notes |
|---|---|---|
| 4.1 | `/apoyo` | v1's tightest page; papel remake, principios + Cafecito, «no pedimos confianza ciega, pedimos que nos auditen». |
| 4.2 | `/kit-de-prensa` | Papel assets, OG template showcase (§14), descargas. |
| 4.3 | `/politica-privacidad` + 404 + 500 | Legal reader + expediente-style error pages per §5. |
| 4.4 | Auth: `/ingresar`, `/registrarse`, `/recuperar-contrasena`, `/restablecer-contrasena`, `/verificar-email`, `/2fa-desafio` | §14 auth spec: papel forms, «anónimo si querés». One spec, one plan, six thin pages. |
| 4.5 | `/bienvenida` + `/auto-evaluacion-civica` | Onboarding wizard + assessment on the §5 stepper/forms kit. |

### Phase 5 — La plataforma (logged-in)

One spec first (5.0) applying §14 to the whole app surface: gamificación con sellos/palitos (no icons, no progress bars), lucide functional-only (D2), then page plans: `/tablero`, `/mi-perfil`, `/areas` + `/areas/:slug`, `/objetivos`, `/check-in-semanal`, `/desafios`, `/clasificacion`, `/comunidad`, `/coaching`, `/notificaciones`, `/arquitecto` (the v1 10-tab tool, re-scoped as a sober instrument page). The logged-in surface gets the full system — not leftover dark theme.

### Phase 6 — La prensa de datos

`/explorar-datos` rebuilt under §13 (documento-style, monochrome+accent, each viz earns its place or becomes a table — v1's six-viz pileup does not survive), `/datos-abiertos` (descargas, CC BY 4.0), `/detalles-calculo-costo-humano` (methodology reader). Real data everywhere; asterisks die here.

---

## Phase 7 — Cutover and deletion

- [ ] **7.1:** `PAPEL_ROUTES` covers every route → replace the set with "always papel", delete the branch in `RootLayout.tsx`.
- [ ] **7.2:** Delete v1 chrome: `components/Header.tsx`, `Footer.tsx`; delete `.glass`, `.gradient-text`, dark `:root` block in `index.css:6-43`; make `body` `bg-papel`.
- [ ] **7.3:** Delete legacy tokens/fonts: `iris-violet #7D5BDE`, `mist-white`, `slate-ink` from `tailwind.config.ts:50-53`; Inter/Playfair/JetBrains from `tailwind.config.ts:73-76` + `index.html:17`.
- [ ] **7.4:** Grep gate (must all return zero): `grep -rn "bg-\[#0a0a0a\]\|glass\|iris-violet\|Playfair" apps/web/src` · `grep -rn "#[0-9A-Fa-f]\{6\}" apps/web/src --include="*.tsx"` (no literal hex in TSX). `pnpm verify` + full Playwright pass. **Commit** — `feat(web)!: papel y tinta everywhere — v1 chrome deleted`

## Phase 8 — Ship hardening

- [ ] **8.1 SEO/OG:** per-page titles/descriptions per §14, OG template card, favicon «¡», sitemap.xml, prerender of public routes.
- [ ] **8.2 Print:** `@media print` in all four lectores (D1 serif, folio, no chrome); manual print-preview verification of each.
- [ ] **8.3 A11y:** AA contrast sweep (automated + manual), visible violet focus everywhere, `prefers-reduced-motion` leaves end-states, keyboard path through mapa + sembrar + quiz.
- [ ] **8.4 Perf:** LCP < 2 s on `/`, `/el-mapa`, `/planes` (fonts `display=swap`, zero heavy images, `size-limit` budgets in CI).
- [ ] **8.5 E2E journeys (Playwright):** (a) llegar → despertar → soltar voz → sello RECIBIDA; (b) sembrar 3 pasos → certificado → print; (c) entrenamiento → lección → práctica; (d) registrarse → tablero. All green in CI.
- [ ] **8.6 Ship review:** run the full DoD table against every route; README date bump; `docs/architecture/README.md` updated; tag release.

---

## Self-review notes

- Every audit finding maps to a task: §9 contradiction → 0.1 · keyframe/despertar drift → 0.2, 1.2 · print/serif → 0.3, 8.2 · icon collision → 0.3, 5.0 · 18 coverage gaps → 0.4, 0.5 · FOMO counter → 1.3 · unused keyframes → 1.4 · v1 tokens shipping → 7.2–7.4 · zip + dist → 0.6 · courses with no surface → 3.5 · map placeholder → 2.2 · Una Ruta four-paradigms → 2.1/2.4/3.6/5 (arquitecto) · Manifiesto wall of text → 3.3 · triple convergencia story → 2.3 · content gaps → 3.7 · naming/URL unification → each page card's canonical route + redirects.
- Phases 2–6 are commissioned sub-plans by design (writing-plans scope check: independent subsystems get their own plans); each card is the spec seed, not a placeholder — the first step of every page task is writing its spec/plan.
- Type consistency: primitives interface (Task 1.1) is the single source for names used across page phases; `voces-count` endpoint name consistent between 1.3 and Phase 2 cards.
