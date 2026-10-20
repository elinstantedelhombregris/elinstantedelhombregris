import { esRegion, REGION_CON_ARTICULO } from '@v2/civic-core';

import type { ResultadoOpinion, ValorDeOpinion } from '@v2/shared';

export interface AvisoDeRespuesta extends ResultadoOpinion {
  valor: ValorDeOpinion;
}

const cuantas = (n: number) =>
  n === 1 ? 'una persona más' : `${n.toLocaleString('es-AR')} personas más`;

/**
 * Lo que se lee después de responder, nunca antes (spec §4, «Lo que se ve y lo que
 * no»). Que la región ya cuente le gana a todo; con «Paso» no se dice nada.
 */
export function fraseDeAviso(a: AvisoDeRespuesta): string | null {
  if (a.valor === 'paso') return null;
  if (a.regionCompleta) {
    const region = a.regionCompleta.region;
    const nombre = esRegion(region) ? REGION_CON_ARTICULO[region] : region;
    return `Con tu respuesta, ${nombre} ya cuenta en este aporte.`;
  }
  if (a.coinciden === null) return null;
  if (a.coinciden === 0) return 'Sos de los primeros en verlo.';
  return a.valor === 'acuerdo'
    ? `Vos y ${cuantas(a.coinciden)}.`
    : `Vos y ${cuantas(a.coinciden)} dijeron que no.`;
}
