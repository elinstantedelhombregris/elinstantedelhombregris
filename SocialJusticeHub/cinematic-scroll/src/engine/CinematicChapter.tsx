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
