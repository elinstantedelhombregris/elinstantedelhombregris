import { useEffect, useRef, useState } from 'react';

import type { Instante } from './instantes';
import type { createPortraitRenderer } from './portrait-renderer';

const assembly = (time: number) => {
  const p = Math.max(0, Math.min(1, (time - 0.05) / 2.05));
  return p * p * (3 - 2 * p);
};

export function useRetrato(instante: Instante, paused: boolean) {
  const figure = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const [ready, setReady] = useState(false);
  const [quieto, setQuieto] = useState(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const host = figure.current,
      poster = image.current,
      surface = canvas.current;
    if (!host || !poster || !surface) return;
    let renderer: ReturnType<typeof createPortraitRenderer> | null = null;
    const lifecycle = new AbortController();
    let frame = 0,
      time = 0,
      previous = performance.now();
    let visible = true;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = preference.matches;
    setReady(false);
    setQuieto(reduced);

    function draw() {
      renderer?.render({
        time: reduced ? 7 : time,
        assembly: reduced ? 1 : assembly(time),
        exit: 0,
        motion: reduced ? 0 : 0.28,
        pointer: { x: 0, y: 0 },
        size: instante.size,
        paper: instante.layout !== 'contratapa',
        reduced,
      });
    }
    function resize() {
      if (!host || !poster) return;
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const v = instante.framing;
      const portraitHeight =
        instante.layout === 'retrato'
          ? width <= 560
            ? 440 + v * 150
            : 560 + v * 240
          : height *
            (width <= 360
              ? 1.65 + v * 0.5
              : instante.layout === 'contratapa'
                ? 1.35 + v * 0.45
                : 1.2 + v * 0.6);
      const box = {
        x: (width - (portraitHeight * 2) / 3) / 2 + (v - 0.5) * 8,
        y: instante.layout === 'retrato' ? 4 : 12,
        w: (portraitHeight * 2) / 3,
        h: portraitHeight,
      };
      Object.assign(poster.style, {
        width: `${box.w}px`,
        height: `${box.h}px`,
        left: `${box.x}px`,
        top: `${box.y}px`,
      });
      renderer?.resize(width, height, box, Math.min(devicePixelRatio || 1, 1.4));
      draw();
    }
    function tick() {
      if (lifecycle.signal.aborted) return;
      const now = performance.now();
      if (visible && !document.hidden && !pausedRef.current) {
        time += (now - previous) / 1000;
        draw();
      }
      previous = now;
      if (!reduced) frame = requestAnimationFrame(tick);
    }
    function input(event: PointerEvent) {
      if (!host || !renderer || reduced || pausedRef.current || document.hidden) return;
      const bounds = host.getBoundingClientRect();
      renderer.interact(
        event.clientX - bounds.left,
        event.clientY - bounds.top,
        time + (performance.now() - previous) / 1000,
        event.type === 'pointerdown' ? 0.95 : 0.65,
      );
    }
    const end = () => renderer?.endInteraction();
    const visibility = () => {
      previous = performance.now();
    };
    const changePreference = () => {
      reduced = preference.matches;
      setQuieto(reduced);
      renderer?.clearInteractions();
      cancelAnimationFrame(frame);
      previous = performance.now();
      draw();
      if (!reduced) frame = requestAnimationFrame(tick);
    };
    const lost = (event: Event) => {
      event.preventDefault();
      if (!lifecycle.signal.aborted) {
        cancelAnimationFrame(frame);
        setReady(false);
      }
    };
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(host);
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      previous = performance.now();
    });
    viewObserver.observe(host);
    host.addEventListener('pointermove', input, { passive: true });
    host.addEventListener('pointerdown', input, { passive: true });
    host.addEventListener('pointerleave', end);
    host.addEventListener('pointercancel', end);
    surface.addEventListener('webglcontextlost', lost);
    preference.addEventListener('change', changePreference);
    document.addEventListener('visibilitychange', visibility);
    resize();
    void (async () => {
      try {
        await poster.decode();
        lifecycle.signal.throwIfAborted();
        const module = await import('./portrait-renderer');
        lifecycle.signal.throwIfAborted();
        renderer = module.createPortraitRenderer({ canvas: surface, image: poster });
        resize();
        setReady(true);
        previous = performance.now();
        if (!reduced) frame = requestAnimationFrame(tick);
      } catch {
        renderer?.dispose();
        renderer = null;
        if (!lifecycle.signal.aborted) setReady(false);
      }
    })();
    return () => {
      lifecycle.abort();
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      preference.removeEventListener('change', changePreference);
      document.removeEventListener('visibilitychange', visibility);
      host.removeEventListener('pointermove', input);
      host.removeEventListener('pointerdown', input);
      host.removeEventListener('pointerleave', end);
      host.removeEventListener('pointercancel', end);
      surface.removeEventListener('webglcontextlost', lost);
      renderer?.dispose();
    };
  }, [instante]);
  return { figure, image, canvas, ready, quieto };
}
