import { useCallback, useRef, useState } from 'react';

import { MapaBase } from '../MapaBase';

import type { ReactNode } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';

/**
 * La cortina — spec §7.1.
 *
 * Dos instancias de mapa, mismo encuadre, una recortada. La comparación tiene
 * que ocurrir en el ojo y no en la memoria: con un botón que alterna, uno se
 * acuerda del color, no de la diferencia. Ese es el criterio que descartó el
 * toggle.
 *
 * El mapa de arriba NO es interactivo y su contenedor no recibe puntero: el de
 * abajo maneja el arrastre por los dos y le pasa el encuadre en cada cuadro.
 * Con los dos interactivos habría que resolver el bucle de realimentación
 * entre ellos, y no hace falta.
 *
 * No se usa `maplibre-gl-compare`, que hace exactamente esto: no justifica
 * gastar una dependencia del cupo de 60 en cuarenta líneas.
 */
export function Cortina({
  izquierda,
  derecha,
  etiquetaIzquierda,
  etiquetaDerecha,
  mapaRef,
  onMover,
}: {
  izquierda: ReactNode;
  derecha: ReactNode;
  etiquetaIzquierda: string;
  etiquetaDerecha: string;
  mapaRef: React.RefObject<MapRef>;
  onMover?: (mapa: MapRef | null) => void;
}) {
  const [posicion, setPosicion] = useState(50);
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaArriba = useRef<MapRef>(null);

  /** El de arriba copia el encuadre del de abajo, cuadro a cuadro. */
  const seguir = useCallback((abajo: MapRef | null) => {
    const arriba = mapaArriba.current;
    if (!abajo || !arriba) return;
    arriba.jumpTo({
      center: abajo.getCenter(),
      zoom: abajo.getZoom(),
      bearing: abajo.getBearing(),
      pitch: abajo.getPitch(),
    });
  }, []);

  const moverA = useCallback((clienteX: number) => {
    const caja = contenedor.current?.getBoundingClientRect();
    if (!caja || caja.width === 0) return;
    const fraccion = ((clienteX - caja.left) / caja.width) * 100;
    setPosicion(Math.min(98, Math.max(2, fraccion)));
  }, []);

  return (
    <div ref={contenedor} className="relative h-full w-full overflow-hidden">
      <MapaBase
        mapaRef={mapaRef}
        onMoverContinuo={seguir}
        {...(onMover ? { onMover } : {})}
      >
        {izquierda}
      </MapaBase>

      {/* El lado de la voz, recortado desde la manija hacia la derecha. */}
      <div
        data-testid="cortina-derecha"
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${String(posicion)}%)` }}
      >
        <MapaBase mapaRef={mapaArriba} interactivo={false}>
          {derecha}
        </MapaBase>
      </div>

      <div
        data-testid="cortina-manija"
        role="slider"
        tabIndex={0}
        aria-label="Cortina entre el país medido y el país simulado"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(posicion)}
        aria-valuetext={`${String(Math.round(posicion))}% ${etiquetaIzquierda}`}
        className="absolute inset-y-0 z-20 -ml-3 w-6 cursor-ew-resize touch-none"
        style={{ left: `${String(posicion)}%` }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) moverA(e.clientX);
        }}
        onKeyDown={(e) => {
          const paso = e.shiftKey ? 10 : 2;
          if (e.key === 'ArrowLeft') setPosicion((p) => Math.max(2, p - paso));
          if (e.key === 'ArrowRight') setPosicion((p) => Math.min(98, p + paso));
        }}
      >
        <div className="bg-papel/80 absolute inset-y-0 left-1/2 w-px" />
        <div className="bg-papel absolute left-1/2 top-1/2 h-9 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </div>

      <div className="font-space text-oscuro-tenue pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-between px-4 text-[10px] uppercase tracking-[0.16em]">
        <span>{etiquetaIzquierda}</span>
        <span>{etiquetaDerecha}</span>
      </div>
    </div>
  );
}
