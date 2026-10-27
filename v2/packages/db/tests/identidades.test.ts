/**
 * Las identidades de Google contra Postgres (ADR 0012, spec 2026-10-27-ingreso-con-google.md).
 *
 * **Este archivo ESCRIBE filas**: pide `DATABASE_URL_DESCARTABLE` (la define
 * `pnpm test:integration:local`) y se saltea sin ella.
 *
 * Lo que afirma es lo que un type-check no ve: que el alta escribe la cuenta y su identidad
 * juntas o ninguna, que una identidad no se ata a dos cuentas, que vincular una cuenta sin el
 * correo verificado la limpia entera, y que cerrar la cuenta borra sus identidades.
 */
import { randomUUID } from 'node:crypto';

import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CuentaCivicaRepository } from '../src/repositories/cuenta-civica.js';
import { IdentidadesRepository } from '../src/repositories/identidades.js';
import * as schema from '../src/schema/index.js';

import type { Db } from '../src/client.js';

const DSN = process.env['DATABASE_URL_DESCARTABLE'];
if (DSN === undefined)
  process.stdout.write(
    '\n[identidades] Se saltea: falta DATABASE_URL_DESCARTABLE.\n' +
      '  Este archivo ESCRIBE filas; usá `pnpm test:integration:local`.\n\n',
  );
const viva = DSN === undefined ? describe.skip : describe;

viva('IdentidadesRepository', () => {
  let db: Db;
  let repo: IdentidadesRepository;
  const marca = randomUUID().slice(0, 8);
  const usuarios: number[] = [];
  const correo = (n: string) => `${n}-${marca}@prueba.test`;
  const sujeto = (n: string) => `google-${marca}-${n}`;

  const cuenta = async (n: string, verificado: boolean): Promise<number> => {
    const r = await db.execute<{ id: number }>(sql`
      insert into users (username, email, name, password_hash, email_verified)
      values (${`${n}_${marca}`}, ${correo(n)}, 'Prueba', 'hash-de-prueba', ${verificado})
      returning id`);
    const id = r.rows[0]?.id ?? 0;
    usuarios.push(id);
    return id;
  };
  const fila = async (id: number) =>
    (
      await db.execute<{ password_hash: string | null; email_verified: boolean }>(
        sql`select password_hash, email_verified from users where id = ${id}`,
      )
    ).rows[0];
  const cuantas = async (tabla: string, id: number) =>
    Number(
      (
        await db.execute<{ n: string }>(
          sql`select count(*) as n from ${sql.raw(tabla)} where user_id = ${id}`,
        )
      ).rows[0]?.n ?? 0,
    );

  beforeAll(() => {
    db = drizzle(neon(DSN ?? ''), { schema }) as unknown as Db;
    repo = new IdentidadesRepository(db);
  });

  afterAll(async () => {
    if (!db) return;
    const ids = sql.raw(`'{${usuarios.join(',') || '0'}}'::int[]`);
    await db.execute(sql`delete from users where id = any(${ids})`);
    await db.execute(sql`delete from users where email like ${'%-' + marca + '@prueba.test'}`);
  });

  it('el alta crea la cuenta sin contraseña, con el correo verificado y su identidad', async () => {
    const r = await repo.alta(
      { username: `nueva_${marca}`, name: 'Nueva' },
      { proveedor: 'google', sujeto: sujeto('nueva'), correo: correo('nueva') },
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    usuarios.push(r.userId);
    expect(await fila(r.userId)).toEqual({ password_hash: null, email_verified: true });
    expect(await repo.porSujeto('google', sujeto('nueva'))).toMatchObject({
      userId: r.userId,
      activa: true,
    });
    expect(await repo.deCuenta(r.userId)).toMatchObject([
      { proveedor: 'google', correo: correo('nueva') },
    ]);
  });

  it('una identidad no se ata a dos cuentas: el segundo alta no deja nada escrito', async () => {
    const r = await repo.alta(
      { username: `otra_${marca}`, name: 'Otra' },
      { proveedor: 'google', sujeto: sujeto('nueva'), correo: correo('otra') },
    );
    expect(r).toEqual({ ok: false, choque: 'identidad' });
    expect(await repo.cuentaPorCorreo(correo('otra'))).toBeNull();
  });

  it('un usuario o un correo tomados se dicen, y no queda la identidad suelta', async () => {
    await cuenta('tomado', true);
    const porUsuario = await repo.alta(
      { username: `tomado_${marca}`, name: 'X' },
      { proveedor: 'google', sujeto: sujeto('x1'), correo: correo('x1') },
    );
    expect(porUsuario).toEqual({ ok: false, choque: 'usuario' });
    const porCorreo = await repo.alta(
      { username: `libre_${marca}`, name: 'X' },
      { proveedor: 'google', sujeto: sujeto('x2'), correo: correo('tomado') },
    );
    expect(porCorreo).toEqual({ ok: false, choque: 'correo' });
    expect(await repo.porSujeto('google', sujeto('x1'))).toBeNull();
    expect(await repo.porSujeto('google', sujeto('x2'))).toBeNull();
  });

  it('vincular una cuenta verificada la ata y avisa, sin tocar su contraseña', async () => {
    const id = await cuenta('verificada', true);
    expect(
      await repo.vincular(id, {
        proveedor: 'google',
        sujeto: sujeto('verificada'),
        correo: correo('verificada'),
      }),
    ).toBe(true);
    expect(await fila(id)).toEqual({ password_hash: 'hash-de-prueba', email_verified: true });
    expect(await cuantas('eventos_civicos', id)).toBe(1);
    // La misma identidad, en otra cuenta, no se ata.
    const otra = await cuenta('verificada2', true);
    expect(
      await repo.vincular(otra, {
        proveedor: 'google',
        sujeto: sujeto('verificada'),
        correo: correo('verificada2'),
      }),
    ).toBe(false);
  });

  it('sin el correo verificado, vincular borra contraseña, doble factor y sesiones', async () => {
    const id = await cuenta('sinverificar', false);
    await db.execute(
      sql`insert into two_factor_secrets (user_id, secret, enabled) values (${id}, 'SECRETO', true)`,
    );
    await db.execute(
      sql`insert into auth_sessions (user_id, jti, expires_at) values (${id}, ${randomUUID()}, now() + interval '1 day')`,
    );
    const datos = {
      proveedor: 'google' as const,
      sujeto: sujeto('sinverificar'),
      correo: correo('sinverificar'),
    };
    expect(await repo.limpiarYVincular(id, datos)).toBe(true);
    expect(await fila(id)).toEqual({ password_hash: null, email_verified: true });
    expect(await cuantas('two_factor_secrets', id)).toBe(0);
    const abiertas = await db.execute<{ n: string }>(
      sql`select count(*) as n from auth_sessions where user_id = ${id} and revoked_at is null`,
    );
    expect(Number(abiertas.rows[0]?.n)).toBe(0);
    expect((await repo.porSujeto('google', datos.sujeto))?.userId).toBe(id);
    // Una cuenta ya verificada no pasa por la limpieza.
    const verificada = await cuenta('yaverificada', true);
    expect(
      await repo.limpiarYVincular(verificada, { ...datos, sujeto: sujeto('yaverificada') }),
    ).toBe(false);
    expect(await fila(verificada)).toEqual({
      password_hash: 'hash-de-prueba',
      email_verified: true,
    });
  });

  it('la cuenta por correo aparece aunque esté desactivada', async () => {
    const id = await cuenta('apagada', true);
    await db.execute(sql`update users set is_active = false where id = ${id}`);
    expect(await repo.cuentaPorCorreo(correo('apagada').toUpperCase())).toEqual({
      id,
      activa: false,
      correoVerificado: true,
    });
  });

  it('cerrar la cuenta borra sus identidades: no se puede volver a entrar con Google', async () => {
    const id = await cuenta('cierra', true);
    await repo.vincular(id, {
      proveedor: 'google',
      sujeto: sujeto('cierra'),
      correo: correo('cierra'),
    });
    await new CuentaCivicaRepository(db).cerrar(id);
    expect(await repo.porSujeto('google', sujeto('cierra'))).toBeNull();
  });

  it('los usuarios tomados se comparan sin mayúsculas', async () => {
    await cuenta('Mayus', true);
    const tomados = await repo.usuariosTomados([`mayus_${marca}`, `libre_${marca}`]);
    expect([...tomados]).toEqual([`mayus_${marca}`]);
  });
});
