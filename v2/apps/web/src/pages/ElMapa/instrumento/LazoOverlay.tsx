import { useCallback, useEffect, useRef, useState } from 'react';

import type { GeoPoint } from '@v2/civic-core';

import { desproyectar } from '~/geo/proyeccion.generated';

/**
 * El lazo (spec 3 §3).
 *
 * Portado del `LassoOverlay` de v1, que ya tenía bien resueltos los detalles
 * que se descubren tarde: umbral de 3 px entre vértices para no guardar cientos
 * de puntos por centímetro, captura de puntero para que el trazo no se corte al
 * salir del elemento, Escape para cancelar, y una barra de instrucción que
 * funciona igual con mouse y con dedo.
 *
 * Lo que cambia respecto de v1: ahí la desproyección la hacía el viewport de
 * deck.gl. Acá la hace `desproyectar()` del módulo generado, y el polígono
 * resultante lo evalúa `pointInPolygon` de @v2/civic-core — el MISMO código
 * que corre en la app de campo. No se escribe un segundo lazo y turf no se
 * instala.
 */

interface PuntoPixel {
  x: number;
  y: number;
}

export interface LazoOverlayProps {
  /** viewBox actual del lienzo, para convertir píxeles de pantalla a unidades. */
  viewBox: { x: number; y: number; ancho: number; alto: number };
  /**
   * Cómo se pasa de un píxel del recuadro a un punto geográfico.
   *
   * Se inyecta en vez de importarse porque el lazo no tiene por qué saber qué
   * está dibujando abajo: con el lienzo SVG desproyecta con la inversa
   * precomputada, con maplibre lo hace `map.unproject()`. El trazo, el umbral,
   * el Escape y el polígono que sale son los mismos — y el polígono va al mismo
   * `selectTerritoryPoints` del núcleo en los dos casos.
   *
   * Por defecto, la del lienzo.
   */
  desproyectarPixel?: (xPixel: number, yPixel: number, rect: DOMRect) => GeoPoint;
  onCompletar: (poligono: GeoPoint[] | null) => void;
  onCancelar: () => void;
}

const UMBRAL_PX = 3;

/** La del lienzo SVG: píxel → unidad del viewBox → grados. */
const desproyectarLienzo =
  (viewBox: LazoOverlayProps['viewBox']) =>
  (xPixel: number, yPixel: number, rect: DOMRect): GeoPoint =>
    desproyectar(
      viewBox.x + xPixel * (viewBox.ancho / rect.width),
      viewBox.y + yPixel * (viewBox.alto / rect.height),
    );

export function LazoOverlay({
  viewBox,
  desproyectarPixel,
  onCompletar,
  onCancelar,
}: LazoOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dibujando, setDibujando] = useState(false);
  const [trazo, setTrazo] = useState<PuntoPixel[]>([]);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTrazo([]);
        setDibujando(false);
        onCancelar();
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => {
      window.removeEventListener('keydown', alTeclear);
    };
  }, [onCancelar]);

  const relativo = (e: React.PointerEvent<SVGSVGElement>): PuntoPixel | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const abajo = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTrazo([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setDibujando(true);
  }, []);

  const mover = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dibujando) return;
      const siguiente = relativo(e);
      if (!siguiente) return;
      setTrazo((previo) => {
        const ultimo = previo[previo.length - 1];
        if (ultimo && Math.hypot(siguiente.x - ultimo.x, siguiente.y - ultimo.y) < UMBRAL_PX) {
          return previo;
        }
        return [...previo, siguiente];
      });
    },
    [dibujando],
  );

  const arriba = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dibujando) return;
      setDibujando(false);
      (e.target as Element).releasePointerCapture(e.pointerId);

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect || trazo.length < 3) {
        setTrazo([]);
        onCompletar(null);
        return;
      }

      const aGeo = desproyectarPixel ?? desproyectarLienzo(viewBox);
      const poligono: GeoPoint[] = [];
      for (const punto of trazo) {
        const geo = aGeo(punto.x, punto.y, rect);
        if (Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) poligono.push(geo);
      }

      setTrazo([]);
      onCompletar(poligono.length >= 3 ? poligono : null);
    },
    [dibujando, trazo, viewBox, desproyectarPixel, onCompletar],
  );

  const d = trazo.length > 0 ? `M ${trazo.map((p) => `${String(p.x)} ${String(p.y)}`).join(' L ')}` : '';

  return (
    <>
      <svg
        ref={svgRef}
        role="presentation"
        aria-label="Área de dibujo del lazo"
        onPointerDown={abajo}
        onPointerMove={mover}
        onPointerUp={arriba}
        onPointerCancel={(e) => {
          setDibujando(false);
          setTrazo([]);
          onCancelar();
          (e.target as Element).releasePointerCapture(e.pointerId);
        }}
        className="absolute inset-0 z-20 h-full w-full cursor-crosshair touch-none"
      >
        {d ? (
          <path
            d={dibujando ? d : `${d} Z`}
            className="fill-violeta/20 stroke-violeta"
            fill={dibujando ? 'none' : undefined}
            strokeWidth={2}
          />
        ) : null}
      </svg>

      <div
        role="status"
        aria-live="polite"
        className="bg-tinta text-papel font-space absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.1em]"
      >
        <span>Dibujá el área para seleccionarla</span>
        <button
          type="button"
          onClick={() => {
            setTrazo([]);
            onCancelar();
          }}
          className="focus-visible:ring-violeta border border-white/20 px-2 py-0.5 outline-none focus-visible:ring-2"
        >
          Cancelar (Esc)
        </button>
      </div>
    </>
  );
}
