/**
 * SemillasRepository — el contrato de tres frases (spec 2.5).
 * Inmutable: create + conteo público. Sin listados (nada los consume hoy;
 * no se construye API muerta).
 */
import { eq, sql } from 'drizzle-orm';

import { semillas } from '../schema/semillas.js';

import type { Db } from '../client.js';
import type { NewSemilla, Semilla } from '../schema/semillas.js';

export class SemillasRepository {
  constructor(private readonly db: Db) {}

  async create(input: NewSemilla): Promise<Semilla> {
    const [row] = await this.db.insert(semillas).values(input).returning();
    if (!row) throw new Error('Failed to insert semilla');
    return row;
  }

  /** Conteo público — solo aprobadas, mismo criterio que dreams.countApproved. */
  async countApproved(): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(semillas)
      .where(eq(semillas.status, 'approved'));
    return row?.count ?? 0;
  }
}
