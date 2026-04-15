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
