# Una Ruta para Argentina — Pass 1: Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the cinematic scroll engine foundation and wire up the page with horizontal chapters, vertical scroll, chapter navigation, discrete palettes, narrator text, and immersion mode — verified working in the browser.

**Architecture:** A reusable `cinematic-scroll/` library inside `SocialJusticeHub/` provides the scroll engine (horizontal scroll-snap chapters, vertical scroll tracking, color palette context, reveal animations). The content page `UnaRutaParaArgentina.tsx` consumes it with placeholder text. Immersion mode hides the site header via a React context.

**Tech Stack:** React 18, Framer Motion 11, CSS scroll-snap, CSS custom properties, IntersectionObserver, wouter routing

**Spec:** `docs/superpowers/specs/2026-04-15-una-ruta-para-argentina-design.md`

---

## File Map

### New files — Cinematic Scroll Engine (`SocialJusticeHub/cinematic-scroll/`)

| File | Responsibility |
|---|---|
| `src/types.ts` | All TypeScript interfaces (ChapterPalette, HSL, ScrollState, etc.) |
| `src/engine/scroll-math.ts` | Pure utility functions (lerp, clamp, HSL interpolation, palette indices) |
| `src/engine/ScrollProgressProvider.tsx` | React context providing scroll state to descendants |
| `src/engine/useScrollProgress.ts` | Consumer hook for scroll context |
| `src/engine/useReveal.ts` | IntersectionObserver-based visibility trigger hook |
| `src/engine/useChapterNavigation.ts` | Keyboard arrow-key chapter navigation hook |
| `src/engine/CinematicChapter.tsx` | Individual chapter panel (100vw × 100vh, vertical scroll) |
| `src/engine/CinematicScroll.tsx` | Root container (horizontal scroll-snap, chapter detection, palette application) |
| `src/engine/ChapterNav.tsx` | Floating dot navigation |
| `src/blocks/ChapterTitle.tsx` | Full-viewport chapter title screen |
| `src/blocks/NarratorBlock.tsx` | Full-width narrator text with scroll reveal |
| `src/styles/cinematic-scroll.css` | Core layout (scroll-snap, viewport, containers) |
| `src/styles/typography.css` | Typography scale (narrator, testimony, stat, chapter title) |
| `src/styles/reduced-motion.css` | prefers-reduced-motion overrides |
| `src/index.ts` | Public API exports |
| `package.json` | Package metadata |

### New files — Content Layer (`SocialJusticeHub/client/src/`)

| File | Responsibility |
|---|---|
| `components/ImmersionContext.tsx` | Context + provider for immersion mode (header hide/show) |
| `pages/UnaRutaParaArgentina.tsx` | Page component assembling chapters with placeholder content |

### Modified files

| File | Change |
|---|---|
| `client/src/App.tsx` | Add lazy import, route, wrap app in ImmersionProvider |
| `client/src/components/Header.tsx` | Add "Ruta" nav item, consume ImmersionContext to hide/show |
| `vite.config.ts` | Add `@cinematic-scroll` path alias |
| `tsconfig.json` | Add `@cinematic-scroll/*` path mapping |

---

### Task 1: Scaffold cinematic-scroll folder and package.json

**Files:**
- Create: `cinematic-scroll/package.json`
- Create: `cinematic-scroll/src/types.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@local/cinematic-scroll",
  "version": "0.1.0",
  "private": true,
  "description": "Reusable cinematic scroll engine — horizontal chapters, vertical scroll, color interpolation, documentary aesthetics",
  "main": "src/index.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "framer-motion": "^11.0.0"
  }
}
```

- [ ] **Step 2: Create types.ts with all type definitions**

```ts
import type { RefObject } from 'react';

export interface ChapterPalette {
  bg: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  cardBg: string;
  testimonialAccent: string;
  statColor: string;
  grain: number;
  vignette: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface InterpolatedPalette extends ChapterPalette {
  bgRgb: string;
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
  ref: RefObject<HTMLElement | null>;
  isVisible: boolean;
  progress: number;
}

export interface PaletteIndices {
  fromIndex: number;
  toIndex: number;
  t: number;
}
```

- [ ] **Step 3: Commit**

```bash
cd SocialJusticeHub
git add cinematic-scroll/
git commit -m "feat(cinematic-scroll): scaffold package and type definitions"
```

---

### Task 2: Implement scroll-math.ts pure utilities

**Files:**
- Create: `cinematic-scroll/src/engine/scroll-math.ts`

- [ ] **Step 1: Write scroll-math.ts with all pure functions**

```ts
import type { HSL, PaletteIndices } from '../types';

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function hexToHSL(hex: string): HSL {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    const hex = val.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function hexToRgbString(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export function lerpHSL(colorA: HSL, colorB: HSL, t: number): HSL {
  // Shortest path hue interpolation
  let hueDiff = colorB.h - colorA.h;
  if (hueDiff > 180) hueDiff -= 360;
  if (hueDiff < -180) hueDiff += 360;

  const h = ((colorA.h + hueDiff * t) % 360 + 360) % 360;
  const s = lerp(colorA.s, colorB.s, t);
  const l = lerp(colorA.l, colorB.l, t);

  return { h, s, l };
}

export function getPaletteIndices(
  globalProgress: number,
  paletteCount: number
): PaletteIndices {
  if (paletteCount <= 1) return { fromIndex: 0, toIndex: 0, t: 0 };

  const scaled = globalProgress * (paletteCount - 1);
  const fromIndex = clamp(Math.floor(scaled), 0, paletteCount - 2);
  const toIndex = fromIndex + 1;
  const t = clamp(scaled - fromIndex, 0, 1);

  return { fromIndex, toIndex, t };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd SocialJusticeHub && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20`

Note: This will likely fail because tsconfig doesn't know about cinematic-scroll yet. That's fine — we'll fix paths in Task 10. For now just verify no syntax errors by running:

Run: `npx tsc --noEmit --strict --moduleResolution bundler --module esnext --target es2020 cinematic-scroll/src/engine/scroll-math.ts cinematic-scroll/src/types.ts 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add cinematic-scroll/src/engine/scroll-math.ts
git commit -m "feat(cinematic-scroll): add scroll-math pure utility functions"
```

---

### Task 3: ScrollProgressProvider and useScrollProgress

**Files:**
- Create: `cinematic-scroll/src/engine/ScrollProgressProvider.tsx`
- Create: `cinematic-scroll/src/engine/useScrollProgress.ts`

- [ ] **Step 1: Create ScrollProgressProvider.tsx**

```tsx
import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { ChapterPalette, InterpolatedPalette, ScrollState } from '../types';

const defaultPalette: InterpolatedPalette = {
  bg: '#0a0a0a',
  text: '#8a8a8a',
  textMuted: '#555555',
  accent: '#6a6a6a',
  border: '#1a1a1a',
  cardBg: '#ffffff',
  testimonialAccent: '#777777',
  statColor: '#999999',
  grain: 0.04,
  vignette: 0.3,
  bgRgb: '10, 10, 10',
  accentRgb: '106, 106, 106',
};

const defaultState: ScrollState = {
  chapterIndex: 0,
  chapterProgress: 0,
  globalProgress: 0,
  totalChapters: 1,
  currentPalette: defaultPalette,
  isReducedMotion: false,
};

export const ScrollProgressContext = createContext<{
  state: ScrollState;
  setChapterIndex: (index: number) => void;
  setChapterProgress: (progress: number) => void;
  setGlobalProgress: (progress: number) => void;
  setPalette: (palette: InterpolatedPalette) => void;
}>({
  state: defaultState,
  setChapterIndex: () => {},
  setChapterProgress: () => {},
  setGlobalProgress: () => {},
  setPalette: () => {},
});

interface ScrollProgressProviderProps {
  totalChapters: number;
  isReducedMotion: boolean;
  children: React.ReactNode;
}

export function ScrollProgressProvider({
  totalChapters,
  isReducedMotion,
  children,
}: ScrollProgressProviderProps) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [currentPalette, setPalette] = useState<InterpolatedPalette>(defaultPalette);

  const state = useMemo<ScrollState>(
    () => ({
      chapterIndex,
      chapterProgress,
      globalProgress,
      totalChapters,
      currentPalette,
      isReducedMotion,
    }),
    [chapterIndex, chapterProgress, globalProgress, totalChapters, currentPalette, isReducedMotion]
  );

  const contextValue = useMemo(
    () => ({
      state,
      setChapterIndex,
      setChapterProgress,
      setGlobalProgress,
      setPalette,
    }),
    [state]
  );

  return (
    <ScrollProgressContext.Provider value={contextValue}>
      {children}
    </ScrollProgressContext.Provider>
  );
}
```

- [ ] **Step 2: Create useScrollProgress.ts**

```ts
import { useContext } from 'react';
import { ScrollProgressContext } from './ScrollProgressProvider';
import type { ScrollState } from '../types';

export function useScrollProgress(): ScrollState {
  const { state } = useContext(ScrollProgressContext);
  return state;
}
```

- [ ] **Step 3: Commit**

```bash
git add cinematic-scroll/src/engine/ScrollProgressProvider.tsx cinematic-scroll/src/engine/useScrollProgress.ts
git commit -m "feat(cinematic-scroll): add scroll progress context and consumer hook"
```

---

### Task 4: useReveal hook

**Files:**
- Create: `cinematic-scroll/src/engine/useReveal.ts`

- [ ] **Step 1: Create useReveal.ts**

```ts
import { useRef, useState, useEffect, useCallback } from 'react';
import type { RevealOptions, RevealState } from '../types';

const DEFAULT_THRESHOLD = 0.2;
const DEFAULT_ROOT_MARGIN = '0px 0px -50px 0px';

export function useReveal(options?: RevealOptions): RevealState {
  const {
    threshold = DEFAULT_THRESHOLD,
    rootMargin = DEFAULT_ROOT_MARGIN,
    once = true,
  } = options ?? {};

  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const frozenRef = useRef(false);

  // Check prefers-reduced-motion
  const isReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // If reduced motion, immediately show everything
    if (isReducedMotion) {
      setIsVisible(true);
      setProgress(1);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (frozenRef.current) return;

        const ratio = entry.intersectionRatio;
        setProgress(ratio);

        if (entry.isIntersecting && ratio >= threshold) {
          setIsVisible(true);
          if (once) {
            frozenRef.current = true;
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: [0, threshold, 0.5, 1], rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, isReducedMotion]);

  return { ref, isVisible, progress };
}
```

- [ ] **Step 2: Commit**

```bash
git add cinematic-scroll/src/engine/useReveal.ts
git commit -m "feat(cinematic-scroll): add useReveal IntersectionObserver hook"
```

---

### Task 5: useChapterNavigation hook

**Files:**
- Create: `cinematic-scroll/src/engine/useChapterNavigation.ts`

- [ ] **Step 1: Create useChapterNavigation.ts**

```ts
import { useEffect, useCallback, type RefObject } from 'react';

interface ChapterNavigationResult {
  goToChapter: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
}

export function useChapterNavigation(
  containerRef: RefObject<HTMLElement | null>,
  totalChapters: number,
  activeChapter: number
): ChapterNavigationResult {
  const goToChapter = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container) return;
      const clamped = Math.max(0, Math.min(index, totalChapters - 1));
      const viewportWidth = container.clientWidth;
      container.scrollTo({
        left: clamped * viewportWidth,
        behavior: 'smooth',
      });
    },
    [containerRef, totalChapters]
  );

  const goNext = useCallback(() => {
    if (activeChapter < totalChapters - 1) {
      goToChapter(activeChapter + 1);
    }
  }, [activeChapter, totalChapters, goToChapter]);

  const goPrev = useCallback(() => {
    if (activeChapter > 0) {
      goToChapter(activeChapter - 1);
    }
  }, [activeChapter, goToChapter]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };

    // Listen on window so arrow keys work regardless of focus
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, goNext, goPrev]);

  return { goToChapter, goNext, goPrev };
}
```

- [ ] **Step 2: Commit**

```bash
git add cinematic-scroll/src/engine/useChapterNavigation.ts
git commit -m "feat(cinematic-scroll): add useChapterNavigation keyboard hook"
```

---

### Task 6: CSS foundation files

**Files:**
- Create: `cinematic-scroll/src/styles/cinematic-scroll.css`
- Create: `cinematic-scroll/src/styles/typography.css`
- Create: `cinematic-scroll/src/styles/reduced-motion.css`

- [ ] **Step 1: Create cinematic-scroll.css**

```css
/* Core layout — scroll-snap, viewport, containers */

.cin-root {
  position: relative;
  width: 100vw;
  height: 100dvh; /* dvh for mobile address bar */
  overflow: hidden;
  background: var(--cin-bg, #0a0a0a);
  color: var(--cin-text, #8a8a8a);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  isolation: isolate; /* new stacking context */
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
  scrollbar-width: none;
}

.cin-horizontal-container::-webkit-scrollbar {
  display: none;
}

/* Individual chapter */
.cin-chapter {
  flex: 0 0 100vw;
  width: 100vw;
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-snap-align: start;
  scrollbar-width: thin;
  scrollbar-color: var(--cin-accent, #6a6a6a) transparent;
}

.cin-chapter::-webkit-scrollbar {
  width: 4px;
}

.cin-chapter::-webkit-scrollbar-track {
  background: transparent;
}

.cin-chapter::-webkit-scrollbar-thumb {
  background-color: var(--cin-accent, #6a6a6a);
  border-radius: 2px;
}

/* Chapter content wrapper */
.cin-chapter-content {
  min-height: 100dvh;
  padding-bottom: 20vh;
}

/* Chapter nav — desktop */
.cin-nav {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.cin-nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cin-text-muted, #555);
  opacity: 0.4;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.cin-nav-dot:hover {
  opacity: 0.8;
  transform: scale(1.3);
}

.cin-nav-dot[aria-selected="true"] {
  background: var(--cin-accent, #6a6a6a);
  opacity: 1;
  width: 10px;
  height: 10px;
}

.cin-nav-dot:focus-visible {
  outline: 2px solid var(--cin-accent, #6a6a6a);
  outline-offset: 4px;
}

/* Tooltip */
.cin-nav-tooltip {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--cin-text, #8a8a8a);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.cin-nav-dot:hover .cin-nav-tooltip {
  opacity: 1;
}

/* Back button */
.cin-back {
  position: fixed;
  top: 20px;
  left: 24px;
  z-index: 100;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--cin-text-muted, #555);
  text-decoration: none;
  opacity: 0.4;
  transition: opacity 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 0;
}

.cin-back:hover {
  opacity: 0.8;
}

.cin-back--faded {
  opacity: 0.15;
}

/* Mobile overrides */
@media (max-width: 1023px) {
  .cin-nav {
    right: auto;
    top: auto;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: row;
    gap: 20px;
  }

  .cin-nav-tooltip {
    display: none;
  }

  .cin-back {
    top: 12px;
    left: 16px;
    font-size: 12px;
  }
}
```

- [ ] **Step 2: Create typography.css**

```css
/* Cinematic typography scale and vertical rhythm */

/* Narrator voice — Playfair Display (serif) */
.cin-narrator {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(18px, 2.2vw, 22px);
  line-height: 1.636;
  font-weight: 400;
  color: var(--cin-text);
  max-width: 680px;
  margin: 0 auto;
  padding: 80px 24px;
  text-align: left;
}

.cin-narrator--strong {
  font-size: clamp(22px, 2.8vw, 28px);
  line-height: 1.429;
  font-weight: 500;
  max-width: 720px;
  padding: 120px 24px;
}

/* Chapter title screen */
.cin-title-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  text-align: center;
  padding: 24px;
  position: relative;
}

.cin-title-number {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--cin-text-muted);
  opacity: 0.4;
  margin-bottom: 16px;
}

.cin-title-heading {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(44px, 8vw, 72px);
  line-height: 1.111;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--cin-text);
  margin: 0;
}

.cin-title-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(14px, 1.6vw, 16px);
  font-weight: 400;
  letter-spacing: 0.06em;
  color: var(--cin-text-muted);
  opacity: 0.6;
  margin-top: 12px;
}

.cin-title-epigraph {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(16px, 1.8vw, 18px);
  line-height: 1.556;
  font-weight: 400;
  font-style: italic;
  color: var(--cin-text);
  opacity: 0.5;
  max-width: 480px;
  margin: 48px auto 0;
}

/* Scroll indicator */
.cin-scroll-indicator {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--cin-text-muted);
  opacity: 0.2;
  animation: cin-bounce 2s ease-in-out infinite;
  transition: opacity 0.5s ease;
}

.cin-scroll-indicator--hidden {
  opacity: 0;
}

@keyframes cin-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}
```

- [ ] **Step 3: Create reduced-motion.css**

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all scroll-based animations */
  .cin-chapter {
    scroll-behavior: auto;
  }

  .cin-horizontal-container {
    scroll-behavior: auto;
  }

  /* Parallax layers become static */
  [data-parallax] {
    transform: none !important;
  }

  /* Reveals are immediate */
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }

  /* Scroll indicator doesn't bounce */
  .cin-scroll-indicator {
    animation: none;
  }

  /* Stats show final value */
  [data-stat-animated] {
    transition: none !important;
  }

  /* Word reveal shows all words */
  [data-word-reveal] span {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }

  /* Chapter transitions are instant */
  .cin-transition-overlay {
    transition: none !important;
  }

  /* Grain animation stopped */
  .cin-grain::after {
    animation: none !important;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add cinematic-scroll/src/styles/
git commit -m "feat(cinematic-scroll): add CSS foundation — layout, typography, reduced-motion"
```

---

### Task 7: CinematicChapter component

**Files:**
- Create: `cinematic-scroll/src/engine/CinematicChapter.tsx`

- [ ] **Step 1: Create CinematicChapter.tsx**

```tsx
import React, { useRef, useCallback, useContext, useEffect } from 'react';
import { ScrollProgressContext } from './ScrollProgressProvider';

interface CinematicChapterProps {
  index: number;
  children: React.ReactNode;
}

export function CinematicChapter({ index, children }: CinematicChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { state, setChapterProgress, setGlobalProgress } = useContext(ScrollProgressContext);

  const handleScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (state.chapterIndex !== index) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;

    if (scrollHeight <= 0) {
      setChapterProgress(0);
      setGlobalProgress(index / state.totalChapters);
      return;
    }

    const progress = Math.min(scrollTop / scrollHeight, 1);
    setChapterProgress(progress);
    setGlobalProgress((index + progress) / state.totalChapters);
  }, [index, state.chapterIndex, state.totalChapters, setChapterProgress, setGlobalProgress]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <section
      ref={sectionRef}
      className="cin-chapter"
      aria-label={`Chapter ${index + 1}`}
      data-chapter-index={index}
    >
      <div className="cin-chapter-content">
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add cinematic-scroll/src/engine/CinematicChapter.tsx
git commit -m "feat(cinematic-scroll): add CinematicChapter component"
```

---

### Task 8: ChapterNav component

**Files:**
- Create: `cinematic-scroll/src/engine/ChapterNav.tsx`

- [ ] **Step 1: Create ChapterNav.tsx**

```tsx
import React from 'react';

interface ChapterNavProps {
  chapters: string[];
  activeIndex: number;
  onChapterClick: (index: number) => void;
}

export function ChapterNav({ chapters, activeIndex, onChapterClick }: ChapterNavProps) {
  return (
    <nav
      className="cin-nav"
      role="tablist"
      aria-label="Chapter navigation"
    >
      {chapters.map((title, i) => (
        <button
          key={i}
          className="cin-nav-dot"
          role="tab"
          aria-label={`Capítulo ${i + 1}: ${title}`}
          aria-selected={i === activeIndex}
          onClick={() => onChapterClick(i)}
          tabIndex={i === activeIndex ? 0 : -1}
        >
          <span className="cin-nav-tooltip">{title}</span>
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add cinematic-scroll/src/engine/ChapterNav.tsx
git commit -m "feat(cinematic-scroll): add ChapterNav dot navigation"
```

---

### Task 9: CinematicScroll root container

**Files:**
- Create: `cinematic-scroll/src/engine/CinematicScroll.tsx`

- [ ] **Step 1: Create CinematicScroll.tsx**

This is the core orchestrator — manages horizontal scroll-snap, chapter detection via IntersectionObserver, palette application via CSS custom properties, and the back button.

```tsx
import React, { useRef, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { ScrollProgressProvider, ScrollProgressContext } from './ScrollProgressProvider';
import { ChapterNav } from './ChapterNav';
import { useChapterNavigation } from './useChapterNavigation';
import { hexToRgbString } from './scroll-math';
import type { ChapterPalette } from '../types';

import '../styles/cinematic-scroll.css';
import '../styles/typography.css';
import '../styles/reduced-motion.css';

interface CinematicScrollProps {
  palettes: ChapterPalette[];
  chapters: string[];
  onChapterChange?: (index: number) => void;
  children: React.ReactNode;
}

function CinematicScrollInner({
  palettes,
  chapters,
  onChapterChange,
  children,
}: CinematicScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [backFaded, setBackFaded] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { setChapterIndex, setPalette } = useContext(ScrollProgressContext);

  const { goToChapter } = useChapterNavigation(
    containerRef,
    chapters.length,
    activeChapter
  );

  // Detect reduced motion
  const isReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Apply palette as CSS custom properties
  const applyPalette = useCallback(
    (palette: ChapterPalette) => {
      const root = document.querySelector('.cin-root') as HTMLElement | null;
      if (!root) return;

      root.style.setProperty('--cin-bg', palette.bg);
      root.style.setProperty('--cin-bg-rgb', hexToRgbString(palette.bg));
      root.style.setProperty('--cin-text', palette.text);
      root.style.setProperty('--cin-text-muted', palette.textMuted);
      root.style.setProperty('--cin-accent', palette.accent);
      root.style.setProperty('--cin-accent-rgb', hexToRgbString(palette.accent));
      root.style.setProperty('--cin-border', palette.border);
      root.style.setProperty('--cin-card-bg', palette.cardBg);
      root.style.setProperty('--cin-testimony-accent', palette.testimonialAccent);
      root.style.setProperty('--cin-stat-color', palette.statColor);
      root.style.setProperty('--cin-grain-opacity', String(palette.grain));
      root.style.setProperty('--cin-vignette-opacity', String(palette.vignette));

      setPalette({
        ...palette,
        bgRgb: hexToRgbString(palette.bg),
        accentRgb: hexToRgbString(palette.accent),
      });
    },
    [setPalette]
  );

  // Chapter detection via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chapterElements = container.querySelectorAll('.cin-chapter');
    if (chapterElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = Number(
              (entry.target as HTMLElement).dataset.chapterIndex
            );
            if (!isNaN(index) && index !== activeChapter) {
              setActiveChapter(index);
              setChapterIndex(index);
              onChapterChange?.(index);
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    chapterElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeChapter, setChapterIndex, onChapterChange]);

  // Apply discrete palette when chapter changes (Pass 1 — no interpolation yet)
  useEffect(() => {
    const palette = palettes[activeChapter];
    if (palette) {
      applyPalette(palette);
    }
  }, [activeChapter, palettes, applyPalette]);

  // Apply initial palette on mount
  useEffect(() => {
    if (palettes[0]) {
      applyPalette(palettes[0]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Back button fade on inactivity
  useEffect(() => {
    const resetFade = () => {
      setBackFaded(false);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => setBackFaded(true), 3000);
    };

    resetFade();
    window.addEventListener('mousemove', resetFade, { passive: true });
    window.addEventListener('touchstart', resetFade, { passive: true });
    window.addEventListener('scroll', resetFade, { passive: true });

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      window.removeEventListener('mousemove', resetFade);
      window.removeEventListener('touchstart', resetFade);
      window.removeEventListener('scroll', resetFade);
    };
  }, []);

  return (
    <div className="cin-root" tabIndex={-1}>
      <div ref={containerRef} className="cin-horizontal-container">
        {children}
      </div>

      <button
        className={`cin-back ${backFaded ? 'cin-back--faded' : ''}`}
        onClick={() => window.history.back()}
        aria-label="Volver"
      >
        ← Volver
      </button>

      <ChapterNav
        chapters={chapters}
        activeIndex={activeChapter}
        onChapterClick={goToChapter}
      />
    </div>
  );
}

export function CinematicScroll(props: CinematicScrollProps) {
  const isReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  return (
    <ScrollProgressProvider
      totalChapters={props.chapters.length}
      isReducedMotion={isReducedMotion}
    >
      <CinematicScrollInner {...props} />
    </ScrollProgressProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add cinematic-scroll/src/engine/CinematicScroll.tsx
git commit -m "feat(cinematic-scroll): add CinematicScroll root container with chapter detection and palette"
```

---

### Task 10: Block components — ChapterTitle and NarratorBlock

**Files:**
- Create: `cinematic-scroll/src/blocks/ChapterTitle.tsx`
- Create: `cinematic-scroll/src/blocks/NarratorBlock.tsx`

- [ ] **Step 1: Create ChapterTitle.tsx**

```tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReveal } from '../engine/useReveal';
import { ChevronDown } from 'lucide-react';

interface ChapterTitleProps {
  number: number;
  title: string;
  subtitle: string;
  epigraph?: string;
}

const SPELLED_NUMBERS = ['UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO'];

export function ChapterTitle({ number, title, subtitle, epigraph }: ChapterTitleProps) {
  const { ref, isVisible } = useReveal({ threshold: 0.1 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const parent = (ref.current as HTMLElement | null)?.closest('.cin-chapter');
      if (parent && parent.scrollTop > 50) {
        setScrolled(true);
      }
    };

    const parent = (ref.current as HTMLElement | null)?.closest('.cin-chapter');
    if (parent) {
      parent.addEventListener('scroll', handleScroll, { passive: true });
      return () => parent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const spelled = SPELLED_NUMBERS[number - 1] || String(number);

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="cin-title-screen"
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="cin-title-number">CAPÍTULO {spelled}</div>
      <h2 className="cin-title-heading">{title}</h2>
      <div className="cin-title-subtitle">{subtitle}</div>
      {epigraph && (
        <p className="cin-title-epigraph">—{epigraph}—</p>
      )}
      <div
        className={`cin-scroll-indicator ${scrolled ? 'cin-scroll-indicator--hidden' : ''}`}
      >
        <ChevronDown size={24} />
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create NarratorBlock.tsx**

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useReveal } from '../engine/useReveal';

interface NarratorBlockProps {
  children: React.ReactNode;
  emphasis?: 'normal' | 'strong';
}

export function NarratorBlock({ children, emphasis = 'normal' }: NarratorBlockProps) {
  const { ref, isVisible } = useReveal({ threshold: 0.2 });

  const className = `cin-narrator ${emphasis === 'strong' ? 'cin-narrator--strong' : ''}`;

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      data-reveal
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add cinematic-scroll/src/blocks/
git commit -m "feat(cinematic-scroll): add ChapterTitle and NarratorBlock components"
```

---

### Task 11: Public API — index.ts

**Files:**
- Create: `cinematic-scroll/src/index.ts`

- [ ] **Step 1: Create index.ts with all Pass 1 exports**

```ts
// Engine
export { CinematicScroll } from './engine/CinematicScroll';
export { CinematicChapter } from './engine/CinematicChapter';
export { ChapterNav } from './engine/ChapterNav';
export { ScrollProgressProvider } from './engine/ScrollProgressProvider';
export { useScrollProgress } from './engine/useScrollProgress';
export { useReveal } from './engine/useReveal';
export { useChapterNavigation } from './engine/useChapterNavigation';

// Blocks
export { ChapterTitle } from './blocks/ChapterTitle';
export { NarratorBlock } from './blocks/NarratorBlock';

// Math utilities
export {
  lerp,
  clamp,
  easeInOutCubic,
  hexToHSL,
  hslToHex,
  hexToRgbString,
  lerpHSL,
  getPaletteIndices,
} from './engine/scroll-math';

// Types
export type {
  ChapterPalette,
  InterpolatedPalette,
  ScrollState,
  RevealOptions,
  RevealState,
  HSL,
  PaletteIndices,
} from './types';
```

- [ ] **Step 2: Commit**

```bash
git add cinematic-scroll/src/index.ts
git commit -m "feat(cinematic-scroll): add public API index with all Pass 1 exports"
```

---

### Task 12: Configure path aliases for cinematic-scroll

**Files:**
- Modify: `SocialJusticeHub/tsconfig.json`
- Modify: `SocialJusticeHub/vite.config.ts`

- [ ] **Step 1: Read tsconfig.json to find the paths section**

Read the current `tsconfig.json` file to locate the `paths` configuration.

- [ ] **Step 2: Add @cinematic-scroll path alias to tsconfig.json**

Add to the `paths` object inside `compilerOptions`:

```json
"@cinematic-scroll/*": ["./cinematic-scroll/src/*"]
```

- [ ] **Step 3: Read vite.config.ts to find the alias section**

Read the current `vite.config.ts` file to locate the `resolve.alias` configuration.

- [ ] **Step 4: Add @cinematic-scroll alias to vite.config.ts**

Add to the `resolve.alias` object:

```ts
"@cinematic-scroll": path.resolve(import.meta.dirname, "cinematic-scroll", "src"),
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd SocialJusticeHub && npm run check 2>&1 | tail -5`

Expected: No errors related to cinematic-scroll (some existing errors in unrelated files are OK).

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json vite.config.ts
git commit -m "chore: add @cinematic-scroll path alias to tsconfig and vite"
```

---

### Task 13: ImmersionContext

**Files:**
- Create: `client/src/components/ImmersionContext.tsx`

- [ ] **Step 1: Create ImmersionContext.tsx**

```tsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface ImmersionContextType {
  isImmersive: boolean;
  setImmersive: (value: boolean) => void;
}

const ImmersionContext = createContext<ImmersionContextType>({
  isImmersive: false,
  setImmersive: () => {},
});

export function useImmersion(): ImmersionContextType {
  return useContext(ImmersionContext);
}

export function ImmersionProvider({ children }: { children: React.ReactNode }) {
  const [isImmersive, setImmersive] = useState(false);

  const value = useMemo(
    () => ({ isImmersive, setImmersive }),
    [isImmersive]
  );

  return (
    <ImmersionContext.Provider value={value}>
      {children}
    </ImmersionContext.Provider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/ImmersionContext.tsx
git commit -m "feat: add ImmersionContext for full-screen immersive pages"
```

---

### Task 14: Integrate ImmersionProvider into App.tsx and Header.tsx

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/Header.tsx`

- [ ] **Step 1: Read App.tsx to understand its structure**

Read the current `App.tsx` to locate:
- Where the lazy imports are defined
- Where the route list is
- The outermost wrapper component (where to add ImmersionProvider)

- [ ] **Step 2: Add lazy import for UnaRutaParaArgentina**

Add with the other lazy imports:

```tsx
const UnaRutaParaArgentina = React.lazy(() => import("@/pages/UnaRutaParaArgentina"));
```

- [ ] **Step 3: Add route for /una-ruta-para-argentina**

Add inside the `<Switch>` block, near the other top-level narrative routes (after La Semilla, before Mapa):

```tsx
<Route path="/una-ruta-para-argentina" component={UnaRutaParaArgentina} />
```

- [ ] **Step 4: Wrap App in ImmersionProvider**

Import `ImmersionProvider` from `@/components/ImmersionContext` and wrap the app's outermost return. Find the outermost container and wrap it:

```tsx
import { ImmersionProvider } from '@/components/ImmersionContext';
```

Wrap at the top level — the ImmersionProvider should be outside the router but inside UserContext (or at the same level).

- [ ] **Step 5: Read Header.tsx to find navItems array**

Read Header.tsx to find the exact `navItems` array.

- [ ] **Step 6: Add "Ruta" to navItems in Header.tsx**

Insert after `{ label: 'Semilla', href: '/la-semilla-de-basta' }`:

```tsx
{ label: 'Ruta', href: '/una-ruta-para-argentina' },
```

- [ ] **Step 7: Add immersion mode to Header.tsx**

Import `useImmersion` and apply it:

```tsx
import { useImmersion } from '@/components/ImmersionContext';
```

Inside the Header component, add:

```tsx
const { isImmersive } = useImmersion();
```

On the outermost `<header>` element, add a style or className that hides it when immersive:

```tsx
style={{
  opacity: isImmersive ? 0 : 1,
  pointerEvents: isImmersive ? 'none' : 'auto',
  transition: 'opacity 0.2s ease-out',
}}
```

- [ ] **Step 8: Commit**

```bash
git add client/src/App.tsx client/src/components/Header.tsx
git commit -m "feat: add Ruta nav item, route, and immersion mode to header"
```

---

### Task 15: Create UnaRutaParaArgentina page with placeholder content

**Files:**
- Create: `client/src/pages/UnaRutaParaArgentina.tsx`

- [ ] **Step 1: Create the page component**

```tsx
import { useEffect } from 'react';
import { useImmersion } from '@/components/ImmersionContext';
import {
  CinematicScroll,
  CinematicChapter,
  ChapterTitle,
  NarratorBlock,
} from '@cinematic-scroll/index';
import type { ChapterPalette } from '@cinematic-scroll/types';

const RUTA_PALETTES: ChapterPalette[] = [
  // Chapter 1: Silver Ash
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
  // Chapter 2: Warm Earth
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
  // Chapter 3: Deep Water
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
  // Chapter 4: Living Green
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
  // Chapter 5: Iris Bloom
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

const CHAPTER_TITLES = [
  'La Semilla',
  'La Prueba',
  'La Circunscripción',
  'La Cabecera de Puente',
  'La Ejecución',
];

export default function UnaRutaParaArgentina() {
  const { setImmersive } = useImmersion();

  useEffect(() => {
    setImmersive(true);
    return () => setImmersive(false);
  }, [setImmersive]);

  return (
    <CinematicScroll palettes={RUTA_PALETTES} chapters={CHAPTER_TITLES}>
      {/* Chapter 1: La Semilla */}
      <CinematicChapter index={0}>
        <ChapterTitle
          number={1}
          title="La Semilla"
          subtitle="2026 — 2028"
          epigraph="Todo empieza con alguien que hace las cuentas."
        />
        <NarratorBlock>
          Seis crisis en 135 años. El patrón no era un accidente — era una arquitectura.
          Dependencia de commodities, bimonetarismo peso-dólar, federalismo fiscal
          disfuncional, impunidad judicial, especulación inmobiliaria. Las mismas cinco
          fracturas estructurales desde 1890.
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Pero esta vez fue diferente. Esta vez alguien hizo las cuentas.
        </NarratorBlock>
        <NarratorBlock>
          La idea era una locura. Una aseguradora cooperativa, construida por ciudadanos,
          a costo. Contra el mercado. Contra 200 mil millones de dólares anuales en rentas
          capturadas. Con $320 dólares por persona.
        </NarratorBlock>
        <NarratorBlock>
          25.000 personas invirtieron sin saber si iban a volver a ver esa plata. Eso no
          era comercio. Era un acto político.
        </NarratorBlock>
      </CinematicChapter>

      {/* Chapter 2: La Prueba */}
      <CinematicChapter index={1}>
        <ChapterTitle
          number={2}
          title="La Prueba"
          subtitle="2028 — 2032"
          epigraph="Gobernar no es mandar. Gobernar es escuchar."
        />
        <NarratorBlock>
          El movimiento decidió probar el modelo. Un municipio. La pregunta era simple
          y brutal: ¿puede gobernar gente que nunca gobernó?
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Lo primero que hicieron fue escuchar.
        </NarratorBlock>
        <NarratorBlock>
          10.000 voces en el primer mes. Sueños, necesidades, declaraciones de ¡BASTA!
          Las señales se hicieron visibles en el mapa. Se agruparon alrededor de problemas.
          Agua. Seguridad. Escuelas.
        </NarratorBlock>
        <NarratorBlock>
          Demostraron que funciona. Una ciudad. Ahora la pregunta era: ¿puede escalar?
        </NarratorBlock>
      </CinematicChapter>

      {/* Chapter 3: La Circunscripción */}
      <CinematicChapter index={2}>
        <ChapterTitle
          number={3}
          title="La Circunscripción"
          subtitle="2032 — 2036"
          epigraph="No fue un partido. Fue una forma de vivir que se expandió."
        />
        <NarratorBlock>
          De un municipio a una provincia. El efecto red. Pero la política provincial
          tiene depredadores más grandes. Narcos, sindicatos, la vieja guardia.
        </NarratorBlock>
        <NarratorBlock>
          Necesitaban articular lo que querían. No eslóganes — sistemas. No promesas —
          diseños idealizados con métricas y caminos concretos.
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Tenían las ideas. Tenían el territorio. Ahora necesitaban ver cómo encajaba todo.
        </NarratorBlock>
      </CinematicChapter>

      {/* Chapter 4: La Cabecera de Puente */}
      <CinematicChapter index={3}>
        <ChapterTitle
          number={4}
          title="La Cabecera de Puente"
          subtitle="2036 — 2038"
          epigraph="Dieciséis planes. Un organismo vivo."
        />
        <NarratorBlock>
          Congreso Nacional. Bancas ganadas. El movimiento entró en la institución
          que estaba diseñado para transformar.
        </NarratorBlock>
        <NarratorBlock>
          16 planes. Cientos de dependencias. USD 283-526 mil millones. Un horizonte
          de 20 años. ¿Quién orquesta esto?
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Por primera vez, la nación vio su propio rediseño como un sistema interconectado.
        </NarratorBlock>
      </CinematicChapter>

      {/* Chapter 5: La Ejecución */}
      <CinematicChapter index={4}>
        <ChapterTitle
          number={5}
          title="La Ejecución"
          subtitle="2038 — 2040+"
          epigraph="La crisis llegó. Pero esta vez, el pueblo tenía un plan."
        />
        <NarratorBlock emphasis="strong">
          La crisis. Como siempre en Argentina — cíclica, estructural, inevitable.
          Pero esta vez: plataforma, asambleas, gobierno alternativo, organización.
          Todo construido. Todo probado.
        </NarratorBlock>
        <NarratorBlock>
          72 horas. Esa era la ventana. La Regla de la Ventana: desplegá lo que tenés.
          Un ¡BASTA! a medio construir es infinitamente mejor que ningún plan.
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Lo que pasó en Argentina entre 2026 y 2040 no tiene precedente. No porque
          fuera perfecto. Porque fue nuestro.
        </NarratorBlock>
      </CinematicChapter>
    </CinematicScroll>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/UnaRutaParaArgentina.tsx
git commit -m "feat: add UnaRutaParaArgentina page with 5 chapters and placeholder content"
```

---

### Task 16: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript check**

Run: `cd SocialJusticeHub && npm run check 2>&1 | tail -20`

Fix any type errors in cinematic-scroll or the page component.

- [ ] **Step 2: Run production build**

Run: `cd SocialJusticeHub && npm run build 2>&1 | tail -20`

Fix any build errors. Common issues:
- CSS import paths may need adjusting if Vite doesn't resolve them through the alias
- `lucide-react` ChevronDown import — verify it's available (it's already used elsewhere in the project)

- [ ] **Step 3: Start dev server and test in browser**

Run: `cd SocialJusticeHub && npm run dev`

Open `http://localhost:3001/una-ruta-para-argentina` in the browser.

**Verify:**
- [ ] Page loads with Chapter 1 visible (silver/grey palette)
- [ ] Site header is hidden (immersion mode)
- [ ] Back button ("← Volver") visible in top-left, fades after 3 seconds
- [ ] Chapter nav dots visible on right (desktop) or bottom (mobile)
- [ ] Scrolling down reveals narrator text blocks with fade-up animation
- [ ] Chapter title shows "CAPÍTULO UNO" + "La Semilla" centered
- [ ] Swiping/scrolling horizontally moves to Chapter 2
- [ ] Chapter 2 has warm earth tones (palette changes)
- [ ] Continue through all 5 chapters — each has distinct palette
- [ ] Arrow keys (Left/Right) navigate between chapters
- [ ] Clicking nav dots jumps to that chapter
- [ ] Clicking "← Volver" goes back
- [ ] Navigating away from the page restores the site header
- [ ] No scroll jank (check with DevTools Performance tab)
- [ ] Check mobile viewport (DevTools device toolbar): touch swipe works, nav dots at bottom

- [ ] **Step 4: Fix any issues found**

Address any bugs discovered during browser testing.

- [ ] **Step 5: Commit fixes (if any)**

```bash
git add -A
git commit -m "fix: resolve Pass 1 browser testing issues"
```

---

### Task 17: Final Pass 1 verification and commit

**Files:** None

- [ ] **Step 1: Run full verification suite**

Run: `cd SocialJusticeHub && npm run check && npm run check:routes && npm run build`

All three must pass.

- [ ] **Step 2: Verify file structure matches plan**

Run: `find cinematic-scroll -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.json" | sort`

Expected output:
```
cinematic-scroll/package.json
cinematic-scroll/src/blocks/ChapterTitle.tsx
cinematic-scroll/src/blocks/NarratorBlock.tsx
cinematic-scroll/src/engine/ChapterNav.tsx
cinematic-scroll/src/engine/CinematicChapter.tsx
cinematic-scroll/src/engine/CinematicScroll.tsx
cinematic-scroll/src/engine/ScrollProgressProvider.tsx
cinematic-scroll/src/engine/scroll-math.ts
cinematic-scroll/src/engine/useChapterNavigation.ts
cinematic-scroll/src/engine/useReveal.ts
cinematic-scroll/src/engine/useScrollProgress.ts
cinematic-scroll/src/index.ts
cinematic-scroll/src/styles/cinematic-scroll.css
cinematic-scroll/src/styles/reduced-motion.css
cinematic-scroll/src/styles/typography.css
cinematic-scroll/src/types.ts
```

- [ ] **Step 3: Confirm Pass 1 complete**

Pass 1 is done when:
- Horizontal scroll-snap works across Chrome, Safari, Firefox
- Vertical scroll within chapters works independently
- Mobile touch gestures work (horizontal swipe for chapters, vertical for content)
- Chapter nav dots indicate active chapter and navigate on click
- Arrow keys navigate between chapters
- Discrete palette changes per chapter (grey → warm → blue → green → iris)
- Narrator text reveals on scroll with fade-up
- Immersion mode hides/shows header
- No jank at 60fps
- TypeScript check passes
- Production build succeeds
