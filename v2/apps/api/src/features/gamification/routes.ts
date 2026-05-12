/**
 * Gamification HTTP slice.
 *
 *   GET  /api/gamification/me          (auth) — XP + level + badges + activity
 *   GET  /api/gamification/badges      — public badge catalog
 *   GET  /api/gamification/challenges  (auth-optional) — challenges + progress
 *   POST /api/gamification/challenges/:slug/start    (auth)
 *   POST /api/gamification/challenges/:slug/advance  (auth)
 *   GET  /api/gamification/leaderboard?period=weekly|all_time — cached rankings
 */
import {
  GamificationRepository,
  and,
  badges as badgesTable,
  challengeSteps as challengeStepsTable,
  challenges as challengesTable,
  eq,
  getDb,
  rankings,
  sql,
  userBadges,
  userChallengeProgress as ucp,
  users,
} from '@v2/db';
import { xpToNextLevel } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

import { challengeAdvanceSchema, leaderboardQuerySchema } from './validation.js';

const router: RouterType = Router();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const db = getDb();
    const repo = new GamificationRepository(db);

    const userLevel = await repo.getOrCreateUserLevel(req.user.id);
    const curve = xpToNextLevel(userLevel.xp);
    const recent = await repo.listRecentActivity(req.user.id, 20);

    const myBadges = await db
      .select({
        slug: badgesTable.slug,
        title: badgesTable.title,
        description: badgesTable.description,
        tier: badgesTable.tier,
        iconUrl: badgesTable.iconUrl,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badgesTable, eq(userBadges.badgeId, badgesTable.id))
      .where(eq(userBadges.userId, req.user.id));

    const inProgress = await db
      .select({
        progressId: ucp.id,
        challengeId: ucp.challengeId,
        slug: challengesTable.slug,
        title: challengesTable.title,
        description: challengesTable.description,
        cadence: challengesTable.cadence,
        xpReward: challengesTable.xpReward,
        stepsCompleted: ucp.stepsCompleted,
        status: ucp.status,
      })
      .from(ucp)
      .innerJoin(challengesTable, eq(ucp.challengeId, challengesTable.id))
      .where(and(eq(ucp.userId, req.user.id), eq(ucp.status, 'in_progress')));

    res.json({
      data: {
        xp: userLevel.xp,
        level: userLevel.level,
        streakDays: userLevel.streakDays,
        longestStreakDays: userLevel.longestStreakDays,
        xpIntoLevel: curve.xpIntoLevel,
        xpForCurrent: curve.xpForCurrent,
        xpForNext: curve.xpForNext,
        badges: myBadges,
        recentActivity: recent.map((a) => ({
          id: a.id,
          kind: a.kind,
          xpAwarded: a.xpAwarded,
          activityDate: a.activityDate,
          createdAt: a.createdAt,
          payload: a.payload,
        })),
        inProgressChallenges: inProgress,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/badges', async (_req, res, next) => {
  try {
    const db = getDb();
    const all = await db
      .select()
      .from(badgesTable)
      .where(eq(badgesTable.isActive, true));
    res.json({ data: { badges: all } });
  } catch (err) {
    next(err);
  }
});

router.get('/challenges', optionalAuthenticate, async (req, res, next) => {
  try {
    const db = getDb();
    const active = await db
      .select()
      .from(challengesTable)
      .where(eq(challengesTable.isActive, true));

    const stepsByChallenge = new Map<number, { id: number; title: string; description: string | null; orderIndex: number; xpReward: number }[]>();
    if (active.length > 0) {
      const allSteps = await db.select().from(challengeStepsTable);
      for (const s of allSteps) {
        const bucket = stepsByChallenge.get(s.challengeId) ?? [];
        bucket.push({
          id: s.id,
          title: s.title,
          description: s.description ?? null,
          orderIndex: s.orderIndex,
          xpReward: s.xpReward,
        });
        stepsByChallenge.set(s.challengeId, bucket);
      }
      for (const list of stepsByChallenge.values()) list.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    let progressByChallenge = new Map<number, { stepsCompleted: unknown; status: string }>();
    if (req.user) {
      const myProgress = await db
        .select({ challengeId: ucp.challengeId, stepsCompleted: ucp.stepsCompleted, status: ucp.status })
        .from(ucp)
        .where(eq(ucp.userId, req.user.id));
      progressByChallenge = new Map(myProgress.map((p) => [p.challengeId, { stepsCompleted: p.stepsCompleted, status: p.status }]));
    }

    res.json({
      data: {
        challenges: active.map((c) => ({
          ...c,
          steps: stepsByChallenge.get(c.id) ?? [],
          progress: progressByChallenge.get(c.id) ?? null,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/challenges/:slug/start', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const slug = req.params.slug;
    if (typeof slug !== 'string') throw new HttpError(400, 'INVALID_SLUG', 'Slug requerido.');
    const repo = new GamificationRepository(getDb());
    const challenge = await repo.findChallengeBySlug(slug);
    if (!challenge) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Desafío no encontrado.' } });
      return;
    }
    const existing = await repo.findUserChallengeProgress(req.user.id, challenge.id);
    if (existing) {
      res.json({ data: { progress: existing } });
      return;
    }
    const progress = await repo.startUserChallenge({
      userId: req.user.id,
      challengeId: challenge.id,
      stepsCompleted: [],
      status: 'in_progress',
    });
    res.status(201).json({ data: { progress } });
  } catch (err) {
    next(err);
  }
});

router.post('/challenges/:slug/advance', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const slug = req.params.slug;
    if (typeof slug !== 'string') throw new HttpError(400, 'INVALID_SLUG', 'Slug requerido.');
    const { orderIndex } = challengeAdvanceSchema.parse(req.body);
    const repo = new GamificationRepository(getDb());
    const challenge = await repo.findChallengeBySlug(slug);
    if (!challenge) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Desafío no encontrado.' } });
      return;
    }
    const steps = await repo.listChallengeSteps(challenge.id);
    const totalSteps = steps.length;
    const progress = await repo.findUserChallengeProgress(req.user.id, challenge.id);
    if (!progress) {
      res.status(409).json({ error: { code: 'NOT_STARTED', message: 'Empezá el desafío primero.' } });
      return;
    }
    const validIndices = new Set(steps.map((s) => s.orderIndex));
    if (!validIndices.has(orderIndex)) {
      res.status(400).json({ error: { code: 'INVALID_STEP', message: 'Paso no válido.' } });
      return;
    }
    const completed = Array.isArray(progress.stepsCompleted) ? [...(progress.stepsCompleted as number[])] : [];
    if (!completed.includes(orderIndex)) completed.push(orderIndex);
    const isComplete = completed.length >= totalSteps;
    const patch: Parameters<typeof repo.updateUserChallengeProgress>[1] = {
      stepsCompleted: completed,
      status: isComplete ? 'completed' : 'in_progress',
    };
    if (isComplete) patch.completedAt = new Date();
    const updated = await repo.updateUserChallengeProgress(progress.id, patch);
    res.json({ data: { progress: updated, completed: isComplete } });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
    const filters = leaderboardQuerySchema.parse(req.query);
    const db = getDb();

    const periodStart = filters.period === 'weekly' ? mondayUtc(new Date()) : null;

    const rows = await db
      .select({
        rank: rankings.rank,
        xp: rankings.xp,
        userId: rankings.userId,
        displayName: users.name,
      })
      .from(rankings)
      .innerJoin(users, eq(rankings.userId, users.id))
      .where(
        and(
          eq(rankings.periodKind, filters.period),
          eq(rankings.scopeKind, 'global'),
          periodStart === null
            ? sql`${rankings.periodStart} is null`
            : eq(rankings.periodStart, periodStart),
          sql`${rankings.scopeId} is null`,
        ),
      )
      .orderBy(rankings.rank)
      .limit(filters.limit);

    res.json({
      data: {
        period: filters.period,
        periodStart: periodStart?.toISOString() ?? null,
        rows: rows.map((r) => ({
          rank: r.rank,
          xp: r.xp,
          userId: r.userId,
          displayName: r.displayName,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

function mondayUtc(now: Date): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

export { router as gamificationRouter };
