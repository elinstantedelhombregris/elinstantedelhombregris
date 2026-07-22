/**
 * Integration tests for /api/analytics/* — read-only aggregations.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import {
  CommunityRepository,
  communityPosts,
  DreamsRepository,
  dreams,
  eq,
  getDb,
  proposals,
  PulsoRepository,
  pulseSignals,
  sql,
} from '@v2/db';

import { createApp } from '../src/app.js';

import { createTestUser, deleteTestUsers, hasDatabaseUrl } from './helpers/index.js';

import type { TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Analytics flows', () => {
  const app = createApp();
  const request = supertest(app);
  const insertedDreamIds: number[] = [];
  // proposals.authorId y pulse_signals.userId son onDelete:'set null', y
  // communityPosts.userId es onDelete:'cascade' — se limpian explícitos
  // (mismo patrón que tests/gamification-hooks.test.ts).
  const createdProposalIds: number[] = [];
  const createdSignalIds: number[] = [];
  const createdPostIds: number[] = [];
  const createdUserEmails: string[] = [];

  afterAll(async () => {
    const db = getDb();
    if (insertedDreamIds.length > 0) {
      for (const id of insertedDreamIds) {
        await db.delete(dreams).where(eq(dreams.id, id));
      }
    }
    for (const id of createdProposalIds) {
      await db.delete(proposals).where(eq(proposals.id, id));
    }
    for (const id of createdSignalIds) {
      await db.delete(pulseSignals).where(eq(pulseSignals.id, id));
    }
    for (const id of createdPostIds) {
      await db.delete(communityPosts).where(eq(communityPosts.id, id));
    }
    if (createdUserEmails.length > 0) {
      await deleteTestUsers(createdUserEmails);
    }
  });

  describe('GET /api/analytics/voces-count', () => {
    // Other flow files (e.g. open-data-flows) insert into the same shared
    // `dreams` table and run concurrently in separate vitest workers, so a
    // "read total, mutate, read total again" delta is racy. Instead we seed,
    // then compare the endpoint's total against a same-instant direct
    // repository count (relative assertion, not an absolute expected value)
    // — this is deterministic regardless of what other suites are doing.
    it('counts approved dreams only — pending rows are excluded', async () => {
      const repo = new DreamsRepository(getDb());
      const stamp = String(Date.now());
      for (let i = 0; i < 3; i += 1) {
        const dream = await repo.create({
          body: `Voz de prueba ${stamp}-${String(i)}`,
          submittedAs: 'Anónimo',
          status: 'approved',
        });
        insertedDreamIds.push(dream.id);
      }
      // A non-approved row must NOT inflate the public number.
      const pending = await repo.create({
        body: `Voz pendiente ${stamp}`,
        submittedAs: 'Anónimo',
        status: 'pending',
      });
      insertedDreamIds.push(pending.id);

      const [res, approvedTotal] = await Promise.all([
        request.get('/api/analytics/voces-count'),
        repo.countApproved(),
      ]);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(approvedTotal);
      expect(res.body.data.total as number).toBeGreaterThanOrEqual(3);

      // Exclusion proof in ONE statement (single snapshot, immune to
      // concurrent suites): with our pending row in place, the unfiltered
      // total must strictly exceed the approved total.
      const [snapshot] = await getDb()
        .select({
          all: sql<number>`count(*)::int`,
          approved: sql<number>`count(*) filter (where ${dreams.status} = 'approved')::int`,
        })
        .from(dreams);
      expect(snapshot).toBeDefined();
      expect((snapshot?.all ?? 0) - (snapshot?.approved ?? 0)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/analytics/cifras', () => {
    // Sibling suites (gamification-hooks, pulso-flows, community-flows, ...)
    // insert into AND delete from these same four tables in parallel vitest
    // workers, and the endpoint's four internal reads run at a later instant
    // than any direct repository read we could take here — so exact equality
    // against a concurrently-read count WILL flake under load. Deterministic
    // instead: exact payload shape, integer values, and a >= floor per metric
    // backed by the rows this test owns (they exist for the whole test;
    // nothing deletes them until our afterAll).
    it('returns real counts for voces, propuestas, senales and posts — one round trip', async () => {
      const dreamsRepo = new DreamsRepository(getDb());
      const pulsoRepo = new PulsoRepository(getDb());
      const communityRepo = new CommunityRepository(getDb());
      const stamp = String(Date.now());

      const user: TestUser = await createTestUser('cifras');
      createdUserEmails.push(user.email);

      const dream = await dreamsRepo.create({
        body: `Voz para cifras ${stamp}`,
        submittedAs: 'Anónimo',
        status: 'approved',
      });
      insertedDreamIds.push(dream.id);

      const proposal = await pulsoRepo.createProposal({
        title: `Propuesta para cifras ${stamp}`,
        summary: 'Resumen suficientemente largo para la prueba de cifras.',
      });
      createdProposalIds.push(proposal.id);

      const signal = await pulsoRepo.addSignal({ body: `Señal para cifras ${stamp}` });
      createdSignalIds.push(signal.id);

      const post = await communityRepo.createPost({
        userId: user.id,
        title: 'Post para cifras',
        content: 'Contenido de prueba para la cifra de posts.',
        kind: 'discussion',
      });
      createdPostIds.push(post.id);

      const res = await request.get('/api/analytics/cifras');

      expect(res.status).toBe(200);
      expect(Object.keys(res.body.data as Record<string, unknown>).sort()).toEqual([
        'posts',
        'propuestas',
        'senales',
        'voces',
      ]);
      const { voces, propuestas, senales, posts } = res.body.data as Record<string, number>;
      for (const n of [voces, propuestas, senales, posts]) {
        expect(Number.isInteger(n)).toBe(true);
      }
      expect(voces).toBeGreaterThanOrEqual(1);
      expect(propuestas).toBeGreaterThanOrEqual(1);
      expect(senales).toBeGreaterThanOrEqual(1);
      expect(posts).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/analytics/voces-recientes', () => {
    it('returns latest approved dreams mapped to texto/categoria, categoria null passed through as-is', async () => {
      const repo = new DreamsRepository(getDb());
      const stamp = String(Date.now());

      const withCategory = await repo.create({
        body: `Voz reciente con categoría ${stamp}`,
        category: 'necesidad',
        submittedAs: 'Anónimo',
        status: 'approved',
      });
      insertedDreamIds.push(withCategory.id);

      const withoutCategory = await repo.create({
        body: `Voz reciente sin categoría ${stamp}`,
        submittedAs: 'Anónimo',
        status: 'approved',
      });
      insertedDreamIds.push(withoutCategory.id);

      // A pending row must never leak into the public "voces recientes" feed.
      const pending = await repo.create({
        body: `Voz pendiente reciente ${stamp}`,
        submittedAs: 'Anónimo',
        status: 'pending',
      });
      insertedDreamIds.push(pending.id);

      const res = await request.get('/api/analytics/voces-recientes?limit=30');
      expect(res.status).toBe(200);
      const items = res.body.data as { id: number; texto: string; categoria: string | null }[];

      expect(items.find((v) => v.id === pending.id)).toBeUndefined();

      const foundWithCategory = items.find((v) => v.id === withCategory.id);
      expect(foundWithCategory).toEqual({
        id: withCategory.id,
        texto: withCategory.body,
        categoria: 'necesidad',
      });

      const foundWithoutCategory = items.find((v) => v.id === withoutCategory.id);
      expect(foundWithoutCategory).toEqual({
        id: withoutCategory.id,
        texto: withoutCategory.body,
        categoria: null,
      });
    });

    it('defaults to 12 and rejects a limit above the max of 30', async () => {
      const [defaultRes, tooHighRes] = await Promise.all([
        request.get('/api/analytics/voces-recientes'),
        request.get('/api/analytics/voces-recientes?limit=31'),
      ]);

      expect(defaultRes.status).toBe(200);
      expect((defaultRes.body.data as unknown[]).length).toBeLessThanOrEqual(12);

      expect(tooHighRes.status).toBe(400);
      expect(tooHighRes.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
