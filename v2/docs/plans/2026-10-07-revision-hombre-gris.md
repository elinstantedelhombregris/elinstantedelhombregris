# v2 design revision — Hombre Gris

Date: 2026-10-07

Status: Historical proposal; superseded by the implemented plan of 2026-10-08.
Scope: v2 public website, its participation journeys, and supporting design documentation.

## 1. Intended outcome

Make the website embody the full Hombre Gris character: conviction, systems thinking, radical kindness, humility, reflection, and independent action. Preserve the recognizable Papel y Tinta identity while making the journey from recognition to participation understandable and considerate.

The visitor should be able to say:

- I recognize something of my own life here.
- I understand the idea and can examine its reasoning.
- I can choose whether to read, reflect, contribute, or act.
- I understand what my contribution does and what becomes public.
- I can take something useful into my home, work, classroom, or neighborhood.

Success is comprehension, agency, and trustworthy participation. Submission volume and time on site are insufficient measures on their own.

## 2. Evidence and boundaries

### Sources

- [PERFIL_HOMBRE_GRIS.md](../../../PERFIL_HOMBRE_GRIS.md): character, distributed leadership, family, systems thinking, and functional beauty.
- [PERSONA_HOMBRE_GRIS.md](../../../PERSONA_HOMBRE_GRIS.md): dignity, invitation, emotional journey, gray as depth, and values hierarchy.
- [Current design system](../design-system/README.md): existing typography, palette, components, motion, and page anatomy.
- [v2 implementation instructions](../../CLAUDE.md): architecture, testing, and delivery conventions.
- [Project debt register](../../../docs/DEUDAS.md): existing feature and data limitations.

The review inspected local desktop and mobile renders of Home, El Mapa, Sembrar, Biblioteca, and Planes. La Idea, the seed certificate, and Mandato were additionally examined in source. The local API was unavailable during visual review. Real-data behavior, actual map rendering, submission success, and production performance remain to be verified in a working v2 test environment.

### Preserve

- The monumental ¡BASTA! wordmark, paper/ink palette, purple accent, and existing font families.
- Rioplatense Spanish, philosophical depth, and forceful editorial passages where appropriate.
- Sembrar and its basta → sueño → compromiso structure.
- The distinction between personal intention, public contribution, evidence, and a completed action.
- Anonymous participation where supported, explicit publication choices, and optional text licensing.
- Existing content URLs, document anchors, print views, content registries, and separation of examples from real records.

### Bound the first release

Revise the public experience using existing content and contracts. New discussion systems, matching engines, reminders, accounts, community feeds, and outcome tracking require their own implementation work before they can be promised in the interface. Do not redesign v1 or the mobile application as part of this revision.

No fabricated participation, testimonials, geographic coverage, or completed outcomes. A redesign must not silently convert a Sembrar intention into a map contribution.

## 3. Proposed decisions for review

These are recommended defaults, not amendments already applied to the project.

| Decision              | Proposed direction                                                                        | Consequence                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Emotional journey     | Llamado → Visión → Espejo → Semilla → Tribu                                               | Use it to organize the homepage; allow direct entry into every task.                             |
| Gray symbolism        | Gray remains a dignified foundation                                                       | Remove global desaturation as a condition unlocked by participation.                             |
| Invitation            | Replace exclusion and guilt with clear, voluntary invitations                             | Amend the design-system FOMO requirement before editing dependent components.                    |
| Primary header action | Keep Sembrar, described as three personal phrases                                         | Give it a prominent place in desktop and mobile navigation.                                      |
| Hero action           | Primary: “Conocer la idea”; secondary: “Sembrar mi compromiso”                            | Let the first screen welcome understanding and reflection; keep direct map access in navigation. |
| Map entry             | “Explorar el mapa” opens the instrument; “Aportar al mapa” opens the contribution section | Labels and destinations must consistently match.                                                 |
| Motion                | Local feedback tied to a meaningful interaction                                           | Never label a visitor as spiritually transformed because they clicked.                           |
| Collective evidence   | Show attributable, permission-compatible records and verified status                      | Gate new examples on actual API support and data availability.                                   |
| Content revision      | Add orientation and inspectable reasoning                                                 | Preserve original documents, anchors, and substantive claims during layout changes.              |

If the hero should prioritize immediate contribution instead, change that one hierarchy decision before implementing Home. The proposed structure does not require making the entire journey mandatory.

## 4. Delivery sequence

| Package | Work                                          | Depends on             | Effort       | Review artifact                                           |
| ------- | --------------------------------------------- | ---------------------- | ------------ | --------------------------------------------------------- |
| A       | Design and voice amendment                    | None                   | Small        | Explicit decisions and copy examples                      |
| B       | Shared visual foundation and navigation       | A                      | Medium       | Desktop/mobile component specimens                        |
| C       | Homepage emotional journey                    | A, B                   | Medium       | Complete homepage at desktop and mobile widths            |
| D       | La Idea and Sembrar continuity                | A, B                   | Medium       | Reflection → commitment → next-step walkthrough           |
| E       | Map contribution experience                   | A, B                   | Large        | All contribution types, review, retry, and receipt states |
| F       | Plan/library discovery and reasoning          | A, B                   | Medium–large | Catalog and two representative document pilots            |
| G       | Mandato and collective evidence               | A, B; capability audit | Medium–large | Real/empty/error/example walkthrough                      |
| H       | Integrated validation and release preparation | B–G                    | Medium       | Evidence pack and outstanding issues                      |

Effort is relative, not a calendar estimate. B–G should remain independently reviewable. C can initially link to existing D–G destinations while those packages are completed. Backend extensions are separate estimates after the capability audit.

## 5. Package A — settle the design contract

- [ ] A1. Write the dated revision specification under `docs/specs/` using the accepted decisions from this plan. Name the clauses it supersedes in the existing design system and page specifications.
- [ ] A2. Amend the design system's brand, voice, motion, and anatomy sections. Retain its palette, typography, square geometry, and implementation conventions unless an identified readability issue requires a token adjustment.
- [ ] A3. Establish three modes within the same system: public declaration, personal reflection, and shared work. Specify when each mode applies.
- [ ] A4. Create a copy inventory for Home, La Idea, header/footer, Sembrar, map forms, and error/empty/success states. Record current text, proposed text, reason, and destination or behavior.

Copy rules:

- Editorial conviction can be intense; interaction copy should help someone decide and recover.
- Describe systems without shaming visitors or classifying them as more or less awakened.
- Do not promise that the method cannot fail, that an action is verified when only received, or that participation automatically represents the country.
- Treat quoted manifesto text separately from interface prose. Do not mass-rewrite the content corpus.
- When persona examples conflict with its principles, use its explicit hierarchy: dignity → truth → responsibility → coherence → service → beauty.

Candidate replacements for review:

| Context                      | Proposed copy                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Header action description    | “Tu basta, tu sueño y tu compromiso.”                                                                                           |
| Reflective invitation        | “¿Qué te gustaría cuidar o cambiar, empezando por lo que tenés cerca?”                                                          |
| Gray interaction explanation | Remove the announcement that the visitor must activate the site.                                                                |
| Seed commitment prompt       | “¿Qué podés hacer vos? Algo pequeño y posible también cuenta.”                                                                  |
| Fetch error                  | “No pudimos cargar las voces. Podés volver a intentarlo.”                                                                       |
| Submission error             | “No pudimos confirmar el envío. Tu texto sigue acá para que puedas reintentar.” Only use where the implementation preserves it. |
| Empty state                  | Describe the confirmed absence of records and offer a voluntary next step.                                                      |

Acceptance: the amended rules no longer simultaneously demand exclusion and invitation; candidate copy is reviewed in context, not as isolated slogans.

## 6. Package B — shared foundation, symbolism, navigation

Primary files: `components/papel/{PapelHeader,PapelFooter,DespertarVeil}.tsx`, `components/papel/papel-nav.ts`, `layouts/RootLayout.tsx`, `lib/despertar.ts`, `lib/rito.ts`, `index.css`, and the existing paper primitives under `apps/web/src/`.

- [ ] B1. Create specimens for the three modes. Declaration retains large Anton headings. Reflection uses Archivo, sentence case, comfortable line length, and more quiet space. Shared work uses compact headings, clearly labeled controls, and readable annotations.
- [ ] B2. Correct semantic text colors. Sembrar reassurance and footer utility links must use readable text tokens, not decorative/disabled colors. Aim for 4.5:1 contrast for normal text and 3:1 for large text; evaluate actual rendered combinations, including overlays.
- [ ] B3. Retire the full-viewport awakening veil and its invitation banners. Audit all consumers before removing or narrowing the existing helper. Existing `basta_despierto` values must become harmless without deleting unrelated saved seed data.
- [ ] B4. Keep restrained ink entry and seed growth only where they support meaning. Reduced-motion mode must cover transitions as well as named animations. No animation may delay access to the main action.
- [ ] B5. Place Sembrar near the top of the mobile menu. Make subsection groups expandable with separate, understandable controls for opening a group and visiting its parent page.
- [ ] B6. Specify and verify menu keyboard behavior: Escape closes, focus returns to the trigger, covered content cannot receive accidental focus, and background scrolling does not compete with the menu. Use the existing component stack.
- [ ] B7. Compact the mobile footer while keeping principles, provenance, utility links, and next steps easy to find. On Sembrar, avoid making the footer ask the visitor to start the same action again.
- [ ] B8. Standardize direct contribution links to `/el-mapa#aportar`. Reuse the existing anchor helper, account for lazy rendering and the sticky header, and provide appropriate focus at the destination.

Acceptance:

- A returning visitor and a first-time visitor see equally legible, usable controls.
- Sembrar is visible in the initial mobile menu view.
- All subsection destinations remain reachable by keyboard and touch.
- The palette and wordmark still unmistakably read as ¡BASTA!.
- Opening an action does not claim that a contribution was submitted.

## 7. Package C — rebuild the homepage composition

Primary files: `pages/Home.tsx`, `pages/Home/landing-data.ts`, and `pages/Home/sections/`.

- [ ] C1. Produce annotated wireframes at 390px and 1440px before building the complete composition. Keep the wordmark as the focal point; describe the intended feeling and decision of each section.
- [ ] C2. Llamado: retain the large ¡BASTA! and replace the dense introduction with one recognition statement and one bridge to possibility. Use the selected hero actions from Section 3.
- [ ] C3. Visión: turn the existing three-role material into one short, inspectable example. Label proposed mechanisms as proposals. Link to La Idea and the canonical explanation in Mandato for detail.
- [ ] C4. Espejo: evolve `HombreGrisBand` into a quieter encounter with ordinary life and an optional reflective question. Keep reflection in the visitor's hands; an input is unnecessary here and would duplicate Sembrar.
- [ ] C5. Semilla: preview the three phrases without duplicating the form. State what the flow does and link to `/sembrar`.
- [ ] C6. Tribu: use existing, permitted evidence of participation if the capability audit supports it. Otherwise use a clear invitation to explore the current map and separately labeled example pages. Do not add an empty ornamental community feed.
- [ ] C7. Keep a concise plans preview organized by human subjects with the original plan code as secondary information. Place the full catalog and library within easy reach without adding another long homepage index.
- [ ] C8. Reduce the prominence of aggregate counters. Give each remaining metric a definition and honest loading/empty/error behavior. In `CifrasStrip`, an unavailable value must stop presenting itself as indefinitely loading after failure.
- [ ] C9. End with a quiet choice of next step, rather than repeating the opening proclamation at full intensity.

Acceptance:

- Every section has a distinct emotional and practical purpose.
- A visitor can reach the idea, seed, map, and examples without completing any prior step.
- No wording implies a complete working civic mechanism where only a proposal exists.
- Real records and fictional examples remain separate and labeled.
- Mobile spacing is deliberate; desktop whitespace supports hierarchy rather than leaving accidental empty columns.

## 8. Package D — reflection, Sembrar, and the first real gesture

Primary files: `pages/LaIdea.tsx`, `pages/LaIdea/la-idea-data.ts`, `pages/LaIdea/sections/`, `pages/Sembrar.tsx`, `pages/Sembrar/sembrar-data.ts`, and `pages/Sembrar/sections/`.

- [ ] D1. Revise La Idea's tone to keep responsibility and rigor while removing judgment about the reader's readiness. Replace “Como vos, hasta hoy” and review “Tu silencio también firma” and the instruction to reread if the visitor expected a candidate.
- [ ] D2. Keep the distinction between a person's agency and a political leader. Audit categorical promises about the method and use inspectable reasoning and explicit limitations instead.
- [ ] D3. Preserve the three-step seed. Make all three step names visible, preserve text when moving backward, explain required input, and put readable reassurance near the writing area.
- [ ] D4. Verify the actual seed storage/publication contract. Explain what is stored and what is public based on that contract. A personal commitment must not be described as private merely because it is personal or anonymous.
- [ ] D5. Keep the certificate, printable output, and user-initiated sharing. Retain its original date and identity when a visitor returns. Change explanatory copy to emphasize ownership of the commitment rather than obligation to the movement.
- [ ] D6. Add a small optional next-step panel to the certificate: “¿Cuál sería tu primer gesto esta semana?” In this release, offer a few editorially selected, existing practices/resources and direct map access. No additional stored answer is required.
- [ ] D7. Audit and choose those resources manually. Do not infer a visitor's psychological state or claim to personalize a recommendation from their private writing.
- [ ] D8. Review copy/share/print/failure behavior. Only show confirmed success when the operation actually succeeds.

Acceptance:

- Seed creation remains its own action and never automatically creates a public map record.
- A failed submission preserves the three phrases for retry.
- Returning visitors can retrieve the existing certificate under current supported persistence behavior.
- “Plantada” describes a recorded intention; it never means the commitment has been fulfilled.
- The next step is optional, immediately useful, and supported by an existing destination.

## 9. Package E — map participation with progressive disclosure

Primary files: `pages/ElMapa.tsx`, `pages/ElMapa/sections/PanelSoltarVoz.tsx`, `pages/ElMapa/sections/soltar/`, `SelectorPrecision.tsx`, `lib/queries/open-data.ts`, and existing shared validators.

- [ ] E1. Keep the analysis instrument available at `/el-mapa`; provide a prominent contribution link near its introduction. Direct contribution CTAs arrive at `#aportar`.
- [ ] E2. Refactor presentation into three stages using one shared draft state: “Qué querés contar” → “Dónde” → “Revisar y publicar”.
- [ ] E3. Stage 1 preserves all nine supported types and their existing groupings. Show type-specific guidance and required fields only where applicable. A grouped explanation must not silently merge different data types.
- [ ] E4. Stage 2 explains optional geography and publication precision. Preserve the existing residence protections and default cautious behavior. Do not request device location without the visitor's explicit action.
- [ ] E5. Stage 3 shows the contribution type, text-publication choice, intended public location precision, and type-specific details. Keep required publication consent distinct from optional text licensing; do not preselect consent.
- [ ] E6. The preview must not expose a raw private location or imply more exact public coordinates than the existing privacy contract permits. Describe any additional server-side protection clearly.
- [ ] E7. Preserve validation, stable retry/idempotency, receipt links, withdrawal information, and differentiated next steps after submission. A receipt is proof of receipt, not corroboration, deliberation, or resolution.
- [ ] E8. Keep the draft on backward movement and failed submission. If changing type invalidates extra fields, tell the visitor and recompute validity without silently publishing stale fields.

Acceptance:

- All nine types remain reachable and submit equivalent valid payloads to the existing contract.
- Commitment dates, knowledge sources, and practice periodicity remain required where currently required.
- A visitor can publish without granting the optional text license.
- Repeated submission after an uncertain network result does not duplicate the record.
- Keyboard focus moves to the new step or relevant error; progress is understandable without color.
- Tests use an isolated v2 test environment, never the public participation dataset.

## 10. Package F — discovery and learning to design

Primary files: `pages/Planes/sections/IndicePlanes.tsx`, `pages/PlanDetail.tsx`, `lib/plans-registry.ts`, `pages/Biblioteca/sections/`, `pages/Biblioteca/biblioteca-data.ts`, and the source content/build pipeline discovered during implementation.

- [ ] F1. Define a small, human-readable topic vocabulary from the actual catalog. Reuse existing metadata where valid; amend the content source/build pipeline when metadata is missing. Do not edit generated registries by hand.
- [ ] F2. Add lightweight text search and topic filtering to the plan catalog. Titles/topics lead; codes remain visible. Preserve expandable summaries and direct document links.
- [ ] F3. Give the library topic-based discovery without removing the existing five shelves, cycles, reading times, or suggested entry points. Define the initial search scope explicitly as catalog metadata rather than promising full-text search of every document.
- [ ] F4. Pilot an orientation panel on two representative plans: desired outcome, assumptions, approach, tradeoffs, unresolved questions, and source sections. Every summary must be grounded in the plan; missing information is labeled as missing.
- [ ] F5. Preserve reader navigation and original heading IDs. Add stable orientation anchors without shifting content-derived reference anchors. Keep the print edition useful.
- [ ] F6. Offer an honest route for a question or proposed improvement using an existing supported channel and contextual link. Do not invent a live collaborative editor or imply formal deliberation is available.
- [ ] F7. Review the two pilots before extending the orientation pattern to the remaining corpus. Track corpus rollout separately; a pilot does not complete all plan revisions.

Acceptance:

- Visitors can find a plan or reading by an everyday subject without knowing a code.
- Search has clear empty/reset states and works with the keyboard.
- Existing URLs, document references, reading indices, and print outputs remain valid.
- An orientation panel distinguishes sourced statements from editorial explanation and unanswered questions.

## 11. Package G — Mandato and truthful collective evidence

Primary files: `pages/ElMandatoVivo.tsx`, `pages/ElMandatoVivo/sections/`, `pages/ElMandatoVivo/el-mandato-data.ts`, `pages/Senal.tsx`, relevant query modules, and server response contracts.

- [ ] G1. Audit which public endpoints actually expose records, attribution permissions, corroboration, dates, and status. The legacy recent-voices query must not be assumed to provide current signal lifecycle data.
- [ ] G2. Present a legible provenance structure: contribution → classification/interpretation → corroboration or other supported process → document. Reuse the canonical “Cómo se escribe” explanation instead of creating conflicting versions across pages.
- [ ] G3. Put scope and limitations near the relevant claim. Counts must say whether they represent records or people; recorded desires must not look like a deliberated mandate.
- [ ] G4. Distinguish contribution received, corroborated information, expressed intention, and reported resolution using text plus restrained visual treatment. Never infer status from scroll position or animation completion.
- [ ] G5. Link evidence to the public record where supported. Show update information only when its meaning and source are known.
- [ ] G6. Select at most a small number of genuine examples for the homepage collective section after verifying permission and lifecycle support. If unavailable, retain the honest fallback from C6.

Known dependencies to recheck before implementation:

| Existing debt                                              | Implication for this revision                                                                                                                                           |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-075: questions can be submitted but not answered         | Do not offer an answer action or use answered questions as a supported current journey until implemented.                                                               |
| D-074: lifecycle clocks are not invoked                    | Do not promise automatically refreshed or expired commitment states without verifying the lifecycle.                                                                    |
| D-088: map brightness may reveal cell participation counts | Do not expand geographic participation visualizations as decorative evidence; preserve privacy boundaries and resolve the relevant issue before exposing affected data. |
| D-057: privacy policy awaits owner-supplied information    | Do not invent those details or describe the policy as complete. Identify any release dependency explicitly.                                                             |

These are existing recorded debts, not newly verified runtime failures. Their current status must be checked before building dependent features. They do not block typography, copy, menu, or reflection improvements.

## 12. Package H — validation and release readiness

### Design review artifacts

- [ ] H1. Capture before/after screens for Home, La Idea, Sembrar step 1 and certificate, mobile menu, map review/receipt, library, plan pilot, and Mandato.
- [ ] H2. Include loading, empty, failure, and populated states where relevant. Use a controlled test environment; clearly identify fixture/example content.
- [ ] H3. Verify mobile widths 320 and 390, desktop 1440, and both sides of the existing 560/960/1140 breakpoints. Preserve the canonical breakpoints unless evidence justifies an explicit amendment.
- [ ] H4. Check keyboard operation, focus visibility/order, 200% zoom, narrow-screen reflow, reduced motion, text contrast, clear form errors, and print output. Aim for 44px main touch controls as a usability target, not a blanket claim about minimum compliance.

### Focused automated validation

- Update existing component tests for changed behavior; add meaningful coverage for nontrivial new components.
- Cover anchor arrival after lazy navigation, mobile menu focus, seed backward/retry behavior, contribution consent and type validation, stable retry identity, query error versus empty state, and catalog filtering.
- Preserve existing privacy/withdrawal/record-state coverage when refactoring forms.
- Add end-to-end journeys under `tests/e2e/`. The current Playwright config only declares desktop Chromium; use explicit mobile viewports or add a scoped mobile project for the revised journeys.
- Run focused checks during each package. Run `pnpm verify` before committing and the relevant `pnpm test:e2e` suite with its separately running test API before release.
- No new backend endpoint is planned for the core revision. If one becomes necessary, add the required validation and integration test against an isolated test database.
- Establish baseline failures first. Report unrelated pre-existing failures separately; do not claim a green verification run or expand the redesign into unrelated repairs without cause.

### Human comprehension review

Invite a small formative group of first-time readers: people primarily interested in reading, reflecting, and contributing. A recommended first round is five participants, giving directional feedback rather than statistical validation.

Tasks:

1. After seeing the homepage, explain what the project is and what you could do here.
2. Explain the difference between Sembrar and contributing to the map.
3. Reach the appropriate entry point without being told which label to choose.
4. Before submitting in the test environment, explain what becomes public and what remains optional.
5. Find a plan by subject and identify one assumption or unresolved question.
6. Explain whether an example record is real, corroborated, or fictional.
7. After viewing a seed certificate, name one practical next step without assuming it is mandatory.

Review questions: Did any wording feel judgmental? Did the design leave room to think? Did the visitor feel free to leave, read, or act? Does the site still feel recognizably ¡BASTA!?

Release gate: fix any observed misunderstanding of publication consent, record status, or fictional versus real evidence. Treat other repeated confusion as a revision input. Do not optimize the test solely for faster submission.

### Delivery

- [ ] H5. Update design specimens and documentation to match the implemented decisions.
- [ ] H6. Record remaining verified defects in the existing debt register without duplicating entries or turning subjective design preferences into defects.
- [ ] H7. Prepare focused changesets: design contract; shared foundation/navigation; Home; La Idea/Sembrar; contribution form; catalogs/pilots; Mandato/evidence; integrated verification.
- [ ] H8. Keep changesets reversible without changing underlying participation records. Avoid a schema migration in the initial revision unless an independently specified capability requires it.
- [ ] H9. Present the reviewed preview, checks, remaining limitations, and release dependencies before a separate deployment decision. Creating this plan does not deploy changes.

## 13. Review checklist for the project owner

- [ ] The emotional sequence reflects the project as intended.
- [ ] Gray remains meaningful and dignified after interaction.
- [ ] The invitation language preserves conviction without exclusion or guilt.
- [ ] Hero actions prioritize understanding and commitment; map participation remains directly accessible.
- [ ] Sembrar keeps its name, metaphor, certificate, and distinct purpose.
- [ ] The three visual modes provide enough warmth without diluting Papel y Tinta.
- [ ] Existing limitations remain visible; future features are separated from this release.
- [ ] The proposed plan-document pilots are the right depth before corpus-wide work.

Recommended first implementation slice after review: A + B, followed by the Home and Sembrar prototypes. This makes the changed voice and emotional range concrete before investing in the more complex map and evidence flows.
