/**
 * Community domain — user-generated posts, messages, and interaction
 * counters. v1 had the same shape but with a flat 7-table sprawl;
 * here we collapse the per-event tables (likes, views, activities)
 * into one polymorphic interactions table to halve the row count.
 */
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const communityPosts = pgTable(
  'community_posts',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    /** 'discussion' | 'event' | 'announcement' | 'question' */
    kind: text('kind').notNull().default('discussion'),
    /** 'draft' | 'published' | 'archived' */
    status: text('status').notNull().default('published'),
    likeCount: integer('like_count').notNull().default(0),
    viewCount: integer('view_count').notNull().default(0),
    commentCount: integer('comment_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('community_posts_user_idx').on(t.userId),
    index('community_posts_kind_idx').on(t.kind, t.status),
    index('community_posts_created_idx').on(t.createdAt.desc()),
  ],
);

export type CommunityPost = typeof communityPosts.$inferSelect;
export type NewCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Polymorphic interaction log — replaces v1's separate
 * communityPostLikes / communityPostViews / communityPostActivity.
 * `kind` is one of: 'like' | 'view' | 'save' | 'share'.
 *
 * For 'like' and 'save' there's a unique (post, user, kind) constraint
 * so a user can't double-like. 'view' and 'share' allow duplicates.
 */
export const communityPostInteractions = pgTable(
  'community_post_interactions',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .notNull()
      .references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('community_post_interactions_unique')
      .on(t.postId, t.userId, t.kind)
      .where(sql`kind in ('like', 'save')`),
    index('community_post_interactions_post_idx').on(t.postId, t.kind),
  ],
);

export type CommunityPostInteraction = typeof communityPostInteractions.$inferSelect;
export type NewCommunityPostInteraction = typeof communityPostInteractions.$inferInsert;

export const communityMessages = pgTable(
  'community_messages',
  {
    id: serial('id').primaryKey(),
    fromUserId: integer('from_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    toUserId: integer('to_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('community_messages_to_user_idx').on(t.toUserId, t.createdAt.desc()),
    index('community_messages_from_user_idx').on(t.fromUserId),
  ],
);

export type CommunityMessage = typeof communityMessages.$inferSelect;
export type NewCommunityMessage = typeof communityMessages.$inferInsert;

/**
 * Editorially-curated stories spotlighted on the marketing pages.
 * Author-supplied (author_user_id may be null when imported from a
 * partner publication).
 */
export const inspiringStories = pgTable(
  'inspiring_stories',
  {
    id: serial('id').primaryKey(),
    authorUserId: integer('author_user_id').references(() => users.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    content: text('content').notNull(),
    imageUrl: text('image_url'),
    /** 'pending' | 'approved' | 'rejected' */
    status: text('status').notNull().default('pending'),
    isFeatured: integer('is_featured').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('inspiring_stories_status_idx').on(t.status),
    index('inspiring_stories_featured_idx').on(t.isFeatured),
  ],
);

export type InspiringStory = typeof inspiringStories.$inferSelect;
export type NewInspiringStory = typeof inspiringStories.$inferInsert;
