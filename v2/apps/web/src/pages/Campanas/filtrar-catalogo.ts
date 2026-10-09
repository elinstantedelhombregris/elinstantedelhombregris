import { SLUG_CAMPANA_NACIONAL, estadoCampanaSchema } from '@v2/shared';

import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';
import type { CampanaPublica } from '@v2/shared';

export type CampanaCatalogo = Pick<
  CampanaPublica,
  'id' | 'slug' | 'revision' | 'estado' | 'contrato' | 'actualizadaEn'
>;
export function filtrarCatalogo(
  campanas: CampanaCatalogo[],
  filtros: URLSearchParams,
  lugar?: LugarMapa,
) {
  const tema = filtros.get('tema')?.trim().toLocaleLowerCase('es');
  const fase = estadoCampanaSchema.safeParse(filtros.get('fase'));
  const territorio = Number(filtros.get('territorio'));
  return campanas.filter(
    (c) =>
      (!tema || c.contrato.temas.some((t) => t.trim().toLocaleLowerCase('es') === tema)) &&
      (!fase.success || c.estado === fase.data) &&
      (!(Number.isSafeInteger(territorio) && territorio > 0) ||
        !c.contrato.territorios.length ||
        c.contrato.territorios.includes(territorio) ||
        (lugar && c.contrato.territorios.includes(lugar.provinceId))),
  );
}
/**
 * El orden del catálogo: la campaña nacional primero, después las abiertas y al final el resto.
 * Dentro de cada grupo queda el orden que trajo el servidor.
 */
export function ordenarCatalogo<T extends Pick<CampanaCatalogo, 'slug' | 'estado'>>(
  campanas: readonly T[],
): T[] {
  const rango = (c: T) => (c.slug === SLUG_CAMPANA_NACIONAL ? 0 : c.estado === 'abierta' ? 1 : 2);
  return campanas
    .map((campana, posicion) => ({ campana, posicion }))
    .sort((a, b) => rango(a.campana) - rango(b.campana) || a.posicion - b.posicion)
    .map(({ campana }) => campana);
}
