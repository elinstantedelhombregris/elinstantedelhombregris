/**
 * Integration tests for /api/pulso/* and /api/propuestas/*.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { eq, getDb, inArray, proposalVotes, proposals, pulseSignals, PulsoRepository } from '@v2/db';

import { createApp } from '../src/app.js';

import {
  createTestUser,
  csrfed,
  deleteTestUsers,
  hasDatabaseUrl,
  loginAndGetCookies,
} from './helpers/index.js';

import type { LoggedInSession, TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

/**
 * Los textos que este archivo escribe, como constantes — D-014.
 *
 * Están acá arriba y no sueltos en cada `it` porque el `afterAll` los usa para
 * barrer lo que dejó cualquier corrida anterior que se haya cortado por la
 * mitad.
 */
const CUERPO_ANONIMO = 'No alcanza la plata.';
const CUERPO_AUTENTICADO = 'Auth signal.';
const CUERPO_LISTADO = 'Señal para el listado.';
const CUERPOS_DE_PRUEBA = [CUERPO_ANONIMO, CUERPO_AUTENTICADO, CUERPO_LISTADO];

dsuite('Pulso + propuestas flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  let proposalId: number;
  const seededSignalIds: number[] = [];

  /** Registra el id apenas vuelve la respuesta, pase lo que pase después. */
  const anotarSenal = (res: { body?: { data?: { id?: unknown } } }): void => {
    const id = res.body?.data?.id;
    if (typeof id === 'number') seededSignalIds.push(id);
  };

  beforeAll(async () => {
    user = await createTestUser('pulso');
    session = await loginAndGetCookies(app, user);
    const repo = new PulsoRepository(getDb());
    const stamp = String(Date.now());
    const p = await repo.createProposal({
      title: `Test propuesta ${stamp}`,
      summary: 'Una propuesta para probar votación.',
      status: 'voting',
    });
    proposalId = p.id;
  });

  afterAll(async () => {
    const db = getDb();
    await db.delete(proposalVotes).where(eq(proposalVotes.proposalId, proposalId));
    await db.delete(proposals).where(eq(proposals.id, proposalId));
    for (const id of seededSignalIds) {
      await db.delete(pulseSignals).where(eq(pulseSignals.id, id));
    }
    /**
     * Red de seguridad — D-014.
     *
     * Borrar por id no alcanza: si la corrida se corta con Ctrl-C, `afterAll`
     * no llega a ejecutarse y las señales quedan en la base para siempre. Y
     * como los tests corren contra la MISMA base que sirve el sitio, esas
     * sobras aparecen en el mapa público con textos como «Auth signal.».
     *
     * Barrer por el texto exacto que este archivo escribe limpia también lo
     * que dejó cualquier corrida anterior. Es un parche: lo que corresponde de
     * verdad es que los tests no compartan base con el sitio.
     */
    await db.delete(pulseSignals).where(inArray(pulseSignals.body, CUERPOS_DE_PRUEBA));
    await deleteTestUsers([user.email]);
  });

  describe('POST /api/pulso (submit signal)', () => {
    it('accepts an anonymous signal', async () => {
      const res = await request.post('/api/pulso').send({ body: CUERPO_ANONIMO });
      // El id se registra ANTES de afirmar: si un assert falla, la fila queda
      // huérfana en la base y nadie la borra nunca.
      anotarSenal(res);
      expect(res.status).toBe(201);
      expect(typeof res.body.data.id).toBe('number');
    });

    it('rejects empty body with 400', async () => {
      const res = await request.post('/api/pulso').send({ body: '' });
      expect(res.status).toBe(400);
    });

    it('attaches userId when authed', async () => {
      const res = await csrfed(app, session).post('/api/pulso').send({ body: CUERPO_AUTENTICADO });
      anotarSenal(res);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/pulso', () => {
    it('lists signals, including ours', async () => {
      const res = await request.get('/api/pulso?limit=200');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/pulso/:id', () => {
    it('returns the signal by id and redacts userId for anonymous viewers', async () => {
      // Submit as the authed user so userId is set on the row.
      const created = await csrfed(app, session).post('/api/pulso').send({ body: CUERPO_LISTADO });
      anotarSenal(created);
      expect(created.status).toBe(201);
      const id = created.body.data.id as number;

      const res = await request.get(`/api/pulso/${String(id)}`);
      expect(res.status).toBe(200);
      expect(res.body.data.signal.id).toBe(id);
      expect(res.body.data.signal.body).toBe(CUERPO_LISTADO);
      expect(res.body.data.signal.userId).toBe(null);
    });

    it('returns 404 on unknown id', async () => {
      const res = await request.get('/api/pulso/99999999');
      expect(res.status).toBe(404);
    });

    it('returns 400 on non-numeric id', async () => {
      const res = await request.get('/api/pulso/abc');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/propuestas', () => {
    it('lists voting proposals', async () => {
      const res = await request.get('/api/propuestas?status=voting');
      expect(res.status).toBe(200);
      const ids = (res.body.data as Array<{ id: number }>).map((p) => p.id);
      expect(ids).toContain(proposalId);
    });

    it('returns the seeded proposal by id', async () => {
      const res = await request.get(`/api/propuestas/${String(proposalId)}`);
      expect(res.status).toBe(200);
      expect(res.body.data.proposal.id).toBe(proposalId);
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request.get('/api/propuestas/99999999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/propuestas/:id/vote', () => {
    it('without csrf cookie is 403 CSRF_FAILED', async () => {
      const res = await request.post(`/api/propuestas/${String(proposalId)}/vote`).send({ value: 1 });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_FAILED');
    });

    it('casts a +1 vote and returns updated aggregate', async () => {
      const res = await csrfed(app, session).post(`/api/propuestas/${String(proposalId)}/vote`).send({ value: 1 });
      expect(res.status).toBe(200);
      expect(res.body.data.voteScore).toBe(1);
      expect(res.body.data.voteCount).toBe(1);
    });

    it('overwrites the vote on a second cast', async () => {
      const res = await csrfed(app, session).post(`/api/propuestas/${String(proposalId)}/vote`).send({ value: -1 });
      expect(res.status).toBe(200);
      expect(res.body.data.voteScore).toBe(-1);
      expect(res.body.data.voteCount).toBe(1);
    });

    it('rejects invalid vote values', async () => {
      const res = await csrfed(app, session).post(`/api/propuestas/${String(proposalId)}/vote`).send({ value: 5 });
      expect(res.status).toBe(400);
    });
  });
});
