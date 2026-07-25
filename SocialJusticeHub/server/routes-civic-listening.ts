import type { Express } from 'express';
import { and, desc, eq, gte, inArray, or, sql } from 'drizzle-orm';

import { civicEvents } from '@shared/schema';
import {
  buildPublicListeningInsights,
  LISTENING_CAMPAIGN_KEY,
} from './civic/listening-insights';
import {
  CIVIC_PUBLIC_CACHE_TTL_MS,
  CIVIC_PUBLIC_MAX_EVENTS,
  civicMinimumSourceContributors,
  civicPublicSince,
  parseCivicPublicPeriod,
} from './civic/public-projection';
import { db } from './db';
import { publicReadRateLimit } from './middleware';

const cache = new Map<string, { generatedAt: number; body: unknown }>();

export function registerCivicListeningRoutes(app: Express): void {
  app.get('/api/v1/civic/listening-insights', publicReadRateLimit, async (req, res) => {
    const period = parseCivicPublicPeriod(req.query.period);
    const cached = cache.get(period);
    if (cached && Date.now() - cached.generatedAt < CIVIC_PUBLIC_CACHE_TTL_MS) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json(cached.body);
    }

    const since = civicPublicSince(period);
    try {
      const rows = await db.select({
        sequence: civicEvents.id,
        eventId: civicEvents.eventId,
        actorKey: civicEvents.actorKey,
        entityType: civicEvents.entityType,
        entityId: civicEvents.entityId,
        operation: civicEvents.operation,
        payloadJson: civicEvents.payloadJson,
        occurredAt: civicEvents.occurredAt,
      }).from(civicEvents)
        .where(and(
          gte(civicEvents.occurredAt, since),
          eq(civicEvents.entityType, 'observation'),
          inArray(civicEvents.operation, ['create', 'update']),
          or(
            sql`${civicEvents.payloadJson}::jsonb ->> 'campaignKey' = ${LISTENING_CAMPAIGN_KEY}`,
            sql`${civicEvents.payloadJson}::jsonb ? 'revokedAt'`,
          ),
        ))
        .orderBy(desc(civicEvents.occurredAt))
        .limit(CIVIC_PUBLIC_MAX_EVENTS + 1);

      const truncated = rows.length > CIVIC_PUBLIC_MAX_EVENTS;
      const source = truncated ? rows.slice(0, CIVIC_PUBLIC_MAX_EVENTS) : rows;
      const threshold = civicMinimumSourceContributors();
      const insights = buildPublicListeningInsights(source, threshold);
      const body = {
        meta: {
          contract: 'basta-civic-listening-insights/v2',
          campaign: LISTENING_CAMPAIGN_KEY,
          period,
          since,
          generatedAt: new Date().toISOString(),
          privacy: {
            minimumDistinctSourceContributors: threshold,
            smallBucketsSuppressed: insights.suppressedBuckets,
            smallTerritoriesSuppressed: insights.suppressedTerritories,
            contributorCountsBucketed: true,
            allowlistedFacetsOnly: true,
            collectiveAudienceRequired: true,
            publicPointRequired: true,
            territorialGrouping: 'server-public-grid-by-declared-precision',
            rawTextExposed: false,
            rawRowsExposed: false,
            identifiersExposed: false,
            locationsExposed: false,
            locationLabelsExposed: false,
            cellKeysExposed: false,
          },
          truncated,
        },
        facets: insights.facets,
        territories: insights.territories,
      };
      cache.set(period, { generatedAt: Date.now(), body });
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json(body);
    } catch (error) {
      console.error('[civic-listening-insights] build failed:', error instanceof Error ? error.message : 'unknown_error');
      return res.status(500).json({
        code: 'LISTENING_INSIGHTS_UNAVAILABLE',
        message: 'La escucha pública todavía no pudo actualizarse.',
      });
    }
  });
}
