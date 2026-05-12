/**
 * Integration tests for the ranking cron — verifies rankings rows
 * land in order and idempotently.
 */
import '../src/load-env.js';

import { GamificationRepository, eq, getDb, rankings } from '@v2/db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { runRankingCron } from '../src/features/gamification/cron.js';

import { createTestUser, deleteTestUsers, hasDatabaseUrl } from './helpers/index.js';

import type { TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Gamification ranking cron', () => {
  let u1: TestUser;
  let u2: TestUser;

  beforeAll(async () => {
    u1 = await createTestUser('cron-1');
    u2 = await createTestUser('cron-2');
    const repo = new GamificationRepository(getDb());
    await repo.getOrCreateUserLevel(u1.id);
    await repo.getOrCreateUserLevel(u2.id);
    await repo.addXp(u1.id, 250);
    await repo.addXp(u2.id, 50);
    const today = new Date().toISOString().slice(0, 10);
    await repo.logActivity({ userId: u1.id, activityDate: today, kind: 'test_cron', xpAwarded: 250 });
    await repo.logActivity({ userId: u2.id, activityDate: today, kind: 'test_cron', xpAwarded: 50 });
  });

  afterAll(async () => {
    await deleteTestUsers([u1.email, u2.email]);
  });

  it('runRankingCron writes all_time rows ordered by xp desc', async () => {
    await runRankingCron();
    const db = getDb();
    const rows = await db.select().from(rankings).where(eq(rankings.periodKind, 'all_time'));
    const u1Row = rows.find((r) => r.userId === u1.id);
    const u2Row = rows.find((r) => r.userId === u2.id);
    expect(u1Row).toBeTruthy();
    expect(u2Row).toBeTruthy();
    expect(u1Row?.rank ?? 999).toBeLessThan(u2Row?.rank ?? 999);
  });

  it('runRankingCron writes weekly rows', async () => {
    await runRankingCron();
    const db = getDb();
    const rows = await db.select().from(rankings).where(eq(rankings.periodKind, 'weekly'));
    expect(rows.some((r) => r.userId === u1.id)).toBe(true);
  });

  it('a second run is idempotent — same userIds, ranks may differ if XP changed', async () => {
    const db = getDb();
    const beforeCount = (await db.select().from(rankings).where(eq(rankings.periodKind, 'all_time'))).length;
    await runRankingCron();
    const afterCount = (await db.select().from(rankings).where(eq(rankings.periodKind, 'all_time'))).length;
    expect(afterCount).toBe(beforeCount);
  });
});
