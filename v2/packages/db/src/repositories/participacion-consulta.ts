import { and, eq, gte, lte, sql } from 'drizzle-orm';

import { campanas } from '../schema/campanas.js';
import { geographicLocations } from '../schema/geographic.js';
import { senales } from '../schema/senales.js';

import type { ConsultaParticipacion, ContratoCampana, EstadoCampana } from '@v2/shared';
import type { SQL } from 'drizzle-orm';

/** Alcance compartido de lectura: nunca se calcula a partir del dibujo. */
export function condicionesParticipacion(q: Partial<ConsultaParticipacion>, corte?: Date): SQL[] {
  const c: SQL[] = [sql`${senales.retenidaEn} is null`, sql`${senales.estado}<>'retirada'`];
  if (corte) c.push(lte(senales.creadaEn, corte));
  if (q.territorio)
    c.push(
      sql`(${senales.provinceId}=${q.territorio} or ${senales.cityId}=${q.territorio} or ${senales.departmentId}=${q.territorio} or ${senales.cityId} in (select ${geographicLocations.id} from ${geographicLocations} where ${geographicLocations.municipalityId}=${q.territorio} or ${geographicLocations.parentId}=${q.territorio}))`,
    );
  if (q.tema) c.push(eq(senales.tema, q.tema));
  if (q.tipo) c.push(eq(senales.tipo, q.tipo));
  if (q.estado) c.push(eq(senales.estado, q.estado));
  if (q.desde) c.push(gte(senales.creadaEn, new Date(q.desde)));
  if (q.hasta) c.push(lte(senales.creadaEn, new Date(q.hasta)));
  if (q.campana)
    c.push(
      sql`exists(select 1 from contribuciones c where c.senal_id=${senales.idPublico} and c.campana_id=${q.campana}::uuid ${q.edicion ? sql`and c.edicion=${q.edicion}` : sql``})`,
    );
  return c;
}
export function alcanceParticipacion(q: Partial<ConsultaParticipacion>) {
  const resultado = and(...condicionesParticipacion(q));
  if (!resultado) throw new Error('El alcance público requiere condiciones.');
  return resultado;
}

// Una edición en preparación no borra el contrato que ya fue publicado.
export const campanaPublicada = sql`(${campanas.estado}<>'borrador' or exists(select 1 from campana_ediciones h where h.campana_id=${sql.raw('"campanas"."id"')} and h.estado<>'borrador'))`;
export const contratoPublicoCampana = sql<ContratoCampana>`case when ${campanas.estado}='borrador' then (select h.contrato from campana_ediciones h where h.campana_id=${sql.raw('"campanas"."id"')} and h.estado<>'borrador' order by revision desc limit 1) else ${campanas.contrato} end`;
export const revisionPublicaCampana = sql<number>`case when ${campanas.estado}='borrador' then (select h.revision from campana_ediciones h where h.campana_id=${sql.raw('"campanas"."id"')} and h.estado<>'borrador' order by revision desc limit 1) else ${campanas.revision} end`;
export const estadoPublicoCampana = sql<EstadoCampana>`case when ${campanas.estado}='borrador' then 'pausada' else ${campanas.estado} end`;
