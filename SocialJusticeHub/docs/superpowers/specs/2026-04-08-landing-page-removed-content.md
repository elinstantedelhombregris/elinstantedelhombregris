# Landing Page — Removed Content for Future Reuse

**Date:** 2026-04-08
**Context:** These sections were removed from the landing page as part of the messaging redesign. They contain valuable content that should be integrated elsewhere in the platform.

---

## 1. Five National Missions Section

**Original location:** `Home.tsx` lines 172-232 (inline section)
**Suggested future home:** La Visión page (`/la-vision`), or dedicated `/misiones` page

### Copy

**Section label:** Cinco misiones nacionales

**Heading:**
```
No hay reconstrucción
sin orden de prioridad
```

**Subhead:**
```
Miramos la Argentina real y encontramos cinco heridas que no se pueden resolver por separado.
```

**Five Missions:**

| # | Title | Description | Accent Color |
|---|-------|-------------|--------------|
| 01 | La Base Está | Agua, vivienda, salud, energía, seguridad de proximidad | Blue |
| 02 | Territorio Legible | Señales, mandatos, datos abiertos, rieles digitales básicos | Emerald |
| 03 | Producción y Suelo Vivo | Empleo útil, suelo regenerado, empresas bastardas, cadenas territoriales | Amber |
| 04 | Infancia, Escuela y Cultura | Niñez cuidada, escuela significativa, cultura viva | Purple |
| 05 | Instituciones y Futuro | Justicia, integridad, anticaptura, pacto institucional duradero | Red |

### Visual Treatment
- Grid: `sm:grid-cols-2 lg:grid-cols-3`
- Cards: glassmorphism (`bg-white/[0.02]`) with colored borders
- Ghost numbers in top-right of each card
- Numbered icon badges with colored backgrounds
- Radial gradient ambient background
- Framer Motion staggered entrance (0.08s delay per card)

---

## 2. Six-Step Journey Section ("El Camino")

**Original location:** `Home.tsx` lines 12-116 (data) + lines 234-328 (render)
**Suggested future home:** Dashboard, or `/como-funciona` page for returning users

### Copy

**Section label:** El camino

**Heading:**
```
De ver la herida a probar
que se puede reconstruir
```

**Subhead:**
```
Ver. Entender. Declarar. Servir. Probar. Multiplicar.
Seis verbos. Una arquitectura cívica.
```

**Six Steps:**

| # | Verb | Subtitle | Description | Link | Accent |
|---|------|----------|-------------|------|--------|
| 01 | Ver | La Visión | Comprender la herida y el marco. Una lectura clara de la Argentina real para alinear prioridades con evidencia. | `/la-vision` | Blue |
| 02 | Entender | El Hombre Gris | Incorporar el marco ético. Hace falta entendimiento antes de declarar: humildad, verdad operativa, servicio. | `/el-instante-del-hombre-gris` | Purple |
| 03 | Declarar | La Semilla | Plantar tu compromiso. Decir qué soñás, qué necesitás, qué rechazás y qué estás dispuesto a sostener. | `/la-semilla-de-basta` | Emerald |
| 04 | Servir | El Mapa | Cargar tu verdad en el mapa. Tu información es un acto de servicio: lo que el territorio dice se vuelve legible. | `/el-mapa` | Amber |
| 05 | Probar | El Mandato | Las señales se convierten en iniciativa cívica para la gestión pública. Lo que se prueba se puede exigir. | `/el-mandato-vivo` | Red |
| 06 | Multiplicar | Los Círculos | Encontrar tu círculo de reconstrucción. Células territoriales que sostienen lo que una persona sola no puede. Cuando la prueba se comparte, el relato se vuelve legítimo. | `/community` | Pink |

### Visual Treatment
- Grid: `md:grid-cols-2 lg:grid-cols-3` with `gap-5 lg:gap-6`
- Cards: glassmorphism with colored top accent lines (3px gradient)
- Ghost numbers (5.5rem, colored at 6% opacity)
- Icon badges (11x11 rounded-xl with colored bg)
- CTA link with arrow at bottom of each card
- Hover: `-translate-y-1`, border brightens, bg shifts, glow shadow
- Multi-color ambient radial gradients in background
- Framer Motion staggered entrance (0.08s delay per card)
- Icons used: Eye, Brain, Sprout, MapPin, ScrollText, Users (from lucide-react)

---

## 3. BastaPrincipio Full Version

**Original location:** `client/src/components/BastaPrincipio.tsx`
**Component file:** PRESERVED (not deleted, just removed from Home.tsx import)
**Suggested future home:** `/el-instante-del-hombre-gris` page, or expanded methodology page

### Copy (parts not carried forward to the new Section 4)

**Original section label:** El principio

**Original heading:**
```
No es solo un grito.
Es un método.
```

**Original subhead:**
```
Cada ciclo de ¡BASTA! convierte indignación en capacidad de transformación.
Un principio con inicio, proceso y resultado.
```

**Quotes removed from the redesign:**
- Phase 01: "Nombrar el límite es recuperar dirección."
- Phase 02: "Lo que no se ordena, se dispersa."
- Phase 03: "Cuando la ciudadanía coordina, la política responde."

**Closing statement:**
```
"El objetivo no es repetir consignas, sino crear capacidades nuevas:
claridad para decidir, coordinación para ejecutar y continuidad para sostener."
```

### Visual Treatment
- Horizontal timeline connector line (desktop: gradient from blue to purple to emerald)
- Timeline nodes: 7x7 rounded circles with colored dot centers
- Cards identical pattern to Journey cards
- Quote section within each card: border-top separator, italic text

---

## 4. AparatoPolitico (Old vs New Model Comparison)

**Original location:** `client/src/components/AparatoPolitico.tsx`
**Component file:** PRESERVED (not deleted, just removed from Home.tsx import)
**Suggested future home:** `/la-vision` page, or `/como-funciona` as supporting content

### Copy

**Section label:** El cambio de paradigma

**Heading:**
```
De delegar todo
a coordinar en serio
```

**Subhead:**
```
Durante años confundimos representación con delegación total.
Recuperar capacidad de rumbo es pasar de la queja a la coordinación pública.
```

**Left column — "Delegación pasiva" (red accent):**
- Votás cada 2 años y esperás que funcione.
- Las decisiones se toman a puertas cerradas.
- Cada sector opera en su propio silo.
- Sin métricas, sin rendición de cuentas.

**Right column — "Coordinación activa" (emerald accent):**
- Co-diseñás prioridades con tu comunidad.
- Las decisiones son abiertas y verificables.
- Redes ciudadanas conectan esfuerzos.
- Mandatos claros, medibles y exigibles.

**Bridge statement:**
```
"La pregunta no es quién promete más. Es cómo convertimos
prioridades ciudadanas en decisiones trazables y resultados sostenidos."
```

### Visual Treatment
- Split card: `rounded-3xl` with `border-white/[0.06]`
- Ambient glow behind card (red-to-emerald gradient blur)
- 2-column grid inside the card
- Left: dark bg (`#0c0c0c`), red top accent line, red icon (X)
- Right: slightly different dark bg (`#0c0e12`), emerald top accent line, green icon (Check)
- Center divider (desktop): vertical gradient line with arrow node
- Bullet items: colored dots (red/emerald), staggered animation

---

## 5. Current Hero Copy

**Replaced by new hero, but preserved here for reference:**

- **Pill badge:** El Despertar del Hombre Gris
- **Headline:** ¡BASTA!
- **Tagline:** Todo nuevo comienzo empieza con un ¡BASTA!
- **Subtitle:** No venimos a pedir permiso: venimos a coordinar poder ciudadano, barrio por barrio.
- **CTA:** VER LA VISIÓN

---

## 6. Current Final CTA Copy

**Replaced by new close, but preserved here for reference:**

- **Section label:** Tu turno
- **Heading:** No venimos a administrar ruinas. Venimos a dejar armado un país que sepa escucharse, priorizar, producir, cuidarse y corregirse.
- **Body:** Elegí tu primer verbo: ver lo que pasa, entender el marco, o declarar lo que no vas a negociar. No hace falta esperar a millones. Hace falta dejar de delegar la primera parte.
- **Primary CTA:** Empezar por La Visión →
- **Secondary CTA:** Ir al Mapa Ciudadano (with MapPin icon)

---

## 7. Share Text

**Current (replaced):**
```
¡BASTA! No es solo un grito, es una reconstrucción. Cinco misiones, seis verbos, y millones de autores.
```
