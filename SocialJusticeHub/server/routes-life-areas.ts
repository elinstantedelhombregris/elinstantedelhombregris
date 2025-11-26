import type { Express } from "express";
import { authenticateToken, type AuthRequest } from './auth';
import { db } from "./db";
import { 
  lifeAreas, 
  lifeAreaSubcategories, 
  lifeAreaQuizzes, 
  lifeAreaQuizQuestions,
  lifeAreaQuizResponses,
  lifeAreaScores,
  lifeAreaActions,
  userLifeAreaProgress,
  lifeAreaMilestones,
  lifeAreaIndicators,
  lifeAreaCommunityStats,
  lifeAreaXpLog,
  lifeAreaLevels,
  lifeAreaStreaks,
  lifeAreaBadges,
  userLifeAreaBadges,
  lifeAreaCurrency,
  lifeAreaRewardChests,
  lifeAreaChallenges,
  userLifeAreaChallenges,
  lifeAreaMastery,
  lifeAreaNotifications,
  lifeAreaSocialInteractions,
  users
} from "@shared/schema-sqlite";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { randomUUID } from 'crypto';

// Tabla de asignación de valores: Escala 1-10 a Puntos 0-100
// Mapea las respuestas del usuario (escala 0-10) a puntos (0-100)
const SCORE_MAPPING: Record<number, number> = {
  0: 0,
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
  6: 60,
  7: 70,
  8: 80,
  9: 90,
  10: 100,
};

// Función para convertir escala 0-10 a puntos 0-100
function mapScaleToScore(scaleValue: number): number {
  // Asegurar que el valor esté en el rango 0-10
  const clampedValue = Math.max(0, Math.min(10, Math.round(scaleValue)));
  return SCORE_MAPPING[clampedValue] ?? 0;
}

export function registerLifeAreasRoutes(app: Express) {
  // ==================== LIFE AREAS ENDPOINTS ====================

  // GET /api/life-areas - Listar las 12 áreas
  app.get("/api/life-areas", async (req, res) => {
    try {
      const areas = await db.select().from(lifeAreas).orderBy(lifeAreas.orderIndex);
      res.json(areas);
    } catch (error) {
      console.error("Error fetching life areas:", error);
      res.status(500).json({ message: "Error fetching life areas" });
    }
  });

  // IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros
  // GET /api/life-areas/dashboard - Datos completos del dashboard
  app.get("/api/life-areas/dashboard", authenticateToken, async (req: AuthRequest, res) => {
    try {
      console.log('[Life Areas Dashboard] Request received:', {
        hasUser: !!req.user,
        userId: req.user?.userId,
        headers: req.headers.authorization ? 'Authorization header present' : 'No authorization header'
      });
      
      if (!req.user) {
        console.error('[Life Areas Dashboard] No user found in request');
        return res.status(401).json({ message: "Authentication required" });
      }
      const userId = req.user.userId;
      console.log('[Life Areas Dashboard] Processing for userId:', userId);

      // Obtener todas las áreas con sus puntuaciones
      const areas = await db.select().from(lifeAreas).orderBy(lifeAreas.orderIndex);
      const scores = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            sql`${lifeAreaScores.subcategoryId} IS NULL`
          )
        );

      const scoresMap = new Map(scores.map(s => [s.lifeAreaId, s]));

      const areasWithScores = areas.map(area => ({
        ...area,
        score: scoresMap.get(area.id) || null,
      }));

      // Obtener niveles
      const levels = await db.select()
        .from(lifeAreaLevels)
        .where(eq(lifeAreaLevels.userId, userId));

      // Obtener streaks
      const streaks = await db.select()
        .from(lifeAreaStreaks)
        .where(eq(lifeAreaStreaks.userId, userId));

      // Obtener badges recientes
      const recentBadges = await db.select({
        badge: userLifeAreaBadges,
        badgeInfo: lifeAreaBadges,
      })
        .from(userLifeAreaBadges)
        .innerJoin(lifeAreaBadges, eq(userLifeAreaBadges.badgeId, lifeAreaBadges.id))
        .where(eq(userLifeAreaBadges.userId, userId))
        .orderBy(desc(userLifeAreaBadges.earnedAt))
        .limit(5);

      // Obtener moneda
      const currency = await db.select()
        .from(lifeAreaCurrency)
        .where(eq(lifeAreaCurrency.userId, userId))
        .limit(1);

      res.json({
        areas: areasWithScores,
        levels,
        streaks,
        recentBadges: recentBadges.map(rb => ({
          ...rb.badge,
          badgeInfo: rb.badgeInfo,
        })),
        currency: currency[0] || { amount: 0, totalEarned: 0, totalSpent: 0 },
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      res.status(500).json({ message: "Error fetching dashboard", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // GET /api/life-areas/wheel - Datos para rueda de vida
  app.get("/api/life-areas/wheel", authenticateToken, async (req: AuthRequest, res) => {
    try {
      console.log('[Life Areas Wheel] Request received:', {
        hasUser: !!req.user,
        userId: req.user?.userId,
        headers: req.headers.authorization ? 'Authorization header present' : 'No authorization header'
      });
      
      if (!req.user) {
        console.error('[Life Areas Wheel] No user found in request');
        return res.status(401).json({ message: "Authentication required" });
      }
      const userId = req.user.userId;
      console.log('[Life Areas Wheel] Processing for userId:', userId);

      const areas = await db.select().from(lifeAreas).orderBy(lifeAreas.orderIndex);
      const scores = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            sql`${lifeAreaScores.subcategoryId} IS NULL`
          )
        );

      const scoresMap = new Map(scores.map(s => [s.lifeAreaId, s]));

      const wheelData = areas.map(area => {
        let colorTheme = null;
        if (area.colorTheme) {
          try {
            colorTheme = JSON.parse(area.colorTheme);
          } catch (e) {
            console.warn(`Failed to parse colorTheme for area ${area.id}:`, e);
            colorTheme = null;
          }
        }
        return {
          id: area.id,
          name: area.name,
          iconName: area.iconName,
          colorTheme,
          currentScore: scoresMap.get(area.id)?.currentScore || 0,
          desiredScore: scoresMap.get(area.id)?.desiredScore || 0,
          gap: scoresMap.get(area.id)?.gap || 0,
        };
      });

      res.json(wheelData);
    } catch (error) {
      console.error("Error fetching wheel data:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      res.status(500).json({ message: "Error fetching wheel data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // GET /api/life-areas/:areaId - Obtener área con subcategorías
  app.get("/api/life-areas/:areaId(\\d+)", async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const area = await db.select().from(lifeAreas).where(eq(lifeAreas.id, areaId)).limit(1);
      
      if (area.length === 0) {
        return res.status(404).json({ message: "Life area not found" });
      }

      const subcategories = await db.select()
        .from(lifeAreaSubcategories)
        .where(eq(lifeAreaSubcategories.lifeAreaId, areaId))
        .orderBy(lifeAreaSubcategories.orderIndex);

      res.json({ ...area[0], subcategories });
    } catch (error) {
      console.error("Error fetching life area:", error);
      res.status(500).json({ message: "Error fetching life area" });
    }
  });

  // GET /api/life-areas/:areaId/quiz - Obtener quiz de un área
  app.get("/api/life-areas/:areaId(\\d+)/quiz", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const userId = req.user!.userId;

      // Obtener quiz del área
      const quizzes = await db.select()
        .from(lifeAreaQuizzes)
        .where(eq(lifeAreaQuizzes.lifeAreaId, areaId))
        .limit(1);

      if (quizzes.length === 0) {
        return res.status(404).json({ message: "Quiz not found for this area" });
      }

      const quiz = quizzes[0];

      // Obtener preguntas del quiz ordenadas
      const questions = await db.select()
        .from(lifeAreaQuizQuestions)
        .where(eq(lifeAreaQuizQuestions.quizId, quiz.id))
        .orderBy(lifeAreaQuizQuestions.orderIndex);

      // Obtener respuestas previas del usuario si existen
      const previousResponses = await db.select()
        .from(lifeAreaQuizResponses)
        .where(
          and(
            eq(lifeAreaQuizResponses.userId, userId),
            eq(lifeAreaQuizResponses.quizId, quiz.id)
          )
        );

      // Mapear respuestas por questionId para fácil acceso
      const responsesMap = new Map(
        previousResponses.map(r => [r.questionId, r])
      );

      // Agregar respuestas previas a las preguntas
      const questionsWithResponses = questions.map(q => ({
        ...q,
        currentValue: responsesMap.get(q.id)?.currentValue || null,
        desiredValue: responsesMap.get(q.id)?.desiredValue || null,
      }));

      res.json({
        ...quiz,
        questions: questionsWithResponses,
      });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Error fetching quiz" });
    }
  });

  // POST /api/life-areas/:areaId/quiz/submit - Enviar respuestas del quiz
  app.post("/api/life-areas/:areaId(\\d+)/quiz/submit", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const userId = req.user!.userId;
      const { responses } = req.body; // Array de { questionId, currentValue, desiredValue }

      if (!Array.isArray(responses)) {
        return res.status(400).json({ message: "Responses must be an array" });
      }

      if (responses.length === 0) {
        return res.status(400).json({ message: "At least one response is required" });
      }

      // Obtener quiz
      const quizzes = await db.select()
        .from(lifeAreaQuizzes)
        .where(eq(lifeAreaQuizzes.lifeAreaId, areaId))
        .limit(1);

      if (quizzes.length === 0) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const quiz = quizzes[0];

      // Eliminar respuestas previas del usuario para este quiz
      await db.delete(lifeAreaQuizResponses)
        .where(
          and(
            eq(lifeAreaQuizResponses.userId, userId),
            eq(lifeAreaQuizResponses.quizId, quiz.id)
          )
        );

      // Validar y preparar respuestas
      // Las respuestas vienen en escala 0-10, las convertimos a 0-100 usando el mapeo
      const validResponses = responses.filter(r => {
        const questionId = parseInt(r.questionId);
        const currentScale = r.currentValue !== undefined && r.currentValue !== null ? parseFloat(r.currentValue) : null;
        const desiredScale = r.desiredValue !== undefined && r.desiredValue !== null ? parseFloat(r.desiredValue) : null;
        
        return !isNaN(questionId) && 
               questionId > 0 && 
               (currentScale !== null || desiredScale !== null) &&
               (currentScale === null || (currentScale >= 0 && currentScale <= 10)) &&
               (desiredScale === null || (desiredScale >= 0 && desiredScale <= 10));
      });

      if (validResponses.length === 0) {
        return res.status(400).json({ message: "No valid responses provided" });
      }

      // Insertar nuevas respuestas con valores mapeados (0-100)
      const now = new Date().toISOString();
      for (const response of validResponses) {
        const questionId = parseInt(response.questionId);
        const currentScale = response.currentValue !== undefined && response.currentValue !== null ? parseFloat(response.currentValue) : null;
        const desiredScale = response.desiredValue !== undefined && response.desiredValue !== null ? parseFloat(response.desiredValue) : null;
        
        await db.insert(lifeAreaQuizResponses).values({
          userId,
          quizId: quiz.id,
          questionId,
          // Convertir escala 0-10 a puntos 0-100 usando el mapeo
          currentValue: currentScale !== null ? mapScaleToScore(currentScale) : null,
          desiredValue: desiredScale !== null ? mapScaleToScore(desiredScale) : null,
          answeredAt: now,
        });
      }

      // Calcular y guardar puntuaciones
      await calculateAndSaveScores(userId, areaId, quiz.id);

      // Otorgar XP por completar quiz
      await awardXP(userId, areaId, 100, 'quiz', quiz.id);

      // Verificar badges
      await checkBadges(userId, areaId, 'quiz_complete');

      res.json({ message: "Quiz submitted successfully" });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Error submitting quiz" });
    }
  });

  // GET /api/life-areas/:areaId/scores - Obtener puntuaciones del usuario
  app.get("/api/life-areas/:areaId(\\d+)/scores", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const userId = req.user!.userId;

      // Obtener puntuación general del área
      const areaScore = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            eq(lifeAreaScores.lifeAreaId, areaId),
            sql`${lifeAreaScores.subcategoryId} IS NULL`
          )
        )
        .limit(1);

      // Obtener puntuaciones por subcategoría
      const subcategoryScores = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            eq(lifeAreaScores.lifeAreaId, areaId),
            sql`${lifeAreaScores.subcategoryId} IS NOT NULL`
          )
        );

      res.json({
        areaScore: areaScore[0] || null,
        subcategoryScores,
      });
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Error fetching scores" });
    }
  });

  // PUT /api/life-areas/:areaId/quiz/retake - Re-evaluar un área
  app.put("/api/life-areas/:areaId(\\d+)/quiz/retake", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const userId = req.user!.userId;

      // Eliminar respuestas y puntuaciones previas
      const quizzes = await db.select()
        .from(lifeAreaQuizzes)
        .where(eq(lifeAreaQuizzes.lifeAreaId, areaId))
        .limit(1);

      if (quizzes.length > 0) {
        await db.delete(lifeAreaQuizResponses)
          .where(
            and(
              eq(lifeAreaQuizResponses.userId, userId),
              eq(lifeAreaQuizResponses.quizId, quizzes[0].id)
            )
          );
      }

      await db.delete(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            eq(lifeAreaScores.lifeAreaId, areaId)
          )
        );

      res.json({ message: "Quiz reset successfully. You can now retake it." });
    } catch (error) {
      console.error("Error resetting quiz:", error);
      res.status(500).json({ message: "Error resetting quiz" });
    }
  });

  // ==================== HELPER FUNCTIONS ====================

  // Calcular y guardar puntuaciones
  async function calculateAndSaveScores(userId: number, areaId: number, quizId: number) {
    // Obtener todas las respuestas del usuario para este quiz
    const responses = await db.select()
      .from(lifeAreaQuizResponses)
      .where(
        and(
          eq(lifeAreaQuizResponses.userId, userId),
          eq(lifeAreaQuizResponses.quizId, quizId)
        )
      );

    // Obtener preguntas con sus subcategorías
    const questions = await db.select({
      question: lifeAreaQuizQuestions,
      subcategory: lifeAreaSubcategories,
    })
      .from(lifeAreaQuizQuestions)
      .leftJoin(lifeAreaSubcategories, eq(lifeAreaQuizQuestions.subcategoryId, lifeAreaSubcategories.id))
      .where(eq(lifeAreaQuizQuestions.quizId, quizId));

    // Agrupar respuestas por subcategoría
    const subcategoryScores: Map<number, { current: number[], desired: number[] }> = new Map();
    const allCurrent: number[] = [];
    const allDesired: number[] = [];

    for (const response of responses) {
      const question = questions.find(q => q.question.id === response.questionId);
      if (!question) continue;

      const value = question.question.category === 'current' ? response.currentValue : response.desiredValue;
      if (value === null || value === undefined) continue;

      if (question.subcategory) {
        const subcatId = question.subcategory.id;
        if (!subcategoryScores.has(subcatId)) {
          subcategoryScores.set(subcatId, { current: [], desired: [] });
        }
        const scores = subcategoryScores.get(subcatId)!;
        if (question.question.category === 'current') {
          scores.current.push(value);
        } else {
          scores.desired.push(value);
        }
      }

      if (question.question.category === 'current') {
        allCurrent.push(value);
      } else {
        allDesired.push(value);
      }
    }

    // Calcular puntuación general del área
    // Solo calcular si hay respuestas válidas
    if (allCurrent.length === 0 && allDesired.length === 0) {
      return; // No hay respuestas válidas, no calcular puntuaciones
    }

    const avgCurrent = allCurrent.length > 0 
      ? Math.round(allCurrent.reduce((a, b) => a + b, 0) / allCurrent.length)
      : 0;
    const avgDesired = allDesired.length > 0
      ? Math.round(allDesired.reduce((a, b) => a + b, 0) / allDesired.length)
      : 0;
    const gap = avgDesired - avgCurrent;

    // Guardar puntuación general
    const existingScore = await db.select()
      .from(lifeAreaScores)
      .where(
        and(
          eq(lifeAreaScores.userId, userId),
          eq(lifeAreaScores.lifeAreaId, areaId),
          sql`${lifeAreaScores.subcategoryId} IS NULL`
        )
      )
      .limit(1);

    if (existingScore.length > 0 && existingScore[0]) {
      await db.update(lifeAreaScores)
        .set({
          currentScore: avgCurrent,
          desiredScore: avgDesired,
          gap,
          lastUpdated: new Date().toISOString(),
        })
        .where(eq(lifeAreaScores.id, existingScore[0].id));
    } else {
      await db.insert(lifeAreaScores).values({
        userId,
        lifeAreaId: areaId,
        subcategoryId: null,
        currentScore: avgCurrent,
        desiredScore: avgDesired,
        gap,
      });
    }

    // Guardar puntuaciones por subcategoría
    for (const [subcatId, scores] of Array.from(subcategoryScores.entries())) {
      const subcatCurrent = scores.current.length > 0
        ? Math.round(scores.current.reduce((a: number, b: number) => a + b, 0) / scores.current.length)
        : 0;
      const subcatDesired = scores.desired.length > 0
        ? Math.round(scores.desired.reduce((a: number, b: number) => a + b, 0) / scores.desired.length)
        : 0;
      const subcatGap = subcatDesired - subcatCurrent;

      const existingSubcatScore = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            eq(lifeAreaScores.lifeAreaId, areaId),
            eq(lifeAreaScores.subcategoryId, subcatId)
          )
        )
        .limit(1);

      if (existingSubcatScore.length > 0 && existingSubcatScore[0]) {
        await db.update(lifeAreaScores)
          .set({
            currentScore: subcatCurrent,
            desiredScore: subcatDesired,
            gap: subcatGap,
            lastUpdated: new Date().toISOString(),
          })
          .where(eq(lifeAreaScores.id, existingSubcatScore[0].id));
      } else {
        await db.insert(lifeAreaScores).values({
          userId,
          lifeAreaId: areaId,
          subcategoryId: subcatId,
          currentScore: subcatCurrent,
          desiredScore: subcatDesired,
          gap: subcatGap,
        });
      }
    }
  }

  // Otorgar XP
  async function awardXP(userId: number, areaId: number, amount: number, sourceType: string, sourceId?: number) {
    // Obtener multiplicador de streak
    const streak = await db.select()
      .from(lifeAreaStreaks)
      .where(
        and(
          eq(lifeAreaStreaks.userId, userId),
          eq(lifeAreaStreaks.streakType, 'daily')
        )
      )
      .limit(1);

    const multiplier = streak[0]?.bonusMultiplier || 1.0;
    const finalXP = Math.round(amount * multiplier);

    // Registrar XP
    await db.insert(lifeAreaXpLog).values({
      userId,
      lifeAreaId: areaId,
      xpAmount: finalXP,
      sourceType: sourceType as any,
      sourceId: sourceId || null,
      multiplier,
    });

    // Actualizar nivel
    await updateLevel(userId, areaId);
  }

  // Actualizar nivel del usuario
  async function updateLevel(userId: number, areaId: number) {
    // Calcular XP total del área
    const xpResult = await db.select({
      total: sql<number>`SUM(${lifeAreaXpLog.xpAmount})`,
    })
      .from(lifeAreaXpLog)
      .where(
        and(
          eq(lifeAreaXpLog.userId, userId),
          eq(lifeAreaXpLog.lifeAreaId, areaId)
        )
      );

    const totalXP = xpResult[0]?.total || 0;

    // Calcular nivel (cada nivel requiere más XP)
    let level = 1;
    let xpRequired = 100;
    let xpCurrent = totalXP;

    while (xpCurrent >= xpRequired && level < 10) {
      xpCurrent -= xpRequired;
      level++;
      xpRequired = Math.round(xpRequired * 1.5); // Incremento exponencial
    }

    // Obtener nivel actual
    const currentLevel = await db.select()
      .from(lifeAreaLevels)
      .where(
        and(
          eq(lifeAreaLevels.userId, userId),
          eq(lifeAreaLevels.lifeAreaId, areaId)
        )
      )
      .limit(1);

    const currentLevelData = currentLevel.length > 0 ? currentLevel[0] : null;
    const wasLevelUp = currentLevelData && (currentLevelData.level || 0) < level;

    // Actualizar o crear nivel
    if (currentLevelData) {
      await db.update(lifeAreaLevels)
        .set({
          level,
          xpCurrent,
          xpRequired,
          levelUpAt: wasLevelUp ? new Date().toISOString() : (currentLevelData.levelUpAt || null),
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(lifeAreaLevels.userId, userId),
            eq(lifeAreaLevels.lifeAreaId, areaId)
          )
        );
    } else {
      await db.insert(lifeAreaLevels).values({
        userId,
        lifeAreaId: areaId,
        level,
        xpCurrent,
        xpRequired,
      });
    }

    // Crear notificación si hubo level up
    if (wasLevelUp) {
      await db.insert(lifeAreaNotifications).values({
        userId,
        type: 'level_up',
        title: '¡Subiste de nivel!',
        message: `Has alcanzado el nivel ${level} en esta área`,
        actionUrl: `/life-areas/${areaId}`,
      });
    }
  }

  // Verificar badges
  async function checkBadges(userId: number, areaId: number, requirementType: string) {
    // Obtener badges que cumplen el requisito
    const badges = await db.select()
      .from(lifeAreaBadges)
      .where(eq(lifeAreaBadges.requirementType, requirementType as any));

    for (const badge of badges) {
      // Verificar si el usuario ya tiene el badge
      const existing = await db.select()
        .from(userLifeAreaBadges)
        .where(
          and(
            eq(userLifeAreaBadges.userId, userId),
            eq(userLifeAreaBadges.badgeId, badge.id)
          )
        )
        .limit(1);

      if (existing.length > 0) continue;

      // Verificar requisitos específicos según requirementData
      let shouldAward = false;
      if (requirementType === 'quiz_complete') {
        // Verificar si completó el quiz del área
        const quiz = await db.select()
          .from(lifeAreaQuizzes)
          .where(eq(lifeAreaQuizzes.lifeAreaId, areaId))
          .limit(1);

        if (quiz.length > 0) {
          const responses = await db.select()
            .from(lifeAreaQuizResponses)
            .where(
              and(
                eq(lifeAreaQuizResponses.userId, userId),
                eq(lifeAreaQuizResponses.quizId, quiz[0].id)
              )
            );

          shouldAward = responses.length > 0;
        }
      }

      if (shouldAward) {
        // Otorgar badge
        await db.insert(userLifeAreaBadges).values({
          userId,
          badgeId: badge.id,
        });

        // Otorgar recompensas
        if (badge.xpReward && badge.xpReward > 0) {
          await awardXP(userId, areaId, badge.xpReward, 'badge', badge.id);
        }

        if (badge.seedReward && badge.seedReward > 0) {
          await awardSeeds(userId, badge.seedReward);
        }

        // Crear notificación
        await db.insert(lifeAreaNotifications).values({
          userId,
          type: 'badge_earned',
          title: '¡Nuevo badge obtenido!',
          message: `Has obtenido el badge: ${badge.name}`,
          actionUrl: '/life-areas/badges',
        });
      }
    }
  }

  // Otorgar semillas
  async function awardSeeds(userId: number, amount: number) {
    const currency = await db.select()
      .from(lifeAreaCurrency)
      .where(eq(lifeAreaCurrency.userId, userId))
      .limit(1);

    const currencyData = currency.length > 0 ? currency[0] : null;
    if (currencyData) {
      await db.update(lifeAreaCurrency)
        .set({
          amount: (currencyData.amount || 0) + amount,
          totalEarned: (currencyData.totalEarned || 0) + amount,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(lifeAreaCurrency.userId, userId));
    } else {
      await db.insert(lifeAreaCurrency).values({
        userId,
        amount,
        totalEarned: amount,
      });
    }
  }

  // ==================== ACTIONS ENDPOINTS ====================

  // GET /api/life-areas/:areaId/actions - Obtener acciones recomendadas
  app.get("/api/life-areas/:areaId(\\d+)/actions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const userId = req.user!.userId;

      // Obtener puntuación del usuario para priorizar acciones
      const score = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            eq(lifeAreaScores.lifeAreaId, areaId),
            sql`${lifeAreaScores.subcategoryId} IS NULL`
          )
        )
        .limit(1);

      // Obtener acciones del área
      const actions = await db.select()
        .from(lifeAreaActions)
        .where(eq(lifeAreaActions.lifeAreaId, areaId))
        .orderBy(desc(lifeAreaActions.priority));

      // Obtener progreso del usuario en cada acción
      const actionsWithProgress = await Promise.all(
        actions.map(async (action) => {
          const progress = await db.select()
            .from(userLifeAreaProgress)
            .where(
              and(
                eq(userLifeAreaProgress.userId, userId),
                eq(userLifeAreaProgress.actionId, action.id)
              )
            )
            .limit(1);

          return {
            ...action,
            userProgress: progress[0] || null,
          };
        })
      );

      res.json(actionsWithProgress);
    } catch (error) {
      console.error("Error fetching actions:", error);
      res.status(500).json({ message: "Error fetching actions" });
    }
  });

  // POST /api/life-areas/actions/:actionId/start - Iniciar una acción
  app.post("/api/life-areas/actions/:actionId(\\d+)/start", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const actionId = parseInt(req.params.actionId);
      
      if (isNaN(actionId) || actionId <= 0) {
        return res.status(400).json({ message: "Invalid action ID" });
      }

      const userId = req.user!.userId;

      // Verificar que la acción existe
      const action = await db.select()
        .from(lifeAreaActions)
        .where(eq(lifeAreaActions.id, actionId))
        .limit(1);

      if (action.length === 0) {
        return res.status(404).json({ message: "Action not found" });
      }

      // Verificar si ya existe progreso
      const existing = await db.select()
        .from(userLifeAreaProgress)
        .where(
          and(
            eq(userLifeAreaProgress.userId, userId),
            eq(userLifeAreaProgress.actionId, actionId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Actualizar a in_progress si estaba not_started
        if (existing[0].status === 'not_started') {
          await db.update(userLifeAreaProgress)
            .set({
              status: 'in_progress',
              startedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .where(eq(userLifeAreaProgress.id, existing[0].id));
        }
        return res.json({ message: "Action already started", progress: existing[0] });
      }

      // Crear nuevo progreso
      const [progress] = await db.insert(userLifeAreaProgress).values({
        userId,
        actionId,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      }).returning();

      // Otorgar XP por iniciar
      if (action[0] && action[0].lifeAreaId && action[0].xpReward) {
        await awardXP(userId, action[0].lifeAreaId, Math.round(action[0].xpReward * 0.2), 'action', actionId);
      }

      // Actualizar streak
      await updateStreak(userId);

      res.json({ message: "Action started", progress });
    } catch (error) {
      console.error("Error starting action:", error);
      res.status(500).json({ message: "Error starting action" });
    }
  });

  // PUT /api/life-areas/actions/:actionId/progress - Actualizar progreso
  app.put("/api/life-areas/actions/:actionId(\\d+)/progress", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const actionId = parseInt(req.params.actionId);
      
      if (isNaN(actionId) || actionId <= 0) {
        return res.status(400).json({ message: "Invalid action ID" });
      }

      const userId = req.user!.userId;
      const { notes, evidence } = req.body;

      // Validar que notes no exceda longitud máxima
      if (notes && typeof notes === 'string' && notes.length > 5000) {
        return res.status(400).json({ message: "Notes too long (max 5000 characters)" });
      }

      const progress = await db.select()
        .from(userLifeAreaProgress)
        .where(
          and(
            eq(userLifeAreaProgress.userId, userId),
            eq(userLifeAreaProgress.actionId, actionId)
          )
        )
        .limit(1);

      if (progress.length === 0) {
        return res.status(404).json({ message: "Progress not found" });
      }

      await db.update(userLifeAreaProgress)
        .set({
          notes: notes || progress[0].notes,
          evidence: evidence ? JSON.stringify(evidence) : progress[0].evidence,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userLifeAreaProgress.id, progress[0].id));

      res.json({ message: "Progress updated" });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Error updating progress" });
    }
  });

  // POST /api/life-areas/actions/:actionId/complete - Completar acción
  app.post("/api/life-areas/actions/:actionId(\\d+)/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const actionId = parseInt(req.params.actionId);
      
      if (isNaN(actionId) || actionId <= 0) {
        return res.status(400).json({ message: "Invalid action ID" });
      }

      const userId = req.user!.userId;

      const action = await db.select()
        .from(lifeAreaActions)
        .where(eq(lifeAreaActions.id, actionId))
        .limit(1);

      if (action.length === 0) {
        return res.status(404).json({ message: "Action not found" });
      }

      const progress = await db.select()
        .from(userLifeAreaProgress)
        .where(
          and(
            eq(userLifeAreaProgress.userId, userId),
            eq(userLifeAreaProgress.actionId, actionId)
          )
        )
        .limit(1);

      if (progress.length === 0 || !progress[0]) {
        return res.status(404).json({ message: "Progress not found" });
      }

      if (!action[0] || !action[0].lifeAreaId) {
        return res.status(404).json({ message: "Action not found" });
      }

      // Actualizar a completado
      await db.update(userLifeAreaProgress)
        .set({
          status: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userLifeAreaProgress.id, progress[0].id));

      // Otorgar XP completo
      if (action[0].xpReward) {
        await awardXP(userId, action[0].lifeAreaId, action[0].xpReward, 'action', actionId);
      }

      // Otorgar semillas
      if (action[0].seedReward) {
        await awardSeeds(userId, action[0].seedReward);
      }

      // Actualizar streak
      await updateStreak(userId);

      // Actualizar maestría
      await updateMastery(userId, action[0].lifeAreaId);

      // Verificar badges
      await checkBadges(userId, action[0].lifeAreaId, 'actions_complete');

      res.json({ message: "Action completed successfully" });
    } catch (error) {
      console.error("Error completing action:", error);
      res.status(500).json({ message: "Error completing action" });
    }
  });

  // ==================== PROGRESS ENDPOINTS ====================

  // GET /api/life-areas/progress - Progreso general del usuario
  app.get("/api/life-areas/progress", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      // Obtener todas las puntuaciones del usuario
      const scores = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            sql`${lifeAreaScores.subcategoryId} IS NULL`
          )
        )
        .orderBy(lifeAreaScores.lifeAreaId);

      // Obtener progreso en acciones
      const actionsProgress = await db.select({
        progress: userLifeAreaProgress,
        action: lifeAreaActions,
      })
        .from(userLifeAreaProgress)
        .innerJoin(lifeAreaActions, eq(userLifeAreaProgress.actionId, lifeAreaActions.id))
        .where(eq(userLifeAreaProgress.userId, userId))
        .orderBy(desc(userLifeAreaProgress.updatedAt));

      res.json({
        scores,
        actionsProgress: actionsProgress.map(ap => ({
          ...ap.progress,
          action: ap.action,
        })),
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Error fetching progress" });
    }
  });

  // GET /api/life-areas/:areaId/progress - Progreso por área
  app.get("/api/life-areas/:areaId(\\d+)/progress", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const userId = req.user!.userId;

      const scores = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            eq(lifeAreaScores.lifeAreaId, areaId)
          )
        );

      const actionsProgress = await db.select({
        progress: userLifeAreaProgress,
        action: lifeAreaActions,
      })
        .from(userLifeAreaProgress)
        .innerJoin(lifeAreaActions, eq(userLifeAreaProgress.actionId, lifeAreaActions.id))
        .where(
          and(
            eq(userLifeAreaProgress.userId, userId),
            eq(lifeAreaActions.lifeAreaId, areaId)
          )
        )
        .orderBy(desc(userLifeAreaProgress.updatedAt));

      res.json({
        scores,
        actionsProgress: actionsProgress.map(ap => ({
          ...ap.progress,
          action: ap.action,
        })),
      });
    } catch (error) {
      console.error("Error fetching area progress:", error);
      res.status(500).json({ message: "Error fetching area progress" });
    }
  });

  // GET /api/life-areas/progress/timeline - Timeline de cambios
  app.get("/api/life-areas/progress/timeline", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200); // Max 200

      // Obtener cambios de puntuación
      const scoreChanges = await db.select()
        .from(lifeAreaIndicators)
        .where(
          and(
            eq(lifeAreaIndicators.userId, userId),
            eq(lifeAreaIndicators.indicatorType, 'score_change')
          )
        )
        .orderBy(desc(lifeAreaIndicators.recordedAt))
        .limit(limit);

      // Obtener acciones completadas
      const completedActions = await db.select({
        progress: userLifeAreaProgress,
        action: lifeAreaActions,
      })
        .from(userLifeAreaProgress)
        .innerJoin(lifeAreaActions, eq(userLifeAreaProgress.actionId, lifeAreaActions.id))
        .where(
          and(
            eq(userLifeAreaProgress.userId, userId),
            eq(userLifeAreaProgress.status, 'completed')
          )
        )
        .orderBy(desc(userLifeAreaProgress.completedAt))
        .limit(limit);

      res.json({
        scoreChanges,
        completedActions: completedActions.map(ca => ({
          ...ca.progress,
          action: ca.action,
        })),
      });
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ message: "Error fetching timeline" });
    }
  });

  // ==================== MILESTONES ENDPOINTS ====================

  // GET /api/life-areas/milestones - Milestones del usuario
  app.get("/api/life-areas/milestones", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const milestones = await db.select({
        milestone: lifeAreaMilestones,
        area: lifeAreas,
      })
        .from(lifeAreaMilestones)
        .innerJoin(lifeAreas, eq(lifeAreaMilestones.lifeAreaId, lifeAreas.id))
        .where(eq(lifeAreaMilestones.userId, userId))
        .orderBy(desc(lifeAreaMilestones.createdAt));

      res.json(milestones.map(m => ({
        ...m.milestone,
        area: m.area,
      })));
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Error fetching milestones" });
    }
  });

  // POST /api/life-areas/milestones - Crear milestone
  app.post("/api/life-areas/milestones", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { lifeAreaId, title, description, targetScore } = req.body;

      const areaId = parseInt(lifeAreaId);
      const score = parseInt(targetScore);

      if (!lifeAreaId || isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid life area ID" });
      }

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ message: "Title is required" });
      }

      if (title.length > 200) {
        return res.status(400).json({ message: "Title too long (max 200 characters)" });
      }

      if (description && typeof description === 'string' && description.length > 1000) {
        return res.status(400).json({ message: "Description too long (max 1000 characters)" });
      }

      if (!targetScore || isNaN(score) || score < 0 || score > 100) {
        return res.status(400).json({ message: "Target score must be between 0 and 100" });
      }

      const [milestone] = await db.insert(lifeAreaMilestones).values({
        userId,
        lifeAreaId: areaId,
        title: title.trim(),
        description: description ? description.trim() : null,
        targetScore: score,
      }).returning();

      res.json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Error creating milestone" });
    }
  });

  // POST /api/life-areas/milestones/:id/share - Generar link/token de compartir
  app.post("/api/life-areas/milestones/:id(\\d+)/share", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const milestoneId = parseInt(req.params.id);
      
      if (isNaN(milestoneId) || milestoneId <= 0) {
        return res.status(400).json({ message: "Invalid milestone ID" });
      }

      const userId = req.user!.userId;

      const milestone = await db.select()
        .from(lifeAreaMilestones)
        .where(
          and(
            eq(lifeAreaMilestones.id, milestoneId),
            eq(lifeAreaMilestones.userId, userId)
          )
        )
        .limit(1);

      if (milestone.length === 0) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      const shareToken = randomUUID();

      await db.update(lifeAreaMilestones)
        .set({
          shareToken,
          sharedAt: new Date().toISOString(),
        })
        .where(eq(lifeAreaMilestones.id, milestoneId));

      res.json({ shareToken, shareUrl: `/life-areas/milestones/${shareToken}` });
    } catch (error) {
      console.error("Error sharing milestone:", error);
      res.status(500).json({ message: "Error sharing milestone" });
    }
  });

  // GET /api/life-areas/milestones/:token - Ver milestone compartido (público)
  app.get("/api/life-areas/milestones/:token([A-Za-z0-9-]+)", async (req, res) => {
    try {
      const token = req.params.token;

      const milestone = await db.select({
        milestone: lifeAreaMilestones,
        area: lifeAreas,
        user: users,
      })
        .from(lifeAreaMilestones)
        .innerJoin(lifeAreas, eq(lifeAreaMilestones.lifeAreaId, lifeAreas.id))
        .innerJoin(users, eq(lifeAreaMilestones.userId, users.id))
        .where(eq(lifeAreaMilestones.shareToken, token))
        .limit(1);

      if (milestone.length === 0) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      res.json({
        ...milestone[0].milestone,
        area: milestone[0].area,
        user: {
          name: milestone[0].user.name,
          username: milestone[0].user.username,
        },
      });
    } catch (error) {
      console.error("Error fetching shared milestone:", error);
      res.status(500).json({ message: "Error fetching shared milestone" });
    }
  });

  // ==================== DASHBOARD ENDPOINTS ====================
  // NOTA: Las rutas /dashboard y /wheel están definidas al principio del archivo
  // para evitar conflictos con la ruta genérica /:areaId

  // ==================== HELPER FUNCTIONS CONTINUED ====================

  // Actualizar streak
  async function updateStreak(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    
    const streak = await db.select()
      .from(lifeAreaStreaks)
      .where(
        and(
          eq(lifeAreaStreaks.userId, userId),
          eq(lifeAreaStreaks.streakType, 'daily')
        )
      )
      .limit(1);

    if (streak.length === 0) {
      // Crear nuevo streak
      await db.insert(lifeAreaStreaks).values({
        userId,
        streakType: 'daily',
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        bonusMultiplier: 1.0,
      });
    } else if (streak[0]) {
      const currentStreak = streak[0];
      const lastDate = currentStreak.lastActivityDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = currentStreak.currentStreak || 0;
      let multiplier = 1.0;

      if (lastDate === today) {
        // Ya se registró hoy, no hacer nada
        return;
      } else if (lastDate === yesterdayStr) {
        // Continuar streak
        newStreak = (currentStreak.currentStreak || 0) + 1;
      } else {
        // Streak roto, empezar de nuevo
        newStreak = 1;
      }

      // Calcular multiplicador según días consecutivos
      if (newStreak >= 30) multiplier = 3.0;
      else if (newStreak >= 7) multiplier = 2.0;
      else if (newStreak >= 3) multiplier = 1.5;

      const longestStreak = Math.max(newStreak, currentStreak.longestStreak || 0);

      await db.update(lifeAreaStreaks)
        .set({
          currentStreak: newStreak,
          longestStreak,
          lastActivityDate: today,
          bonusMultiplier: multiplier,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(lifeAreaStreaks.id, currentStreak.id));
    }
  }

  // Actualizar maestría
  async function updateMastery(userId: number, areaId: number) {
    // Contar acciones completadas
    const completedActions = await db.select({
      count: sql<number>`COUNT(*)`,
    })
      .from(userLifeAreaProgress)
      .innerJoin(lifeAreaActions, eq(userLifeAreaProgress.actionId, lifeAreaActions.id))
      .where(
        and(
          eq(userLifeAreaProgress.userId, userId),
          eq(lifeAreaActions.lifeAreaId, areaId),
          eq(userLifeAreaProgress.status, 'completed')
        )
      );

    // Contar total de acciones del área
    const totalActions = await db.select({
      count: sql<number>`COUNT(*)`,
    })
      .from(lifeAreaActions)
      .where(eq(lifeAreaActions.lifeAreaId, areaId));

    const completed = completedActions[0]?.count || 0;
    const total = totalActions[0]?.count || 1;
    const percentage = Math.round((completed / total) * 100);

    // Determinar nivel de maestría
    let masteryLevel = 'novice';
    if (percentage >= 90) masteryLevel = 'master';
    else if (percentage >= 70) masteryLevel = 'expert';
    else if (percentage >= 50) masteryLevel = 'adept';
    else if (percentage >= 25) masteryLevel = 'apprentice';

    const mastery = await db.select()
      .from(lifeAreaMastery)
      .where(
        and(
          eq(lifeAreaMastery.userId, userId),
          eq(lifeAreaMastery.lifeAreaId, areaId)
        )
      )
      .limit(1);

    if (mastery.length > 0) {
      await db.update(lifeAreaMastery)
        .set({
          masteryPercentage: percentage,
          actionsCompleted: completed,
          totalActions: total,
          masteryLevel: masteryLevel as any,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(lifeAreaMastery.id, mastery[0].id));
    } else {
      await db.insert(lifeAreaMastery).values({
        userId,
        lifeAreaId: areaId,
        masteryPercentage: percentage,
        actionsCompleted: completed,
        totalActions: total,
        masteryLevel: masteryLevel as any,
      });
    }
  }

  // ==================== GAMIFICATION ENDPOINTS ====================

  // GET /api/life-areas/xp - XP total y por área
  app.get("/api/life-areas/xp", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const xpByArea = await db.select({
        lifeAreaId: lifeAreaXpLog.lifeAreaId,
        total: sql<number>`SUM(${lifeAreaXpLog.xpAmount})`,
      })
        .from(lifeAreaXpLog)
        .where(eq(lifeAreaXpLog.userId, userId))
        .groupBy(lifeAreaXpLog.lifeAreaId);

      const totalXP = xpByArea.reduce((sum, area) => sum + (area.total || 0), 0);

      res.json({
        total: totalXP,
        byArea: xpByArea,
      });
    } catch (error) {
      console.error("Error fetching XP:", error);
      res.status(500).json({ message: "Error fetching XP" });
    }
  });

  // GET /api/life-areas/levels - Niveles por área
  app.get("/api/life-areas/levels", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const levels = await db.select({
        level: lifeAreaLevels,
        area: lifeAreas,
      })
        .from(lifeAreaLevels)
        .innerJoin(lifeAreas, eq(lifeAreaLevels.lifeAreaId, lifeAreas.id))
        .where(eq(lifeAreaLevels.userId, userId));

      res.json(levels.map(l => ({
        ...l.level,
        area: l.area,
      })));
    } catch (error) {
      console.error("Error fetching levels:", error);
      res.status(500).json({ message: "Error fetching levels" });
    }
  });

  // GET /api/life-areas/streaks - Rachas del usuario
  app.get("/api/life-areas/streaks", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const streaks = await db.select()
        .from(lifeAreaStreaks)
        .where(eq(lifeAreaStreaks.userId, userId));

      res.json(streaks);
    } catch (error) {
      console.error("Error fetching streaks:", error);
      res.status(500).json({ message: "Error fetching streaks" });
    }
  });

  // GET /api/life-areas/badges - Badges disponibles
  app.get("/api/life-areas/badges", async (req, res) => {
    try {
      const badges = await db.select()
        .from(lifeAreaBadges)
        .orderBy(lifeAreaBadges.rarity, desc(lifeAreaBadges.xpReward));

      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Error fetching badges" });
    }
  });

  // GET /api/life-areas/badges/earned - Badges obtenidos
  app.get("/api/life-areas/badges/earned", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const badges = await db.select({
        badge: userLifeAreaBadges,
        badgeInfo: lifeAreaBadges,
      })
        .from(userLifeAreaBadges)
        .innerJoin(lifeAreaBadges, eq(userLifeAreaBadges.badgeId, lifeAreaBadges.id))
        .where(eq(userLifeAreaBadges.userId, userId))
        .orderBy(desc(userLifeAreaBadges.earnedAt));

      res.json(badges.map(b => ({
        ...b.badge,
        badgeInfo: b.badgeInfo,
      })));
    } catch (error) {
      console.error("Error fetching earned badges:", error);
      res.status(500).json({ message: "Error fetching earned badges" });
    }
  });

  // GET /api/life-areas/currency - Monedas del usuario
  app.get("/api/life-areas/currency", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const currency = await db.select()
        .from(lifeAreaCurrency)
        .where(eq(lifeAreaCurrency.userId, userId))
        .limit(1);

      res.json(currency[0] || { amount: 0, totalEarned: 0, totalSpent: 0 });
    } catch (error) {
      console.error("Error fetching currency:", error);
      res.status(500).json({ message: "Error fetching currency" });
    }
  });

  // GET /api/life-areas/notifications - Notificaciones del usuario
  app.get("/api/life-areas/notifications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const unreadOnly = req.query.unreadOnly === 'true';

      const whereConditions = unreadOnly
        ? and(
            eq(lifeAreaNotifications.userId, userId),
            eq(lifeAreaNotifications.read, false)
          )
        : eq(lifeAreaNotifications.userId, userId);

      const notifications = await db.select()
        .from(lifeAreaNotifications)
        .where(whereConditions)
        .orderBy(desc(lifeAreaNotifications.createdAt));

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  // POST /api/life-areas/notifications/:id/read - Marcar como leída
  app.post("/api/life-areas/notifications/:id(\\d+)/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId) || notificationId <= 0) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const userId = req.user!.userId;

      await db.update(lifeAreaNotifications)
        .set({ read: true })
        .where(
          and(
            eq(lifeAreaNotifications.id, notificationId),
            eq(lifeAreaNotifications.userId, userId)
          )
        );

      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Error marking notification as read" });
    }
  });

  // ==================== INDICATORS & COMMUNITY ENDPOINTS ====================

  // GET /api/life-areas/indicators - Indicadores en tiempo real del usuario
  app.get("/api/life-areas/indicators", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const areaIdParam = req.query.areaId;
      const areaId = areaIdParam ? parseInt(areaIdParam as string) : undefined;
      
      if (areaId !== undefined && (isNaN(areaId) || areaId <= 0)) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const whereConditions = areaId
        ? and(
            eq(lifeAreaIndicators.userId, userId),
            eq(lifeAreaIndicators.lifeAreaId, areaId)
          )
        : eq(lifeAreaIndicators.userId, userId);

      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500); // Max 500
      
      const indicators = await db.select()
        .from(lifeAreaIndicators)
        .where(whereConditions)
        .orderBy(desc(lifeAreaIndicators.recordedAt))
        .limit(limit);

      res.json(indicators);
    } catch (error) {
      console.error("Error fetching indicators:", error);
      res.status(500).json({ message: "Error fetching indicators" });
    }
  });

  // GET /api/life-areas/:areaId/community-stats - Estadísticas comunitarias
  app.get("/api/life-areas/:areaId(\\d+)/community-stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const period = (req.query.period as string) || 'monthly';
      
      if (!['daily', 'weekly', 'monthly'].includes(period)) {
        return res.status(400).json({ message: "Invalid period. Must be 'daily', 'weekly', or 'monthly'" });
      }

      const stats = await db.select()
        .from(lifeAreaCommunityStats)
        .where(
          and(
            eq(lifeAreaCommunityStats.lifeAreaId, areaId),
            eq(lifeAreaCommunityStats.period, period as any)
          )
        )
        .orderBy(desc(lifeAreaCommunityStats.calculatedAt))
        .limit(1);

      res.json(stats[0] || null);
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ message: "Error fetching community stats" });
    }
  });

  // GET /api/life-areas/:areaId/percentile - Percentil del usuario
  app.get("/api/life-areas/:areaId(\\d+)/percentile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      const userId = req.user!.userId;

      // Obtener puntuación del usuario
      const userScore = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.userId, userId),
            eq(lifeAreaScores.lifeAreaId, areaId),
            sql`${lifeAreaScores.subcategoryId} IS NULL`
          )
        )
        .limit(1);

      if (userScore.length === 0) {
        return res.json({ percentile: null, message: "No score found" });
      }

      // Obtener todas las puntuaciones del área
      const allScores = await db.select()
        .from(lifeAreaScores)
        .where(
          and(
            eq(lifeAreaScores.lifeAreaId, areaId),
            sql`${lifeAreaScores.subcategoryId} IS NULL`
          )
        );

      const scores = allScores
        .map(s => s.currentScore)
        .filter(s => s !== null && s !== undefined)
        .sort((a, b) => a - b);
      
      const userCurrentScore = userScore[0].currentScore;

      // Calcular percentil
      if (scores.length === 0) {
        return res.json({ percentile: null, message: "No scores available for comparison" });
      }

      if (scores.length === 1) {
        return res.json({
          percentile: 50, // Si solo hay un usuario, está en el percentil 50
          userScore: userCurrentScore,
          totalUsers: 1,
        });
      }

      const belowCount = scores.filter(s => s < userCurrentScore).length;
      const percentile = Math.round((belowCount / scores.length) * 100);

      res.json({
        percentile,
        userScore: userCurrentScore,
        totalUsers: scores.length,
      });
    } catch (error) {
      console.error("Error calculating percentile:", error);
      res.status(500).json({ message: "Error calculating percentile" });
    }
  });

  // GET /api/life-areas/trends - Tendencias y predicciones
  app.get("/api/life-areas/trends", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const areaIdParam = req.query.areaId;
      const areaId = areaIdParam ? parseInt(areaIdParam as string) : undefined;
      
      if (areaId !== undefined && (isNaN(areaId) || areaId <= 0)) {
        return res.status(400).json({ message: "Invalid area ID" });
      }

      // Obtener puntuaciones históricas (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const whereConditions = areaId
        ? and(
            eq(lifeAreaScores.userId, userId),
            sql`${lifeAreaScores.subcategoryId} IS NULL`,
            gte(lifeAreaScores.lastUpdated, thirtyDaysAgo.toISOString()),
            eq(lifeAreaScores.lifeAreaId, areaId)
          )
        : and(
            eq(lifeAreaScores.userId, userId),
            sql`${lifeAreaScores.subcategoryId} IS NULL`,
            gte(lifeAreaScores.lastUpdated, thirtyDaysAgo.toISOString())
          );

      const scores = await db.select()
        .from(lifeAreaScores)
        .where(whereConditions)
        .orderBy(lifeAreaScores.lastUpdated);

      // Calcular tendencia
      if (scores.length >= 2) {
        const firstScore = scores[0].currentScore;
        const lastScore = scores[scores.length - 1].currentScore;
        const trend = lastScore > firstScore ? 'improving' : lastScore < firstScore ? 'declining' : 'stable';
        const change = lastScore - firstScore;

        res.json({
          trend,
          change,
          scores,
          prediction: change > 0 ? 'continuing_improvement' : change < 0 ? 'needs_attention' : 'stable',
        });
      } else {
        res.json({
          trend: 'insufficient_data',
          scores,
        });
      }
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ message: "Error fetching trends" });
    }
  });
}

