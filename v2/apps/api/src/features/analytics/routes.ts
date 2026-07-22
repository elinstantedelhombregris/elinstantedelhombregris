/**
 * Analytics HTTP slice — read-only aggregations across the platform.
 *
 *   GET /api/analytics/convergence-summary  — high-level numbers
 *   GET /api/analytics/dreams-by-category   — top dream categories
 *   GET /api/analytics/voces-count          — total "voces" (dreams) count
 */
import {
  blogPosts,
  communityPosts,
  DreamsRepository,
  dreams,
  eq,
  getDb,
  iniciativas,
  pulseSignals,
  sql,
  users,
} from '@v2/db';
import { Router, type Router as RouterType } from 'express';

const router: RouterType = Router();

router.get('/voces-count', async (_req, res, next) => {
  try {
    const db = getDb();
    const repo = new DreamsRepository(db);
    const total = await repo.countApproved();
    res.json({ data: { total } });
  } catch (err) {
    next(err);
  }
});

router.get('/convergence-summary', async (_req, res, next) => {
  try {
    const db = getDb();
    const [
      [usersRow],
      [iniciativasRow],
      [dreamsRow],
      [pulseRow],
      [communityRow],
      [blogRow],
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.isActive, true)),
      db.select({ count: sql<number>`count(*)::int` }).from(iniciativas),
      db.select({ count: sql<number>`count(*)::int` }).from(dreams).where(eq(dreams.status, 'approved')),
      db.select({ count: sql<number>`count(*)::int` }).from(pulseSignals),
      db.select({ count: sql<number>`count(*)::int` }).from(communityPosts).where(eq(communityPosts.status, 'published')),
      db.select({ count: sql<number>`count(*)::int` }).from(blogPosts).where(eq(blogPosts.status, 'published')),
    ]);
    res.json({
      data: {
        users: usersRow?.count ?? 0,
        iniciativas: iniciativasRow?.count ?? 0,
        dreams: dreamsRow?.count ?? 0,
        pulseSignals: pulseRow?.count ?? 0,
        communityPosts: communityRow?.count ?? 0,
        blogPosts: blogRow?.count ?? 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/dreams-by-category', async (_req, res, next) => {
  try {
    const db = getDb();
    const rows = await db
      .select({
        category: dreams.category,
        count: sql<number>`count(*)::int`,
      })
      .from(dreams)
      .where(eq(dreams.status, 'approved'))
      .groupBy(dreams.category);
    res.json({
      data: {
        byCategory: rows.map((r) => ({
          category: r.category ?? '(sin categoría)',
          count: r.count,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export { router as analyticsRouter };
