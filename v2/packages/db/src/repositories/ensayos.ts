/**
 * EnsayosRepository — per-user reading state for the essay series.
 * Essay metadata + content come from MDX in `content/ensayos/`.
 */
import { and, eq, isNotNull } from 'drizzle-orm';

import { ensayoBookmarks, ensayoReadingProgress } from '../schema/ensayos.js';

import type { Db } from '../client.js';
import type { EnsayoBookmark, EnsayoReadingProgress, NewEnsayoBookmark } from '../schema/ensayos.js';

export class EnsayosRepository {
  constructor(private readonly db: Db) {}

  // ---------- Bookmarks ----------

  async addBookmark(input: NewEnsayoBookmark): Promise<EnsayoBookmark> {
    const [row] = await this.db.insert(ensayoBookmarks).values(input).returning();
    if (!row) throw new Error('Failed to insert ensayo bookmark');
    return row;
  }

  async removeBookmark(userId: number, slug: string): Promise<void> {
    await this.db
      .delete(ensayoBookmarks)
      .where(and(eq(ensayoBookmarks.userId, userId), eq(ensayoBookmarks.slug, slug)));
  }

  async listBookmarks(userId: number): Promise<EnsayoBookmark[]> {
    return this.db.select().from(ensayoBookmarks).where(eq(ensayoBookmarks.userId, userId));
  }

  async isBookmarked(userId: number, slug: string): Promise<boolean> {
    const [row] = await this.db
      .select({ slug: ensayoBookmarks.slug })
      .from(ensayoBookmarks)
      .where(and(eq(ensayoBookmarks.userId, userId), eq(ensayoBookmarks.slug, slug)))
      .limit(1);
    return Boolean(row);
  }

  // ---------- Reading progress ----------

  async upsertProgress(
    userId: number,
    slug: string,
    progressPct: number,
    timeDeltaSec: number,
  ): Promise<EnsayoReadingProgress> {
    const existing = await this.db
      .select()
      .from(ensayoReadingProgress)
      .where(and(eq(ensayoReadingProgress.userId, userId), eq(ensayoReadingProgress.slug, slug)))
      .limit(1);

    const reachedEnd = progressPct >= 95;
    const now = new Date();

    if (existing[0]) {
      const totalTime = existing[0].timeSpentSec + Math.max(0, timeDeltaSec);
      const newReadAt = existing[0].readAt ?? (reachedEnd ? now : null);
      const [row] = await this.db
        .update(ensayoReadingProgress)
        .set({
          progressPct: Math.max(existing[0].progressPct, progressPct),
          timeSpentSec: totalTime,
          readAt: newReadAt,
          updatedAt: now,
        })
        .where(eq(ensayoReadingProgress.id, existing[0].id))
        .returning();
      if (!row) throw new Error('Failed to update reading progress');
      return row;
    }

    const [row] = await this.db
      .insert(ensayoReadingProgress)
      .values({
        userId,
        slug,
        progressPct,
        timeSpentSec: Math.max(0, timeDeltaSec),
        readAt: reachedEnd ? now : null,
      })
      .returning();
    if (!row) throw new Error('Failed to insert reading progress');
    return row;
  }

  async getProgress(userId: number, slug: string): Promise<EnsayoReadingProgress | undefined> {
    const [row] = await this.db
      .select()
      .from(ensayoReadingProgress)
      .where(and(eq(ensayoReadingProgress.userId, userId), eq(ensayoReadingProgress.slug, slug)))
      .limit(1);
    return row;
  }

  async listCompletedForUser(userId: number): Promise<EnsayoReadingProgress[]> {
    return this.db
      .select()
      .from(ensayoReadingProgress)
      .where(and(eq(ensayoReadingProgress.userId, userId), isNotNull(ensayoReadingProgress.readAt)));
  }
}
