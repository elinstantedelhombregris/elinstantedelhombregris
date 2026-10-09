import { estadoCampanaSchema } from '@v2/shared';

import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';
import type { CampanaPublica } from '@v2/shared';

export type CampanaCatalogo = Pick<CampanaPublica, 'id' | 'slug' | 'revision' | 'estado' | 'contrato' | 'actualizadaEn'>;
export function filtrarCatalogo(campanas: CampanaCatalogo[], filtros: URLSearchParams, lugar?: LugarMapa) {
  const tema = filtros.get('tema')?.trim().toLocaleLowerCase('es');
  const fase = estadoCampanaSchema.safeParse(filtros.get('fase'));
  const territorio = Number(filtros.get('territorio'));
  return campanas.filter((c) => (
    (!tema || c.contrato.temas.some((t) => t.trim().toLocaleLowerCase('es') === tema)) &&
    (!fase.success || c.estado === fase.data) &&
    (!(Number.isSafeInteger(territorio) && territorio > 0) || !c.contrato.territorios.length || c.contrato.territorios.includes(territorio) || (lugar && c.contrato.territorios.includes(lugar.provinceId)))
  ));
}
