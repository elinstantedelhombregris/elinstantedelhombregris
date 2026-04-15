import { useRef, useState, useEffect } from 'react';
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

  const isReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
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
