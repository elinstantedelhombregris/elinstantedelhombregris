/**
 * Integration tests for /api/analytics/* — read-only aggregations.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { DreamsRepository, dreams, eq, getDb, sql } from '@v2/db';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Analytics flows', () => {
  const app = createApp();
  const request = supertest(app);
  const insertedDreamIds: number[] = [];

  afterAll(async () => {
    if (insertedDreamIds.length > 0) {
      const db = getDb();
      for (const id of insertedDreamIds) {
        await db.delete(dreams).where(eq(dreams.id, id));
      }
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
});
