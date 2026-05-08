/**
 * GeographicRepository — read-mostly catalog of Argentine provinces +
 * cities. Writes happen via seed scripts; the app code reads.
 */
import { and, asc, eq, ilike } from 'drizzle-orm';

import { geographicLocations } from '../schema/geographic.js';

import type { Db } from '../client.js';
import type { GeographicLocation, NewGeographicLocation } from '../schema/geographic.js';

/**
 * Map common user-input province names to the canonical form used in
 * Argentina's open-data datasets. Returns the input unchanged if no
 * normalization rule matches.
 */
export function normalizeProvinceName(name: string): string {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'caba' || lower === 'ciudad de buenos aires') {
    return 'Ciudad Autónoma de Buenos Aires';
  }
  return trimmed;
}

export class GeographicRepository {
  constructor(private readonly db: Db) {}

  async listProvinces(): Promise<GeographicLocation[]> {
    return this.db
      .select()
      .from(geographicLocations)
      .where(eq(geographicLocations.level, 'province'))
      .orderBy(asc(geographicLocations.name));
  }

  async findProvinceByName(name: string): Promise<GeographicLocation | undefined> {
    const canonical = normalizeProvinceName(name);
    const [row] = await this.db
      .select()
      .from(geographicLocations)
      .where(and(eq(geographicLocations.level, 'province'), eq(geographicLocations.name, canonical)))
      .limit(1);
    return row;
  }

  async findCity(name: string, provinceId: number): Promise<GeographicLocation | undefined> {
    const [row] = await this.db
      .select()
      .from(geographicLocations)
      .where(
        and(
          eq(geographicLocations.level, 'city'),
          ilike(geographicLocations.name, name),
          eq(geographicLocations.provinceId, provinceId),
        ),
      )
      .limit(1);
    return row;
  }

  async upsertLocation(input: NewGeographicLocation): Promise<GeographicLocation> {
    const [row] = await this.db.insert(geographicLocations).values(input).returning();
    if (!row) throw new Error('Failed to insert geographic location');
    return row;
  }
}
