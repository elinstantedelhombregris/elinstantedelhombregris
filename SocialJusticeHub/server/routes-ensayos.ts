import type { Express } from 'express';
import { and, eq, sql } from 'drizzle-orm';
import { db } from './db';
import { ensayoLikes } from '@shared/schema';
import { optionalAuth, type AuthRequest } from './auth';

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

async function countLikes(slug: string): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ensayoLikes)
    .where(eq(ensayoLikes.slug, slug));
  return count;
}

export function registerEnsayoRoutes(app: Express) {
  // Get like count + whether the current viewer (user or anon session) liked it
  app.get('/api/ensayos/:slug/likes', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { slug } = req.params;
      if (!SLUG_RE.test(slug)) {
        return res.status(400).json({ message: 'Slug inválido' });
      }
      const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;

      const identityFilter = req.user?.userId != null
        ? eq(ensayoLikes.userId, req.user.userId)
        : sessionId
          ? eq(ensayoLikes.sessionId, sessionId)
          : null;

      let liked = false;
      if (identityFilter) {
        const [existing] = await db
          .select({ id: ensayoLikes.id })
          .from(ensayoLikes)
          .where(and(eq(ensayoLikes.slug, slug), identityFilter))
          .limit(1);
        liked = !!existing;
      }

      res.json({ count: await countLikes(slug), liked });
    } catch (error) {
      console.error('Get ensayo likes error:', error);
      res.status(500).json({ message: 'Error al obtener likes' });
    }
  });

  // Like/Unlike an essay (toggle). Anonymous likes require a session id.
  app.post('/api/ensayos/:slug/like', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { slug } = req.params;
      if (!SLUG_RE.test(slug)) {
        return res.status(400).json({ message: 'Slug inválido' });
      }
      const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : undefined;

      if (req.user?.userId == null && !sessionId) {
        return res.status(400).json({ message: 'Falta el identificador de sesión' });
      }

      const identityFilter = req.user?.userId != null
        ? eq(ensayoLikes.userId, req.user.userId)
        : eq(ensayoLikes.sessionId, sessionId!);

      const [existing] = await db
        .select({ id: ensayoLikes.id })
        .from(ensayoLikes)
        .where(and(eq(ensayoLikes.slug, slug), identityFilter))
        .limit(1);

      let liked: boolean;
      if (existing) {
        await db.delete(ensayoLikes).where(eq(ensayoLikes.id, existing.id));
        liked = false;
      } else {
        // Unique indexes (slug+user / slug+session) make concurrent inserts race-safe.
        await db.insert(ensayoLikes).values({
          slug,
          userId: req.user?.userId,
          sessionId: req.user?.userId != null ? undefined : sessionId,
        }).onConflictDoNothing();
        liked = true;
      }

      res.json({ liked, count: await countLikes(slug) });
    } catch (error) {
      console.error('Toggle ensayo like error:', error);
      res.status(500).json({ message: 'Error al dar/quitar like' });
    }
  });
}
