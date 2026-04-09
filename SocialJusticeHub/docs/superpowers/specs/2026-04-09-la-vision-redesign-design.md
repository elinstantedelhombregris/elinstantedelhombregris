# La Visión — Page Redesign Spec

**Date:** 2026-04-09
**Status:** Approved
**Approach:** Approach B (structured warmth) with the soul of A (the 3am letter)

---

## Context

The landing page was redesigned from manifesto to empathy-first invitation. Now La Visión needs the same treatment. The current page leads with cold engineering metaphors ("Del Caos al Orden", "bug de diseño", "código fuente"), animated tech visuals (radar scanner, floating particles, blueprint grids), and predetermined answers (five missions as fixed solutions).

The redesign transforms it into a page that **undoes learned helplessness** — taking the reader from "the game is rigged" to "I could be one of the architects" to "there's a process for doing this collectively" to "but this requires becoming someone."

## Core Idea: Idealized Design as Collective Act

The page does NOT present a vision. It presents the **invitation to collectively design one.** The concept of idealized design: imagine the best Argentina we can build NOW (not utopia, not someday — now, with what exists), then plan backwards to the present. But this only works when everyone designs together.

¡BASTA! provides the infrastructure for that collective imagination, not the answer.

## Emotional Arc

**Wound → Ideal → Path → Mindset** — experienced as one continuous conversation, not a dashboard with sections.

The reader arrives from the landing page having been promised substance ("No hace falta que creas. Hace falta que leas"). They're curious but skeptical. By the time they reach the bottom, they should feel — not just understand — that they have agency, there's a method for exercising it collectively, and becoming the kind of person who can hold that is the real work.

## Voice & Tone

- Master strategist who speaks to hearts. The 3am letter, not the pitch deck.
- Spanish rioplatense throughout ("vos", "mirá", "pará")
- Second person sparingly — opening and closing, where directness hits hardest
- Systems language: ONE powerful moment (the hierarchy inversion), expressed warmly as a consequence of collective design, not as engineering jargon
- No tech product aesthetic. No phase labels. No section badges.

## Language — What's In / What's Out

### In
- Human metaphors ("la casa está construida al revés")
- Direct address when it matters ("toda tu vida te dijeron que tu rol es elegir")
- Honest uncertainty ("lo que no sabemos todavía")
- Quiet conviction, not shouting

### Out
- "Bug de diseño", "código fuente", "stack digital"
- Phase labels ("Fase 1: Diagnóstico")
- Uppercase pill badges with tracking-widest
- Dashboard/product language ("Pulso en Tiempo Real")
- Animated counters, scanner visuals, floating particles

---

## Page Structure: Five Sections

### Section 1: The Frame Break

**Replaces:** Current hero (title, subtitle, blueprint grid, 20 floating particles, stats bar, two PowerCTA buttons, CommitmentModal trigger, scanner icon badge)

**Purpose:** Name the invisible cage that every Argentine lives inside but has never heard articulated. The loop — crisis → hope → leader → betrayal → crisis — isn't a bug. It's the design. And your role in it has always been to choose between other people's disappointments.

Then the turn: a single question that cracks the frame. Not "we have a better answer" but "what if the entire premise is wrong?" What if your role isn't to choose — but to design?

**Emotional target:** "Someone just said the thing I've been circling around my whole life and never landed on."

**Register (indicative, not final copy):**
> *Cada cuatro años te dejan elegir quién te decepciona. Y te enseñaron a llamarle democracia.*

The frame break names the cage and plants the seed of the turn. It does NOT yet develop the concept of collective design — that's Section 2's job. The opening should end with the reader feeling the ground shift, not with an answer.

**Visual treatment:**
- Dark, breathing space. No background effects.
- The text does all the work. No animations on entry.
- Subtle warmth — gradient undertone, not cold blueprint.
- No stats bar, no CTA buttons, no badges.

**Components removed:**
- Blueprint grid background
- 20 floating particle `motion.div` elements
- Stats bar (visionStats grid)
- Both PowerCTA buttons
- CommitmentModal trigger
- Scan icon pill badge

---

### Section 2: The Invitation to Design — Idealized Design

**Replaces:** Current "System Engineering" section ("El país es un sistema. Y el sistema está mal diseñado." + SystemHierarchy toggle + three role cards)

**Purpose:** The core of the page. Introduces idealized design not as a methodology but as a natural act that somehow nobody ever does. What if we could sit down — all of us — and design the best Argentina we can build now? Not in twenty years. Not with imaginary resources. Now, with what exists. Then plan backwards to the present.

This is not about fixing what's broken. It's about imagining what we want and tracing the path back.

**Then the consequence:** When citizens design, the hierarchy inverts naturally. You don't need anyone to decree it. Citizens define the destination. The state manages resources. Politics executes.

**The toggle stays** as the ONE interactive moment. Reframed warmly:
- Left state: "Así funciona" (politics decides → state manages → citizens react)
- Right state: "Así funciona cuando diseñamos nosotros" (citizens design → state manages → politics executes)

Below the toggle: three clean text statements (Ciudadano DEFINE, Estado ADMINISTRA, Política EJECUTA) — not glassmorphism cards, just weighted text.

**Register (indicative):**
> *Toda tu vida te dijeron que tu rol es elegir. Entre dos candidatos. Entre dos frustraciones. Entre dos versiones del mismo fracaso.*
>
> *¿Y si tu rol no fuera elegir — sino diseñar?*
>
> *Imaginá que pudieras sentarte con millones de argentinos y diseñar, juntos, la mejor Argentina que se puede construir ahora. No dentro de veinte años. No con recursos imaginarios. Ahora, con lo que hay.*
>
> *Eso no es utopía. Es diseño idealizado: arrancás desde lo mejor posible y planificás hacia atrás hasta el presente.*
>
> *Cuando los ciudadanos diseñan, el orden se invierte solo. No necesitás que nadie lo decrete.*

**Visual treatment:**
- Clean, spacious layout. Text-dominant.
- SystemHierarchy toggle: keep the component, update labels and surrounding copy.
- Three role statements below: plain text with typographic weight, no card containers.
- Remove: grid background overlay, glassmorphism cards.

**Components kept (modified):**
- SystemHierarchy toggle — relabeled, recontextualized

**Components removed:**
- Grid background overlay (`bg-[linear-gradient...]`)
- Three glassmorphism role cards (`bg-white/5 border border-white/10`)

---

### Section 3: The Process — "¿Y cómo se hace?"

**Replaces:** Current "Interactive Diagnostic Scanner" (radar animation, four hoverable diagnostic pillars, brain icon, eight floating data points, scanning line)

**Purpose:** Ground the vision in believable process. The reader felt the vertigo of "we could design this." Now they need to believe it's not just a beautiful idea. But this is NOT a product demo.

The answer: the platform is infrastructure for collective design. Each person brings their reality — life, territory, what works, what doesn't, what they'd build. Those individual realities feed a shared picture. Patterns emerge. The design takes shape not because someone decides it, but because the signal becomes undeniable.

**Register (indicative):**
> *Cada persona trae lo suyo: su vida real, su territorio, lo que funciona y lo que no, lo que construiría si pudiera. Eso es materia prima.*
>
> *Cuando miles de personas hacen lo mismo, aparecen patrones. Las heridas se repiten. Las ideas se cruzan. Lo que parecía caos empieza a tener forma.*
>
> *No hace falta que nadie lo decida desde arriba. El diseño aparece solo cuando la señal es suficiente.*

**Visual treatment:**
- Text-dominant. The writing does the heavy lifting.
- If an interactive or visual element is used, it should feel organic — not a dashboard or scanner.
- Possible: a simple, quiet representation of individual signals becoming a collective picture (abstract, not literal radar).

**Components removed:**
- Entire scanner visual (concentric circles, scanning line, brain icon, 8 floating data points)
- Four diagnostic pillars with hover expansion
- "Fase 1: Diagnóstico" label
- activePillar state and hover logic

---

### Section 4: Quiet Proof — "Ya está pasando"

**Replaces:** Current "Living Pulse Metrics" (ShockStats component with three animated stat cards) AND "Closing Pattern" (five-item Q&A box)

**Purpose:** Evidence that this isn't theoretical. Real numbers in human context. Not animated counters — numbers that serve the story.

Then: honesty. What we know, what we don't know yet, what we're not going to promise. The kind of transparency that builds trust because it doesn't oversell.

**Register (indicative):**
- Numbers woven into prose, not stat cards: "X personas ya trajeron su realidad al mapa" rather than a counter racing from 0
- One honest paragraph on the state of things — what exists, what's being built, what's unknown

**Visual treatment:**
- Minimal. Numbers breathe inside text, not inside stat cards or dashboards.
- No ShockStats component. No animated counters.
- The honesty section is just words on dark space.

**Components removed:**
- ShockStats component usage
- pulseStats data array
- Closing Pattern Q&A box (five items)
- All animated counter logic

---

### Section 5: The Continuation — Into El Hombre Gris

**Replaces:** Current NextStepCard component ("Viste la herida. Ahora hace falta entender.")

**Purpose:** The page doesn't end. It deepens. The voice lowers and moves closer. Everything you just read is architecture — but architecture is held by people. The kind of person who can hold this vision, who can see clearly in fog, who doesn't become the thing they came to replace — that person needs to be forged.

This is NOT a link. NOT a card. The page *becomes* the threshold into El Hombre Gris. The reader should feel they're already inside it before they realize the page has shifted.

**Register (indicative):**
> *Todo lo que leíste es arquitectura. Pero la arquitectura no se sostiene sola.*
>
> *Se sostiene con personas que pueden mirar la niebla sin inventar certezas. Que pueden sostener la visión cuando todo empuja para atrás. Que no se convierten en lo que vinieron a reemplazar.*
>
> *Ese tipo de persona tiene un nombre.*

The transition is a quiet, full-width text link at the bottom — visually integrated into the section, not a card or button. Clicking it navigates to `/el-instante-del-hombre-gris` but the design ensures the reader feels they're continuing, not leaving. The link text itself is part of the narrative, not a UI element.

**Visual treatment:**
- The tone shift is the transition, not a visual break.
- No card container. No gradient band. No icon.
- The text deepens, the space breathes, and the reader is already there.

**Components removed:**
- NextStepCard component usage

---

## Components & State Changes

### Removed from page
- Blueprint grid background
- 20 floating particle animations
- Stats bar (visionStats)
- Both PowerCTA buttons + CommitmentModal trigger
- CommitmentModal component usage
- Scanner visual (concentric circles, scanning line, brain icon, 8 floating data points)
- Four diagnostic pillars with hover expansion
- activePillar state
- "Fase 1: Diagnóstico" label
- Three glassmorphism role cards
- Grid background overlay
- ShockStats component usage
- pulseStats data array
- Closing Pattern Q&A box
- NextStepCard component usage

### Kept (modified)
- SystemHierarchy toggle — relabeled ("Así funciona" / "Así funciona cuando diseñamos nosotros"), recontextualized as consequence of collective design
- Header and Footer — unchanged
- API queries for stats — kept but used inline in prose, not in stat components

### Kept (unchanged)
- React.lazy() code splitting
- Route at `/la-vision`
- Dark theme (`bg-[#0a0a0a]`)
- Framer Motion for subtle scroll-triggered text entrances (restrained, not decorative)

### State simplification
- Remove: `activePillar` state
- Remove: `showCommitmentModal` state
- Keep: `isVisible` for page fade-in (or replace with simpler CSS)
- Keep: stats queries (used differently)

---

## What This Spec Does NOT Cover

- The five missions — being rethought separately, not included in this redesign
- El Hombre Gris page content — Section 5 is the transition INTO it, not the page itself
- Specific final copy — the register samples are indicative of voice and direction, final copy to be written during implementation
- SystemHierarchy component internal changes — only the labels and surrounding context change; if internal modifications are needed, that's implementation detail
