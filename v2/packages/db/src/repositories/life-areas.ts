/**
 * LifeAreasRepository — wheel-of-life self-assessment + actions + chests.
 *
 * Aggressively consolidates v1's 21-table life-area subsystem into 10
 * tables; this repository provides the read/write surface needed by
 * the dashboard, quiz, area detail, and chest features.
 */
import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';

import {
  lifeAreaActionCompletions,
  lifeAreaActions,
  lifeAreaChests,
  lifeAreaMilestones,
  lifeAreaQuizQuestions,
  lifeAreaQuizResponses,
  lifeAreaSubcategories,
  lifeAreaXpLog,
  lifeAreas,
  userLifeAreaState,
} from '../schema/life-areas.js';

import type { Db } from '../client.js';
import type {
  LifeArea,
  LifeAreaAction,
  LifeAreaActionCompletion,
  LifeAreaChest,
  LifeAreaMilestone,
  LifeAreaQuizQuestion,
  LifeAreaQuizResponse,
  LifeAreaSubcategory,
  NewLifeAreaActionCompletion,
  NewLifeAreaChest,
  NewLifeAreaMilestone,
  NewLifeAreaQuizResponse,
  NewLifeAreaXpLog,
  UserLifeAreaState,
} from '../schema/life-areas.js';

export class LifeAreasRepository {
  constructor(private readonly db: Db) {}

  // ---------- Catalogs ----------

  async listAreas(): Promise<LifeArea[]> {
    return this.db
      .select()
      .from(lifeAreas)
      .where(eq(lifeAreas.isActive, true))
      .orderBy(asc(lifeAreas.orderIndex));
  }

  async findAreaBySlug(slug: string): Promise<LifeArea | undefined> {
    const [row] = await this.db.select().from(lifeAreas).where(eq(lifeAreas.slug, slug)).limit(1);
    return row;
  }

  async listSubcategories(lifeAreaId: number): Promise<LifeAreaSubcategory[]> {
    return this.db
      .select()
      .from(lifeAreaSubcategories)
      .where(eq(lifeAreaSubcategories.lifeAreaId, lifeAreaId))
      .orderBy(asc(lifeAreaSubcategories.orderIndex));
  }

  async listQuestions(lifeAreaId: number, category?: string): Promise<LifeAreaQuizQuestion[]> {
    const filter = category
      ? and(eq(lifeAreaQuizQuestions.lifeAreaId, lifeAreaId), eq(lifeAreaQuizQuestions.category, category))
      : eq(lifeAreaQuizQuestions.lifeAreaId, lifeAreaId);
    return this.db
      .select()
      .from(lifeAreaQuizQuestions)
      .where(filter)
      .orderBy(asc(lifeAreaQuizQuestions.orderIndex));
  }

  // ---------- Quiz responses ----------

  async upsertResponse(input: NewLifeAreaQuizResponse): Promise<LifeAreaQuizResponse> {
    const existing = await this.db
      .select()
      .from(lifeAreaQuizResponses)
      .where(
        and(
          eq(lifeAreaQuizResponses.userId, input.userId),
          eq(lifeAreaQuizResponses.questionId, input.questionId),
        ),
      )
      .limit(1);
    if (existing[0]) {
      const [row] = await this.db
        .update(lifeAreaQuizResponses)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(lifeAreaQuizResponses.id, existing[0].id))
        .returning();
      if (!row) throw new Error('Failed to update response');
      return row;
    }
    const [row] = await this.db.insert(lifeAreaQuizResponses).values(input).returning();
    if (!row) throw new Error('Failed to insert response');
    return row;
  }

  async listResponses(userId: number, lifeAreaId?: number): Promise<LifeAreaQuizResponse[]> {
    if (lifeAreaId === undefined) {
      return this.db.select().from(lifeAreaQuizResponses).where(eq(lifeAreaQuizResponses.userId, userId));
    }
    // Join through questions to filter by area.
    return this.db
      .select({
        id: lifeAreaQuizResponses.id,
        userId: lifeAreaQuizResponses.userId,
        questionId: lifeAreaQuizResponses.questionId,
        currentValue: lifeAreaQuizResponses.currentValue,
        desiredValue: lifeAreaQuizResponses.desiredValue,
        textValue: lifeAreaQuizResponses.textValue,
        createdAt: lifeAreaQuizResponses.createdAt,
        updatedAt: lifeAreaQuizResponses.updatedAt,
      })
      .from(lifeAreaQuizResponses)
      .innerJoin(lifeAreaQuizQuestions, eq(lifeAreaQuizQuestions.id, lifeAreaQuizResponses.questionId))
      .where(
        and(eq(lifeAreaQuizResponses.userId, userId), eq(lifeAreaQuizQuestions.lifeAreaId, lifeAreaId)),
      );
  }

  // ---------- User state ----------

  async getOrCreateState(userId: number, lifeAreaId: number): Promise<UserLifeAreaState> {
    const [existing] = await this.db
      .select()
      .from(userLifeAreaState)
      .where(and(eq(userLifeAreaState.userId, userId), eq(userLifeAreaState.lifeAreaId, lifeAreaId)))
      .limit(1);
    if (existing) return existing;
    const [row] = await this.db.insert(userLifeAreaState).values({ userId, lifeAreaId }).returning();
    if (!row) throw new Error('Failed to insert user life-area state');
    return row;
  }

  async listStateForUser(userId: number): Promise<UserLifeAreaState[]> {
    return this.db.select().from(userLifeAreaState).where(eq(userLifeAreaState.userId, userId));
  }

  async updateState(
    id: number,
    patch: Partial<Pick<UserLifeAreaState, 'currentScore' | 'desiredScore' | 'gap' | 'xp' | 'level' | 'mastery' | 'currency' | 'streakDays' | 'longestStreakDays' | 'lastActiveDate'>>,
  ): Promise<UserLifeAreaState | undefined> {
    const [row] = await this.db
      .update(userLifeAreaState)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(userLifeAreaState.id, id))
      .returning();
    return row;
  }

  // ---------- Actions ----------

  async listActions(lifeAreaId: number): Promise<LifeAreaAction[]> {
    return this.db
      .select()
      .from(lifeAreaActions)
      .where(and(eq(lifeAreaActions.lifeAreaId, lifeAreaId), eq(lifeAreaActions.isActive, true)));
  }

  async completeAction(input: NewLifeAreaActionCompletion): Promise<LifeAreaActionCompletion> {
    const [row] = await this.db.insert(lifeAreaActionCompletions).values(input).returning();
    if (!row) throw new Error('Failed to record completion');
    return row;
  }

  async listCompletions(userId: number, limit = 50): Promise<LifeAreaActionCompletion[]> {
    return this.db
      .select()
      .from(lifeAreaActionCompletions)
      .where(eq(lifeAreaActionCompletions.userId, userId))
      .orderBy(desc(lifeAreaActionCompletions.completedAt))
      .limit(limit);
  }

  // ---------- Milestones ----------

  async addMilestone(input: NewLifeAreaMilestone): Promise<LifeAreaMilestone> {
    const [row] = await this.db.insert(lifeAreaMilestones).values(input).returning();
    if (!row) throw new Error('Failed to insert milestone');
    return row;
  }

  async listMilestones(userId: number, lifeAreaId?: number): Promise<LifeAreaMilestone[]> {
    const filter = lifeAreaId !== undefined
      ? and(eq(lifeAreaMilestones.userId, userId), eq(lifeAreaMilestones.lifeAreaId, lifeAreaId))
      : eq(lifeAreaMilestones.userId, userId);
    return this.db
      .select()
      .from(lifeAreaMilestones)
      .where(filter)
      .orderBy(desc(lifeAreaMilestones.achievedAt));
  }

  async shareMilestone(id: number): Promise<void> {
    await this.db
      .update(lifeAreaMilestones)
      .set({ sharedAt: new Date() })
      .where(eq(lifeAreaMilestones.id, id));
  }

  // ---------- XP log ----------

  async logXp(input: NewLifeAreaXpLog): Promise<void> {
    await this.db.insert(lifeAreaXpLog).values(input);
    await this.db
      .update(userLifeAreaState)
      .set({ xp: sql`${userLifeAreaState.xp} + ${input.xpDelta}`, updatedAt: new Date() })
      .where(
        and(eq(userLifeAreaState.userId, input.userId), eq(userLifeAreaState.lifeAreaId, input.lifeAreaId)),
      );
  }

  // ---------- Chests ----------

  async grantChest(input: NewLifeAreaChest): Promise<LifeAreaChest> {
    const [row] = await this.db.insert(lifeAreaChests).values(input).returning();
    if (!row) throw new Error('Failed to grant chest');
    return row;
  }

  async listUnclaimedChests(userId: number): Promise<LifeAreaChest[]> {
    return this.db
      .select()
      .from(lifeAreaChests)
      .where(and(eq(lifeAreaChests.userId, userId), isNull(lifeAreaChests.claimedAt)))
      .orderBy(desc(lifeAreaChests.createdAt));
  }

  async claimChest(id: number): Promise<LifeAreaChest | undefined> {
    const [row] = await this.db
      .update(lifeAreaChests)
      .set({ claimedAt: new Date() })
      .where(and(eq(lifeAreaChests.id, id), isNull(lifeAreaChests.claimedAt)))
      .returning();
    return row;
  }
}
