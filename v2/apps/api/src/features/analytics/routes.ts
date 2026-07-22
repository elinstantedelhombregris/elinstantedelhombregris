/**
 * Analytics HTTP slice — read-only aggregations across the platform.
 *
 *   GET /api/analytics/convergence-summary  — high-level numbers
 *   GET /api/analytics/dreams-by-category   — top dream categories
 *   GET /api/analytics/voces-count          — total "voces" (dreams) count
 *   GET /api/analytics/cifras               — landing strip counts
 *   GET /api/analytics/voces-recientes      — latest approved dreams
 */
import {
  blogPosts,
  CommunityRepository,
  communityPosts,
  DreamsRepository,
  dreams,
  eq,
  getDb,
  iniciativas,
  PulsoRepository,
  pulseSignals,
  sql,
  users,
} from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

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

/**
 * Real counts behind the landing "cifras" strip — one round trip for
 * the four numbers the UI needs. Per the no-hardcoded-data directive,
 * a metric without a backing table simply isn't in this payload (no
 * invented numbers, with or without an asterisk).
 */
router.get('/cifras', async (_req, res, next) => {
  try {
    const db = getDb();
    const dreamsRepo = new DreamsRepository(db);
    const pulsoRepo = new PulsoRepository(db);
    const communityRepo = new CommunityRepository(db);
    const [voces, propuestas, senales, posts] = await Promise.all([
      dreamsRepo.countApproved(),
      pulsoRepo.countProposals(),
      pulsoRepo.countSignals(),
      communityRepo.countPosts(),
    ]);
    res.json({ data: { voces, propuestas, senales, posts } });
  } catch (err) {
    next(err);
  }
});

const vocesRecientesQuery = z.object({
  limit: z.coerce.number().int().min(1).max(30).default(12),
});

/** Latest approved dreams for the landing voces ticker, newest first. */
router.get('/voces-recientes', async (req, res, next) => {
  try {
    const { limit } = vocesRecientesQuery.parse(req.query);
    const repo = new DreamsRepository(getDb());
    const items = await repo.listApproved({ limit });
    res.json({
      data: items.map((d) => ({ id: d.id, texto: d.body, categoria: d.category })),
    });
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
