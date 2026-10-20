import { SLUG_CAMPANA_NACIONAL, estadoCampanaSchema } from '@v2/shared';

import { juntaGente } from './impulso';

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
const quiereAbrir = (c: Pick<CampanaCatalogo, 'estado'>) => juntaGente(c.estado);
/**
 * El orden del catálogo: la campaña nacional primero, después las abiertas, después el resto y
 * al final las que todavía quieren abrir. Dentro de cada grupo queda el orden del servidor.
 */
export function ordenarCatalogo<T extends Pick<CampanaCatalogo, 'slug' | 'estado'>>(
  campanas: readonly T[],
): T[] {
  const rango = (c: T) =>
    c.slug === SLUG_CAMPANA_NACIONAL ? 0 : c.estado === 'abierta' ? 1 : quiereAbrir(c) ? 3 : 2;
  return campanas
    .map((campana, posicion) => ({ campana, posicion }))
    .sort((a, b) => rango(a.campana) - rango(b.campana) || a.posicion - b.posicion)
    .map(({ campana }) => campana);
}
/**
 * Las que quieren abrir van en su propia sección, «Quieren abrir», después del catálogo (§11).
 * Cada grupo conserva el orden que recibe.
 */
export function separarQuierenAbrir<T extends Pick<CampanaCatalogo, 'estado'>>(
  campanas: readonly T[],
): { catalogo: T[]; quierenAbrir: T[] } {
  return {
    catalogo: campanas.filter((c) => !quiereAbrir(c)),
    quierenAbrir: campanas.filter(quiereAbrir),
  };
}
