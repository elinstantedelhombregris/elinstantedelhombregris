/**
 * BlogRepository — long-form authored posts.
 */
import { and, asc, desc, eq, sql } from 'drizzle-orm';

import {
  blogPostBookmarks,
  blogPostComments,
  blogPostLikes,
  blogPosts,
  blogPostTags,
  blogPostViews,
} from '../schema/blog.js';

import type { Db } from '../client.js';
import type {
  BlogPost,
  BlogPostBookmark,
  BlogPostComment,
  BlogPostLike,
  NewBlogPost,
  NewBlogPostBookmark,
  NewBlogPostComment,
  NewBlogPostLike,
  NewBlogPostView,
} from '../schema/blog.js';

export class BlogRepository {
  constructor(private readonly db: Db) {}

  // ---------- Posts ----------

  async create(input: NewBlogPost): Promise<BlogPost> {
    const [row] = await this.db.insert(blogPosts).values(input).returning();
    if (!row) throw new Error('Failed to insert blog post');
    return row;
  }

  async findById(id: number): Promise<BlogPost | undefined> {
    const [row] = await this.db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return row;
  }

  async findBySlug(slug: string): Promise<BlogPost | undefined> {
    const [row] = await this.db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return row;
  }

  async listPublished(opts: { limit?: number; offset?: number } = {}): Promise<BlogPost[]> {
    const { limit = 20, offset = 0 } = opts;
    return this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async update(id: number, patch: Partial<NewBlogPost>): Promise<BlogPost | undefined> {
    const [row] = await this.db
      .update(blogPosts)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return row;
  }

  // ---------- Tags ----------

  async setTags(postId: number, tags: string[]): Promise<void> {
    await this.db.delete(blogPostTags).where(eq(blogPostTags.postId, postId));
    if (tags.length === 0) return;
    const unique = Array.from(new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean)));
    await this.db.insert(blogPostTags).values(unique.map((tag) => ({ postId, tag })));
  }

  async listTags(postId: number): Promise<string[]> {
    const rows = await this.db
      .select({ tag: blogPostTags.tag })
      .from(blogPostTags)
      .where(eq(blogPostTags.postId, postId))
      .orderBy(asc(blogPostTags.tag));
    return rows.map((r) => r.tag);
  }

  // ---------- Likes ----------

  async addLike(input: NewBlogPostLike): Promise<BlogPostLike> {
    const [row] = await this.db.insert(blogPostLikes).values(input).returning();
    if (!row) throw new Error('Failed to insert like');
    await this.db
      .update(blogPosts)
      .set({ likeCount: sql`${blogPosts.likeCount} + 1`, updatedAt: new Date() })
      .where(eq(blogPosts.id, input.postId));
    return row;
  }

  async removeLike(postId: number, userId: number): Promise<void> {
    const deleted = await this.db
      .delete(blogPostLikes)
      .where(and(eq(blogPostLikes.postId, postId), eq(blogPostLikes.userId, userId)))
      .returning();
    if (deleted.length === 0) return;
    await this.db
      .update(blogPosts)
      .set({ likeCount: sql`greatest(${blogPosts.likeCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(blogPosts.id, postId));
  }

  async hasLiked(postId: number, userId: number): Promise<boolean> {
    const [row] = await this.db
      .select({ postId: blogPostLikes.postId })
      .from(blogPostLikes)
      .where(and(eq(blogPostLikes.postId, postId), eq(blogPostLikes.userId, userId)))
      .limit(1);
    return Boolean(row);
  }

  // ---------- Bookmarks ----------

  async addBookmark(input: NewBlogPostBookmark): Promise<BlogPostBookmark> {
    const [row] = await this.db.insert(blogPostBookmarks).values(input).returning();
    if (!row) throw new Error('Failed to insert bookmark');
    return row;
  }

  async removeBookmark(postId: number, userId: number): Promise<void> {
    await this.db
      .delete(blogPostBookmarks)
      .where(and(eq(blogPostBookmarks.postId, postId), eq(blogPostBookmarks.userId, userId)));
  }

  // ---------- Comments ----------

  async addComment(input: NewBlogPostComment): Promise<BlogPostComment> {
    const [row] = await this.db.insert(blogPostComments).values(input).returning();
    if (!row) throw new Error('Failed to insert comment');
    await this.db
      .update(blogPosts)
      .set({ commentCount: sql`${blogPosts.commentCount} + 1`, updatedAt: new Date() })
      .where(eq(blogPosts.id, input.postId));
    return row;
  }

  async listComments(postId: number): Promise<BlogPostComment[]> {
    return this.db
      .select()
      .from(blogPostComments)
      .where(eq(blogPostComments.postId, postId))
      .orderBy(asc(blogPostComments.createdAt));
  }

  // ---------- Views ----------

  async recordView(input: NewBlogPostView): Promise<void> {
    await this.db.insert(blogPostViews).values(input);
    await this.db
      .update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, input.postId));
  }
}
