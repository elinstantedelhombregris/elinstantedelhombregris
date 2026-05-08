/**
 * Resources domain.
 *
 * Two-sided board: catalog `resources` curated by editors + admin, and
 * user-shared `userResources` (jobs, projects, free-form share posts).
 * v1 had a free-form "type" column; here we narrow it to a string enum
 * documented at the top of each schema.
 */
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

 
import { users } from './users';

/**
 * Editorial catalog. Curators add high-signal resources (books,
 * organizations, datasets, tools).
 */
export const resources = pgTable(
  'resources',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    summary: text('summary'),
    /** 'book' | 'organization' | 'dataset' | 'tool' | 'video' | 'article' */
    kind: text('kind').notNull(),
    url: text('url'),
    imageUrl: text('image_url'),
    /** Free-form taxonomic tag (one per row to allow facet search). */
    topic: text('topic'),
    isPublished: integer('is_published').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [index('resources_kind_idx').on(t.kind), index('resources_topic_idx').on(t.topic)],
);

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;

/**
 * User-shared resources: job postings, project announcements, helpful
 * links etc. Status workflow because moderators may pre-approve.
 */
export const userResources = pgTable(
  'user_resources',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** 'job' | 'project' | 'event' | 'opportunity' | 'share' */
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    url: text('url'),
    location: text('location'),
    /** 'pending' | 'approved' | 'rejected' | 'expired' */
    status: text('status').notNull().default('pending'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('user_resources_user_idx').on(t.userId),
    index('user_resources_kind_status_idx').on(t.kind, t.status),
  ],
);

export type UserResource = typeof userResources.$inferSelect;
export type NewUserResource = typeof userResources.$inferInsert;
