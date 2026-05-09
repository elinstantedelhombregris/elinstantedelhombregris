/**
 * GamificationRepository — XP, levels, challenges, badges, activity, rankings.
 */
import { and, asc, desc, eq, sql } from 'drizzle-orm';

import {
  badges,
  challengeSteps,
  challenges,
  dailyActivity,
  rankings,
  userBadges,
  userChallengeProgress,
  userLevels,
} from '../schema/gamification.js';

import type { Db } from '../client.js';
import type {
  Badge,
  Challenge,
  ChallengeStep,
  DailyActivity,
  NewBadge,
  NewChallenge,
  NewChallengeStep,
  NewDailyActivity,
  NewUserBadge,
  NewUserChallengeProgress,
  NewUserLevel,
  Ranking,
  UserBadge,
  UserChallengeProgress,
  UserLevel,
} from '../schema/gamification.js';

export class GamificationRepository {
  constructor(private readonly db: Db) {}

  // ---------- User levels ----------

  async getOrCreateUserLevel(userId: number): Promise<UserLevel> {
    const [existing] = await this.db.select().from(userLevels).where(eq(userLevels.userId, userId)).limit(1);
    if (existing) return existing;
    const [row] = await this.db.insert(userLevels).values({ userId } as NewUserLevel).returning();
    if (!row) throw new Error('Failed to insert user level');
    return row;
  }

  async addXp(userId: number, xpDelta: number): Promise<UserLevel | undefined> {
    const [row] = await this.db
      .update(userLevels)
      .set({ xp: sql`${userLevels.xp} + ${xpDelta}`, updatedAt: new Date() })
      .where(eq(userLevels.userId, userId))
      .returning();
    return row;
  }

  // ---------- Challenges ----------

  async createChallenge(input: NewChallenge): Promise<Challenge> {
    const [row] = await this.db.insert(challenges).values(input).returning();
    if (!row) throw new Error('Failed to insert challenge');
    return row;
  }

  async findChallengeBySlug(slug: string): Promise<Challenge | undefined> {
    const [row] = await this.db.select().from(challenges).where(eq(challenges.slug, slug)).limit(1);
    return row;
  }

  async listActiveChallenges(cadence?: string): Promise<Challenge[]> {
    const filter = cadence ? and(eq(challenges.isActive, true), eq(challenges.cadence, cadence)) : eq(challenges.isActive, true);
    return this.db.select().from(challenges).where(filter).orderBy(desc(challenges.createdAt));
  }

  async addChallengeStep(input: NewChallengeStep): Promise<ChallengeStep> {
    const [row] = await this.db.insert(challengeSteps).values(input).returning();
    if (!row) throw new Error('Failed to insert challenge step');
    return row;
  }

  async listChallengeSteps(challengeId: number): Promise<ChallengeStep[]> {
    return this.db
      .select()
      .from(challengeSteps)
      .where(eq(challengeSteps.challengeId, challengeId))
      .orderBy(asc(challengeSteps.orderIndex));
  }

  // ---------- User challenge progress ----------

  async startUserChallenge(input: NewUserChallengeProgress): Promise<UserChallengeProgress> {
    const [row] = await this.db.insert(userChallengeProgress).values(input).returning();
    if (!row) throw new Error('Failed to start challenge');
    return row;
  }

  async findUserChallengeProgress(userId: number, challengeId: number): Promise<UserChallengeProgress | undefined> {
    const [row] = await this.db
      .select()
      .from(userChallengeProgress)
      .where(
        and(eq(userChallengeProgress.userId, userId), eq(userChallengeProgress.challengeId, challengeId)),
      )
      .limit(1);
    return row;
  }

  async updateUserChallengeProgress(
    id: number,
    patch: Partial<Pick<UserChallengeProgress, 'stepsCompleted' | 'status' | 'completedAt'>>,
  ): Promise<UserChallengeProgress | undefined> {
    const [row] = await this.db
      .update(userChallengeProgress)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(userChallengeProgress.id, id))
      .returning();
    return row;
  }

  // ---------- Badges ----------

  async createBadge(input: NewBadge): Promise<Badge> {
    const [row] = await this.db.insert(badges).values(input).returning();
    if (!row) throw new Error('Failed to insert badge');
    return row;
  }

  async findBadgeBySlug(slug: string): Promise<Badge | undefined> {
    const [row] = await this.db.select().from(badges).where(eq(badges.slug, slug)).limit(1);
    return row;
  }

  async awardBadge(input: NewUserBadge): Promise<UserBadge> {
    const [row] = await this.db.insert(userBadges).values(input).returning();
    if (!row) throw new Error('Failed to award badge');
    return row;
  }

  async listUserBadges(userId: number): Promise<UserBadge[]> {
    return this.db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  // ---------- Daily activity ----------

  async logActivity(input: NewDailyActivity): Promise<DailyActivity> {
    const [row] = await this.db.insert(dailyActivity).values(input).returning();
    if (!row) throw new Error('Failed to log activity');
    if (input.xpAwarded && input.xpAwarded !== 0) {
      // addXp is a bare UPDATE — it silently no-ops if user_levels has
      // no row yet. Guarantee the row exists so XP never gets dropped.
      await this.getOrCreateUserLevel(input.userId);
      await this.addXp(input.userId, input.xpAwarded);
    }
    return row;
  }

  async listRecentActivity(userId: number, limit = 50): Promise<DailyActivity[]> {
    return this.db
      .select()
      .from(dailyActivity)
      .where(eq(dailyActivity.userId, userId))
      .orderBy(desc(dailyActivity.createdAt))
      .limit(limit);
  }

  // ---------- Rankings ----------

  async getLeaderboard(opts: {
    periodKind: string;
    periodStart: Date | null;
    scopeKind: string;
    scopeId?: number;
    limit?: number;
  }): Promise<Ranking[]> {
    const { periodKind, periodStart, scopeKind, scopeId, limit = 50 } = opts;
    const filters = [
      eq(rankings.periodKind, periodKind),
      eq(rankings.scopeKind, scopeKind),
    ];
    if (periodStart) filters.push(eq(rankings.periodStart, periodStart));
    else filters.push(sql`${rankings.periodStart} is null`);
    if (scopeId !== undefined) filters.push(eq(rankings.scopeId, scopeId));
    else filters.push(sql`${rankings.scopeId} is null`);
    return this.db
      .select()
      .from(rankings)
      .where(and(...filters))
      .orderBy(asc(rankings.rank))
      .limit(limit);
  }
}
