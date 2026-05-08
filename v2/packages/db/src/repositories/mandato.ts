/**
 * MandatoRepository — territory mandate state + citizen suggestions.
 */
import { and, desc, eq, sql } from 'drizzle-orm';

import { mandateSuggestions, territoryMandates } from '../schema/mandato.js';

import type { Db } from '../client.js';
import type {
  MandateSuggestion,
  NewMandateSuggestion,
  NewTerritoryMandate,
  TerritoryMandate,
} from '../schema/mandato.js';

export class MandatoRepository {
  constructor(private readonly db: Db) {}

  // ---------- Territory state ----------

  async upsertTerritory(input: NewTerritoryMandate): Promise<TerritoryMandate> {
    const existing = await this.db
      .select()
      .from(territoryMandates)
      .where(input.provinceId !== undefined && input.provinceId !== null
        ? eq(territoryMandates.provinceId, input.provinceId)
        : sql`province_id is null`)
      .limit(1);
    if (existing[0]) {
      const [row] = await this.db
        .update(territoryMandates)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(territoryMandates.id, existing[0].id))
        .returning();
      if (!row) throw new Error('Failed to update territory');
      return row;
    }
    const [row] = await this.db.insert(territoryMandates).values(input).returning();
    if (!row) throw new Error('Failed to insert territory');
    return row;
  }

  async getTerritory(provinceId?: number): Promise<TerritoryMandate | undefined> {
    const filter = provinceId !== undefined ? eq(territoryMandates.provinceId, provinceId) : sql`province_id is null`;
    const [row] = await this.db.select().from(territoryMandates).where(filter).limit(1);
    return row;
  }

  async listTerritories(): Promise<TerritoryMandate[]> {
    return this.db.select().from(territoryMandates).orderBy(desc(territoryMandates.updatedAt));
  }

  // ---------- Suggestions ----------

  async addSuggestion(input: NewMandateSuggestion): Promise<MandateSuggestion> {
    const [row] = await this.db.insert(mandateSuggestions).values(input).returning();
    if (!row) throw new Error('Failed to insert suggestion');
    return row;
  }

  async listSuggestions(opts: { provinceId?: number; theme?: string; status?: string; limit?: number } = {}): Promise<MandateSuggestion[]> {
    const { provinceId, theme, status, limit = 100 } = opts;
    const filters = [];
    if (provinceId !== undefined) filters.push(eq(mandateSuggestions.provinceId, provinceId));
    if (theme) filters.push(eq(mandateSuggestions.theme, theme));
    if (status) filters.push(eq(mandateSuggestions.status, status));
    const where = filters.length > 0 ? and(...filters) : undefined;
    const q = this.db.select().from(mandateSuggestions);
    return where
      ? q.where(where).orderBy(desc(mandateSuggestions.createdAt)).limit(limit)
      : q.orderBy(desc(mandateSuggestions.createdAt)).limit(limit);
  }

  async incrementSupport(id: number): Promise<void> {
    await this.db
      .update(mandateSuggestions)
      .set({ supportCount: sql`${mandateSuggestions.supportCount} + 1` })
      .where(eq(mandateSuggestions.id, id));
  }
}
