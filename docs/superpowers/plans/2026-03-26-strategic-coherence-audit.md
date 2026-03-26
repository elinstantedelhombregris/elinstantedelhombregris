# BASTA Strategic Coherence Audit — Master Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit all 12 strategic initiatives of BASTA for consistency, logic, and strategic intelligence — then produce a Master Coherence Report with specific findings, contradictions, gaps, and recommendations.

**Architecture:** Layered audit — extract skeletons (DONE), run 6 targeted cross-check passes in parallel, converge into a single report. Each task produces a findings file. The final task assembles them into the Master Report.

**Tech Stack:** Markdown analysis, grep-based verification, manual strategic reasoning. No code — pure analysis and document production.

**Scope:** 12 documents totaling ~4MB across `/Iniciativas Estratégicas/`:
PLAN24CN, PLANREP, PLANISV, PLANEDU, PLANJUS, PLANSUS, PLANEB, PLANSAL, PLANAGUA, PLANDIG, PLANGEO, PLANMON

---

## CRITICAL FINDINGS ALREADY IDENTIFIED (from Layer 1 extraction)

These are confirmed issues discovered during skeleton extraction. Each audit task below will deepen and complete this list.

### F1: Hombre Gris Metaphor — "acero" vs "plata"
- **PLANMON** uses "plata" (silver) — CORRECT per project philosophy (Argentina = argentum = plata)
- **PLANEDU, PLANISV, PLANJUS, PLANSUS, PLANEB, PLANDIG, PLANAGUA** all use "acero" (steel) — INCORRECT
- **PLANSAL** uses a different formulation (no metal metaphor in the standard paragraph)
- **PLAN24CN, PLANGEO** have NO Hombre Gris paragraph at all
- **PLANREP** weaves it into narrative rather than using the standard paragraph

### F2: Mandate Count — Plans Disagree on How Many Exist
- **PLANEDU, PLAN24CN, PLANISV, PLANREP** say "cinco iniciativas" — only know about the original 5
- **PLANJUS** says "five foundational" + hints at more ("salud, seguridad, energía, cultura, ciencia")
- **PLANSUS** says "cinco mandatos existentes" in integration section
- **PLANEB** says "siete mandatos existentes"
- **PLANSAL** says "diez mandatos"
- **PLANAGUA** says "noveno mandato" / "ocho mandatos existentes"
- **PLANDIG** says "décimo mandato"
- **PLANGEO** says "diez mandatos populares" / "undécimo"
- **PLANMON** integrates with ALL 12+ (including nonexistent PLANEN)

### F3: BASTA Acronym — Two Conflicting Definitions
- **PLANREP** says: **B**ienestar, **A**limentación, **S**istemas inteligentes, **T**erritorio, **A**utonomía
- **PLANISV** says: **B**elleza, **A**limentación, **S**istemas inteligentes, **T**erritorio, **A**utonomía
- B = Bienestar or Belleza? These are different concepts.

### F4: Missing Document — PLANEN
- **PLANMON** references PLANEN extensively (energy commodities in canasta, regalías to Fondo Soberano)
- **PLANAGUA** references "futuro PLANEN" as "not yet formalized"
- **PLANGEO** mentions energy strategy but no dedicated PLANEN
- No PLANEN_Argentina_ES.md exists in the repository

### F5: Agency Naming — Inconsistent Patterns
- Most agencies follow AN + suffix: ANEB, ANJUS, ANSUS, ANMON, ANDIG, ANAGUA
- **PLANSAL** uses "ANVIP" (breaks pattern — should be ANSAL?)
- **PLANREP** uses "Ente Autónomo PLANREP" (no AN- prefix at all)
- **PLANISV** uses "ENSV" (Ente Nacional, not Agencia Nacional)
- **PLAN24CN** uses "Corporación Nacional de Desarrollo Urbano" (completely different model)
- **PLANGEO** uses "CNEG" (Consejo, not Agencia — intentionally different governance)

---

## Task 1: Cross-Reference Integrity Audit

**Goal:** Verify that every plan that references another plan is referenced back, and that the descriptions match.

**Files to analyze:** All 12 plan files + the skeleton extractions in `/private/tmp/claude-501/...`

**Output:** `Iniciativas Estratégicas/audit/01-cross-reference-integrity.md`

- [ ] **Step 1: Build the cross-reference matrix**

For each of the 12 plans, record which other plans it references and which plans reference it. Use the skeleton extractions already produced. Build a 12x12 matrix showing:
- ✅ = bidirectional reference (A mentions B AND B mentions A)
- ➡️ = one-way (A mentions B but B doesn't mention A)
- ❌ = no reference in either direction
- 🔄 = reference exists but descriptions conflict

- [ ] **Step 2: Identify orphan references**

Find cases where Plan A describes its integration with Plan B in ways that Plan B never acknowledges. Example: PLANMON says it integrates with PLANAGUA ("infraestructura hídrica financiada por Fondo Soberano"), but PLANAGUA never mentions PLANMON.

- [ ] **Step 3: Identify stale count references**

Find every instance where a plan says "cinco iniciativas", "siete mandatos", "ocho mandatos", etc. and record the exact quote, line number, and whether the count is current (12 plans) or outdated.

- [ ] **Step 4: Identify description mismatches**

For each bidirectional reference, verify that Plan A's description of what it gets from Plan B matches what Plan B says it provides. Example: If PLANREP says "PLANJUS resolves labor disputes in 45 days" but PLANJUS says labor disputes go to JUS-1 (15 days), that's a mismatch.

- [ ] **Step 5: Write findings to audit file**

Create `Iniciativas Estratégicas/audit/01-cross-reference-integrity.md` with all findings, organized by severity (CRITICAL / IMPORTANT / MINOR).

---

## Task 2: Terminology & Voice Consistency Audit

**Goal:** Verify consistent terminology, metaphors, structural patterns, and voice across all 12 documents.

**Output:** `Iniciativas Estratégicas/audit/02-terminology-consistency.md`

- [ ] **Step 1: Audit the Hombre Gris paragraph**

For each plan, check:
1. Does the standard Hombre Gris paragraph exist?
2. Does it use "plata" (correct) or "acero" (incorrect)?
3. Is the paragraph substantially the same or divergent?
4. Does it connect the philosophy to the plan's specific domain?

Record exact text and line number for each.

- [ ] **Step 2: Audit the "primera mejor alternativa" framing**

Check every plan for the presence of the closing statement pattern: "Todo lo que [PLAN] propone es la primera mejor alternativa basada en la mejor evidencia disponible en 2026." Record which plans have it and which don't.

- [ ] **Step 3: Audit structural patterns**

Verify each plan follows the same document structure:
1. Code block header with plan name and metadata
2. Preámbulo with personal story/stories
3. Tesis Central block
4. Crisis section (Section 1)
5. Lessons from the world (Section 2)
6. "El Ingrediente" section
7. Integration with BASTA section
8. Vision 2040 section
9. Closing table of all BASTA plans

Record deviations.

- [ ] **Step 4: Audit the BASTA acronym**

Find every instance of the BASTA acronym being decoded in all 12 documents. Record the exact letters and their meanings. Flag conflicts.

- [ ] **Step 5: Audit key terminology consistency**

Check that these terms are used identically across all plans:
- "Paneles Ciudadanos" (not "Paneles de Ciudadanos" or other variants)
- "Tablero Nacional" (consistently named)
- "sorteo democrático" (not "lotería" or other variants)
- "ente autárquico" (consistently described)
- "presupuesto constitucional protegido" (phrased the same way)
- "Protocolo Bastardo" (referenced consistently)
- "Fideicomisos de Propósito Perpetuo" (same name everywhere)

- [ ] **Step 6: Write findings to audit file**

---

## Task 3: Timeline & Cascade Coherence Audit

**Goal:** Verify that timelines across plans interlock correctly, dependencies are respected, and there are no circular dependencies.

**Output:** `Iniciativas Estratégicas/audit/03-timeline-coherence.md`

- [ ] **Step 1: Build the master timeline**

From each plan's cascade/hoja de ruta, extract key milestones with their year. Create a single unified timeline showing what happens when across all 12 plans, year by year from 2026 to 2040.

- [ ] **Step 2: Identify dependency chains**

Map which plans depend on which others being operational first:
- PLANMON needs PLANDIG's SAPI (payments) and PLANEB's Bastarda Financiera
- PLANDIG needs physical infrastructure (could come from PLAN24CN or reconverted buildings from PLANREP)
- All plans need PLANJUS for dispute resolution
- PLANSAL needs PLANISV for food quality
- PLANGEO's international phases need domestic plans to be proven first

Draw the dependency graph and identify the **critical path** — what must work first for everything else to be possible.

- [ ] **Step 3: Check for circular dependencies**

Identify cases where Plan A needs Plan B to be operational AND Plan B needs Plan A. Example: Does PLANMON need PLANEB but PLANEB need PLANMON?

- [ ] **Step 4: Verify PLANGEO's international sequencing matches domestic timelines**

PLANGEO Section 24.2 has a 4-phase international launch sequence. Verify each domestic plan is actually ready by the time PLANGEO plans to export it:
- Phase 1 (2026-2028): PLANEB, PLANEDU, PLANISV — are these plans' domestic timelines ahead of PLANGEO's export timeline?
- Phase 2 (2028-2030): PLANDIG, PLAN24CN, PLANAGUA
- Phase 3 (2030-2033): PLANSUS, PLANREP
- Phase 4 (2033-2040): DAOs, Calificadora Soberana

- [ ] **Step 5: Write findings to audit file**

---

## Task 4: Financial Architecture Audit

**Goal:** Verify that financial flows across plans are internally consistent, funding sources aren't double-counted, and total costs are realistic.

**Output:** `Iniciativas Estratégicas/audit/04-financial-architecture.md`

- [ ] **Step 1: Build the master cost table**

Sum up total investment required across all 12 plans for the first 10 years. Create a single table:

| Plan | 10-Year Investment (USD) | Annual Peak | Primary Funding Sources |
|------|--------------------------|-------------|------------------------|

Calculate the total. Compare to Argentina's GDP (~USD 500-650B) and current budget.

- [ ] **Step 2: Check for funding source double-counting**

Multiple plans claim shares of the same funding sources. Verify:
- PLANREP claims USD 15-25B/yr in fiscal savings. PLANEDU claims 5-8% of this. Do other plans also claim shares? Does the total exceed 100%?
- PLANMON's Fondo Soberano claims income from PLANSUS, PLANEB, regalías, repatriation. Do these sources also appear in other plans' budgets?
- International financing (BID, World Bank, GCF, CAF) appears in PLANISV, PLANAGUA, PLANDIG, PLANGEO. Is the total realistic for what Argentina can access?

- [ ] **Step 3: Verify PLANMON's Fondo Soberano inputs**

PLANMON's Fondo Soberano is capitalized by inputs from multiple plans. Verify each claimed input matches what the source plan actually says it will generate:
- PLANSUS revenues: PLANMON claims USD 2-8B/yr by Year 5. Does PLANSUS's own projection match?
- PLANEB excedentes: PLANMON claims USD 500M-2B/yr. Bastardas operate at cost — where does the "excedente" come from?
- Regalías: PLANMON claims USD 2-5B/yr from commodities. PLANEN doesn't exist. Where is this documented?

- [ ] **Step 4: Check ROI consistency**

Compare ROI claims across plans. Flag any that seem inconsistent with each other:
- PLANISV claims 8:1 to 15:1 (conservative) or 28:1 to 69:1 (broad)
- PLANEDU claims 3:1 to 5.5:1 (conservative) or 8:1 to 12:1
- PLANJUS claims 6:1 to 10:1
- PLANAGUA claims 3:1 to 8:1
- PLANEB claims social ROI of 3:1 to 10:1

Are these realistic relative to international benchmarks?

- [ ] **Step 5: Write findings to audit file**

---

## Task 5: Strategic Completeness & Gaps Audit

**Goal:** Identify domains not covered, structural gaps, and strategic vulnerabilities.

**Output:** `Iniciativas Estratégicas/audit/05-strategic-gaps.md`

- [ ] **Step 1: Identify missing domains**

Check whether the following domains are covered by any plan:
- **Energy** (PLANEN is referenced but doesn't exist)
- **Defense/Security** (PLANGEO touches it, PLANJUS implies PLANSEG — but is there a dedicated plan?)
- **Culture/Media/Arts** (PLANJUS mentions "cultura" as a future mandate)
- **Science/Research** (beyond what PLANDIG covers)
- **Housing** (beyond PLAN24CN's new cities — what about existing cities?)
- **Transport/Logistics** (PLANEB mentions Bastarda Móvil, but no dedicated plan)
- **Pensions/Social Security** (PLANMON touches it, PLANREP's DNP addresses it long-term)
- **Foreign debt management** (PLANMON covers, but is it sufficient?)
- **Political vehicle** — the ¡BASTA! platform itself. Is it described anywhere?
- **Constitutional reform strategy** — multiple plans need legal frameworks. Is there a unified legal cascade?

- [ ] **Step 2: Assess PLANGEO's shield coverage**

PLANGEO is the geopolitical shield. For each domestic plan, check:
1. Does PLANGEO identify the specific international threats that plan creates?
2. Does PLANGEO have a defense strategy for those threats?
3. Is the defense credible given the timeline?

Known gaps to verify: PLANMON's desdolarización would provoke US response — does PLANGEO address this? PLANAGUA's criosfera law affects mining companies — does PLANGEO cover mining lobby pushback?

- [ ] **Step 3: Assess antifragility — what happens if one plan fails?**

For each plan, answer: If this plan fails completely, which other plans are critically damaged?
- If PLANDIG fails → all plans lose data infrastructure, PLANMON loses SAPI
- If PLANJUS fails → all plans lose dispute resolution, anti-corruption mechanisms
- If PLANEB fails → PLANMON loses Bastarda Financiera, PLAN24CN loses at-cost services
- If PLANREP fails → fiscal savings that fund PLANEDU disappear
- If PLANMON fails → no stable currency for any plan's financial projections

Map the single points of failure.

- [ ] **Step 4: Assess the "order of battle"**

Given all dependencies, what is the optimal launch sequence? Is the implicit sequence in the documents correct? Propose the ideal sequencing if different.

- [ ] **Step 5: Write findings to audit file**

---

## Task 6: Master Strategy Coherence Analysis

**Goal:** Assess whether the 12 plans tell one coherent story, reinforce each other intelligently, and would withstand adversarial scrutiny.

**Output:** `Iniciativas Estratégicas/audit/06-master-strategy-coherence.md`

- [ ] **Step 1: The Narrative Test**

Read the closing sections of all 12 plans (Vision 2040). Do they describe the same Argentina? Are there contradictions in the vision? Does each plan's 2040 vision acknowledge the others?

- [ ] **Step 2: The Adversary Test**

Imagine you are a hostile analyst (IMF, US State Department, Argentine opposition, corporate lobby). Read the plans looking for:
- Internal contradictions you could exploit ("they say X here but Y there")
- Unrealistic assumptions you could attack
- Dependencies you could sabotage (what's the weakest link?)
- Legitimacy gaps ("who voted for this?")

Document the top 10 vulnerabilities an adversary would target.

- [ ] **Step 3: The Synergy Test**

For each pair of plans that claim mutual reinforcement, verify the reinforcement is real and specific, not just rhetorical. Example: PLANEB says it integrates with PLANISV through "Bastarda Alimentaria distributes regenerative production" — but is this actually operationalized in either plan's timeline?

- [ ] **Step 4: The Intelligence Test**

Assess the strategic intelligence of the overall design:
- Does the sequencing (PLANGEO's "Inobjetables first, Confrontativos later") make geopolitical sense?
- Does the dual-track approach (legal existing frameworks + new law proposals) hedge correctly?
- Is the "absorption by excellence" strategy (PLANJUS replacing judiciary, Pulso replacing peso) realistic?
- Does the "Soberanía como Servicio" (PLANGEO) model create genuine lock-in for adopting countries?

- [ ] **Step 5: Write findings to audit file**

---

## Task 7: Assemble Master Coherence Report

**Goal:** Merge all 6 audit files into one Master Coherence Report with prioritized findings and recommendations.

**Output:** `Iniciativas Estratégicas/MASTER_COHERENCE_REPORT.md`

**Depends on:** Tasks 1-6 all complete.

- [ ] **Step 1: Collect all findings from Tasks 1-6**

Read all 6 audit files. Categorize every finding as:
- **CRITICAL** — breaks the logic of the system, creates exploitable contradiction, or represents a missing piece that could cause failure
- **IMPORTANT** — inconsistency that undermines credibility or creates confusion but doesn't break the system
- **COSMETIC** — terminology, formatting, or minor phrasing issues

- [ ] **Step 2: Write the Executive Summary**

One page. The state of the BASTA architecture in 3 paragraphs: what works brilliantly, what needs fixing, and what's missing.

- [ ] **Step 3: Write the Critical Findings section**

Each critical finding gets:
- **What:** The specific issue
- **Where:** Which plans are affected (with line references)
- **Why it matters:** What breaks if this isn't fixed
- **Recommendation:** Specific action to resolve

- [ ] **Step 4: Write the Important Findings section**

Same structure, lower severity.

- [ ] **Step 5: Write the Strategic Recommendations section**

Based on all findings, propose:
1. An update sequence (which plans to update first to cascade fixes)
2. The 5 highest-impact changes that would make the system dramatically more coherent
3. Missing documents that should be written (PLANEN, political vehicle, constitutional reform strategy)
4. A proposed canonical mandate numbering and naming convention

- [ ] **Step 6: Write the Dependency Map**

Visual (ASCII or table) showing how all 12 plans depend on each other, with the critical path highlighted.

- [ ] **Step 7: Commit the report**

```bash
git add "Iniciativas Estratégicas/audit/"
git add "Iniciativas Estratégicas/MASTER_COHERENCE_REPORT.md"
git commit -m "audit: Master Coherence Report for 12 BASTA strategic initiatives"
```

---

## Execution Notes

- **Tasks 1-6 can run in parallel** — they analyze different dimensions of the same data
- **Task 7 depends on Tasks 1-6** — it assembles their outputs
- Each task should produce a standalone findings file that can be reviewed independently
- The audit directory (`Iniciativas Estratégicas/audit/`) keeps working files separate from the final report
- All findings should include specific file paths and line numbers where possible
- The Master Report goes at the top level of `Iniciativas Estratégicas/` for visibility
