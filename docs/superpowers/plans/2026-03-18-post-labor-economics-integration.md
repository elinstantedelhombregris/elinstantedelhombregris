# Post-Labor Economics Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate post-labor economics (Three Horizons, Perpetual Purpose Trusts, DNP, Contribution Economy, Citizen Panels) deeply into PLANEDU and PLANREP documents, making them future-proof against AI-driven labor transformation.

**Architecture:** 28 changes across two Markdown documents (~3,700 lines combined). Changes are grouped into 10 sequential tasks: PLANEDU small modifications first, then PLANEDU new sections, then PLANREP small modifications, then PLANREP new sections, then cross-references and sync. Each task produces a committable unit.

**Tech Stack:** Markdown documents. No code changes. Three file copies must stay in sync (SocialJusticeHub/client/public/docs/, Iniciativas Estratégicas/, SocialJusticeHub/dist/public/docs/). Primary editing happens in `SocialJusticeHub/client/public/docs/`, then copies are synced.

**Spec:** `docs/superpowers/specs/2026-03-18-post-labor-economics-integration-design.md`

**Voice & Style:** All new content must match the existing literary voice — rioplatense Spanish, Ackoff-inspired systems thinking, direct and passionate, with concrete data and tables. Read at least 2-3 sections of the target document before writing to calibrate tone.

---

## File Map

**Primary files (edit these):**
- `SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md` (1,371 lines)
- `SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md` (2,300 lines)

**Sync targets (copy after each task):**
- `Iniciativas Estratégicas/PLANEDU_Argentina_ES.md`
- `Iniciativas Estratégicas/PLANREP_Argentina_ES.md`
- `SocialJusticeHub/dist/public/docs/PLANEDU_Argentina_ES.md` (build artifact — sync optional)
- `SocialJusticeHub/dist/public/docs/PLANREP_Argentina_ES.md` (build artifact — sync optional)

**Reference (read-only):**
- `docs/superpowers/specs/2026-03-18-post-labor-economics-integration-design.md` — the full spec

**Note on strategic-initiatives.ts:** The summaries in `SocialJusticeHub/shared/strategic-initiatives.ts` reference PLANREP and PLANEDU but contain static summaries for the web app. These should be updated in a separate follow-up task after the documents are finalized — not as part of this plan.

---

## Task 1: PLANEDU — Preámbulo modifications (M1)

**Files:**
- Modify: `SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md` (lines 24-57)

**Context:** The preámbulo critiques the current system as designed for "obreros obedientes para fábricas del siglo XX" (line 30). We add the post-labor dimension and the Primera Mejor Alternativa framework.

- [ ] **Step 1: Read PLANEDU preámbulo (lines 24-57) to calibrate voice**

- [ ] **Step 2: Insert post-labor paragraph after line 30**

After the sentence "Ese mundo ya no existe. Pero la escuela sigue preparando gente para habitarlo." add a new paragraph. The content must convey: the education system is not just preparing for a world that no longer exists — it's not preparing for the world that IS coming. A world where AI transforms what "work" means. PLANEDU is designed in three temporal horizons and builds from day one the capabilities for navigating the deepest transition in human history.

Follow the spec M1 Inserción 1 for the exact content, but adapt to match the surrounding prose rhythm.

- [ ] **Step 3: Insert Primera Mejor Alternativa paragraph before line 57**

Before the "Tesis Central:" paragraph, insert the epistemic humility framework. Follow spec M1 Inserción 2. This paragraph establishes that everything PLANEDU proposes is the "first best alternative" — defended with rigor but designed to evolve through active listening (Citizen Panels, ANCE evaluation, public dashboards).

- [ ] **Step 4: Verify document renders correctly**

Run: Scan for broken markdown (unclosed tables, mismatched headers). Check that section flow reads naturally with the new paragraphs.

- [ ] **Step 5: Commit**

```bash
git add "SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md"
git commit -m "PLANEDU: Add post-labor awareness and Primera Mejor Alternativa to preámbulo (M1)"
```

---

## Task 2: PLANEDU — Small modifications (M2, M3, M4, M4b, M5)

**Files:**
- Modify: `SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md` (lines 236, 270-283, 287, 299, 502-513, 956-971)

**Context:** Five targeted edits across the existing document to shift from employment-anchored framing to contribution-capable framing.

- [ ] **Step 1: M4b — Line 236, Section 2.4 measurement priorities**

Change "portfolios, inserción laboral, bienestar" to "portfolios, inserción laboral y capacidad de contribución, bienestar".

- [ ] **Step 2: M2 — Section 4.1, Tabla 8, "Egresado ideal" row (~line 283)**

Change the Taller de Humanidad cell from "Persona con portfolio que demuestra capacidades" to "Persona con portfolio que demuestra capacidades para crear valor, contribuir a su comunidad, y diseñar una vida con sentido — independientemente de su situación laboral".

- [ ] **Step 3: M3 — Section 4.2, CREAR capacity (~line 287)**

After the existing one-line description of CREAR, add two sub-bullets:
- Crear sentido: no solo crear objetos, obras o proyectos sino diseñar tu vida como tu obra maestra
- Crear contribución: diseñar formas de aportar valor a tu comunidad que no requieren un empleador

- [ ] **Step 4: M3 — Section 4.2, CONOCER capacity (~line 299)**

After the existing one-line description of CONOCER, add three sub-bullets:
- Autoconocimiento existencial: quién soy más allá de lo que hago por trabajo
- Alfabetización económica post-laboral: entender fideicomisos de propósito perpetuo, DNP, economía de contribución, licencia social de automatización
- Pensamiento de futuros: scenario planning como habilidad ciudadana — no predecir el futuro sino prepararse para múltiples futuros posibles

- [ ] **Step 5: M4 — Section 7.4, Tabla 12 at line 502**

Add 3 new rows to the existing KPI table (matching its 6-column format). Exact rows:

| Capacidad de generar valor sin empleo formal | Portfolio de contribución independiente evaluado por ANCE | Programa piloto en 10 EdF | 30% de egresados EdF con proyecto de contribución activo | 60% | ANCE |
| Alfabetización post-laboral | Evaluación de comprensión de DNP, fideicomisos, economía de contribución | Módulo integrado en currículo de EdF | 50% de alumnos de 16+ demuestran comprensión | 80% | ANCE |
| Participación en deliberación de futuro económico | Registro de participación en Paneles Ciudadanos de Futuro | Paneles simulados operativos en 50 EdF | 10% de egresados participaron antes de los 20 | 25% | ANCE + Paneles Ciudadanos |

Also modify the existing "Inserción laboral/universitaria" row at line 513: change to "Inserción laboral, universitaria o contributiva de egresados EdF".

- [ ] **Step 6: M5 — Section 12.3, Pasantías (~line 956-971)**

After the existing pasantías table and explanation, add a new subsection introducing **Residencias de Contribución** as Horizonte 2 complement. The alumno spends time in a Nodo de Actividad (ex-Centro de la Vida) contributing to community projects — not as employee but as contributor. Documented in Portfolio Ciudadano Único.

- [ ] **Step 7: Verify all edits**

Read through each modified section to confirm: correct markdown formatting, consistent voice, no broken tables, natural flow with surrounding text.

- [ ] **Step 8: Commit**

```bash
git add "SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md"
git commit -m "PLANEDU: Post-labor modifications to capabilities, KPIs, pasantías (M2-M5)"
```

---

## Task 3: PLANEDU — New Section "Educar para Tres Futuros" (N1)

**Files:**
- Modify: `SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md` (insert between current Sections 4 and 5)

**Context:** This becomes the new Section 5, pushing all subsequent sections down by 1. It's the conceptual bridge between the Siete Capacidades and the Cinco Pilares — explaining why education must prepare for three temporal horizons.

- [ ] **Step 1: Read Sections 4 and 5 for context and voice calibration**

Read the end of Section 4 (Aprendizaje por Dominio, Creación como Evaluación) and the start of Section 5 (Pilares, Maestros Creadores) to understand what comes before and after.

- [ ] **Step 2: Write Section 5 "Educar para Tres Futuros"**

Content requirements per spec N1:
- Section header: `## SECCIÓN 5: EDUCAR PARA TRES FUTUROS — LA EDUCACIÓN COMO SISTEMA OPERATIVO DE LA TRANSICIÓN`
- Opening blockquote in the style of other sections
- Present the Three Horizons framework (Escudo 2026-2035, Transición 2035-2045, Abundancia 2045+)
- Table: Escenarios de futuro del trabajo (conservador, medio, acelerado) with employment impact projections
- Argument: why the Siete Capacidades are resilient across all three scenarios (they form human capabilities, not job-specific skills)
- Introduction of Fideicomisos de Propósito Perpetuo, DNP, and Economía de la Contribución as concepts students need to understand
- Primera Mejor Alternativa framing
- Length target: ~800-1200 words (comparable to other sections)

- [ ] **Step 3: Renumber section headers: Section 5 → 6 through Section 19 → 20**

Update all `## SECCIÓN X:` headers from old Section 5 onward. There are 15 headers to renumber (5→6, 6→7, ..., 19→20).

- [ ] **Step 4: Update all inline section cross-references**

**CRITICAL:** The document contains inline references to section numbers in body text, not just headers. Search with pattern `Sección [0-9]|Sección 1[0-9]` (case-insensitive) to find ALL occurrences. Known inline references that need updating:

- Line ~158: "Se detallan en la Sección 6" → "Sección 7"
- Line ~325: "ver Sección 6.2" → "Sección 7.2"
- Line ~544: "Detalle en Sección 9.4" → "Sección 10.4"
- Lines ~1012, 1041-1052: Multiple "Sección X" references in the "Respuesta a Críticas" table — each needs +1

Search exhaustively — there may be additional references beyond these known ones. Every reference to Section 5 or higher must increment by 1.

- [ ] **Step 5: Verify section flow and numbering**

Scan all `## SECCIÓN` headers to confirm sequential numbering 1-20 with no gaps or duplicates. Also grep for `Sección` in body text to confirm all inline references match the new numbering.

- [ ] **Step 5: Commit**

```bash
git add "SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md"
git commit -m "PLANEDU: Add Section 5 'Educar para Tres Futuros' + renumber (N1)"
```

---

## Task 4: PLANEDU — New Sections N2, N3 + Visión 2040 rewrite (M6)

**Files:**
- Modify: `SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md` (after Section 18 BASTA integration, and in Section 19 Visión 2040)

**Context:** After Task 3, the document has Sections 1-20. Section 18 is BASTA integration (ex-17). Section 19 is Visión 2040 (ex-18). Section 20 is El Argumento Definitivo (ex-19). We insert N2 and N3 between 18 and 19, then renumber, then rewrite Valentina.

**Execution order is critical:**
1. First: Rewrite Valentina in current Section 19 (before renumbering — easier to find)
2. Second: Insert N2 and N3 after Section 18
3. Third: Renumber current Section 19 (Visión 2040) → 21 and Section 20 (El Argumento Definitivo) → 22
4. Fourth: Update BASTA integration tables

- [ ] **Step 1: Rewrite Valentina narrative (M6) — currently in Section 19 (Visión 2040)**

Follow the detailed M6 guide in the spec:
- Maintain hour-by-hour format
- Same school, same Chaco setting, same socioeconomic origin
- Key changes: DNP pilot active in Chaco, 13:00 becomes Residencia de Contribución (not pasantía), Portfolio Ciudadano referenced throughout, Valentina participates in Panel Ciudadano
- Rewrite portfolio table: remove "ofertas de 3 universidades y 2 empresas", replace with Portfolio Ciudadano + DNP + amplified contribution income
- Rewrite closing paragraph and "La Argentina de 2040 en un párrafo" per spec
- **Critical:** Maintain the literary voice and emotional power of the original. Read the original 3 times before rewriting.

- [ ] **Step 2: Insert Section 19 "Los Fideicomisos y la Educación" (N2) — AFTER Section 18, BEFORE current Section 19**

Content per spec: How PLANEDU connects with fideicomisos. Students participate in governance (COLABORAR capacity). At 16: simulated Panel. At 17+: real Panel. Portfolio Ciudadano Único as connective thread. Length: ~500-700 words.

- [ ] **Step 3: Insert Section 20 "El Portfolio Ciudadano Único" (N3) — AFTER new Section 19, BEFORE Visión 2040**

Content per spec: The PLANEDU portfolio and Contribution Economy portfolio are the SAME system at two life stages. Born at age 6 in EdF, accompanies the person their whole life. In school: documents creations and capabilities. In adult life: documents contributions and impact. Length: ~400-600 words.

- [ ] **Step 4: Renumber the pushed-down sections**

- Current Section 19 (Visión 2040, just rewritten) → **Section 21**
- Current Section 20 (El Argumento Definitivo) → **Section 22**

Also search for any inline references to "Sección 19" or "Sección 20" in body text and update them.

- [ ] **Step 5: Update BASTA integration tables (M14 partial) — in Section 18**

Add rows to the existing tables. These tables have 4 columns (label + PLAN24CN + PLANISV + PLANREP). New rows:

For Tabla 35 (PLANEDU aporta a →):
| **Alfabetización post-laboral** | Ciudadanos que entienden transición económica y participan en diseño del futuro | Productores que entienden fideicomisos de suelo y DNP | Egresados que entienden fideicomisos, DNP, Economía de la Contribución, y participan activamente en Paneles Ciudadanos de Futuro Económico |

For Tabla 36 (← PLANEDU recibe de):
| **Infraestructura post-laboral** | Fideicomisos de energía y vivienda como contenido curricular vivo | Fideicomisos de suelo vivo como experiencia de campo | Fideicomisos de Propósito Perpetuo, DNP, Nodos de Contribución como destinos para egresados, Economía de la Contribución como marco de actividad post-escolar |

- [ ] **Step 6: Verify entire document structure**

Scan all section headers (should be 1-22), verify numbering, check that cross-references are consistent. Grep for `Sección [0-9]` to catch any missed inline references.

- [ ] **Step 7: Commit**

```bash
git add "SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md"
git commit -m "PLANEDU: Add Fideicomisos + Portfolio sections, rewrite Valentina 2040 (N2, N3, M6, M14)"
```

---

## Task 5: PLANEDU — Sync copies

**Files:**
- Copy from: `SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md`
- Copy to: `Iniciativas Estratégicas/PLANEDU_Argentina_ES.md`

- [ ] **Step 1: Sync copies**

```bash
cp "SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md" "Iniciativas Estratégicas/PLANEDU_Argentina_ES.md"
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLANEDU_Argentina_ES.md"
git commit -m "Sync PLANEDU copy in Iniciativas Estratégicas"
```

---

## Task 6: PLANREP — Preámbulo, Tesis Central, and AI-proof modifications (M7, M8, M9, M10, M11, M13)

**Files:**
- Modify: `SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md` (lines 24-40, 342-394, and ~5 distributed passages)

**Context:** The heaviest editing task. Rewrites the core framing of PLANREP to embrace epistemic humility while maintaining confidence in Horizonte 1 strategy.

- [ ] **Step 1: Read PLANREP preámbulo + Section 2 (lines 24-400) to calibrate voice**

- [ ] **Step 2: M7 — Preámbulo modifications**

After the definition of work (line 28, "se transforma a sí mismo"), add paragraph: this transformation doesn't require an employer, a salary, or a market. PLANREP in Horizonte 1 reconverts toward dignified employment because that's what 2026 needs. But PLANREP is designed knowing 2040 will need something different.

Between blockquote (line 38) and Tesis Central (line 40), insert Primera Mejor Alternativa + Escucha Activa framework paragraph per spec.

- [ ] **Step 3: M8 — Tesis Central expansion (line 40)**

After the existing Escudo/Espada strategy description, append: PLANREP is designed in three horizons. The Shield and Sword are the best strategy for Horizon 1. The plan builds from day one the economic infrastructure (Fideicomisos), social (Paneles Ciudadanos), and educational (PLANEDU integration) for Horizons 2 and 3.

- [ ] **Step 4: M10 — Artesano Aumentado redefinition (lines 342-360)**

Redefine as evolutionary identity:
- Artesano Aumentado 2030: AI as tool
- Artesano-Curador 2040: designs, supervises, decides if machine output deserves to exist
- Artesano-Explorador 2050: undefined — society will define collectively

Change 40-hour module from one-time to first cycle of permanent continuous training (updated every 3 years).

Add Módulo de Reconstrucción de Identidad Productiva to Centros de la Vida.

- [ ] **Step 5: M9 — Section 2.5 rewrite (lines 365-394)**

Rewrite opening to replace certainty with honesty per spec. **IMPORTANT:** Preserve Tabla 7 exactly as-is during this rewrite — it will be modified separately in Step 6. Only rewrite the prose around it. After Tabla 7, add the new Tabla 7b (Escenarios de Vulnerabilidad Futura de las Ocho Ramas) using the exact table from the spec with 8 rows × 5 columns.

- [ ] **Step 6: M11 — Add temporal columns to Tabla 7 (lines 371-389)**

After M9 is applied, add two columns to existing Tabla 7: "Vulnerabilidad Proyectada 2040" and "Vulnerabilidad Proyectada 2050+". Rename current vulnerability column to include "(2026)". Each row gets projections based on scenario medio.

- [ ] **Step 7: M13 — Soften AI-proof language across ~5 passages**

Find and replace certainty language per spec M13 table:
- ~Line 344: "son a prueba de IA" → "son, según la mejor evidencia de 2026, las más resistentes a la automatización"
- ~Line 394: "empleos del futuro permanente — los que ninguna revolución tecnológica va a eliminar" → "los empleos con mayor resiliencia ante la revolución tecnológica — y la infraestructura para adaptarse cuando esa resiliencia se erosione"
- ~Line 1000: Add "(ver Tabla 7b para proyecciones temporales)" reference
- ~Line 1516: "a prueba de IA" → "lo más resistente que tenemos a la automatización"
- ~Line 2188: Add "de hoy" qualifier and Horizonte 2/3 reference

**Note:** Line numbers are approximate — search for the exact quoted text.

- [ ] **Step 8: Verify all edits read naturally**

Read through each modified passage in context to confirm voice consistency and logical flow.

- [ ] **Step 9: Commit**

```bash
git add "SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md"
git commit -m "PLANREP: Rewrite AI-proof framing with epistemic humility, expand preámbulo (M7-M13)"
```

---

## Task 7: PLANREP — New Section 15 block (N4, N5, N6, N7, N8, N9)

**Files:**
- Modify: `SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md` (insert before current closing section)

**Context:** This is the largest new content block. Six subsections forming a new Section 15 "Infraestructura para la Transición Post-Laboral". Inserted between the current BASTA integration section and the closing "El Llamado".

- [ ] **Step 1: Locate insertion point**

Find the end of Section 14 (BASTA integration) and the start of the current closing section. The new block goes between them.

- [ ] **Step 2: Write Section 15 header and introductory paragraph**

```markdown
## SECCIÓN 15: INFRAESTRUCTURA PARA LA TRANSICIÓN POST-LABORAL — EL PLAN DESPUÉS DEL PLAN

> *"Un plan que solo resuelve el presente es un plan que hipoteca el futuro. PLANREP resuelve el presente Y construye la infraestructura para lo que viene después."*
```

Opening paragraph: PLANREP's Horizonte 1 (Ocho Ramas, Centros de la Vida, Artesano Aumentado) is the best strategy for 2026-2035. But PLANREP is designed knowing that the world will change. This section builds the infrastructure for Horizons 2 and 3 — the mechanisms that activate as automation transforms work, and that ensure the transition benefits everyone.

- [ ] **Step 3: Write Subsection 15.1 — Fideicomisos de Propósito Perpetuo (N4)**

Follow spec N4 exactly. Include:
- Definition (autonomous legal entities, politically shielded)
- Table of 5 initial fideicomisos (Energía, Suelo, Digital, Vial, Vivienda)
- Governance design
- Co-investor in automation logic (fideicomisos actively invest in automating their own assets)
- Fondo de Estabilización (15% reserve)
- Evolution by horizon
- Length: ~800-1000 words

- [ ] **Step 4: Write Subsection 15.2 — Licencia Social de Automatización (N5)**

Follow spec N5. Include:
- Mechanism (3-7% of value from automated processes above 30% threshold)
- Why it's not a punitive tax
- International precedents (Gates, South Korea, Alaska)
- Primera mejor alternativa framing
- Length: ~400-500 words

- [ ] **Step 5: Write Subsection 15.3 — Dividendo Nacional de Productividad (N6)**

Follow spec N6. Include:
- Definition (citizen's share of collective productivity)
- Why NOT UBI (co-ownership vs. redistribution)
- Phase table (Piloto, Expansión, Régimen)
- Anti-resentimiento logic (universal from activation, including workers)
- Convergencia with existing social programs table (AUH, Potenciar, Alimentar, jubilaciones)
- Length: ~800-1000 words

- [ ] **Step 6: Write Subsection 15.4 — Economía de la Contribución (N7)**

Follow spec N7. Include:
- Definition
- How it works (Portfolio Ciudadano, Validadores, Índice de Contribución, Paneles)
- 7 initial categories of contribution
- Risk/mitigation (who decides what "counts")
- Postura sobre no-participación (DNP is unconditional right, contribution is choice, evidence from UBI pilots)
- Length: ~800-1000 words

- [ ] **Step 7: Write Subsection 15.5 — Paneles Ciudadanos de Futuro Económico (N8)**

Follow spec N8. Include:
- Design (composition, types, function, transparency)
- Regla de Tres Rechazos
- Circuit Breakers table (4 shock types with triggers and automatic actions)
- Panel de Adversarios (design, selection, product, power, philosophy)
- PLANEDU integration
- Length: ~1000-1200 words

- [ ] **Step 8: Write Subsection 15.6 — Argentina como Laboratorio (N9)**

Follow spec N9. Include:
- Kit de Transición Post-Laboral concept
- Retornos de exportación → fideicomisos cycle
- Geopolitical dimension
- Market potential (500M hispanohablantes)
- Timeline (exportation is H2, documentation is H1)
- Length: ~500-700 words

- [ ] **Step 9: Renumber current closing section to Section 16**

The current "El Llamado" closing section becomes Section 16.

- [ ] **Step 10: Verify entire Section 15 block**

Read the complete block for voice consistency, logical flow, table formatting, and alignment with surrounding sections.

- [ ] **Step 11: Commit**

```bash
git add "SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md"
git commit -m "PLANREP: Add Section 15 — post-labor infrastructure (N4-N9: fideicomisos, DNP, contribution economy, panels, export)"
```

---

## Task 8: PLANREP — Visión 2040 rewrite (M12) + cross-references (M14)

**Files:**
- Modify: `SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md` (Vision 2040 section ~lines 2214-2242, and ~line 2200)

- [ ] **Step 1: Read existing Visión 2040 (lines 2214-2242) 3 times for voice**

- [ ] **Step 2: M12 — Rewrite Visión 2040**

Follow spec M12 guide:
- Maintain subsection structure (El Estado que funciona / Las 24 ciudades / etc.)
- Add 2 new subsections: "Los Fideicomisos que Sostienen" and "La Economía que Escucha"
- Adjust quantitative projections: add notes about transition to contribution model
- Tone: transition in progress, not resolved utopia
- Rewrite closing "El momento" paragraph: the awakening is now about designing your life as a contributor, not just finding a trade
- **Critical:** Maintain emotional power. This is the aspirational climax.

- [ ] **Step 3: M14 (partial) — Update PLANEDU cross-reference (~line 2200)**

Replace the placeholder reference with direct links to PLANEDU sections per spec M14.

- [ ] **Step 4: Verify**

Read the complete Vision 2040 for emotional coherence and factual consistency with the new Section 15.

- [ ] **Step 5: Commit**

```bash
git add "SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md"
git commit -m "PLANREP: Rewrite Visión 2040 as transition narrative + update PLANEDU cross-refs (M12, M14)"
```

---

## Task 9: PLANREP — Sync copies

**Files:**
- Copy from: `SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md`
- Copy to: `Iniciativas Estratégicas/PLANREP_Argentina_ES.md`

- [ ] **Step 1: Sync copies**

```bash
cp "SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md" "Iniciativas Estratégicas/PLANREP_Argentina_ES.md"
```

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLANREP_Argentina_ES.md"
git commit -m "Sync PLANREP copy in Iniciativas Estratégicas"
```

---

## Task 10: Final verification and summary commit

**Files:**
- Read: Both modified documents
- Read: Spec for completeness check

- [ ] **Step 1: Cross-check all 28 spec items against implementations**

Go through each M1-M14 and N1-N9 in the spec and verify it was implemented. Check off in this list:

PLANEDU: M1 ☐ | M2 ☐ | M3 ☐ | M4 ☐ | M4b ☐ | M5 ☐ | M6 ☐ | M14(partial) ☐ | N1 ☐ | N2 ☐ | N3 ☐
PLANREP: M7 ☐ | M8 ☐ | M9 ☐ | M10 ☐ | M11 ☐ | M12 ☐ | M13 ☐ | M14(partial) ☐ | N4 ☐ | N5 ☐ | N6 ☐ | N7 ☐ | N8 ☐ | N9 ☐

- [ ] **Step 2: Verify section numbering in both documents**

Search for all `## SECCIÓN` headers in both documents. Confirm sequential with no gaps.

- [ ] **Step 3: Verify all copies are in sync**

```bash
diff <(md5 -q "SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md") <(md5 -q "Iniciativas Estratégicas/PLANEDU_Argentina_ES.md")
diff <(md5 -q "SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md") <(md5 -q "Iniciativas Estratégicas/PLANREP_Argentina_ES.md")
```

- [ ] **Step 4: Read both documents end-to-end (skim) to verify coherence**

Focus on: transitions between existing and new content, voice consistency, no orphaned references.

- [ ] **Step 5: Final commit (only if fixes were needed)**

If any fixes were made in Steps 1-4, stage only the specific files that were fixed and commit:

```bash
git add "SocialJusticeHub/client/public/docs/PLANEDU_Argentina_ES.md" "SocialJusticeHub/client/public/docs/PLANREP_Argentina_ES.md" "Iniciativas Estratégicas/PLANEDU_Argentina_ES.md" "Iniciativas Estratégicas/PLANREP_Argentina_ES.md"
git commit -m "Final verification pass: fix remaining issues from post-labor integration"
```

If no fixes were needed, skip this step.
