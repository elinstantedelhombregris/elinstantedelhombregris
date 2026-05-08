/**
 * CivicAssessmentRepository — assessment lifecycle + scored profile.
 */
import { and, desc, eq } from 'drizzle-orm';

import {
  civicAssessmentResponses,
  civicAssessments,
  civicProfiles,
} from '../schema/civic-assessment.js';

import type { Db } from '../client.js';
import type {
  CivicAssessment,
  CivicAssessmentResponse,
  CivicProfile,
  NewCivicAssessmentResponse,
  NewCivicProfile,
} from '../schema/civic-assessment.js';

export class CivicAssessmentRepository {
  constructor(private readonly db: Db) {}

  async startAssessment(userId: number, questionsVersion: string): Promise<CivicAssessment> {
    const [row] = await this.db
      .insert(civicAssessments)
      .values({ userId, questionsVersion, status: 'in_progress' })
      .returning();
    if (!row) throw new Error('Failed to start assessment');
    return row;
  }

  async getCurrentForUser(userId: number): Promise<CivicAssessment | undefined> {
    const [row] = await this.db
      .select()
      .from(civicAssessments)
      .where(and(eq(civicAssessments.userId, userId), eq(civicAssessments.status, 'in_progress')))
      .orderBy(desc(civicAssessments.createdAt))
      .limit(1);
    return row;
  }

  async listForUser(userId: number, limit = 20): Promise<CivicAssessment[]> {
    return this.db
      .select()
      .from(civicAssessments)
      .where(eq(civicAssessments.userId, userId))
      .orderBy(desc(civicAssessments.createdAt))
      .limit(limit);
  }

  async findById(id: number): Promise<CivicAssessment | undefined> {
    const [row] = await this.db.select().from(civicAssessments).where(eq(civicAssessments.id, id)).limit(1);
    return row;
  }

  async addResponse(input: NewCivicAssessmentResponse): Promise<CivicAssessmentResponse> {
    const [row] = await this.db.insert(civicAssessmentResponses).values(input).returning();
    if (!row) throw new Error('Failed to insert response');
    return row;
  }

  async listResponses(assessmentId: number): Promise<CivicAssessmentResponse[]> {
    return this.db
      .select()
      .from(civicAssessmentResponses)
      .where(eq(civicAssessmentResponses.assessmentId, assessmentId));
  }

  async complete(assessmentId: number): Promise<void> {
    const now = new Date();
    await this.db
      .update(civicAssessments)
      .set({ status: 'completed', completedAt: now, updatedAt: now })
      .where(eq(civicAssessments.id, assessmentId));
  }

  // ---------- Profile ----------

  async upsertProfile(input: NewCivicProfile): Promise<CivicProfile> {
    const existing = await this.db
      .select()
      .from(civicProfiles)
      .where(eq(civicProfiles.userId, input.userId))
      .limit(1);
    if (existing[0]) {
      const [row] = await this.db
        .update(civicProfiles)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(civicProfiles.userId, input.userId))
        .returning();
      if (!row) throw new Error('Failed to update profile');
      return row;
    }
    const [row] = await this.db.insert(civicProfiles).values(input).returning();
    if (!row) throw new Error('Failed to insert profile');
    return row;
  }

  async getProfile(userId: number): Promise<CivicProfile | undefined> {
    const [row] = await this.db.select().from(civicProfiles).where(eq(civicProfiles.userId, userId)).limit(1);
    return row;
  }
}
