import { useCallback, useMemo, useState } from 'react';

import type { ProvinciaSvg } from '~/geo/pais.generated';

import { MAPA_ALTO, MAPA_ANCHO } from '~/geo/proyeccion.generated';

/**
 * Las altitudes del lienzo (spec 1 §4.1). Cada una es un régimen de dibujo,
 * no un nivel de zoom: cambia qué se dibuja, qué es la unidad interactiva, y
 * qué recorre el tabulador.
 *
 * `localidad` y `cuadra` están declaradas pero todavía no son alcanzables:
 * necesitan las capas de departamentos y manchas urbanas, que dependen de
 * datos externos (ver `scripts/build/data/README.md`). Se declaran acá para
 * que el resto del código ya sepa que existen y no haya que rehacerlo después.
 */
export type Altitud = 'pais' | 'provincia' | 'localidad' | 'cuadra';

export interface ViewBox {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

const VIEWBOX_PAIS: ViewBox = { x: 0, y: 0, ancho: MAPA_ANCHO, alto: MAPA_ALTO };

/** Aire alrededor de la provincia enfocada, en proporción a su lado mayor. */
const RESPIRO = 0.12;

/**
 * Encuadra la provincia respetando la relación de aspecto del lienzo. Sin esto
 * el SVG estira el contenido y las formas quedan deformadas al entrar.
 */
export function encuadrar(bbox: readonly [number, number, number, number]): ViewBox {
  const [minX, minY, maxX, maxY] = bbox;
  const anchoBbox = Math.max(maxX - minX, 1);
  const altoBbox = Math.max(maxY - minY, 1);
  const margen = Math.max(anchoBbox, altoBbox) * RESPIRO;

  const aspectoLienzo = MAPA_ANCHO / MAPA_ALTO;
  let ancho = anchoBbox + margen * 2;
  let alto = altoBbox + margen * 2;
  if (ancho / alto > aspectoLienzo) alto = ancho / aspectoLienzo;
  else ancho = alto * aspectoLienzo;

  return {
    x: (minX + maxX) / 2 - ancho / 2,
    y: (minY + maxY) / 2 - alto / 2,
    ancho,
    alto,
  };
}

export const aAtributo = (v: ViewBox): string =>
  `${String(v.x)} ${String(v.y)} ${String(v.ancho)} ${String(v.alto)}`;

export interface EstadoAltitud {
  altitud: Altitud;
  /** Provincia enfocada, o null en altitud país. */
  provincia: ProvinciaSvg | null;
  viewBox: ViewBox;
  entrarA: (provincia: ProvinciaSvg) => void;
  volver: () => void;
  /** Nivel de acercamiento respecto del país — para el aria-live y la escala. */
  escala: number;
}

export function useAltitud(): EstadoAltitud {
  const [provincia, setProvincia] = useState<ProvinciaSvg | null>(null);

  const viewBox = useMemo(
    () => (provincia ? encuadrar(provincia.bbox) : VIEWBOX_PAIS),
    [provincia],
  );

  const entrarA = useCallback((siguiente: ProvinciaSvg) => {
    setProvincia(siguiente);
  }, []);

  const volver = useCallback(() => {
    setProvincia(null);
  }, []);

  return {
    altitud: provincia ? 'provincia' : 'pais',
    provincia,
    viewBox,
    entrarA,
    volver,
    escala: MAPA_ANCHO / viewBox.ancho,
  };
}
