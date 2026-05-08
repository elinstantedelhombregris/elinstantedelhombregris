/**
 * Life-area scoring engine.
 *
 * Walks every response a user has, groups by (area, category), averages
 * the values, and writes the aggregates into user_life_area_state.
 *
 * Cheap at this scale (≤ 120 rows per user). If a user grows >5k
 * responses the engine moves to incremental updates; for now full
 * recompute is fine.
 */
import { eq, getDb, lifeAreaQuizQuestions, lifeAreaQuizResponses, LifeAreasRepository } from '@v2/db';

export async function rescoreUser(userId: number): Promise<void> {
  const db = getDb();
  const repo = new LifeAreasRepository(db);

  // Pull every response with its question metadata in one query.
  const rows = await db
    .select({
      lifeAreaId: lifeAreaQuizQuestions.lifeAreaId,
      category: lifeAreaQuizQuestions.category,
      currentValue: lifeAreaQuizResponses.currentValue,
    })
    .from(lifeAreaQuizResponses)
    .innerJoin(lifeAreaQuizQuestions, eq(lifeAreaQuizQuestions.id, lifeAreaQuizResponses.questionId))
    .where(eq(lifeAreaQuizResponses.userId, userId));

  // Bucket by (areaId, category).
  interface Bucket {
    sum: number;
    count: number;
  }
  const buckets = new Map<string, Bucket>();
  for (const row of rows) {
    if (row.currentValue === null) continue;
    const key = `${String(row.lifeAreaId)}:${row.category}`;
    const b = buckets.get(key) ?? { sum: 0, count: 0 };
    b.sum += row.currentValue;
    b.count += 1;
    buckets.set(key, b);
  }

  // Accumulate per area.
  interface Aggregate {
    current: number;
    desired: number;
  }
  const aggregates = new Map<number, Aggregate>();
  for (const [key, b] of buckets) {
    const [areaIdStr, category] = key.split(':');
    if (!areaIdStr || !category) continue;
    const areaId = Number(areaIdStr);
    const avg = b.count > 0 ? b.sum / b.count : 0;
    const agg = aggregates.get(areaId) ?? { current: 0, desired: 0 };
    if (category === 'current') agg.current = avg;
    else if (category === 'desired') agg.desired = avg;
    aggregates.set(areaId, agg);
  }

  // Upsert per-area state.
  for (const [areaId, agg] of aggregates) {
     
    const state = await repo.getOrCreateState(userId, areaId);
     
    await repo.updateState(state.id, {
      currentScore: agg.current,
      desiredScore: agg.desired,
      gap: Math.max(agg.desired - agg.current, 0),
    });
  }
}
