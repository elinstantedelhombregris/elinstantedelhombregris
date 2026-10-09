import { createHash } from 'node:crypto';

import { and, eq, sql } from 'drizzle-orm';

import { contribuciones } from '../schema/campanas.js';
import { senales } from '../schema/senales.js';

import type { Db } from '../client.js';
import type { ResultadoDeIngesta } from './senales.js';
import type { NewSenal } from '../schema/senales.js';
import type { ContribucionInput } from '@v2/shared';

/** El lote Neon hace atómicos la señal y su contexto autorizado. */
export class ContribucionesRepository {
  constructor(private readonly db: Db) {}
  async propietarioDeReintento(
    entrada: ContribucionInput,
    uid: number | undefined,
    navegador: number | null,
  ) {
    const [p] = await this.db
      .select({ actorId: senales.actorId, userId: senales.userId, id: senales.idPublico })
      .from(senales)
      .where(and(eq(senales.origen, 'web'), eq(senales.idLocal, entrada.senal.idLocal)))
      .limit(1);
    if (!p) return null;
    if (
      !(p.userId !== null && p.userId === uid) &&
      !(p.userId === null && navegador !== null && p.actorId === navegador)
    )
      throw new Error('AUTORIA_AJENA');
    const [c] = await this.db
      .select({ huella: contribuciones.huella })
      .from(contribuciones)
      .where(eq(contribuciones.senalId, p.id));
    if (c?.huella !== createHash('sha256').update(JSON.stringify(entrada)).digest('hex'))
      throw new Error('REINTENTO_DISTINTO');
    return p;
  }
  async crear(fila: NewSenal, entrada: ContribucionInput): Promise<ResultadoDeIngesta> {
    const huella = createHash('sha256').update(JSON.stringify(entrada)).digest('hex');
    const previo = await this.db
      .select({
        id: senales.idPublico,
        estado: senales.estado,
        actorId: senales.actorId,
        userId: senales.userId,
      })
      .from(senales)
      .where(and(eq(senales.origen, fila.origen), eq(senales.idLocal, fila.idLocal)))
      .limit(1);
    if (
      previo[0] &&
      (previo[0].userId !== (fila.userId ?? null) ||
        (fila.userId == null && previo[0].actorId !== (fila.actorId ?? null)))
    )
      throw new Error('AUTORIA_AJENA');
    if (previo[0]) {
      const [guardada] = await this.db
        .select({ huella: contribuciones.huella })
        .from(contribuciones)
        .where(eq(contribuciones.senalId, previo[0].id));
      if (guardada?.huella !== huella) throw new Error('REINTENTO_DISTINTO');
      return { idPublico: previo[0].id, estado: previo[0].estado, yaExistia: true };
    }
    const [nuevas] = await this.db.batch([
      this.db
        .insert(senales)
        .values(fila)
        .onConflictDoNothing({ target: [senales.origen, senales.idLocal] })
        .returning({ idPublico: senales.idPublico, estado: senales.estado }),
      this.db
        .execute(sql`insert into ${contribuciones}(senal_id,campana_id,edicion,fragmentos,huella,modo)
        select id_publico,
          ${entrada.campanaId === null ? sql`null::uuid` : sql`case when exists(select 1 from campanas where id=${entrada.campanaId}::uuid and estado='abierta' and revision=${entrada.edicion}) then ${entrada.campanaId}::uuid else null::uuid end`},
          ${entrada.edicion},${JSON.stringify(entrada.fragmentos)}::jsonb,${huella},${entrada.modo}
        from ${senales} where origen=${fila.origen} and id_local=${fila.idLocal}::uuid
          and user_id is not distinct from ${fila.userId ?? null} and actor_id is not distinct from ${fila.actorId ?? null}
        on conflict(senal_id) do nothing`),
    ]);
    if (nuevas[0]) return { ...nuevas[0], yaExistia: false };
    const [existente] = await this.db
      .select({
        idPublico: senales.idPublico,
        estado: senales.estado,
        actorId: senales.actorId,
        userId: senales.userId,
      })
      .from(senales)
      .where(and(eq(senales.origen, fila.origen), eq(senales.idLocal, fila.idLocal)))
      .limit(1);
    if (
      !existente ||
      (fila.userId == null && existente.actorId !== (fila.actorId ?? null)) ||
      existente.userId !== (fila.userId ?? null)
    )
      throw new Error('AUTORIA_AJENA');
    const [guardada] = await this.db
      .select({ huella: contribuciones.huella })
      .from(contribuciones)
      .where(eq(contribuciones.senalId, existente.idPublico));
    if (guardada?.huella !== huella) throw new Error('REINTENTO_DISTINTO');
    return { idPublico: existente.idPublico, estado: existente.estado, yaExistia: true };
  }
  async contexto(id: string) {
    const [fila] = await this.db
      .select({
        campanaId: contribuciones.campanaId,
        edicion: contribuciones.edicion,
        modo: contribuciones.modo,
        fragmentos: sql<
          ContribucionInput['fragmentos']
        >`case when ${senales.cesionLicencia} and ${senales.estado}<>'retirada' and ${senales.retenidaEn} is null then ${contribuciones.fragmentos} else '[]'::jsonb end`,
      })
      .from(contribuciones)
      .innerJoin(senales, eq(senales.idPublico, contribuciones.senalId))
      .where(eq(contribuciones.senalId, id));
    return fila ?? null;
  }
}
