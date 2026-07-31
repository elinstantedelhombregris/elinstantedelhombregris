import type { Recuadro, SenalConTipo } from '../useVistaMapa';
import type { ReactNode } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';

/**
 * El contrato de un modo.
 *
 * Un modo NO es una página: es un conjunto de capas y controles sobre LA MISMA
 * instancia de mapa. Por eso devuelve nodos en vez de renderizar su propio
 * mapa — cambiar de modo no remonta nada ni pierde el encuadre, que es
 * exactamente lo que hace que se sienta un instrumento y no un sitio con
 * varias páginas que casualmente tienen mapas.
 */
export interface ContextoModo {
  /** Las señales que caen en el encuadre actual, con su tipo ya resuelto. */
  senales: readonly SenalConTipo[];
  /** Todas las traídas, sin recortar por viewport. */
  todas: readonly SenalConTipo[];
  mapaRef: React.RefObject<MapRef>;
  /** El encuadre actual, para los modos que miden sobre lo que se está viendo. */
  recuadro: Recuadro | null;
  cargando: boolean;
}

export interface ResultadoModo {
  titulo: string;
  descripcion: string;
  /** Controles del panel lateral. */
  panel: ReactNode;
  /** Capas maplibre — van adentro del `<Map>`. */
  capas: ReactNode;
  /** Lo que se dibuja ENCIMA del mapa (overlays de dibujo, scrubbers). */
  sobreMapa?: ReactNode;
  /** Leyenda flotante abajo a la izquierda. */
  leyenda?: ReactNode;
  /** `false` mientras una herramienta necesita el arrastre para sí. */
  arrastreHabilitado?: boolean;
  /** Capas que responden al click. */
  capasInteractivas?: string[];
  onClickCapa?: (idCapa: string, propiedades: Record<string, unknown>) => void;
}
