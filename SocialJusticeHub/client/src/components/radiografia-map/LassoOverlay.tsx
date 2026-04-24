import { useCallback, useRef, useState } from 'react';
import type { LassoPolygon } from './types';

interface Point {
  x: number;
  y: number;
}

interface Viewport {
  unproject(pixel: [number, number]): [number, number, number] | [number, number];
}

interface LassoOverlayProps {
  getViewport: () => Viewport | null;
  onComplete: (polygon: LassoPolygon | null) => void;
  onCancel: () => void;
}

const STROKE = '#7D5BDE';
const FILL = 'rgba(125, 91, 222, 0.18)';

export default function LassoOverlay({ getViewport, onComplete, onCancel }: LassoOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [path, setPath] = useState<Point[]>([]);

  const handleDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const rect = svgRef.current!.getBoundingClientRect();
    setPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setDrawing(true);
  }, []);

  const handleMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!drawing) return;
      const rect = svgRef.current!.getBoundingClientRect();
      const next: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setPath((p) => {
        // Throttle: only add if moved at least 3 px
        const last = p[p.length - 1];
        if (last && Math.hypot(next.x - last.x, next.y - last.y) < 3) return p;
        return [...p, next];
      });
    },
    [drawing],
  );

  const handleUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!drawing) return;
      setDrawing(false);
      (e.target as Element).releasePointerCapture?.(e.pointerId);

      if (path.length < 3) {
        setPath([]);
        onComplete(null);
        return;
      }

      const viewport = getViewport();
      if (!viewport) {
        setPath([]);
        onComplete(null);
        return;
      }

      const coords: [number, number][] = [];
      for (const p of path) {
        try {
          const world = viewport.unproject([p.x, p.y]);
          const lng = world[0];
          const lat = world[1];
          if (Number.isFinite(lng) && Number.isFinite(lat)) coords.push([lng, lat]);
        } catch {
          // skip invalid vertex
        }
      }
      if (coords.length < 3) {
        setPath([]);
        onComplete(null);
        return;
      }

      setPath([]);
      onComplete({ coordinates: coords });
    },
    [drawing, path, getViewport, onComplete],
  );

  const d = path.length > 0 ? 'M ' + path.map((p) => `${p.x} ${p.y}`).join(' L ') : '';

  return (
    <>
      <svg
        ref={svgRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={(e) => {
          setDrawing(false);
          setPath([]);
          onCancel();
          (e.target as Element).releasePointerCapture?.(e.pointerId);
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          touchAction: 'none',
          zIndex: 20,
        }}
      >
        {d && <path d={d + (drawing ? '' : ' Z')} fill={drawing ? 'none' : FILL} stroke={STROKE} strokeWidth={2} />}
      </svg>

      {/* Mobile-friendly instruction / cancel bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 21,
          background: 'rgba(10,10,20,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 999,
          padding: '8px 14px',
          color: '#e2e8f0',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'auto',
        }}
      >
        <span>Dibujá el área con el dedo</span>
        <button
          onClick={() => {
            setPath([]);
            onCancel();
          }}
          style={{
            color: '#94a3b8',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 999,
            padding: '2px 10px',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </>
  );
}
