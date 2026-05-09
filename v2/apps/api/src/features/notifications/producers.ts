/**
 * Notification producers — typed wrappers over NotificationsRepository
 * that the rest of the app uses to enqueue notifications without
 * caring about the row shape, kind discriminator, or click-through
 * URL convention.
 *
 * Failures are swallowed (logged) so that the underlying user action
 * (a like, a comment, a join) succeeds even if the notification
 * pipeline blips. Notifications are nice-to-have, not load-bearing.
 */
import { getDb, NotificationsRepository } from '@v2/db';

import { logger } from '../../lib/logger.js';

function repo() {
  return new NotificationsRepository(getDb());
}

async function safeEnqueue(input: Parameters<NotificationsRepository['enqueue']>[0]): Promise<void> {
  try {
    await repo().enqueue(input);
  } catch (err) {
    logger.warn({ err, kind: input.kind, userId: input.userId }, 'notification enqueue failed');
  }
}

/** A user liked someone's blog post → notify the post's author. */
export async function notifyBlogPostLiked(authorId: number, postId: number, likerName: string): Promise<void> {
  await safeEnqueue({
    userId: authorId,
    kind: 'blog.like',
    title: `${likerName} le dio me gusta a tu post`,
    targetType: 'blog_post',
    targetId: postId,
    href: `/blog/${String(postId)}`,
    deduplicationKey: `blog.like.${String(postId)}.${String(authorId)}`,
  });
}

/** A user commented on someone's blog post → notify the author. */
export async function notifyBlogCommentPosted(
  authorId: number,
  postId: number,
  commenterName: string,
): Promise<void> {
  await safeEnqueue({
    userId: authorId,
    kind: 'blog.comment',
    title: `${commenterName} comentó en tu post`,
    targetType: 'blog_post',
    targetId: postId,
    href: `/blog/${String(postId)}`,
  });
}

/** A user liked someone's community post → notify the author. */
export async function notifyCommunityPostLiked(
  authorId: number,
  postId: number,
  likerName: string,
): Promise<void> {
  await safeEnqueue({
    userId: authorId,
    kind: 'community.like',
    title: `${likerName} le dio me gusta a tu publicación`,
    targetType: 'community_post',
    targetId: postId,
    href: `/comunidad/${String(postId)}`,
    deduplicationKey: `community.like.${String(postId)}.${String(authorId)}`,
  });
}

/** A user joined an iniciativa → notify the iniciativa owner. */
export async function notifyIniciativaMemberJoined(
  ownerId: number,
  iniciativaId: number,
  iniciativaSlug: string,
  memberName: string,
): Promise<void> {
  await safeEnqueue({
    userId: ownerId,
    kind: 'iniciativa.member_joined',
    title: `${memberName} se sumó a tu iniciativa`,
    targetType: 'iniciativa',
    targetId: iniciativaId,
    href: `/iniciativas/${iniciativaSlug}`,
  });
}

/** A user crossed a milestone in their life-areas journey. */
export async function notifyLifeAreaMilestone(
  userId: number,
  lifeAreaSlug: string,
  milestoneTitle: string,
): Promise<void> {
  await safeEnqueue({
    userId,
    kind: 'life_area.milestone',
    title: `Logro nuevo: ${milestoneTitle}`,
    href: `/areas/${lifeAreaSlug}`,
  });
}
