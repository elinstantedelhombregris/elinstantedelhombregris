/**
 * El encuadre de siempre: centro del país y un zoom fijo. Con 3,7 el norte
 * (Jujuy, Salta) y el sur (Tierra del Fuego) quedaban cortados en el escritorio
 * y en el teléfono, y el Atlántico ocupaba el centro (revisión del 9/10).
 * Sigue en uso cuando la dirección ya trae un lugar (`?lugar=`): ahí no se
 * pelea con la elección de quien llegó con un enlace.
 */
export const VISTA_PREVIA = { longitude: -63.6, latitude: -38.4, zoom: 3.7 } as const;

/**
 * La Argentina entera, continental y fueguina: oeste, sur, este, norte. Sin el
 * sector antártico ni las islas del Atlántico Sur, que dejarían el país chico.
 */
export const LIMITES_ARGENTINA: [[number, number], [number, number]] = [
  [-73.6, -55.1],
  [-53.6, -21.8],
];

/**
 * Los márgenes del encuadre al país. El de abajo es el más grande a propósito:
 * ahí van los controles de zoom, la escala y la leyenda de cada modo.
 */
const MARGENES_DEL_ENCUADRE = { top: 28, right: 20, bottom: 56, left: 20 } as const;

/**
 * Con lugar elegido en la dirección, el encuadre previo; sin lugar, se ajusta a
 * los límites del país con margen para que se vea de punta a punta, en el ancho
 * del escritorio y en el del teléfono.
 */
export function vistaInicial(conLugar: boolean) {
  return conLugar
    ? { ...VISTA_PREVIA }
    : {
        bounds: LIMITES_ARGENTINA,
        fitBoundsOptions: { padding: { ...MARGENES_DEL_ENCUADRE } },
      };
}
