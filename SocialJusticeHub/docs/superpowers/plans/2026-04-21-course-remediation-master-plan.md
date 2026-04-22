# Course Catalog Remediation Master Plan

Date: 2026-04-21

Primary audit reference: `SocialJusticeHub/docs/superpowers/plans/2026-04-21-course-catalog-audit.md`

## Mission

Fix every issue identified in the course catalog audit and do not declare the program complete until the catalog is structurally valid, editorially consistent, SEO-complete, asset-safe, and fully operational in the product.

This plan treats the work as a full remediation program, not a loose backlog.

## Non-Negotiable Completion Rule

The program is not done until all of the following are true:

1. Every course in `SocialJusticeHub/content/courses` has completed publishable content.
2. No lesson contains blueprint/stub language or placeholder structure.
3. No lesson references a missing asset.
4. No course depends on remote Unsplash thumbnails.
5. Every course has complete SEO/review metadata.
6. Every course duration and lesson duration is recalibrated from content reality.
7. Every course quiz meets the target coverage threshold.
8. The catalog passes structural validation, content-quality validation, sync, build, and prerender QA.
9. A final manual review confirms the course hub, course pages, lesson pages, and quiz pages render correctly.

## Definition of Done

### Catalog-wide

- `npm run courses:validate` passes.
- `npm run courses:sync` passes.
- `npm run courses:audit` passes.
- `npm run build` passes.
- `npm run courses:qa` passes.
- `npm run verify:full` passes.
- New content-quality gate passes with zero blockers.

### Per course

- Course metadata complete.
- Lesson set complete and internally coherent.
- Quiz complete and aligned to lessons.
- Thumbnails and OG images resolved to local/public assets.
- Lesson formatting normalized to the approved content contract.
- Duration and assessment counts recalibrated.
- Manual UI review completed for:
  - course detail page
  - first lesson
  - last lesson
  - quiz page

## Target Standards

### Lesson depth

- Beginner/intermediate lessons: 500 to 800 words.
- Advanced lessons: 650 to 1,000 words.
- Exception rule: case-study or synthesis lessons may exceed this when justified, but must still be well-structured and proportionate.

### Quiz coverage

- Standard courses: at least 1 question per lesson.
- Long-form courses over 16 lessons: either 1 question per lesson or a split/restructured course. Do not leave a 30+ lesson course with a short quiz.

### Language

- Spanish-first terminology across the entire catalog.
- Technical terms may appear in English only on first mention if immediately translated and then normalized.
- Use one preferred term per concept:
  - `teoría de juegos` over `game theory`
  - `retroalimentación` or `bucles de retroalimentación` over `feedback loops`
  - `teoría de control` over `control theory`
  - `ciencia de la complejidad` over `complexity science`
  - `mentalidad` over `mindset`
  - `agotamiento` or `burnout (agotamiento)` on first mention only
  - `recompensa esperada` or `incentivo` over `payoff`, depending on context

### Formatting

- Markdown-first source files.
- Raw HTML allowed only when unavoidable for:
  - tables
  - embedded diagrams
  - audited SVG blocks pending asset extraction
- Inline `style=` is not allowed in lesson bodies after remediation.
- Emoji should not be used as layout scaffolding or heading decoration in instructional content.

### Duration

- Recalculate all lesson durations from:
  - reading time
  - exercise time
  - media/document time if present
- Course duration must equal the sum of lesson durations within a tolerance of +/- 5 minutes.

### Metadata

Every course must have:

- `seoTitle`
- `seoDescription`
- `searchSummary`
- `ogImageUrl`
- `lastReviewedAt`
- stable local `thumbnailUrl`

Every lesson must have:

- accurate `description`
- `searchSummary` where useful
- `seoTitle` when the lesson title is insufficiently specific
- `seoDescription` when the default summary is weak

## Workstreams

## W0. Program Control And Baseline

Purpose: create a controlled remediation loop so the work does not drift.

Tasks:

- Freeze the current audit as the baseline record.
- Create a remediation tracker document or table that records status per course.
- Run the current structural toolchain before edits:
  - `npm run courses:validate`
  - `npm run courses:audit`
  - `npm run build`
  - `npm run courses:qa`
- Log failures separately from editorial issues.

Deliverables:

- baseline command log
- per-course tracker
- remediation branch/work log

Done when:

- baseline is recorded
- every future batch can be compared against a stable starting point

## W1. Add The Missing Quality Gates

Purpose: prevent recurrence of the exact issues found in the audit.

Current gap:

`scripts/courses-cli.ts` validates package/database consistency, but it does not enforce actual content quality.

Required code changes:

- Extend `SocialJusticeHub/scripts/courses-cli.ts` or add a new dedicated content audit script.
- Add a new package script such as `courses:lint-content`.
- Add the new gate to `verify:full`.

Checks to implement:

- detect blueprint/stub markers:
  - `blueprint`
  - `lessons-overhaul`
  - `placeholder`
  - `coming soon`
  - `por definir`
- detect missing public assets from lesson image references
- detect remote thumbnails
- detect missing SEO/review metadata
- detect quiz undercoverage vs lesson count
- detect lesson average word-count thresholds
- detect outlier lessons that are too short
- detect duration mismatches
- detect high English-term density
- detect inline-style usage in lesson source
- detect emoji-heavy lesson formatting

Deliverables:

- new or expanded content audit script
- package.json script wiring
- failing build when blockers remain

Done when:

- the content-quality audit produces actionable errors and warnings
- the catalog cannot regress without the build catching it

## W2. Normalize The Content Contract

Purpose: stop mixing presentation and instructional content.

Required code review targets:

- `SocialJusticeHub/client/src/components/MarkdownRenderer.tsx`
- `SocialJusticeHub/shared/course-content.ts`
- any related rendering or sync paths that assume raw HTML

Tasks:

- Adopt Markdown-first as the authoring source of truth.
- Keep compatibility for existing raw HTML only during migration.
- Remove inline `style=` from lessons as they are touched.
- Decide whether diagrams stay as inline SVG temporarily or move to `public/`.
- Document the approved lesson template:
  - title
  - opening framing paragraph
  - 3 to 6 main sections
  - at least one example, exercise, or application block
  - recap or takeaway

Deliverables:

- written lesson template
- renderer compatibility decision
- migration rules for HTML-heavy lessons

Done when:

- lesson authorship is predictable
- content edits no longer require hand-tuning layout HTML

## W3. Asset And Thumbnail Remediation

Purpose: eliminate missing assets and unstable external image dependencies.

Tasks:

- Repair `/course-graphics/hombre-gris/payoff-evolution.svg`.
- Audit all lesson image references again after repairs.
- Create a local thumbnail/OG image strategy under `SocialJusticeHub/public/`.
- Replace all remote `thumbnailUrl` values with local assets.
- Set `ogImageUrl` explicitly for every course.

Recommended file structure:

- `SocialJusticeHub/public/course-thumbnails/<slug>.svg`
- `SocialJusticeHub/public/course-og/<slug>.png` or `.svg`
- `SocialJusticeHub/public/course-graphics/<course-slug>/...`

Deliverables:

- 31 local thumbnails
- 31 OG images or a deterministic branded template
- zero broken asset references

Done when:

- no lesson or course depends on missing or remote visual assets

## W4. Metadata And SEO Completion

Purpose: fill all currently empty metadata fields and ensure prerender QA remains accurate.

Relevant code:

- `SocialJusticeHub/shared/course-seo.ts`
- `SocialJusticeHub/scripts/prerender-course-seo.ts`
- `SocialJusticeHub/scripts/courses-qa.ts`

Tasks:

- Populate course-level metadata in every `course.json`.
- Set `lastReviewedAt` for every course.
- Add or refine lesson-level `searchSummary`, `seoTitle`, `seoDescription` as needed.
- Ensure metadata is not repetitive or machine-generic.

Deliverables:

- 31 fully populated course manifests
- lesson metadata where required
- successful SEO prerender QA after sync/build

Done when:

- metadata fields are complete and meaningful, not placeholder text

## W5. Duration Recalibration

Purpose: make duration claims credible.

Tasks:

- Define a deterministic duration formula.
- Recalculate every lesson duration.
- Recalculate every course duration from lesson totals.
- Recheck the four worst mismatches first:
  - `argentina-sistema-viviente-primeros-principios`
  - `teoria-juegos-argentina-hombre-gris`
  - `diseno-idealizado-sistemas-vivos`
  - `resiliencia-y-proposito`

Recommended formula:

- reading minutes = `ceil(wordCount / 170)`
- exercise minutes = explicit exercise estimate added per lesson
- media/document minutes = explicit if present
- lesson duration = reading + exercise + media/document
- course duration = sum of lessons

Done when:

- lesson durations feel plausible in UI
- course duration equals lesson sum within tolerance

## W6. Quiz Remediation

Purpose: align assessment with actual lesson coverage.

Tasks:

- Increase every under-covered quiz to the target threshold.
- Ensure each question maps to lesson learning outcomes.
- Review answer quality, distractors, and explanations.

Mandatory first fixes:

- `argentina-sistema-viviente-primeros-principios`
- `argentina-1810-1945-sistema-que-construimos`
- `argentina-1945-2001-pendulo-nunca-para`
- `gestion-proyectos-comunitarios`
- `narrativas-que-transforman-historias`
- `patrones-argentinos-debemos-romper`

Done when:

- quiz density matches lesson density
- questions test course substance instead of superficial recall only

## W7. Course Content Remediation Waves

Purpose: fix the actual educational material in an order that reduces risk quickly.

### Wave 1: Critical Completion

1. `teoria-juegos-argentina-hombre-gris`

Required fixes:

- Rewrite the 7 blueprint lessons into full lessons.
- Repair missing image assets.
- Normalize terminology across all lessons.
- Replace HTML-heavy blueprint wrappers with real course content.
- Recompute durations.
- Reconfirm quiz alignment.

Exit criteria:

- no blueprint markers
- no broken assets
- all lessons full-length
- terminology normalized

### Wave 2: Thin Civic And Practical Courses

2. `como-funciona-argentina-anatomia-estado`
3. `sobrevivir-prosperar-economia-argentina`
4. `primeros-pasos-organizar-tu-barrio`
5. `arquitectura-organizaciones-distribuidas`
6. `redes-territoriales-barrio-provincia`

Required fixes:

- expand all sub-300-word lessons
- add concrete examples, workflows, and exercises
- reduce listicle structure
- normalize formatting and durations

Exit criteria:

- each course reaches the lesson depth target
- each course reads like a completed program, not an outline

### Wave 3: Oversized Or Structurally Uneven Courses

7. `argentina-sistema-viviente-primeros-principios`
8. `argentina-1810-1945-sistema-que-construimos`
9. `argentina-1945-2001-pendulo-nunca-para`
10. `patrones-argentinos-debemos-romper`

Required fixes:

- restructure oversized or shallowly distributed material
- deepen historical/causal reasoning
- normalize paired/history course design
- add quiz coverage

Specific decision for `argentina-sistema-viviente-primeros-principios`:

- keep the public slug, but reduce the course to a coherent core of 12 to 16 lessons
- move overflow topics into follow-on courses only if necessary
- do not leave the current 31-lesson sprawl in place

Exit criteria:

- the course scope is coherent
- assessment matches the new structure

### Wave 4: Mid-Depth Expansion And Normalization

11. `alfabetismo-mediatico-desinformacion`
12. `ciudadano-auditor-control-ciudadano`
13. `datos-para-bien-comun`
14. `diseno-instituciones-queja-propuesta`
15. `emprendimiento-con-proposito`
16. `sistemas-economicos-ciclo-argentino`

Required fixes:

- expand 300-400 average-word lessons
- add more applied examples
- fix mixed terminology where present
- clean up formatting

### Wave 5: Strong Courses Needing Standardization, Not Reinvention

17. `accion-comunitaria`
18. `caja-herramientas-ciudadanas`
19. `comunicar-sin-polarizar-conversacion-valiente`
20. `diseno-idealizado-sistemas-vivos`
21. `fundamentos-pensamiento-comprension-aprendizaje`
22. `introduccion-al-hombre-gris`
23. `inteligencia-emocional-tiempos-turbulentos`
24. `la-metamorfosis`
25. `la-vision-de-transformacion`
26. `liderazgo-distribuido`
27. `narrativas-que-transforman-historias`
28. `niveles-superiores-pensamiento-conciencia`
29. `resiliencia-y-proposito`
30. `economia-familiar-comunitaria`

Required fixes:

- keep good prose
- normalize durations
- remove avoidable inline styles
- reduce emoji-heavy scaffolding
- fix mixed terminology
- complete metadata

### Wave 6: Final Sweep

31. all courses again, all at once

Purpose:

- catch cross-course drift after local fixes
- ensure tone, terminology, durations, assets, and metadata remain consistent after the whole batch is done

## Course-By-Course Fix Matrix

| Course | Tier | Primary defects | Required end state |
| --- | --- | --- | --- |
| `teoria-juegos-argentina-hombre-gris` | P0 | unfinished lessons, broken assets, mixed terminology, duration mismatch | fully rewritten, asset-safe, terminology-normalized, duration-correct |
| `argentina-sistema-viviente-primeros-principios` | P1 | oversized scope, quiz undercoverage, terminology drift, emoji/style overload | reduced/restructured core course with full quiz and clean language |
| `como-funciona-argentina-anatomia-estado` | P1 | very thin lessons | full civic explainer course with practical diagnostics |
| `sobrevivir-prosperar-economia-argentina` | P1 | very thin, listicle-like, tool-heavy | practical financial curriculum with examples and exercises |
| `primeros-pasos-organizar-tu-barrio` | P1 | very thin operational lessons | concrete neighborhood organizing playbook |
| `arquitectura-organizaciones-distribuidas` | P1 | very thin, emoji/style-heavy | full governance/protocol course with usable frameworks |
| `redes-territoriales-barrio-provincia` | P1 | very thin, outline-level | actionable network-building course |
| `argentina-1810-1945-sistema-que-construimos` | P1 | shallow causality, quiz undercoverage | stronger historical synthesis and full assessment |
| `argentina-1945-2001-pendulo-nunca-para` | P1 | shallow causality, quiz undercoverage | stronger historical synthesis and full assessment |
| `patrones-argentinos-debemos-romper` | P1 | thin pattern analysis, quiz undercoverage | deeper diagnosis + stronger intervention design |
| `alfabetismo-mediatico-desinformacion` | P2 | mid-depth, needs expansion | complete media literacy course with stronger examples |
| `ciudadano-auditor-control-ciudadano` | P2 | mid-depth, procedural thinness | stronger audit workflows and evidence handling |
| `datos-para-bien-comun` | P2 | mid-depth, method lightness | deeper data practice and analysis |
| `diseno-instituciones-queja-propuesta` | P2 | mid-depth, mixed terminology | deeper policy design course in normalized Spanish |
| `emprendimiento-con-proposito` | P2 | mid-depth | stronger local operating detail and examples |
| `sistemas-economicos-ciclo-argentino` | P2 | mid-depth | fuller systems analysis and applied examples |
| `accion-comunitaria` | P2 | style-heavy | preserve prose, normalize format and duration |
| `caja-herramientas-ciudadanas` | P2 | style-heavy | preserve value, normalize format and duration |
| `comunicar-sin-polarizar-conversacion-valiente` | P2 | HTML-heavy layout | preserve content, simplify structure and duration |
| `diseno-idealizado-sistemas-vivos` | P2 | duration mismatch, terminology drift, style-heavy | normalized duration, cleaned language, lighter formatting |
| `fundamentos-pensamiento-comprension-aprendizaje` | P2 | terminology drift, emoji/style-heavy | same core content with normalized presentation |
| `introduccion-al-hombre-gris` | P2 | formatting and duration drift | preserve content, standardize package |
| `la-metamorfosis` | P2 | formatting and assessment balance | preserve content, standardize package |
| `la-vision-de-transformacion` | P2 | mixed terminology, metadata missing | preserve strong markdown core, complete metadata and terminology |
| `liderazgo-distribuido` | P2 | mixed terminology, emoji/style-heavy | normalize language and presentation |
| `niveles-superiores-pensamiento-conciencia` | P2 | mixed formatting, SVG-heavy content | normalize format and isolate diagrams cleanly |
| `resiliencia-y-proposito` | P2 | duration mismatch | recalibrated duration + metadata + format cleanup |
| `economia-familiar-comunitaria` | P3 | metadata, duration, some overlong lessons | metadata complete, durations fixed, selective tightening |
| `inteligencia-emocional-tiempos-turbulentos` | P3 | metadata and duration | preserve content, complete package |
| `narrativas-que-transforman-historias` | P3 | metadata and quiz undercoverage | preserve content, expand quiz, complete metadata |

## Required Supporting Artifacts

These should be created or updated during the remediation:

- `SocialJusticeHub/docs/superpowers/plans/2026-04-21-course-remediation-master-plan.md`
- `SocialJusticeHub/docs/...` editorial style guide for course content
- content-quality audit script
- local thumbnail/OG asset library
- updated `package.json` verification pipeline

## Execution Sequence

1. Baseline current validations and build status.
2. Add missing content-quality gates.
3. Lock the lesson content contract and terminology map.
4. Repair assets and local thumbnail strategy.
5. Execute Wave 1 and re-run full validation.
6. Execute Wave 2 and re-run full validation.
7. Execute Wave 3 and re-run full validation.
8. Execute Wave 4 and re-run full validation.
9. Execute Wave 5 and re-run full validation.
10. Complete metadata, durations, and final thumbnail/OG pass across all courses.
11. Run the full command suite:
    - `npm run courses:validate`
    - `npm run courses:sync`
    - `npm run courses:audit`
    - `npm run build`
    - `npm run courses:qa`
    - `npm run verify:full`
12. Perform final manual review of course hub plus every edited course.
13. Reopen any failed item immediately; do not mark the program complete until the entire suite is green.

## Manual Review Checklist

For each course:

- thumbnail renders correctly
- metadata appears correct in page source
- course description and excerpt read naturally
- lesson order is correct
- first lesson renders correctly
- last lesson renders correctly
- no broken diagrams/images
- quiz page loads and uses the correct canonical/noindex behavior
- progress flow still works

## Command Protocol

Use this exact loop after each batch:

1. `npm run courses:validate`
2. `npm run courses:sync`
3. `npm run courses:audit`
4. `npm run build`
5. `npm run courses:qa`

Use this exact loop at program end:

1. `npm run verify:full`
2. manual UI review
3. final remediation checklist sign-off

## Completion Checklist

- [ ] W0 baseline complete
- [ ] W1 quality gates added
- [ ] W2 content contract normalized
- [ ] W3 assets and thumbnails fixed
- [ ] W4 metadata completed
- [ ] W5 durations recalibrated
- [ ] W6 quizzes remediated
- [ ] W7 Wave 1 complete
- [ ] W7 Wave 2 complete
- [ ] W7 Wave 3 complete
- [ ] W7 Wave 4 complete
- [ ] W7 Wave 5 complete
- [ ] final full validation green
- [ ] final manual review green

## Recommended Immediate Start Order

Start exactly here:

1. add the content-quality gate
2. fix `teoria-juegos-argentina-hombre-gris`
3. fix the five sub-300-word courses
4. restructure `argentina-sistema-viviente-primeros-principios`
5. expand quiz coverage in all under-covered courses
6. complete metadata and thumbnails across the whole catalog

If this order is followed, the program removes the highest user-facing quality risks first and prevents the same defects from returning later.
