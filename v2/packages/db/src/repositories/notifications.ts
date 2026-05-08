/**
 * NotificationsRepository — per-user notification feed.
 *
 * Producers write through `enqueue`. Consumers read via
 * `listForUser` and mark via `markRead`/`markAllRead`/`dismiss`.
 */
import { and, desc, eq, isNull } from 'drizzle-orm';

import { notifications } from '../schema/notifications.js';

import type { Db } from '../client.js';
import type { NewNotification, Notification } from '../schema/notifications.js';

export class NotificationsRepository {
  constructor(private readonly db: Db) {}

  async enqueue(input: NewNotification): Promise<Notification> {
    const [row] = await this.db.insert(notifications).values(input).returning();
    if (!row) throw new Error('Failed to insert notification');
    return row;
  }

  async listForUser(userId: number, opts: { limit?: number; onlyUnread?: boolean } = {}): Promise<Notification[]> {
    const { limit = 50, onlyUnread = false } = opts;
    const baseFilter = onlyUnread
      ? and(eq(notifications.userId, userId), isNull(notifications.readAt), eq(notifications.isDismissed, false))
      : and(eq(notifications.userId, userId), eq(notifications.isDismissed, false));
    return this.db
      .select()
      .from(notifications)
      .where(baseFilter)
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async unreadCount(userId: number): Promise<number> {
    const rows = await this.db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt), eq(notifications.isDismissed, false)),
      );
    return rows.length;
  }

  async markRead(userId: number, id: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId), isNull(notifications.readAt)));
  }

  async markAllRead(userId: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  }

  async dismiss(userId: number, id: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ isDismissed: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }
}
