# PLANSAL Writing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write the complete PLANSAL_Argentina_ES.md — Plan Nacional de Salud Integral y Vitalidad Popular (~35,000 words) following BASTA framework conventions.

**Architecture:** PLANSAL is a 22-section strategic document written in Spanish (rioplatense dialect). Each task writes one or more sections, following the approved design spec. The document uses the "Fábrica de Enfermos" metaphor throughout. Reference files: PLANJUS for structure/tone, PLANISV for environmental health connections, PLANREP for reconversion model.

**Tech Stack:** Markdown document. No code. Output: single file at `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`.

---

## Reference Files

- **Design Spec:** `docs/superpowers/specs/2026-03-23-plansal-health-plan-design.md`
- **Tone/Structure Reference (primary):** `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` — follow this for section formatting, epigraph style, data table format, narrative hooks
- **Cross-reference:** `Iniciativas Estratégicas/PLANISV_Argentina_ES.md` — for agroquímicos, pueblos fumigados, suelo vivo connections
- **Cross-reference:** `Iniciativas Estratégicas/PLANREP_Argentina_ES.md` — for reconversion model, Centros de Vida parallels
- **Cross-reference:** `Iniciativas Estratégicas/PLANEDU_Argentina_ES.md` — for education connections
- **Cross-reference:** `Iniciativas Estratégicas/PLAN24CN_Argentina_ES.md` — for urbanismo connections
- **Life Areas Content:** `SocialJusticeHub/shared/life-area-study-content.ts` — for the 12 areas of life framework

## Writing Conventions (from existing PLANs)

1. **Section headers:** Use `##` for main sections with numbering: `## SECCIÓN 1 · LA CRISIS`
2. **Subsections:** Use `###` with numbering: `### 1.1 · Subtitle`
3. **Epigraphs:** Each major section opens with a blockquoted epigraph from a philosopher, writer, or thinker relevant to the topic
4. **Data tables:** Minimum 3 columns, appear every 2-3 pages. Use markdown tables.
5. **Human stories:** Named characters with specific Argentine locations (barrios, cities, provinces)
6. **Tesis Central:** Single dense paragraph at end of preámbulo naming every mechanism, timeline, institution, and cost
7. **Code block for title:** The opening title block is wrapped in triple backticks
8. **Language:** Spanish rioplatense. Formal-academic but visceral and poetic. Direct address with "vos" when speaking to citizens.
9. **Cross-references:** When referencing other PLANs, use format: "Como establece PLANJUS (Sección X)..."
10. **Primera Mejor Alternativa:** Each plan states it is a "primera mejor alternativa" based on current evidence, designed to be self-adaptive
11. **Editorial fence for health concepts:** Use principles from biodescodificación and nueva medicina germánica WITHOUT naming these disciplines. Frame through epigenetics, psychoneuroimmunology, and lifestyle medicine. May use concepts like "biological conflict" or "emotional resolution" but never name Hamer or the disciplines directly.

---

## Task 1: Title Block + Preámbulo (~3,000 words)

**Files:**
- Create: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** This is the most important section — it sets the tone for the entire document. Read the PLANJUS preámbulo (lines 1-120) and PLANREP preámbulo for tone reference before writing.

- [ ] **Step 1: Read reference preámbulos**

Read: `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` (first 120 lines)
Read: `Iniciativas Estratégicas/PLANREP_Argentina_ES.md` (first 120 lines)
Read: `docs/superpowers/specs/2026-03-23-plansal-health-plan-design.md` (full spec)

- [ ] **Step 2: Write the title block**

Write the code-fenced title block following the exact format from the spec. Must include:
- "LA FÁBRICA DE ENFERMOS" as opening thesis
- Full plan name
- 6 bullet points of key initiatives
- Institutional attribution
- Date and version

- [ ] **Step 3: Write the Preámbulo**

Write ~3,000 words including:
- **Opening narrative hook:** The family story (padre, madre, hijo, abuela) — a typical day that manufactures illness. Named characters, specific Argentine location (suggest: barrio in GBA). Must be visceral and recognizable.
- **El Ciclo de la Fábrica:** 5 phases described in detail with Argentine specifics
- **Tesis Central:** Single dense operational paragraph matching PLANJUS density. Must name: Centros de Vitalidad, Familias Mentoras, 3-phase reconversion, digital platform, 12 Raíces, Pacto de Co-responsabilidad, estimated costs, projected ROI. Copy from spec and expand.
- **Conexión con El Hombre Gris:** The Grey Man as finished product of the factory
- **Conexión con BASTA:** How PLANSAL connects to all other PLANs
- **Primera Mejor Alternativa:** Self-adaptive system statement

- [ ] **Step 4: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add title block and preámbulo — La Fábrica de Enfermos"
```

---

## Task 2: Sección 2 — La Crisis + Lecciones del Mundo (~4,500 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** Read PLANJUS Sección 1 and PLANISV Sección 1 for crisis section formatting. Read PLANJUS Sección 2 and PLANISV Sección 22 for international lessons format.

- [ ] **Step 1: Read reference crisis sections**

Read: `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` — find Sección 1 (La Crisis) and Sección 2 (Lecciones del Mundo)
Read: `Iniciativas Estratégicas/PLANISV_Argentina_ES.md` — find Sección 1 (Crisis) and Sección 22 (International Lessons)

- [ ] **Step 2: Write Sección 2.1 — El fracaso del sistema actual**

Write the data table comparing Argentina vs. world references. Research/verify data where possible, mark [PLACEHOLDER] where not verifiable. Include:
- Gasto en salud como % del PBI
- Esperanza de vida saludable (HALE)
- Diabetes tipo 2, obesidad
- Consumo de ultraprocesados
- Depresión, psicofármacos
- Suicidio adolescente
- Satisfacción con sistema de salud

- [ ] **Step 3: Write Sección 2.2 — El sistema de tres cabezas**

Anatomy of Argentina's three health subsystems (public hospitals, obras sociales, prepagas). How each captures chronic patients. ~500 words.

- [ ] **Step 4: Write Sección 2.3 — Las 12 raíces enfermas**

For each of the 12 life areas: 2-3 data points + brief human story + causal connection to disease. Named characters, specific Argentine locations. ~2,000 words total (~170 words per area). Family section should be longest (~300 words).

- [ ] **Step 5: Write Sección 2.4 — Lecciones del Mundo**

International comparison: Cuba (primary care), Costa Rica (CEN-CINAI), Finland (school health), Blue Zones (Okinawa/Cerdeña/Nicoya/Ikaria/Loma Linda), Bhutan (GNH), Kerala (education+community). Comparison table. ~1,500 words.

- [ ] **Step 6: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Sección 2 — La Crisis y Lecciones del Mundo"
```

---

## Task 3: Secciones 3-5 — Primeros Principios + 1.000 Días + Trauma Intergeneracional (~5,500 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** These three sections form the philosophical and biological foundation. They must be written with scientific rigor while maintaining the visceral, poetic tone. The editorial fence is critical here: use principles from biodescodificación/NMG without naming them. Frame through epigenetics, psychoneuroimmunology, lifestyle medicine.

- [ ] **Step 1: Read the spec sections 3-5 carefully**

Read: `docs/superpowers/specs/2026-03-23-plansal-health-plan-design.md`

- [ ] **Step 2: Write Sección 3 — Los Primeros Principios (~2,500 words)**

7 principles, each with:
- Principle statement (bold)
- Development (200-400 words) with scientific evidence
- Connection to Argentine daily life
- Blockquoted epigraph for the section opening

The 7 principles:
1. El cuerpo es un sistema inteligente, no una máquina que se rompe
2. Biografía es biología
3. La enfermedad crónica es un mensaje, no una sentencia
4. Sanar es una decisión activa
5. La familia es la primera unidad de salud
6. La comunidad es el sistema inmune social
7. La naturaleza no es recreación — es medicina

- [ ] **Step 3: Write Sección 4 — Los Primeros 1.000 Días (~1,500 words)**

Cover:
- Parto hiper-medicalizado (Argentina ~35% cesáreas vs OMS 10-15%)
- Lactancia materna vs fórmula industrial
- Apego temprano y programación del sistema nervioso
- Propuestas: parto respetado, red de lactancia, crianza consciente, licencia parental
- Human story: a mother's experience in the system

- [ ] **Step 4: Write Sección 5 — Trauma Intergeneracional (~1,500 words)**

Cover:
- Argentina's layers of collective trauma (dictadura, hiperinflaciones, 2001, immigration)
- Epigenetic evidence (hambruna studies, cortisol inheritance)
- Why families are sick without visible cause
- Propuestas: recognition, community healing spaces, lineage work, trauma resolution practices
- Human story: a family carrying inherited trauma across 3 generations

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Secciones 3-5 — Principios, 1.000 Días, Trauma Intergeneracional"
```

---

## Task 4: Sección 6 — El Pacto de Co-responsabilidad (~1,500 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** This section defines the social contract. The citizen's commitment must carry more weight than the State's. Read PLANJUS Sección 3 ("El Ingrediente") for how the personal decision is framed in other PLANs.

- [ ] **Step 1: Read reference**

Read: `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` — find Sección 3 (El Ingrediente)

- [ ] **Step 2: Write Sección 6**

Two parts:
- **6.1 — Lo que el Estado se compromete a hacer** (~500 words): 10 commitments, each with brief explanation
- **6.2 — Lo que el ciudadano se compromete a hacer** (~1,000 words — more weight): 8 commitments (Decidir, Moverse, Alimentarse, Sentir, Conectar, Descansar, Buscar sentido, Acompañar). Each with narrative expansion, not just bullet points. This should read like an invitation to sovereignty, not a checklist.

Open with a human story of someone who decided to change — the moment of decision as the "instante" that transforms everything.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Sección 6 — El Pacto de Co-responsabilidad"
```

---

## Task 5: Sección 7 — Las 12 Raíces, Part 1: Raíces 1-4 (~2,500 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** This is the core operational section. Each raíz has: "Cómo esta raíz enferma" + "Cómo esta raíz sana" + "Indicador de vitalidad". Raíz 4 (Familia) is the longest (~800 words) as the "raíz madre". Raíces 1-3 are ~300 words each. Reference the mapping table in the spec for area↔raíz correspondence.

- [ ] **Step 1: Read life area study content for context**

Read: `SocialJusticeHub/shared/life-area-study-content.ts` (first 250 lines — Salud, Apariencia, Amor, Familia areas)

- [ ] **Step 2: Write the section header and introduction for Sección 7**

Brief introduction (~200 words) explaining the 12 Raíces framework. Each area of life is a root of health. When a root is sick, the body manifests disease. When a root is nourished, the body heals. This mirrors Sección 2.3 (crisis by dimension) with solutions.

- [ ] **Step 3: Write Raíz 1: Salud Física (~300 words)**

- Enferma: sedentarismo, desconexión corporal, sleep deprivation
- Sana: movimiento integrado (not gym), sleep hygiene, body awareness
- Indicador: sedentarismo rate, average daily movement

- [ ] **Step 4: Write Raíz 2: Alimentación (~300 words)**

- Enferma: ultraprocesados, food deserts, industrial agriculture
- Sana: huertas comunitarias, cocinas colectivas, educación alimentaria
- Indicador: ultraprocesado consumption, community garden coverage
- Connection: PLANISV (suelo vivo = alimento vivo)

- [ ] **Step 5: Write Raíz 3: Amor y Vínculos Íntimos (~300 words)**

- Enferma: relaciones tóxicas, codependencia, violencia emocional
- Sana: comunicación vincular, conflict resolution, healthy boundaries
- Indicador: domestic violence rates, relationship satisfaction

- [ ] **Step 6: Write Raíz 4: Familia — Raíz Madre (~800 words)**

The most extensive raíz. Must cover:
- Familia como unidad económica, emocional y de crecimiento fundamental
- Crisis: fragmentación, incomunicación intergeneracional, transmisión de trauma, pérdida de rituales, pérdida de la mesa familiar
- Data: countries with stronger families = better health indicators across ALL dimensions
- **Sistema de Familias Mentoras** as programa nacional estrella (brief here, detail in Sección 9)
- **"La Mesa"** — recovery of family dinner as health ritual
- Mediación familiar in Centros de Vitalidad
- Forward references to Sección 4 (1.000 Días), Sección 5 (Trauma), Sección 9.2 (Familias Mentoras)
- Indicador: family conflict as stress source, family dinner frequency

- [ ] **Step 7: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Sección 7 Raíces 1-4 (Salud, Alimentación, Amor, Familia)"
```

---

## Task 6: Sección 7 — Las 12 Raíces, Part 2: Raíces 5-12 (~2,400 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** Continue the 12 Raíces section. Raíces 5-12 are ~300 words each. Each has the same structure: enferma/sana/indicador. Reference cross-PLANs where applicable.

- [ ] **Step 1: Read life area study content for remaining areas**

Read: `SocialJusticeHub/shared/life-area-study-content.ts` (lines 250-650 — remaining 8 areas)

- [ ] **Step 2: Write Raíz 5: Amigos y Tribu**

Soledad epidemic → Centros de Vitalidad as meeting point + group activities. Reference Ancianos de Sabiduría.

- [ ] **Step 3: Write Raíz 6: Trabajo y Vocación**

Trabajo sin propósito → chronic cortisol. Connection to PLANREP. Orientation vocacional in Centros.

- [ ] **Step 4: Write Raíz 7: Dinero y Seguridad Económica**

Financial stress as most destructive drug → educación financiera + economía familiar in Familias Mentoras.

- [ ] **Step 5: Write Raíz 8: Crecimiento Personal**

Stagnation as slow death → digital platform + libraries/workshops in Centros.

- [ ] **Step 6: Write Raíz 9: Espiritualidad y Sentido**

Existential void as root of addictions → silence spaces, breathwork, nature connection, service.

- [ ] **Step 7: Write Raíz 10: Recreación y Juego**

Escape vs genuine recreation → free play, community sports, art as expression.

- [ ] **Step 8: Write Raíz 11: Entorno y Naturaleza**

Sick urbanism → PLAN24CN connection + "recetas verdes" (nature prescriptions).

- [ ] **Step 9: Write Raíz 12: Comunidad y Pertenencia**

Social atomization → Centros de Vitalidad as new ágora + vecinal volunteering. Reference Ancianos de Sabiduría.

- [ ] **Step 10: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Sección 7 Raíces 5-12 (Amigos through Comunidad)"
```

---

## Task 7: Sección 8 — El Poder de Parar (~1,000 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

- [ ] **Step 1: Write Sección 8**

Counterintuitive section — sometimes healing means STOPPING. Cover:
- **Ayuno:** oldest and free-est therapeutic tool. Autophagy as self-cleaning mechanism.
- **Silencio:** medicine for overstimulated nervous system.
- **Descanso real:** not passive entertainment but active restoration.
- **Desintoxicación digital:** screens as circadian/attention/relationship disruptors.
- **Respiración consciente:** only autonomic function we can voluntarily control. Bridge between voluntary and involuntary nervous system.

Guiding principle: the body heals itself when you stop attacking it.

Integration in Centros de Vitalidad: silence spaces, group breathwork, accompanied community fasting days, device-free zones.

Open with epigraph about stillness/silence.

- [ ] **Step 2: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Sección 8 — El Poder de Parar"
```

---

## Task 8: Sección 9 — Infraestructura de Vitalidad (~2,000 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** This is the operational heart — the three mechanisms + Ancianos de Sabiduría. Read PLANREP Sección 3 for how "Life Centers" are described there (parallel concept). Read PLAN24CN for urban integration.

- [ ] **Step 1: Read reference for Life Centers**

Read: `Iniciativas Estratégicas/PLANREP_Argentina_ES.md` — find references to "Centros de Vida" or training centers
Read: `Iniciativas Estratégicas/PLAN24CN_Argentina_ES.md` — find references to community infrastructure

- [ ] **Step 2: Write 9.1 — Red Nacional de Centros de Vitalidad (~600 words)**

Not hospitals, not gyms, not community centers — all integrated. Include:
- Physical description (what you see when you walk in)
- One per barrio (urban), one per pueblo (rural)
- Community-operated with State support
- Spaces: movement, huerta, communal kitchen, family meeting room, library, silence/meditation, green space, orientation office
- Personnel: Guías de Vitalidad, community facilitators, resident Familias Mentoras
- Funding: reconversion of preventable chronic disease spending

- [ ] **Step 3: Write 9.2 — Sistema de Familias Mentoras (~500 words)**

National flagship program. Include:
- Selection by demonstrated transformation (not credentials)
- Practical training: cooking, communication, parenting, habits, home economics
- Each FM accompanies 3-5 families in the barrio
- Scaling: 1,000 → 5,000 → natural multiplier effect
- How it actually works day-to-day (narrative of a Familia Mentora in action)

- [ ] **Step 4: Write 9.3 — Ancianos de Sabiduría (~400 words)**

Formal integration of elderly as pillars. Include:
- Bearers of practical knowledge at risk of being lost
- Intergenerational reconnection as medicine for both ends
- Specific roles: cooking teachers, storytellers, conflict mediators, garden mentors
- Connection to Raíz 4, 5, and 12

- [ ] **Step 5: Write 9.4 — Plataforma Digital Nacional (~500 words)**

Evolution of SocialJusticeHub. Include:
- Self-diagnosis by 12 life areas
- Personalized vitality plan
- Digital community connected to physical Centros
- Habit tracking, educational content, FM connection
- Open source, no ads, no data selling
- Technical architecture (brief — web/mobile, accessible)

- [ ] **Step 6: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Sección 9 — Infraestructura de Vitalidad"
```

---

## Task 9: Sección 10 — Reconversión del Sistema Médico (~1,500 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** Read PLANREP for reconversion model parallels.

- [ ] **Step 1: Write 10.1 — Transición gradual en 3 fases**

- Fase 1 (Años 1-3): Coexistencia — Centros in parallel, measurement, voluntary doctor reconversion, incentive change
- Fase 2 (Años 3-7): Redireccionamiento — proven results → budget redirect, hospital specialization, obras sociales cover vitality programs
- Fase 3 (Años 7-15): El nuevo sistema — dual system, pharma shrinks naturally, professionals reconverted, Argentina as world reference

- [ ] **Step 2: Write 10.2 — Ruta de Des-medicalización Acompañada**

Critical credibility section:
- Gradual transition protocol for currently medicated people
- Guías work WITH current doctor (never against)
- Biological indicator measurement during transition
- Principle: nothing removed until body demonstrates it's no longer needed
- Example case: a diabetes type 2 patient's journey from 3 medications to 0 over 18 months

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Sección 10 — Reconversión del Sistema Médico"
```

---

## Task 10: Secciones 11-12 — Argumento Económico + Métricas (~1,500 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** Read PLANJUS Sección 14 (Budget & ROI) and PLANREP Sección 5 (Fiscal Impact) for format.

- [ ] **Step 1: Read reference budget sections**

Read: `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` — find Budget/ROI section
Read: `Iniciativas Estratégicas/PLANREP_Argentina_ES.md` — find Fiscal Impact section

- [ ] **Step 2: Write Sección 11 — El Argumento Económico (~1,000 words)**

Three parts:
- 11.1 Cuánto cuesta la enfermedad (annual spending on preventable chronic disease, absenteeism, medication, lost productivity)
- 11.2 Cuánto cuesta la vitalidad (investment in Centros, FMs, Platform, reconversion)
- 11.3 La ecuación (prevent 1x, treat 10x, chronic 100x. ROI projection. International comparisons)

Use data tables. Mark unverified data as [PLACEHOLDER].

- [ ] **Step 3: Write Sección 12 — Métricas e Indicadores (~500 words)**

Full metrics table from spec + brief explanation of each indicator and how it's measured. Emphasize: we measure vitality, not disease. Include the 16 indicators from the spec.

- [ ] **Step 4: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Secciones 11-12 — Argumento Económico y Métricas"
```

---

## Task 11: Sección 13 — Alcance y Límites + Sección 14 — Arquitectura Institucional (~2,500 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** Read PLANJUS Sección 12 (ANJUS institutional architecture) for governance model format.

- [ ] **Step 1: Read reference institutional architecture**

Read: `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` — find Sección 12 (Arquitectura Institucional)

- [ ] **Step 2: Write Sección 13 — Lo que PLANSAL No Reemplaza (~1,000 words)**

Explicit boundaries:
- Emergency medicine and trauma (hospitals remain essential)
- Non-lifestyle chronic conditions (Type 1 diabetes, genetic diseases, congenital conditions)
- Acute mental health crisis (suicide, psychosis, withdrawal — clear referral protocols)
- Disability
- Infectious disease and pandemic preparedness

Guiding principle: PLANSAL focuses on the 80% preventable. Frees resources for the 20% that needs intensive medicine.

- [ ] **Step 3: Write Sección 14 — Arquitectura Institucional (~1,500 words)**

- ANVIP (Agencia Nacional de Vitalidad Popular): autonomous body, composition (1/3 community, 1/3 professionals, 1/3 FMs), no pharma/obras sociales representation, relationship with Ministerio de Salud, anti-capture protections
- Centro de Vitalidad governance: barrial assembly, community-elected facilitator, public budget audit
- Familias Mentoras governance: autonomous network, peer selection, continuous formation
- Connection to PLANJUS for conflict resolution

- [ ] **Step 4: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Secciones 13-14 — Alcance/Límites y Arquitectura Institucional"
```

---

## Task 12: Secciones 15-16 — Marco Legal + Estrategia de Stakeholders (~2,500 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** Read PLANJUS Sección 13 (Marco Legal) and Sección 9 (Stakeholder Strategy).

- [ ] **Step 1: Read reference legal and stakeholder sections**

Read: `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` — find Secciones 9 and 13

- [ ] **Step 2: Write Sección 15 — Marco Legal (~1,000 words)**

7 laws to create/modify:
- Ley de Alimentación Real
- Ley de Vitalidad Popular
- Reforma de ANMAT
- Ley de Parto Respetado (strengthen 25.929)
- Licencia parental extendida
- Modificación Ley de Agroquímicos (→ PLANISV)
- Ley de Espacios Verdes Obligatorios (→ PLAN24CN)

For each: what changes, why, implementation route.

- [ ] **Step 3: Write Sección 16 — Estrategia de Stakeholders (~1,500 words)**

Full stakeholder map table (from spec) + narrative expansion for key groups:
- Doctors (allies if offered dignified reconversion)
- Nurses/agentes sanitarios (natural allies — already doing community work)
- Pharma (don't confront — make irrelevant)
- Obras sociales (show savings)
- Sindicatos de salud (reconversion, not elimination)
- Pueblos originarios (integrate ancestral knowledge)
- Food industry (regulation + viable alternatives)

- [ ] **Step 4: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Secciones 15-16 — Marco Legal y Stakeholders"
```

---

## Task 13: Sección 17 — Hoja de Ruta (~1,500 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** Read PLANISV Sección 23 or PLANREP Sección 9 for implementation roadmap format (both use phased approaches with specific timelines).

- [ ] **Step 1: Read reference roadmaps**

Read: `Iniciativas Estratégicas/PLANREP_Argentina_ES.md` — find Sección 9 (Implementation Roadmap)

- [ ] **Step 2: Write Sección 17 — Hoja de Ruta**

4 phases:
- **Fase 0: PREPARAR (Meses 1-6)** — Create ANVIP, select 10 pilot barrios (diverse: CABA, GBA, interior urban, rural, indigenous community), recruit first 100 FMs, develop Platform v1, train first 50 Guías de Vitalidad
- **Fase 1: DEMOSTRAR (Años 1-3)** — 10 Centros operational, 1.000 FMs active, national platform, rigorous measurement (barrios with Centro vs without), publish results
- **Fase 2: ESCALAR (Años 3-7)** — 500 Centros, 5.000 FMs, formal obras sociales integration, evidence-based budget redirection, rural expansion (itinerant Centros, telemedicine)
- **Fase 3: CONSOLIDAR (Años 7-15)** — 3.000+ Centros (80% barrio coverage), 25.000+ FMs, consolidated dual system, Argentina as world reference

Include specific deliverables per phase, geographic expansion plan, rural challenge section.

- [ ] **Step 3: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Sección 17 — Hoja de Ruta de Implementación"
```

---

## Task 14: Secciones 18-20 — Riesgos + Críticas + Comunicación (~4,000 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** Read PLANJUS Secciones 17-19 for risk analysis, response to critics, and communication strategy formats.

- [ ] **Step 1: Read reference sections**

Read: `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` — find Secciones 17, 18, 19

- [ ] **Step 2: Write Sección 18 — Análisis de Riesgos (~1,000 words)**

Risk table with columns: Riesgo | Probabilidad | Impacto | Mitigación | Trigger

8 risks from spec:
1. Pharma opposition
2. Adverse event from de-medicalization
3. Political capture of Centros
4. Funding loss
5. "Anti-science" accusation
6. Union resistance
7. Slow scaling
8. Low citizen participation

Each with narrative expansion beyond the table.

- [ ] **Step 3: Write Sección 19 — Respuesta a Críticas (~2,000 words)**

8 anticipated attacks, each with:
- The attack (blockquoted, in the voice of the critic)
- The response (detailed, evidence-based, emotionally resonant)

From spec:
1. "Anti-ciencia / charlatanería"
2. "La gente va a dejar medicamentos y morir"
3. "Culpar a la víctima"
4. "No se puede reemplazar médicos con guías"
5. "Utópico / no se puede financiar"
6. "Zonas Azules no son replicables"
7. "¿Y las enfermedades genéticas / pandemias?"
8. "Paternalismo estatal"

- [ ] **Step 4: Write Sección 20 — Estrategia de Comunicación (~1,000 words)**

- Central challenge: paradigm shift without being dismissed
- Audiences and messages (citizens, professionals, media, political opposition)
- Communication phases (aligned with Hoja de Ruta phases)
- Crisis narrative protocol (first adverse media case)

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Secciones 18-20 — Riesgos, Críticas, Comunicación"
```

---

## Task 15: Secciones 21-22 — Integración BASTA + Visión 2040 (~2,000 words)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`

**Context:** Read PLANJUS Sección 20 (BASTA Integration) and Sección 21 (Vision 2040) for closing section format. This is the emotional climax of the document.

- [ ] **Step 1: Read reference closing sections**

Read: `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` — find Secciones 20-21

- [ ] **Step 2: Write Sección 21 — Integración BASTA (~500 words)**

How PLANSAL articulates operationally with each PLAN:
- PLAN24CN → Centros in urban design, green spaces as urbanistic prescription
- PLANISV → Living soil feeds Centro huertas, agroquímico regulation as health policy
- PLANEDU → Alimentary/emotional/corporal education in schools, Guía de Vitalidad training
- PLANREP → Health public employee reconversion, purposeful work reduces occupational disease
- PLANJUS → Family mediation in Centros, juridical certainty reduction as health policy, PLANJUS legally protects ANVIP

- [ ] **Step 3: Write Sección 22 — Visión 2040 + El Argumento Definitivo (~1,500 words)**

Three arguments:
- **Argumento humano:** Paint Argentina 2040 — the transformed family. Real food, movement, communication, community, purpose. Centros as barrio heart. Elderly respected. Children born in containment. Chronic disease is the exception.
- **Argumento económico:** Projected cumulative savings. Gained productivity. Reduced pharma spending. Decompressed hospital system.
- **Argumento histórico:** Argentina as first country to design a vitality-based health system. World precedent.

**Closing narrative:** Return to the family from the preámbulo — but now transformed. Same padre, madre, hijo, abuela. But now awake. Healthy. Connected. Alive. Full circle.

- [ ] **Step 4: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Add Secciones 21-22 — Integración BASTA y Visión 2040"
```

---

## Task 16: Final Review + Sync to SocialJusticeHub

**Files:**
- Review: `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md`
- Copy to: `SocialJusticeHub/client/public/docs/PLANSAL_Argentina_ES.md`

- [ ] **Step 1: Full document review**

Read the complete document end-to-end. Check for:
- Consistent section numbering
- All cross-references between sections are correct
- All cross-references to other PLANs are accurate
- No repetition of Familia content across sections (distributed with forward/backward references)
- Ancianos de Sabiduría referenced in Raíz 4, 5, and 12
- Editorial fence maintained (no named disciplines)
- Tone consistency throughout
- All data tables have 3+ columns
- Human stories have named characters and Argentine locations
- Tesis Central contains all required elements
- Word count is approximately 35,000

- [ ] **Step 2: Fix any issues found**

Edit as needed.

- [ ] **Step 3: Sync to SocialJusticeHub**

```bash
cp "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md" "SocialJusticeHub/client/public/docs/PLANSAL_Argentina_ES.md"
```

- [ ] **Step 4: Final commit**

```bash
git add "Iniciativas Estratégicas/PLANSAL_Argentina_ES.md" "SocialJusticeHub/client/public/docs/PLANSAL_Argentina_ES.md"
git commit -m "PLANSAL: Final review + sync to SocialJusticeHub"
```
