import type { Express } from 'express';
import { desc, gte } from 'drizzle-orm';

import { civicEvents } from '@shared/schema';
import { buildPublicCivicAggregates } from './civic/aggregates';
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

export function registerCivicAggregateRoutes(app: Express): void {
  app.get('/api/v1/civic/aggregates', publicReadRateLimit, async (req, res) => {
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
        .where(gte(civicEvents.occurredAt, since))
        .orderBy(desc(civicEvents.occurredAt))
        .limit(CIVIC_PUBLIC_MAX_EVENTS + 1);
      const truncated = rows.length > CIVIC_PUBLIC_MAX_EVENTS;
      const source = truncated ? rows.slice(0, CIVIC_PUBLIC_MAX_EVENTS) : rows;
      const threshold = civicMinimumSourceContributors();
      const aggregate = buildPublicCivicAggregates(source, threshold);
      const body = {
        meta: {
          contract: 'basta-civic-aggregate/v1',
          period,
          since,
          generatedAt: new Date().toISOString(),
          privacy: {
            minimumDistinctSourceContributors: threshold,
            smallGroupsSuppressed: aggregate.suppressedGroups,
            contributorCountsBucketed: true,
            verifierActorsExcludedFromThreshold: true,
            rawRowsExposed: false,
          },
          qualityMethod: 'two-independent-confirmations',
          truncated,
        },
        groups: aggregate.groups,
      };
      cache.set(period, { generatedAt: Date.now(), body });
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json(body);
    } catch (error) {
      console.error('[civic-aggregates] build failed:', error instanceof Error ? error.message : 'unknown_error');
      return res.status(500).json({ code: 'AGGREGATE_UNAVAILABLE', message: 'La Radiografía todavía no pudo actualizarse.' });
    }
  });
}
