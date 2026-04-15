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
