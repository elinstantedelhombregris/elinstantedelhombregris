/**
 * PulsoRepository — citizen pulse signals + derived proposals + votes.
 */
import { and, desc, eq, sql } from 'drizzle-orm';

import {
  proposalStatusHistory,
  proposalVotes,
  proposals,
  pulseSignals,
} from '../schema/pulso.js';

import type { Db } from '../client.js';
import type {
  NewProposal,
  NewProposalStatusHistory,
  NewProposalVote,
  NewPulseSignal,
  Proposal,
  ProposalVote,
  PulseSignal,
} from '../schema/pulso.js';

export class PulsoRepository {
  constructor(private readonly db: Db) {}

  // ---------- Signals ----------

  async addSignal(input: NewPulseSignal): Promise<PulseSignal> {
    const [row] = await this.db.insert(pulseSignals).values(input).returning();
    if (!row) throw new Error('Failed to insert signal');
    return row;
  }

  async findSignal(id: number): Promise<PulseSignal | undefined> {
    const [row] = await this.db.select().from(pulseSignals).where(eq(pulseSignals.id, id)).limit(1);
    return row;
  }

  async listSignals(opts: { provinceId?: number; theme?: string; limit?: number } = {}): Promise<PulseSignal[]> {
    const { provinceId, theme, limit = 100 } = opts;
    const filters = [];
    if (provinceId !== undefined) filters.push(eq(pulseSignals.provinceId, provinceId));
    if (theme) filters.push(eq(pulseSignals.theme, theme));
    const where = filters.length > 0 ? and(...filters) : undefined;
    const q = this.db.select().from(pulseSignals);
    return where
      ? q.where(where).orderBy(desc(pulseSignals.createdAt)).limit(limit)
      : q.orderBy(desc(pulseSignals.createdAt)).limit(limit);
  }

  /** All pulse signals ever created — feeds the public "cifras" strip. */
  async countSignals(): Promise<number> {
    const [row] = await this.db.select({ count: sql<number>`count(*)::int` }).from(pulseSignals);
    return row?.count ?? 0;
  }

  /** Signals awaiting AI classification (theme IS NULL). */
  async listUnclassified(limit = 50): Promise<PulseSignal[]> {
    return this.db
      .select()
      .from(pulseSignals)
      .where(sql`${pulseSignals.theme} IS NULL`)
      .orderBy(pulseSignals.createdAt)
      .limit(limit);
  }

  async updateClassification(
    id: number,
    patch: { theme: string; sentiment: number; topics: string[] },
  ): Promise<void> {
    await this.db
      .update(pulseSignals)
      .set({ theme: patch.theme, sentiment: patch.sentiment, topics: patch.topics })
      .where(eq(pulseSignals.id, id));
  }

  // ---------- Proposals ----------

  async createProposal(input: NewProposal): Promise<Proposal> {
    const [row] = await this.db.insert(proposals).values(input).returning();
    if (!row) throw new Error('Failed to insert proposal');
    return row;
  }

  async findProposal(id: number): Promise<Proposal | undefined> {
    const [row] = await this.db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
    return row;
  }

  async listProposals(opts: { provinceId?: number; status?: string; limit?: number } = {}): Promise<Proposal[]> {
    const { provinceId, status, limit = 50 } = opts;
    const filters = [];
    if (provinceId !== undefined) filters.push(eq(proposals.provinceId, provinceId));
    if (status) filters.push(eq(proposals.status, status));
    const where = filters.length > 0 ? and(...filters) : undefined;
    const q = this.db.select().from(proposals);
    return where
      ? q.where(where).orderBy(desc(proposals.voteScore)).limit(limit)
      : q.orderBy(desc(proposals.voteScore)).limit(limit);
  }

  /**
   * All proposals ever created (any status) — feeds the public "cifras"
   * strip. Unlike the dreams "voces" count, proposals aren't gated by an
   * approval workflow, so this is a plain total.
   */
  async countProposals(): Promise<number> {
    const [row] = await this.db.select({ count: sql<number>`count(*)::int` }).from(proposals);
    return row?.count ?? 0;
  }

  async setProposalStatus(id: number, fromStatus: string, toStatus: string, changedBy?: number, note?: string): Promise<void> {
    await this.db
      .update(proposals)
      .set({ status: toStatus, updatedAt: new Date() })
      .where(eq(proposals.id, id));
    const historyInput: NewProposalStatusHistory = { proposalId: id, fromStatus, toStatus };
    if (changedBy !== undefined) historyInput.changedBy = changedBy;
    if (note !== undefined) historyInput.note = note;
    await this.db.insert(proposalStatusHistory).values(historyInput);
  }

  // ---------- Votes ----------

  async castVote(input: NewProposalVote): Promise<ProposalVote> {
    // Cast as upsert: drop any existing vote, insert new.
    await this.db
      .delete(proposalVotes)
      .where(and(eq(proposalVotes.proposalId, input.proposalId), eq(proposalVotes.userId, input.userId)));
    const [row] = await this.db.insert(proposalVotes).values(input).returning();
    if (!row) throw new Error('Failed to cast vote');
    // Recompute aggregate. Cheap: per-proposal vote counts are small.
    const aggregate = await this.db
      .select({
        score: sql<number>`coalesce(sum(value), 0)::int`,
        cnt: sql<number>`count(*)::int`,
      })
      .from(proposalVotes)
      .where(eq(proposalVotes.proposalId, input.proposalId));
    const score = aggregate[0]?.score ?? 0;
    const cnt = aggregate[0]?.cnt ?? 0;
    await this.db
      .update(proposals)
      .set({ voteScore: score, voteCount: cnt, updatedAt: new Date() })
      .where(eq(proposals.id, input.proposalId));
    return row;
  }
}
