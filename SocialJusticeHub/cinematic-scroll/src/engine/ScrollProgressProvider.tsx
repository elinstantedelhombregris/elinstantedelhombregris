import React, { createContext, useState, useMemo } from 'react';
import type { InterpolatedPalette, ScrollState } from '../types';

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
