import type { Express } from 'express';
import { db } from './db';
import { coachingSessions } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authenticateToken, type AuthRequest } from './auth';
import { startCoachingSession, sendCoachingMessage } from './services/coaching-service';

export function registerCoachingRoutes(app: Express) {
  // POST /api/coaching/start - Start new session
  app.post('/api/coaching/start', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { sessionType } = req.body;

      if (!sessionType) {
        return res.status(400).json({ message: 'sessionType es requerido' });
      }

      const result = await startCoachingSession(userId, sessionType);
      res.json(result);
    } catch (error) {
      console.error('Error starting coaching session:', error);
      res.status(500).json({ message: 'Error al iniciar sesion de coaching' });
    }
  });

  // POST /api/coaching/:id/message - Send message
  app.post('/api/coaching/:id/message', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const sessionId = parseInt(req.params.id);
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Mensaje vacio' });
      }

      // Verify ownership
      const session = await db
        .select()
        .from(coachingSessions)
        .where(and(
          eq(coachingSessions.id, sessionId),
          eq(coachingSessions.userId, userId),
        ))
        .limit(1);

      if (session.length === 0) {
        return res.status(404).json({ message: 'Sesion no encontrada' });
      }

      const result = await sendCoachingMessage(userId, sessionId, message);
      res.json(result);
    } catch (error) {
      console.error('Error sending coaching message:', error);
      res.status(500).json({ message: 'Error al enviar mensaje' });
    }
  });

  // GET /api/coaching/sessions - List user sessions
  app.get('/api/coaching/sessions', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const sessions = await db
        .select()
        .from(coachingSessions)
        .where(eq(coachingSessions.userId, userId))
        .orderBy(desc(coachingSessions.updatedAt));

      const parsed = sessions.map(s => ({
        ...s,
        messages: JSON.parse(s.messages),
        insights: s.insights ? JSON.parse(s.insights) : null,
        suggestedActions: s.suggestedActions ? JSON.parse(s.suggestedActions) : null,
      }));

      res.json({ sessions: parsed });
    } catch (error) {
      console.error('Error fetching coaching sessions:', error);
      res.status(500).json({ message: 'Error al obtener sesiones' });
    }
  });

  // GET /api/coaching/:id - Get single session
  app.get('/api/coaching/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const sessionId = parseInt(req.params.id);

      const session = await db
        .select()
        .from(coachingSessions)
        .where(and(
          eq(coachingSessions.id, sessionId),
          eq(coachingSessions.userId, userId),
        ))
        .limit(1);

      if (session.length === 0) {
        return res.status(404).json({ message: 'Sesion no encontrada' });
      }

      res.json({
        session: {
          ...session[0],
          messages: JSON.parse(session[0].messages),
        },
      });
    } catch (error) {
      console.error('Error fetching coaching session:', error);
      res.status(500).json({ message: 'Error al obtener sesion' });
    }
  });
}
