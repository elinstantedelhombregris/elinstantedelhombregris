# Ensayos Fase 2 Re-weave Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-weave the seven Hombre Gris essays in English and castellano so the corrected vision (sovereign civic infrastructure as alternative to the presidency) and the urgency dimension (the race to build civic tools before others build them for us) are discovered in the writing, not bolted on. Voice preserved. Both languages at literary parity.

**Architecture:** Hold existing essays as raw material; rewrite where new content demands it; keep lines that earn their place. Bilingual: English first per essay, then castellano in the same session, both passing the voice-protection discipline from the spec. Sequential: 01 → 02 → 03 → 04 → 05 → 06 → 07. One commit per essay.

**Reference docs:**
- Spec: `SocialJusticeHub/docs/superpowers/specs/2026-04-28-ensayos-fase-2-reweave-design.md`
- Fase 1 analysis: `Ensayos/00-ANALISIS.md` (decisions §VII)
- Carta-specific analysis: `Ensayos/00-ANALISIS-07.md`
- Conceptual substrate (do not name in prose): `Iniciativas Estratégicas/PLANDIG_Argentina_ES.md`

---

## Cross-cutting conventions

**Voice-protection rules** (spec §4) — apply on every essay:

1. Three English passes: re-weave / read-aloud-flag-manifesto / read-against-other-essays.
2. Flag-not-revise: stop and ask if rhythm, grey-man figure, Beautiful Part / Move / Mirror, or demolition→construction arc is threatened.
3. No platform-doc references in prose ("PLANDIG", "ANDIG", "SAPI", "El Mandato Vivo" stay out of essay body; Cartografía at the foot does platform-linking).
4. Analysis doc grows: each essay's session ends with a delta entry in `Ensayos/00-ANALISIS.md`.
5. Castellano sense-pass, not literal. Direct address in vos.
6. Castellano read-aloud test: no English shadow.
7. Cross-version fidelity, not sameness — same beats, different rhythms.
8. Argentine specifics live more naturally in castellano.

**Conceptual substrate** (spec §8) — internalized, never named:
- *Sistema nervioso secuestrado* — captured nervous system.
- Thesis: *no political sovereignty without economic sovereignty; no economic sovereignty without digital sovereignty.*
- *Build superior alternatives, do not ban competitors.*
- *Cofre Digital* — your key, your vault.
- Federated, open, capture-resistant by protocol.
- Citizens deliberate, accountable specialists execute.
- Failure modes: civic memory revoked, identity owned by platform, deliberation on engagement-tuned systems, AI making decisions trained on values not ours.

**Commit format** (one per essay):
```
patch(ensayos): Fase 2 re-weave — [essay short title] (EN+ES)

- [English changes summary]
- [Castellano changes summary]
- 00-ANALISIS.md delta entry appended
```

---

## Task 1: Essay 01 — Presidencia (Heavy re-weave)

**Files:**
- Modify: `Ensayos/01-presidencia.md`
- Modify: `Ensayos/castellano/01-presidencia.md`
- Modify: `Ensayos/00-ANALISIS.md` (append delta entry)

**Content brief (English):**

- **Section II (Information Problem):** insert one passage acknowledging that the technologies the presidency was designed against (slow signal, expensive coordination) have been replaced *by infrastructures that are not ours*. The information pyramid did not flatten — it migrated to private hands. One sentence on the architectural opening this creates.
- **Section V (What "Stupid" Actually Means):** introduce the cost of *not* redesigning — the design that does the opposite of what it promises will be replaced; the question is by whom and on whose terms.
- **Section VI — REBUILD (the heaviest single intervention):**
  - Open by demolishing the council substitution: replacing one throne with seven thrones is still a throne. Do not concentrate the executive function; *distribute it through infrastructure that performs it continuously*.
  - The headline alternative: a national civic information stack that allows citizens to perform the executive function themselves — to surface priorities, deliberate at every layer, decide at the scale where the consequences land, and convert collective intelligence into coordinated action. Frame in the civic register first (citizens contribute; the system aggregates; deliberation surfaces; action follows). Then the briefest possible technical specificity: identity that is the citizen's, not the platform's; deliberation infrastructure that is not engagement-maximizing; civic memory that cannot be revoked; decision tools that match decisions to scale.
  - The Swiss Federal Council survives in **one sentence** as historical precedent (a partial example of councils replacing single executives in the twentieth century), demoted from headline.
  - Mountain-and-army metaphor enters here: *the greatest act of freedom available to us is not to cross the mountain with an army; it is to build the tools that allow us to organize ourselves at scale before someone else builds those tools for us, on terms that are not ours.*
  - Failure modes named concretely (per Q7-A): civic memory held in archives a future board can close; identity that is a permission a foreign company can revoke; deliberation tuned by engineers who will never know our names for outcomes that maximize their revenue and not our lives.
  - The race: interests are already racing to install their civic infrastructure into the vacuum left by collapsing democracies. The window is open today. It will not be open in twenty years.
- **Section VII (Beautiful Part):** rework so the grey man is not the recipient of better-designed government but the active builder and continuous co-governor. *Citizens commission, accountable specialists execute; the first generation builds, the next inherits.*
- **Section VIII (The Move):** carry the same. The neighborhood assembly that decides something becomes one node of the larger infrastructure. Building at the scale you can reach is the work *because* the building of the larger thing is the work of millions doing the same.
- **Argentine Mirror (Section IV):** absorb the captured-nervous-system register without naming PLANDIG. The country that has had presidents has *also* had its data, its identity, its deliberation, its memory housed in infrastructures that do not answer to it. Three paragraphs, not five (per Fase 1 decision).

**Content brief (castellano):**

Translate sense-by-sense, never literal. The mountain-and-army figure in Spanish: *el acto de libertad más grande que tenemos al alcance no es cruzar la montaña con un ejército; es construir las herramientas que nos permiten organizarnos a la escala de un país, antes de que las construyan otros en términos que no son nuestros.* Direct address in vos. The captured-nervous-system register lives more naturally in castellano — let it. Argentine specifics carry less throat-clearing in Spanish: name the costume, the cycle, the broken promise without softening.

**Voice-protection passes:**

- [ ] **Step 1: Read source materials.** Read `Ensayos/01-presidencia.md`, `Ensayos/castellano/01-presidencia.md`, and `00-ANALISIS.md` §VII recommendations for Essay 1.

- [ ] **Step 2: English Pass 1 — re-weave.** Apply the content brief above. Hold the original side-by-side; every replaced line must earn it. Preserve lines that already work — most of Sections I, II, III, V already carry their weight; the heaviest replacement is in VI. Section IV (Mirror) condensed to three paragraphs. The "Decision headline / Key assumptions" / "Top 5 failure modes / Proof metrics" scaffolding (already removed in Fase 1) stays removed.

- [ ] **Step 3: English Pass 2 — read-aloud.** Read the rewritten essay aloud (mentally). Flag every line that sounds like manifesto, startup pitch, or technical brief rather than literary essay. Rewrite. Especially watch the new Section VI — the technical specificity must always be grounded in what it does for the citizen, never as an architecture diagram.

- [ ] **Step 4: English Pass 3 — read against other essays.** Hold Essays 3, 4, 5, 6, 7 in mind. Confirm: the grey-man figure introduced here is consistent with how Essay 5 materializes him; the architecture sketched here does not pre-empt what Essay 4 will fully draw; the Beautiful Part / Move structure preserved.

- [ ] **Step 5: Castellano Pass A — sense-translate from new English.** Hold both originals open: the new English (just written) and the existing `castellano/01-presidencia.md` as scaffold. Translate by sense, not phrase. Where the existing castellano carries a line that still works in the new context, keep it; where the line was carrying English-sense that no longer applies, rewrite.

- [ ] **Step 6: Castellano Pass B — rioplatense rewrite.** Read what came out of Pass A. Anywhere the syntax feels English, break it. Spanish wants the long sweeping sentence in some places, the short rioplatense punch in others ("y la verdad es que...", "mirá, pará un segundo", "no es eso. Es esto otro"). Direct address in vos throughout. The figures of speech may be different — let the Spanish find its own.

- [ ] **Step 7: Castellano Pass C — read-aloud.** Read aloud (mentally). Any line that still reads as English-shadow gets rewritten until it is Spanish-first. The reader who only picks up the Spanish version should never feel the English under it.

- [ ] **Step 8: Castellano Pass D — cross-version fidelity.** Side-by-side with the new English. Confirm both versions land the same argumentative and emotional beats. If the Spanish has found a sharper image, lift it back to the English (and re-run English Pass 3 if so).

- [ ] **Step 9: Update `Ensayos/00-ANALISIS.md`.** Append a "Fase 2 — Essay 01 delta — 2026-04-28" entry: what was rewoven, what was preserved, what (if anything) was flagged.

- [ ] **Step 10: Commit (Essay 01).**

```bash
git add Ensayos/01-presidencia.md Ensayos/castellano/01-presidencia.md Ensayos/00-ANALISIS.md
git commit -m "$(cat <<'EOF'
patch(ensayos): Fase 2 re-weave — 01 Presidencia (EN+ES)

- Section VI rebuilt: sovereign civic infrastructure as headline alternative; Swiss Council demoted to one historical sentence
- Urgency threaded through II → V → VI → VII → VIII; mountain-and-army metaphor introduced
- Grey-man-as-co-builder is spine of VII–VIII (citizens govern, specialists execute; first generation builds, next inherits)
- Failure modes named concretely (memory revoked, identity as permission, deliberation tuned for outrage)
- Argentine Mirror condensed to three paragraphs (Fase 1 decision); absorbs captured-nervous-system register in literary key (no platform-doc names)
- Castellano rewritten sense-by-sense in rioplatense voice; cross-version parity confirmed
- 00-ANALISIS.md delta entry appended

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Essay 02 — Democracia (Selective re-weave)

**Files:**
- Modify: `Ensayos/02-democracia.md`
- Modify: `Ensayos/castellano/02-democracia.md`
- Modify: `Ensayos/00-ANALISIS.md`

**Content brief (English):**

- **Section II (Sleight of Hand):** the Fase 1 change ("conspiracy" → "design" or "arrangement") gets applied if not already done; check.
- **Vote stance:** make explicit, in one declarative line where it lands (likely Section II or VI): *the vote is necessary but radically insufficient.*
- **Section VIII (Alternatives) — selective rewrite:** sortition, subsidiarity, liquid delegation, deliberation are revealed not as policy proposals but as *components of a sovereign civic infrastructure that citizens build, own, and govern.* The reader leaves Section VIII understanding that these are not improvements to electoral democracy but the architecture that makes electoral democracy a small, last, ritual step inside a much larger thing. Brief urgency language: the tools to do this can be built today, and whoever builds them sets the terms.
- **Argentine Mirror:** absorb urgency in Argentine register — the forty-three years (kept in one anchor mention; generalized to "más de cuatro décadas" elsewhere per Fase 1 decision) of electoral democracy that did not produce self-government because the infrastructure of self-government was never built.
- **Some forking-not-from-scratch acknowledgment** (per Q4) — one line that some of this work is forking and federating what already exists, not heroic invention.

**Content brief (castellano):**

Apply same sense-by-sense translation discipline. The vote-as-necessary-but-radically-insufficient line: *el voto es necesario y radicalmente insuficiente* — the rhythm in Spanish lands sharper. The sortition / subsidiarity / liquid delegation language: find Argentine equivalents that do not feel imported (sorteo, subsidiariedad, delegación líquida — all available; let the prose define them in passing rather than dropping them as terms).

**Voice-protection passes:**

- [ ] **Step 1: Read source materials.** Essay 02 EN + ES + 00-ANALISIS.md §VII Essay 02 recommendations.

- [ ] **Step 2: English Pass 1 — re-weave** per content brief.

- [ ] **Step 3: English Pass 2 — read-aloud.** Flag manifesto-tone, especially in Section VIII rewrite where the alternatives become components of infrastructure — risk of the prose tipping technical.

- [ ] **Step 4: English Pass 3 — read against other essays.** Confirm Section VIII does not pre-empt Essay 4's full architecture sketch.

- [ ] **Step 5: Castellano Pass A — sense-translate.**

- [ ] **Step 6: Castellano Pass B — rioplatense rewrite.**

- [ ] **Step 7: Castellano Pass C — read-aloud.**

- [ ] **Step 8: Castellano Pass D — cross-version fidelity.**

- [ ] **Step 9: Update `00-ANALISIS.md`.** Append "Fase 2 — Essay 02 delta — 2026-04-28".

- [ ] **Step 10: Commit (Essay 02).**

```bash
git add Ensayos/02-democracia.md Ensayos/castellano/02-democracia.md Ensayos/00-ANALISIS.md
git commit -m "$(cat <<'EOF'
patch(ensayos): Fase 2 re-weave — 02 Democracia (EN+ES)

- Section VIII rewoven: sortition / subsidiarity / liquid delegation revealed as components of sovereign infrastructure citizens build
- Vote stance made explicit ("necessary and radically insufficient")
- "Conspiracy" → "design" / "arrangement" applied (Fase 1 carryover if needed)
- Mirror absorbs urgency in Argentine register; "forty-three years" anchor kept once, generalized elsewhere
- Forking-not-from-scratch acknowledgment threaded
- Castellano rewritten in rioplatense; cross-version parity confirmed
- 00-ANALISIS.md delta entry appended

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Essay 03 — Poder (Light re-weave)

**Files:**
- Modify: `Ensayos/03-poder.md`
- Modify: `Ensayos/castellano/03-poder.md`
- Modify: `Ensayos/00-ANALISIS.md`

**Content brief (English):**

- The recognition of power as fiction now carries a stake. Two or three woven passages (no new section): the opening that the recognition creates *must be filled by sovereign architectures the citizens build for themselves before that opening is filled by architectures built by interests with substantial reasons to keep the fiction alive.*
- Lift-where-it-fits: the passage on Wikipedia / distributed knowledge in §VII can carry one sentence about the same logic applied to civic infrastructure — the encyclopedias produced by hierarchies have already been outperformed by what citizens built together; the same will happen to the rest of governance, but only if we build it first.
- Light edits to the Fase 1 flagged passages (§IV "Why the Fiction Persists" stays at four reasons per Fase 1 decision).

**Content brief (castellano):**

Translate the new passages by sense. The phrase "interests with substantial reasons to keep the fiction alive" in Spanish wants to be sharper: *intereses que tienen razones de peso para que la ficción siga en pie.* Direct address in vos throughout.

**Voice-protection passes:**

- [ ] **Step 1: Read source materials.**

- [ ] **Step 2: English Pass 1 — re-weave.**

- [ ] **Step 3: English Pass 2 — read-aloud.**

- [ ] **Step 4: English Pass 3 — read against other essays.**

- [ ] **Step 5: Castellano Pass A — sense-translate.**

- [ ] **Step 6: Castellano Pass B — rioplatense rewrite.**

- [ ] **Step 7: Castellano Pass C — read-aloud.**

- [ ] **Step 8: Castellano Pass D — cross-version fidelity.**

- [ ] **Step 9: Update `00-ANALISIS.md`.**

- [ ] **Step 10: Commit (Essay 03).**

```bash
git add Ensayos/03-poder.md Ensayos/castellano/03-poder.md Ensayos/00-ANALISIS.md
git commit -m "$(cat <<'EOF'
patch(ensayos): Fase 2 re-weave — 03 Poder (EN+ES)

- Two-three woven passages: recognition of power as fiction creates an opening that must be filled by citizens' sovereign architectures before others fill it
- Section VII Wikipedia passage carries one sentence about the same logic applied to civic infrastructure
- Castellano rewritten in rioplatense; cross-version parity confirmed
- 00-ANALISIS.md delta entry appended

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Essay 04 — Arquitectura (Heavy re-weave, second-heaviest)

**Files:**
- Modify: `Ensayos/04-arquitectura.md`
- Modify: `Ensayos/castellano/04-arquitectura.md`
- Modify: `Ensayos/00-ANALISIS.md`

**Content brief (English):**

This is the most additive essay after Essay 1. The Fase 1 analysis flagged it as "medio+ — el más intervenido" and identified specific debts.

- **Opening shift of register:** one short paragraph at the top acknowledging that the architecture about to be sketched is not capture of the same kind the previous essay reframed — what is being protected here is not power-as-substance but *permissions, surfaces, and protocols*. (Per Fase 1 §III tension #1.)
- **Section III (Five Layers) — Layer Five resolved:** three substantive sentences applying coordination-without-concentration, transparency, and inter-national fork rights at the international layer. (Per Fase 1 decision §VII Layer Five.)
- **Section V (Six Capabilities) — heaviest rewrite:** each capability rewritten as a concrete citizen-owned, capture-resistant tool at protocol level — not as abstract category.
  - **Identity** — a key the citizen carries, never a permission a platform grants. Cryptographically verifiable, jurisdictionally portable, revocable only by the citizen herself. The vault is hers; the key is hers.
  - **Deliberation** — infrastructure for serious, structured deliberation that does not optimize for engagement; that holds long argument; that surfaces dissent rather than burying it; that ages well rather than degrading into spectacle.
  - **Decision** — sortition, liquid delegation, participatory budgeting at neighborhood scale. Decisions matched to the scale where the consequences land. Citizen-runnable, not platform-mediated.
  - **Memory** — civic archives that cannot be revoked by a future government, a future board, or a future war. Federated; held in many hands; resistant to deletion. The country's memory is the citizens', not the operator's.
  - **Communication** — federated, citizen-owned, free of recommendation algorithms tuned for outrage. Speech that survives without rewarding rage.
  - **Education** — civics taught as a craft, with materials in the open; deliberation training; the formation of the citizen who can run the infrastructure that runs the country.
- **Sortition immunity claim:** soften "Sortition citizens cannot be captured by donors" to "cannot be captured the same way" (per Fase 1 decision §III tension #2).
- **Anti-capture mechanisms:** re-grounded as protocol-level (not promise-level). Federated, open-source, fork-rights as design choices, not declarations of virtue.
- **Four debts (per Fase 1):**
  - **International** — resolved minimally in Layer Five (above).
  - **First generation** — one to two paragraphs acknowledging that the architecture is being proposed for citizens trained in dependence; the work of training the citizenry to inhabit it is part of the architecture, not a precondition. (Closure overlaps with Carta but stays here too.)
  - **Velocity / emergency** — one paragraph acknowledging that the architecture is not designed against the speed of crisis; that crisis-resilient subroutines are part of the work and named honestly.
  - **Violence (legitimate)** — kept as named debt, not resolved here. One short passage flagging it for a future series; do not pretend.
- **Urgency language threaded throughout:** these tools must be built now, by us, or they will be built later, against us. The window is open today.
- **Over-enumeration easing:** transitions where appropriate (five layers, three roles, six capabilities, eight mechanisms, four phases — let the prose breathe between them where it can without losing substance).

**Content brief (castellano):**

The architectural section in Spanish carries the most natural register — the language is at home in the cathedrals-of-the-civic-age figure. Find Spanish for "a key the citizen carries, never a permission a platform grants" — *una llave que el ciudadano lleva, no un permiso que una plataforma concede.* The "captured the same way" softening: *no se la puede capturar de la misma manera.*

**Voice-protection passes:**

- [ ] **Step 1: Read source materials.** Essay 04 EN + ES + 00-ANALISIS.md §VII Essay 04 recommendations + four debts list.

- [ ] **Step 2: English Pass 1 — re-weave.** Heaviest single rewrite after Essay 1. Watch the over-enumeration; ease into prose where the listing is reflex rather than structural.

- [ ] **Step 3: English Pass 2 — read-aloud.** This essay is most at risk of tipping into manifesto. Flag and rewrite anywhere it does.

- [ ] **Step 4: English Pass 3 — read against other essays.** Confirm Layer Five does not contradict Essay 5's national focus; the four debts language matches what the Carta already absorbs (esp. first generation).

- [ ] **Step 5: Castellano Pass A — sense-translate.**

- [ ] **Step 6: Castellano Pass B — rioplatense rewrite.**

- [ ] **Step 7: Castellano Pass C — read-aloud.**

- [ ] **Step 8: Castellano Pass D — cross-version fidelity.**

- [ ] **Step 9: Update `00-ANALISIS.md`.** Detailed delta — this is the most-changed essay.

- [ ] **Step 10: Commit (Essay 04).**

```bash
git add Ensayos/04-arquitectura.md Ensayos/castellano/04-arquitectura.md Ensayos/00-ANALISIS.md
git commit -m "$(cat <<'EOF'
patch(ensayos): Fase 2 re-weave — 04 Arquitectura (EN+ES)

- Six capabilities each rewritten as concrete citizen-owned, capture-resistant tools at protocol level (identity / deliberation / decision / memory / communication / education)
- Layer Five resolved with three substantive sentences (coordination without concentration, transparency, inter-national fork rights)
- Sortition immunity claim softened ("cannot be captured the same way")
- Four debts addressed: international (Layer V), first generation (paragraphs), velocity (paragraph), violence (named, deferred)
- Anti-capture re-grounded as protocol-level not promise-level
- Opening register-shift paragraph (capture of permissions, not substances)
- Urgency threaded throughout
- Over-enumeration eased into prose where reflex
- Castellano rewritten in rioplatense; cross-version parity confirmed
- 00-ANALISIS.md delta entry appended

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Essay 05 — Soberanía (Light)

**Files:**
- Modify: `Ensayos/05-soberania.md`
- Modify: `Ensayos/castellano/05-soberania.md`
- Modify: `Ensayos/00-ANALISIS.md`

**Content brief (English):**

- **Sovereignty-of-the-no, sovereignty-of-the-hand, sovereignty-of-the-street** — already strong. Two to three sentences in the right places connect personal sovereignties to the larger building: *recovering himself is the precondition for participating in the construction of the infrastructure; the infrastructure is the form his sovereignty takes at scale.*
- **Section X (Argentine Mirror, made personal)** — start directly with the second paragraph per Fase 1 decision (skip the introductory dilution).
- **"Welcome back" close** softened to plural per Fase 1: *Welcome back. The country has been waiting for you longer than you know — for you and the millions like you.*

**Content brief (castellano):**

The man on the 60 to Constitución opens both versions. Spanish carries this most naturally; the existing castellano likely already does well. Light additions only. The closing "Welcome back, the country has been waiting" — Spanish: *Bienvenido. Hace tiempo que el país te está esperando — a vos y a los millones como vos.*

**Voice-protection passes:**

- [ ] **Step 1: Read source materials.**

- [ ] **Step 2: English Pass 1 — re-weave.** Light. Most of this essay is preserved.

- [ ] **Step 3: English Pass 2 — read-aloud.**

- [ ] **Step 4: English Pass 3 — read against other essays.**

- [ ] **Step 5: Castellano Pass A — sense-translate.**

- [ ] **Step 6: Castellano Pass B — rioplatense rewrite.**

- [ ] **Step 7: Castellano Pass C — read-aloud.**

- [ ] **Step 8: Castellano Pass D — cross-version fidelity.**

- [ ] **Step 9: Update `00-ANALISIS.md`.**

- [ ] **Step 10: Commit (Essay 05).**

```bash
git add Ensayos/05-soberania.md Ensayos/castellano/05-soberania.md Ensayos/00-ANALISIS.md
git commit -m "$(cat <<'EOF'
patch(ensayos): Fase 2 re-weave — 05 Soberanía (EN+ES)

- Personal sovereignties connected to the larger building (recovery as precondition; infrastructure as scale)
- Section X starts directly with second paragraph (Fase 1 decision)
- "Welcome back" close softened to plural (you and the millions like you)
- Castellano rewritten in rioplatense; cross-version parity confirmed
- 00-ANALISIS.md delta entry appended

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Essay 06 — Belleza (Light)

**Files:**
- Modify: `Ensayos/06-belleza.md`
- Modify: `Ensayos/castellano/06-belleza.md`
- Modify: `Ensayos/00-ANALISIS.md`

**Content brief (English):**

- One short passage on the **beauty of sovereign tools** — the recognition that infrastructure built with care, designed for the citizens who will use it, transparent in its workings, capture-resistant in its architecture, *is itself a form of political beauty.* The tools are not ugly necessities. They are the cathedrals of the civic age, and they should be built with the discipline that cathedrals deserved. (Place where it lands most naturally — likely after the three beauties, before or in §VIII Sublime, depending on flow.)
- **Section II (Aesthetic of Capture) tightened by one paragraph** per Fase 1 recommendation.
- **Sublime section (§VIII) preserved** per Fase 1 decision (kept and lightened, not moved to Credo).
- **References to songs** stay at general level (no song titles in essay body); Cartografía at foot has the specifics.

**Content brief (castellano):**

The cathedrals figure in Spanish: *las catedrales del tiempo cívico; herramientas que merecen la disciplina que las catedrales se merecieron.* Watch that the Spanish does not over-romanticize what was tight in English.

**Voice-protection passes:**

- [ ] **Step 1: Read source materials.**

- [ ] **Step 2: English Pass 1 — re-weave.**

- [ ] **Step 3: English Pass 2 — read-aloud.** Watch the cathedrals passage — it can tip into pretension if not held tight.

- [ ] **Step 4: English Pass 3 — read against other essays.**

- [ ] **Step 5: Castellano Pass A — sense-translate.**

- [ ] **Step 6: Castellano Pass B — rioplatense rewrite.**

- [ ] **Step 7: Castellano Pass C — read-aloud.**

- [ ] **Step 8: Castellano Pass D — cross-version fidelity.**

- [ ] **Step 9: Update `00-ANALISIS.md`.**

- [ ] **Step 10: Commit (Essay 06).**

```bash
git add Ensayos/06-belleza.md Ensayos/castellano/06-belleza.md Ensayos/00-ANALISIS.md
git commit -m "$(cat <<'EOF'
patch(ensayos): Fase 2 re-weave — 06 Belleza (EN+ES)

- One passage on the beauty of sovereign tools as cathedrals of the civic age
- Section II tightened (Fase 1 recommendation)
- Sublime section preserved per Fase 1 decision (lightened, not moved)
- Castellano rewritten in rioplatense; cross-version parity confirmed
- 00-ANALISIS.md delta entry appended

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Essay 07 — Carta (Light + manifesto strengthening)

**Files:**
- Modify: `Ensayos/07-carta.md`
- Modify: `Ensayos/castellano/07-carta.md`
- Modify: `Ensayos/00-ANALISIS.md`

**Content brief (English):**

Per `00-ANALISIS-07.md` recommendation: minimal intervention. The Carta arrived already polished. Two adds:

- **Manifesto block strengthened** with one or two clauses on **sovereign tools and the urgency that defined the generation's work** — the great-grandfather looking back at the years when memory could be revoked, identity could be cancelled, deliberation ran on systems tuned for outrage, and at what his generation built before the window closed. AI named once, with edge — *the systems they were training to think for us, and what we did so the next generation would not have to ask permission to think.*
- **Failure-modes register** — let the looking-back voice carry the concrete stakes per Q7-D: the years memory was held in archives someone else could close, identity was a permission a foreign company could revoke, deliberations ran on systems that wanted us angry. Not as catalogue — as the country's near-miss, told to a child.
- **Cartografía** added at the foot per `00-ANALISIS-07.md` §IV: enumerating the six prior essays and naming Manifesto, El Mandato Vivo, La Semilla de ¡BASTA!, Cancionero.

**Content brief (castellano):**

Note: the existing castellano `07-carta.md` exists; it was written after Fase 1. Translate the new manifesto clauses by sense. The "won't have to ask permission to think" line in Spanish: *no van a tener que pedir permiso para pensar.* The looking-back voice in Spanish carries naturally — let it.

**Voice-protection passes:**

- [ ] **Step 1: Read source materials.**

- [ ] **Step 2: English Pass 1 — re-weave.** Lightest of all seven. Hold what's there; add only the manifesto clauses and Cartografía.

- [ ] **Step 3: English Pass 2 — read-aloud.** The Carta's voice is unforgiving of false notes. Anything that sounds like a list rather than a grandfather speaks gets rewritten.

- [ ] **Step 4: English Pass 3 — read against other essays.** Confirm AI naming here is consistent with the lateral-but-explicit treatment in 1–6.

- [ ] **Step 5: Castellano Pass A — sense-translate.**

- [ ] **Step 6: Castellano Pass B — rioplatense rewrite.**

- [ ] **Step 7: Castellano Pass C — read-aloud.**

- [ ] **Step 8: Castellano Pass D — cross-version fidelity.**

- [ ] **Step 9: Update `00-ANALISIS.md`.**

- [ ] **Step 10: Commit (Essay 07).**

```bash
git add Ensayos/07-carta.md Ensayos/castellano/07-carta.md Ensayos/00-ANALISIS.md
git commit -m "$(cat <<'EOF'
patch(ensayos): Fase 2 re-weave — 07 Carta (EN+ES)

- Manifesto block strengthened: one or two clauses on sovereign tools and urgency that defined the generation's work
- AI named once, with looking-back edge ("the systems they were training to think for us")
- Failure-modes register lives here in grandfather's voice (memory revoked, identity revoked, deliberation tuned for outrage as country's near-miss)
- Cartografía added at the foot (six prior essays + Manifesto, El Mandato Vivo, La Semilla, Cancionero) per 00-ANALISIS-07.md
- Castellano rewritten in rioplatense; cross-version parity confirmed
- 00-ANALISIS.md delta entry appended

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Closing — Cierre de Fase 2

**Files:**
- Modify: `Ensayos/00-ANALISIS.md`

**Content brief:**

Append a final closure block to `00-ANALISIS.md` documenting Fase 2: what changed across the series, why, what was preserved, what stayed unresolved (Credo still postponed; castellano now at parity in this Fase, no separate Fase 3 needed unless future drift).

- [ ] **Step 1: Append "Cierre de Fase 2 — 2026-04-28" block** to `00-ANALISIS.md` summarizing:
  - The seven essays' Fase 2 deltas
  - The corrected vision applied (sovereign infrastructure as alternative to presidency, urgency dimension threaded)
  - The voice-protection discipline that was followed
  - What remains: Credo still postponed; future revisions would require new Fase

- [ ] **Step 2: Commit (Cierre).**

```bash
git add Ensayos/00-ANALISIS.md
git commit -m "$(cat <<'EOF'
docs(closeout): Fase 2 closure block — ensayos series rewoven (EN+ES)

- Seven essays rewoven with corrected vision (sovereign civic infrastructure as alternative to presidency) and urgency dimension threaded
- Castellano at literary parity with English in same Fase
- Voice-protection discipline followed throughout
- Credo remains postponed; no new structural changes

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Push to main.**

```bash
git push origin main
```

---

## Self-review checklist (after writing this plan)

- [x] Spec coverage: every section/decision in the spec has a task. ✅
- [x] No placeholders: every step has actual content. ✅
- [x] Type/name consistency: file paths, section numbers, and decision references match between tasks and spec. ✅
- [x] Voice-protection rules are restated at the top and referenced from each task. ✅
- [x] Sequencing follows spec §6 (01 → 07). ✅
- [x] Each task is one commit. ✅
- [x] Push happens once at the end (Task 8). ✅
