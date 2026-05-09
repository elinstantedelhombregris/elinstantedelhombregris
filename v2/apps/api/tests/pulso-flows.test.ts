/**
 * Integration tests for /api/pulso/* and /api/propuestas/*.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { eq, getDb, proposalVotes, proposals, pulseSignals, PulsoRepository } from '@v2/db';

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

dsuite('Pulso + propuestas flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;
  let proposalId: number;
  const seededSignalIds: number[] = [];

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
    await deleteTestUsers([user.email]);
  });

  describe('POST /api/pulso (submit signal)', () => {
    it('accepts an anonymous signal', async () => {
      const res = await request.post('/api/pulso').send({ body: 'No alcanza la plata.' });
      expect(res.status).toBe(201);
      expect(typeof res.body.data.id).toBe('number');
      seededSignalIds.push(res.body.data.id as number);
    });

    it('rejects empty body with 400', async () => {
      const res = await request.post('/api/pulso').send({ body: '' });
      expect(res.status).toBe(400);
    });

    it('attaches userId when authed', async () => {
      const res = await csrfed(app, session).post('/api/pulso').send({ body: 'Auth signal.' });
      expect(res.status).toBe(201);
      seededSignalIds.push(res.body.data.id as number);
    });
  });

  describe('GET /api/pulso', () => {
    it('lists signals, including ours', async () => {
      const res = await request.get('/api/pulso?limit=200');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
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
    it('is rejected without auth + csrf', async () => {
      const res = await request.post(`/api/propuestas/${String(proposalId)}/vote`).send({ value: 1 });
      expect([401, 403]).toContain(res.status);
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
