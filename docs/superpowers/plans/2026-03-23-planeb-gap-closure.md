# PLANEB Gap Closure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all 13 identified gaps in PLANEB to bring it to parity with PLANREP/PLANSUS/PLANJUS/PLANSAL in operational depth, emotional resonance, and political realism.

**Architecture:** The work breaks into 4 phases: (1) New sections to add (structural gaps), (2) Existing sections to deepen (depth gaps), (3) Human stories to weave throughout (narrative gaps), (4) Tone/framing fixes (substantive blind spots). Each task produces a specific edit to `Iniciativas Estratégicas/PLANEB_Argentina_ES.md`. Current document is 1,203 lines; target is ~2,400-2,600 lines.

**Approach:** All work is in Spanish (rioplatense dialect), matching the voice/tone of existing BASTA PLANs. Tasks are sequenced so new sections are added first (they change line numbers), then existing sections are deepened (by reference to final line positions), then narrative threading happens last (touches many sections).

**TABLA numbering:** During Tasks 1-14, use descriptive names for new TABLAs without sequential numbers (e.g., "TABLA: Barreras Psicológicas vs. Respuesta Bastarda"). Task 15 assigns final sequential numbers in a single consistency pass.

**Target File:** `Iniciativas Estratégicas/PLANEB_Argentina_ES.md`

**Reference Files:**
- `Iniciativas Estratégicas/PLANREP_Argentina_ES.md` — stakeholder co-architecture (S10), contingency governance (S13), human impact KPIs (S12), provincial deployment (S9)
- `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` — operational infrastructure (S21-S27), security protocols (S22), cascada governance (S18)
- `Iniciativas Estratégicas/PLANSAL_Argentina_ES.md` — scope boundaries (S13), stakeholder strategy (S16)
- `Iniciativas Estratégicas/PLANJUS_Argentina_ES.md` — institutional depth (S12), generous criticism framing (S18)

**Gap-to-Task Mapping:**

| Gap # | Description | Task(s) |
|-------|-------------|---------|
| #1 | No operational infrastructure sections (S21-S23 pattern) | Task 5 |
| #2 | No provincial/federal deployment architecture | Task 4 |
| #3 | No stakeholder co-architecture section | Task 3 |
| #4 | Financial model too thin — no current-state X-ray | Task 7 |
| #5 | Legal section too thin — no legislative specifics | Task 8 |
| #6 | ANEB institutional design too thin | Task 6 |
| #7 | Risk section lacks contingency governance | Task 9 |
| #8 | Human stories disappear after Preámbulo | Task 12 |
| #9 | No "why would a citizen choose this?" section | Task 1 |
| #10 | Criticism responses are dismissive | Task 13 |
| #11 | No anti-monopoly self-regulation | Task 14 |
| #12 | No scope boundary ("what Bastardas DON'T do") | Task 2 |
| #13 | No human flourishing metrics | Task 11 |

---

## Phase 1: New Sections (Structural Gaps)

These tasks add entirely new sections to PLANEB. Insert in document order to avoid line-number drift.

---

### Task 1: Add S3.5 — "¿Por Qué Un Argentino Elegiría una Bastarda?" (Gap #9)

**Gap:** No "Por qué elegiría esto un ciudadano?" section — assumes rational adoption without addressing behavioral economics.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — insert after current S3.4 (La Estructura Legal), before the `---` divider leading to S4

**Content guidance:**
- Address trust transfer cost ("I'd rather pay more to someone I know than less to something I don't understand")
- Address switching friction (existing contracts, auto-debit, inertia)
- Address the paradox: more transparency can overwhelm
- Solution: the "Prueba Bastarda" — try one product (auto insurance), keep your existing coverage as backup for 3 months, compare. Zero risk.
- Social proof cascade: show early adopters' real savings on the dashboard
- Identity framing: "No sos un cliente. Sos un ciudadano que decidió ver."
- ~400-600 words, with one TABLA comparing psychological barriers vs. Bastarda response
- Use `### 3.5` heading level to match existing subsection pattern

**Steps:**
- [ ] **Step 1:** Read current S3.4 ending (line ~291) and S4 opening (line ~295) to identify exact insertion point
- [ ] **Step 2:** Write the new subsection 3.5 with `### 3.5` heading, quote opener, narrative, TABLA, and bridging paragraph to S4
- [ ] **Step 3:** Verify section numbering continuity
- [ ] **Step 4:** Commit: "PLANEB: Add S3.5 — behavioral adoption strategy"

---

### Task 2: Add S5.5 — "Lo Que la Red Bastarda NO Hace" (Gap #12)

**Gap:** No scope boundary section. PLANSAL S13 is the gold standard — explicit about what it doesn't replace.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — insert new subsection after current S5.4 (Funciones de la ANEB), before the `---` divider leading to S6

**Content guidance:**
- 5.5.1: Servicios de lujo y personalización — Bastardas proveen el servicio base al costo. If you want a premium concierge insurance experience, pay the private provider. Bastarda sets the floor, not the ceiling.
- 5.5.2: Mercados donde la opacidad no es el problema — If a market is competitive and transparent (e.g., retail e-commerce), no Bastarda needed. The petition threshold is the filter.
- 5.5.3: Reemplazo del Estado — Bastardas don't replace public services (hospitals, schools, police). They complement where markets fail.
- 5.5.4: Caridad — Bastardas are self-sustaining, not donor-dependent. They don't serve people who can't pay — that's the State's role. (But: integration with DNP from PLANREP means the floor rises for everyone.)
- 5.5.5: Regulación — Bastardas don't replace regulators. They make regulators' jobs easier by providing a transparent benchmark.
- ~500-700 words, following PLANSAL S13 structure (clear subsections, direct tone)
- **Note:** S5.4 already contains a "Lo que la ANEB NO hace" block (lines 486-493) about ANEB's scope limits. The new S5.5 addresses the broader Red Bastarda's scope limits (what kinds of markets, services, and roles Bastardas don't cover). Ensure the two blocks are clearly distinguished — ANEB scope ≠ Red scope.

**Steps:**
- [ ] **Step 1:** Read PLANSAL S13 (lines 1414-1446) for tone/structure reference, and read PLANEB S5.4 (lines 486-493) to understand the existing "Lo que ANEB NO hace" block
- [ ] **Step 2:** Write the new subsection with quote opener and 5 sub-items
- [ ] **Step 3:** Verify it flows into S6 (El Modelo Económico)
- [ ] **Step 4:** Commit: "PLANEB: Add S5.5 — scope boundaries (Lo Que la Red NO Hace)"

---

### Task 3: Add New S15 — "Estrategia de Stakeholders" (Gap #3)

**Gap:** No stakeholder co-architecture section. PLANSAL S16 is the reference — maps every actor with position, power, and strategy.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — insert as new section between current S14 (Integración BASTA) and current S15 (Riesgos). This renumbers S15→S16, S16→S17, S17→S18, S18→S19.

**Content guidance:**
- TABLA: Mapa de Stakeholders de PLANEB with columns: Actor | Posición probable | Poder de bloqueo | Estrategia
- Actors to map:
  - Aseguradoras incumbentes (oposición, alto poder → "no pelear, hacer irrelevante por referencia")
  - Bancos (oposición, muy alto poder → phased entry, start small, demonstrate)
  - Telefónicas (oposición, alto → MVNO model means they profit from Bastarda too)
  - Reguladores SSN/BCRA/ENACOM (neutral-cautelosos, alto → proactive engagement via ANEB, comply first)
  - Productores de seguros (oposición, medio → reconversión: pueden ser asesores de la Bastarda)
  - Sindicatos del sector financiero (miedo, medio → garantías de empleo en Bastardas, same or better conditions)
  - Cooperativas existentes (aliados potenciales, medio a favor → can adopt Protocolo, interoperate)
  - Fintech argentinas (aliados potenciales → infrastructure partners, open-source co-development)
  - Defensa del Consumidor (aliados naturales → data sharing, joint transparency campaigns)
  - Poder Judicial (neutral → PLANJUS as dispute backbone already aligned)
  - Medios de comunicación (variables, alto → "La Factura Invisible" provides permanent content)
  - Congreso (variable → Ley de EPP needs legislative champions)
- Subsections (following PLANSAL S16 pattern):
  - 15.1: Las aseguradoras: no pelear, iluminar
  - 15.2: Los reguladores: aliados necesarios, no obstáculos
  - 15.3: Los productores de seguros y brokers: reconversión, no extinción (generous framing — "no son el enemigo, son intermediarios de un sistema opaco")
  - 15.4: Las fintechs: primos tecnológicos
- ~800-1200 words total

**Steps:**
- [ ] **Step 1:** Read PLANSAL S16 (lines 1617-1692) for structural reference
- [ ] **Step 2:** Write the full stakeholder section with TABLA and 4 subsections
- [ ] **Step 3:** Renumber all subsequent sections (old S15→S16, S16→S17, S17→S18, S18→S19)
- [ ] **Step 4:** Comprehensive cross-reference update. Grep for ALL of these patterns and update where they reference S15+:
  - `Sección \d+` (full section references)
  - `ver \d+\.\d+` (subsection references)
  - `S\d+` if used in shorthand
  - TABLA titles that mention section numbers
  - Note: existing cross-references in the document (lines 1-1072) point to S1-S14, which are BELOW the renumbering boundary and are SAFE. Only references FROM new content or TO S15+ need updating.
- [ ] **Step 5:** Commit: "PLANEB: Add Estrategia de Stakeholders section + renumber"

---

### Task 4: Add New S19 — "Dimensión Federal" (Gap #2)

**Gap:** No provincial/federal deployment architecture. Every other PLAN has one.

**Section map after Task 3:** S15=Stakeholders (new), S16=Riesgos, S17=Comunicación, S18=Hoja de Ruta, S19=Visión 2040.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — insert as new S19 between Hoja de Ruta (S18) and Visión 2040 (which becomes S20).

**Content guidance:**
- Why federal matters: Argentina has 24 jurisdictions. Insurance is national (SSN), but energy is provincial (ENRE delegates), telecom is national (ENACOM), banking is national (BCRA). Different Bastardas face different federal structures.
- TABLA: Regulador por sector × jurisdicción (nacional/provincial/municipal)
- Provincial Bastardas: provinces can petition for province-level Bastardas (e.g., a Bastarda Energética for Mendoza that operates within the provincial energy grid)
- ANEB-province coordination: bilateral agreements (convenios marco) where ANEB provides protocol + technical assistance, province provides regulatory facilitation
- Pilot provinces: suggest 3-4 provinces with favorable conditions (progressive regulators, existing cooperative culture, PLAN24CN alignment)
- PLAN24CN integration: the 24 new cities are in 24 provinces — each city launch is also a provincial integration event
- ~500-800 words

**Steps:**
- [ ] **Step 1:** Research which regulators are national vs. provincial for each Bastarda sector
- [ ] **Step 2:** Write the Dimensión Federal section with TABLA and subsections
- [ ] **Step 3:** Renumber Visión 2040 from S19 to S20. Update any internal references to "Sección 19" → "Sección 20".
- [ ] **Step 4:** Verify section map is now: S15=Stakeholders, S16=Riesgos, S17=Comunicación, S18=Hoja de Ruta, S19=Dimensión Federal (new), S20=Visión 2040
- [ ] **Step 5:** Commit: "PLANEB: Add S19 Dimensión Federal"

---

### Task 5a: Add S21 — "Infraestructura Financiera y Compliance" (Gap #1, part 1)

**Gap:** No operational infrastructure sections. PLANSUS S21-S27 is the gold standard.

**Section map after Task 4:** ...S18=Hoja de Ruta, S19=Dimensión Federal, S20=Visión 2040. New sections S21-S23 append after S20.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — append after the closing of S20 (Visión 2040)

**Content guidance:**
- Banking infrastructure: how Bastardas handle SWIFT, DEBIN, transferencias inmediatas
- AML/CFT compliance (mirrors PLANSUS S21 approach)
- Multi-currency considerations for MERCOSUR expansion
- Capital controls compliance (BCRA regulations on currency movement)
- Reaseguro procurement: how to contract Swiss Re / Munich Re as a mutual-DAO entity
- Tax treatment under current law (fideicomiso taxation rules)
- ~500-700 words

**Steps:**
- [ ] **Step 1:** Read PLANSUS S21 (lines 1465-1557) for operational depth reference
- [ ] **Step 2:** Write S21 with quote opener, subsections, and at least one TABLA
- [ ] **Step 3:** Commit: "PLANEB: Add S21 — Infraestructura Financiera y Compliance"

---

### Task 5b: Add S22 — "Seguridad Operativa" (Gap #1, part 2)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — append after S21

**Content guidance:**
- Threat model: smart contract exploits, DDoS, social engineering, insider threats
- Defense layers: multi-audit (min 3 firms), bug bounty program (permanent), multi-sig thresholds
- Incident response protocol: detection → freeze → assess → communicate → recover → post-mortem
- Recovery architecture: cold storage reserves (off-chain backup for catastrophic on-chain failure)
- Halt thresholds: >5% treasury loss → automatic halt + Auditoría convened in 24h
- Insurance against exploit (if market exists; if not, self-insure via Fondo de Solidaridad earmark)
- Physical security: ANEB offices, data centers, key ceremonies for multi-sig wallets
- ~600-800 words, with TABLA: Threat Matrix (threat × probability × impact × response)

**Steps:**
- [ ] **Step 1:** Read PLANSUS S22 (lines 1558-1637) for security protocol reference
- [ ] **Step 2:** Write S22 with threat matrix TABLA and incident response protocol
- [ ] **Step 3:** Commit: "PLANEB: Add S22 — Seguridad Operativa"

---

### Task 5c: Add S23 — "Protocolo de Falla" (Gap #1, part 3)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — append after S22

**Content guidance:**
- Explicit failure scenarios (following PLANREP S13 pattern):
  - Scenario 1: First Bastarda fails to reach 10,000 users in Year 1
  - Scenario 2: Catastrophic smart contract exploit drains 50%+ of treasury
  - Scenario 3: SSN revokes license after political pressure
  - Scenario 4: Governance capture — a faction gains control of Panel
  - Scenario 5: Market incumbents launch "Bastarda-killer" transparent product
  - Scenario 6: Mass governance fatigue — participation drops below 3%
- Each scenario with: probability, impact, detection trigger, governance response (who decides, how fast, with what authority), recovery path
- The "muerte digna" clause: if a Bastarda genuinely fails and can't recover, protocol for orderly wind-down (return reserves to users, transfer policies to another insurer, preserve data)
- ~600-800 words, with TABLA: Escenarios de Contingencia

**Steps:**
- [ ] **Step 1:** Read PLANREP S13 (contingency scenarios) for failure protocol reference
- [ ] **Step 2:** Write S23 with scenario table and "muerte digna" protocol
- [ ] **Step 3:** Verify document flows: S20 (Visión) → S21 (Finanzas) → S22 (Seguridad) → S23 (Falla)
- [ ] **Step 4:** Commit: "PLANEB: Add S23 — Protocolo de Falla"

---

## Phase 2: Deepen Existing Sections (Depth Gaps)

These tasks expand sections that are too thin relative to equivalents in other PLANs.

---

### Task 6: Deepen S5 (ANEB) — Institutional Architecture (Gap #6)

**Gap:** 50% thinner than PLANREP S10 / PLANSAL S14. Missing role descriptions, competency profiles, anti-capture mechanics.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — expand S5.3 (Gobernanza de la ANEB) and add new subsections

**Content to add (~500-700 words):**
- **5.3b: Roles del Directorio**
  - Director/a Ejecutivo/a: general management, public representation (selected by full directorate, 4-year renewable once)
  - Director/a de Tecnología: oversees Protocolo Bastardo development, security audits (must have 10+ years in distributed systems)
  - Director/a de Integridad: independent, reports only to citizens. Handles whistleblower channel, monitors for capture, publishes integrity report quarterly.
- **5.3c: Mecanismos Anti-Captura**
  - Cooling-off: 3-year gap between leaving a regulated-sector company and joining ANEB directorate (already stated for 3 years; specify also 3 years AFTER leaving ANEB before joining regulated company)
  - Asset disclosure: all directorate members publish asset declarations annually
  - Rotation: no member serves more than 2 terms ever (not just consecutive — lifetime cap)
  - The "Alarma Ciudadana": any 5,000 citizens can trigger a public review of any directorate member's conduct; the review is conducted by an ad-hoc Panel of 7 sorteo-selected citizens
- **5.3d: Competencias Requeridas por Rol** — TABLA with each directorate position and specific competency requirements

**Steps:**
- [ ] **Step 1:** Read current S5.3 (ANEB governance) to identify insertion points
- [ ] **Step 2:** Read PLANREP S10 and PLANSAL S14 for depth reference
- [ ] **Step 3:** Write the expanded subsections
- [ ] **Step 4:** Commit: "PLANEB: Deepen ANEB institutional architecture"

---

### Task 7: Deepen S7 (Modelo Financiero) — Current-State X-Ray (Gap #4)

**Gap:** 70% thinner than equivalents. Has projections but no current-state analysis of where money goes today.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — insert new subsection 7.0 before current 7.1, and expand 7.3

**Content to add (~600-900 words):**
- **7.0: Dónde Va Tu Plata Hoy — Radiografía del Mercado Asegurador**
  - TABLA: Desglose del peso de prima en el mercado argentino (based on SSN public data)
    - Siniestros pagados: ~48-52%
    - Gastos de producción (comisiones productores): ~15-20%
    - Gastos de administración: ~12-18%
    - Resultado técnico: ~5-10%
    - Resultado financiero (inversión de reservas): ~5-8%
    - → Show exactly where the "extraction" lives: comisiones infladas + admin inflado + resultado como ganancia
  - Name the big players (by market share, not by attack): the top 5 insurers control ~40% of the market
  - What happens to the "resultado": dividendos a accionistas, bonus ejecutivos, reinversión en marketing
  - Contrast: what happens in a Bastarda (same siniestros, leaner admin, zero resultado, comisiones reemplazadas por cost of platform)
- **7.3 expanded: Efectos Fiscales Secundarios**
  - If 200K citizens save 20-30% on insurance, that's disposable income that gets spent in the real economy (fiscal multiplier)
  - Reduced regulator burden (transparent entities need less supervision)
  - Potential IVA revenue from increased economic activity (although Bastarda itself is exempt from ganancias)
  - ~200-300 words additional

**Data note:** The TABLA uses estimated ranges based on industry reports and SSN public aggregates. Mark as "Datos estimados basados en informes sectoriales — sujetos a verificación con datos SSN antes de publicación." Exact figures should be verified before any public release; for v1.1 draft, reasonable ranges are sufficient.

**Steps:**
- [ ] **Step 1:** Use the estimated insurance market ranges provided above (no SSN access required)
- [ ] **Step 2:** Write the 7.0 current-state X-ray with TABLA
- [ ] **Step 3:** Expand 7.3 with fiscal multiplier analysis
- [ ] **Step 4:** Commit: "PLANEB: Deepen financial model with current-state X-ray"

---

### Task 8: Deepen S12 (La Ley Bastarda) — Legislative Specifics (Gap #5b)

**Gap:** 80% thinner than PLANSUS S12 / PLANREP S11. Phase B is named but never detailed.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — expand S12.2 (Fase B)

**Content to add (~500-700 words):**
- **12.2 expanded: Proyecto de Ley — Estructura Detallada**
  - Title: "Ley de Entidades de Propósito Perpetuo y Gobernanza Descentralizada"
  - Número estimado de artículos: ~45-60
  - TABLA: Capítulos del proyecto de ley
    - Cap I: Disposiciones generales (definiciones, ámbito de aplicación)
    - Cap II: Constitución de EPPs (requisitos, registro, patrimonio)
    - Cap III: Gobernanza (DAO reconocida, votación on-chain, sorteo)
    - Cap IV: Régimen fiscal (exención ganancias, IVA reducido, contribuciones patronales)
    - Cap V: Régimen regulatorio (vía simplificada para EPPs en sectores regulados)
    - Cap VI: Protección contra takeover (nulidad de conversión a lucro)
    - Cap VII: ANEB (creación, competencias, presupuesto)
    - Cap VIII: Disposiciones transitorias (adaptación de Bastardas existentes bajo fideicomiso)
  - Congressional path: which committees (Legislación General, Presupuesto y Hacienda, Finanzas), expected timeline (18-24 months from introduction to sanction)
  - Compromise versions: "Ley mínima" (just duration perpetua + exención fiscal, no DAO recognition) vs. "Ley plena" (full framework)
  - Legislative champions: need 2-3 senators + 5-7 diputados from multiple bloques. PLANEB's 25,000+ user base provides political incentive.

**Steps:**
- [ ] **Step 1:** Read PLANSUS S12 and PLANREP S11 for legislative detail reference
- [ ] **Step 2:** Write the expanded Fase B with TABLA and congressional path
- [ ] **Step 3:** Commit: "PLANEB: Deepen Ley Bastarda with legislative specifics"

---

### Task 9: Deepen S16 (Riesgos) — Contingency Governance (Gap #7)

**Gap:** Risk matrix identifies risks but doesn't layer responses or include governance structure for crisis response.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — expand current risk section (renumbered to S16 after Task 3)

**Content to add (~400-600 words):**
- **New subsection: Gobernanza de Crisis — Quién Decide, Cuán Rápido**
  - TABLA: Nivel de crisis × autoridad de decisión × plazo máximo de respuesta
    - Level 1 (Operativa — reserve dip, NPS drop): Consejo Técnico decides, 7 days
    - Level 2 (Sectorial — regulatory threat, major claim spike): Panel Ciudadano convened, 15 days
    - Level 3 (Red — cross-Bastarda crisis, Fondo de Solidaridad activation): ANEB directorate, 30 days
    - Level 4 (Existencial — legal challenge to model, massive exploit): Asamblea Extraordinaria, 45 days
  - Each level escalates automatically if the lower level fails to resolve
  - Communication protocol per level (who gets told, when, how)
  - Post-crisis review: mandatory within 60 days, published, with structural changes if needed
- Integrate with existing circuit breakers in S13 (cross-reference)

**Steps:**
- [ ] **Step 1:** Read PLANREP S13 contingency governance for reference
- [ ] **Step 2:** Write the crisis governance subsection with TABLA
- [ ] **Step 3:** Add cross-references to S13 circuit breakers
- [ ] **Step 4:** Commit: "PLANEB: Add crisis governance structure to risk section"

---

### Task 10: Deepen S17 (Comunicación) — Media & Crisis Comms (Gap from depth analysis)

**Gap:** 40-50% thinner than PLANSUS S17 / PLANSAL S20. No media distribution, no ambassador strategy, no crisis comms protocol.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — expand current communication section (renumbered to S17 after Task 3)

**Content to add (~500-700 words):**
- **17.4: Distribución — Cómo Llega la Historia**
  - Digital: social media (TikTok/Instagram for "La Factura Invisible" explainers), YouTube deep-dives on real insurance costs, podcast
  - Earned media: every monthly transparency report IS a press release. Journalists can compare Bastarda costs vs. market — that's a story every month.
  - Community: La Tribu (BASTA community) as grassroots distribution. Each Tribu member who joins the Bastarda recruits 3 more (organic cascade).
- **17.5: Embajadores Bastardos**
  - Not influencers — users. Real people who publish their real savings.
  - "Mi Factura Bastarda" campaign: users share their monthly cost side-by-side with what they used to pay
  - No paid endorsements. Authenticity is the only currency.
- **17.6: Protocolo de Comunicación de Crisis**
  - If negative press: respond within 4 hours with data (not spin — data)
  - If regulatory threat: immediate public statement + legal filing + user notification
  - If exploit/security incident: transparent disclosure within 24 hours (no cover-up, ever — transparency is constitutional)
  - Pre-written templates for common crisis scenarios (adapted per-incident)

**Steps:**
- [ ] **Step 1:** Read PLANSUS S17 and PLANSAL S20 for communication depth reference
- [ ] **Step 2:** Write the three new subsections
- [ ] **Step 3:** Commit: "PLANEB: Deepen communication strategy"

---

### Task 11: Add Human Flourishing Metrics to S13 (Gap #13)

**Gap:** Only economic KPIs. No framework for measuring whether users are "bien."

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — add new subsection to S13 (Tablero)

**Content to add (~300-500 words):**
- **New subsection: 13.4 Indicadores de Impacto Humano**
  - TABLA: Dashboard de Impacto Humano — KPIs No Económicos
    - Confianza: "¿Confiás en que la Bastarda opera a tu favor?" (encuesta trimestral, target >80%)
    - Agencia: "¿Sentís que tenés voz en cómo se maneja?" (proxy: participation rate + delegation rate)
    - Comprensión: "¿Entendés tu factura mensual?" (target >90% — if people can't understand it, transparency failed)
    - Comunidad: participation in governance, attendance at events, peer-help interactions
    - Satisfacción vital: qualitative survey — "¿Saber cuánto cuesta realmente te cambió la forma de ver otros servicios?"
  - These are NOT vanity metrics — if Confianza drops below 60%, it triggers the same circuit breaker as a financial alert
  - Methodology: quarterly anonymous survey, statistically representative sample, published on dashboard

**Steps:**
- [ ] **Step 1:** Read PLANREP's human impact KPIs dashboard for reference
- [ ] **Step 2:** Write the new subsection with TABLA
- [ ] **Step 3:** Add circuit breaker trigger for human metrics to S13.3
- [ ] **Step 4:** Commit: "PLANEB: Add human flourishing metrics to dashboard"

---

## Phase 3: Narrative Threading (Emotional Resonance Gaps)

These tasks weave human stories through the technical sections of PLANEB.

---

### Task 12: Thread Human Stories Through S4-S18 (Gap #8)

**Gap:** The Moretti family opens the document then disappears for 1,100 lines. Other PLANs weave characters through every section.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — add brief human vignettes at key section transitions

**Stories to weave (each 3-6 sentences, inserted as italic narrative blocks):**

1. **S4 opening (Governance):** Claudia Moretti is selected by sorteo for the Panel Ciudadano. She's never been on a board of anything. After 30 days of training, she asks the Consejo Técnico a question about reserve allocation that no executive ever asked their board — because no executive's livelihood depends on the answer.

2. **S6 opening (Economic Model):** Martín Moretti gets his first dynamic invoice. It says $39,270 instead of the $47,000 he used to pay. Below the number, a breakdown: $X to claims, $Y to operations, $Z to reserves. He reads it in 30 seconds. He understands every line. He's never understood an insurance bill before.

3. **S9 intro (Sector Catalogue):** Valentina Moretti (14) asks her mom: "If insurance can work like this, why can't the phone company?" Claudia doesn't know yet that 12,000 people have already signed the petition for La Bastarda Conectada.

4. **S11 (Cascada):** A school teacher in Tucumán named Rosa reads about the Moretti story in a ¡BASTA! post. She starts a petition for a Bastarda Energética in her province. Within 4 months, 25,000 people signed.

5. **S18 (Hoja de Ruta):** Tomás Moretti (9 in 2026) is now 24 in 2040. He works as a developer on the Protocolo Bastardo. He never knew a world where you couldn't see what things cost. When someone tells him insurance used to be opaque, he asks: "¿Y la gente pagaba sin saber cuánto costaba? ¿En serio?"

6. **S15 (Stakeholders — new section):** Carlos, a veteran insurance broker, fears the Bastarda will destroy his livelihood. He attends an ANEB information session. He learns that Bastardas need advisors too — people who help users choose the right coverage level, understand their risk profile, navigate claims. Same skills, different employer, transparent compensation. Carlos signs up as the first Asesor Bastardo.

**Steps:**
- [ ] **Step 1:** Re-read all section openings to identify exact insertion points
- [ ] **Step 2:** Write all 6 vignettes in Spanish rioplatense
- [ ] **Step 3:** Insert each at the identified points, formatted as italic narrative blocks
- [ ] **Step 4:** Verify they don't break section flow
- [ ] **Step 5:** Commit: "PLANEB: Thread Moretti family + new characters through sections"

---

## Phase 4: Tone & Framing Fixes (Substantive Blind Spots)

---

### Task 13: Rewrite S16.2 (Críticas) with Generous Framing (Gap #10)

**Gap:** Current criticism responses are dismissive ("No. La Empresa Bastarda..."). PLANJUS/PLANSAL frame critics charitably.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — rewrite the criticism responses section (renumbered after Task 3)

**Rewrite guidance:**
- Each criticism starts with acknowledging the valid concern BEHIND the criticism
- Pattern: "Esta crítica tiene una preocupación legítima detrás: [X]. La respuesta no es descartarla sino encararla de frente."
- Specific rewrites:
  - "Esto es comunismo" → "Detrás de esta crítica hay una preocupación real: que el Estado se meta donde no le corresponde. Es una preocupación válida — Argentina tiene sobrada experiencia con el intervencionismo destructivo. PLANEB fue diseñado con esa preocupación en mente: [explain zero state involvement]"
  - "Va a fracasar como toda cooperativa" → "El cooperativismo argentino tiene problemas reales — captura dirigencial, baja transparencia, asambleas vacías. Cualquiera que vivió de cerca una cooperativa capturada tiene derecho a desconfiar. PLANEB aprendió de esos fracasos: [explain mechanisms]"
  - "Los incumbentes los van a aplastar" → "Las empresas establecidas tienen recursos, experiencia, y relaciones que la Bastarda no tiene. Subestimar eso sería irresponsable. La defensa no es arrogancia — es arquitectura: [explain]"
- ~Rewrite of existing ~600 words, maintaining length but changing tone entirely

**Steps:**
- [ ] **Step 1:** Read PLANJUS S18 and PLANSAL S16.2-16.3 for generous-framing reference
- [ ] **Step 2:** Rewrite all criticism responses with empathetic opening + structural response
- [ ] **Step 3:** Commit: "PLANEB: Rewrite criticism responses with generous framing"

---

### Task 14: Add Anti-Monopoly Self-Regulation Subsection (Gap #11)

**Gap:** PLANEB could create new monopolies. No discussion of when Bastardas themselves need regulation.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — add to risk section (renumbered S16) or to ANEB section (S5)

**Content to add (~300-500 words):**
- **"¿Y si la Bastarda se convierte en lo que vino a corregir?"**
- Market share threshold: if any single Bastarda exceeds 40% of its sector's market, ANEB convenes a public review
- The review asks: is the Bastarda's dominance because it's genuinely better (in which case: fine), or because it's using network effects to crowd out even transparent competitors (in which case: structural remedy needed)?
- Inter-Bastarda collusion prevention: each Bastarda sets its own costs independently. The Protocolo Bastardo shares infrastructure, NOT pricing decisions. If two Bastardas in related sectors coordinate to cross-subsidize → ANEB investigation.
- The ultimate safeguard: any Bastarda can be forked. The code is open-source. The governance is documented. If a Bastarda becomes captured or monopolistic, users can literally copy the entire operation and start a competing Bastarda. This is the nuclear option — and the fact that it exists disciplines behavior.
- Constitutional clause in every Bastarda: "Esta entidad existe para servir a sus usuarios, no para dominar su mercado. Si la ANEB determina que su escala perjudica la competencia, la Bastarda se somete a las medidas correctivas que el directorio de ANEB determine."

**Steps:**
- [ ] **Step 1:** Identify best placement (S5 ANEB functions or S16 risks)
- [ ] **Step 2:** Write the anti-monopoly self-regulation subsection
- [ ] **Step 3:** Commit: "PLANEB: Add anti-monopoly self-regulation"

---

### Task 15: Final Consistency Pass — Cross-References, Section Numbers, Tone

**Files:**
- Modify: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` — full document

**Checks:**
- [ ] **Step 1:** Grep for all "Sección N" / "ver N.N" references and verify they point to correct sections after renumbering
- [ ] **Step 2:** Grep for all "TABLA N" references and verify sequential numbering
- [ ] **Step 3:** Verify the closing paragraph references "octavo mandato" and lists all 7 other PLANs
- [ ] **Step 4:** Count final line count (target: 2,200-2,500)
- [ ] **Step 5:** Read the Preámbulo → Tesis Central → S1 opening for flow (the "first 5 minutes" of the document)
- [ ] **Step 6:** Read the last section (Visión) → closing paragraph for emotional landing
- [ ] **Step 7:** Commit: "PLANEB: Final consistency pass — cross-references and numbering"

---

### Task 16: Update Design Spec to Match Final Document

**Files:**
- Modify: `docs/superpowers/specs/2026-03-23-planeb-empresas-bastardas-design.md`

**Steps:**
- [ ] **Step 1:** Update section list to match final PLANEB structure (now ~23 sections)
- [ ] **Step 2:** Update line count and version notes
- [ ] **Step 3:** Mark spec status as "Implemented — v1.1"
- [ ] **Step 4:** Commit: "PLANEB: Update design spec to match v1.1"

---

## Summary

| Phase | Tasks | Est. New Lines | Gaps Closed |
|-------|-------|---------------|-------------|
| **Phase 1: New Sections** | Tasks 1, 2, 3, 4, 5a, 5b, 5c | ~900-1,200 | #1, #2, #3, #9, #12 |
| **Phase 2: Deepen Existing** | Tasks 6, 7, 8, 9, 10, 11 | ~300-500 | #4, #5, #6, #7, #13 |
| **Phase 3: Narrative Threading** | Task 12 | ~100-150 | #8 |
| **Phase 4: Tone & Framing** | Tasks 13, 14 | ~50-100 (mostly rewrites) | #10, #11 |
| **Phase 5: Cleanup** | Tasks 15, 16 | 0 (edits only) | All cross-refs |
| **TOTAL** | 18 tasks | ~1,350-1,950 new lines | All 13 gaps |

**Final section map after all tasks:**
S1-S14: unchanged. S15: Stakeholders (new). S16: Riesgos (was S15). S17: Comunicación (was S16). S18: Hoja de Ruta (was S17). S19: Dimensión Federal (new). S20: Visión 2040 (was S18). S21: Infraestructura Financiera (new). S22: Seguridad Operativa (new). S23: Protocolo de Falla (new).

**Final document target:** ~2,400-2,600 lines (from current 1,203) — comparable to PLANREP (2,497) and PLAN24CN (3,023).
