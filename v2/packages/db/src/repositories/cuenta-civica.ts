import { randomUUID } from 'node:crypto';

import { sql } from 'drizzle-orm';

import type { Db } from '../client';
export class CuentaCivicaRepository {
  constructor(private readonly db: Db) {}
  async cerrar(uid: number) {
    // Una sola sentencia: revoca acceso y limpia la continuidad privada sin eliminar el archivo público.
    await this.db.execute(sql`with cierre as (
      update users set is_active=false,name='Cuenta cerrada',email=${'cerrada-' + randomUUID() + '@basta.invalid'},username=${'cerrada-' + randomUUID()},password_hash='cuenta-cerrada',bio=null,location=null,avatar_url=null,updated_at=now() where id=${uid} returning id
    ), sesiones as (delete from auth_sessions where user_id in(select id from cierre)),
    email as (delete from email_verification_tokens where user_id in(select id from cierre)),
    resets as (delete from password_reset_tokens where user_id in(select id from cierre)),
    doble as (delete from two_factor_secrets where user_id in(select id from cierre)),
    backup as (delete from two_factor_backup_codes where user_id in(select id from cierre)),
    seguidos as (delete from seguimientos where user_id in(select id from cierre)),
    analisis as (delete from analisis_guardados where user_id in(select id from cierre)),
    avisos as (delete from eventos_civicos where user_id in(select id from cierre)),
    opiniones_borradas as (delete from opiniones where user_id in(select id from cierre)),
    preferencias as (delete from preferencias_civicas where user_id in(select id from cierre)),
    permisos as (update colaboraciones set revocada_en=now() where creador_id in(select id from cierre) or usuario_id in(select id from cierre))
    , pausadas as (update campanas set estado='pausada',revision=revision+1,actualizada_en=now() where creador_id in(select id from cierre) and estado not in('borrador','cerrada','pausada') returning *),
    fases as (insert into campana_ediciones(campana_id,revision,contrato,estado,motivo) select id,revision,contrato,estado,'La cuenta responsable cerró. La convocatoria se pausa y conserva su archivo público.' from pausadas returning id),
    novedades as (insert into eventos_civicos(user_id,clave,titulo,href) select s.user_id,'cierre-campana:'||c.id||':'||c.revision,'La campaña que seguís se pausó al cerrar su cuenta responsable.','/campanas/'||c.slug from pausadas c join seguimientos s on s.tipo='campana' and s.objeto=c.id::text where s.user_id<>${uid} and not exists(select 1 from preferencias_civicas p where p.user_id=s.user_id and not p.avisos) on conflict do nothing returning id)
    select id from cierre`);
  }
}
