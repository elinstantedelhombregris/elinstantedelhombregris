/**
 * Blog domain.
 *
 * Posts, tags, comments (threaded), likes, bookmarks, views.
 * v1 had 6 separate tables; we keep the same shape because the
 * read-heavy access patterns (search, trending, related, popular tags)
 * benefit from per-domain indexes.
 */
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: serial('id').primaryKey(),
    authorId: integer('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    content: text('content').notNull(),
    coverImageUrl: text('cover_image_url'),
    /** 'draft' | 'scheduled' | 'published' | 'archived' */
    status: text('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    /** Author-attested original publication date for ports / reprints. */
    originalPublishedAt: timestamp('original_published_at', { withTimezone: true }),
    likeCount: integer('like_count').notNull().default(0),
    viewCount: integer('view_count').notNull().default(0),
    commentCount: integer('comment_count').notNull().default(0),
    bookmarkCount: integer('bookmark_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex('blog_posts_slug_unique').on(t.slug),
    index('blog_posts_author_idx').on(t.authorId),
    index('blog_posts_status_published_idx').on(t.status, t.publishedAt.desc()),
  ],
);

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export const blogPostTags = pgTable(
  'blog_post_tags',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull(),
  },
  (t) => [
    uniqueIndex('blog_post_tags_unique').on(t.postId, t.tag),
    index('blog_post_tags_tag_idx').on(t.tag),
  ],
);

export type BlogPostTag = typeof blogPostTags.$inferSelect;
export type NewBlogPostTag = typeof blogPostTags.$inferInsert;

export const blogPostLikes = pgTable(
  'blog_post_likes',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('blog_post_likes_unique').on(t.postId, t.userId)],
);

export type BlogPostLike = typeof blogPostLikes.$inferSelect;
export type NewBlogPostLike = typeof blogPostLikes.$inferInsert;

export const blogPostBookmarks = pgTable(
  'blog_post_bookmarks',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('blog_post_bookmarks_unique').on(t.postId, t.userId)],
);

export type BlogPostBookmark = typeof blogPostBookmarks.$inferSelect;
export type NewBlogPostBookmark = typeof blogPostBookmarks.$inferInsert;

export const blogPostComments = pgTable(
  'blog_post_comments',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    parentId: integer('parent_id'),
    body: text('body').notNull(),
    /** Soft-delete preserves thread structure when a comment is removed. */
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('blog_post_comments_post_idx').on(t.postId),
    index('blog_post_comments_parent_idx').on(t.parentId),
  ],
);

export type BlogPostComment = typeof blogPostComments.$inferSelect;
export type NewBlogPostComment = typeof blogPostComments.$inferInsert;

/**
 * Per-view event log. Anonymous views allowed (userId nullable);
 * production must rate-limit otherwise this becomes a write hotspot.
 */
export const blogPostViews = pgTable(
  'blog_post_views',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    /** Sticky session id so we de-dupe anon views per session. */
    sessionId: text('session_id'),
    viewedAt: timestamp('viewed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('blog_post_views_post_idx').on(t.postId, t.viewedAt.desc()),
    index('blog_post_views_user_idx').on(t.userId),
  ],
);

export type BlogPostView = typeof blogPostViews.$inferSelect;
export type NewBlogPostView = typeof blogPostViews.$inferInsert;
