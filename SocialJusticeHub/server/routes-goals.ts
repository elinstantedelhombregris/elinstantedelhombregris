import type { Express } from 'express';
import { db } from './db';
import { civicGoals, weeklyCheckins } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authenticateToken, type AuthRequest } from './auth';

export function registerGoalRoutes(app: Express) {
  // GET /api/goals - List user goals
  app.get('/api/goals', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const goals = await db
        .select()
        .from(civicGoals)
        .where(eq(civicGoals.userId, userId))
        .orderBy(desc(civicGoals.createdAt));

      const parsed = goals.map(g => ({
        ...g,
        milestones: g.milestones ? JSON.parse(g.milestones) : [],
      }));

      res.json({ goals: parsed });
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ message: 'Error al obtener metas' });
    }
  });

  // POST /api/goals - Create goal
  app.post('/api/goals', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { title, description, category, targetDate, milestones, linkedLifeAreaId, linkedChallengeId } = req.body;

      const now = new Date().toISOString();
      const result = await db.insert(civicGoals).values({
        userId,
        title,
        description: description || null,
        category,
        targetDate: targetDate || null,
        status: 'active',
        progress: 0,
        milestones: milestones ? JSON.stringify(milestones) : null,
        linkedLifeAreaId: linkedLifeAreaId || null,
        linkedChallengeId: linkedChallengeId || null,
        createdAt: now,
        updatedAt: now,
      }).returning();

      res.json({ goal: { ...result[0], milestones: milestones || [] } });
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ message: 'Error al crear meta' });
    }
  });

  // PUT /api/goals/:id - Update goal
  app.put('/api/goals/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const goalId = parseInt(req.params.id);
      const { title, description, category, targetDate, status, progress, milestones } = req.body;

      const existing = await db
        .select()
        .from(civicGoals)
        .where(and(eq(civicGoals.id, goalId), eq(civicGoals.userId, userId)))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ message: 'Meta no encontrada' });
      }

      const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (category !== undefined) updates.category = category;
      if (targetDate !== undefined) updates.targetDate = targetDate;
      if (status !== undefined) updates.status = status;
      if (progress !== undefined) updates.progress = progress;
      if (milestones !== undefined) updates.milestones = JSON.stringify(milestones);

      await db.update(civicGoals).set(updates).where(eq(civicGoals.id, goalId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ message: 'Error al actualizar meta' });
    }
  });

  // DELETE /api/goals/:id - Soft delete (set to abandoned)
  app.delete('/api/goals/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const goalId = parseInt(req.params.id);

      await db.update(civicGoals)
        .set({ status: 'abandoned', updatedAt: new Date().toISOString() })
        .where(and(eq(civicGoals.id, goalId), eq(civicGoals.userId, userId)));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ message: 'Error al eliminar meta' });
    }
  });

  // GET /api/checkins - List check-ins
  app.get('/api/checkins', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const checkins = await db
        .select()
        .from(weeklyCheckins)
        .where(eq(weeklyCheckins.userId, userId))
        .orderBy(desc(weeklyCheckins.weekOf));

      const parsed = checkins.map(c => ({
        ...c,
        goalsReviewed: c.goalsReviewed ? JSON.parse(c.goalsReviewed) : [],
      }));

      res.json({ checkins: parsed });
    } catch (error) {
      console.error('Error fetching checkins:', error);
      res.status(500).json({ message: 'Error al obtener check-ins' });
    }
  });

  // POST /api/checkins - Create check-in
  app.post('/api/checkins', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { weekOf, mood, progressRating, highlight, challenge, nextWeekIntention, goalsReviewed } = req.body;

      const now = new Date().toISOString();
      const result = await db.insert(weeklyCheckins).values({
        userId,
        weekOf,
        mood,
        progressRating,
        highlight: highlight || null,
        challenge: challenge || null,
        nextWeekIntention: nextWeekIntention || null,
        goalsReviewed: goalsReviewed ? JSON.stringify(goalsReviewed) : null,
        createdAt: now,
      }).returning();

      res.json({ checkin: result[0] });
    } catch (error) {
      console.error('Error creating checkin:', error);
      res.status(500).json({ message: 'Error al crear check-in' });
    }
  });

  // GET /api/checkins/current-week - Get this week's check-in
  app.get('/api/checkins/current-week', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      // Get Monday of current week
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const weekOf = monday.toISOString().split('T')[0];

      const checkin = await db
        .select()
        .from(weeklyCheckins)
        .where(and(
          eq(weeklyCheckins.userId, userId),
          eq(weeklyCheckins.weekOf, weekOf),
        ))
        .limit(1);

      res.json({ checkin: checkin[0] || null, weekOf });
    } catch (error) {
      console.error('Error fetching current week checkin:', error);
      res.status(500).json({ message: 'Error al obtener check-in actual' });
    }
  });
}
