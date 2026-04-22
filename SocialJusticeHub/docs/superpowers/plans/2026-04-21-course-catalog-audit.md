# Course Catalog Audit

Date: 2026-04-21

## Scope

Audit of the generated course catalog in `SocialJusticeHub/content/courses`.

- Courses audited: 31
- Lessons audited: 344
- Quiz questions audited: 298
- Total lesson text scanned: 173,934 words

## Method

I audited the catalog on four axes:

1. Structural integrity: manifests, lesson files, quiz files, embedded assets.
2. Content depth: lesson counts, per-course average word counts, extreme outliers.
3. Editorial consistency: authoring format, tone, terminology, emoji/style density.
4. Platform readiness: duration metadata, SEO metadata, thumbnail sourcing, quiz coverage.

Representative lesson files were reviewed manually after the full corpus scan to confirm whether numeric outliers were real quality problems or false positives.

## Executive Summary

The catalog is structurally presentable but not editorially publication-ready.

- 1 course is partially unfinished, not just uneven.
- 5 courses are materially too thin, averaging under 300 words per lesson.
- 7 more courses sit in the 300-400 word band and need expansion.
- 30 of 31 courses are authored as raw HTML inside `.md` files.
- 13 of 31 courses use inline styles in every lesson, which couples content to presentation.
- 13 of 31 courses contain emoji-heavy lesson styling.
- 6 courses mix English terminology into a Spanish-first curriculum at noticeable frequency.
- 31 of 31 course manifests are missing optional SEO/review metadata (`seoTitle`, `seoDescription`, `searchSummary`, `ogImageUrl`, `lastReviewedAt`).
- 31 of 31 course thumbnails are remote Unsplash URLs rather than managed local assets.
- 2 embedded lesson images point to missing public assets.
- Duration metadata is unreliable across the catalog; the declared lesson durations imply only 7 to 39 words per minute.

## What Is Working

- No course is missing its base `course.json`.
- No course is missing its `quiz.json`.
- Lesson manifests, titles, keys, and file paths are internally consistent.
- Several courses already have solid narrative depth and can be preserved with targeted cleanup instead of heavy rewriting.

## Critical Findings

### 1. One course is incomplete

`teoria-juegos-argentina-hombre-gris` is the only course that is clearly not finished.

- 7 lessons are blueprint cards rather than completed lessons.
- Example files:
  - `SocialJusticeHub/content/courses/teoria-juegos-argentina-hombre-gris/lessons/05-05-modulo-4-senales-informacion-y-reputacion-publica.md`
  - `SocialJusticeHub/content/courses/teoria-juegos-argentina-hombre-gris/lessons/06-06-modulo-5-coordinacion-y-diseno-de-mecanismos.md`
  - `SocialJusticeHub/content/courses/teoria-juegos-argentina-hombre-gris/lessons/07-07-modulo-6-tit-for-tat-avanzado-y-repertorio-de-estrategias.md`
  - `SocialJusticeHub/content/courses/teoria-juegos-argentina-hombre-gris/lessons/08-08-modulo-7-estrategias-argentinas-casos-y-contraejemplos.md`
  - `SocialJusticeHub/content/courses/teoria-juegos-argentina-hombre-gris/lessons/09-09-modulo-8-simulaciones-y-laboratorios-territoriales.md`
  - `SocialJusticeHub/content/courses/teoria-juegos-argentina-hombre-gris/lessons/10-10-modulo-9-diseno-institucional-y-enforcement-cooperativo.md`
  - `SocialJusticeHub/content/courses/teoria-juegos-argentina-hombre-gris/lessons/11-11-modulo-10-plan-de-accion-metricas-y-escalamiento.md`
- The shortest lessons in the whole catalog are here: 81 to 95 words.

### 2. Broken embedded assets exist

Two lesson image references point to a missing public file:

- `/course-graphics/hombre-gris/payoff-evolution.svg`
- Affected lessons:
  - `SocialJusticeHub/content/courses/teoria-juegos-argentina-hombre-gris/lessons/02-02-modulo-1-fundamentos-y-lenguaje-comun.md`
  - `SocialJusticeHub/content/courses/teoria-juegos-argentina-hombre-gris/lessons/04-04-modulo-3-juegos-repetidos-e-iterados.md`

### 3. Catalog-wide duration metadata is not calibrated

Every course appears overstated relative to its text volume.

- Best case: `caja-herramientas-ciudadanas` still only implies 39 wpm.
- Worst case: `teoria-juegos-argentina-hombre-gris` implies 7 wpm.
- Largest course-level mismatches:
  - `argentina-sistema-viviente-primeros-principios`: 300 advertised minutes vs 925 lesson minutes.
  - `teoria-juegos-argentina-hombre-gris`: 420 vs 740.
  - `diseno-idealizado-sistemas-vivos`: 400 vs 230.
  - `resiliencia-y-proposito`: 300 vs 215.

### 4. The authoring format is inconsistent and hard to maintain

- 30 of 31 courses are raw HTML inside `.md`.
- Only `la-vision-de-transformacion` reads like a true Markdown-authored course.
- 13 courses use inline styles in every lesson.
- The current approach mixes content, layout, color, spacing, and instructional copy into the same file, which makes later revision much slower and increases the chance of rendering inconsistencies.

### 5. Catalog depth is uneven

Courses averaging under 300 words per lesson:

- `arquitectura-organizaciones-distribuidas` (284)
- `como-funciona-argentina-anatomia-estado` (234)
- `primeros-pasos-organizar-tu-barrio` (283)
- `redes-territoriales-barrio-provincia` (287)
- `sobrevivir-prosperar-economia-argentina` (224)

Courses averaging 300 to 400 words per lesson:

- `alfabetismo-mediatico-desinformacion` (335)
- `ciudadano-auditor-control-ciudadano` (317)
- `datos-para-bien-comun` (321)
- `diseno-instituciones-queja-propuesta` (347)
- `emprendimiento-con-proposito` (369)
- `patrones-argentinos-debemos-romper` (345)
- `sistemas-economicos-ciclo-argentino` (343)

This is the main depth problem in the catalog: too many courses read like strong outlines rather than finished lessons.

### 6. Quiz coverage is uneven

Severely under-covered:

- `argentina-sistema-viviente-primeros-principios`: 31 lessons, 10 questions.

Lightly under-covered:

- `argentina-1810-1945-sistema-que-construimos`: 12 lessons, 8 questions.
- `argentina-1945-2001-pendulo-nunca-para`: 12 lessons, 8 questions.
- `gestion-proyectos-comunitarios`: 12 lessons, 8 questions.
- `narrativas-que-transforman-historias`: 11 lessons, 8 questions.
- `patrones-argentinos-debemos-romper`: 12 lessons, 8 questions.

### 7. Language and tone drift exist

English-heavy or mixed-language courses:

- `argentina-sistema-viviente-primeros-principios`
- `diseno-idealizado-sistemas-vivos`
- `fundamentos-pensamiento-comprension-aprendizaje`
- `la-vision-de-transformacion`
- `liderazgo-distribuido`
- `teoria-juegos-argentina-hombre-gris`

The main issue is not isolated jargon; it is inconsistent naming across the same Spanish curriculum: `game theory`, `feedback loops`, `control theory`, `complexity science`, `mindset`, `burnout`, `payoff`, `enforcement`, `input-output`, `blueprint`.

## Editorial Standard Recommended Before Rewriting

Use this as the target baseline for all edits:

- Beginner/intermediate lessons: 500 to 800 words each.
- Advanced lessons: 650 to 1,000 words each.
- Quizzes: baseline of 1 question per lesson, or split long courses into multiple assessments.
- Format: Markdown-first. Reserve HTML for tables, diagrams, or unavoidable custom structures.
- Language: Spanish-first. Translate technical concepts on first mention and keep one naming convention.
- Visual treatment: move color, boxes, and spacing into renderer/components, not lesson bodies.
- Duration: derive from lesson text + exercise time, not aspirational estimates.
- Assets: use managed local/public files or verified remote sources, never dangling paths.
- Metadata: populate SEO fields and `lastReviewedAt` for every course.

## Priority Map

### P0: Finish Before Any Broader Polish

- `teoria-juegos-argentina-hombre-gris`
  - Replace 7 blueprint lessons with finished instructional content.
  - Repair missing SVG references.
  - Normalize terminology across all 10 lessons.
  - Recompute all durations after the rewrite.

### P1: Major Rewrite / Restructure

- `argentina-sistema-viviente-primeros-principios`
  - Split into 2 or 3 courses, or cut to a tighter 12-16 lesson core.
  - Expand quiz coverage dramatically.
  - Translate repeated English terminology.
  - Remove emoji-heavy presentation from lesson bodies.

- `como-funciona-argentina-anatomia-estado`
  - Expand all lessons to full explanatory units.
  - Add more concrete Argentine institutional examples.
  - Rebuild the final territorial diagnosis lesson.

- `sobrevivir-prosperar-economia-argentina`
  - Rewrite as a real practical curriculum instead of a sequence of short listicles.
  - Add worked examples, frameworks, and exercises.
  - Reduce over-reliance on app/tool mentions.

- `primeros-pasos-organizar-tu-barrio`
  - Deepen every operational lesson.
  - Add facilitation scripts, templates, and conflict cases.

- `arquitectura-organizaciones-distribuidas`
  - Expand shallow lessons.
  - Add concrete protocols, tradeoffs, and examples from actual organizations.

- `redes-territoriales-barrio-provincia`
  - Expand from outline-level copy into actionable coalition-building playbooks.
  - Add territorial case logic and escalation paths.

- `argentina-1810-1945-sistema-que-construimos`
  - Deepen historical causality and synthesis.
  - Add stronger lesson conclusions and assessment coverage.

- `argentina-1945-2001-pendulo-nunca-para`
  - Same action as the 1810-1945 course.
  - The two history courses should be normalized as a pair.

- `patrones-argentinos-debemos-romper`
  - Move from slogan-level pattern naming to deeper causal diagnosis and interventions.
  - Strengthen final design section with operational detail.

### P2: Targeted Expansion / Style Normalization

- `alfabetismo-mediatico-desinformacion`
  - Expand thin lessons.
  - Tighten source examples and platform-specific tactics.

- `ciudadano-auditor-control-ciudadano`
  - Deepen legal workflows and evidence-gathering procedures.
  - Add more procedural examples.

- `datos-para-bien-comun`
  - Expand analysis methods and practice exercises.
  - Reduce list-driven sections.

- `diseno-idealizado-sistemas-vivos`
  - Normalize duration math.
  - Reduce presentation-heavy inline HTML.
  - Clarify terminology around blueprint/system design.

- `diseno-instituciones-queja-propuesta`
  - Expand policy-design examples.
  - Translate `mindset` and similar mixed terms.

- `emprendimiento-con-proposito`
  - Expand lesson depth and local operating detail.

- `fundamentos-pensamiento-comprension-aprendizaje`
  - Translate mixed terminology.
  - Reduce emoji/presentation density.
  - Normalize durations.

- `gestion-proyectos-comunitarios`
  - Rebalance long case-study lessons against shorter conceptual ones.
  - Add quiz coverage.

- `introduccion-al-hombre-gris`
  - Preserve core writing.
  - Normalize presentation markup and duration metadata.

- `accion-comunitaria`
  - Preserve core narrative.
  - Remove style-heavy lesson wrappers and normalize duration.

- `comunicar-sin-polarizar-conversacion-valiente`
  - Preserve content strength.
  - Reduce layout HTML and standardize formatting.

- `liderazgo-distribuido`
  - Translate mixed terminology.
  - Reduce emoji-heavy styling.

- `la-metamorfosis`
  - Preserve narrative strength.
  - Normalize style treatment and assessment balance.

- `niveles-superiores-pensamiento-conciencia`
  - Expand selected lessons.
  - Translate mixed terminology where needed.
  - Move SVG-heavy presentation logic out of lesson prose where possible.

- `resiliencia-y-proposito`
  - Preserve text quality.
  - Recalibrate durations and normalize markup.

- `sistemas-economicos-ciclo-argentino`
  - Expand conceptual depth and add more worked Argentine examples.

- `la-vision-de-transformacion`
  - Preserve as one of the stronger courses.
  - Standardize terminology and add metadata; no heavy rewrite needed.

- `caja-herramientas-ciudadanas`
  - Preserve core instructional value.
  - Normalize format and durations.

### P3: Metadata / Light Polish Only

- `economia-familiar-comunitaria`
  - Mostly strong. Needs metadata, duration calibration, and selective tightening of overlong lessons.

- `inteligencia-emocional-tiempos-turbulentos`
  - Mostly strong. Needs metadata, duration calibration, and minor terminology cleanup.

- `narrativas-que-transforman-historias`
  - Mostly strong. Needs metadata, quiz expansion, and light terminology cleanup.

## Recommended Execution Order

### Phase 1: Catalog Standards

- Define the final lesson template.
- Lock the target word-count bands.
- Lock terminology rules for technical concepts in Spanish.
- Decide whether course durations will be auto-derived or manually edited.

### Phase 2: Critical Repair

- Finish `teoria-juegos-argentina-hombre-gris`.
- Repair missing assets.
- Remove any remaining blueprint/stub language from publishable lessons.

### Phase 3: High-Impact Rewrites

Do these next because they have the biggest reader-facing quality gap:

- `argentina-sistema-viviente-primeros-principios`
- `como-funciona-argentina-anatomia-estado`
- `sobrevivir-prosperar-economia-argentina`
- `primeros-pasos-organizar-tu-barrio`
- `arquitectura-organizaciones-distribuidas`
- `redes-territoriales-barrio-provincia`
- `argentina-1810-1945-sistema-que-construimos`
- `argentina-1945-2001-pendulo-nunca-para`
- `patrones-argentinos-debemos-romper`

### Phase 4: Expansion and Normalization Batch

- Expand the 300-400 average-word courses.
- Normalize the HTML-heavy courses toward Markdown-first authoring.
- Standardize lesson endings, exercises, and quiz density.

### Phase 5: Catalog Hardening

- Add SEO metadata to all 31 courses.
- Replace remote thumbnails with managed local assets if possible.
- Recompute durations consistently.
- Run a second audit pass and freeze a content quality checklist.

## Immediate Next Editing Batch I Recommend

If the goal is to start editing right away, begin with this order:

1. `teoria-juegos-argentina-hombre-gris`
2. `como-funciona-argentina-anatomia-estado`
3. `sobrevivir-prosperar-economia-argentina`
4. `primeros-pasos-organizar-tu-barrio`
5. `arquitectura-organizaciones-distribuidas`
6. `argentina-sistema-viviente-primeros-principios`

This sequence fixes the only incomplete course first, then addresses the thinnest/highest-visibility civic and practical courses, then tackles the oversized systems course.
