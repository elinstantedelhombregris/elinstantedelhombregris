/**
 * El barrido de sesiones vencidas — lo que vuelve cierto el plazo que publica
 * `content/legal/privacidad.mdx` («90 días desde que la sesión vence»).
 *
 * Lo que se afirma acá, en este orden:
 *   1. el corte se calcula desde el vencimiento y son 90 días;
 *   2. se borra la vencida hace más de 90 días, y NO la que venció recién ni
 *      la que sigue viva — el bug caro sería barrer por `issuedAt` y llevarse
 *      puestas sesiones activas de gente que entró hace tres meses;
 *   3. correrlo dos veces no cambia nada la segunda.
 */
import '../src/load-env.js';

import { AuthRepository, authSessions, getDb, inArray } from '@v2/db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  barrerSesionesVencidas,
  corteDeRetencion,
  DIAS_DE_RETENCION_DE_SESIONES,
} from '../src/features/auth/cron-sesiones.js';

import { createTestUser, deleteTestUsers, hasDatabaseUrl } from './helpers/index.js';

import type { TestUser } from './helpers/index.js';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

describe('corteDeRetencion', () => {
  it('son 90 días, y se restan del instante que se le pasa', () => {
    expect(DIAS_DE_RETENCION_DE_SESIONES).toBe(90);
    const ahora = new Date('2026-08-12T05:30:00.000Z');
    expect(corteDeRetencion(ahora).toISOString()).toBe('2026-05-14T05:30:00.000Z');
  });
});

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Barrido de sesiones vencidas', () => {
  let usuario: TestUser;
  const sello = `barrido_${String(Date.now())}`;
  const jtiVieja = `${sello}_vieja`;
  const jtiRecien = `${sello}_recien`;
  const jtiViva = `${sello}_viva`;
  const jtis = [jtiVieja, jtiRecien, jtiViva];

  /** Los jtis del set que siguen en la base. */
  async function sobrevivientes(): Promise<string[]> {
    const filas = await getDb()
      .select({ jti: authSessions.jti })
      .from(authSessions)
      .where(inArray(authSessions.jti, jtis));
    return filas.map((f) => f.jti).sort();
  }

  beforeAll(async () => {
    usuario = await createTestUser('barrido');
    const repo = new AuthRepository(getDb());
    const ahora = Date.now();
    // Vencida hace 91 días: se va.
    await repo.createSession({
      userId: usuario.id,
      jti: jtiVieja,
      expiresAt: new Date(ahora - 91 * MS_POR_DIA),
      ipAddress: '203.0.113.10',
      userAgent: 'test/barrido',
    });
    // Vencida hace 89 días: todavía no.
    await repo.createSession({
      userId: usuario.id,
      jti: jtiRecien,
      expiresAt: new Date(ahora - 89 * MS_POR_DIA),
      ipAddress: '203.0.113.11',
      userAgent: 'test/barrido',
    });
    // Abierta hace tres meses y vigente: la que un barrido por `issuedAt`
    // borraría, dejando a alguien afuera de su propia cuenta.
    await repo.createSession({
      userId: usuario.id,
      jti: jtiViva,
      issuedAt: new Date(ahora - 100 * MS_POR_DIA),
      expiresAt: new Date(ahora + 7 * MS_POR_DIA),
      ipAddress: '203.0.113.12',
      userAgent: 'test/barrido',
    });
  });

  afterAll(async () => {
    await deleteTestUsers([usuario.email]);
  });

  it('borra la vencida hace más de 90 días y deja las otras dos', async () => {
    expect(await sobrevivientes()).toEqual([...jtis].sort());

    const resultado = await barrerSesionesVencidas();
    expect(resultado.borradas).toBeGreaterThanOrEqual(1);

    expect(await sobrevivientes()).toEqual([jtiRecien, jtiViva].sort());
  });

  it('una segunda corrida no borra nada más', async () => {
    const segunda = await barrerSesionesVencidas();
    expect(segunda.borradas).toBe(0);
    expect(await sobrevivientes()).toEqual([jtiRecien, jtiViva].sort());
  });
});
