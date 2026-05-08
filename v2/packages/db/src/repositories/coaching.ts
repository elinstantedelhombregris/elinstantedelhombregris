/**
 * CoachingRepository — AI coaching sessions + messages + prompt library.
 */
import { and, asc, desc, eq } from 'drizzle-orm';

import { coachingMessages, coachingPrompts, coachingSessions } from '../schema/coaching.js';

import type { Db } from '../client.js';
import type {
  CoachingMessage,
  CoachingPrompt,
  CoachingSession,
  NewCoachingMessage,
  NewCoachingSession,
} from '../schema/coaching.js';

export class CoachingRepository {
  constructor(private readonly db: Db) {}

  // ---------- Sessions ----------

  async startSession(input: NewCoachingSession): Promise<CoachingSession> {
    const [row] = await this.db.insert(coachingSessions).values(input).returning();
    if (!row) throw new Error('Failed to start coaching session');
    return row;
  }

  async findSession(id: number): Promise<CoachingSession | undefined> {
    const [row] = await this.db.select().from(coachingSessions).where(eq(coachingSessions.id, id)).limit(1);
    return row;
  }

  async listSessions(userId: number, limit = 20): Promise<CoachingSession[]> {
    return this.db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.userId, userId))
      .orderBy(desc(coachingSessions.updatedAt))
      .limit(limit);
  }

  async touchSession(id: number, title?: string): Promise<void> {
    const patch: { updatedAt: Date; title?: string } = { updatedAt: new Date() };
    if (title) patch.title = title;
    await this.db.update(coachingSessions).set(patch).where(eq(coachingSessions.id, id));
  }

  async archiveSession(id: number): Promise<void> {
    await this.db
      .update(coachingSessions)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(coachingSessions.id, id));
  }

  // ---------- Messages ----------

  async appendMessage(input: NewCoachingMessage): Promise<CoachingMessage> {
    const [row] = await this.db.insert(coachingMessages).values(input).returning();
    if (!row) throw new Error('Failed to append message');
    await this.touchSession(input.sessionId);
    return row;
  }

  async listMessages(sessionId: number): Promise<CoachingMessage[]> {
    return this.db
      .select()
      .from(coachingMessages)
      .where(eq(coachingMessages.sessionId, sessionId))
      .orderBy(asc(coachingMessages.createdAt));
  }

  // ---------- Prompts ----------

  async listActivePrompts(audience?: string): Promise<CoachingPrompt[]> {
    const filter = audience
      ? and(eq(coachingPrompts.isActive, 1), eq(coachingPrompts.audience, audience))
      : eq(coachingPrompts.isActive, 1);
    return this.db.select().from(coachingPrompts).where(filter).orderBy(asc(coachingPrompts.title));
  }

  async findPrompt(id: number): Promise<CoachingPrompt | undefined> {
    const [row] = await this.db.select().from(coachingPrompts).where(eq(coachingPrompts.id, id)).limit(1);
    return row;
  }
}
