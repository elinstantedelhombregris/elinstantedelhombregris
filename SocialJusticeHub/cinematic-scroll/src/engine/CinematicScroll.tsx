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

  // Apply discrete palette when chapter changes
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
