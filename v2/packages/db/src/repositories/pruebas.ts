import { createHash } from 'node:crypto';

import { and, eq, sql } from 'drizzle-orm';

import { fichaAlternativas, pruebasTerritoriales } from '../schema/diseno.js';

import type { Db } from '../client.js';
import type { propuestaPruebaSchema, avanzarPruebaSchema } from '@v2/shared';
import type { z } from 'zod';

export class PruebasRepository {
  constructor(private readonly db: Db) {}
  async proponer(uid: number, v: z.infer<typeof propuestaPruebaSchema>) {
    const [a] = await this.db
      .select({ id: fichaAlternativas.id })
      .from(fichaAlternativas)
      .where(eq(fichaAlternativas.id, v.alternativaId));
    if (!a) return null;
    const [r] = await this.db
      .insert(pruebasTerritoriales)
      .values({
        creadorId: uid,
        idLocal: v.idLocal,
        alternativaId: v.alternativaId,
        titulo: v.titulo,
        plazo: v.plazo,
        alcance: v.alcance,
      })
      .onConflictDoNothing()
      .returning({ id: pruebasTerritoriales.id });
    if (r) return r.id;
    const [previa] = await this.db
      .select({ id: pruebasTerritoriales.id })
      .from(pruebasTerritoriales)
      .where(
        and(
          eq(pruebasTerritoriales.creadorId, uid),
          eq(pruebasTerritoriales.idLocal, v.idLocal),
          eq(pruebasTerritoriales.alternativaId, v.alternativaId),
          eq(pruebasTerritoriales.titulo, v.titulo),
          eq(pruebasTerritoriales.plazo, v.plazo),
          eq(pruebasTerritoriales.alcance, v.alcance),
        ),
      );
    return previa?.id ?? 'conflicto';
  }
  async avanzar(
    id: string,
    uid: number,
    v: z.infer<typeof avanzarPruebaSchema>,
  ): Promise<'ok' | 'sin_permiso' | 'fase_invalida' | 'revision_cambiada'> {
    const huella = createHash('sha256').update(JSON.stringify(v)).digest('hex');
    const previos = await this.db.execute<{ huella: string; autor: number }>(
      sql`select huella,autor_id as autor from prueba_eventos where prueba_id=${id}::uuid and id_local=${v.idLocal}::uuid`,
    );
    if (previos.rows[0])
      return previos.rows[0].huella === huella && previos.rows[0].autor === uid
        ? 'ok'
        : 'revision_cambiada';
    const [p] = await this.db
      .select()
      .from(pruebasTerritoriales)
      .where(eq(pruebasTerritoriales.id, id));
    if (!p) return 'sin_permiso';
    const independiente =
      v.estado === 'resultado_revisado' && p.creadorId !== uid && p.responsableId !== uid;
    if (v.estado === 'resultado_revisado' && !independiente) return 'sin_permiso';
    if (!independiente && p.creadorId !== uid && p.responsableId !== uid) return 'sin_permiso';
    const siguientes: Record<string, string[]> = {
      propuesta: ['aceptada'],
      aceptada: ['en_curso', 'pausada'],
      en_curso: ['implementada', 'pausada'],
      pausada: ['en_curso'],
      implementada: ['resultado_observado'],
      resultado_observado: ['resultado_revisado'],
      resultado_revisado: [],
    };
    if (!siguientes[p.estado]?.includes(v.estado)) return 'fase_invalida';
    if (v.estado === 'aceptada' && !v.firma) return 'fase_invalida';
    const responsable = v.estado === 'aceptada' ? uid : p.responsableId;
    const firma = v.estado === 'aceptada' ? v.firma : p.responsableNombre;
    const r = await this.db.execute<{ id: string }>(sql`with cambio as (
      update ${pruebasTerritoriales} set estado=${v.estado},revision=revision+1,responsable_id=${responsable},responsable_nombre=${firma ?? null}
      where id=${id}::uuid and revision=${v.revision} and estado=${p.estado} returning *
    ), historia as (insert into prueba_eventos(prueba_id,revision,autor_id,estado,observacion,evidencia,id_local,huella)
      select id,revision,${uid},estado,${v.observacion},${JSON.stringify(v.evidencia)}::jsonb,${v.idLocal}::uuid,${huella} from cambio returning id),
    avisos as (insert into eventos_civicos(user_id,clave,titulo,href)
      select s.user_id,'prueba:'||c.id||':'||c.revision,'La prueba de un futuro que seguís tiene una nueva observación.','/fichas/'||a.ficha_id
      from cambio c join ficha_alternativas a on a.id=c.alternativa_id join seguimientos s on s.tipo='ficha' and s.objeto=a.ficha_id::text where not exists(select 1 from preferencias_civicas pref where pref.user_id=s.user_id and not pref.avisos) on conflict do nothing returning id)
    select id from cambio`);
    return r.rows.length ? 'ok' : 'revision_cambiada';
  }
}
