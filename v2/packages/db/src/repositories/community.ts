/**
 * CommunityRepository — community feed, polymorphic interactions, DMs.
 */
import { and, desc, eq, sql } from 'drizzle-orm';

import { communityMessages, communityPostInteractions, communityPosts } from '../schema/community.js';

import type { Db } from '../client.js';
import type {
  CommunityMessage,
  CommunityPost,
  CommunityPostInteraction,
  NewCommunityMessage,
  NewCommunityPost,
  NewCommunityPostInteraction,
} from '../schema/community.js';

export class CommunityRepository {
  constructor(private readonly db: Db) {}

  // ---------- Posts ----------

  async createPost(input: NewCommunityPost): Promise<CommunityPost> {
    const [row] = await this.db.insert(communityPosts).values(input).returning();
    if (!row) throw new Error('Failed to insert community post');
    return row;
  }

  async findPostById(id: number): Promise<CommunityPost | undefined> {
    const [row] = await this.db.select().from(communityPosts).where(eq(communityPosts.id, id)).limit(1);
    return row;
  }

  async listPosts(opts: { limit?: number; offset?: number; kind?: string } = {}): Promise<CommunityPost[]> {
    const { limit = 20, offset = 0, kind } = opts;
    const filter = kind
      ? and(eq(communityPosts.status, 'published'), eq(communityPosts.kind, kind))
      : eq(communityPosts.status, 'published');
    return this.db
      .select()
      .from(communityPosts)
      .where(filter)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async incrementPostCounter(postId: number, field: 'likeCount' | 'viewCount' | 'commentCount'): Promise<void> {
    const col = communityPosts[field];
    await this.db
      .update(communityPosts)
      .set({ [field]: sql`${col} + 1`, updatedAt: new Date() })
      .where(eq(communityPosts.id, postId));
  }

  async decrementPostCounter(postId: number, field: 'likeCount' | 'commentCount'): Promise<void> {
    const col = communityPosts[field];
    await this.db
      .update(communityPosts)
      .set({ [field]: sql`greatest(${col} - 1, 0)`, updatedAt: new Date() })
      .where(eq(communityPosts.id, postId));
  }

  // ---------- Interactions ----------

  async addInteraction(input: NewCommunityPostInteraction): Promise<CommunityPostInteraction> {
    const [row] = await this.db.insert(communityPostInteractions).values(input).returning();
    if (!row) throw new Error('Failed to insert interaction');
    return row;
  }

  async removeInteraction(postId: number, userId: number, kind: string): Promise<void> {
    await this.db
      .delete(communityPostInteractions)
      .where(
        and(
          eq(communityPostInteractions.postId, postId),
          eq(communityPostInteractions.userId, userId),
          eq(communityPostInteractions.kind, kind),
        ),
      );
  }

  async hasInteraction(postId: number, userId: number, kind: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: communityPostInteractions.id })
      .from(communityPostInteractions)
      .where(
        and(
          eq(communityPostInteractions.postId, postId),
          eq(communityPostInteractions.userId, userId),
          eq(communityPostInteractions.kind, kind),
        ),
      )
      .limit(1);
    return Boolean(row);
  }

  // ---------- Direct messages ----------

  async sendMessage(input: NewCommunityMessage): Promise<CommunityMessage> {
    const [row] = await this.db.insert(communityMessages).values(input).returning();
    if (!row) throw new Error('Failed to insert message');
    return row;
  }

  async listInbox(toUserId: number, limit = 50): Promise<CommunityMessage[]> {
    return this.db
      .select()
      .from(communityMessages)
      .where(eq(communityMessages.toUserId, toUserId))
      .orderBy(desc(communityMessages.createdAt))
      .limit(limit);
  }
}
