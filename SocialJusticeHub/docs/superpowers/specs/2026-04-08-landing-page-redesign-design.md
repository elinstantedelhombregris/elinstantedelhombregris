# Landing Page Redesign — Messaging & Introduction

**Date:** 2026-04-08
**Status:** Approved design, pending implementation

---

## Problem Statement

The current landing page speaks to visitors who are already angry and politically engaged. But the primary audience — Argentines who have lost hope in the current system — arrives exhausted and skeptical, not fired up. The page is inside-out: it leads with the movement's identity (¡BASTA! as a shout, philosophical method, political theory) instead of meeting visitors where they are.

**Key issues identified:**
- Too abstract/intellectual — too much philosophy before showing what the platform IS
- Doesn't communicate clearly what the platform does or what someone gains
- Reads like a political manifesto rather than an invitation

## Target Audience

People who have lost hope in the current system of Argentina. They've voted, marched, argued, and stopped arguing. They're protective of their energy and deeply skeptical of anything that sounds like another political promise.

## Strategic Goals

1. **First feeling:** A spark of restrained possibility — "maybe there IS something that could work"
2. **Core message:** ¡BASTA! is a movement creating new tools and systems to drive the country in another direction, arising from a shared vision
3. **Key differentiators to communicate:**
   - Not led by a leader or party — citizen-owned infrastructure
   - Already built — real tools, real platform, real methodology
   - Starts with each individual
   - Concrete, auditable plans — no political system acting without the people's support
4. **Primary conversion:** Get the visitor to read "La Vision" (`/la-vision`)

## Emotional Arc

Exhaustion → "Something exists" → "It's genuinely different" → "There's depth here" → "Just read this"

---

## Page Structure (5 sections)

### Section 1: Hero — The Shared Wound + The Turn

**Purpose:** Validate the visitor's exhaustion, then immediately reveal that something real is already being built. ¡BASTA! is introduced WITH context — not as a cold open.

**Visual treatment:** Keep the existing HeroCinema component's cinematic dark aesthetic, particle effects, vignette. The visuals work; only the copy changes.

**Copy:**

- **Pill badge:** `El Instante del Hombre Gris`
- **Headline:**
  ```
  Votaste. Marchaste. Esperaste.
  Y todo sigue igual.
  ```
- **Subhead:**
  ```
  Un grupo de ciudadanos dejó de esperar y empezó a construir — herramientas
  reales para que la gente coordine rumbo sin depender de ningún líder,
  partido ni promesa.

  Se llama ¡BASTA! y ya está en marcha.
  ```
- **CTA button:** `Ver La Visión`
- **Scroll indicator:** `Descubrir`

**Key changes from current:**
- "¡BASTA!" is no longer the cold-open headline — it arrives after emotional setup
- The first words meet the visitor in their biography ("Votaste. Marchaste. Esperaste.")
- The subhead immediately answers "what is this?"
- Single CTA, single path: La Visión

**Component:** Modify `HeroCinema.tsx` props from `Home.tsx`. One minor change needed: the `subtitle` prop is currently typed as `string`, but the new subhead is two paragraphs. Either change the prop type to `ReactNode` to allow paragraph breaks, or pass both paragraphs as a single string and handle line breaks in the component. The `title` prop is already `ReactNode` so the new headline works as-is.

---

### Section 2: What This Actually Is — "Lo que ya existe"

**Purpose:** Answer "what did you actually build?" in 10 seconds. Concrete tools, each described in one sentence. No philosophy.

**Copy:**

- **Section label:** `Lo que ya existe`
- **Heading:**
  ```
  No es una idea.
  Es una plataforma en construcción.
  ```
- **Subhead:**
  ```
  Cada herramienta está diseñada para que la ciudadanía pueda hacer lo que
  el sistema político nunca le permitió: ver, decidir y exigir con datos.
  ```

**4 feature cards (icon + title + one-line description):**

| Card | Title | Description |
|------|-------|-------------|
| 1 | Diagnóstico Personal | Mapeá tu vida real en 12 áreas. Tu punto de partida, sin filtro. |
| 2 | Mapa Ciudadano | Lo que soñás, necesitás y rechazás — visible en tu territorio. |
| 3 | Planes Auditables | Educación, suelo, empleo, ciudades — diseñados en detalle, abiertos a todos. |
| 4 | Mandatos Vivos | Señales ciudadanas que se convierten en exigencia pública medible. |

- **Closing line:** `Todo abierto. Todo auditable. Todo construido por ciudadanos como vos.`

**Component:** New section in `Home.tsx`. 4-card grid layout using existing card styling patterns (glassmorphism cards with accent borders). No new component file needed — inline in Home.tsx like the current missions section.

**Design notes:**
- Cards use the existing accent color system: blue, emerald, amber, red
- Each card gets a relevant Lucide icon (Activity, MapPin, FileText, ScrollText or similar)
- Grid: 2x2 on desktop, stacked on mobile
- Framer Motion staggered entrance animation

---

### Section 3: Why This Is Different — "Por qué es distinto"

**Purpose:** Preemptively dismantle the "heard it before" defense. Not a comparison chart (too preachy) — direct, blunt statements.

**Copy:**

- **Section label:** `Por qué es distinto`
- **Heading:**
  ```
  No hay líder. No hay partido.
  Hay método.
  ```
- **Subhead:**
  ```
  Esto no se parece a nada que hayas visto en la política argentina. A propósito.
  ```

**3 statement blocks (bold title + short explanation):**

| Block | Title | Explanation |
|-------|-------|-------------|
| 1 | Sin caudillo, sin aparato | No hay nadie a quien seguir. Hay infraestructura que la ciudadanía opera. Si mañana desaparecemos, las herramientas quedan. |
| 2 | Planes, no consignas | Cada propuesta tiene diseño, presupuesto, métricas y mecanismo de rendición de cuentas. No pedimos que nos crean — pedimos que lo lean. |
| 3 | Empieza con vos | No arranca con una marcha ni un voto. Arranca con tu diagnóstico, tu visión, tu territorio. El sistema se construye de abajo hacia arriba. |

- **Closing line:**
  ```
  La pregunta no es quién promete más.
  Es si estás dispuesto a mirar lo que ya se está construyendo.
  ```

**Component:** New section in `Home.tsx`. Three vertical blocks with left accent borders. Replaces the current `AparatoPolitico` component import.

**Design notes:**
- Each block has a left-side accent border (4px, like a blockquote) with a distinct color
- Colors: blue (block 1), amber (block 2), emerald (block 3)
- Clean, spacious layout — let the statements breathe
- Framer Motion fade-up on scroll

---

### Section 4: The Emotional Bridge — "El método"

**Purpose:** Now the visitor is intrigued and believes something real exists. Give them a moment of depth — the ¡BASTA! method condensed, framed as "how this works" rather than philosophy.

**Copy:**

- **Section label:** `El método`
- **Heading:**
  ```
  ¡BASTA! no es solo un grito.
  Es lo que pasa después.
  ```
- **Subhead:**
  ```
  Cada transformación real tiene tres momentos. Este método los convierte
  en capacidad ciudadana.
  ```

**3 moments (numbered, with title + description):**

| # | Title | Description |
|---|-------|-------------|
| 01 | El quiebre | Dejás de normalizar. Nombrás lo que no va más — en tu vida, en tu barrio, en el país. No es bronca: es claridad. |
| 02 | La construcción | La energía del quiebre se vuelve método: diagnóstico, datos, prioridades compartidas, decisiones coordinadas. |
| 03 | La prueba | Lo construido se mide, se exige, se corrige. La ciudadanía no pide — demuestra que hay otro camino y lo sostiene. |

- **Closing statement:**
  ```
  Indignación sin método es ruido.
  Método sin gente es burocracia.
  Esto es las dos cosas juntas.
  ```

**Component:** New section in `Home.tsx`. Replaces the current `BastaPrincipio` component import. Reuses the 3-column timeline visual pattern from BastaPrincipio but with the updated, tighter copy. No quotes within each phase.

**Design notes:**
- Keep the horizontal timeline connector (desktop) from BastaPrincipio
- Keep the 3-card layout with accent colors: blue, purple, emerald
- Remove the quotes section within each card
- Keep ghost numbers, top accent lines, and hover states

---

### Section 5: The Close — "Tu turno"

**Purpose:** Single, clear invitation. Low pressure. One CTA.

**Copy:**

- **Section label:** `Tu turno`
- **Heading:**
  ```
  No hace falta que creas.
  Hace falta que leas.
  ```
- **Body:**
  ```
  Escribimos una visión de la Argentina que queremos — con datos, con diseño,
  con la honestidad de decir lo que no sabemos todavía. No te pedimos que te
  sumes a nada. Te pedimos 20 minutos.

  Si después de leerla sentís que hay algo acá, vas a saber qué hacer.
  ```
- **Primary CTA:** `Leer La Visión →` (links to `/la-vision`)

**Component:** Simplified version of current final CTA section in `Home.tsx`. Remove secondary CTA button ("Ir al Mapa Ciudadano"). Single button only.

**Design notes:**
- Keep the atmospheric gradient background and ambient glow
- Keep the blue gradient CTA button styling
- Remove the secondary outline button entirely
- The heading uses the gradient text treatment on the second line

---

## What Gets Removed (and Where It Goes)

The following sections are removed from the landing page but preserved for reuse elsewhere. See companion document: `docs/superpowers/specs/2026-04-08-landing-page-removed-content.md`

| Section | Current Component | Reason for Removal | Future Home |
|---------|-------------------|--------------------|----|
| Five National Missions | Inline in `Home.tsx` (lines 172-232) | Too much policy detail for a first visit. Overwhelms before earning trust. | Move to La Visión page, or create dedicated `/misiones` page |
| Six-Step Journey | Inline in `Home.tsx` (lines 234-328) | Internal platform architecture map, not a landing page element. | Dashboard or a `/como-funciona` page for returning users |
| BastaPrincipio (full version) | `BastaPrincipio.tsx` | Philosophical framing too early. Condensed version kept as Section 4. | Could be expanded on `/el-instante-del-hombre-gris` page |
| AparatoPolitico (comparison) | `AparatoPolitico.tsx` | Side-by-side felt preachy/lecturing. Core message absorbed into Section 3. | Could live on `/la-vision` or `/como-funciona` as supporting content |

**Important:** The component files `BastaPrincipio.tsx` and `AparatoPolitico.tsx` should NOT be deleted — they are simply no longer imported by `Home.tsx`. They may be reused on other pages.

---

## Technical Changes Summary

### Files Modified
- `client/src/pages/Home.tsx` — Major rewrite of section content and structure

### Files NOT Modified (but no longer imported by Home)
- `client/src/components/HeroCinema.tsx` — Used as-is, only props change
- `client/src/components/BastaPrincipio.tsx` — Preserved, removed from Home import
- `client/src/components/AparatoPolitico.tsx` — Preserved, removed from Home import

### No New Component Files
All new sections are built inline in `Home.tsx` following the existing pattern (the Five Missions and Journey sections are already inline). This avoids file proliferation for what are landing-page-specific sections.

### Dependencies
- No new packages needed
- Uses existing: `framer-motion`, `lucide-react`, `wouter`, `shadcn/ui Button`

### Page title update
Change from: `¡BASTA! — Todo nuevo comienzo empieza con un ¡BASTA!`
To: `¡BASTA! — Herramientas ciudadanas para reconstruir la Argentina`

### Share text update
Current: `¡BASTA! No es solo un grito, es una reconstrucción. Cinco misiones, seis verbos, y millones de autores.`
New: `¡BASTA! Un grupo de ciudadanos dejó de esperar y empezó a construir. Herramientas reales para coordinar rumbo. Sin líder. Sin partido. Hay método.`

---

## Design Constraints

- **Dark theme preserved:** `bg-[#0a0a0a]` with glassmorphism patterns
- **Typography preserved:** Inter (body), Playfair Display (serif accents), existing heading scales
- **Animation preserved:** Framer Motion scroll-triggered animations, staggered entrances
- **Responsive:** All sections must work mobile-first (existing patterns handle this)
- **Language:** Spanish (rioplatense dialect) — "vos" form throughout
- **Routing:** wouter (NOT react-router)

---

## Success Criteria

1. A first-time visitor can understand what ¡BASTA! is and what the platform does within 30 seconds of scrolling
2. The page feels like an invitation, not a manifesto
3. The primary path (La Visión) is clear and unambiguous — no competing CTAs
4. The emotional arc moves from recognition → curiosity → trust → action
5. Hopeless/skeptical visitors are met with empathy before being asked to believe anything
