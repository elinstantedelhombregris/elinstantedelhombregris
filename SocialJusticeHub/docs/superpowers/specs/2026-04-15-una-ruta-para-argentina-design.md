# Una Ruta para Argentina — Design Specification

**Date:** 2026-04-15
**Status:** Draft — Pending Review
**Type:** New feature (top-level page + reusable library)
**Scope:** Cinematic scroll experience telling Argentina's transformation story through ¡BASTA! tools

---

## 1. Overview

### What This Is

"Una Ruta para Argentina" is a cinematic, documentary-style narrative experience that tells the story of how Argentina transformed itself through the ¡BASTA! framework — told retrospectively from the future as if it already happened. The reader scrolls through 5 chapters (mapped to PLANRUTA's 5 phases), experiencing the journey from 200 people with a crazy idea to a nation redesigning its own future.

Every tool on the platform — El Mapa, Mandato Vivo, Círculos, Iniciativas Estratégicas, El Arquitecto — appears in the story as something the movement built when it needed it. The tools are characters in the narrative, not product demos.

### What This Produces

Two deliverables:

1. **Cinematic Scroll Engine** — A reusable React library in its own folder (`cinematic-scroll/`), portable to other projects. Handles horizontal chapter navigation, vertical scroll within chapters, scroll-driven color interpolation, parallax, element reveals, documentary film grain, chapter transitions, and accessibility. Knows nothing about ¡BASTA! or Argentina.

2. **Una Ruta para Argentina** — The content layer that consumes the engine. A top-level page at `/una-ruta-para-argentina` with "Ruta" in the site header navigation. Contains all narrator prose, testimony quotes, tool illustrations, stats, and chapter structure in Spanish (rioplatense dialect).

### Why This Matters

Currently the platform's tools (Mapa, Mandato, Círculos, Iniciativas, Arquitecto) live as separate features in a menu. A visitor can browse them independently but never understands *why* they exist or *how* they work together. "Una Ruta para Argentina" provides the missing spine — a single continuous story that makes the entire platform legible as one coherent system.

The strategic initiatives are presented as ideas to open discussion. El Arquitecto shows how those ideas could be organized with critical paths and dependencies. This page connects those two truths through narrative: the initiatives emerged from citizen voices, and the Arquitecto emerged from the need to orchestrate them.

---

## 2. Navigation & Information Architecture

### Route

```
/una-ruta-para-argentina
```

### Header Navigation

- Label: **"Ruta"**
- Position: Top-level nav item, peer of La Visión, Hombre Gris, La Semilla, Mapa, etc.
- Insert after La Semilla and before Mapa in the navigation order (narrative foundation pages first, then tools)

### Immersion Mode

When the reader enters the page:
- Site header fades out (200ms ease-out)
- Site footer is not rendered
- A minimal back button ("← Volver") sits in the top-left corner
  - Semi-transparent (opacity 0.4)
  - Fades to nearly invisible (opacity 0.15) after 3 seconds of inactivity
  - Reappears on mouse movement, scroll pause, or touch
  - Links to `/` (home) or previous page via browser history

When the reader leaves (back button, browser back, or navigating away):
- Header fades back in
- No special exit animation

### Lazy Loading in App.tsx

```tsx
const UnaRutaParaArgentina = lazy(() => import("@/pages/UnaRutaParaArgentina"));

// Route
<Route path="/una-ruta-para-argentina" component={UnaRutaParaArgentina} />
```

---

## 3. Cinematic Scroll Engine — Reusable Library

### Location

```
SocialJusticeHub/cinematic-scroll/
```

This is a self-contained folder with no imports from the main application code. It can be copied into another project and used independently. It depends only on React 18+, Framer Motion, and CSS.

### Folder Structure

```
cinematic-scroll/
  src/
    engine/
      CinematicScroll.tsx
      CinematicChapter.tsx
      ChapterNav.tsx
      ScrollProgressProvider.tsx
      useScrollProgress.ts
      useColorInterpolation.ts
      useParallax.ts
      useReveal.ts
      useChapterNavigation.ts
      scroll-math.ts

    blocks/
      NarratorBlock.tsx
      TestimonyCard.tsx
      StatReveal.tsx
      ParallaxLayer.tsx
      SectionDivider.tsx
      FullBleedImage.tsx
      ChapterTitle.tsx
      BreathingSpace.tsx
      WordReveal.tsx

    transitions/
      ChapterTransition.tsx

    humanity/
      SilhouetteAvatar.tsx
      LocationDot.tsx

    styles/
      cinematic-scroll.css
      typography.css
      grain.css
      transitions.css
      reduced-motion.css

    types.ts
    index.ts

  README.md
  package.json
```

### 3.1 Engine Core

#### CinematicScroll.tsx

Root container component. Manages the horizontal scroll-snap layout, chapter detection, color interpolation, grain overlay, and chapter transitions.

**Props:**
```ts
interface CinematicScrollProps {
  palettes: ChapterPalette[];
  chapters: string[];                    // Chapter titles for nav
  grainIntensity?: number;               // Base grain intensity (0-1), default 0.04
  grainPerChapter?: number[];            // Override grain per chapter
  vignetteIntensity?: number;            // Base vignette (0-1), default 0.3
  vignettePerChapter?: number[];         // Override vignette per chapter
  immersive?: boolean;                   // Hide external chrome, default true
  onChapterChange?: (index: number) => void;
  onGlobalProgressChange?: (progress: number) => void;
  children: React.ReactNode;            // CinematicChapter components
}
```

**Rendering structure:**
```
<div class="cin-root" style="--cin-bg; --cin-text; --cin-accent; ...">
  <div class="cin-horizontal-container">   <!-- scroll-snap-type: x mandatory -->
    {children}                              <!-- CinematicChapter panels -->
  </div>
  <GrainOverlay intensity={currentGrain} />
  <Vignette intensity={currentVignette} />
  <ChapterTransition active={isTransitioning} chapter={targetChapter} />
  <ChapterNav chapters={chapters} activeIndex={activeChapter} palette={currentPalette} />
</div>
```

**Scroll mechanics:**
- The horizontal container uses `scroll-snap-type: x mandatory` and `overflow-x: auto`
- Each child `CinematicChapter` is `scroll-snap-align: start` at `100vw` width
- An `IntersectionObserver` (threshold: 0.5) on each chapter determines the active chapter index
- When the active chapter changes, `onChapterChange` fires and the `ChapterTransition` overlay activates
- Color interpolation runs on every scroll event via `useColorInterpolation`, updating CSS custom properties on the root element

**CSS custom properties set on root:**
```css
--cin-bg
--cin-bg-rgb            /* For rgba() usage */
--cin-text
--cin-text-muted
--cin-accent
--cin-accent-rgb
--cin-border
--cin-card-bg
--cin-testimony-accent
--cin-stat-color
--cin-grain-opacity
--cin-vignette-opacity
```

#### CinematicChapter.tsx

Individual chapter panel. A full-viewport container with its own vertical scroll context.

**Props:**
```ts
interface CinematicChapterProps {
  index: number;
  children: React.ReactNode;
}
```

**Rendering structure:**
```
<section
  class="cin-chapter"
  aria-label="Chapter {index + 1}: {title}"
  style="width: 100vw; height: 100vh; overflow-y: auto; scroll-snap-align: start;"
>
  <div class="cin-chapter-content">
    {children}
  </div>
</section>
```

**Scroll tracking:**
- An `onScroll` handler on the section normalizes scroll position to 0-1 (`chapterProgress`)
- This value is provided to children via `ScrollProgressProvider` context
- Combined with chapter index, computes `globalProgress` = `(chapterIndex + chapterProgress) / totalChapters`

#### ChapterNav.tsx

Floating chapter indicator with clickable dots.

**Desktop (1024px+):**
- Fixed to right edge, vertically centered
- 5 circles (8px diameter), spaced 24px apart vertically
- Active chapter: circle fills with `--cin-accent`, scales to 10px
- Hover: tooltip appears to the left showing chapter title
- Click: `scrollTo({ left: chapterIndex * viewportWidth, behavior: 'smooth' })`
- Dots subtly shift color as the palette interpolates

**Mobile (< 1024px):**
- Fixed to bottom, horizontally centered, 16px from bottom edge
- Same 5 dots, horizontal layout, 20px spacing
- Active dot larger and colored
- First visit: subtle "swipe" affordance indicator (animated hand icon, disappears after 3 seconds or first interaction)

**Accessibility:**
- Container: `role="tablist"`, `aria-label="Chapter navigation"`
- Each dot: `role="tab"`, `aria-label="Chapter N: Title"`, `aria-selected`
- Focus visible ring in `--cin-accent` color

#### ScrollProgressProvider.tsx

React context that provides scroll state to all descendant components.

**Context value:**
```ts
interface ScrollProgressContext {
  chapterIndex: number;         // 0-4
  chapterProgress: number;      // 0-1 within current chapter
  globalProgress: number;       // 0-1 across all chapters
  totalChapters: number;
  currentPalette: ChapterPalette;
  isReducedMotion: boolean;     // prefers-reduced-motion
}
```

#### useScrollProgress.ts

Consumer hook for the context:
```ts
function useScrollProgress(): ScrollProgressContext
```

Used by blocks to adapt their behavior based on scroll position.

#### useColorInterpolation.ts

Takes palette array and global progress, returns interpolated palette.

```ts
function useColorInterpolation(
  palettes: ChapterPalette[],
  globalProgress: number
): InterpolatedPalette
```

**Interpolation logic:**
- Converts all hex colors to HSL
- Computes which two palettes we're between based on `globalProgress`
- Lerps each HSL channel independently
- Converts back to hex for CSS custom properties
- HSL interpolation avoids muddy intermediate colors that RGB lerp produces
- Uses the `hue` shortest-path algorithm to avoid going through unexpected hues

#### useParallax.ts

Returns a `translateY` value for parallax layers.

```ts
function useParallax(speed: number): { y: MotionValue<number> }
```

- `speed` is a multiplier: 0 = static, 1 = moves with scroll, 0.5 = moves at half speed
- Uses Framer Motion `useScroll` + `useTransform` for GPU-composited transforms
- Returns a `MotionValue` for direct use in `motion.div` style
- Returns `{ y: 0 }` (static) when `prefers-reduced-motion: reduce`

#### useReveal.ts

IntersectionObserver-based visibility trigger.

```ts
function useReveal(options?: {
  threshold?: number;          // Default 0.2
  rootMargin?: string;         // Default "0px 0px -50px 0px"
  once?: boolean;              // Default true (reveal once, stay visible)
}): {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  progress: number;            // 0-1 intersection ratio
}
```

- Used by `NarratorBlock`, `TestimonyCard`, `StatReveal` for entrance animations
- `once: true` means once the element is visible, it stays visible (no re-hiding on scroll-up)
- When `prefers-reduced-motion: reduce`, `isVisible` is always `true` (content immediately visible)

#### useChapterNavigation.ts

Keyboard and programmatic chapter navigation.

```ts
function useChapterNavigation(
  containerRef: React.RefObject<HTMLElement>,
  totalChapters: number
): {
  goToChapter: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
}
```

- Listens for `ArrowLeft` / `ArrowRight` keydown events on the container
- `goToChapter` uses `scrollTo({ left: index * viewportWidth, behavior: 'smooth' })`
- Wraps at boundaries (Chapter 5 ArrowRight does nothing, Chapter 1 ArrowLeft does nothing)

#### scroll-math.ts

Pure utility functions. No React, no DOM. Fully testable.

```ts
// Linear interpolation
function lerp(a: number, b: number, t: number): number

// Clamp value to range
function clamp(value: number, min: number, max: number): number

// Ease-in-out curve
function easeInOutCubic(t: number): number

// HSL color interpolation (shortest hue path)
function lerpHSL(colorA: HSL, colorB: HSL, t: number): HSL

// Hex to HSL conversion
function hexToHSL(hex: string): HSL

// HSL to Hex conversion
function hslToHex(hsl: HSL): string

// Given globalProgress and number of palettes, return the two
// palette indices and the local interpolation factor
function getPaletteIndices(
  globalProgress: number,
  paletteCount: number
): { fromIndex: number; toIndex: number; t: number }
```

### 3.2 Blocks

#### NarratorBlock.tsx

Full-width text block for the documentary narrator voice.

**Props:**
```ts
interface NarratorBlockProps {
  children: React.ReactNode;
  emphasis?: 'normal' | 'strong';
}
```

**Visual treatment:**
- Text centered, `max-width: 680px` (`strong`: `max-width: 720px`)
- Font: Playfair Display
  - `normal`: 22px / 36px line-height / 400 weight
  - `strong`: 28px / 40px / 500 weight
- Color: `var(--cin-text)`
- Vertical padding: 80px top/bottom (`strong`: 120px)
- No background, no border — just text breathing in space

**Scroll reveal:**
- Uses `useReveal` hook
- Fades up: `opacity: 0 → 1`, `translateY: 20px → 0`, duration 600ms, `ease-out`
- Reduced motion: immediate visibility, no animation

#### TestimonyCard.tsx

First-person quote with attribution and human details.

**Props:**
```ts
interface TestimonyCardProps {
  quote: string;
  name: string;
  age: number;
  role: string;
  location: string;                      // City, Province
  locationCoords?: [number, number];     // For LocationDot on Argentina outline
  year: number;
}
```

**Visual treatment:**
- Max-width: 560px
- Positioned with slight left offset from center (left: calc(50% - 320px)) — asymmetric, cinematic
- Left border: 3px solid `var(--cin-testimony-accent)`
- Background: `var(--cin-card-bg)` at 3% opacity, `backdrop-filter: blur(8px)`
- Padding: 24px left (past the border), 20px top/bottom/right
- Border-radius: 2px (almost sharp — documentary, not bubbly)
- Quote: Inter, 20px / 32px, 400 weight, italic, color `var(--cin-text)`
- Attribution: below the quote
  - Name: Inter, 14px, 600 weight, uppercase, 0.05em tracking, color `var(--cin-testimony-accent)`
  - Detail (age + role + location): Inter, 12px, 400 weight, small-caps, 0.03em tracking, color `var(--cin-text-muted)`
- Year badge: absolute positioned top-right of card, small pill, `var(--cin-text-muted)` at 40% opacity, 11px mono
- `SilhouetteAvatar` component: positioned to the left of the quote or integrated into the left border area
- `LocationDot` component: tiny Argentina outline (48px tall) showing a dot for this person's location, positioned near the attribution

**Scroll reveal:**
- Slides in from left: `translateX: -40px → 0`, `opacity: 0 → 1`, duration 500ms, `ease-out`
- Reduced motion: immediate visibility

**Mobile (< 768px):**
- Full width, no left offset
- Left border remains
- LocationDot hidden (too small to be useful)

#### StatReveal.tsx

Animated counter that counts up on scroll visibility.

**Props:**
```ts
interface StatRevealProps {
  value: number;
  label: string;
  prefix?: string;              // e.g., "USD"
  suffix?: string;              // e.g., "%", "familias"
  duration?: number;            // Count-up duration in ms, default 800
}
```

**Visual treatment:**
- Centered in viewport
- Number: JetBrains Mono, 56px / 64px, 700 weight, -0.03em tracking, color `var(--cin-stat-color)`
- Prefix/suffix: same font but 32px, 400 weight, color `var(--cin-text-muted)`
- Label: Inter, 14px, 500 weight, uppercase, 0.08em tracking, color `var(--cin-text-muted)`
- Layout: prefix + number + suffix on one line, label below

**Animation:**
- Uses `useReveal` hook
- Number counts up from 0 to `value` over `duration` ms, `ease-out` curve
- Simultaneously scales from 0.95 → 1.0
- Numbers with decimals: maintain decimal precision during count
- Reduced motion: shows final value immediately, no count animation

**Multiple stats in a row:**
- Wrap in a flex container (consumer's responsibility) — typically 2-3 stats side by side
- Each stat triggers independently on scroll visibility

#### ParallaxLayer.tsx

Background decorative layer that moves at a different scroll speed.

**Props:**
```ts
interface ParallaxLayerProps {
  speed: number;                // 0-1, how fast relative to scroll
  className?: string;
  children?: React.ReactNode;
  opacity?: number;             // Default 0.03
}
```

**Visual treatment:**
- Positioned absolute, behind content (`z-index: -1`)
- Contains abstract shapes: circles, soft gradients in `var(--cin-accent)` at very low opacity (2-5%)
- `transform: translateY(...)` driven by `useParallax` hook
- `will-change: transform` for GPU compositing
- `pointer-events: none`
- Reduced motion: static position, no transform

#### SectionDivider.tsx

Visual break between sections within a chapter.

**Props:**
```ts
interface SectionDividerProps {
  variant: 'time-jump' | 'location-shift' | 'dramatic-pause';
  label?: string;
}
```

**Visual treatment by variant:**

`time-jump`:
- Centered label (e.g., "Seis meses después")
- Inter, 13px, 400 weight, italic, color `var(--cin-text-muted)` at 50% opacity
- Thin horizontal lines (1px, `var(--cin-border)`) extending from label to edges, max 200px each side
- Vertical padding: 60px top/bottom
- Fade-in reveal on scroll

`location-shift`:
- Same as time-jump but with a subtle location pin SVG icon (12px) before the label
- Label like "Buenos Aires" or "Mendoza"

`dramatic-pause`:
- No visible element
- Vertical padding: 160px — just breathing room
- The emptiness IS the design

#### FullBleedImage.tsx

Full-viewport image with parallax and grain overlay. For future use — not required for MVP since tool illustrations are SVG-based.

**Props:**
```ts
interface FullBleedImageProps {
  src: string;
  alt: string;
  parallaxSpeed?: number;
  grainOverlay?: boolean;
}
```

#### ChapterTitle.tsx

Cinematic chapter opening — full viewport height, just the title.

**Props:**
```ts
interface ChapterTitleProps {
  number: number;
  title: string;
  subtitle: string;              // Time period: "2026 — 2028"
  epigraph?: string;             // Opening quote
}
```

**Visual treatment:**
- Full viewport height (`100vh`), centered content
- Chapter number: Inter, 13px, 500 weight, uppercase, 0.12em tracking, color `var(--cin-text-muted)` at 40% opacity
  - Format: "CAPÍTULO UNO" (spelled out, not "1")
- Title: Playfair Display, 72px / 80px, 700 weight, -0.02em tracking, color `var(--cin-text)`
  - 16px below number
- Subtitle: Inter, 16px, 400 weight, 0.06em tracking, color `var(--cin-text-muted)` at 60% opacity
  - 12px below title
- Epigraph: Playfair Display, 18px / 28px, 400 weight, italic, color `var(--cin-text)` at 50% opacity
  - 48px below subtitle
  - Max-width: 480px, centered
  - Enclosed in em-dashes or quotation marks
- Scroll indicator: subtle animated chevron (↓) at bottom of viewport
  - `var(--cin-text-muted)` at 20% opacity
  - Animated: gentle 8px vertical bounce, 2s period, ease-in-out
  - Fades out after first scroll
- Content fades in on chapter entry: opacity 0 → 1 over 800ms

**Responsive:**
- Mobile: title drops to 44px, subtitle to 14px, epigraph to 16px
- Fluid type via `clamp()`: e.g., `clamp(44px, 8vw, 72px)`

#### BreathingSpace.tsx

Intentional emptiness. Negative space as a design element.

**Props:**
```ts
interface BreathingSpaceProps {
  height: 'half' | 'full';      // 50vh or 100vh
  content?: string;              // Optional single word or short phrase
}
```

**Visual treatment:**
- `height: 'half'`: 50vh of empty space
- `height: 'full'`: 100vh of empty space
- If `content` is provided:
  - Centered vertically and horizontally in the space
  - Playfair Display, 18px, 400 weight, italic, color `var(--cin-text-muted)` at 30% opacity
  - Fades in on scroll (reveal hook)
- If no `content`: pure emptiness — grain and vignette are the only texture

#### WordReveal.tsx

Word-by-word text reveal for pivotal narrator moments.

**Props:**
```ts
interface WordRevealProps {
  children: string;
  delayPerWord?: number;         // ms between each word, default 30
  startDelay?: number;           // ms before first word, default 200
}
```

**Visual treatment:**
- Same typography as `NarratorBlock` with `emphasis: 'strong'`
- Each word starts at `opacity: 0` and `translateY: 4px`
- Words reveal sequentially with `delayPerWord` between each
- Each word's transition: 300ms, ease-out
- Result: text appears as if being spoken, landing one word at a time
- Used sparingly: maximum 2-3 instances per chapter, only for the most important lines

**Implementation:**
- Split `children` string by whitespace
- Wrap each word in a `motion.span`
- Use `useReveal` to trigger the sequence when the block enters viewport
- `variants` with `staggerChildren: delayPerWord / 1000`
- Reduced motion: all words visible immediately

### 3.3 Transitions

#### ChapterTransition.tsx

Film-cut overlay that plays when the reader moves between chapters.

**Props:**
```ts
interface ChapterTransitionProps {
  active: boolean;               // Whether transition is currently playing
  chapterNumber: number;         // Target chapter (1-indexed)
  chapterTitle: string;
  palette: ChapterPalette;       // Target chapter's palette
}
```

**Visual treatment:**
- Fixed position overlay covering the entire viewport
- Duration: 400ms total

**Sequence (frame-by-frame):**
1. **0-100ms:** Grain intensifies (grain opacity jumps to 0.15), vignette darkens to near-black
2. **100-250ms:** Screen is near-black. Chapter number appears centered:
   - "CAPÍTULO" + number in words (e.g., "CAPÍTULO TRES")
   - Inter, 14px, uppercase, 0.15em tracking
   - Color: target chapter's accent, opacity pulses from 0 → 0.8
3. **250-400ms:** Overlay fades out, revealing new chapter title screen beneath

**Implementation:**
- Framer Motion `AnimatePresence` with `motion.div`
- `pointer-events: none` during transition
- Triggered by `IntersectionObserver` detecting chapter boundary crossing

**Reduced motion:**
- Instant chapter switch, no overlay animation
- Screen reader: `aria-live="polite"` region announces "Capítulo N: Title"

### 3.4 Humanity Components

#### SilhouetteAvatar.tsx

Minimal artistic silhouette representing a testimony speaker.

**Props:**
```ts
interface SilhouetteAvatarProps {
  variant: number;               // 1-12 predefined silhouette variants
  size?: number;                 // Default 40px
}
```

**Visual treatment:**
- Simple SVG silhouette — head and shoulders only
- 12 variants with different hair styles, head shapes to suggest diversity without being photographic
- Monochrome: fill is `var(--cin-testimony-accent)` at 30% opacity
- No facial features — abstract enough to be universal
- Positioned within the `TestimonyCard`, to the left of the attribution line

#### LocationDot.tsx

Tiny Argentina outline with a dot showing where a testimony speaker is from.

**Props:**
```ts
interface LocationDotProps {
  coords: [number, number];      // [latitude, longitude] or simplified [x, y] percentage
  size?: number;                 // Default 48px height
}
```

**Visual treatment:**
- Simplified SVG outline of Argentina (no internal province borders — just the country shape)
- Stroke: `var(--cin-text-muted)` at 20% opacity, 0.5px
- Fill: none (transparent)
- Dot: 4px circle at `coords` position, fill `var(--cin-testimony-accent)`, with subtle pulse animation (scale 1 → 1.3 → 1, 2s loop)
- Positioned near the attribution in `TestimonyCard`
- Hidden on mobile (< 768px)

### 3.5 Styles

#### cinematic-scroll.css

Core layout and structural styles.

```css
/* Root container */
.cin-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--cin-bg);
  color: var(--cin-text);
  font-family: 'Inter', sans-serif;
}

/* Horizontal chapter container */
.cin-horizontal-container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;           /* Hide scrollbar */
}
.cin-horizontal-container::-webkit-scrollbar { display: none; }

/* Individual chapter */
.cin-chapter {
  flex: 0 0 100vw;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-snap-align: start;
  scrollbar-width: thin;
  scrollbar-color: var(--cin-accent) transparent;
}

/* Chapter content wrapper */
.cin-chapter-content {
  min-height: 100vh;
  padding-bottom: 20vh;           /* Breathing room at bottom */
}
```

#### typography.css

Cinematic typography scale and vertical rhythm.

```css
/* Narrator voice — Playfair Display */
.cin-narrator {
  font-family: 'Playfair Display', serif;
  font-size: clamp(18px, 2.2vw, 22px);
  line-height: 1.636;
  font-weight: 400;
  color: var(--cin-text);
  max-width: 680px;
  margin: 0 auto;
  padding: 80px 24px;
}
.cin-narrator--strong {
  font-size: clamp(22px, 2.8vw, 28px);
  line-height: 1.429;
  font-weight: 500;
  max-width: 720px;
  padding: 120px 24px;
}

/* Testimony voice — Inter */
.cin-testimony-quote {
  font-family: 'Inter', sans-serif;
  font-size: clamp(16px, 2vw, 20px);
  line-height: 1.6;
  font-weight: 400;
  font-style: italic;
  color: var(--cin-text);
}
.cin-testimony-name {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.429;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--cin-testimony-accent);
}
.cin-testimony-detail {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 400;
  font-variant: small-caps;
  letter-spacing: 0.03em;
  color: var(--cin-text-muted);
}

/* Stats — JetBrains Mono */
.cin-stat-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(36px, 5.6vw, 56px);
  line-height: 1.143;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--cin-stat-color);
}
.cin-stat-affix {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(24px, 3.2vw, 32px);
  font-weight: 400;
  color: var(--cin-text-muted);
}
.cin-stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--cin-text-muted);
}

/* Chapter titles */
.cin-chapter-number {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--cin-text-muted);
  opacity: 0.4;
}
.cin-chapter-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(44px, 8vw, 72px);
  line-height: 1.111;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cin-text);
}
.cin-chapter-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(14px, 1.6vw, 16px);
  font-weight: 400;
  letter-spacing: 0.06em;
  color: var(--cin-text-muted);
  opacity: 0.6;
}
.cin-chapter-epigraph {
  font-family: 'Playfair Display', serif;
  font-size: clamp(16px, 1.8vw, 18px);
  line-height: 1.556;
  font-weight: 400;
  font-style: italic;
  color: var(--cin-text);
  opacity: 0.5;
  max-width: 480px;
  margin: 0 auto;
}
```

#### grain.css

Film grain animation — CSS-only, no canvas, no JS frame loop.

```css
.cin-grain {
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  pointer-events: none;
  z-index: 1000;
  mix-blend-mode: overlay;
  opacity: var(--cin-grain-opacity, 0.04);
}

.cin-grain::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  animation: cin-grain-shift 0.5s steps(8) infinite;
}

@keyframes cin-grain-shift {
  0%, 100% { transform: translate(0, 0); }
  12.5% { transform: translate(-5%, -10%); }
  25% { transform: translate(10%, 5%); }
  37.5% { transform: translate(-2%, 15%); }
  50% { transform: translate(15%, -5%); }
  62.5% { transform: translate(-10%, 10%); }
  75% { transform: translate(5%, -15%); }
  87.5% { transform: translate(-15%, 2%); }
}

/* Vignette */
.cin-vignette {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, var(--cin-vignette-opacity, 0.3)) 100%
  );
}
```

#### transitions.css

Chapter transition overlay styles.

```css
.cin-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.cin-transition-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--cin-accent);
  text-align: center;
}
```

#### reduced-motion.css

Accessibility overrides for `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations */
  .cin-grain::after { animation: none; }
  .cin-chapter { scroll-behavior: auto; }

  /* Parallax layers become static */
  [data-parallax] { transform: none !important; }

  /* Reveals are immediate */
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
  }

  /* Scroll indicator doesn't bounce */
  .cin-scroll-indicator { animation: none; }

  /* Chapter transitions are instant */
  .cin-transition-overlay { transition: none; }

  /* Stats show final value */
  [data-stat-animated] { transition: none; }

  /* Word reveal shows all words */
  [data-word-reveal] span {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

### 3.6 Types

```ts
// types.ts — Complete type definitions for the cinematic scroll engine

export interface ChapterPalette {
  bg: string;                    // Background hex
  text: string;                  // Primary text hex
  textMuted: string;             // Secondary text hex
  accent: string;                // Accent/highlight hex
  border: string;                // Border/divider hex
  cardBg: string;                // Card background hex
  testimonialAccent: string;     // Testimony attribution/border hex
  statColor: string;             // Stat number hex
  grain: number;                 // Grain opacity 0-1
  vignette: number;              // Vignette opacity 0-1
}

export interface HSL {
  h: number;                     // 0-360
  s: number;                     // 0-100
  l: number;                     // 0-100
}

export interface InterpolatedPalette extends ChapterPalette {
  bgRgb: string;                 // "r, g, b" for use in rgba()
  accentRgb: string;
}

export interface ScrollState {
  chapterIndex: number;
  chapterProgress: number;
  globalProgress: number;
  totalChapters: number;
  currentPalette: InterpolatedPalette;
  isReducedMotion: boolean;
}

export interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export interface RevealState {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  progress: number;
}
```

### 3.7 Public API (index.ts)

```ts
// Engine
export { CinematicScroll } from './engine/CinematicScroll';
export { CinematicChapter } from './engine/CinematicChapter';
export { ChapterNav } from './engine/ChapterNav';
export { ScrollProgressProvider } from './engine/ScrollProgressProvider';
export { useScrollProgress } from './engine/useScrollProgress';
export { useColorInterpolation } from './engine/useColorInterpolation';
export { useParallax } from './engine/useParallax';
export { useReveal } from './engine/useReveal';
export { useChapterNavigation } from './engine/useChapterNavigation';

// Blocks
export { NarratorBlock } from './blocks/NarratorBlock';
export { TestimonyCard } from './blocks/TestimonyCard';
export { StatReveal } from './blocks/StatReveal';
export { ParallaxLayer } from './blocks/ParallaxLayer';
export { SectionDivider } from './blocks/SectionDivider';
export { FullBleedImage } from './blocks/FullBleedImage';
export { ChapterTitle } from './blocks/ChapterTitle';
export { BreathingSpace } from './blocks/BreathingSpace';
export { WordReveal } from './blocks/WordReveal';

// Transitions
export { ChapterTransition } from './transitions/ChapterTransition';

// Humanity
export { SilhouetteAvatar } from './humanity/SilhouetteAvatar';
export { LocationDot } from './humanity/LocationDot';

// Types
export type {
  ChapterPalette,
  InterpolatedPalette,
  ScrollState,
  RevealOptions,
  RevealState,
  HSL
} from './types';
```

---

## 4. Content Layer — Una Ruta para Argentina

### 4.1 File Structure

```
SocialJusticeHub/
  client/src/
    pages/
      UnaRutaParaArgentina.tsx
    components/
      ruta/
        RutaChapterOne.tsx
        RutaChapterTwo.tsx
        RutaChapterThree.tsx
        RutaChapterFour.tsx
        RutaChapterFive.tsx
        RutaToolIllustration.tsx
        illustrations/
          SeedSpreading.tsx
          BastardaScale.tsx
          PlatformNetwork.tsx
          SignalRising.tsx
          MapSignals.tsx
          CirclesForming.tsx
          ConstellationGlow.tsx
          InitiativesFanning.tsx
          DataFlowing.tsx
          LearningPath.tsx
          ArchitectOrganism.tsx
          BudgetTreemap.tsx
          CriticalTimeline.tsx
          ThreatRadar.tsx
          CommandGrid.tsx
          DominosCascading.tsx
          HealthRing.tsx
  shared/
    ruta-argentina-content.ts
```

### 4.2 Content Data File

`shared/ruta-argentina-content.ts` contains all narrative content. Structured as a typed array of chapters, each containing an ordered array of blocks.

```ts
export interface RutaNarratorBlock {
  type: 'narrator';
  text: string;
  emphasis?: 'normal' | 'strong';
}

export interface RutaWordRevealBlock {
  type: 'wordReveal';
  text: string;
}

export interface RutaTestimony {
  type: 'testimony';
  quote: string;
  name: string;
  age: number;
  role: string;
  location: string;
  locationCoords: [number, number];
  year: number;
  silhouetteVariant: number;
}

export interface RutaStat {
  type: 'stat';
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export interface RutaStatGroup {
  type: 'statGroup';
  stats: RutaStat[];
}

export interface RutaToolMoment {
  type: 'tool';
  toolName: string;
  narrativeDescription: string;
  illustrationType: 'seed-spreading' | 'bastarda-scale' | 'platform-network' |
    'signal-rising' | 'map-signals' | 'circles-forming' | 'constellation-glow' |
    'initiatives-fanning' | 'data-flowing' | 'learning-path' |
    'architect-organism' | 'budget-treemap' | 'critical-timeline' |
    'threat-radar' | 'command-grid' | 'dominos-cascading' | 'health-ring';
  dynamicData?: boolean;          // If true, illustration pulls live data from
                                  // shared/strategic-initiatives.ts or
                                  // shared/arquitecto-data.ts
}

export interface RutaSectionBreak {
  type: 'break';
  variant: 'time-jump' | 'location-shift' | 'dramatic-pause';
  label?: string;
}

export interface RutaBreathingSpace {
  type: 'breath';
  height: 'half' | 'full';
  content?: string;
}

export type RutaBlock =
  | RutaNarratorBlock
  | RutaWordRevealBlock
  | RutaTestimony
  | RutaStat
  | RutaStatGroup
  | RutaToolMoment
  | RutaSectionBreak
  | RutaBreathingSpace;

export interface RutaChapter {
  number: number;
  title: string;
  titleSpelled: string;           // "UNO", "DOS", "TRES", "CUATRO", "CINCO"
  subtitle: string;
  epigraph: string;
  blocks: RutaBlock[];
  contentVersion: string;
  lastReviewedWithData: string;
}

export const RUTA_ARGENTINA_CHAPTERS: RutaChapter[] = [ /* ... */ ];
```

### 4.3 Color Palettes

The five chapter palettes, with full detail:

```ts
export const RUTA_PALETTES: ChapterPalette[] = [
  // Chapter 1: Silver Ash — archival, intimate, uncertain
  {
    bg: '#0a0a0a',
    text: '#8a8a8a',
    textMuted: '#555555',
    accent: '#6a6a6a',
    border: '#1a1a1a',
    cardBg: '#ffffff',
    testimonialAccent: '#777777',
    statColor: '#999999',
    grain: 0.06,
    vignette: 0.4,
  },
  // Chapter 2: Warm Earth — documentary field footage, hopeful
  {
    bg: '#0e0c09',
    text: '#a08060',
    textMuted: '#6b5540',
    accent: '#886644',
    border: '#1e1a14',
    cardBg: '#d4c5a0',
    testimonialAccent: '#997755',
    statColor: '#bb9966',
    grain: 0.04,
    vignette: 0.35,
  },
  // Chapter 3: Deep Water — expansive, confident, clear
  {
    bg: '#080c10',
    text: '#6699bb',
    textMuted: '#3d5f7a',
    accent: '#4488aa',
    border: '#121e28',
    cardBg: '#88bbdd',
    testimonialAccent: '#5599bb',
    statColor: '#77aacc',
    grain: 0.035,
    vignette: 0.3,
  },
  // Chapter 4: Living Green — strategic, sharp, powerful
  {
    bg: '#080e0b',
    text: '#66cc88',
    textMuted: '#3d7a55',
    accent: '#44aa66',
    border: '#122e1a',
    cardBg: '#88ddaa',
    testimonialAccent: '#55bb77',
    statColor: '#77cc99',
    grain: 0.025,
    vignette: 0.25,
  },
  // Chapter 5: Iris Bloom — triumphant, vivid, fully alive
  {
    bg: '#0c0a10',
    text: '#bb88ee',
    textMuted: '#7a55aa',
    accent: '#7D5BDE',
    border: '#1e1428',
    cardBg: '#bb88ee',
    testimonialAccent: '#9966cc',
    statColor: '#cc99ff',
    grain: 0.015,
    vignette: 0.15,
  },
];
```

### 4.4 Dynamic Data Integration

Tool illustrations that show live data pull from existing shared files:

| Illustration | Data Source | What's Dynamic |
|---|---|---|
| `InitiativesFanning` | `STRATEGIC_INITIATIVES` from `shared/strategic-initiatives.ts` | Number of cards, plan names, categories |
| `ArchitectOrganism` | `PLAN_NODES` from `shared/arquitecto-data.ts` | Number of nodes, node names, organ metaphors |
| `BudgetTreemap` | `PLAN_NODES` from `shared/arquitecto-data.ts` | Budget ranges, plan sizes |
| `CriticalTimeline` | `TIMELINE_PHASES` + `CRITICAL_CHAINS` from `shared/arquitecto-data.ts` | Number of phases, chain names, timeline spans |
| `ThreatRadar` | `ADVERSARIES` data from `AdversarialSimulator` component data | Adversary names, threat levels |
| `CommandGrid` | `PLAN_NODES` from `shared/arquitecto-data.ts` | Number of plans, plan IDs |
| `HealthRing` | `ECOSYSTEM_METRICS` from `shared/arquitecto-data.ts` | Aggregate totals |

Non-dynamic illustrations use hardcoded narrative data that matches the story being told:
- `SeedSpreading`, `BastardaScale`, `PlatformNetwork`, `SignalRising`, `MapSignals`, `CirclesForming`, `ConstellationGlow`, `DataFlowing`, `LearningPath`, `DominosCascading`

### 4.5 Chapter Content Outline

#### Chapter 1: La Semilla (2026–2028)

**Epigraph:** *"Todo empieza con alguien que hace las cuentas."*

**Block sequence:**
1. `breath` (full) — emptiness before the story begins
2. `narrator` — Argentina's cyclical crisis pattern. 6 crises in 135 years. The exhaustion.
3. `narrator` (strong) — "But this time was different. This time someone did the math."
4. `break` (dramatic-pause)
5. `testimony` — Lucía, 28, teacher, Resistencia. "I was paying $47,000 a month for car insurance. I read that document and did the math on extraction."
6. `narrator` — The calculation spreads. The realization that Argentines are paying 35% margins on everything. $44-65K/month extracted per family across all services.
7. `tool` (seed-spreading) — La Visión. The manifesto spreads. Key phrases radiate outward like seeds in wind.
8. `stat` — 200 → first meetings
9. `narrator` — "The idea was insane. A cooperative insurance company, built by citizens, at cost. Against the market."
10. `break` (time-jump) — "Seis meses después"
11. `tool` (bastarda-scale) — The first Bastarda. Market price vs Bastarda price. The 30% gap visible.
12. `statGroup` — 25,000 founders / USD 10-22M crowdfunded / 30% savings
13. `testimony` — The actuary, 45, Buenos Aires. "When 25,000 people invest without knowing if they'll see the money again, that's not commerce. That's a political act."
14. `narrator` — The platform. Not just insurance — coordination infrastructure. The digital backbone of a movement.
15. `tool` (platform-network) — The platform architecture. Not a screenshot — an abstraction of connection nodes.
16. `wordReveal` — "Cada fase crea únicamente lo que la siguiente necesita. Nada más."
17. `breath` (half) — space before the transition

#### Chapter 2: La Prueba (2028–2032)

**Epigraph:** *"Gobernar no es mandar. Gobernar es escuchar."*

**Block sequence:**
1. `narrator` — The movement decides to test the model. One municipality. The question: can people who've never governed actually govern?
2. `break` (location-shift) — A city name (the first municipality)
3. `narrator` — "The first thing they did was listen."
4. `tool` (signal-rising) — Mandato Vivo. Three pulse types rise like a heartbeat: dreams, needs, ¡BASTA! declarations.
5. `stat` — 10,000 voices in the first month
6. `testimony` — A neighbor, 62, who mapped the contaminated water. "Thirty years living here and no one had ever asked us what we needed. Not a survey. An actual question."
7. `tool` (map-signals) — El Mapa. Dots appearing on the territory. Clustering around problems. Water. Security. Schools.
8. `narrator` — "The signals needed organization. Not top-down — organic."
9. `tool` (circles-forming) — Círculos. Small clusters connecting into larger networks, territory by territory.
10. `break` (time-jump) — "Un año después"
11. `narrator` — Something unexpected: the personal and the civic started to mirror each other.
12. `tool` (constellation-glow) — Life Areas + Coaching. The constellation of 12 orbs. Personal transformation parallels civic transformation.
13. `testimony` — The first elected intendente, 39. "I didn't campaign. The assembly nominated me. I governed by listening to the Mandato every morning."
14. `narrator` (strong) — "They proved it works. One city."
15. `wordReveal` — "Ahora la pregunta era: ¿puede escalar?"
16. `breath` (half)

#### Chapter 3: La Circunscripción (2032–2036)

**Epigraph:** *"No fue un partido. Fue una forma de vivir que se expandió."*

**Block sequence:**
1. `narrator` — From one municipality to a province. The network effect. But provincial politics has bigger predators.
2. `narrator` — "They needed to articulate what they wanted. Not slogans — systems."
3. `break` (dramatic-pause)
4. `tool` (initiatives-fanning) — Iniciativas Estratégicas. Cards fanning out one by one. Each one a citizen-designed proposal using Idealized Design. Dynamic: pulls count and names from `STRATEGIC_INITIATIVES`.
5. `narrator` — "These weren't decrees. They were invitations. 'Here's how we see the problem. Here's what ideal looks like. What do you think?'"
6. `testimony` — A student, 22, Córdoba. "I helped design PLANEDU with 200 other people. A 22-year-old helping redesign national education. In what other system does that happen?"
7. `tool` (data-flowing) — Datos Abiertos. Abstract data particles flowing from opaque to transparent. Everything visible.
8. `stat` — 100% transparency on budgets and decisions
9. `tool` (learning-path) — Guías de Estudio. A winding learning path with milestone markers. Courses on systems thinking, civic culture.
10. `testimony` — A farmer, 55, Mendoza. "My cooperative joined the network. For the first time, I understood that my soil and their schools were the same fight."
11. `break` (time-jump) — "Dos años después"
12. `statGroup` — 300K-500K members / 200+ trained cadres / Provincial budget under citizen management
13. `narrator` (strong) — "They had the ideas. They had the territory. Now they needed to see how it all fit together."
14. `breath` (full)

#### Chapter 4: La Cabecera de Puente (2036–2038)

**Epigraph:** *"Dieciséis planes. Un organismo vivo."*

**Block sequence:**
1. `narrator` — National Congress. Seats won. The movement enters the institution it was designed to transform.
2. `narrator` — "16 plans. Hundreds of dependencies. USD 283-526 billion. A 20-year horizon. Who orchestrates this?"
3. `break` (dramatic-pause)
4. `tool` (architect-organism) — El Arquitecto. 16 nodes lighting up as organs of a living body. Dynamic: pulls plan count and names from `PLAN_NODES`. The organism breathes.
5. `narrator` — "For the first time, the nation saw its own redesign as one interconnected system."
6. `testimony` — An economist, 48, Buenos Aires. "When we projected the Presupuesto and it showed USD 283 billion over 20 years — about 3% of GDP — the room went silent. Not because it was too much. Because it was feasible."
7. `tool` (budget-treemap) — Presupuesto. Simplified treemap with plan sizes. Dynamic: pulls budget data from `PLAN_NODES`.
8. `tool` (critical-timeline) — Ruta Crítica. Three critical chains highlighted. Dynamic: pulls from `CRITICAL_CHAINS`.
9. `narrator` — "But they weren't naive. They knew who would resist."
10. `tool` (threat-radar) — Adversarial Simulator. Radar chart with adversary vectors. Banks, narcos, foreign tech — mapped and prepared for.
11. `testimony` — An activist, 34, Rosario. "I ran the adversarial simulation 200 times. We found every weakness. Then we fixed them."
12. `statGroup` — 1M+ members / Seats in Congress / 3-5 foundational laws introduced
13. `wordReveal` — "El mapa, las herramientas, la gente y el plan. Todo estaba listo."
14. `narrator` — "Then the crisis came."
15. `breath` (full) — the longest pause in the entire experience

#### Chapter 5: La Ejecución (2038–2040+)

**Epigraph:** *"La crisis llegó. Pero esta vez, el pueblo tenía un plan."*

**Block sequence:**
1. `narrator` (strong) — The crisis. As predicted. As always in Argentina — cyclical, structural, inevitable. But this time: platform, assemblies, alternative government, organization. All built. All tested.
2. `narrator` — "72 hours. That was the window."
3. `tool` (command-grid) — Command Center. A grid awakening tile by tile. Each plan activating. Dynamic: shows all plans from `PLAN_NODES`.
4. `stat` — 72 hours to full activation
5. `testimony` — A nurse, 31, Tucumán. "PLANSAL activated at 6am. By noon we had field hospitals in three barrios. The protocol was ready — we'd rehearsed it."
6. `break` (time-jump) — "Primera semana"
7. `tool` (dominos-cascading) — What-If Simulator in action. As obstacles appear, the system models cascading effects and adjusts in real time.
8. `narrator` — "The Window Rule: deploy what you have. A half-built ¡BASTA! is infinitely better than no plan."
9. `testimony` — A teacher (Lucía again, now 40), provincial legislator. "Not through careerism. The assembly nominated me. I said no three times. They said: 'You spent 12 years preparing for this moment.'"
10. `break` (time-jump) — "Primer año"
11. `tool` (health-ring) — KPI Dashboard. The ecosystem health ring filling up. Dynamic: pulls metrics from `ECOSYSTEM_METRICS`.
12. `statGroup` — 16 mandates executing / Crisis response in 72h / The nation redesigning itself
13. `breath` (half)
14. `narrator` (strong) — The closing reflection. The narrator steps back.
15. `wordReveal` — "Lo que pasó en Argentina entre 2026 y 2040 no tiene precedente. No porque fuera perfecto. Porque fue nuestro."
16. `breath` (full) — final silence
17. `narrator` — A quiet coda: "This is one possible path. The tools exist. The question is whether you'll use them."

### 4.6 Illustration Components

Each illustration is a React component rendering SVG, animated on scroll entry with Framer Motion. All illustrations are monochrome, using the chapter's interpolated palette via CSS custom properties.

#### Shared Base: RutaToolIllustration.tsx

Wrapper component that provides:
- Consistent sizing: full-width, max-width 800px, centered, aspect-ratio 16:9
- Background: `var(--cin-card-bg)` at 2% opacity
- Border: 1px solid `var(--cin-border)`
- Border-radius: 4px (sharp, documentary)
- Subtle grain overlay within the illustration frame
- Scroll reveal: `useReveal` triggers the illustration's entrance animation
- `aria-label` describing what the illustration shows
- Narrative description text below the illustration frame:
  - Inter, 14px, italic, color `var(--cin-text-muted)` at 50%
  - Max-width 560px, centered
  - The `narrativeDescription` from the content data

#### Individual Illustrations

Each illustration is self-contained SVG art. General principles:
- All colors derive from CSS custom properties (monochrome in chapter palette)
- Animations triggered by parent's `isVisible` prop
- Animations use Framer Motion `motion.path`, `motion.circle`, `motion.g`
- Total animation duration: 1-3 seconds per illustration
- Static fallback for `prefers-reduced-motion`: show final state immediately
- No external images or assets — pure SVG

**SeedSpreading.tsx** (La Visión):
- Center point representing the manifesto
- Text fragments ("basta", "diseñar", "nuestro", "futuro") radiate outward in concentric rings
- Animation: fragments appear one ring at a time, expanding outward like ripples
- Color: `var(--cin-text)` at varying opacities (100% center → 20% edges)

**BastardaScale.tsx** (First Bastarda):
- Balance scale SVG
- Left pan (heavy, labeled "Mercado"): weighted down, showing extraction
- Right pan (light, labeled "Bastarda"): rising up, showing at-cost
- The 30% gap labeled between them
- Animation: scale tips from level to showing the difference

**PlatformNetwork.tsx** (The Platform):
- Abstract network topology — not a UI screenshot, but a representation of coordination infrastructure
- Central hub node with radiating connection lines to satellite nodes
- Satellite nodes represent: citizens, Bastardas, assemblies, data
- Thin lines pulse outward from center (data flowing through the network)
- Animation: hub appears first, then connection lines draw outward, then satellite nodes illuminate
- Color: `var(--cin-accent)` for lines, `var(--cin-text)` for nodes
- Evokes "digital backbone" without showing any specific UI

**SignalRising.tsx** (Mandato Vivo):
- Simplified territory silhouette at bottom
- Three wave types rising from it like a heartbeat/EKG:
  - Dreams (soft sine wave, accent color at 40%)
  - Needs (sharper wave, accent color at 60%)
  - ¡BASTA! (spiky peaks, accent color at 100%)
- Animation: waves draw from left to right, one type at a time

**MapSignals.tsx** (El Mapa):
- Simplified outline of Argentina (same SVG as LocationDot but larger, ~full illustration width)
- No internal province borders — just the country shape
- Signal dots appear one by one at various locations across the territory
- Dots cluster around problem areas (3-4 visible clusters form)
- Each cluster has a subtle label: "Agua", "Seguridad", "Escuelas", "Salud"
- Animation: dots appear individually (random positions), then drift toward cluster centers, labels fade in
- Color: dots in `var(--cin-accent)`, labels in `var(--cin-text-muted)`
- Communicates: citizen voices becoming visible on territory, problems emerging from aggregated signals

**CirclesForming.tsx** (Círculos):
- Organic cluster visualization
- Small circles (3-5px) appear individually, then connect with thin lines
- Clusters form, then clusters connect to other clusters
- Animation: 3 phases — dots appear, local connections form, inter-cluster bridges form
- Final state: a network of ~40 nodes in 6-8 clusters

**ConstellationGlow.tsx** (Life Areas):
- 12 orbs arranged in a circle (referencing the existing Constellation component)
- Each orb labeled with a life area icon
- Animation: orbs illuminate one by one, then connecting lines appear
- Simplified version of the real Constellation component, in chapter monochrome

**InitiativesFanning.tsx** (Iniciativas Estratégicas):
- Dynamic: reads `STRATEGIC_INITIATIVES.length` for card count
- Cards arranged in a fan pattern (like a hand of cards)
- Each card shows plan ID (PLANISV, PLANJUS, etc.) — pulled from live data
- Animation: cards fan out from a single stack, one by one
- Category color dots on each card (but muted to chapter palette)

**DataFlowing.tsx** (Datos Abiertos):
- Abstract visualization of transparency
- Left side: opaque blocks (representing hidden data)
- Right side: transparent/outlined blocks (representing open data)
- Particles flowing from left to right, becoming more transparent as they cross
- Animation: particles stream continuously for 3 seconds

**LearningPath.tsx** (Guías de Estudio):
- A winding path from bottom-left to top-right
- Milestone markers along the path (small circles)
- Labels at milestones: "Sistemas", "Cultura Cívica", "Diseño", "Acción"
- Animation: path draws itself from start to finish, milestones illuminate sequentially

**ArchitectOrganism.tsx** (El Arquitecto):
- Dynamic: reads `PLAN_NODES` for node count and names
- 16 nodes arranged in an organic layout (not grid — like a body diagram)
- Thin lines connecting dependent nodes
- Each node labeled with plan ID
- Animation: nodes appear one by one (like organs lighting up in a body scan), then dependency lines draw between them
- A subtle "breathing" animation on the finished state (slight scale pulse, 4s period)

**BudgetTreemap.tsx** (Presupuesto):
- Dynamic: reads budget data from `PLAN_NODES`
- Simplified treemap: rectangles sized by average budget
- Largest plans (PLANVIV, PLANEDU) are biggest rectangles
- Each rectangle labeled with plan ID and budget range
- Animation: rectangles appear from largest to smallest

**CriticalTimeline.tsx** (Ruta Crítica):
- Dynamic: reads `CRITICAL_CHAINS` and `TIMELINE_PHASES`
- Simplified horizontal timeline (Year 0 → Year 20)
- 3 highlighted chains shown as connected bars
- Year 0 marked with a bold vertical line ("Día Cero")
- Animation: timeline draws left to right, chains highlight sequentially

**ThreatRadar.tsx** (Adversarial):
- Radar/spider chart with 6-8 axes
- Axes: financial, narco, tech, geopolitical, union, media, institutional, social
- Threat level plotted on each axis
- Animation: radar sweeps around, filling in threat levels

**CommandGrid.tsx** (Command Center):
- Dynamic: reads `PLAN_NODES` for plan count
- 4×4 grid of tiles (or appropriate grid for actual plan count)
- Each tile labeled with plan ID
- Animation: tiles "activate" one by one, going from dark/dormant to lit with accent color
- Suggests a control room coming online

**DominosCascading.tsx** (What-If Simulator):
- Row of standing domino pieces, each labeled with a plan ID
- One domino falls (the disrupted plan)
- Cascading effect: adjacent dominos tip in sequence
- Some dominos have "shields" and don't fall (plans with fallback protocols)
- Animation: first domino tips, cascade propagates, stops at shielded dominos

**HealthRing.tsx** (KPI Dashboard):
- Single circular progress ring (like the existing ecosystem health ring)
- Percentage in the center, large mono type
- Ring fills from 0% to target value
- Below the ring: 3-4 key metric labels with values
- Animation: ring fills over 1.5 seconds with ease-out

---

## 5. Page Component Assembly

### UnaRutaParaArgentina.tsx

The page component wires everything together:

```tsx
// Pseudo-code structure
import { CinematicScroll, CinematicChapter } from '@/cinematic-scroll';
import { RUTA_ARGENTINA_CHAPTERS } from '@shared/ruta-argentina-content';
import { RUTA_PALETTES } from './ruta-palettes';
import RutaChapterOne from '@/components/ruta/RutaChapterOne';
import RutaChapterTwo from '@/components/ruta/RutaChapterTwo';
// ... etc

export default function UnaRutaParaArgentina() {
  return (
    <CinematicScroll
      palettes={RUTA_PALETTES}
      chapters={RUTA_ARGENTINA_CHAPTERS.map(c => c.title)}
      immersive={true}
    >
      <CinematicChapter index={0}>
        <RutaChapterOne content={RUTA_ARGENTINA_CHAPTERS[0]} />
      </CinematicChapter>
      <CinematicChapter index={1}>
        <RutaChapterTwo content={RUTA_ARGENTINA_CHAPTERS[1]} />
      </CinematicChapter>
      <CinematicChapter index={2}>
        <RutaChapterThree content={RUTA_ARGENTINA_CHAPTERS[2]} />
      </CinematicChapter>
      <CinematicChapter index={3}>
        <RutaChapterFour content={RUTA_ARGENTINA_CHAPTERS[3]} />
      </CinematicChapter>
      <CinematicChapter index={4}>
        <RutaChapterFive content={RUTA_ARGENTINA_CHAPTERS[4]} />
      </CinematicChapter>
    </CinematicScroll>
  );
}
```

### Individual Chapter Components

Each `RutaChapterN.tsx` receives the chapter content data and renders the block sequence using the library's block components. The chapter component is responsible for:

- Iterating through `content.blocks` and rendering the appropriate component for each block type
- Passing `isVisible` and scroll state to illustrations
- Managing any chapter-specific layout decisions (some blocks might be side-by-side on desktop)
- Parallax layer placement within the chapter

The chapter component does NOT handle:
- Scroll detection (that's the engine)
- Color palette (that's CSS custom properties from the engine)
- Reveal animations (each block handles its own via `useReveal`)

### Immersion Mode Integration

The `UnaRutaParaArgentina` page needs to communicate with the site's `Header` component to hide it on mount and show it on unmount.

**Implementation approach:**
- A React context `ImmersionContext` wrapping the app
- `UnaRutaParaArgentina` calls `setImmersive(true)` on mount, `setImmersive(false)` on unmount
- `Header` reads `isImmersive` from context and applies `opacity: 0`, `pointer-events: none` with transition
- The back button ("← Volver") is rendered inside the `CinematicScroll` component, not in the Header

---

## 6. Build Strategy — Three Passes

### Pass 1: Structure (Spike + Core)

**Goal:** 5 horizontal chapters with vertical scroll, chapter nav, discrete palettes per chapter, basic narrator text, working on Chrome/Safari/Firefox/Mobile Safari.

**Deliverables:**
- `cinematic-scroll/` folder with engine core (CinematicScroll, CinematicChapter, ChapterNav, ScrollProgressProvider, all hooks, scroll-math, types)
- CSS files (cinematic-scroll.css, typography.css, reduced-motion.css)
- `NarratorBlock` and `ChapterTitle` components
- `UnaRutaParaArgentina.tsx` page with placeholder text
- Route and header nav link
- Immersion mode (header hide/show)

**Verification before proceeding:**
- [ ] Horizontal scroll-snap works on Chrome, Safari, Firefox
- [ ] Vertical scroll within chapters works independently
- [ ] No scroll conflict between horizontal and vertical
- [ ] Mobile touch: horizontal swipe navigates chapters, vertical scroll works within
- [ ] iOS Safari: 100vh is correct (accounting for address bar)
- [ ] Chapter nav dots appear and correctly indicate active chapter
- [ ] Clicking chapter nav dot navigates to that chapter
- [ ] Arrow keys navigate between chapters
- [ ] Discrete palette changes apply per chapter (no interpolation yet)
- [ ] Narrator text is readable and properly styled
- [ ] No jank at 60fps on scroll
- [ ] `prefers-reduced-motion` disables animations
- [ ] Screen reader announces chapter changes

### Pass 2: Cinematics

**Goal:** Color interpolation, scroll-triggered reveals, all block components, testimony cards, stats, section dividers, breathing spaces, word reveal, grain, vignette, chapter transitions.

**Deliverables:**
- `useColorInterpolation` hook with HSL lerp — smooth color transitions between chapters
- `GrainOverlay` and `Vignette` with per-chapter intensity
- `ChapterTransition` overlay
- All remaining block components: `TestimonyCard`, `StatReveal`, `SectionDivider`, `BreathingSpace`, `WordReveal`, `ParallaxLayer`
- `SilhouetteAvatar` and `LocationDot` humanity components
- Full narrative content in `ruta-argentina-content.ts` for all 5 chapters
- All 5 `RutaChapterN.tsx` components with real content

**Verification before proceeding:**
- [ ] Color interpolation is smooth between all chapter boundaries
- [ ] No muddy intermediate colors (HSL interpolation correct)
- [ ] Grain intensity varies correctly per chapter
- [ ] Vignette intensity varies correctly per chapter
- [ ] Chapter transition overlay plays on chapter change
- [ ] Narrator blocks reveal on scroll (fade up)
- [ ] Testimony cards slide in from left
- [ ] Stats count up on visibility
- [ ] Word reveal works for pivotal lines
- [ ] Breathing spaces create correct vertical emptiness
- [ ] Section dividers render correctly for all three variants
- [ ] Parallax layers move at correct relative speed
- [ ] All content is in Spanish (rioplatense dialect)
- [ ] 60fps on mid-range device
- [ ] `prefers-reduced-motion` disables all scroll animations

### Pass 3: Polish & Illustrations

**Goal:** All 15 tool illustrations, documentary craft refinement, typography perfection, micro-interactions, loading state, cross-browser testing, accessibility audit, performance audit.

**Deliverables:**
- All 17 illustration components (SeedSpreading through HealthRing)
- `RutaToolIllustration` wrapper with consistent framing
- Dynamic data integration for illustrations that pull from `strategic-initiatives.ts` and `arquitecto-data.ts`
- Loading state for the initial page load (a subtle fade-in, not a spinner)
- Keyboard navigation refinement
- Focus management between chapters
- Full cross-browser test pass
- Lighthouse performance audit (target: 90+ performance score)
- Screen reader test (VoiceOver on macOS/iOS)
- Typography fine-tuning (letter-spacing, line-height adjustments based on real content)
- Animation timing refinement based on how the real content feels

**Verification (final):**
- [ ] All 17 illustrations render correctly and animate on scroll
- [ ] Dynamic illustrations update when underlying data changes
- [ ] Illustrations look good in every chapter's color palette
- [ ] Loading state is smooth
- [ ] Full keyboard navigation works (Tab, Arrow keys, Escape for back)
- [ ] VoiceOver reads the full story coherently
- [ ] Lighthouse performance: 90+
- [ ] Chrome, Safari, Firefox, Edge: all working
- [ ] Mobile Safari, Chrome Android: all working
- [ ] Total bundle size for cinematic-scroll library: < 15KB gzipped (excluding illustrations)
- [ ] No accessibility violations (axe audit)

---

## 7. Dependencies

### Required (already in project)
- React 18+
- Framer Motion (already used throughout the project)
- Tailwind CSS (for utility classes in content components — engine CSS is standalone)

### No new dependencies
The cinematic scroll engine introduces zero new npm packages. Everything is built with:
- React hooks + context
- Framer Motion (already installed)
- CSS (scroll-snap, custom properties, keyframes)
- IntersectionObserver (native browser API)
- SVG (native, no charting library)

---

## 8. Out of Scope

- Server-side rendering / prerendering of this page (it's a client-only scroll experience)
- Audio / sound design (would be amazing but is a separate project)
- Real photography or video (all visuals are SVG illustrations)
- Social sharing / OG image generation for specific chapters
- Analytics tracking per chapter (could be added later via `onChapterChange` callback)
- Offline support
- Print stylesheet
- i18n / translation (content is Spanish only by design)
