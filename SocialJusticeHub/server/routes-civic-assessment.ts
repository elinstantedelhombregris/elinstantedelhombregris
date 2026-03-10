import type { Express } from 'express';
import { db } from './db';
import {
  civicAssessments,
  civicAssessmentResponses,
  civicProfiles,
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authenticateToken, type AuthRequest } from './auth';
import { ASSESSMENT_QUESTIONS, CIVIC_DIMENSIONS, CIVIC_ARCHETYPES } from '@shared/civic-assessment-questions';
import {
  computeCivicProfile,
  getCommunityComparison,
} from './services/civic-profile-service';

export function registerCivicAssessmentRoutes(app: Express) {
  // GET /api/assessment/questions - Return the full question set
  app.get('/api/assessment/questions', (_req, res) => {
    res.json({
      questions: ASSESSMENT_QUESTIONS,
      dimensions: CIVIC_DIMENSIONS,
      archetypes: CIVIC_ARCHETYPES,
    });
  });

  // POST /api/assessment/start - Start a new assessment
  app.post('/api/assessment/start', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      // Check if there's an in-progress assessment
      const existing = await db
        .select()
        .from(civicAssessments)
        .where(and(
          eq(civicAssessments.userId, userId),
          eq(civicAssessments.status, 'in_progress'),
        ))
        .limit(1);

      if (existing.length > 0) {
        // Return existing in-progress assessment
        const responses = await db
          .select()
          .from(civicAssessmentResponses)
          .where(eq(civicAssessmentResponses.assessmentId, existing[0].id));

        return res.json({
          assessment: existing[0],
          responses,
        });
      }

      // Create new assessment
      const now = new Date().toISOString();
      const result = await db.insert(civicAssessments).values({
        userId,
        status: 'in_progress',
        version: 1,
        startedAt: now,
        createdAt: now,
      }).returning();

      res.json({
        assessment: result[0],
        responses: [],
      });
    } catch (error) {
      console.error('Error starting assessment:', error);
      res.status(500).json({ message: 'Error al iniciar la evaluacion' });
    }
  });

  // PUT /api/assessment/:id/respond - Save response(s)
  app.put('/api/assessment/:id/respond', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const { responses } = req.body as {
        responses: Array<{
          questionKey: string;
          dimensionKey: string;
          responseType: 'scale' | 'choice' | 'rank';
          responseValue?: number;
          responseChoice?: string;
          responseRank?: string[];
        }>;
      };

      // Verify ownership
      const assessment = await db
        .select()
        .from(civicAssessments)
        .where(and(
          eq(civicAssessments.id, assessmentId),
          eq(civicAssessments.userId, userId),
        ))
        .limit(1);

      if (assessment.length === 0) {
        return res.status(404).json({ message: 'Evaluacion no encontrada' });
      }

      if (assessment[0].status === 'completed') {
        return res.status(400).json({ message: 'Esta evaluacion ya fue completada' });
      }

      const now = new Date().toISOString();

      // Upsert each response
      for (const resp of responses) {
        const existing = await db
          .select()
          .from(civicAssessmentResponses)
          .where(and(
            eq(civicAssessmentResponses.assessmentId, assessmentId),
            eq(civicAssessmentResponses.questionKey, resp.questionKey),
          ))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(civicAssessmentResponses)
            .set({
              responseType: resp.responseType,
              responseValue: resp.responseValue ?? null,
              responseChoice: resp.responseChoice ?? null,
              responseRank: resp.responseRank ? JSON.stringify(resp.responseRank) : null,
            })
            .where(eq(civicAssessmentResponses.id, existing[0].id));
        } else {
          await db.insert(civicAssessmentResponses).values({
            assessmentId,
            questionKey: resp.questionKey,
            dimensionKey: resp.dimensionKey,
            responseType: resp.responseType,
            responseValue: resp.responseValue ?? null,
            responseChoice: resp.responseChoice ?? null,
            responseRank: resp.responseRank ? JSON.stringify(resp.responseRank) : null,
            createdAt: now,
          });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error saving responses:', error);
      res.status(500).json({ message: 'Error al guardar respuestas' });
    }
  });

  // POST /api/assessment/:id/complete - Finalize + compute profile
  app.post('/api/assessment/:id/complete', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      const userId = req.user!.userId;

      // Verify ownership
      const assessment = await db
        .select()
        .from(civicAssessments)
        .where(and(
          eq(civicAssessments.id, assessmentId),
          eq(civicAssessments.userId, userId),
        ))
        .limit(1);

      if (assessment.length === 0) {
        return res.status(404).json({ message: 'Evaluacion no encontrada' });
      }

      if (assessment[0].status === 'completed') {
        return res.status(400).json({ message: 'Esta evaluacion ya fue completada' });
      }

      // Compute the civic profile
      const profile = await computeCivicProfile(userId, assessmentId);

      // Get the archetype details
      const archetype = CIVIC_ARCHETYPES.find(a => a.key === profile.archetype);

      res.json({
        profile,
        archetype,
        dimensions: CIVIC_DIMENSIONS,
      });
    } catch (error) {
      console.error('Error completing assessment:', error);
      res.status(500).json({ message: 'Error al completar la evaluacion' });
    }
  });

  // GET /api/assessment/current - Get latest assessment
  app.get('/api/assessment/current', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const assessment = await db
        .select()
        .from(civicAssessments)
        .where(eq(civicAssessments.userId, userId))
        .orderBy(desc(civicAssessments.createdAt))
        .limit(1);

      if (assessment.length === 0) {
        return res.json({ assessment: null, responses: [] });
      }

      const responses = await db
        .select()
        .from(civicAssessmentResponses)
        .where(eq(civicAssessmentResponses.assessmentId, assessment[0].id));

      res.json({
        assessment: assessment[0],
        responses,
      });
    } catch (error) {
      console.error('Error fetching assessment:', error);
      res.status(500).json({ message: 'Error al obtener evaluacion' });
    }
  });

  // GET /api/civic-profile - Get computed profile
  app.get('/api/civic-profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const profile = await db
        .select()
        .from(civicProfiles)
        .where(eq(civicProfiles.userId, userId))
        .orderBy(desc(civicProfiles.createdAt))
        .limit(1);

      if (profile.length === 0) {
        return res.json({ profile: null });
      }

      const archetype = CIVIC_ARCHETYPES.find(a => a.key === profile[0].archetype);

      res.json({
        profile: {
          ...profile[0],
          dimensionScores: JSON.parse(profile[0].dimensionScores),
          topStrengths: JSON.parse(profile[0].topStrengths),
          growthAreas: JSON.parse(profile[0].growthAreas),
          recommendedActions: JSON.parse(profile[0].recommendedActions),
        },
        archetype,
        dimensions: CIVIC_DIMENSIONS,
      });
    } catch (error) {
      console.error('Error fetching civic profile:', error);
      res.status(500).json({ message: 'Error al obtener perfil civico' });
    }
  });

  // GET /api/civic-profile/history - Score trends over time
  app.get('/api/civic-profile/history', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const profiles = await db
        .select()
        .from(civicProfiles)
        .where(eq(civicProfiles.userId, userId))
        .orderBy(civicProfiles.createdAt);

      const history = profiles.map(p => ({
        date: p.createdAt,
        dimensionScores: JSON.parse(p.dimensionScores),
        archetype: p.archetype,
      }));

      res.json({ history });
    } catch (error) {
      console.error('Error fetching profile history:', error);
      res.status(500).json({ message: 'Error al obtener historial' });
    }
  });

  // GET /api/civic-profile/community-comparison - Percentile comparison
  app.get('/api/civic-profile/community-comparison', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const percentiles = await getCommunityComparison(userId);
      res.json({ percentiles });
    } catch (error) {
      console.error('Error fetching community comparison:', error);
      res.status(500).json({ message: 'Error al obtener comparacion comunitaria' });
    }
  });
}
