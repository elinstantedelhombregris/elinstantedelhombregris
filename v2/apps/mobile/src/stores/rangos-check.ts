/**
 * Chequeo de ascenso de rango (spec §3.3) — cáscara impura chiquita.
 * Compara el total ganado histórico contra el último rango ya celebrado
 * (persistido en settings); si hubo cruce, lo persiste, registra el unlock
 * y devuelve el rango nuevo para que la UI muestre el ascenso.
 *
 * Se llama al volver al Cielo y tras cada captura de expedición: como toda
 * ganancia de brasas pasa por una de esas dos puertas, ningún umbral se
 * cruza sin su celebración. La regla pura vive en src/game/rangos.
 */

import { brasasTotalGanado, getSetting, otorgarUnlock, setSetting } from '@/db/repos';
import { ascensoPendiente, rangoActual } from '@/game/rangos';
import type { Rango } from '@/game/types';

/** Setting con el nombre del último rango ya celebrado. */
export const CLAVE_ULTIMO_RANGO = 'ultimo_rango';

/**
 * Si el total ganado cruzó un umbral desde el último chequeo, devuelve el
 * rango nuevo (ya persistido). La primera vez siembra el rango vigente sin
 * celebrarlo: nadie asciende a Chispa — así se nace.
 */
export const chequearAscensoRango = (): Rango | null => {
  const total = brasasTotalGanado();
  const persistido = getSetting(CLAVE_ULTIMO_RANGO);
  if (persistido === null) {
    setSetting(CLAVE_ULTIMO_RANGO, rangoActual(total).nombre);
    return null;
  }
  const ascenso = ascensoPendiente(persistido, total);
  if (ascenso) {
    setSetting(CLAVE_ULTIMO_RANGO, ascenso.nombre);
    otorgarUnlock('rango', ascenso.nombre);
  }
  return ascenso;
};
