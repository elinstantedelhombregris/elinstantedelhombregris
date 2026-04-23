# Brand & Media — Press Credibility Pass

**Date:** 2026-04-23
**Status:** Approved design, awaiting implementation plan
**Source audit:** `BRAND_MEDIA_PACKAGE.md` (repo root)

## Why

The current brand package audit identifies a single structural gap: the project reads as credible in narrative but degrades under press-level scrutiny. Three concrete failures drive that degradation:

1. Press-kit downloads are broken — `/press-kit/*.svg` returns the SPA HTML shell because the assets live in `SocialJusticeHub/public/press-kit/` while Vite serves from `SocialJusticeHub/client/public/`.
2. The site repeatedly says "16 planes estratégicos" while the true source of truth (`shared/arquitecto-data.ts`, "Extracted from 22 PLANes + support documents (April 2026)") defines 22 plans — the press kit is showing an outdated subset.
3. The dominant visual system (iris-violet glassmorphism, `HG` placeholder marks) does not speak the same language as the real logo — a metallic gold/silver emblem with a heart cutout.

This spec addresses all three in a single focused pass. Founder identity, legal entity, English media kit, partner inquiry workflow, and the other items flagged in `BRAND_MEDIA_PACKAGE.md` are explicitly deferred — they need editorial decisions from the founder, not a code change.

## What this is NOT

- Not a rewrite of the `BRAND_MEDIA_PACKAGE.md` document.
- Not a site-wide visual redesign. Only press-facing surfaces change visually.
- Not a product roadmap change. The 22 plans are already defined; we are just making the UI reflect that count.
- Not a rebranding. Master brand, movement name, voice, and tone stay as they are.

## Source of truth for plan count

**The count is 22.** Authoritative file: `shared/arquitecto-data.ts`, which defines `PLAN_REGISTRY` with `ordinal: 1` through `ordinal: 22`. Any other mention of 4, 16, or 17+ plans elsewhere in copy, memory files, or documentation is stale and must be updated to match.

The 22 plans, in ordinal order:

| # | Code | Name |
|---|---|---|
| 1 | PLANJUS | Justicia Popular |
| 2 | PLANREP | Reconversión del Empleo Público |
| 3 | PLANEB | Empresas Bastardas |
| 4 | PLANMON | Soberanía Monetaria |
| 5 | PLANDIG | Soberanía Digital |
| 6 | PLANSUS | Soberanía sobre Sustancias |
| 7 | PLANEDU | Refundación Educativa |
| 8 | PLANSAL | Salud Integral y Vitalidad |
| 9 | PLANISV | Infraestructura de Suelo Vivo |
| 10 | PLANAGUA | Soberanía Hídrica |
| 11 | PLAN24CN | 24 Ciudades Nuevas |
| 12 | PLANGEO | Posicionamiento Geopolítico |
| 13 | PLANEN | Soberanía Energética |
| 14 | PLANSEG | Seguridad Ciudadana |
| 15 | PLANVIV | Vivienda Digna |
| 16 | PLANCUL | Cultura Viva |
| 17 | PLANMESA | Mesa Civil |
| 18 | PLANTALLER | Talleres Federales |
| 19 | PLANCUIDADO | Cuidado y Vínculo |
| 20 | PLANMEMORIA | Memoria Operativa |
| 21 | PLANTER | Tierra, Subsuelo y Pueblos Originarios |
| 22 | PLANMOV | Movilidad, Logística y Conectividad Territorial |

`PLANRUTA` is **not** one of the 22. It is the meta/bootstrap plan that describes how the Ruta itself is constructed — it is referenced by `mission-registry.ts` but lives outside the `PLAN_REGISTRY` list. It continues to exist as-is; it is not counted.

## Architecture of changes

```
Section 1 — Assets
  ├── Move 5 SVGs: SocialJusticeHub/public/press-kit/* → SocialJusticeHub/client/public/press-kit/*
  ├── Redraw each SVG: replace "HG" placeholder + blue/purple with silver/gold emblem
  └── Export metallic hero PNGs (512/1024/2048) from root Logo.png into client/public/press-kit/

Section 2 — Idealized Design + count = 22 + status badges
  ├── 2a. Add "Diseño Idealizado" framing block on three surfaces
  ├── 2b. Update plan count 16 → 22; add 6 missing plan cards to KitDePrensa
  ├── 2c. New component: StatusBadge (4 kinds); use across features + plans
  └── 2d. Update CLAUDE.md memory + any doc that mentions the old count

Section 3 — Visual unification
  ├── 3a. Add silver + gold tokens to Tailwind config
  ├── 3b. Swap HG placeholder for emblem on footer + press-kit hero
  └── 3c. Restyle KitDePrensa hero around the metallic emblem
```

---

## Section 1 — Press-kit asset fix + emblem replacement

### 1.1 File move

Move these 5 files from `SocialJusticeHub/public/press-kit/` to `SocialJusticeHub/client/public/press-kit/`:

- `logo-principal.svg`
- `logo-basta.svg`
- `social-card-landscape.svg`
- `social-card-square.svg`
- `social-card-story.svg`

After the move, remove the now-empty `SocialJusticeHub/public/press-kit/` directory (and the `SocialJusticeHub/public/` directory if it becomes empty) to prevent future confusion about which `public/` Vite uses.

### 1.2 Redraw each SVG around the real emblem

Each of the 5 SVGs currently uses an `HG` placeholder mark in blue/purple. Redraw each so the mark is a simplified silver/gold emblem reproduction, not a pixel copy of the metallic rendering in `Logo.png`.

**Simplified emblem contract:**

- Outer ring: 24 gold teeth/arcs (`#C8A64A`) suggesting flame/laurel/sun-rays.
- Inner form: silver mandala/gear (`#C8CDD2`) with four-fold radial symmetry.
- Center: heart-shaped cutout revealing the background (transparency, not a fill).
- Stroke weight consistent across all 5 SVGs.
- Logo reproduction is inline SVG (no raster fallback inside the SVG).

**Per-file requirements:**

| File | Size | Contents |
|---|---|---|
| `logo-principal.svg` | 512×512 viewport | Emblem only, transparent background |
| `logo-basta.svg` | 800×240 viewport | Emblem on the left + wordmark "El Instante del Hombre Gris" + `¡BASTA!` endorsement line right, silver wordmark |
| `social-card-landscape.svg` | 1200×630 | Charcoal base (`#0A0A0A`), emblem top-left, large silver title, gold accent divider, URL bottom-right |
| `social-card-square.svg` | 1080×1080 | Charcoal base, centered emblem, title below in silver, URL at bottom |
| `social-card-story.svg` | 1080×1920 | Charcoal base, emblem centered top-third, vertical-axis layout for Instagram/Facebook stories |

All five files use the same two ceremonial colors (silver `#C8CDD2`, gold `#C8A64A`) plus charcoal `#0A0A0A` for backgrounds. No purple.

### 1.3 Metallic hero PNGs

Produce `el-instante-logo-metallic-hero-{512,1024,2048}.png` from the root-level `Logo.png` (the full metallic rendering). Place them in `client/public/press-kit/` so that the press kit can use the full metallic version in ceremonial contexts (hero, deck covers, printed matter) while the SVG is used in inline/UI contexts.

### 1.4 Verification

For every file shipped in this section, after deploy, `curl -I` the URL and confirm:
- HTTP 200
- Correct `Content-Type` (`image/svg+xml` for SVGs, `image/png` for PNGs)
- Non-zero `Content-Length`

Smoke-verify on dev server before committing (`npm run dev` + manual fetch of each path).

---

## Section 2 — Idealized Design framing, count = 22, status badges

### 2a. "Diseño Idealizado" framing block

Add this block on three surfaces:

1. Top of `client/src/pages/UnaRutaParaArgentina.tsx` (immediately under the hero, before the plan list).
2. `client/src/pages/KitDePrensa.tsx` directly above the line currently reading "Los 16 planes estratégicos — Diseño de País" (line 496 in the pre-change file).
3. Any home/vision surface that lists or totals plans — specifically check `LaVision.tsx` and `ElMapa.tsx` for inline plan-count references.

**Copy (rioplatense, final):**

> ### Diseño Idealizado
>
> La Ruta para Argentina y sus 22 planes son un ejercicio de **diseño idealizado**, en el sentido que Russell Ackoff le dio al término: no son una hoja de ruta cerrada ni una promesa de gobierno.
>
> Son un mapa de hacia dónde **podríamos apuntar** si las personas dejan de esperar y empiezan a diseñar. Sirven como **ejemplo e inspiración** — muestran lo que se puede pensar, medir, proponer y ordenar cuando la ciudadanía se toma en serio el rediseño del país.
>
> Construirlos de verdad **requiere la participación de las personas**. Vos, tu barrio, tu oficio, tu comunidad. Sin ese aporte, ninguno de estos planes es real.

Rendering: render as a distinct block with a subtle silver/gold border (uses the new tokens from Section 3a), not as free-flowing body copy. The block visually reads as a "status note" — the reader should not be able to miss it.

### 2b. Update count everywhere and add the 6 missing plan cards

**Copy replacements in `client/src/pages/KitDePrensa.tsx`:**

| Location | Current | New |
|---|---|---|
| line 49 | "con 16 planes estratégicos" | "con 22 planes estratégicos" |
| line 53 | "(16 planes estratégicos completos…)" | "(22 planes estratégicos completos…)" |
| line 61 | "los 16 planes estratégicos" + "16 planes estratégicos completos que cubren…" | "los 22 planes estratégicos" + "22 planes estratégicos completos que cubren…" — expand the enumeration of covered areas to include the 6 new ones |
| line 496 | "Los 16 planes estratégicos — Diseño de País" | "Los 22 planes estratégicos — Diseño de País" |
| line 667 | "16 planes estratégicos auditables" | "22 planes estratégicos auditables" |

The new areas that must appear in the enumeration on line 61: mesa civil deliberativa, talleres federales, cuidado y vínculo, memoria operativa, tierra y pueblos originarios, movilidad y logística.

**Add 6 new plan cards to the `plans` array in `KitDePrensa.tsx` (currently lines 124–139, 16 entries):**

The cards follow the existing shape `{ code, name, icon, desc }`. Proposed icon and one-line description per plan:

| code | name | icon (lucide) | desc (one line, ≤180 chars) |
|---|---|---|---|
| PLANMESA | Mesa Civil | `Users` | Corteza deliberativa: mesas ciudadanas institucionales, cédula civil y dietas de servicio. Representación rotativa sin profesionalización política. |
| PLANTALLER | Talleres Federales | `Hammer` | Red nacional de talleres productivos federales. Galpones públicos + Red Bastarda: manos que producen, formación en oficios y recuperación del empleo con sentido. |
| PLANCUIDADO | Cuidado y Vínculo | `HeartHandshake` | Capa cero del sistema: infancia, mayores, discapacidad y salud mental. Fondo Federal de Cuidado y jornada 6+2 para que cuidar no sea invisible. |
| PLANMEMORIA | Memoria Operativa | `Archive` | Columna memorial: archivo vivo del país. Convenios con universidades y el Archivo General para que lo aprendido no se vuelva a perder. |
| PLANTER | Tierra, Subsuelo y Pueblos Originarios | `Mountain` | Raíz territorial: soberanía sobre tierra y subsuelo, con Fondo Soberano Ciudadano de regalías extractivas que paga dividendo a todos. |
| PLANMOV | Movilidad, Logística y Conectividad Territorial | `Route` | Arterias del país: reconstrucción ferroviaria, hidrovía, corredores federales y logística soberana. 20 años, financiamiento mixto. |

Descriptions are intentionally short because these plans need platform-level detail pages later — not in this pass. They match the density and tone of the existing 16 descriptions on the same page.

**Home/vision surfaces:** do a codebase-wide grep for `16 planes`, `17 planes`, `17+ PLAN`, `16 PLAN`, and any similar form. Replace with `22 planes` / `22 PLAN` consistently. Do one commit for the count sweep so it's easy to audit.

### 2c. Status badge system

**New component:** `client/src/components/StatusBadge.tsx`

Interface:

```tsx
type StatusKind = 'activo' | 'beta' | 'desarrollo' | 'idealizado';

interface StatusBadgeProps {
  kind: StatusKind;
  size?: 'sm' | 'md';
  className?: string;
}
```

Visual contract (dark-theme, consistent with the existing glass palette):

| kind | label | dot color | background |
|---|---|---|---|
| `activo` | Activo | emerald `#10B981` | `bg-white/5 border-white/10` |
| `beta` | En beta | cyan `#22D3EE` | `bg-white/5 border-white/10` |
| `desarrollo` | En desarrollo | amber `#F59E0B` | `bg-white/5 border-white/10` |
| `idealizado` | Diseño idealizado | gold `#C8A64A` | `bg-white/5 border-white/10` |

Single pill shape (`rounded-full px-2.5 py-1`), `text-xs font-medium`, `JetBrains Mono` for the label, leading dot of 6×6 px. No hover state, no interactivity — this is a label, not a button.

**Placement:**

| Surface | Badge kind |
|---|---|
| Every plan card in the `plans` array on KitDePrensa and on `UnaRutaParaArgentina` plan lists (all 22) | `idealizado` |
| Home/vision: sections that describe specific platform features (Diagnóstico, El Mapa, Mandato Vivo, Círculos, Coaching IA) | `activo` / `beta` / `desarrollo` based on current maturity — this spec does not assign maturity per feature; a separate editorial pass decides |

The badge on plan cards is not optional or conditional — all 22 plans share the `idealizado` status by construction. This is the visual instantiation of the "Diseño Idealizado" framing block from 2a.

### 2d. Memory + doc updates

- Update `/Users/juanb/.claude/projects/-Users-juanb-Desktop-ElInstantedelHombreGris/memory/project_basta_ten_mandates.md` to reflect 22 plans instead of 10+/17+. Add a clarifying sentence that PLANRUTA is the meta-plan and is not counted.
- Grep every `CLAUDE.md`, `AGENTS.md`, or equivalent instruction file in the repo for "17+ PLAN", "17 planes", "10+ PLAN", "16 planes", "16 PLAN", or "4 planes" and update each match to "22 PLANes (al 23 de abril de 2026)." At minimum this includes the root `CLAUDE.md` at `/Users/juanb/Desktop/ElInstantedelHombreGris/CLAUDE.md`.
- Update `BRAND_MEDIA_PACKAGE.md` sections that mention "16 strategic plans" / "17+ PLANs" / "4 planes" — replace with the resolved "22 planes estratégicos (al 23 de abril de 2026), framed as idealized design."

---

## Section 3 — Visual language unification

### 3a. Tailwind tokens

Add two accent colors to `SocialJusticeHub/tailwind.config.ts`:

```ts
colors: {
  // ...existing...
  silver: '#C8CDD2',       // Argentina silver — press/about/footer headlines, dividers
  'silver-dim': '#8A8F95', // Silver in muted contexts (subdued text on silver)
  gold: '#C8A64A',         // Refined gold — emblem accents, ceremonial CTAs
  'gold-shadow': '#8A6A24',// Gold depth/shadow
}
```

Do not retire iris-violet or change the global background. Silver/gold become an accent layer, not a replacement.

### 3b. Emblem in footer and press-kit hero

- **Footer:** replace the current `HG` text-mark wherever it appears in the footer (`components/Layout.tsx` or equivalent — confirm file during implementation) with `<img src="/press-kit/logo-principal.svg" alt="El Instante del Hombre Gris emblem" />`, sized 32px.
- **Press-kit hero (`KitDePrensa.tsx`):** replace the current gradient-headed hero with a charcoal (`#0A0A0A`) base, the metallic emblem (use `el-instante-logo-metallic-hero-1024.png`) centered or top-left at a prominent size, and silver-toned typography for title/subtitle. Keep the Playfair Display title. Remove any iris-violet gradient backgrounds from this page specifically.

### 3c. Scope fence

No other pages get visual changes in this spec. `Home`, `LaVision`, `ElMapa`, `MandatoTerritorial`, `Circulos`, and the product surfaces stay on the existing dark/purple/glass system. Only `KitDePrensa.tsx` gets a new look, plus the footer emblem swap that is global.

---

## Rollout order (commits on `main`)

1. **Commit A:** Section 1.1 + 1.2 — move the 5 SVGs and redraw them around the real emblem. Verify with `curl -I`.
2. **Commit B:** Section 1.3 — add the metallic hero PNGs.
3. **Commit C:** Section 2a — "Diseño Idealizado" framing block on the three surfaces.
4. **Commit D:** Section 2b — count sweep (16 → 22) + 6 new plan cards.
5. **Commit E:** Section 2c — `StatusBadge` component + placement.
6. **Commit F:** Section 2d — memory + CLAUDE.md + BRAND_MEDIA_PACKAGE.md updates.
7. **Commit G:** Section 3a + 3b + 3c — Tailwind tokens, footer emblem, press-kit hero restyle.

Each commit runs `npm run check` and `npm run check:routes` locally before being pushed. Working tree ends clean.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| The simplified emblem SVGs look materially worse than the metallic PNG and the brand degrades | Metallic hero PNGs are shipped in parallel (Section 1.3). Any context where SVG looks weak can swap to the PNG. |
| Grep for "16" / "17" produces false positives (e.g., "17 años", "16 dimensiones") | Use anchored patterns: `16 planes`, `16 PLAN`, `17 planes`, `17\+ PLAN`, `17 mandatos`. Review each match manually before replacing. |
| The 6 new plan cards' one-line descriptions drift from how the respective markdown docs describe each plan, once those docs are written | Descriptions here are explicitly derived from `shared/arquitecto-data.ts` metadata. When markdown docs are published, re-align if needed. |
| Footer emblem swap touches many pages indirectly via shared layout | Treat Commit G as the last commit and smoke-test every major page manually after. |
| Tailwind token addition collides with an existing `silver` or `gold` name | Pre-implementation, `grep` the config and class usage. If collision, prefix with `ceremonial-` (`ceremonial-silver`, `ceremonial-gold`). |

## Success criteria

- Every `/press-kit/*.svg` and `/press-kit/*.png` URL returns the correct asset with the correct content-type after deploy.
- No string in `client/src/`, `shared/`, `server/`, `BRAND_MEDIA_PACKAGE.md`, `CLAUDE.md`, or memory files says "16 planes", "17 planes", "17+ PLAN", or "4 planes." All resolved references say "22 planes."
- `KitDePrensa.tsx` plan list renders all 22 cards with a `Diseño idealizado` status badge on each.
- `UnaRutaParaArgentina.tsx`, `KitDePrensa.tsx`, and any plan-listing home/vision surface display the "Diseño Idealizado" framing block above the plan list.
- Footer emblem is the real silver/gold emblem, not an `HG` placeholder, on every page.
- `npm run check` and `npm run check:routes` pass.
- Manual smoke test: load home, la-vision, el-mapa, mandato-territorial, kit-de-prensa, una-ruta-para-argentina — no console errors, no visual regressions on non-press surfaces.
