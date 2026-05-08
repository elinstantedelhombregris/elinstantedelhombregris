/**
 * FeedbackRepository — platform feedback inbox.
 */
import { and, desc, eq } from 'drizzle-orm';

import { platformFeedback } from '../schema/feedback.js';

import type { Db } from '../client.js';
import type { NewPlatformFeedback, PlatformFeedback } from '../schema/feedback.js';

export class FeedbackRepository {
  constructor(private readonly db: Db) {}

  async submit(input: NewPlatformFeedback): Promise<PlatformFeedback> {
    const [row] = await this.db.insert(platformFeedback).values(input).returning();
    if (!row) throw new Error('Failed to submit feedback');
    return row;
  }

  async findById(id: number): Promise<PlatformFeedback | undefined> {
    const [row] = await this.db.select().from(platformFeedback).where(eq(platformFeedback.id, id)).limit(1);
    return row;
  }

  async listForUser(userId: number, limit = 50): Promise<PlatformFeedback[]> {
    return this.db
      .select()
      .from(platformFeedback)
      .where(eq(platformFeedback.userId, userId))
      .orderBy(desc(platformFeedback.createdAt))
      .limit(limit);
  }

  async listByStatus(status: string, limit = 50): Promise<PlatformFeedback[]> {
    return this.db
      .select()
      .from(platformFeedback)
      .where(eq(platformFeedback.status, status))
      .orderBy(desc(platformFeedback.createdAt))
      .limit(limit);
  }

  async setStatus(id: number, status: string, adminResponse?: string): Promise<void> {
    const patch: { status: string; adminResponse?: string; updatedAt: Date } = { status, updatedAt: new Date() };
    if (adminResponse !== undefined) patch.adminResponse = adminResponse;
    await this.db.update(platformFeedback).set(patch).where(eq(platformFeedback.id, id));
  }

  async updateAndAck(id: number, status: string, adminResponse: string): Promise<PlatformFeedback | undefined> {
    const [row] = await this.db
      .update(platformFeedback)
      .set({ status, adminResponse, updatedAt: new Date() })
      .where(and(eq(platformFeedback.id, id)))
      .returning();
    return row;
  }
}
