/**
 * Gamification service — orchestrates XP grants + level recomputation
 * + streak advance + badge auto-award. Sits between route handlers
 * and GamificationRepository. The single entry point is recordEvent
 * (or safeRecord, which swallows errors).
 */
import { GamificationRepository, eq, userLevels, type Db } from '@v2/db';
import { levelForXp } from '@v2/shared';

import { logger } from '../../lib/logger.js';

export interface XpEventPayload {
  xpAwarded: number;
  kind: string;
  newLevel: number | null;
  newBadges: { slug: string; title: string; tier: string }[];
}

export interface RecordEventInput {
  userId: number;
  kind: string;
  xpAwarded: number;
  /** ISO YYYY-MM-DD; defaults to today (UTC) if omitted. */
  activityDate?: string;
  /** When set, the service skips the grant under the specified rule. */
  dedup?: 'daily' | 'content_read' | 'never';
  /** Required when dedup === 'content_read'. */
  contentSlug?: string;
  contentKind?: 'blog' | 'ensayo';
  /** Free-form payload stored on daily_activity.payload. */
  payload?: Record<string, unknown>;
  /** Slugs of badges to award (idempotent on conflict). */
  badgesToAward?: string[];
}

export class GamificationService {
  constructor(private readonly db: Db) {}

  private repo(): GamificationRepository {
    return new GamificationRepository(this.db);
  }

  private todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Awards XP + any specified badges, advances the streak, recomputes
   * level. Returns the xpEvent payload — or null if dedup suppressed
   * the grant.
   */
  async recordEvent(input: RecordEventInput): Promise<XpEventPayload | null> {
    const repo = this.repo();
    const activityDate = input.activityDate ?? this.todayUtc();

    if (input.dedup === 'daily') {
      const already = await repo.hasActivityOnDate(input.userId, input.kind, activityDate);
      if (already) return null;
    }
    if (input.dedup === 'content_read') {
      if (!input.contentSlug || !input.contentKind) {
        throw new Error('content_read dedup requires contentSlug + contentKind');
      }
      const already = await repo.hasContentBeenRead(input.userId, input.contentKind, input.contentSlug);
      if (already) return null;
    }

    const before = await repo.getOrCreateUserLevel(input.userId);
    const beforeLevel = before.level;

    await repo.logActivity({
      userId: input.userId,
      activityDate,
      kind: input.kind,
      xpAwarded: input.xpAwarded,
      payload: input.payload ?? null,
    });

    const after = await repo.getOrCreateUserLevel(input.userId);
    const newLevelComputed = levelForXp(after.xp);

    let newLevel: number | null = null;
    if (newLevelComputed !== beforeLevel) {
      await this.db
        .update(userLevels)
        .set({ level: newLevelComputed })
        .where(eq(userLevels.userId, input.userId));
      newLevel = newLevelComputed;
    }

    await this.advanceStreak(input.userId, activityDate);

    const slugs = new Set<string>(input.badgesToAward ?? []);
    const streakRow = await repo.getOrCreateUserLevel(input.userId);
    if (streakRow.streakDays >= 7) slugs.add('streak-7');
    if (streakRow.streakDays >= 30) slugs.add('streak-30');

    const newBadges: { slug: string; title: string; tier: string }[] = [];
    for (const slug of slugs) {
      const badge = await repo.findBadgeBySlug(slug);
      if (!badge) continue;
      try {
        await repo.awardBadge({ userId: input.userId, badgeId: badge.id });
        newBadges.push({ slug: badge.slug, title: badge.title, tier: badge.tier });
      } catch (err) {
        if (err instanceof Error && /unique/i.test(err.message)) continue;
        throw err;
      }
    }

    return {
      xpAwarded: input.xpAwarded,
      kind: input.kind,
      newLevel,
      newBadges,
    };
  }

  /** Same-day no-op · next-day ++ · gap → reset to 1. Atomic UPDATE. */
  async advanceStreak(userId: number, activityDate: string): Promise<void> {
    const repo = this.repo();
    const row = await repo.getOrCreateUserLevel(userId);
    if (row.lastActiveDate === activityDate) return;

    const yesterday = (() => {
      const d = new Date(`${activityDate}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().slice(0, 10);
    })();

    const nextStreak = row.lastActiveDate === yesterday ? row.streakDays + 1 : 1;
    const nextLongest = Math.max(row.longestStreakDays, nextStreak);

    await this.db
      .update(userLevels)
      .set({
        streakDays: nextStreak,
        longestStreakDays: nextLongest,
        lastActiveDate: activityDate,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.userId, userId));
  }

  /**
   * Best-effort wrapper for use inside route handlers. Swallows all
   * errors so the underlying user action never fails because of a
   * gamification hiccup.
   */
  async safeRecord(input: RecordEventInput): Promise<XpEventPayload | null> {
    try {
      return await this.recordEvent(input);
    } catch (err) {
      logger.warn({ err, userId: input.userId, kind: input.kind }, 'gamification: recordEvent failed');
      return null;
    }
  }
}
