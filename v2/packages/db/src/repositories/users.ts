/**
 * UsersRepository — single source of data access for the users table.
 *
 * Per AI_AGENT_GREENFIELD_INSTRUCTIONS.md §2.5: ≤ 400 LOC, returns
 * typed domain objects (not raw rows), and is the only place SQL
 * touches the users table.
 */
import { and, eq } from 'drizzle-orm';

import { users } from '../schema/users.js';

import type { Db } from '../client.js';
import type { NewUser, User } from '../schema/users.js';

export class UsersRepository {
  constructor(private readonly db: Db) {}

  /** Insert a new user. Returns the created row. */
  async create(input: NewUser): Promise<User> {
    const [row] = await this.db.insert(users).values(input).returning();
    if (!row) throw new Error('Failed to insert user');
    return row;
  }

  async findById(id: number): Promise<User | undefined> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1);
    return row;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.isActive, true)))
      .limit(1);
    return row;
  }

  /**
   * Update a user. Only the fields present on `patch` are written;
   * `updatedAt` is bumped automatically.
   */
  async update(id: number, patch: Partial<Omit<NewUser, 'id' | 'createdAt'>>): Promise<User | undefined> {
    const [row] = await this.db
      .update(users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return row;
  }

  async markEmailVerified(id: number): Promise<void> {
    await this.db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async recordLogin(id: number): Promise<void> {
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  /** Soft-delete: marks the user inactive without losing the row. */
  async deactivate(id: number): Promise<void> {
    await this.db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}
