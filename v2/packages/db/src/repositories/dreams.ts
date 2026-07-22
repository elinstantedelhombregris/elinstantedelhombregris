/**
 * DreamsRepository — map-friendly user aspirations.
 */
import { and, desc, eq, sql } from 'drizzle-orm';

import { dreams } from '../schema/dreams.js';

import type { Db } from '../client.js';
import type { Dream, NewDream } from '../schema/dreams.js';

export class DreamsRepository {
  constructor(private readonly db: Db) {}

  async create(input: NewDream): Promise<Dream> {
    const [row] = await this.db.insert(dreams).values(input).returning();
    if (!row) throw new Error('Failed to insert dream');
    return row;
  }

  async findById(id: number): Promise<Dream | undefined> {
    const [row] = await this.db.select().from(dreams).where(eq(dreams.id, id)).limit(1);
    return row;
  }

  async listApproved(opts: { provinceId?: number; category?: string; limit?: number } = {}): Promise<Dream[]> {
    const { provinceId, category, limit = 200 } = opts;
    const filters = [eq(dreams.status, 'approved')];
    if (provinceId !== undefined) filters.push(eq(dreams.provinceId, provinceId));
    if (category) filters.push(eq(dreams.category, category));
    return this.db
      .select()
      .from(dreams)
      .where(and(...filters))
      .orderBy(desc(dreams.createdAt))
      .limit(limit);
  }

  async listForUser(userId: number, limit = 50): Promise<Dream[]> {
    return this.db
      .select()
      .from(dreams)
      .where(eq(dreams.userId, userId))
      .orderBy(desc(dreams.createdAt))
      .limit(limit);
  }

  /**
   * Approved dream count — powers the public "voces" FOMO counter.
   * Mirrors the `status = 'approved'` filter used by convergence-summary
   * so every public number counts the same rows.
   */
  async countApproved(): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(dreams)
      .where(eq(dreams.status, 'approved'));
    return row?.count ?? 0;
  }
}
