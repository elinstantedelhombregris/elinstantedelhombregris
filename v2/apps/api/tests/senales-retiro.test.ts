/**
 * Retirar la propia voz — `DELETE /api/v1/civic/senales/:idPublico`.
 *
 * Lo que se cuida: que sólo la retire el navegador que la escribió (la cookie
 * de actor es la autoría, no hay cuenta), que retirar vacíe el texto y deje la
 * fila, y que la voz salga de la lectura del mapa.
 *
 * **Escribe filas.** Exige `DATABASE_URL_DESCARTABLE`, como las otras suites
 * que escriben: sin ella las filas de prueba quedarían en la base real.
 */
import { randomUUID } from 'node:crypto';

import '../src/load-env.js';

const DESCARTABLE = process.env['DATABASE_URL_DESCARTABLE'];
if (DESCARTABLE !== undefined && DESCARTABLE !== '') {
  process.env['DATABASE_URL'] = DESCARTABLE;
}

import { CONTRATO_SENAL } from '@v2/shared';
import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite =
  DESCARTABLE !== undefined && DESCARTABLE !== '' && hasDatabaseUrl ? describe : describe.skip;

const RUTA = '/api/v1/civic/senales';
const TEXTO = 'TEST retiro: la plaza no tiene luz desde el invierno.';

dsuite('Retirar la propia voz', () => {
  const request = supertest(createApp());
  const creadas: string[] = [];

  /** Suelta una voz y devuelve su id público y la cookie de actor que la escribió. */
  const soltar = async (): Promise<{ id: string; cookie: string }> => {
    const res = await request.post(RUTA).send({
      contrato: CONTRATO_SENAL,
      idLocal: randomUUID(),
      tipo: 'basta',
      texto: TEXTO,
      cedeLicencia: true,
      casa: 'no',
    });
    if (res.status !== 201) {
      throw new Error(`Esperaba 201 y vino ${String(res.status)}: ${JSON.stringify(res.body)}`);
    }
    const id = res.body.data.idPublico as string;
    creadas.push(id);
    const set = (res.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
    const cookie = (set.find((c) => c.startsWith('basta_actor=')) ?? '').split(';')[0] ?? '';
    return { id, cookie };
  };

  afterAll(async () => {
    if (creadas.length === 0) return;
    const { getDb, inArray, senales } = await import('@v2/db');
    await getDb().delete(senales).where(inArray(senales.idPublico, creadas));
  });

  it('quien la escribió la retira: la fila queda, el texto se va', async () => {
    const { id, cookie } = await soltar();
    expect(cookie).not.toBe('');

    const antes = await request.get(`${RUTA}/${id}`).set('Cookie', cookie);
    expect(antes.status).toBe(200);
    expect(antes.body.data.esPropia).toBe(true);

    const res = await request.delete(`${RUTA}/${id}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.retirada).toBe(true);

    const { getDb, eq, senales } = await import('@v2/db');
    const [fila] = await getDb()
      .select({ estado: senales.estado, texto: senales.texto })
      .from(senales)
      .where(eq(senales.idPublico, id));
    expect(fila).toEqual({ estado: 'retirada', texto: '' });
  });

  it('la voz retirada sale de la lectura del mapa', async () => {
    const { id, cookie } = await soltar();
    await request.delete(`${RUTA}/${id}`).set('Cookie', cookie);

    const lectura = await request.get('/api/v1/civic/map/lectura?capas=voz&limite=2000');
    expect(lectura.status).toBe(200);
    const ids = (lectura.body.data.signals as { id: string }[]).map((s) => s.id);
    expect(ids).not.toContain(`voz:${id}`);
  });

  it('sin la cookie de quien la escribió no se retira', async () => {
    const { id } = await soltar();

    const sinCookie = await request.delete(`${RUTA}/${id}`);
    expect(sinCookie.status).toBe(403);

    // Otro navegador: un actor distinto, recién nacido de otra voz.
    const { cookie: ajena } = await soltar();
    const conOtra = await request.delete(`${RUTA}/${id}`).set('Cookie', ajena);
    expect(conOtra.status).toBe(403);

    const sigue = await request.get(`${RUTA}/${id}`);
    expect(sigue.body.data.senal.texto).toBe(TEXTO);
  });

  it('un id que no es UUID es un 400, no un 500', async () => {
    const res = await request.delete(`${RUTA}/no-es-un-uuid`);
    expect(res.status).toBe(400);
  });
});
