# Home Redesign Implementation Plan — Plata editorial, vidrio único, momentos cinemáticos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved design system (one violet accent, silver display gradient, single glass card style) to the Home page and shared chrome (Header, HeroCinema, floating share), fixing the white-header-on-dark bug and floating-element collisions.

**Architecture:** A new `design-tokens.ts` module exports canonical className strings; Header/HeroCinema/StatusBadge/Home consume them. All color variation per-card/per-section is removed from data arrays. No structural/layout changes to Home's 5 sections.

**Tech Stack:** React 18 + TypeScript + Tailwind 3 + Framer Motion (existing variants in `lib/motion-variants.ts`). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-06-10-home-redesign-design.md`

**Verification baseline:** This codebase has no component test infra (3 test files for ~123k LOC); per project convention, each task is verified with `npm run check` (TypeScript) and the final task does a full visual verification in the browser preview (desktop 1280px + mobile 375px). All commands run from `SocialJusticeHub/`.

---

### Task 1: Design tokens module

**Files:**
- Create: `client/src/lib/design-tokens.ts`

- [ ] **Step 1: Create the tokens file**

```typescript
/**
 * Design tokens — sistema visual "plata editorial".
 * UN acento (violeta iris) para acción, UN gradiente plata para identidad,
 * UN estilo de card de vidrio. Nada más define colores propios.
 */

/** Violeta iris — único color de acción (CTAs, links, hovers, focus). */
export const ACCENT = '#7D5BDE';
export const ACCENT_HOVER = '#8D6FE4';

/** Único tratamiento de título display (línea destacada de H1/H2). */
export const DISPLAY_GRADIENT =
  'text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400';

/** Única card de vidrio del sitio. */
export const GLASS_CARD =
  'rounded-2xl bg-white/[0.03] border border-white/10';

/** Único hover de card: borde más presente + lift + glow violeta sutil, 300ms. */
export const GLASS_CARD_HOVER =
  'transition-all duration-300 hover:border-white/25 hover:-translate-y-1 ' +
  'hover:shadow-[0_0_40px_rgba(125,91,222,0.10)]';

/** Único estilo de badge/kicker de sección. */
export const SECTION_BADGE =
  'inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] ' +
  'text-[11px] uppercase tracking-[0.3em] text-slate-400';

/** Único tratamiento de pull-quote. */
export const PULL_QUOTE = 'font-serif italic text-slate-300/90';

/** CTA primario violeta (botón redondo grande). */
export const ACCENT_BUTTON =
  'bg-[#7D5BDE] hover:bg-[#8D6FE4] text-white ' +
  'shadow-[0_0_40px_rgba(125,91,222,0.30)] hover:shadow-[0_0_60px_rgba(125,91,222,0.45)]';

/** Ritmo vertical de sección. */
export const SECTION_PAD = 'py-20 md:py-28';
```

- [ ] **Step 2: Verify TypeScript**

Run: `npm run check`
Expected: exit 0, no new errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/design-tokens.ts
git commit -m "feat(design): add design-tokens module — violeta acción, plata identidad, vidrio único"
```

---

### Task 2: StatusBadge — semantic dot on neutral chip

**Files:**
- Modify: `client/src/components/ui/StatusBadge.tsx`

The color must inform, not decorate: neutral chip, 6px colored dot. Labels, statuses, and titles unchanged.

- [ ] **Step 1: Replace STATUS_META and the render**

Replace the whole file body (keep the doc comment and `PlatformStatus` type as-is) so `STATUS_META` carries only a dot color and the chip is neutral:

```typescript
import { cn } from '@/lib/utils';

/**
 * Etiquetas de honestidad de la plataforma.
 * Todo lo que se muestra pertenece a uno de estos registros — y se dice.
 *  - live:        datos reales, funcionando hoy
 *  - construccion: existe pero está en desarrollo activo
 *  - simulacion:  escenario ilustrativo de cómo se vería a escala
 *  - ejercicio:   ejercicio de diseño idealizado (ej.: los 22 planes)
 */
export type PlatformStatus = 'live' | 'construccion' | 'simulacion' | 'ejercicio';

const STATUS_META: Record<PlatformStatus, { label: string; dotClass: string; title: string }> = {
  live: {
    label: 'EN VIVO',
    dotClass: 'bg-emerald-400',
    title: 'Datos reales, funcionando hoy',
  },
  construccion: {
    label: 'EN CONSTRUCCIÓN',
    dotClass: 'bg-amber-400',
    title: 'Existe y se está desarrollando en abierto',
  },
  simulacion: {
    label: 'SIMULACIÓN',
    dotClass: 'bg-sky-400',
    title: 'Escenario ilustrativo: así se vería a escala',
  },
  ejercicio: {
    label: 'EJERCICIO DE DISEÑO',
    dotClass: 'bg-slate-400',
    title: 'Diseño idealizado: muestra a dónde se podría apuntar, no es una promesa',
  },
};

interface StatusBadgeProps {
  status: PlatformStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      title={meta.title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5',
        'text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-300',
        className,
      )}
    >
      <span aria-hidden className={cn('w-1.5 h-1.5 rounded-full shrink-0', meta.dotClass)} />
      {meta.label}
    </span>
  );
}

export default StatusBadge;
```

- [ ] **Step 2: Check other usages render fine**

Run: `grep -rn "StatusBadge" client/src --include="*.tsx" -l`
Expected: list of consumers (no API change, so no edits needed — props are identical).

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/ui/StatusBadge.tsx
git commit -m "feat(design): StatusBadge — punto semántico sobre chip neutro"
```

---

### Task 3: Header — dark glass when scrolled on dark pages

**Files:**
- Modify: `client/src/components/Header.tsx`

The bug: `showSolid = scrolled || !isDarkPage` collapses two distinct states into one white style. Split them: dark pages get a dark-glass scrolled state; the white style remains only for genuinely light pages.

- [ ] **Step 1: Replace the `showSolid` logic with a 3-state style**

In `Header.tsx`, after the `isDarkPage` computation (line ~49), replace:

```typescript
  // On light pages, always show the "scrolled" (white bg + dark text) style
  const showSolid = scrolled || !isDarkPage;
```

with:

```typescript
  // Light pages keep the white chrome; dark pages get dark glass when scrolled.
  const lightChrome = !isDarkPage;
  const showSolid = lightChrome; // dark text & light surfaces only on light pages
```

- [ ] **Step 2: Update the header container classes**

Replace the `className` of `<motion.header>` (lines ~104-108):

```typescript
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          lightChrome
            ? 'bg-white/90 backdrop-blur-md border-slate-200 shadow-sm py-3'
            : scrolled
              ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-white/[0.08] py-3'
              : 'bg-transparent border-transparent py-5'
        }`}
```

All other `showSolid ? ... : ...` ternaries in the file (logo text, nav links, panel/profile pills, logout, login ghost, mobile menu toggle) stay as written — with `showSolid = lightChrome` they now correctly keep light text on dark pages at all scroll positions.

- [ ] **Step 3: Violet accent for actions**

Still in `Header.tsx`:

1. Logo subtitle (line ~122): `text-blue-500` → `text-[#7D5BDE]`
2. Active nav item (line ~138): `bg-blue-500/10 text-blue-500` → `bg-[#7D5BDE]/10 text-[#9D85E8]`
3. Nav hover on light chrome (line ~139): `hover:text-blue-600` → `hover:text-[#7D5BDE]`
4. Desktop "Unirse" (line ~210): `bg-blue-600 hover:bg-blue-700` → `bg-[#7D5BDE] hover:bg-[#8D6FE4]`
5. Mobile "Unirse" (line ~216): same replacement
6. Mobile sheet active item (line ~247): `bg-blue-600 text-white` → `bg-[#7D5BDE] text-white`; its desc (line ~251) `text-blue-100` → `text-violet-100`
7. Sheet bottom "Unirse" (line ~327): `bg-blue-600 hover:bg-blue-700` → `bg-[#7D5BDE] hover:bg-[#8D6FE4]`
8. Floating feedback button (line ~345): `bg-blue-600 hover:bg-blue-700 ... shadow-blue-600/30` → `bg-[#7D5BDE] hover:bg-[#8D6FE4] ... shadow-[#7D5BDE]/30`

- [ ] **Step 4: Verify**

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/Header.tsx
git commit -m "Fix header: vidrio oscuro al scrollear en páginas oscuras + acento violeta"
```

---

### Task 4: HeroCinema — violet CTA, mobile-safe scroll indicator

**Files:**
- Modify: `client/src/components/HeroCinema.tsx`

- [ ] **Step 1: Hide the scroll indicator on mobile**

On the `<motion.button>` scroll indicator (line ~123-138), change its className from:

```
className="absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer z-20 p-3"
```

to:

```
className="hidden md:block absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer z-20 p-3"
```

(Fixes the "DESCUBRIR" overlap with the secondary CTA at 375px.)

- [ ] **Step 2: Primary CTA to violet**

On the primary `<Button>` (line ~96), replace:

```
bg-blue-600 hover:bg-blue-500 text-white px-10 py-7 rounded-full text-lg tracking-widest shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(37,99,235,0.6)]
```

with:

```
bg-[#7D5BDE] hover:bg-[#8D6FE4] text-white px-10 py-7 rounded-full text-lg tracking-widest shadow-[0_0_40px_rgba(125,91,222,0.35)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(125,91,222,0.5)]
```

- [ ] **Step 3: Badge text color to neutral**

On the badge `<span>` (line ~68): `text-blue-300` → `text-slate-300`.

- [ ] **Step 4: Verify**

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/HeroCinema.tsx
git commit -m "feat(design): HeroCinema — CTA violeta, indicador de scroll oculto en mobile"
```

---

### Task 5: Home hero — violet ¡BASTA!, shorter copy, violet selection

**Files:**
- Modify: `client/src/pages/Home.tsx` (lines ~182, ~198-211)

- [ ] **Step 1: Root selection color**

Line ~182: `selection:bg-blue-500/30` → `selection:bg-[#7D5BDE]/30`.

- [ ] **Step 2: Subtitle — shorter first paragraph + violet ¡BASTA!**

Replace the `subtitle` prop content (lines ~199-210) with:

```tsx
          subtitle={
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-[clamp(1rem,1.8vw,1.25rem)] leading-relaxed text-slate-300/90">
                Un grupo de ciudadanos dejó de esperar y empezó a construir
                herramientas para hacer evidente lo que queremos y lo que ya no
                aguantamos — cada uno desde su barrio, su provincia, su lugar.
              </p>
              <p className="text-[clamp(1.1rem,2vw,1.4rem)] font-semibold text-white/90">
                Se llama <span className="text-[#9D85E8] font-bold">¡BASTA!</span>:
                la ciudadanía diseña, el Estado administra, la política ejecuta.
                Sin líder, sin partido, sin promesas.
              </p>
            </div>
          }
```

(Copy cut: "lo que soñamos, lo que necesitamos y" — keeps voice, drops to ~3 lines on mobile. ¡BASTA! keeps its exclamation marks. `#9D85E8` is the readable-on-dark tint of the accent.)

- [ ] **Step 3: Verify**

Run: `npm run check`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Home.tsx
git commit -m "feat(design): Home hero — ¡BASTA! violeta, párrafo más corto, selección violeta"
```

---

### Task 6: Home section 2 ("Lo que ya existe") — single glass language

**Files:**
- Modify: `client/src/pages/Home.tsx` (features array lines ~15-81; section JSX lines ~220-346)

- [ ] **Step 1: Add token imports**

At the top of `Home.tsx`, add:

```typescript
import {
  GLASS_CARD,
  GLASS_CARD_HOVER,
  SECTION_BADGE,
  DISPLAY_GRADIENT,
  PULL_QUOTE,
} from '@/lib/design-tokens';
```

- [ ] **Step 2: Strip color fields from the features array**

Replace the entire `features` declaration (lines ~15-81) with:

```typescript
/* ── Feature cards data (Section 2) ───────────────────── */
const features: ReadonlyArray<{
  title: string;
  description: string;
  href: string;
  status: PlatformStatus;
  icon: React.ReactNode;
}> = [
  {
    title: 'Diagnóstico Personal',
    description: 'Mapeá tu vida real en 12 áreas. Tu punto de partida, sin filtro.',
    href: '/evaluacion',
    status: 'live',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    title: 'El Mapa Ciudadano',
    description: 'Lo que soñás, necesitás y rechazás — visible en tu territorio, junto a miles de voces más.',
    href: '/el-mapa',
    status: 'live',
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    title: '22 Planes de Ejemplo',
    description: 'Educación, suelo, justicia, ciudades: el ejercicio completo de diseñar el país desde cero, escrito en detalle para mostrar que se puede. Imaginate hacerlo entre millones.',
    href: '/recursos/ruta',
    status: 'ejercicio',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: 'El Mandato Vivo',
    description: 'Lo que pide tu barrio, contado y publicado cada semana — para que nadie pueda decir que no lo sabía.',
    href: '/el-mandato-vivo',
    status: 'construccion',
    icon: <ScrollText className="w-5 h-5" />,
  },
];
```

- [ ] **Step 3: Section shell — padding, background, badge, H2**

In section `#lo-que-existe` (line ~220):

1. Section className: `py-28 md:py-36` → `py-20 md:py-28`
2. Delete the two ambient blob divs (lines ~223-224) and replace with one violet blob:

```tsx
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#7D5BDE]/[0.05] rounded-full blur-[160px]" />
          </div>
```

3. Delete the dot-grid div (line ~227): `<div className="absolute inset-0 pattern-dots opacity-40 pointer-events-none" />`
4. Badge span (line ~239): replace its className with `` className={`${SECTION_BADGE} mb-6`} ``
5. H2 gradient line (line ~245): `from-blue-400 via-cyan-400 to-emerald-400` → use the token: `` <span className={DISPLAY_GRADIENT}> `` (gradient-to-b plata)

- [ ] **Step 4: Triptych DISEÑA/ADMINISTRA/EJECUTA**

Replace the roles map (lines ~263-272) with:

```tsx
                {[
                  { who: 'La ciudadanía', verb: 'DISEÑA' },
                  { who: 'El Estado', verb: 'ADMINISTRA' },
                  { who: 'La política', verb: 'EJECUTA' },
                ].map((role) => (
                  <div key={role.verb} className={`${GLASS_CARD} px-6 py-5 text-center`}>
                    <p className="text-sm text-slate-400">{role.who}</p>
                    <p className="text-xl md:text-2xl font-black tracking-wide text-white">{role.verb}</p>
                    <div className="mx-auto mt-2 h-px w-8 bg-[#7D5BDE]" />
                  </div>
                ))}
```

- [ ] **Step 5: Feature cards — one glass style**

Replace the card markup inside `features.map` (lines ~286-331) with:

```tsx
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative"
                  >
                    <Link href={feature.href} className="block h-full">
                      <div className={`relative h-full ${GLASS_CARD} ${GLASS_CARD_HOVER} overflow-hidden cursor-pointer`}>
                        <div className="p-7 md:p-8 relative">
                          {/* Icon + status */}
                          <div className="flex items-start justify-between mb-5">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                              {feature.icon}
                            </div>
                            <StatusBadge status={feature.status} />
                          </div>

                          {/* Title */}
                          <h3 className="text-xl font-bold text-white mb-3">
                            {feature.title}
                          </h3>

                          {/* Description */}
                          <p className="text-slate-400 text-[15px] leading-relaxed mb-4">
                            {feature.description}
                          </p>

                          {/* Affordance */}
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9D85E8]">
                            Entrar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
```

(Removed: top accent line, per-card scale animation, icon hover scale, tinted borders/glows.)

- [ ] **Step 6: Closing line uses the pull-quote token**

Line ~340: `className="text-center text-lg md:text-xl font-serif italic text-slate-300/80"` → `` className={`text-center text-lg md:text-xl ${PULL_QUOTE}`} ``

- [ ] **Step 7: Verify + commit**

Run: `npm run check` — Expected: exit 0. (`PlatformStatus` is already imported on line 13.)

```bash
git add client/src/pages/Home.tsx
git commit -m "feat(design): Home sección 2 — vidrio único, tríptico neutro con regla violeta, H2 plata"
```

---

### Task 7: Home section 3 ("Por qué es distinto") — silver discipline

**Files:**
- Modify: `client/src/pages/Home.tsx` (differentiators array lines ~84-106; section JSX lines ~349-422)

- [ ] **Step 1: Strip colors from differentiators**

Replace the array (lines ~84-106) with:

```typescript
/* ── Differentiator blocks data (Section 3) ───────────── */
const differentiators = [
  {
    title: 'Sin caudillo, sin aparato',
    text: 'No hay nadie a quien seguir. Hay infraestructura que la ciudadanía opera. ¿Quién la sostiene? El hombre gris: alguien común que se salió de la grieta y eligió construir en vez de pelear. No es uno — somos muchos. Si mañana desaparecemos, las herramientas quedan.',
  },
  {
    title: 'Planes, no consignas',
    text: 'Cada propuesta tiene diseño, presupuesto, métricas y mecanismo de rendición de cuentas. No pedimos que nos crean — pedimos que lo lean.',
  },
  {
    title: 'Arranca con vos',
    text: 'No arranca con una marcha ni un voto. Arranca con tu diagnóstico, tu visión, tu territorio. El sistema se construye de abajo hacia arriba.',
  },
] as const;
```

- [ ] **Step 2: Section shell**

1. Section className (line ~349): `py-28 md:py-36` → `py-20 md:py-28`
2. Replace the two blobs (lines ~352-353) with one:

```tsx
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#7D5BDE]/[0.04] rounded-full blur-[180px] pointer-events-none" />
```

(Keep the `via-[#0d0d14]` band div on line ~351 — it's neutral.)
3. Badge (line ~365): `` className={`${SECTION_BADGE} mb-6`} ``
4. H2 highlight (line ~371): `<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">` → `<span className={DISPLAY_GRADIENT}>`

- [ ] **Step 3: Differentiator blocks — silver left borders, neutral ghosts**

In the map (lines ~382-403), the block div className becomes (no per-item colors):

```tsx
                    className="relative border-l-4 border-l-white/25 pl-7 md:pl-9 py-2"
```

Ghost number span className becomes:

```tsx
                    <span className="absolute -top-4 right-0 text-[5rem] md:text-[6rem] font-black text-white/[0.04] leading-none select-none pointer-events-none">
```

- [ ] **Step 4: Closing quote uses the token**

Line ~414: `className="text-xl md:text-2xl font-serif italic text-slate-300/90 leading-relaxed"` → `` className={`text-xl md:text-2xl leading-relaxed ${PULL_QUOTE}`} ``

- [ ] **Step 5: Verify + commit**

Run: `npm run check` — Expected: exit 0.

```bash
git add client/src/pages/Home.tsx
git commit -m "feat(design): Home sección 3 — bordes plata, números fantasma neutros, H2 plata"
```

---

### Task 8: Home section 4 ("El método") — neutral timeline, glass cards

**Files:**
- Modify: `client/src/pages/Home.tsx` (phases array lines ~109-155; section JSX lines ~425-531)

- [ ] **Step 1: Strip colors from phases**

Replace the array (lines ~109-155) with:

```typescript
/* ── Method phases data (Section 4) ───────────────────── */
const phases = [
  {
    num: '01',
    title: 'El quiebre',
    description: 'Dejás de normalizar. Nombrás lo que no va más — en tu vida, en tu barrio, en el país. No es bronca: es claridad.',
    icon: <Target className="w-5 h-5" />,
  },
  {
    num: '02',
    title: 'La construcción',
    description: 'La energía del quiebre se vuelve método: diagnóstico, datos, prioridades compartidas, decisiones coordinadas.',
    icon: <Cog className="w-5 h-5" />,
  },
  {
    num: '03',
    title: 'La prueba',
    description: 'Lo construido se mide, se exige, se corrige. La ciudadanía no pide — demuestra que hay otro camino y lo sostiene.',
    icon: <Building2 className="w-5 h-5" />,
  },
] as const;
```

- [ ] **Step 2: Section shell**

1. Section className (line ~425): `py-28 md:py-36` → `py-20 md:py-28`
2. Replace the two blobs (lines ~428-429) with one:

```tsx
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#7D5BDE]/[0.05] rounded-full blur-[150px] pointer-events-none" />
```

(Keep the neutral `via-[#0d1117]` gradient div on line ~427.)
3. Badge (line ~441): `` className={`${SECTION_BADGE} mb-6`} ``
4. H2 highlight (line ~447): tricolor gradient → `<span className={DISPLAY_GRADIENT}>`
5. Header margin (line ~439): `mb-20 md:mb-24` → `mb-16 md:mb-20`

- [ ] **Step 3: Timeline — flat neutral line, violet nodes**

Replace the connecting line inner div (line ~461):

```tsx
                  <div className="w-full h-full bg-white/10" />
```

Replace the timeline node markup (lines ~475-479):

```tsx
                      <div className="hidden md:flex justify-center mb-6">
                        <div className="relative z-20 w-7 h-7 rounded-full border-2 border-[#7D5BDE]/40 flex items-center justify-center bg-[#0a0a0a]">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#7D5BDE]" />
                        </div>
                      </div>
```

- [ ] **Step 4: Phase cards — glass token, balanced titles**

Replace the card div (lines ~482-507) with:

```tsx
                      <div className={`group relative ${GLASS_CARD} ${GLASS_CARD_HOVER} overflow-hidden`}>
                        <div className="p-7 relative">
                          {/* Ghost number */}
                          <span className="absolute -top-1 right-4 text-[5rem] font-black text-white/[0.04] leading-none select-none pointer-events-none">
                            {phase.num}
                          </span>

                          {/* Icon */}
                          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-slate-300">
                            {phase.icon}
                          </div>

                          {/* Title */}
                          <h3 className="text-[1.4rem] font-bold text-white mb-3 text-balance">
                            {phase.title}
                          </h3>

                          {/* Description */}
                          <p className="text-slate-400 text-[15px] leading-relaxed">
                            {phase.description}
                          </p>
                        </div>
                      </div>
```

- [ ] **Step 5: Closing statement quote lines use the token**

Lines ~522-523: both `<span className="block font-serif italic">` / `"block font-serif italic mt-1"` →
`` <span className={`block ${PULL_QUOTE}`}> `` and `` <span className={`block mt-1 ${PULL_QUOTE}`}> `` (the parent's `text-slate-300/90` can stay; token repeats it harmlessly).

- [ ] **Step 6: Verify + commit**

Run: `npm run check` — Expected: exit 0. (Unused lucide icon imports? `Target, Cog, Building2` are still used in `phases`. `Activity, MapPin, FileText, ScrollText` still used in `features`. No import changes.)

```bash
git add client/src/pages/Home.tsx
git commit -m "feat(design): Home sección 4 — timeline violeta sobre línea neutra, cards de vidrio"
```

---

### Task 9: Home section 5 ("Tu turno") — violet climax + floating share fix

**Files:**
- Modify: `client/src/pages/Home.tsx` (section JSX lines ~534-595; share state lines ~159-179; share JSX lines ~600-617)

- [ ] **Step 1: Violet atmosphere**

1. Section className (line ~534): `py-28 md:py-36` → `py-20 md:py-28`
2. Background gradient (line ~536): `via-[#10132a]` → `via-[#15102a]`
3. Replace the two blobs (lines ~537-538) with one:

```tsx
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#7D5BDE]/[0.07] rounded-full blur-[130px] pointer-events-none" />
```

4. Badge (line ~548): `` className={`${SECTION_BADGE} mb-8`} ``
5. Second H2 highlight (line ~556): `from-blue-400 to-purple-400` gradient → `<span className={DISPLAY_GRADIENT}>`

- [ ] **Step 2: Violet CTA + link**

Replace the final `<Button>` className (line ~575):

```tsx
                    className="relative group bg-[#7D5BDE] hover:bg-[#8D6FE4] text-white px-10 py-7 rounded-full text-lg font-semibold shadow-[0_0_40px_rgba(125,91,222,0.35)] hover:shadow-[0_0_60px_rgba(125,91,222,0.5)] transition-all duration-300 hover:-translate-y-1 overflow-hidden tracking-wide"
```

Secondary link (line ~588): `text-blue-400 hover:text-blue-300` → `text-[#9D85E8] hover:text-[#B5A3EF]`.

- [ ] **Step 3: Share button — hide near footer, violet, mobile icon-only**

Replace the scroll handler (lines ~165-167):

```typescript
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY > document.body.scrollHeight - 900;
      setShowStickyShare(window.scrollY > 600 && !nearBottom);
    };
```

(900px ≈ footer height; the share pill disappears before it can overlap "Sumarme al movimiento".)

Replace the share `<Button>` className (line ~610):

```tsx
                className="rounded-full h-12 w-12 md:w-auto md:px-5 bg-[#7D5BDE] hover:bg-[#8D6FE4] text-white shadow-2xl shadow-[#7D5BDE]/30 flex items-center justify-center gap-2.5 transition-transform duration-300 hover:scale-105"
```

(Keeps the existing `hidden md:inline` on the COMPARTIR label; on mobile it's a 48px icon disc stacked above the feedback FAB.)

- [ ] **Step 4: Verify + commit**

Run: `npm run check` — Expected: exit 0.

```bash
git add client/src/pages/Home.tsx
git commit -m "feat(design): Home sección 5 — clímax violeta, share que no pisa el footer"
```

---

### Task 10: Full verification — build + visual pass

**Files:** none (verification only)

- [ ] **Step 1: Type check + route guard + build**

Run: `npm run verify`
Expected: `check`, `check:routes` and `build` all pass (exit 0).

- [ ] **Step 2: Visual verification in preview (desktop)**

Start the dev server (preview tools, port 3001) and at 1280px-wide viewport screenshot `/` at: hero, sección 2, sección 3, sección 4, sección 5 + footer. Confirm:

1. No color accents other than violet (action), silver (identity), status dots.
2. Header is dark glass when scrolled — never white over dark.
3. One card style, one badge style, silver H2 gradients everywhere.
4. No floating-element overlap with footer CTA.

- [ ] **Step 3: Visual verification (mobile 375px)**

Resize to 375×812, screenshot hero and sections. Confirm:

1. No "DESCUBRIR" indicator overlapping CTAs (it's hidden).
2. Share is icon-only and doesn't collide with the chat FAB or content.
3. Hero first paragraph ≤ ~4 lines.

- [ ] **Step 4: Fix anything found, then final commit if files changed**

If visual issues require edits, fix, re-run `npm run check`, re-screenshot, and commit:

```bash
git add -A client/src
git commit -m "Fix visual regressions found in Home redesign verification"
```
