/**
 * Las identidades de proveedores externos (ADR 0012).
 *
 * Cada escritura es un solo enunciado: el driver `neon-http` no tiene transacciones, y un
 * alta o una vinculación a medias dejaría una cuenta sin forma de entrar o una identidad
 * suelta. Con CTE, o se escribe todo o nada.
 */
import { and, eq, sql } from 'drizzle-orm';

import { identidadesExternas } from '../schema/identidades.js';
import { users } from '../schema/users.js';

import type { Db } from '../client.js';
import type { ProveedorDeIngreso } from '../schema/identidades.js';

export interface IdentidadConCuenta {
  identidadId: number;
  userId: number;
  activa: boolean;
}

export interface CuentaPorCorreo {
  id: number;
  activa: boolean;
  correoVerificado: boolean;
}

export interface DatosDeIdentidad {
  proveedor: ProveedorDeIngreso;
  sujeto: string;
  correo: string;
}

/** Por qué no se pudo dar de alta: el nombre de usuario, el correo o la identidad ya están. */
export type ChoqueDeAlta = 'usuario' | 'correo' | 'identidad';

const AVISO_DE_VINCULO: Record<ProveedorDeIngreso, string> = {
  google: 'Vinculamos tu cuenta con Google: ahora podés entrar con ese botón.',
};
const AVISO_DE_LIMPIEZA: Record<ProveedorDeIngreso, string> = {
  google:
    'Vinculamos tu cuenta con Google. Como el correo no estaba verificado, borramos la contraseña y el doble factor, y cerramos las sesiones abiertas.',
};

/** Qué índice único chocó, leído del error de Postgres (23505). */
function choqueDe(error: unknown): ChoqueDeAlta | null {
  if (typeof error !== 'object' || error === null) return null;
  const codigo = (error as { code?: unknown }).code;
  const texto = [
    (error as { constraint?: unknown }).constraint,
    (error as { message?: unknown }).message,
  ]
    .filter((v): v is string => typeof v === 'string')
    .join(' ');
  if (codigo !== '23505' && !texto.includes('unique')) return null;
  if (texto.includes('users_username_unique')) return 'usuario';
  if (texto.includes('users_email_unique')) return 'correo';
  if (texto.includes('identidades_externas_sujeto_unique')) return 'identidad';
  return null;
}

export class IdentidadesRepository {
  constructor(private readonly db: Db) {}

  /** La cuenta atada a esta identidad, si la hay. Se busca por `sub`, nunca por correo. */
  async porSujeto(
    proveedor: ProveedorDeIngreso,
    sujeto: string,
  ): Promise<IdentidadConCuenta | null> {
    const [fila] = await this.db
      .select({
        identidadId: identidadesExternas.id,
        userId: identidadesExternas.userId,
        activa: users.isActive,
      })
      .from(identidadesExternas)
      .innerJoin(users, eq(users.id, identidadesExternas.userId))
      .where(
        and(eq(identidadesExternas.proveedor, proveedor), eq(identidadesExternas.sujeto, sujeto)),
      )
      .limit(1);
    return fila ?? null;
  }

  /**
   * La cuenta con ese correo, esté activa o no: una desactivada no se vincula ni se da de
   * alta de nuevo con su correo. `findByEmail` de usuarios mira sólo las activas.
   */
  async cuentaPorCorreo(correo: string): Promise<CuentaPorCorreo | null> {
    const [fila] = await this.db
      .select({ id: users.id, activa: users.isActive, correoVerificado: users.emailVerified })
      .from(users)
      .where(eq(users.email, correo.trim().toLowerCase()))
      .limit(1);
    return fila ?? null;
  }

  /** Vincula una cuenta que ya probó su correo. Devuelve `false` si la identidad ya era de otra. */
  async vincular(userId: number, datos: DatosDeIdentidad): Promise<boolean> {
    try {
      const r = await this.db.execute<{ user_id: number }>(sql`
        with identidad as (
          insert into identidades_externas (user_id, proveedor, sujeto, correo)
          select id, ${datos.proveedor}, ${datos.sujeto}, ${datos.correo}
          from users where id = ${userId} and is_active
          returning user_id
        ), aviso as (
          insert into eventos_civicos (user_id, clave, titulo, href)
          select user_id, ${'cuenta:vinculada:' + datos.proveedor}, ${AVISO_DE_VINCULO[datos.proveedor]}, '/mi-espacio'
          from identidad
          on conflict do nothing
        )
        select user_id from identidad`);
      return r.rows.length === 1;
    } catch (e) {
      if (choqueDe(e) === 'identidad') return false;
      throw e;
    }
  }

  /**
   * Vincula una cuenta que **no** había verificado su correo. Quien la creó no probó que el
   * correo fuera suyo y el proveedor sí: antes de atarla se borran la contraseña, el doble
   * factor, los enlaces pendientes y las sesiones, y el correo queda verificado.
   */
  async limpiarYVincular(userId: number, datos: DatosDeIdentidad): Promise<boolean> {
    try {
      const r = await this.db.execute<{ user_id: number }>(sql`
        with cuenta as (
          update users set password_hash = null, email_verified = true, updated_at = now()
          where id = ${userId} and is_active and not email_verified
          returning id
        ), sesiones as (
          update auth_sessions set revoked_at = now()
          where user_id in (select id from cuenta) and revoked_at is null
        ), doble as (
          delete from two_factor_secrets where user_id in (select id from cuenta)
        ), respaldo as (
          delete from two_factor_backup_codes where user_id in (select id from cuenta)
        ), recupero as (
          delete from password_reset_tokens where user_id in (select id from cuenta)
        ), verificacion as (
          delete from email_verification_tokens where user_id in (select id from cuenta)
        ), identidad as (
          insert into identidades_externas (user_id, proveedor, sujeto, correo)
          select id, ${datos.proveedor}, ${datos.sujeto}, ${datos.correo} from cuenta
          returning user_id
        ), aviso as (
          insert into eventos_civicos (user_id, clave, titulo, href)
          select user_id, ${'cuenta:vinculada:' + datos.proveedor}, ${AVISO_DE_LIMPIEZA[datos.proveedor]}, '/mi-espacio'
          from identidad
          on conflict do nothing
        )
        select user_id from identidad`);
      return r.rows.length === 1;
    } catch (e) {
      if (choqueDe(e) === 'identidad') return false;
      throw e;
    }
  }

  /**
   * Crea la cuenta y su identidad juntas: sin contraseña y con el correo verificado. Si algo
   * ya está tomado no queda nada escrito y se dice qué.
   */
  async alta(
    cuenta: { username: string; name: string },
    datos: DatosDeIdentidad,
  ): Promise<{ ok: true; userId: number } | { ok: false; choque: ChoqueDeAlta }> {
    try {
      const r = await this.db.execute<{ id: number }>(sql`
        with nueva as (
          insert into users (username, email, name, password_hash, email_verified)
          values (${cuenta.username}, ${datos.correo.trim().toLowerCase()}, ${cuenta.name}, null, true)
          returning id
        ), identidad as (
          insert into identidades_externas (user_id, proveedor, sujeto, correo)
          select id, ${datos.proveedor}, ${datos.sujeto}, ${datos.correo} from nueva
          returning user_id
        )
        select id from nueva where id in (select user_id from identidad)`);
      const id = r.rows[0]?.id;
      if (id === undefined) throw new Error('El alta no devolvió la cuenta creada.');
      return { ok: true, userId: id };
    } catch (e) {
      const choque = choqueDe(e);
      if (choque) return { ok: false, choque };
      throw e;
    }
  }

  async marcarUso(identidadId: number): Promise<void> {
    await this.db
      .update(identidadesExternas)
      .set({ usadaEn: new Date() })
      .where(eq(identidadesExternas.id, identidadId));
  }

  /** Las identidades de una cuenta, para Mi espacio. */
  async deCuenta(
    userId: number,
  ): Promise<{ proveedor: ProveedorDeIngreso; correo: string; creadaEn: Date }[]> {
    return this.db
      .select({
        proveedor: identidadesExternas.proveedor,
        correo: identidadesExternas.correo,
        creadaEn: identidadesExternas.creadaEn,
      })
      .from(identidadesExternas)
      .where(eq(identidadesExternas.userId, userId))
      .orderBy(identidadesExternas.creadaEn);
  }

  /** ¿Esta identidad es de esta cuenta? Para la confirmación reciente. */
  async esDe(userId: number, proveedor: ProveedorDeIngreso, sujeto: string): Promise<boolean> {
    const fila = await this.porSujeto(proveedor, sujeto);
    return fila?.userId === userId;
  }

  /** Nombres de usuario tomados entre estos candidatos, para sugerir uno libre. */
  async usuariosTomados(candidatos: readonly string[]): Promise<Set<string>> {
    if (!candidatos.length) return new Set();
    const filas = await this.db
      .select({ username: users.username })
      .from(users)
      .where(
        sql`lower(${users.username}) in (${sql.join(
          candidatos.map((c) => sql`${c.toLowerCase()}`),
          sql`, `,
        )})`,
      );
    return new Set(filas.map((f) => f.username.toLowerCase()));
  }
}
