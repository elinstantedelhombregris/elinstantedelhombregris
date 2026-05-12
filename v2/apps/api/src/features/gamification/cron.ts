/**
 * Ranking cron. Recomputes the cached `rankings` rows for two scopes:
 *
 *   - period_kind = 'weekly', period_start = Monday 00:00 UTC of current week
 *   - period_kind = 'all_time', period_start = NULL
 *
 * Both are scoped to scope_kind='global' (no per-province in Phase 8).
 *
 * Strategy: for each period, compute the top 50 by XP, upsert into
 * `rankings`, then prune any stale rows for the same (periodKind,
 * periodStart, scopeKind) key whose userId is not in the new top set.
 *
 * Invoked from:
 *   - apps/api/api/cron/gamification-rankings.ts (Vercel cron entry — to
 *     be wired up to a vercel.json schedule in Phase 10)
 *   - manually via `pnpm --filter @v2/api run rankings:once` for dev
 */
import { and, dailyActivity, desc, eq, getDb, inArray, not, rankings, sql, userLevels, users } from '@v2/db';

import { logger } from '../../lib/logger.js';

const TOP_N = 50;

export async function runRankingCron(now: Date = new Date()): Promise<{ weekly: number; allTime: number }> {
  const weekly = await rebuildPeriod('weekly', mondayUtc(now));
  const allTime = await rebuildPeriod('all_time', null);
  logger.info({ weekly, allTime }, 'rankings: tick complete');
  return { weekly, allTime };
}

async function rebuildPeriod(periodKind: 'weekly' | 'all_time', periodStart: Date | null): Promise<number> {
  const db = getDb();

  let top: { userId: number; xp: number }[];
  if (periodKind === 'all_time') {
    // Inner join ensures we only include users who still exist — guards
    // against the FK violation that would occur if user_levels has a
    // dangling row (e.g. in tests where users are cleaned up mid-run).
    const rows = await db
      .select({ userId: userLevels.userId, xp: userLevels.xp })
      .from(userLevels)
      .innerJoin(users, eq(userLevels.userId, users.id))
      .orderBy(desc(userLevels.xp))
      .limit(TOP_N);
    top = rows;
  } else {
    if (!periodStart) throw new Error('weekly period requires a periodStart');
    const rows = await db
      .select({
        userId: dailyActivity.userId,
        xp: sql<number>`COALESCE(SUM(${dailyActivity.xpAwarded}), 0)::int`.as('xp'),
      })
      .from(dailyActivity)
      .innerJoin(users, eq(dailyActivity.userId, users.id))
      .where(sql`${dailyActivity.createdAt} >= ${periodStart}`)
      .groupBy(dailyActivity.userId)
      .orderBy(sql`xp DESC`)
      .limit(TOP_N);
    top = rows.filter((r) => r.xp > 0);
  }

  let upserted = 0;
  for (let i = 0; i < top.length; i++) {
    const entry = top[i];
    if (!entry) continue;
    const rank = i + 1;
    const existing = await db
      .select()
      .from(rankings)
      .where(
        and(
          eq(rankings.periodKind, periodKind),
          periodStart === null ? sql`${rankings.periodStart} is null` : eq(rankings.periodStart, periodStart),
          eq(rankings.scopeKind, 'global'),
          sql`${rankings.scopeId} is null`,
          eq(rankings.userId, entry.userId),
        ),
      )
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      try {
        await db
          .update(rankings)
          .set({ rank, xp: entry.xp, computedAt: new Date() })
          .where(eq(rankings.id, existing[0].id));
        upserted++;
      } catch (err) {
        // FK violation: user was deleted in the window between query and
        // update (rare in production, possible in parallel test runs).
        if (isFkViolation(err)) {
          logger.warn({ userId: entry.userId }, 'rankings: skipping deleted user');
        } else {
          throw err;
        }
      }
    } else {
      try {
        await db.insert(rankings).values({
          periodKind,
          periodStart,
          scopeKind: 'global',
          scopeId: null,
          userId: entry.userId,
          rank,
          xp: entry.xp,
        });
        upserted++;
      } catch (err) {
        // FK violation: user was deleted in the window between query and
        // insert (rare in production, possible in parallel test runs).
        if (isFkViolation(err)) {
          logger.warn({ userId: entry.userId }, 'rankings: skipping deleted user');
        } else {
          throw err;
        }
      }
    }
  }

  const topUserIds = top.map((r) => r.userId);
  if (topUserIds.length > 0) {
    await db
      .delete(rankings)
      .where(
        and(
          eq(rankings.periodKind, periodKind),
          periodStart === null ? sql`${rankings.periodStart} is null` : eq(rankings.periodStart, periodStart),
          eq(rankings.scopeKind, 'global'),
          sql`${rankings.scopeId} is null`,
          not(inArray(rankings.userId, topUserIds)),
        ),
      );
  } else {
    await db
      .delete(rankings)
      .where(
        and(
          eq(rankings.periodKind, periodKind),
          periodStart === null ? sql`${rankings.periodStart} is null` : eq(rankings.periodStart, periodStart),
          eq(rankings.scopeKind, 'global'),
          sql`${rankings.scopeId} is null`,
        ),
      );
  }

  return upserted;
}

/**
 * Returns true when `err` is a Postgres foreign-key violation (code 23503).
 * Used to gracefully skip users deleted concurrently during the cron window.
 */
function isFkViolation(err: unknown): boolean {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    return err.code === '23503';
  }
  return false;
}

function mondayUtc(now: Date): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}
