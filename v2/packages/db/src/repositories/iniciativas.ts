/**
 * IniciativasRepository — initiative life-cycle, members, milestones,
 * tasks, messages, activity feed, membership requests, mission evidence.
 */
import { and, desc, eq, sql } from 'drizzle-orm';

import {
  iniciativaActivity,
  iniciativaMembers,
  iniciativaMessages,
  iniciativaMilestones,
  iniciativaTasks,
  iniciativas,
  membershipRequests,
  missionEvidence,
} from '../schema/iniciativas.js';

import type { Db } from '../client.js';
import type {
  Iniciativa,
  IniciativaActivity,
  IniciativaMember,
  IniciativaMessage,
  IniciativaMilestone,
  IniciativaTask,
  MembershipRequest,
  MissionEvidence,
  NewIniciativa,
  NewIniciativaActivity,
  NewIniciativaMember,
  NewIniciativaMessage,
  NewIniciativaMilestone,
  NewIniciativaTask,
  NewMembershipRequest,
  NewMissionEvidence,
} from '../schema/iniciativas.js';

export class IniciativasRepository {
  constructor(private readonly db: Db) {}

  // ---------- Initiatives ----------

  async create(input: NewIniciativa): Promise<Iniciativa> {
    const [row] = await this.db.insert(iniciativas).values(input).returning();
    if (!row) throw new Error('Failed to insert iniciativa');
    return row;
  }

  async findBySlug(slug: string): Promise<Iniciativa | undefined> {
    const [row] = await this.db.select().from(iniciativas).where(eq(iniciativas.slug, slug)).limit(1);
    return row;
  }

  async findById(id: number): Promise<Iniciativa | undefined> {
    const [row] = await this.db.select().from(iniciativas).where(eq(iniciativas.id, id)).limit(1);
    return row;
  }

  async list(opts: { kind?: string; status?: string; limit?: number } = {}): Promise<Iniciativa[]> {
    const { kind, status, limit = 50 } = opts;
    const filters = [];
    if (kind) filters.push(eq(iniciativas.kind, kind));
    if (status) filters.push(eq(iniciativas.status, status));
    const where = filters.length > 0 ? and(...filters) : undefined;
    const q = this.db.select().from(iniciativas);
    return where
      ? q.where(where).orderBy(desc(iniciativas.updatedAt)).limit(limit)
      : q.orderBy(desc(iniciativas.updatedAt)).limit(limit);
  }

  // ---------- Members ----------

  async addMember(input: NewIniciativaMember): Promise<IniciativaMember> {
    const [row] = await this.db.insert(iniciativaMembers).values(input).returning();
    if (!row) throw new Error('Failed to add member');
    await this.db
      .update(iniciativas)
      .set({ memberCount: sql`${iniciativas.memberCount} + 1`, updatedAt: new Date() })
      .where(eq(iniciativas.id, input.iniciativaId));
    return row;
  }

  async removeMember(iniciativaId: number, userId: number): Promise<void> {
    await this.db
      .delete(iniciativaMembers)
      .where(and(eq(iniciativaMembers.iniciativaId, iniciativaId), eq(iniciativaMembers.userId, userId)));
    await this.db
      .update(iniciativas)
      .set({ memberCount: sql`greatest(${iniciativas.memberCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(iniciativas.id, iniciativaId));
  }

  async listMembers(iniciativaId: number): Promise<IniciativaMember[]> {
    return this.db.select().from(iniciativaMembers).where(eq(iniciativaMembers.iniciativaId, iniciativaId));
  }

  // ---------- Milestones / tasks ----------

  async addMilestone(input: NewIniciativaMilestone): Promise<IniciativaMilestone> {
    const [row] = await this.db.insert(iniciativaMilestones).values(input).returning();
    if (!row) throw new Error('Failed to insert milestone');
    return row;
  }

  async listMilestones(iniciativaId: number): Promise<IniciativaMilestone[]> {
    return this.db
      .select()
      .from(iniciativaMilestones)
      .where(eq(iniciativaMilestones.iniciativaId, iniciativaId));
  }

  async addTask(input: NewIniciativaTask): Promise<IniciativaTask> {
    const [row] = await this.db.insert(iniciativaTasks).values(input).returning();
    if (!row) throw new Error('Failed to insert task');
    return row;
  }

  async listTasks(iniciativaId: number, status?: string): Promise<IniciativaTask[]> {
    const filter = status
      ? and(eq(iniciativaTasks.iniciativaId, iniciativaId), eq(iniciativaTasks.status, status))
      : eq(iniciativaTasks.iniciativaId, iniciativaId);
    return this.db.select().from(iniciativaTasks).where(filter);
  }

  // ---------- Messages ----------

  async sendMessage(input: NewIniciativaMessage): Promise<IniciativaMessage> {
    const [row] = await this.db.insert(iniciativaMessages).values(input).returning();
    if (!row) throw new Error('Failed to insert message');
    return row;
  }

  async listMessages(iniciativaId: number, limit = 100): Promise<IniciativaMessage[]> {
    return this.db
      .select()
      .from(iniciativaMessages)
      .where(eq(iniciativaMessages.iniciativaId, iniciativaId))
      .orderBy(desc(iniciativaMessages.createdAt))
      .limit(limit);
  }

  // ---------- Activity feed ----------

  async log(input: NewIniciativaActivity): Promise<IniciativaActivity> {
    const [row] = await this.db.insert(iniciativaActivity).values(input).returning();
    if (!row) throw new Error('Failed to insert activity');
    return row;
  }

  async listActivity(iniciativaId: number, limit = 50): Promise<IniciativaActivity[]> {
    return this.db
      .select()
      .from(iniciativaActivity)
      .where(eq(iniciativaActivity.iniciativaId, iniciativaId))
      .orderBy(desc(iniciativaActivity.createdAt))
      .limit(limit);
  }

  // ---------- Membership requests ----------

  async requestMembership(input: NewMembershipRequest): Promise<MembershipRequest> {
    const [row] = await this.db.insert(membershipRequests).values(input).returning();
    if (!row) throw new Error('Failed to request membership');
    return row;
  }

  async listPendingRequests(iniciativaId: number): Promise<MembershipRequest[]> {
    return this.db
      .select()
      .from(membershipRequests)
      .where(
        and(eq(membershipRequests.iniciativaId, iniciativaId), eq(membershipRequests.status, 'pending')),
      );
  }

  async decideRequest(id: number, status: 'approved' | 'rejected'): Promise<void> {
    await this.db
      .update(membershipRequests)
      .set({ status, decidedAt: new Date() })
      .where(eq(membershipRequests.id, id));
  }

  // ---------- Mission evidence ----------

  async addEvidence(input: NewMissionEvidence): Promise<MissionEvidence> {
    const [row] = await this.db.insert(missionEvidence).values(input).returning();
    if (!row) throw new Error('Failed to insert evidence');
    return row;
  }

  async listEvidence(iniciativaId: number): Promise<MissionEvidence[]> {
    return this.db
      .select()
      .from(missionEvidence)
      .where(eq(missionEvidence.iniciativaId, iniciativaId))
      .orderBy(desc(missionEvidence.createdAt));
  }

  async verifyEvidence(id: number, verifiedBy: number): Promise<void> {
    await this.db
      .update(missionEvidence)
      .set({ isVerified: true, verifiedBy, verifiedAt: new Date() })
      .where(eq(missionEvidence.id, id));
  }
}
