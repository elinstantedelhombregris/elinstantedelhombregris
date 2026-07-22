/**
 * Integration tests for /api/analytics/* — read-only aggregations.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { DreamsRepository, dreams, eq, getDb } from '@v2/db';

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
    it('reflects the dreams table total, including freshly seeded rows', async () => {
      const repo = new DreamsRepository(getDb());
      const stamp = String(Date.now());
      for (let i = 0; i < 3; i += 1) {
        const dream = await repo.create({
          body: `Voz de prueba ${stamp}-${String(i)}`,
          submittedAs: 'Anónimo',
        });
        insertedDreamIds.push(dream.id);
      }

      const [res, directTotal] = await Promise.all([
        request.get('/api/analytics/voces-count'),
        repo.countAll(),
      ]);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(directTotal);
      expect(res.body.data.total as number).toBeGreaterThanOrEqual(3);
    });
  });
});
