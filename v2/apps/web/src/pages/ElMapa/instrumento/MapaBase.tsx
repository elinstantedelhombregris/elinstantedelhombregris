import { useCallback, useRef, type ReactNode } from 'react';
import { Map as MapaGL, NavigationControl, ScaleControl, type MapRef } from 'react-map-gl/maplibre';

import { FONDO } from './paleta';

import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * El mapa base — oscuro, a pantalla completa, siempre el mismo.
 *
 * Todos los modos dibujan encima de ESTA instancia: cambiar de modo no
 * remonta el mapa ni pierde el encuadre. Es la diferencia entre pestañas de un
 * instrumento y páginas distintas que casualmente tienen un mapa.
 */

const VISTA_INICIAL = { longitude: -63.6, latitude: -38.4, zoom: 3.7 };
const ESTILO = '/maps/oscuro.json';

export interface MapaBaseProps {
  children?: ReactNode;
  /** Se llama al terminar cada movimiento, con el mapa ya quieto. */
  onMover?: (mapa: MapRef | null) => void;
  /** Mientras se dibuja un área, arrastrar traza en vez de mover el mapa. */
  arrastreHabilitado?: boolean;
  /** Se le pasa hacia arriba para que el lazo pueda desproyectar. */
  mapaRef?: React.RefObject<MapRef>;
  onClickCapa?: (idCapa: string, propiedades: Record<string, unknown>) => void;
  /** Capas sobre las que el click devuelve propiedades. */
  capasInteractivas?: string[];
  /**
   * Se llama en CADA cuadro del movimiento, no solo al final. Lo usa la
   * cortina de la Simulación: el mapa de arriba tiene que seguir al de abajo
   * mientras se arrastra, no después.
   */
  onMoverContinuo?: (mapa: MapRef | null) => void;
  /**
   * `false` apaga toda la interacción y los controles. El mapa de arriba de la
   * cortina no se toca: el de abajo maneja el arrastre por los dos.
   */
  interactivo?: boolean;
}

export function MapaBase({
  children,
  onMover,
  arrastreHabilitado = true,
  mapaRef,
  onClickCapa,
  capasInteractivas = [],
  onMoverContinuo,
  interactivo = true,
}: MapaBaseProps) {
  const propio = useRef<MapRef>(null);
  const ref = mapaRef ?? propio;

  const alTerminarMovimiento = useCallback(() => {
    onMover?.(ref.current);
  }, [onMover, ref]);

  return (
    <MapaGL
      ref={ref}
      initialViewState={VISTA_INICIAL}
      mapStyle={ESTILO}
      dragPan={arrastreHabilitado}
      dragRotate={false}
      touchZoomRotate={arrastreHabilitado}
      onLoad={alTerminarMovimiento}
      onMoveEnd={alTerminarMovimiento}
      {...(onMoverContinuo
        ? {
            onMove: () => {
              onMoverContinuo(ref.current);
            },
          }
        : {})}
      interactive={interactivo}
      interactiveLayerIds={capasInteractivas}
      onClick={(e) => {
        const rasgo = e.features?.[0];
        if (rasgo?.layer.id && onClickCapa) {
          onClickCapa(rasgo.layer.id, rasgo.properties);
        }
      }}
      style={{ width: '100%', height: '100%', background: FONDO }}
      attributionControl={false}
    >
      {/* Abajo a la derecha, como en cualquier mapa: el zoom donde se lo busca.
          El mapa de arriba de la cortina no los lleva: serían dos juegos de
          controles superpuestos sobre el mismo encuadre. */}
      {interactivo ? (
        <>
          <NavigationControl position="bottom-right" showCompass={false} />
          <ScaleControl position="bottom-left" maxWidth={110} unit="metric" />
        </>
      ) : null}
      {children}
    </MapaGL>
  );
}
