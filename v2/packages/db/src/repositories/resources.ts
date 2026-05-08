/**
 * ResourcesRepository — editorial catalog + user-shared listings.
 */
import { and, desc, eq } from 'drizzle-orm';

import { resources, userResources } from '../schema/resources.js';

import type { Db } from '../client.js';
import type { NewResource, NewUserResource, Resource, UserResource } from '../schema/resources.js';

export class ResourcesRepository {
  constructor(private readonly db: Db) {}

  // ---------- Editorial catalog ----------

  async createResource(input: NewResource): Promise<Resource> {
    const [row] = await this.db.insert(resources).values(input).returning();
    if (!row) throw new Error('Failed to insert resource');
    return row;
  }

  async listPublished(opts: { kind?: string; topic?: string; limit?: number } = {}): Promise<Resource[]> {
    const { kind, topic, limit = 50 } = opts;
    const filters = [eq(resources.isPublished, 1)];
    if (kind) filters.push(eq(resources.kind, kind));
    if (topic) filters.push(eq(resources.topic, topic));
    return this.db
      .select()
      .from(resources)
      .where(and(...filters))
      .orderBy(desc(resources.createdAt))
      .limit(limit);
  }

  async findResource(id: number): Promise<Resource | undefined> {
    const [row] = await this.db.select().from(resources).where(eq(resources.id, id)).limit(1);
    return row;
  }

  // ---------- User-shared listings ----------

  async createUserResource(input: NewUserResource): Promise<UserResource> {
    const [row] = await this.db.insert(userResources).values(input).returning();
    if (!row) throw new Error('Failed to insert user resource');
    return row;
  }

  async findUserResource(id: number): Promise<UserResource | undefined> {
    const [row] = await this.db.select().from(userResources).where(eq(userResources.id, id)).limit(1);
    return row;
  }

  async listUserResources(opts: { kind?: string; status?: string; limit?: number } = {}): Promise<UserResource[]> {
    const { kind, status = 'approved', limit = 50 } = opts;
    const filter = kind
      ? and(eq(userResources.status, status), eq(userResources.kind, kind))
      : eq(userResources.status, status);
    return this.db
      .select()
      .from(userResources)
      .where(filter)
      .orderBy(desc(userResources.createdAt))
      .limit(limit);
  }

  async updateUserResource(
    id: number,
    patch: Partial<Omit<NewUserResource, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<UserResource | undefined> {
    const [row] = await this.db
      .update(userResources)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(userResources.id, id))
      .returning();
    return row;
  }

  async deleteUserResource(id: number): Promise<void> {
    await this.db.delete(userResources).where(eq(userResources.id, id));
  }
}
