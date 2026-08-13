import { addProtocol } from 'maplibre-gl';
import { Protocol } from 'pmtiles';

/**
 * El protocolo `pmtiles://` — lo que hace que las teselas salgan de casa.
 *
 * Un `.pmtiles` es UN archivo estático con el país entero adentro. No hay
 * servidor de teselas: el navegador pide «los bytes N a M de
 * /tiles/argentina.pmtiles» y adentro viene la tesela. Quien traduce
 * `pmtiles://…/{z}/{x}/{y}` a ese rango de bytes es este protocolo.
 *
 * **Se registra ANTES de montar el mapa, y no es un detalle.** `addProtocol`
 * es global: vive en el módulo de maplibre, no en la instancia. Si el mapa se
 * monta primero, el estilo carga bien, la fuente no resuelve, y queda un mapa
 * vacío sin error visible — el mismo modo de falla que ya nos costó los glyphs
 * dos veces. Por eso la llamada va en el cuerpo del módulo de `MapaBase`, que
 * se evalúa antes de que el componente exista.
 *
 * La guarda evita registrarlo de nuevo si el módulo se re-evalúa (HMR): volver
 * a llamar `addProtocol` con el mismo nombre pisa el anterior y deja las
 * teselas ya en vuelo colgadas de un handler huérfano.
 */
let registrado = false;

export function registrarProtocoloPmtiles(): void {
  if (registrado) return;
  registrado = true;
  addProtocol('pmtiles', new Protocol().tile);
}
