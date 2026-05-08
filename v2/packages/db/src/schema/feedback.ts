/**
 * Feedback domain. Single table for user-submitted platform feedback
 * (bug reports, feature requests, general comments). Admins review
 * via the admin dashboard.
 */
import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const platformFeedback = pgTable(
  'platform_feedback',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    /** 'bug' | 'feature' | 'comment' | 'praise' */
    kind: text('kind').notNull(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    /** 'new' | 'triaged' | 'in_progress' | 'resolved' | 'wontfix' */
    status: text('status').notNull().default('new'),
    /** Free-text response from staff. Visible to user via their feedback list. */
    adminResponse: text('admin_response'),
    pageUrl: text('page_url'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('platform_feedback_status_idx').on(t.status),
    index('platform_feedback_kind_idx').on(t.kind),
  ],
);

export type PlatformFeedback = typeof platformFeedback.$inferSelect;
export type NewPlatformFeedback = typeof platformFeedback.$inferInsert;
