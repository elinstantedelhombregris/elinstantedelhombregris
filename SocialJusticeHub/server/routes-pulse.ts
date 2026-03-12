/**
 * Routes — El Pulso Semanal
 *
 * API endpoints for weekly pulse digests and proposals.
 */

import type { Express } from 'express';
import { db } from './db';
import {
  weeklyDigests,
  digestProposals,
  proposalStatusHistory,
} from '../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { authenticateToken, optionalAuth, type AuthRequest } from './auth';
import { generateWeeklyMandate } from './services/mandato-engine';

export function registerPulseRoutes(app: Express) {

  // ── Pulse stats (summary for dashboard) ──────────────────
  // IMPORTANT: defined before /api/pulsos/:id to avoid Express matching "stats" as :id

  app.get('/api/pulsos/stats', optionalAuth, async (_req: AuthRequest, res) => {
    try {
      const [totalPulses] = await db.select({ count: sql<number>`count(*)` })
        .from(weeklyDigests)
        .where(eq(weeklyDigests.status, 'completed'));

      const [totalProposals] = await db.select({ count: sql<number>`count(*)` })
        .from(digestProposals);

      const [activeProposals] = await db.select({ count: sql<number>`count(*)` })
        .from(digestProposals)
        .where(sql`${digestProposals.status} NOT IN ('completada', 'archivada')`);

      const [completedProposals] = await db.select({ count: sql<number>`count(*)` })
        .from(digestProposals)
        .where(eq(digestProposals.status, 'completada'));

      const [latestPulse] = await db.select()
        .from(weeklyDigests)
        .where(eq(weeklyDigests.status, 'completed'))
        .orderBy(desc(weeklyDigests.createdAt))
        .limit(1);

      res.json({
        success: true,
        data: {
          totalPulses: Number(totalPulses?.count) || 0,
          totalProposals: Number(totalProposals?.count) || 0,
          activeProposals: Number(activeProposals?.count) || 0,
          completedProposals: Number(completedProposals?.count) || 0,
          lastPulseDate: latestPulse?.generatedAt || null,
          lastPulseWeek: latestPulse?.weekNumber || null,
        },
      });
    } catch (error) {
      console.error('Error fetching pulse stats:', error);
      res.status(500).json({ error: 'Error fetching stats' });
    }
  });

  // ── Get latest pulse ─────────────────────────────────────

  app.get('/api/pulsos/latest', optionalAuth, async (_req: AuthRequest, res) => {
    try {
      const [pulse] = await db.select()
        .from(weeklyDigests)
        .where(eq(weeklyDigests.status, 'completed'))
        .orderBy(desc(weeklyDigests.createdAt))
        .limit(1);

      if (!pulse) {
        return res.json({ success: true, data: null });
      }

      // Get proposals for this pulse
      const proposals = await db.select()
        .from(digestProposals)
        .where(eq(digestProposals.digestId, pulse.id))
        .orderBy(desc(digestProposals.urgency));

      res.json({
        success: true,
        data: {
          ...pulse,
          emergingThemes: safeJsonParse(pulse.emergingThemes),
          patterns: safeJsonParse(pulse.patterns),
          unconnectedResources: safeJsonParse(pulse.unconnectedResources),
          seedOfWeek: safeJsonParse(pulse.seedOfWeek),
          comparisonWithPrevious: safeJsonParse(pulse.comparisonWithPrevious),
          proposals: proposals.map(p => ({
            ...p,
            evidence: safeJsonParse(p.evidence),
          })),
        },
      });
    } catch (error) {
      console.error('Error fetching latest pulse:', error);
      res.status(500).json({ error: 'Error fetching latest pulse' });
    }
  });

  // ── Trigger manual pulse generation (authenticated) ──────

  app.post('/api/pulsos/generate', authenticateToken, async (_req: AuthRequest, res) => {
    try {
      const result = await generateWeeklyMandate();
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Error generating pulse:', error);
      res.status(500).json({ error: error.message || 'Error generating pulse' });
    }
  });

  // ── List all pulses (paginated) ──────────────────────────

  app.get('/api/pulsos', optionalAuth, async (_req: AuthRequest, res) => {
    try {
      const pulses = await db.select()
        .from(weeklyDigests)
        .where(eq(weeklyDigests.status, 'completed'))
        .orderBy(desc(weeklyDigests.createdAt))
        .limit(52); // Max 1 year of history

      res.json({
        success: true,
        data: pulses.map(p => ({
          ...p,
          emergingThemes: safeJsonParse(p.emergingThemes),
          patterns: safeJsonParse(p.patterns),
          unconnectedResources: safeJsonParse(p.unconnectedResources),
          seedOfWeek: safeJsonParse(p.seedOfWeek),
          comparisonWithPrevious: safeJsonParse(p.comparisonWithPrevious),
        })),
      });
    } catch (error) {
      console.error('Error fetching pulses:', error);
      res.status(500).json({ error: 'Error fetching pulses' });
    }
  });

  // ── Get specific pulse by ID ─────────────────────────────

  app.get('/api/pulsos/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

      const [pulse] = await db.select()
        .from(weeklyDigests)
        .where(eq(weeklyDigests.id, id))
        .limit(1);

      if (!pulse) {
        return res.status(404).json({ error: 'Pulse not found' });
      }

      const proposals = await db.select()
        .from(digestProposals)
        .where(eq(digestProposals.digestId, id))
        .orderBy(desc(digestProposals.urgency));

      res.json({
        success: true,
        data: {
          ...pulse,
          emergingThemes: safeJsonParse(pulse.emergingThemes),
          patterns: safeJsonParse(pulse.patterns),
          unconnectedResources: safeJsonParse(pulse.unconnectedResources),
          seedOfWeek: safeJsonParse(pulse.seedOfWeek),
          comparisonWithPrevious: safeJsonParse(pulse.comparisonWithPrevious),
          proposals: proposals.map(p => ({
            ...p,
            evidence: safeJsonParse(p.evidence),
          })),
        },
      });
    } catch (error) {
      console.error('Error fetching pulse:', error);
      res.status(500).json({ error: 'Error fetching pulse' });
    }
  });

  // ── Get all proposals (with filtering) ───────────────────

  app.get('/api/propuestas', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { status, urgency, target } = req.query;

      const conditions: any[] = [];
      if (status) conditions.push(eq(digestProposals.status, status as any));
      if (urgency) conditions.push(eq(digestProposals.urgency, urgency as any));
      if (target) conditions.push(eq(digestProposals.targetCategory, target as any));

      const proposals = conditions.length > 0
        ? await db.select().from(digestProposals).where(and(...conditions)).orderBy(desc(digestProposals.createdAt))
        : await db.select().from(digestProposals).orderBy(desc(digestProposals.createdAt));

      res.json({
        success: true,
        data: proposals.map(p => ({
          ...p,
          evidence: safeJsonParse(p.evidence),
        })),
      });
    } catch (error) {
      console.error('Error fetching proposals:', error);
      res.status(500).json({ error: 'Error fetching proposals' });
    }
  });

  // ── Get single proposal detail ───────────────────────────

  app.get('/api/propuestas/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

      const [proposal] = await db.select()
        .from(digestProposals)
        .where(eq(digestProposals.id, id))
        .limit(1);

      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      // Get status history
      const history = await db.select()
        .from(proposalStatusHistory)
        .where(eq(proposalStatusHistory.proposalId, id))
        .orderBy(desc(proposalStatusHistory.createdAt));

      res.json({
        success: true,
        data: {
          ...proposal,
          evidence: safeJsonParse(proposal.evidence),
          statusHistory: history,
        },
      });
    } catch (error) {
      console.error('Error fetching proposal:', error);
      res.status(500).json({ error: 'Error fetching proposal' });
    }
  });

  // ── Update proposal status ───────────────────────────────

  app.post('/api/propuestas/:id/status', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      const userId = req.user?.userId;

      if (!status) return res.status(400).json({ error: 'Status is required' });

      const validStatuses = ['semilla', 'propuesta', 'enviada', 'respondida', 'en_accion', 'completada', 'archivada'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const [current] = await db.select()
        .from(digestProposals)
        .where(eq(digestProposals.id, id))
        .limit(1);

      if (!current) return res.status(404).json({ error: 'Proposal not found' });

      // Update proposal
      const [updated] = await db.update(digestProposals)
        .set({ status: status as any, updatedAt: new Date().toISOString() })
        .where(eq(digestProposals.id, id))
        .returning();

      // Log status change
      await db.insert(proposalStatusHistory).values({
        proposalId: id,
        fromStatus: current.status,
        toStatus: status,
        changedBy: userId || null,
        notes: notes || null,
      });

      res.json({ success: true, data: { ...updated, evidence: safeJsonParse(updated.evidence) } });
    } catch (error) {
      console.error('Error updating proposal status:', error);
      res.status(500).json({ error: 'Error updating proposal status' });
    }
  });
}

function safeJsonParse(str: string | null): any {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
