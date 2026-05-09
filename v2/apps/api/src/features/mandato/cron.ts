/**
 * Mandato-engine cron job.
 *
 * Picks up pulse signals that haven't been classified yet (theme IS NULL),
 * classifies them through the AICompleter pipeline, and recomputes
 * per-province territory_mandates aggregates so the territorial map
 * always shows fresh top themes + sentiment.
 *
 * Invoked from:
 *   - apps/api/api/cron/mandato-engine.ts (Vercel cron entry, when v2
 *     deploys)
 *   - manually via `pnpm --filter @v2/api run mandato:once` for dev
 *
 * Concurrency is limited so we don't blow past the AI provider rate
 * limits; the cron runs every 15 minutes and chips away.
 */
import { eq, getDb, PulsoRepository, sql } from '@v2/db';
import { pulseSignals, territoryMandates } from '@v2/db/schema';

import { logger } from '../../lib/logger.js';

import { classifySignal } from './classifier.js';

const BATCH_SIZE = 50;
const CONCURRENCY = 4;

/**
 * Process at most BATCH_SIZE unclassified signals.
 * Returns counts so the cron entry can emit a useful log line.
 */
export async function runMandatoEngine(): Promise<{ classified: number; aggregatesUpdated: number }> {
  const db = getDb();
  const repo = new PulsoRepository(db);
  const pending = await repo.listUnclassified(BATCH_SIZE);
  if (pending.length === 0) {
    logger.debug('mandato-engine: nothing to classify');
    return { classified: 0, aggregatesUpdated: await recomputeAggregates() };
  }

  // Classify with limited concurrency.
  let classified = 0;
  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const slice = pending.slice(i, i + CONCURRENCY);
    await Promise.all(
      slice.map(async (signal) => {
        const result = await classifySignal(signal.body);
        await repo.updateClassification(signal.id, result);
        classified++;
      }),
    );
  }

  const aggregatesUpdated = await recomputeAggregates();
  logger.info({ classified, aggregatesUpdated }, 'mandato-engine: tick complete');
  return { classified, aggregatesUpdated };
}

/**
 * Recompute territory_mandates rows for every province that has at
 * least one classified signal. The rollup picks the top 5 themes
 * (by count) and the average sentiment.
 */
async function recomputeAggregates(): Promise<number> {
  const db = getDb();

  // Per-province top themes (top 5 by count) and avg sentiment.
  const rows = await db
    .select({
      provinceId: pulseSignals.provinceId,
      theme: pulseSignals.theme,
      pulseCount: sql<number>`count(*)::int`,
      avgSentiment: sql<number>`coalesce(avg(${pulseSignals.sentiment}), 0)::float`,
    })
    .from(pulseSignals)
    .where(sql`${pulseSignals.theme} IS NOT NULL AND ${pulseSignals.provinceId} IS NOT NULL`)
    .groupBy(pulseSignals.provinceId, pulseSignals.theme);

  // Reshape: provinceId → { themes: [{theme, count}…], totalPulse, weightedSent }
  const byProvince = new Map<
    number,
    { themes: { theme: string; count: number }[]; totalPulse: number; weightedSent: number }
  >();
  for (const r of rows) {
    if (r.provinceId === null || r.theme === null) continue;
    const entry = byProvince.get(r.provinceId) ?? { themes: [], totalPulse: 0, weightedSent: 0 };
    entry.themes.push({ theme: r.theme, count: r.pulseCount });
    entry.totalPulse += r.pulseCount;
    entry.weightedSent += r.avgSentiment * r.pulseCount;
    byProvince.set(r.provinceId, entry);
  }

  let updated = 0;
  for (const [provinceId, entry] of byProvince) {
    const topThemes = [...entry.themes]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const sentiment = entry.totalPulse > 0 ? entry.weightedSent / entry.totalPulse : 0;

    // Upsert: try update first, fall back to insert.
    const existing = await db
      .select()
      .from(territoryMandates)
      .where(eq(territoryMandates.provinceId, provinceId))
      .limit(1);
    if (existing.length > 0) {
      await db
        .update(territoryMandates)
        .set({
          topThemes,
          sentiment,
          pulseCount: entry.totalPulse,
          lastComputedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(territoryMandates.provinceId, provinceId));
    } else {
      await db.insert(territoryMandates).values({
        provinceId,
        topThemes,
        sentiment,
        pulseCount: entry.totalPulse,
        lastComputedAt: new Date(),
      });
    }
    updated++;
  }

  return updated;
}
