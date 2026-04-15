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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return { goToChapter, goNext, goPrev };
}
