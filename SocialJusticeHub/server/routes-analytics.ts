import type { Express } from 'express';
import { computeConvergenceSummary, generateAIInsights } from './services/analytics-service';

// ─── In-memory caches ───

interface CacheEntry<T> {
  data: T;
  generatedAt: Date;
}

let convergenceCache: CacheEntry<any> | null = null;
const CONVERGENCE_TTL = 15 * 60 * 1000; // 15 minutes

let insightsCache: CacheEntry<{ narrative: string; generatedAt: string }> | null = null;
const INSIGHTS_TTL = 60 * 60 * 1000; // 1 hour

function isCacheFresh<T extends { generatedAt: Date }>(entry: T | null, ttl: number): boolean {
  if (!entry) return false;
  return Date.now() - entry.generatedAt.getTime() < ttl;
}

// ─── Routes ───

export function registerAnalyticsRoutes(app: Express) {

  app.get('/api/analytics/convergence-summary', async (_req, res) => {
    try {
      if (isCacheFresh(convergenceCache, CONVERGENCE_TTL)) {
        return res.json(convergenceCache!.data);
      }

      const summary = await computeConvergenceSummary();
      convergenceCache = { data: summary, generatedAt: new Date() };
      res.json(summary);
    } catch (error) {
      console.error('Error computing convergence summary:', error);
      res.status(500).json({ error: 'Error al calcular el resumen de convergencia' });
    }
  });

  app.get('/api/analytics/insights', async (_req, res) => {
    try {
      if (isCacheFresh(insightsCache, INSIGHTS_TTL)) {
        return res.json(insightsCache!.data);
      }

      // Get convergence data for AI context
      let convergenceData;
      if (isCacheFresh(convergenceCache, CONVERGENCE_TTL)) {
        convergenceData = convergenceCache!.data;
      } else {
        convergenceData = await computeConvergenceSummary();
        convergenceCache = { data: convergenceData, generatedAt: new Date() };
      }

      const result = await generateAIInsights(convergenceData);
      insightsCache = { data: result, generatedAt: new Date() };
      res.json(result);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      res.status(500).json({ error: 'Error al generar las narrativas de análisis' });
    }
  });
}
