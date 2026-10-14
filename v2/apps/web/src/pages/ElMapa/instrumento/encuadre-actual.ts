import type { Recuadro } from './useVistaMapa';
import type { MapRef } from 'react-map-gl/maplibre';

/**
 * El encuadre para adjuntar a una falta, leído del mapa **en el momento de
 * abrir el panel**.
 *
 * `recuadro` sale del estado de `useVistaMapa()`, que se llena desde
 * `onLoad`/`onMoveEnd` de MapaBase — y verificado en el navegador, con el mapa
 * dibujado y sin haberlo arrastrado nunca, sigue en `null`. O sea que quien
 * abre el mapa, ve algo que no le gusta y toca el botón sin mover nada
 * —exactamente el caso más común— mandaba su falta sin encuadre, que es lo
 * único que esta boca prometía adjuntar.
 *
 * Preguntarle al mapa directamente no tiene ese agujero: si hay instancia, hay
 * límites. El `recuadro` queda como respaldo para cuando la instancia todavía
 * no exista.
 */
export function encuadreAhora(
  mapa: MapRef | null,
  respaldo: Recuadro | null,
): { encuadre: Recuadro } | undefined {
  const limites = mapa?.getBounds();
  if (limites) {
    return {
      encuadre: {
        oeste: limites.getWest(),
        sur: limites.getSouth(),
        este: limites.getEast(),
        norte: limites.getNorth(),
      },
    };
  }
  return respaldo ? { encuadre: respaldo } : undefined;
}
