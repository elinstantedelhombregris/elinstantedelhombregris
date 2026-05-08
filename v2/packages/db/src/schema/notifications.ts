/**
 * Notifications domain.
 *
 * Polymorphic per-user notification table. The producing feature
 * (community post likes, blog comments, life-area badges, mandato
 * proposals, etc.) writes a row; the notification center reads.
 *
 * `kind` is a discriminator the UI maps to a renderer. `targetType` +
 * `targetId` form a soft polymorphic reference to the source record so
 * we don't hard-couple notifications to every domain table with FKs.
 */
import { boolean, index, integer, json, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    /** Discriminator. Examples: 'community_post.like', 'blog.comment',
     *  'life_area.badge', 'mandato.proposal_status_changed'. */
    kind: text('kind').notNull(),

    title: text('title').notNull(),
    body: text('body'),

    /** Soft polymorphic target. Optional; some kinds have no target. */
    targetType: text('target_type'),
    targetId: integer('target_id'),

    /** Optional click-through path within the SPA. */
    href: text('href'),

    /** Renderer hint payload. Schema is per-kind; consumers must
     *  validate before use. */
    payload: json('payload'),

    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

    /** Allow batching (group repeated likes, etc.). */
    deduplicationKey: text('deduplication_key'),

    /** Suppress display without deleting (e.g. user dismissed). */
    isDismissed: boolean('is_dismissed').notNull().default(false),
  },
  (t) => [
    index('notifications_user_created_idx').on(t.userId, t.createdAt.desc()),
    index('notifications_user_unread_idx').on(t.userId, t.readAt),
    index('notifications_kind_idx').on(t.kind),
    index('notifications_target_idx').on(t.targetType, t.targetId),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
