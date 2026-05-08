/**
 * GoalsRepository — civic goals + weekly check-ins.
 */
import { and, desc, eq, gte } from 'drizzle-orm';

import { civicGoals, weeklyCheckins } from '../schema/goals.js';

import type { Db } from '../client.js';
import type {
  CivicGoal,
  NewCivicGoal,
  NewWeeklyCheckin,
  WeeklyCheckin,
} from '../schema/goals.js';

export class GoalsRepository {
  constructor(private readonly db: Db) {}

  async createGoal(input: NewCivicGoal): Promise<CivicGoal> {
    const [row] = await this.db.insert(civicGoals).values(input).returning();
    if (!row) throw new Error('Failed to insert goal');
    return row;
  }

  async findGoal(id: number): Promise<CivicGoal | undefined> {
    const [row] = await this.db.select().from(civicGoals).where(eq(civicGoals.id, id)).limit(1);
    return row;
  }

  async listActiveForUser(userId: number): Promise<CivicGoal[]> {
    return this.db
      .select()
      .from(civicGoals)
      .where(and(eq(civicGoals.userId, userId), eq(civicGoals.status, 'active')))
      .orderBy(desc(civicGoals.priority), desc(civicGoals.createdAt));
  }

  async updateGoal(id: number, patch: Partial<Omit<NewCivicGoal, 'id' | 'userId' | 'createdAt'>>): Promise<CivicGoal | undefined> {
    const [row] = await this.db
      .update(civicGoals)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(civicGoals.id, id))
      .returning();
    return row;
  }

  async completeGoal(id: number): Promise<void> {
    const now = new Date();
    await this.db
      .update(civicGoals)
      .set({ status: 'completed', completedAt: now, updatedAt: now })
      .where(eq(civicGoals.id, id));
  }

  // ---------- Weekly check-ins ----------

  async addCheckin(input: NewWeeklyCheckin): Promise<WeeklyCheckin> {
    const [row] = await this.db.insert(weeklyCheckins).values(input).returning();
    if (!row) throw new Error('Failed to insert check-in');
    return row;
  }

  async findCurrentWeekCheckin(userId: number, weekStart: Date): Promise<WeeklyCheckin | undefined> {
    const [row] = await this.db
      .select()
      .from(weeklyCheckins)
      .where(and(eq(weeklyCheckins.userId, userId), eq(weeklyCheckins.weekStart, weekStart)))
      .limit(1);
    return row;
  }

  async listCheckins(userId: number, since?: Date, limit = 12): Promise<WeeklyCheckin[]> {
    const filter = since
      ? and(eq(weeklyCheckins.userId, userId), gte(weeklyCheckins.weekStart, since))
      : eq(weeklyCheckins.userId, userId);
    return this.db
      .select()
      .from(weeklyCheckins)
      .where(filter)
      .orderBy(desc(weeklyCheckins.weekStart))
      .limit(limit);
  }
}
