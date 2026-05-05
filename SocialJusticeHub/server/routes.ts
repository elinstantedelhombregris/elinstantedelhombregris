import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parsePagination } from './lib/pagination';
import advancedAuthRoutes from './routes-advanced-auth';
import { registerInitiativeRoutes } from './routes-initiatives';
import { registerCourseRoutes } from './routes-courses';
import { registerLifeAreasRoutes } from './routes-life-areas';
import { registerCivicAssessmentRoutes } from './routes-civic-assessment';
import { registerGoalRoutes } from './routes-goals';
import { registerCoachingRoutes } from './routes-coaching';
import { registerOpenDataRoutes } from './routes-open-data';
import { registerPulseRoutes } from './routes-pulse';
import { registerAnalyticsRoutes } from './routes-analytics';
import { startMandatoCron } from './services/mandato-engine';
import { 
  insertUserSchema, 
  insertDreamSchema, 
  insertCommunityPostSchema,
  insertCommunityPostInteractionSchema,
  insertCommunityMessageSchema,
  insertCommunityPostActivitySchema,
  insertInspiringStorySchema,
  insertBlogPostSchema,
  insertPostTagSchema,
  insertPostLikeSchema,
  insertPostCommentSchema,
  insertPostBookmarkSchema,
  insertPostViewSchema,
  // New Initiative Features schemas
  insertInitiativeMemberSchema,
  insertInitiativeMilestoneSchema,
  insertInitiativeMessageSchema,
  insertInitiativeTaskSchema,
  insertActivityFeedSchema,
  insertMembershipRequestSchema,
  insertNotificationSchema,
  // Mandato Vivo
  insertUserResourceSchema,
  // Platform Feedback
  insertPlatformFeedbackSchema,
} from "@shared/schema";
import { z } from "zod";
import { 
  authenticateToken, 
  optionalAuth, 
  createAuthResponse, 
  RateLimiter,
  TokenManager,
  PasswordManager,
  AuthError,
  type AuthRequest 
} from './auth';
import { 
  registerUserSchema, 
  loginSchema, 
  changePasswordSchema,
  updateProfileSchema,
  createDreamSchema,
  createCommunityPostSchema,
  createStorySchema,
  createInspiringStorySchema,
  createResourceSchema
} from './validation';
import {
  generalRateLimit,
  authRateLimit,
  requestLogger,
  errorHandler,
  notFoundHandler,
  requestSizeLimiter,
  sanitizeInput
} from './middleware';
import { emailService } from './email';
import { nlpService } from './nlp-service';
import { blockchainService } from './blockchain-service';
import { arService } from './ar-service';
import { db } from './db';
import { ilike, count, sql as drizzleSql } from 'drizzle-orm';
import { dreams, users } from '@shared/schema';
import { MISSIONS } from '@shared/mission-registry';
import { matchDreamToMissions, type SignalScore } from '@shared/mission-signal-matcher';
import { computeMissionAlignment } from '@shared/flywheel-mappings';
import { getUserCoachingContext } from './services/coaching-service';
import {
  getOrCreateEmbedding,
  calculateCosineSimilarity,
  batchGenerateEmbeddings,
} from './services/embedding-service';

// Helper: check if a user is a member (or creator) of an initiative
async function requireMembership(postId: number, userId: number): Promise<boolean> {
  const post = await storage.getCommunityPostWithDetails(postId);
  if (post && post.userId === userId) return true;
  const members = await storage.getInitiativeMembers(postId);
  return members.some(m => m.userId === userId);
}

// Helper: notify all members of an initiative (excluding one user)
async function notifyInitiativeMembers(
  postId: number,
  excludeUserId: number,
  data: { type: string; title: string; content: string; targetId?: number | null }
) {
  const members = await storage.getInitiativeMembers(postId);
  for (const m of members) {
    if (m.userId && m.userId !== excludeUserId) {
      try {
        await storage.createNotification(m.userId, {
          ...data,
          postId,
          userId: m.userId,
          type: data.type as any,
        });
      } catch (_) { /* non-critical */ }
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply middleware
  app.use(requestLogger);
  app.use(sanitizeInput);
  app.use(requestSizeLimiter('10mb'));
  app.use('/api', generalRateLimit);

  // Health check endpoint
  app.get('/api/health', async (_req, res) => {
    try {
      const start = Date.now();
      await db.execute(drizzleSql`SELECT 1`);
      const dbLatencyMs = Date.now() - start;
      res.status(200).json({ status: 'ok', dbLatencyMs });
    } catch (error) {
      console.error('[health] DB check failed:', error);
      res.status(503).json({ status: 'degraded', reason: 'database_unreachable' });
    }
  });

  // Test database endpoint
  app.get('/api/test-db', async (req, res) => {
    try {
      const dreams = await storage.getDreams();
      res.json({ 
        status: 'ok', 
        dreamsCount: dreams.length,
        message: 'Database connection working'
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Advanced authentication routes
  app.use('/api/auth', advancedAuthRoutes);

  // Initiative routes (must come before generic community routes)
  registerInitiativeRoutes(app);

  // Course routes
  registerCourseRoutes(app);
  registerLifeAreasRoutes(app);
  registerCivicAssessmentRoutes(app);
  registerGoalRoutes(app);
  registerCoachingRoutes(app);
  registerOpenDataRoutes(app);
  registerPulseRoutes(app);
  registerAnalyticsRoutes(app);

  // Start weekly pulse cron (Fridays at 17:05 ART)
  startMandatoCron();

  // Get all dreams
  app.get("/api/dreams", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const dreams = await storage.getDreams();
      res.json(dreams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dreams" });
    }
  });

  // Create a dream
  app.post("/api/dreams", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertDreamSchema.parse({
        ...req.body,
        userId: req.user?.userId ?? req.body.userId,
      });
      const dream = await storage.createDream(validatedData);
      res.status(201).json(dream);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid dream data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create dream" });
      }
    }
  });

  // ==================== MANDATO VIVO: RESOURCES ====================

  // Get all active resources
  app.get("/api/resources-map", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const resources = await storage.getUserResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Create a resource declaration
  app.post("/api/resources-map", authenticateToken, sanitizeInput, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertUserResourceSchema.parse({
        ...req.body,
        userId: req.user?.userId,
      });
      const resource = await storage.createUserResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create resource" });
      }
    }
  });

  // ==================== MANDATO VIVO: MANDATES & MATCHMAKER ====================

  // Generate mandate for a territory
  app.post("/api/mandates/generate", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { territoryLevel, territoryName, province, city } = req.body;
      if (!territoryLevel || !territoryName) {
        return res.status(400).json({ message: "territoryLevel and territoryName are required" });
      }
      const { generateAndSaveMandate } = await import('./services/mandato-engine');
      const result = await generateAndSaveMandate(territoryLevel, territoryName, province, city);
      res.json(result);
    } catch (error) {
      console.error('Mandate generation error:', error);
      res.status(500).json({ message: "Failed to generate mandate" });
    }
  });

  // Get all mandates (optionally by level)
  app.get("/api/mandates", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const level = req.query.level as string | undefined;
      const mandates = await storage.getMandates(level);
      res.json(mandates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mandates" });
    }
  });

  // Get mandate for a specific territory
  app.get("/api/mandates/:level/:name", async (req, res) => {
    try {
      const { level, name } = req.params;
      const mandate = await storage.getMandateByTerritory(level, decodeURIComponent(name));
      if (!mandate) {
        return res.status(404).json({ message: "No mandate found for this territory" });
      }
      // Parse JSON fields (handle both string and already-parsed objects)
      const safeJsonParse = (val: any) => {
        if (!val) return null;
        if (typeof val === 'object') return val;
        try { return JSON.parse(val); } catch { return null; }
      };
      const parsed = {
        ...mandate,
        diagnosis: safeJsonParse(mandate.diagnosis),
        availableResources: safeJsonParse(mandate.availableResources),
        gaps: safeJsonParse(mandate.gaps),
        suggestedActions: safeJsonParse(mandate.suggestedActions),
      };
      res.json(parsed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mandate" });
    }
  });

  // Publish a mandate
  app.post("/api/mandates/:id/publish", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid mandate ID" });
      const updated = await storage.updateMandate(id, {
        status: 'published',
        publishedAt: new Date().toISOString(),
      });
      if (!updated) return res.status(404).json({ message: "Mandate not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to publish mandate" });
    }
  });

  // Run matchmaker scan
  app.post("/api/matchmaker/scan", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { scanAndSaveSuggestions } = await import('./matchmaker-service');
      const saved = await scanAndSaveSuggestions();
      res.json({ suggestions: saved, count: saved.length });
    } catch (error) {
      console.error('Matchmaker scan error:', error);
      res.status(500).json({ message: "Failed to scan for matches" });
    }
  });

  // Get suggestions for a territory
  app.get("/api/suggestions/:territory", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const territory = decodeURIComponent(req.params.territory);
      const suggestions = await storage.getSuggestionsByTerritory(territory);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  // Activate a suggestion (create initiative from it)
  app.post("/api/suggestions/:id/activate", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid suggestion ID" });
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Auth required" });

      // Find suggestion by ID
      const suggestion = await storage.getSuggestionById(id);
      if (!suggestion) return res.status(404).json({ message: "Suggestion not found" });
      if (suggestion.status !== 'suggested') return res.status(400).json({ message: "Suggestion already activated" });

      const rawTitle = suggestion.suggestedAction.split('\n')[0] || 'Iniciativa Comunitaria';
      const initiative = await storage.createCommunityPost({
        userId,
        title: rawTitle.length > 200 ? rawTitle.substring(0, 200) + '…' : rawTitle,
        description: suggestion.suggestedAction,
        type: 'project',
        location: suggestion.territoryName || 'Argentina',
      });

      const activated = await storage.activateSuggestion(id, userId, initiative.id);
      res.json({ suggestion: activated, initiative });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate suggestion" });
    }
  });

  // In-memory cache for graph structure (5-minute TTL)
  let graphCache: {
    data: any;
    timestamp: number;
  } | null = null;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Generate 3D positions for people (distributed in space)
  function generatePersonPosition(
    index: number,
    total: number
  ): [number, number, number] {
    // Distribute people in a spherical arrangement
    const radius = 8 + (total > 10 ? Math.min(4, Math.floor(total / 5)) : 0);
    const theta = (index / total) * Math.PI * 2; // Angle around the sphere
    const phi = Math.acos((index * 2) / total - 1); // Angle from top

    return [
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
    ];
  }

  // Generate position for concept near its person
  function generateConceptPosition(
    personPos: [number, number, number],
    conceptType: 'dream' | 'value' | 'need' | 'basta',
    indexInType: number,
    totalOfType: number
  ): [number, number, number] {
    // Type-specific offsets (spherical arrangement around person)
    const typeOffsets: Record<string, { angle: number; elevation: number }> = {
      dream: { angle: 0, elevation: Math.PI / 4 }, // Up and forward
      value: { angle: Math.PI / 2, elevation: Math.PI / 4 }, // Up and right
      need: { angle: Math.PI, elevation: Math.PI / 4 }, // Up and back
      basta: { angle: (3 * Math.PI) / 2, elevation: Math.PI / 4 }, // Up and left
    };

    const offset = typeOffsets[conceptType] || { angle: 0, elevation: 0 };
    const distance = 2.5 + (indexInType * 0.5); // Distance from person
    const spreadAngle = (indexInType / Math.max(1, totalOfType - 1)) * Math.PI * 0.5; // Spread within type group

    // Calculate position relative to person
    const relativeX =
      distance *
      Math.sin(offset.elevation) *
      Math.cos(offset.angle + spreadAngle);
    const relativeY =
      distance *
      Math.sin(offset.elevation) *
      Math.sin(offset.angle + spreadAngle);
    const relativeZ = distance * Math.cos(offset.elevation);

    return [
      personPos[0] + relativeX,
      personPos[1] + relativeY,
      personPos[2] + relativeZ,
    ];
  }

  // Group contributions by user
  function groupContributionsByUser(
    contributions: Array<{
      id: number;
      userId?: number | null;
      dream?: string | null;
      value?: string | null;
      need?: string | null;
      basta?: string | null;
      type: string;
    }>
  ): Map<number, Array<{
    id: number;
    type: 'dream' | 'value' | 'need' | 'basta';
    text: string;
    originalContrib: any;
  }>> {
    const userMap = new Map<number, Array<{
      id: number;
      type: 'dream' | 'value' | 'need' | 'basta';
      text: string;
      originalContrib: any;
    }>>();

    contributions.forEach((contrib) => {
      if (!contrib.userId) return;

      const text =
        contrib.dream || contrib.value || contrib.need || contrib.basta || '';
      if (!text.trim()) return;

      const type = (contrib.type || 'dream') as 'dream' | 'value' | 'need' | 'basta';
      
      if (!userMap.has(contrib.userId)) {
        userMap.set(contrib.userId, []);
      }

      userMap.get(contrib.userId)!.push({
        id: contrib.id,
        type,
        text: text.trim(),
        originalContrib: contrib,
      });
    });

    return userMap;
  }

  // Neural Network Graph API - People-Centered Structure
  app.get("/api/neural-network/graph", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const minSimilarity = parseFloat((req.query.minSimilarity as string) || '0.3');
      const maxConnections = parseInt((req.query.maxConnections as string) || '10');
      const useCache = req.query.cache !== 'false';

      // Check cache
      if (useCache && graphCache && Date.now() - graphCache.timestamp < CACHE_TTL) {
        return res.json(graphCache.data);
      }

      // Fetch all contributions
      const allContributions = await storage.getDreams();
      
      if (!Array.isArray(allContributions) || allContributions.length === 0) {
        return res.json({
          people: [],
          crossConnections: [],
          metadata: {
            totalPeople: 0,
            totalConcepts: 0,
            totalConnections: 0,
            avgSimilarity: 0,
            generatedAt: new Date().toISOString(),
          },
        });
      }

      // Group contributions by user
      const userContributionsMap = groupContributionsByUser(allContributions);
      
      if (userContributionsMap.size === 0) {
        return res.json({
          people: [],
          crossConnections: [],
          metadata: {
            totalPeople: 0,
            totalConcepts: 0,
            totalConnections: 0,
            avgSimilarity: 0,
            generatedAt: new Date().toISOString(),
          },
        });
      }

      // Fetch user information for all users
      const userIds = Array.from(userContributionsMap.keys());
      const userPromises = userIds.map(userId => storage.getUser(userId));
      const users = (await Promise.all(userPromises)).filter((u): u is NonNullable<typeof u> => u !== undefined);

      // Generate positions for people
      const peoplePositions = new Map<number, [number, number, number]>();
      users.forEach((user, index) => {
        peoplePositions.set(user.id, generatePersonPosition(index, users.length));
      });

      // Type colors for concepts
      const typeColors: Record<string, string> = {
        dream: '#3b82f6', // blue
        value: '#ec4899', // pink
        need: '#f59e0b', // amber
        basta: '#ef4444', // red
      };

      // Build people structure with concepts
      const people: Array<{
        id: number;
        name: string;
        username: string;
        position: [number, number, number];
        concepts: {
          dreams: Array<{
            id: number;
            text: string;
            position: [number, number, number];
            color: string;
            size: number;
          }>;
          values: Array<{
            id: number;
            text: string;
            position: [number, number, number];
            color: string;
            size: number;
          }>;
          needs: Array<{
            id: number;
            text: string;
            position: [number, number, number];
            color: string;
            size: number;
          }>;
          basta: Array<{
            id: number;
            text: string;
            position: [number, number, number];
            color: string;
            size: number;
          }>;
        };
      }> = [];

      // Collect all concepts for embedding generation
      const allConceptsForEmbedding: Array<{
        id: number;
        text: string;
        type: 'dream' | 'value' | 'need' | 'basta';
        personId: number;
      }> = [];

      // Process each user
      for (const user of users) {
        const contributions = userContributionsMap.get(user.id) || [];
        const personPos = peoplePositions.get(user.id)!;

        // Organize concepts by type
        const conceptsByType: Record<string, typeof contributions> = {
          dream: [],
          value: [],
          need: [],
          basta: [],
        };

        contributions.forEach(contrib => {
          conceptsByType[contrib.type].push(contrib);
        });

        // Generate concept nodes for each type
        const concepts = {
          dreams: conceptsByType.dream.map((contrib, idx) => {
            allConceptsForEmbedding.push({
              id: contrib.id,
              text: contrib.text,
              type: 'dream',
              personId: user.id,
            });
            return {
              id: contrib.id,
              text: contrib.text.substring(0, 200),
              position: generateConceptPosition(personPos, 'dream', idx, conceptsByType.dream.length),
              color: typeColors.dream,
              size: 1,
            };
          }),
          values: conceptsByType.value.map((contrib, idx) => {
            allConceptsForEmbedding.push({
              id: contrib.id,
              text: contrib.text,
              type: 'value',
              personId: user.id,
            });
            return {
              id: contrib.id,
              text: contrib.text.substring(0, 200),
              position: generateConceptPosition(personPos, 'value', idx, conceptsByType.value.length),
              color: typeColors.value,
              size: 1,
            };
          }),
          needs: conceptsByType.need.map((contrib, idx) => {
            allConceptsForEmbedding.push({
              id: contrib.id,
              text: contrib.text,
              type: 'need',
              personId: user.id,
            });
            return {
              id: contrib.id,
              text: contrib.text.substring(0, 200),
              position: generateConceptPosition(personPos, 'need', idx, conceptsByType.need.length),
              color: typeColors.need,
              size: 1,
            };
          }),
          basta: conceptsByType.basta.map((contrib, idx) => {
            allConceptsForEmbedding.push({
              id: contrib.id,
              text: contrib.text,
              type: 'basta',
              personId: user.id,
            });
            return {
              id: contrib.id,
              text: contrib.text.substring(0, 200),
              position: generateConceptPosition(personPos, 'basta', idx, conceptsByType.basta.length),
              color: typeColors.basta,
              size: 1,
            };
          }),
        };

        people.push({
          id: user.id,
          name: user.name || 'Usuario',
          username: user.username || `user${user.id}`,
          position: personPos,
          concepts,
        });
      }

      if (allConceptsForEmbedding.length === 0) {
        return res.json({
          people,
          crossConnections: [],
          metadata: {
            totalPeople: people.length,
            totalConcepts: 0,
            totalConnections: 0,
            avgSimilarity: 0,
            generatedAt: new Date().toISOString(),
          },
        });
      }

      // Generate embeddings for all concepts
      const embeddingMap = await batchGenerateEmbeddings(
        allConceptsForEmbedding.map((c) => ({
          id: c.id,
          text: c.text,
          type: c.type,
        })),
        20 // Batch size
      );

      // Find cross-connections between concepts from different people
      const crossConnections: Array<{
        from: { personId: number; conceptId: number; type: string };
        to: { personId: number; conceptId: number; type: string };
        strength: number;
        similarity: number;
      }> = [];

      const conceptArray = allConceptsForEmbedding;
      const conceptEmbeddings = Array.from(embeddingMap.entries());
      let totalSimilarity = 0;
      let similarityCount = 0;

      // Create a map for quick concept lookup
      const conceptMap = new Map<number, typeof allConceptsForEmbedding[0]>();
      conceptArray.forEach(c => conceptMap.set(c.id, c));

      // Find similarities between concepts from different people
      for (let i = 0; i < conceptEmbeddings.length; i++) {
        const [sourceConceptId, sourceEmbedding] = conceptEmbeddings[i];
        const sourceConcept = conceptMap.get(sourceConceptId);
        if (!sourceConcept) continue;

        const connections: Array<{
          targetConceptId: number;
          similarity: number;
        }> = [];

        for (let j = i + 1; j < conceptEmbeddings.length; j++) {
          const [targetConceptId, targetEmbedding] = conceptEmbeddings[j];
          const targetConcept = conceptMap.get(targetConceptId);
          if (!targetConcept) continue;

          // Only connect concepts from different people
          if (sourceConcept.personId === targetConcept.personId) continue;

          const similarity = calculateCosineSimilarity(sourceEmbedding, targetEmbedding);

          if (similarity >= minSimilarity) {
            connections.push({ targetConceptId, similarity });
            totalSimilarity += similarity;
            similarityCount++;
          }
        }

        // Keep only top N connections per concept
        connections
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, maxConnections)
          .forEach((conn) => {
            const targetConcept = conceptMap.get(conn.targetConceptId);
            if (targetConcept) {
              crossConnections.push({
                from: {
                  personId: sourceConcept.personId,
                  conceptId: sourceConceptId,
                  type: sourceConcept.type,
                },
                to: {
                  personId: targetConcept.personId,
                  conceptId: conn.targetConceptId,
                  type: targetConcept.type,
                },
                strength: conn.similarity,
                similarity: conn.similarity,
              });
            }
          });
      }

      const avgSimilarity =
        similarityCount > 0 ? totalSimilarity / similarityCount : 0;

      const totalConcepts = allConceptsForEmbedding.length;

      const graphData = {
        people,
        crossConnections,
        metadata: {
          totalPeople: people.length,
          totalConcepts,
          totalConnections: crossConnections.length,
          avgSimilarity,
          generatedAt: new Date().toISOString(),
        },
      };

      // Update cache
      if (useCache) {
        graphCache = {
          data: graphData,
          timestamp: Date.now(),
        };
      }

      res.json(graphData);
    } catch (error) {
      console.error('Neural network graph error:', error);
      res.status(500).json({
        error: 'Failed to generate graph',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get community posts with optional filters
  app.get("/api/community", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const type = req.query.type as string | undefined;
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      
      let posts = await storage.getCommunityPosts(type);
      
      // Apply search filter if provided
      if (search) {
        posts = posts.filter(post => 
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Enrich posts with author information and engagement counts
      const postsWithAuthors = await Promise.all(posts.map(async (post) => {
        let enriched: any = { ...post };
        if (post.userId) {
          const user = await storage.getUser(post.userId);
          if (user) {
            enriched.author = {
              id: user.id,
              name: user.name,
              username: user.username
            };
          }
        }
        try {
          enriched.likesCount = await storage.getCommunityPostLikesCount(post.id);
          enriched.viewsCount = await storage.getCommunityPostViewsCount(post.id);
        } catch (_) {
          enriched.likesCount = 0;
          enriched.viewsCount = 0;
        }
        // Add likedByMe when user is authenticated
        if (req.user?.userId) {
          try {
            enriched.likedByMe = await storage.isPostLikedByUser(post.id, req.user.userId);
          } catch (_) { enriched.likedByMe = false; }
        } else {
          enriched.likedByMe = false;
        }
        enriched.missionSlug = (post as any).missionSlug || null;
        enriched.memberCount = (post as any).memberCount || 0;
        return enriched;
      }));

      // Sort missions by number when filtering by type=mission
      if (type === 'mission') {
        postsWithAuthors.sort((a: any, b: any) => {
          const aIdx = MISSIONS.findIndex(m => m.slug === a.missionSlug);
          const bIdx = MISSIONS.findIndex(m => m.slug === b.missionSlug);
          return aIdx - bIdx;
        });
      }

      res.json(postsWithAuthors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  // Create community post
  app.post("/api/community", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const validatedData = insertCommunityPostSchema.parse({
        ...req.body,
        userId: req.user.userId  // Assign userId automatically from authenticated user
      });
      const post = await storage.createCommunityPost(validatedData);

      // Create activity feed item
      try {
        await storage.createActivityFeedItem({
          type: 'new_initiative',
          postId: post.id,
          userId: req.user!.userId,
          title: `Nueva iniciativa: ${post.title}`,
          description: post.description?.substring(0, 100) || null,
        });
      } catch (_) { /* non-critical */ }

      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create community post" });
      }
    }
  });

  // Get user's initiative memberships
  app.get("/api/community/my-memberships", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const memberships = await storage.getUserMemberships(req.user!.userId);
      res.json(memberships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch memberships" });
    }
  });

  // Get user's posts (MUST be before /:id wildcard)
  app.get("/api/community/my-posts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const posts = await storage.getUserCommunityPosts(req.user!.userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your posts" });
    }
  });

  // Get user's interactions (MUST be before /:id wildcard)
  app.get("/api/community/my-interactions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const interactions = await storage.getUserInteractions(req.user!.userId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your interactions" });
    }
  });

  // Get user's activity history (MUST be before /:id wildcard)
  app.get("/api/community/my-activity", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const activity = await storage.getUserActivityHistory(req.user!.userId);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity history" });
    }
  });

  // Get user's messages inbox (MUST be before /:id wildcard)
  app.get("/api/community/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const messages = await storage.getUserMessages(req.user!.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get unread message count (MUST be before /:id wildcard)
  app.get("/api/community/messages/unread/count", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.user!.userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread message count" });
    }
  });

  // Search posts by location (MUST be before /:id wildcard)
  app.get("/api/community/search/location", async (req, res) => {
    try {
      const {
        province,
        city,
        radius,
        userLat,
        userLng
      } = req.query;

      const radiusKm = radius ? parseInt(radius as string) : undefined;
      const latitude = userLat ? parseFloat(userLat as string) : undefined;
      const longitude = userLng ? parseFloat(userLng as string) : undefined;

      const posts = await storage.searchPostsByLocation(
        province as string,
        city as string,
        radiusKm,
        latitude,
        longitude
      );

      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to search posts by location" });
    }
  });

  // Get single community post with details
  app.get("/api/community/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getCommunityPostWithDetails(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Update community post (owner only)
  app.put("/api/community/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const validatedData = insertCommunityPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updateCommunityPost(postId, validatedData, req.user!.userId);
      
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found or you don't have permission to edit it" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update post" });
      }
    }
  });

  // Delete community post (owner only)
  app.delete("/api/community/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const success = await storage.deleteCommunityPost(postId, req.user!.userId);
      if (!success) {
        return res.status(404).json({ message: "Post not found or you don't have permission to delete it" });
      }
      
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Change post status (owner only)
  app.patch("/api/community/:id/status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      if (!['active', 'paused', 'closed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be active, paused, or closed" });
      }
      
      const updatedPost = await storage.updateCommunityPost(postId, { status }, req.user!.userId);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found or you don't have permission to edit it" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post status" });
    }
  });

  // ==================== INTERACTION ENDPOINTS ====================

  // Apply/express interest/volunteer for a post
  app.post("/api/community/:id/interact", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { type, message } = req.body;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      if (!['apply', 'interest', 'volunteer', 'save'].includes(type)) {
        return res.status(400).json({ message: "Invalid interaction type" });
      }
      
      const interactionData = {
        postId,
        userId: req.user!.userId,
        type,
        message: message || null
      };
      
      const validatedData = insertCommunityPostInteractionSchema.parse(interactionData);
      const interaction = await storage.createPostInteraction(validatedData);
      
      res.status(201).json(interaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid interaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create interaction" });
      }
    }
  });

  // Get interactions for a post (owner only)
  app.get("/api/community/:id/interactions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Verify post ownership
      const post = await storage.getCommunityPostWithDetails(postId);
      if (!post || post.userId !== req.user!.userId) {
        return res.status(403).json({ message: "You don't have permission to view these interactions" });
      }
      
      const interactions = await storage.getPostInteractions(postId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  // Update interaction status
  app.patch("/api/community/interactions/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const interactionId = parseInt(id);
      
      if (isNaN(interactionId)) {
        return res.status(400).json({ message: "Invalid interaction ID" });
      }
      
      if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const success = await storage.updateInteractionStatus(interactionId, status, req.user!.userId);
      if (!success) {
        return res.status(404).json({ message: "Interaction not found or you don't have permission to update it" });
      }
      
      res.json({ message: "Interaction status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update interaction status" });
    }
  });

  // ==================== MESSAGING ENDPOINTS ====================

  // Send message about a post
  app.post("/api/community/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { receiverId, postId, subject, content } = req.body;
      
      if (!receiverId || !subject || !content) {
        return res.status(400).json({ message: "Missing required fields: receiverId, subject, content" });
      }
      
      const messageData = {
        senderId: req.user!.userId,
        receiverId,
        postId: postId || null,
        subject,
        content
      };
      
      const validatedData = insertCommunityMessageSchema.parse(messageData);
      const message = await storage.createCommunityMessage(validatedData);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // Mark message as read
  app.patch("/api/community/messages/:id/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const messageId = parseInt(id);
      
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const success = await storage.markMessageAsRead(messageId, req.user!.userId);
      if (!success) {
        return res.status(404).json({ message: "Message not found or you don't have permission to read it" });
      }
      
      res.json({ message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // ==================== ANALYTICS ENDPOINTS ====================

  // Record post view
  app.post("/api/community/:id/view", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const activityData = {
        postId,
        userId: req.user?.userId || null,
        activityType: 'view' as const,
        metadata: JSON.stringify({ 
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          timestamp: new Date().toISOString()
        })
      };
      
      const validatedData = insertCommunityPostActivitySchema.parse(activityData);
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      const [activity, view] = await Promise.all([
        storage.recordPostActivity(validatedData),
        storage.recordCommunityPostView(postId, req.user?.userId || null, ipAddress, userAgent),
      ]);
      
      res.status(201).json({ message: "View recorded", activity, view });
    } catch (error) {
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  // Get post analytics (owner only)
  app.get("/api/community/:id/analytics", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const analytics = await storage.getPostAnalytics(postId, req.user!.userId);
      if (!analytics) {
        return res.status(404).json({ message: "Post not found or you don't have permission to view analytics" });
      }
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ==================== GEOGRAPHIC ENDPOINTS ====================

  // Get provinces
  app.get("/api/geographic/provinces", async (req, res) => {
    try {
      const provinces = await storage.getProvinces();
      res.json(provinces);
    } catch (error) {
      res.status(500).json({ message: "Failed to get provinces" });
    }
  });

  // Get cities by province
  app.get("/api/geographic/provinces/:provinceId/cities", async (req, res) => {
    try {
      const { provinceId } = req.params;
      const cities = await storage.getCitiesByProvince(parseInt(provinceId));
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cities" });
    }
  });

  // ==================== POST LIKES ENDPOINTS ====================

  // Like a post
  app.post("/api/community/:id/like", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);

      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const alreadyLiked = await storage.isPostLikedByUser(postId, req.user!.userId);
      if (alreadyLiked) {
        return res.status(409).json({ message: "Already liked" });
      }

      const like = await storage.likePost(postId, req.user!.userId);
      res.status(201).json(like);
    } catch (error) {
      if ((error as any)?.code === '23505') {
        return res.status(409).json({ message: "Already liked" });
      }
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Unlike a post
  app.delete("/api/community/:id/like", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const success = await storage.unlikePost(postId, req.user!.userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // Check if user liked a post
  app.get("/api/community/:id/like-status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const isLiked = await storage.isPostLikedByUser(postId, req.user!.userId);
      res.json({ isLiked });
    } catch (error) {
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  // Get post likes count
  app.get("/api/community/:id/likes", async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const count = await storage.getCommunityPostLikesCount(postId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get likes count" });
    }
  });

  // ==================== POST VIEWS ENDPOINTS ====================

  // Get post views count
  app.get("/api/community/:id/views", async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const count = await storage.getCommunityPostViewsCount(postId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get views count" });
    }
  });

  // ==================== NEW INITIATIVE FEATURES ENDPOINTS ====================

  // Initiative Members Endpoints
  app.get("/api/community/:postId/members", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const members = await storage.getInitiativeMembers(id);
      const membersWithUsers = await Promise.all(members.map(async (member) => {
        const user = member.userId ? await storage.getUser(member.userId) : null;
        return {
          ...member,
          user: user ? { id: user.id, name: user.name, username: user.username } : null,
        };
      }));
      res.json(membersWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch initiative members" });
    }
  });

  app.post("/api/community/:postId/join", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const { message, citizenRole } = req.body;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      // Check if post requires approval
      const post = await storage.getCommunityPostWithDetails(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if already a member
      const existingMembers = await storage.getInitiativeMembers(id);
      const alreadyMember = existingMembers.some(m => m.userId === req.user!.userId && m.status === 'active');
      if (alreadyMember) {
        return res.status(409).json({ message: "Ya sos miembro de esta iniciativa" });
      }

      if (post.requiresApproval) {
        // Check for existing pending request
        const existingRequests = await storage.getMembershipRequests(id, 'pending');
        const alreadyRequested = existingRequests.some(r => r.userId === req.user!.userId);
        if (alreadyRequested) {
          return res.status(409).json({ message: "Ya tenés una solicitud pendiente" });
        }

        // Create membership request
        const request = await storage.createMembershipRequest(id, req.user!.userId, message || "");

        // Notify creator about the request
        try {
          const user = await storage.getUser(req.user!.userId);
          await storage.createNotification(post.userId!, {
            type: 'member_joined',
            title: 'Nueva solicitud de unión',
            content: `${user?.name || 'Alguien'} quiere unirse a "${post.title}"`,
            postId: id,
            userId: post.userId!,
          });
        } catch (_) { /* non-critical */ }

        res.status(201).json({
          message: "Solicitud de unión enviada",
          request
        });
      } else {
        // Add member directly
        // For mission posts, use citizen role if provided; otherwise default to 'member'
        const validCitizenRoles = ['testigo', 'declarante', 'constructor', 'custodio', 'organizador', 'narrador'];
        const role = (post.type === 'mission' && citizenRole && validCitizenRoles.includes(citizenRole))
          ? citizenRole : 'member';
        const member = await storage.addInitiativeMember(id, req.user!.userId, role);

        // Create activity feed item
        try {
          await storage.createActivityFeedItem({
            type: 'new_member',
            postId: id,
            userId: req.user!.userId,
            title: `Nuevo miembro en: ${post.title}`,
          });
        } catch (_) { /* non-critical */ }

        // Notify creator
        try {
          const user = await storage.getUser(req.user!.userId);
          await storage.createNotification(post.userId!, {
            type: 'member_joined',
            title: 'Nuevo miembro',
            content: `${user?.name || 'Alguien'} se unió a "${post.title}"`,
            postId: id,
            userId: post.userId!,
          });
        } catch (_) { /* non-critical */ }

        res.status(201).json({
          message: "Te has unido a la iniciativa",
          member
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to join initiative" });
    }
  });

  app.post("/api/community/:postId/leave", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      // Find member by postId and userId
      const members = await storage.getInitiativeMembers(id);
      const member = members.find(m => m.userId === req.user!.userId);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      await storage.removeMember(member.id);
      res.json({ message: "Has abandonado la iniciativa" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave initiative" });
    }
  });

  // Membership Requests Endpoints
  app.get("/api/community/:postId/requests", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const { status } = req.query;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      // Check if user is creator or has permission
      const post = await storage.getCommunityPostWithDetails(id);
      if (!post || post.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const requests = await storage.getMembershipRequests(id, status as string);
      const requestsWithUsers = await Promise.all(requests.map(async (req) => {
        const user = req.userId ? await storage.getUser(req.userId) : null;
        return {
          ...req,
          user: user ? { id: user.id, name: user.name, username: user.username } : null,
        };
      }));
      res.json(requestsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch membership requests" });
    }
  });

  app.post("/api/community/:postId/requests/:requestId/approve", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, requestId } = req.params;
      const id = parseInt(postId);
      const reqId = parseInt(requestId);
      
      if (isNaN(id) || isNaN(reqId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }

      // Check if user is creator or has permission
      const post = await storage.getCommunityPostWithDetails(id);
      if (!post || post.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.approveMembershipRequest(reqId, req.user!.userId);
      res.json({ message: "Solicitud aprobada" });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve request" });
    }
  });

  app.post("/api/community/:postId/requests/:requestId/reject", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, requestId } = req.params;
      const id = parseInt(postId);
      const reqId = parseInt(requestId);
      
      if (isNaN(id) || isNaN(reqId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }

      // Check if user is creator or has permission
      const post = await storage.getCommunityPostWithDetails(id);
      if (!post || post.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.rejectMembershipRequest(reqId, req.user!.userId);
      res.json({ message: "Solicitud rechazada" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject request" });
    }
  });

  // Milestones Endpoints
  app.get("/api/community/:postId/milestones", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const milestones = await storage.getInitiativeMilestones(id);
      const milestonesWithUsers = await Promise.all(milestones.map(async (milestone) => {
        const completedByUser = milestone.completedBy ? await storage.getUser(milestone.completedBy) : null;
        return {
          ...milestone,
          completedByUser: completedByUser ? { id: completedByUser.id, name: completedByUser.name, username: completedByUser.username } : null,
        };
      }));
      res.json(milestonesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post("/api/community/:postId/milestones", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      if (!(await requireMembership(id, req.user!.userId))) {
        return res.status(403).json({ message: "Solo miembros pueden crear hitos" });
      }

      const validatedData = insertInitiativeMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(id, validatedData);
      res.status(201).json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Validation error',
          details: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create milestone" });
      }
    }
  });

  app.patch("/api/community/:postId/milestones/:milestoneId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, milestoneId } = req.params;
      const id = parseInt(milestoneId);
      const pId = parseInt(postId);

      if (isNaN(id) || isNaN(pId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      if (!(await requireMembership(pId, req.user!.userId))) {
        return res.status(403).json({ message: "Solo miembros pueden actualizar hitos" });
      }

      const updates = insertInitiativeMilestoneSchema.partial().parse(req.body);
      await storage.updateMilestone(id, updates);
      res.json({ message: "Milestone updated" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Validation error',
          details: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update milestone" });
      }
    }
  });

  app.post("/api/community/:postId/milestones/:milestoneId/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, milestoneId } = req.params;
      const id = parseInt(milestoneId);
      const pId = parseInt(postId);

      if (isNaN(id) || isNaN(pId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      if (!(await requireMembership(pId, req.user!.userId))) {
        return res.status(403).json({ message: "Solo miembros pueden completar hitos" });
      }

      await storage.completeMilestone(id, req.user!.userId);

      // Create activity feed item
      try {
        await storage.createActivityFeedItem({
          type: 'milestone_completed',
          postId: pId,
          userId: req.user!.userId,
          title: 'Hito completado',
          targetId: id,
        });
      } catch (_) { /* non-critical */ }

      // Notify all members
      try {
        const post = await storage.getCommunityPostWithDetails(pId);
        await notifyInitiativeMembers(pId, req.user!.userId, {
          type: 'milestone_completed',
          title: 'Hito completado',
          content: `Se completó un hito en "${post?.title || 'una iniciativa'}"`,
          targetId: id,
        });
      } catch (_) { /* non-critical */ }

      res.json({ message: "Milestone completed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete milestone" });
    }
  });

  // Tasks Endpoints
  app.get("/api/community/:postId/tasks", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const tasks = await storage.getInitiativeTasks(id);
      const tasksWithUsers = await Promise.all(tasks.map(async (task) => {
        const assignedUser = task.assignedTo ? await storage.getUser(task.assignedTo) : null;
        const createdByUser = task.createdBy ? await storage.getUser(task.createdBy) : null;
        return {
          ...task,
          assignedToUser: assignedUser ? { id: assignedUser.id, name: assignedUser.name, username: assignedUser.username } : null,
          createdByUser: createdByUser ? { id: createdByUser.id, name: createdByUser.name, username: createdByUser.username } : null,
        };
      }));
      res.json(tasksWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/community/:postId/tasks", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      if (!(await requireMembership(id, req.user!.userId))) {
        return res.status(403).json({ message: "Solo miembros pueden crear tareas" });
      }

      const validatedData = insertInitiativeTaskSchema.parse({
        ...req.body,
        createdBy: req.user!.userId
      });
      const task = await storage.createTask(id, validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Validation error',
          details: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.patch("/api/community/:postId/tasks/:taskId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, taskId } = req.params;
      const id = parseInt(taskId);
      const pId = parseInt(postId);

      if (isNaN(id) || isNaN(pId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      if (!(await requireMembership(pId, req.user!.userId))) {
        return res.status(403).json({ message: "Solo miembros pueden actualizar tareas" });
      }

      const updates = insertInitiativeTaskSchema.partial().parse(req.body);
      await storage.updateTask(id, updates);
      res.json({ message: "Task updated" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Validation error',
          details: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  app.post("/api/community/:postId/tasks/:taskId/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, taskId } = req.params;
      const id = parseInt(taskId);
      const pId = parseInt(postId);

      if (isNaN(id) || isNaN(pId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      if (!(await requireMembership(pId, req.user!.userId))) {
        return res.status(403).json({ message: "Solo miembros pueden completar tareas" });
      }

      await storage.completeTask(id);

      // Create activity feed item
      try {
        const postId = parseInt(req.params.postId);
        await storage.createActivityFeedItem({
          type: 'task_completed',
          postId: isNaN(postId) ? null : postId,
          userId: req.user!.userId,
          title: 'Tarea completada',
          targetId: id,
        });
      } catch (_) { /* non-critical */ }

      // Notify initiative members
      try {
        const post = await storage.getCommunityPostWithDetails(pId);
        await notifyInitiativeMembers(pId, req.user!.userId, {
          type: 'task_completed',
          title: 'Tarea completada',
          content: `Se completó una tarea en "${post?.title || 'una iniciativa'}"`,
          targetId: id,
        });
      } catch (_notif) { /* non-critical */ }

      res.json({ message: "Task completed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Delete Task
  app.delete("/api/community/:postId/tasks/:taskId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, taskId } = req.params;
      const pId = parseInt(postId);
      const tId = parseInt(taskId);

      if (isNaN(pId) || isNaN(tId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      if (!(await requireMembership(pId, req.user!.userId))) {
        return res.status(403).json({ message: "Solo miembros pueden eliminar tareas" });
      }

      await storage.deleteTask(tId);
      res.json({ message: "Tarea eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Delete Milestone
  app.delete("/api/community/:postId/milestones/:milestoneId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, milestoneId } = req.params;
      const pId = parseInt(postId);
      const mId = parseInt(milestoneId);

      if (isNaN(pId) || isNaN(mId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      if (!(await requireMembership(pId, req.user!.userId))) {
        return res.status(403).json({ message: "Solo miembros pueden eliminar hitos" });
      }

      await storage.deleteMilestone(mId);
      res.json({ message: "Hito eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });

  // Update Member Role (creator only)
  app.patch("/api/community/:postId/members/:memberId/role", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, memberId } = req.params;
      const { role } = req.body;
      const pId = parseInt(postId);
      const mId = parseInt(memberId);

      if (isNaN(pId) || isNaN(mId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      // Only creator can change roles
      const post = await storage.getCommunityPostWithDetails(pId);
      if (!post || post.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Solo el creador puede cambiar roles" });
      }

      const validRoles = ['member', 'co-organizer', 'active_member'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      const defaultPermissions: Record<string, object> = {
        'co-organizer': { canEdit: true, canInvite: true, canApprove: true, canCreateMilestone: true, canCreateTask: true, canAssignTask: true },
        'active_member': { canCreateMilestone: true, canCreateTask: true },
        'member': {},
      };

      await storage.updateMemberRole(mId, role, defaultPermissions[role] || {});
      res.json({ message: "Rol actualizado" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Remove Member (creator only)
  app.delete("/api/community/:postId/members/:memberId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId, memberId } = req.params;
      const pId = parseInt(postId);
      const mId = parseInt(memberId);

      if (isNaN(pId) || isNaN(mId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      // Only creator can remove members
      const post = await storage.getCommunityPostWithDetails(pId);
      if (!post || post.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Solo el creador puede remover miembros" });
      }

      await storage.removeMember(mId);
      res.json({ message: "Miembro removido" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove member" });
    }
  });

  // Messages/Chat Endpoints
  app.get("/api/community/:postId/messages", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const { limit: limitNum, offset: offsetNum } = parsePagination(req, { defaultLimit: 50 });

      const messages = await storage.getInitiativeMessages(id, limitNum, offsetNum);
      const messagesWithUsers = await Promise.all(messages.map(async (msg) => {
        const user = msg.userId ? await storage.getUser(msg.userId) : null;
        return {
          ...msg,
          user: user ? { id: user.id, name: user.name, username: user.username } : null,
        };
      }));
      res.json(messagesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/community/:postId/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const { content, type } = req.body;
      const id = parseInt(postId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      // Verify membership
      if (!(await requireMembership(id, req.user!.userId))) {
        return res.status(403).json({ message: "Solo miembros pueden enviar mensajes" });
      }

      const message = await storage.sendMessage(id, req.user!.userId, content, type);
      const user = await storage.getUser(req.user!.userId);

      // Notify other members of new message
      try {
        const post = await storage.getCommunityPostWithDetails(id);
        await notifyInitiativeMembers(id, req.user!.userId, {
          type: 'message',
          title: 'Nuevo mensaje',
          content: `${user?.name || 'Alguien'} envió un mensaje en "${post?.title || 'una iniciativa'}"`,
        });
      } catch (_) { /* non-critical */ }

      res.status(201).json({
        ...message,
        user: user ? { id: user.id, name: user.name, username: user.username } : null,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Activity Feed Endpoints
  app.get("/api/activity-feed", async (req, res) => {
    try {
      const { type } = req.query;
      const { limit: limitNum, offset: offsetNum } = parsePagination(req);

      const feed = await storage.getActivityFeed({
        type: type as string,
        limit: limitNum,
        offset: offsetNum
      });
      const feedWithUsers = await Promise.all(feed.map(async (item) => {
        const user = item.userId ? await storage.getUser(item.userId) : null;
        return {
          ...item,
          user: user ? { id: user.id, name: user.name, username: user.username } : null,
        };
      }));
      res.json(feedWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  // Notifications Endpoints
  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { unreadOnly } = req.query;
      const notifications = await storage.getUserNotifications(
        req.user!.userId, 
        unreadOnly === 'true'
      );
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:notificationId/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { notificationId } = req.params;
      const id = parseInt(notificationId);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user!.userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get("/api/notifications/unread-count", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.userId, true);
      res.json({ count: notifications.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Get all resources
  app.get("/api/resources", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const resources = category 
        ? await storage.getResourcesByCategory(category)
        : await storage.getResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Register user - ENTERPRISE LEVEL
  app.post("/api/register", authRateLimit, async (req, res) => {
    try {
      // Anti-bot: Honeypot check — if the hidden field has content, it's a bot
      if (req.body._hp) {
        // Return fake success to not reveal the trap
        return res.status(201).json({
          message: 'Usuario registrado exitosamente',
          user: { id: 0, username: '', email: '', name: '' },
          tokens: { accessToken: '', refreshToken: '' }
        });
      }

      // Anti-bot: Time-trap — form submitted too fast (< 3 seconds = bot)
      const formLoadedAt = Number(req.body._t);
      if (formLoadedAt && (Date.now() - formLoadedAt) < 3000) {
        return res.status(429).json({
          error: 'Too fast',
          message: 'El formulario fue enviado demasiado rápido. Intentá de nuevo.',
          code: 'SUBMISSION_TOO_FAST'
        });
      }

      // Strip anti-bot fields before validation
      const { _hp, _t, ...registrationData } = req.body;

      // Validate input with enhanced schema
      const validatedData = registerUserSchema.parse(registrationData);

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(409).json({ 
          error: 'Username already exists',
          message: 'El nombre de usuario ya está en uso',
          code: 'USERNAME_EXISTS'
        });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(409).json({ 
          error: 'Email already exists',
          message: 'El email ya está registrado',
          code: 'EMAIL_EXISTS'
        });
      }
      
      // Create user with hashed password
      const user = await storage.createUserWithHash({
        name: validatedData.name,
        email: validatedData.email,
        username: validatedData.username,
        password: validatedData.password,
        location: validatedData.location || null
      });
      
      // Send verification email (fire-and-forget — don't block registration)
      const crypto = await import('crypto');
      const verifyToken = crypto.randomBytes(32).toString('hex');
      const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      storage.setEmailVerificationToken(user.id, verifyToken, verifyExpires)
        .then(() => emailService.sendVerificationEmail(user.email, verifyToken, user.name))
        .catch(err => console.error('Auto-send verification email failed:', err));

      // Create auth response with tokens
      const authResponse = createAuthResponse({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        avatarUrl: user.avatarUrl,
        bio: user.bio
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        ...authResponse
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Validation error',
          message: 'Datos de entrada inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        console.error('Registration error:', error);
        res.status(500).json({ 
          error: 'Internal server error',
          message: 'Error interno del servidor'
        });
      }
    }
  });

  // Login user - ENTERPRISE LEVEL
  app.post("/api/login", authRateLimit, async (req, res) => {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);
      
      // Rate limiting per IP + username
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitKey = `${clientIP}:${validatedData.username}`;
      
      if (!RateLimiter.checkLimit(rateLimitKey)) {
        const remainingTime = RateLimiter.getRemainingTime(rateLimitKey);
        return res.status(429).json({
          error: 'Too many login attempts',
          message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.',
          retryAfter: Math.ceil(remainingTime / 1000)
        });
      }
      
      // Check if user is locked
      const isLocked = await storage.isUserLocked(validatedData.username);
      if (isLocked) {
        return res.status(423).json({
          error: 'Account locked',
          message: 'Cuenta temporalmente bloqueada por múltiples intentos fallidos',
          code: 'ACCOUNT_LOCKED'
        });
      }
      
      // Verify credentials
      const user = await storage.verifyUserPassword(validatedData.username, validatedData.password);
      
      if (!user) {
        // Increment failed attempts
        await storage.incrementLoginAttempts(validatedData.username);
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Reset failed attempts and update last login
      await storage.resetLoginAttempts(validatedData.username);
      await storage.updateLastLogin(user.id);
      RateLimiter.resetLimit(rateLimitKey);
      
      // Create auth response with tokens
      const authResponse = createAuthResponse({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        avatarUrl: user.avatarUrl,
        bio: user.bio
      });

      res.json({
        message: 'Inicio de sesión exitoso',
        ...authResponse
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Datos de entrada inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        console.error('Login error:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: 'Error interno del servidor'
        });
      }
    }
  });

  // Protected routes - require authentication
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        lastLogin: user.lastLogin,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
        dataShareOptOut: user.dataShareOptOut ?? false,
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error interno del servidor'
      });
    }
  });

  // Update user profile
  app.put("/api/auth/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      
      // Check if email is being changed and if it's already taken
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== req.user!.userId) {
          return res.status(409).json({
            error: 'Email already exists',
            message: 'El email ya está en uso por otro usuario',
            code: 'EMAIL_EXISTS'
          });
        }
      }
      
      const updatedUser = await storage.updateUser(req.user!.userId, validatedData);
      
      res.json({
        message: 'Perfil actualizado exitosamente',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          location: updatedUser.location,
          avatarUrl: updatedUser.avatarUrl,
          bio: updatedUser.bio,
          emailVerified: updatedUser.emailVerified,
          onboardingCompleted: updatedUser.onboardingCompleted,
          createdAt: updatedUser.createdAt,
          dataShareOptOut: updatedUser.dataShareOptOut ?? false,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Datos de entrada inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        console.error('Update profile error:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: 'Error interno del servidor'
        });
      }
    }
  });

  // Upload avatar image (base64)
  app.post("/api/auth/avatar", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { image } = req.body;

      if (!image || typeof image !== 'string') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Se requiere una imagen válida'
        });
      }

      // Validate base64 data URI format
      const dataUriMatch = image.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/);
      if (!dataUriMatch) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Formato de imagen inválido. Solo se aceptan PNG, JPEG, WebP o GIF.'
        });
      }

      // Check size (roughly: base64 is ~33% larger than binary, limit to ~2MB image = ~2.7MB base64)
      const base64Data = image.split(',')[1];
      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (sizeInBytes > maxSize) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'La imagen es demasiado grande. El tamaño máximo es 2MB.'
        });
      }

      const updatedUser = await storage.updateUser(req.user!.userId, { avatarUrl: image } as any);

      res.json({
        message: 'Avatar actualizado exitosamente',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          location: updatedUser.location,
          avatarUrl: updatedUser.avatarUrl,
          bio: updatedUser.bio,
          emailVerified: updatedUser.emailVerified,
          onboardingCompleted: updatedUser.onboardingCompleted,
          createdAt: updatedUser.createdAt
        }
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error al subir el avatar'
      });
    }
  });

  // Remove avatar
  app.delete("/api/auth/avatar", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user!.userId, { avatarUrl: null } as any);

      res.json({
        message: 'Avatar eliminado exitosamente',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          location: updatedUser.location,
          avatarUrl: updatedUser.avatarUrl,
          bio: updatedUser.bio,
          emailVerified: updatedUser.emailVerified,
          onboardingCompleted: updatedUser.onboardingCompleted,
          createdAt: updatedUser.createdAt
        }
      });
    } catch (error) {
      console.error('Delete avatar error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error al eliminar el avatar'
      });
    }
  });

  // Complete onboarding
  app.post("/api/auth/complete-onboarding", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user!.userId, { onboardingCompleted: true } as any);
      res.json({
        message: 'Onboarding completado',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          location: updatedUser.location,
          emailVerified: updatedUser.emailVerified,
          onboardingCompleted: updatedUser.onboardingCompleted,
          createdAt: updatedUser.createdAt
        }
      });
    } catch (error) {
      console.error('Complete onboarding error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error interno del servidor'
      });
    }
  });

  // Save user interests
  app.post("/api/user/interests", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { interests } = req.body;
      if (!Array.isArray(interests)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'interests debe ser un array'
        });
      }

      // Upsert into userProfiles
      const existing = await storage.getUserProfile(req.user!.userId);
      if (existing) {
        await storage.updateUserProfile(req.user!.userId, { interests: JSON.stringify(interests) });
      } else {
        await storage.createUserProfile({
          userId: req.user!.userId,
          interests: JSON.stringify(interests),
          values: null,
          personalityTraits: null,
        });
      }

      res.json({ message: 'Intereses guardados', interests });
    } catch (error) {
      console.error('Save interests error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error interno del servidor'
      });
    }
  });

  // Change password
  app.put("/api/auth/change-password", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      
      // Get current user
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await storage.verifyUserPassword(user.username, validatedData.currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: 'Invalid current password',
          message: 'La contraseña actual es incorrecta',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }
      
      // Update password
      const hashedNewPassword = await PasswordManager.hash(validatedData.newPassword);
      await storage.updateUser(req.user!.userId, { password: hashedNewPassword });
      
      res.json({
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Datos de entrada inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        console.error('Change password error:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: 'Error interno del servidor'
        });
      }
    }
  });

  // Refresh token
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({
          error: 'Refresh token required',
          message: 'Token de actualización requerido',
          code: 'MISSING_REFRESH_TOKEN'
        });
      }
      
      const payload = TokenManager.verifyToken(refreshToken);
      if (!payload || payload.type !== 'refresh') {
        return res.status(403).json({
          error: 'Invalid refresh token',
          message: 'Token de actualización inválido',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }
      
      // Get user and generate new tokens
      const user = await storage.getUser(payload.userId);
      if (!user || !user.isActive) {
        return res.status(404).json({
          error: 'User not found or inactive',
          message: 'Usuario no encontrado o inactivo',
          code: 'USER_NOT_FOUND'
        });
      }
      
      const authResponse = createAuthResponse({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        avatarUrl: user.avatarUrl,
        bio: user.bio
      });

      res.json({
        message: 'Tokens actualizados exitosamente',
        ...authResponse
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error interno del servidor'
      });
    }
  });

  // Logout (client-side token removal, but we can track it)
  app.post("/api/auth/logout", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // In a more sophisticated system, you might want to blacklist the token
      // For now, we'll just return success and let the client remove the token
      res.json({
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error interno del servidor'
      });
    }
  });

  // Get community statistics
  app.get("/api/stats", async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      const communityPosts = await storage.getCommunityPosts();
      const dreams = await storage.getDreams();
      
      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Count new users in the last week
      const newUsersThisWeek = users.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        return userDate >= oneWeekAgo;
      }).length;
      
      // Count active users (users with at least one post or dream)
      const activeUsers = users.filter(user => {
        const hasPosts = communityPosts.some(post => post.userId === user.id);
        const hasDreams = dreams.some(dream => dream.userId === user.id);
        return hasPosts || hasDreams;
      }).length;
      
      // Count posts by type
      const jobPosts = communityPosts.filter(post => post.type === 'job').length;
      const projectPosts = communityPosts.filter(post => post.type === 'project').length;
      const resourcePosts = communityPosts.filter(post => post.type === 'resource').length;
      
      // Total members
      const totalMembers = users.length;
      
      res.json({
        totalMembers,
        activeMembers: activeUsers > 0 ? activeUsers : totalMembers,
        newMembersThisWeek: newUsersThisWeek,
        jobPosts,
        projectPosts,
        resourcePosts,
        totalPosts: communityPosts.length,
        totalDreams: dreams.length
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // NLP Analysis Routes - Procesamiento de Lenguaje Natural Avanzado
  app.post("/api/nlp/analyze", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Texto requerido para análisis',
          code: 'INVALID_TEXT'
        });
      }

      const analysis = await nlpService.analyzeText(text);

      res.json({
        message: 'Análisis completado exitosamente',
        analysis
      });
    } catch (error) {
      console.error('NLP analysis error:', error);
      res.status(500).json({
        error: 'Analysis failed',
        message: 'Error interno durante el análisis',
        code: 'ANALYSIS_ERROR'
      });
    }
  });

  // Psicografías de Parravicini - Análisis especializado
  app.post("/api/nlp/analyze-psychography", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Texto de psicografía requerido',
          code: 'INVALID_PSYCHOGRAPHY'
        });
      }

      const analysis = await nlpService.analyzePsychography(text);

      res.json({
        message: 'Análisis de psicografía completado',
        analysis
      });
    } catch (error) {
      console.error('Psychography analysis error:', error);
      res.status(500).json({
        error: 'Analysis failed',
        message: 'Error interno durante el análisis de psicografía',
        code: 'PSYCHOGRAPHY_ANALYSIS_ERROR'
      });
    }
  });

  // Encontrar textos similares - Útil para conectar psicografías relacionadas
  app.post("/api/nlp/find-similar", async (req, res) => {
    try {
      const { text, textCollection } = req.body;

      if (!text || !Array.isArray(textCollection) || textCollection.length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Texto y colección de textos requeridos',
          code: 'INVALID_SIMILARITY_INPUT'
        });
      }

      const similarTexts = await nlpService.findSimilarTexts(text, textCollection);

      res.json({
        message: 'Búsqueda de textos similares completada',
        similarTexts
      });
    } catch (error) {
      console.error('Similar texts search error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: 'Error interno durante la búsqueda',
        code: 'SIMILARITY_SEARCH_ERROR'
      });
    }
  });

  // Análisis de sentimientos masivo - Para analizar grandes cantidades de texto
  app.post("/api/nlp/batch-sentiment", async (req, res) => {
    try {
      const { texts } = req.body;

      if (!Array.isArray(texts) || texts.length === 0) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Array de textos requerido',
          code: 'INVALID_BATCH_INPUT'
        });
      }

      const results = await Promise.all(
        texts.map(async (text: string) => {
          try {
            const analysis = await nlpService.analyzeText(text);
            return {
              text: text.substring(0, 100) + '...',
              sentiment: analysis.sentiment,
              emotions: analysis.emotions.slice(0, 3),
              success: true
            };
          } catch (error) {
            return {
              text: text.substring(0, 100) + '...',
              error: 'Análisis fallido',
              success: false
            };
          }
        })
      );

      const successCount = results.filter(r => r.success).length;

      res.json({
        message: `Análisis completado: ${successCount}/${texts.length} textos procesados`,
        results
      });
    } catch (error) {
      console.error('Batch sentiment analysis error:', error);
      res.status(500).json({
        error: 'Batch analysis failed',
        message: 'Error interno durante el análisis masivo',
        code: 'BATCH_ANALYSIS_ERROR'
      });
    }
  });

  // Blockchain Routes - Votaciones Transparentes y Certificación de Impacto
  app.post("/api/blockchain/create-proposal", async (req, res) => {
    try {
      const { title, description, creator, startTime, endTime } = req.body;

      if (!title || !description || !creator) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Título, descripción y creador requeridos',
          code: 'INVALID_PROPOSAL_DATA'
        });
      }

      if (!blockchainService.isValidAddress(creator)) {
        return res.status(400).json({
          error: 'Invalid address',
          message: 'Dirección de creador inválida',
          code: 'INVALID_CREATOR_ADDRESS'
        });
      }

      const proposalId = await blockchainService.createVotingProposal({
        title,
        description,
        creator,
        startTime: startTime ? new Date(startTime).getTime() : Date.now(),
        endTime: endTime ? new Date(endTime).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      res.json({
        message: 'Propuesta de votación creada exitosamente',
        proposalId
      });
    } catch (error) {
      console.error('Blockchain proposal creation error:', error);
      res.status(500).json({
        error: 'Proposal creation failed',
        message: 'Error interno creando propuesta de votación',
        code: 'PROPOSAL_CREATION_ERROR'
      });
    }
  });

  // Votar en propuesta blockchain
  app.post("/api/blockchain/vote", async (req, res) => {
    try {
      const { proposalId, voterAddress, vote } = req.body;

      if (!proposalId || !voterAddress || !vote) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'ID de propuesta, dirección de votante y voto requeridos',
          code: 'INVALID_VOTE_DATA'
        });
      }

      if (!['yes', 'no', 'abstain'].includes(vote)) {
        return res.status(400).json({
          error: 'Invalid vote',
          message: 'Voto debe ser "yes", "no" o "abstain"',
          code: 'INVALID_VOTE_VALUE'
        });
      }

      if (!blockchainService.isValidAddress(voterAddress)) {
        return res.status(400).json({
          error: 'Invalid address',
          message: 'Dirección de votante inválida',
          code: 'INVALID_VOTER_ADDRESS'
        });
      }

      const txHash = await blockchainService.voteOnProposal(proposalId, voterAddress, vote as 'yes' | 'no' | 'abstain');

      res.json({
        message: 'Voto registrado exitosamente en blockchain',
        transactionHash: txHash
      });
    } catch (error) {
      console.error('Blockchain voting error:', error);
      res.status(500).json({
        error: 'Voting failed',
        message: 'Error interno registrando voto',
        code: 'VOTING_ERROR'
      });
    }
  });

  // Obtener información de propuesta blockchain
  app.get("/api/blockchain/proposal/:proposalId", async (req, res) => {
    try {
      const { proposalId } = req.params;

      if (!proposalId) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'ID de propuesta requerido',
          code: 'MISSING_PROPOSAL_ID'
        });
      }

      const proposal = await blockchainService.getProposal(proposalId);

      if (!proposal) {
        return res.status(404).json({
          error: 'Proposal not found',
          message: 'Propuesta no encontrada',
          code: 'PROPOSAL_NOT_FOUND'
        });
      }

      res.json({
        message: 'Información de propuesta obtenida exitosamente',
        proposal
      });
    } catch (error) {
      console.error('Get proposal error:', error);
      res.status(500).json({
        error: 'Get proposal failed',
        message: 'Error interno obteniendo propuesta',
        code: 'GET_PROPOSAL_ERROR'
      });
    }
  });

  // Obtener estadísticas de votación blockchain
  app.get("/api/blockchain/proposal/:proposalId/stats", async (req, res) => {
    try {
      const { proposalId } = req.params;

      if (!proposalId) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'ID de propuesta requerido',
          code: 'MISSING_PROPOSAL_ID'
        });
      }

      const stats = await blockchainService.getVotingStats(proposalId);

      if (!stats) {
        return res.status(404).json({
          error: 'Stats not found',
          message: 'Estadísticas de votación no encontradas',
          code: 'STATS_NOT_FOUND'
        });
      }

      res.json({
        message: 'Estadísticas de votación obtenidas exitosamente',
        stats
      });
    } catch (error) {
      console.error('Get voting stats error:', error);
      res.status(500).json({
        error: 'Get stats failed',
        message: 'Error interno obteniendo estadísticas',
        code: 'GET_STATS_ERROR'
      });
    }
  });

  // Certificar impacto social en blockchain
  app.post("/api/blockchain/certify-impact", async (req, res) => {
    try {
      const { projectId, beneficiary, impactMetrics, certifier } = req.body;

      if (!projectId || !beneficiary || !impactMetrics || !certifier) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Todos los campos son requeridos para certificar impacto',
          code: 'INVALID_CERTIFICATE_DATA'
        });
      }

      if (!blockchainService.isValidAddress(beneficiary) || !blockchainService.isValidAddress(certifier)) {
        return res.status(400).json({
          error: 'Invalid address',
          message: 'Direcciones de beneficiario y certificador inválidas',
          code: 'INVALID_ADDRESSES'
        });
      }

      const txHash = await blockchainService.certifySocialImpact({
        projectId,
        beneficiary,
        impactMetrics,
        certifier
      });

      res.json({
        message: 'Impacto social certificado exitosamente en blockchain',
        transactionHash: txHash
      });
    } catch (error) {
      console.error('Blockchain impact certification error:', error);
      res.status(500).json({
        error: 'Certification failed',
        message: 'Error interno certificando impacto',
        code: 'CERTIFICATION_ERROR'
      });
    }
  });

  // Verificar certificado de impacto social
  app.get("/api/blockchain/verify-certificate/:certificateId", async (req, res) => {
    try {
      const { certificateId } = req.params;

      if (!certificateId) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'ID de certificado requerido',
          code: 'MISSING_CERTIFICATE_ID'
        });
      }

      const certificate = await blockchainService.verifySocialImpact(certificateId);

      if (!certificate) {
        return res.status(404).json({
          error: 'Certificate not found',
          message: 'Certificado no encontrado',
          code: 'CERTIFICATE_NOT_FOUND'
        });
      }

      res.json({
        message: 'Certificado verificado exitosamente',
        certificate,
        verified: true
      });
    } catch (error) {
      console.error('Certificate verification error:', error);
      res.status(500).json({
        error: 'Verification failed',
        message: 'Error interno verificando certificado',
        code: 'VERIFICATION_ERROR'
      });
    }
  });

  // Registrar donación en blockchain
  app.post("/api/blockchain/record-donation", async (req, res) => {
    try {
      const { donorAddress, recipientAddress, amount, projectId, message } = req.body;

      if (!donorAddress || !recipientAddress || !amount || !projectId) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Todos los campos son requeridos para registrar donación',
          code: 'INVALID_DONATION_DATA'
        });
      }

      if (!blockchainService.isValidAddress(donorAddress) || !blockchainService.isValidAddress(recipientAddress)) {
        return res.status(400).json({
          error: 'Invalid address',
          message: 'Direcciones de donante y recipiente inválidas',
          code: 'INVALID_DONATION_ADDRESSES'
        });
      }

      const txHash = await blockchainService.recordDonation({
        donorAddress,
        recipientAddress,
        amount,
        projectId,
        message
      });

      res.json({
        message: 'Donación registrada exitosamente en blockchain',
        transactionHash: txHash
      });
    } catch (error) {
      console.error('Blockchain donation record error:', error);
      res.status(500).json({
        error: 'Donation record failed',
        message: 'Error interno registrando donación',
        code: 'DONATION_RECORD_ERROR'
      });
    }
  });

  // Obtener información de la red blockchain
  app.get("/api/blockchain/network-info", async (req, res) => {
    try {
      const networkInfo = await blockchainService.getNetworkInfo();

      res.json({
        message: 'Información de red blockchain obtenida exitosamente',
        networkInfo
      });
    } catch (error) {
      console.error('Get network info error:', error);
      res.status(500).json({
        error: 'Get network info failed',
        message: 'Error interno obteniendo información de red',
        code: 'NETWORK_INFO_ERROR'
      });
    }
  });

  // Obtener balance de dirección blockchain
  app.get("/api/blockchain/balance/:address", async (req, res) => {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Dirección requerida',
          code: 'MISSING_ADDRESS'
        });
      }

      if (!blockchainService.isValidAddress(address)) {
        return res.status(400).json({
          error: 'Invalid address',
          message: 'Dirección blockchain inválida',
          code: 'INVALID_ADDRESS'
        });
      }

      const balance = await blockchainService.getBalance(address);

      res.json({
        message: 'Balance obtenido exitosamente',
        address,
        balance,
        symbol: 'MATIC' // Para Polygon
      });
    } catch (error) {
      console.error('Get balance error:', error);
      res.status(500).json({
        error: 'Get balance failed',
        message: 'Error interno obteniendo balance',
        code: 'BALANCE_ERROR'
      });
    }
  });

  // AR (Realidad Aumentada) Routes - Visualización de Proyectos en Ubicaciones Reales
  app.post("/api/ar/create-project", async (req, res) => {
    try {
      const {
        title,
        description,
        latitude,
        longitude,
        address,
        arModel,
        impact,
        status,
        createdBy
      } = req.body;

      if (!title || !description || !latitude || !longitude || !arModel || !createdBy) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Título, descripción, coordenadas, modelo AR y creador requeridos',
          code: 'INVALID_AR_PROJECT_DATA'
        });
      }

      if (!arService.isValidCoordinates(latitude, longitude)) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Coordenadas GPS inválidas',
          code: 'INVALID_COORDINATES'
        });
      }

      const projectId = await arService.createARProject({
        title,
        description,
        location: { latitude, longitude, address: address || '' },
        arModel,
        impact,
        status: status || 'planning',
        createdBy
      });

      res.json({
        message: 'Proyecto AR creado exitosamente',
        projectId
      });
    } catch (error) {
      console.error('AR project creation error:', error);
      res.status(500).json({
        error: 'AR project creation failed',
        message: 'Error interno creando proyecto AR',
        code: 'AR_PROJECT_CREATION_ERROR'
      });
    }
  });

  // Obtener proyectos AR cercanos a una ubicación
  app.get("/api/ar/projects/nearby", async (req, res) => {
    try {
      const { latitude, longitude, radius = 5 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Latitud y longitud requeridas',
          code: 'MISSING_COORDINATES'
        });
      }

      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const radiusKm = parseFloat(radius as string);

      if (!arService.isValidCoordinates(lat, lon)) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Coordenadas GPS inválidas',
          code: 'INVALID_NEARBY_COORDINATES'
        });
      }

      const projects = await arService.getARProjectsByLocation(lat, lon, radiusKm);

      res.json({
        message: 'Proyectos AR cercanos obtenidos exitosamente',
        projects,
        count: projects.length,
        location: { latitude: lat, longitude: lon },
        radius: radiusKm
      });
    } catch (error) {
      console.error('Get nearby AR projects error:', error);
      res.status(500).json({
        error: 'Get nearby projects failed',
        message: 'Error interno obteniendo proyectos AR cercanos',
        code: 'GET_NEARBY_PROJECTS_ERROR'
      });
    }
  });

  // Generar escena AR para una ubicación específica
  app.post("/api/ar/generate-scene", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Latitud y longitud requeridas',
          code: 'MISSING_SCENE_COORDINATES'
        });
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (!arService.isValidCoordinates(lat, lon)) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Coordenadas GPS inválidas',
          code: 'INVALID_SCENE_COORDINATES'
        });
      }

      const scene = await arService.generateARScene(lat, lon);

      res.json({
        message: 'Escena AR generada exitosamente',
        scene
      });
    } catch (error) {
      console.error('AR scene generation error:', error);
      res.status(500).json({
        error: 'AR scene generation failed',
        message: 'Error interno generando escena AR',
        code: 'AR_SCENE_GENERATION_ERROR'
      });
    }
  });

  // Obtener escena AR por ID
  app.get("/api/ar/scene/:sceneId", async (req, res) => {
    try {
      const { sceneId } = req.params;

      if (!sceneId) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'ID de escena requerido',
          code: 'MISSING_SCENE_ID'
        });
      }

      const scene = arService.getARScene(sceneId);

      if (!scene) {
        return res.status(404).json({
          error: 'Scene not found',
          message: 'Escena AR no encontrada',
          code: 'AR_SCENE_NOT_FOUND'
        });
      }

      res.json({
        message: 'Escena AR obtenida exitosamente',
        scene
      });
    } catch (error) {
      console.error('Get AR scene error:', error);
      res.status(500).json({
        error: 'Get AR scene failed',
        message: 'Error interno obteniendo escena AR',
        code: 'GET_AR_SCENE_ERROR'
      });
    }
  });

  // Generar código HTML AR.js para una escena
  app.get("/api/ar/scene/:sceneId/code", async (req, res) => {
    try {
      const { sceneId } = req.params;

      if (!sceneId) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'ID de escena requerido',
          code: 'MISSING_SCENE_ID_FOR_CODE'
        });
      }

      const scene = arService.getARScene(sceneId);

      if (!scene) {
        return res.status(404).json({
          error: 'Scene not found',
          message: 'Escena AR no encontrada',
          code: 'AR_SCENE_NOT_FOUND_FOR_CODE'
        });
      }

      const arCode = arService.generateARCode(scene);

      res.setHeader('Content-Type', 'text/html');
      res.send(arCode);
    } catch (error) {
      console.error('Generate AR code error:', error);
      res.status(500).json({
        error: 'Generate AR code failed',
        message: 'Error interno generando código AR',
        code: 'GENERATE_AR_CODE_ERROR'
      });
    }
  });

  // Crear marcador AR en ubicación específica
  app.post("/api/ar/create-marker", async (req, res) => {
    try {
      const { latitude, longitude, projectId } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Latitud y longitud requeridas',
          code: 'MISSING_MARKER_COORDINATES'
        });
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (!arService.isValidCoordinates(lat, lon)) {
        return res.status(400).json({
          error: 'Invalid coordinates',
          message: 'Coordenadas GPS inválidas',
          code: 'INVALID_MARKER_COORDINATES'
        });
      }

      const markerId = await arService.createLocationMarker(lat, lon, projectId);

      res.json({
        message: 'Marcador AR creado exitosamente',
        markerId,
        coordinates: { latitude: lat, longitude: lon }
      });
    } catch (error) {
      console.error('AR marker creation error:', error);
      res.status(500).json({
        error: 'AR marker creation failed',
        message: 'Error interno creando marcador AR',
        code: 'AR_MARKER_CREATION_ERROR'
      });
    }
  });

  // Actualizar proyecto AR
  app.put("/api/ar/project/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const updates = req.body;

      if (!projectId) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'ID de proyecto requerido',
          code: 'MISSING_AR_PROJECT_ID'
        });
      }

      const success = await arService.updateARProject(projectId, updates);

      if (!success) {
        return res.status(404).json({
          error: 'Project not found',
          message: 'Proyecto AR no encontrado',
          code: 'AR_PROJECT_NOT_FOUND'
        });
      }

      res.json({
        message: 'Proyecto AR actualizado exitosamente'
      });
    } catch (error) {
      console.error('Update AR project error:', error);
      res.status(500).json({
        error: 'Update AR project failed',
        message: 'Error interno actualizando proyecto AR',
        code: 'UPDATE_AR_PROJECT_ERROR'
      });
    }
  });

  // Eliminar proyecto AR
  app.delete("/api/ar/project/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'ID de proyecto requerido',
          code: 'MISSING_AR_PROJECT_ID_FOR_DELETE'
        });
      }

      const success = await arService.deleteARProject(projectId);

      if (!success) {
        return res.status(404).json({
          error: 'Project not found',
          message: 'Proyecto AR no encontrado',
          code: 'AR_PROJECT_NOT_FOUND_FOR_DELETE'
        });
      }

      res.json({
        message: 'Proyecto AR eliminado exitosamente'
      });
    } catch (error) {
      console.error('Delete AR project error:', error);
      res.status(500).json({
        error: 'Delete AR project failed',
        message: 'Error interno eliminando proyecto AR',
        code: 'DELETE_AR_PROJECT_ERROR'
      });
    }
  });

  // Obtener configuración móvil AR para una escena
  app.get("/api/ar/scene/:sceneId/mobile-config", async (req, res) => {
    try {
      const { sceneId } = req.params;

      if (!sceneId) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'ID de escena requerido',
          code: 'MISSING_SCENE_ID_FOR_MOBILE'
        });
      }

      const scene = arService.getARScene(sceneId);

      if (!scene) {
        return res.status(404).json({
          error: 'Scene not found',
          message: 'Escena AR no encontrada',
          code: 'AR_SCENE_NOT_FOUND_FOR_MOBILE'
        });
      }

      const mobileConfig = arService.generateMobileARConfig(scene);

      res.json({
        message: 'Configuración móvil AR generada exitosamente',
        config: mobileConfig
      });
    } catch (error) {
      console.error('Generate mobile AR config error:', error);
      res.status(500).json({
        error: 'Generate mobile AR config failed',
        message: 'Error interno generando configuración móvil AR',
        code: 'GENERATE_MOBILE_AR_CONFIG_ERROR'
      });
    }
  });

  // Listar todas las escenas AR disponibles
  app.get("/api/ar/scenes", async (req, res) => {
    try {
      const scenes = arService.listARScenes();

      res.json({
        message: 'Escenas AR obtenidas exitosamente',
        scenes,
        count: scenes.length
      });
    } catch (error) {
      console.error('List AR scenes error:', error);
      res.status(500).json({
        error: 'List AR scenes failed',
        message: 'Error interno listando escenas AR',
        code: 'LIST_AR_SCENES_ERROR'
      });
    }
  });

  // ==================== GAMIFICATION ENDPOINTS ====================

  // User Levels & Progress
  app.get("/api/user/level", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userLevel = await storage.getUserLevel(req.user!.userId);
      if (!userLevel) {
        // Create initial level for user
        const newLevel = await storage.createUserLevel(req.user!.userId);
        return res.json(newLevel);
      }
      res.json(userLevel);
    } catch (error) {
      console.error('Get user level error:', error);
      res.status(500).json({ message: "Error al obtener nivel del usuario" });
    }
  });

  app.get("/api/user/stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getUserStats(req.user!.userId);
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ message: "Error al obtener estadísticas del usuario" });
    }
  });

  // Challenges
  app.get("/api/challenges", async (req, res) => {
    try {
      const filters = {
        level: req.query.level ? parseInt(req.query.level as string) : undefined,
        frequency: req.query.frequency as string,
        category: req.query.category as string,
        difficulty: req.query.difficulty as string,
      };
      
      const challenges = await storage.getChallenges(filters);
      res.json(challenges);
    } catch (error) {
      console.error('Get challenges error:', error);
      res.status(500).json({ message: "Error al obtener desafíos" });
    }
  });

  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallenge(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Desafío no encontrado" });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error('Get challenge error:', error);
      res.status(500).json({ message: "Error al obtener desafío" });
    }
  });

  app.get("/api/challenges/:id/steps", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const steps = await storage.getChallengeSteps(challengeId);
      res.json(steps);
    } catch (error) {
      console.error('Get challenge steps error:', error);
      res.status(500).json({ message: "Error al obtener pasos del desafío" });
    }
  });

  // User Challenge Progress
  app.get("/api/user/challenges", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const progress = await storage.getUserChallengeProgress(req.user!.userId);
      res.json(progress);
    } catch (error) {
      console.error('Get user challenge progress error:', error);
      res.status(500).json({ message: "Error al obtener progreso de desafíos" });
    }
  });

  app.post("/api/user/challenges/:id/start", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const progress = await storage.startChallenge(req.user!.userId, challengeId);
      res.json(progress);
    } catch (error) {
      console.error('Start challenge error:', error);
      res.status(500).json({ message: "Error al iniciar desafío" });
    }
  });

  app.put("/api/user/challenges/:id/progress", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const { currentStep, completedSteps } = req.body;
      
      const progress = await storage.updateChallengeProgress(
        req.user!.userId, 
        challengeId, 
        currentStep, 
        completedSteps
      );
      res.json(progress);
    } catch (error) {
      console.error('Update challenge progress error:', error);
      res.status(500).json({ message: "Error al actualizar progreso del desafío" });
    }
  });

  app.post("/api/user/challenges/:id/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const progress = await storage.completeChallenge(req.user!.userId, challengeId);
      
      // Check for new badges
      const newBadges = await storage.checkBadgeRequirements(req.user!.userId);
      
      res.json({
        progress,
        newBadges
      });
    } catch (error) {
      console.error('Complete challenge error:', error);
      res.status(500).json({ message: "Error al completar desafío" });
    }
  });

  app.post("/api/user/challenges/:id/step/:stepId/complete", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const stepId = parseInt(req.params.stepId);
      
      // Get current progress
      const userProgress = await storage.getUserChallengeProgress(req.user!.userId);
      const currentProgress = userProgress.find((p: any) => p.challengeId === challengeId);
      
      if (!currentProgress) {
        return res.status(404).json({ message: "Progreso no encontrado" });
      }
      
      const completedSteps = currentProgress.completedSteps 
        ? JSON.parse(currentProgress.completedSteps) 
        : [];
      
      if (!completedSteps.includes(stepId)) {
        completedSteps.push(stepId);
      }
      
      const progress = await storage.updateChallengeProgress(
        req.user!.userId,
        challengeId,
        Math.max(currentProgress.currentStep ?? 0, completedSteps.length),
        completedSteps
      );
      
      res.json(progress);
    } catch (error) {
      console.error('Complete challenge step error:', error);
      res.status(500).json({ message: "Error al completar paso del desafío" });
    }
  });

  // Badges
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error('Get badges error:', error);
      res.status(500).json({ message: "Error al obtener badges" });
    }
  });

  app.get("/api/user/badges", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userBadges = await storage.getUserBadges(req.user!.userId);
      res.json(userBadges);
    } catch (error) {
      console.error('Get user badges error:', error);
      res.status(500).json({ message: "Error al obtener badges del usuario" });
    }
  });

  app.post("/api/user/badges/check", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const newBadges = await storage.checkBadgeRequirements(req.user!.userId);
      res.json(newBadges);
    } catch (error) {
      console.error('Check badge requirements error:', error);
      res.status(500).json({ message: "Error al verificar badges" });
    }
  });

  // Activity
  app.get("/api/user/activity", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const activity = await storage.getUserActivity(req.user!.userId, days);
      res.json(activity);
    } catch (error) {
      console.error('Get user activity error:', error);
      res.status(500).json({ message: "Error al obtener actividad del usuario" });
    }
  });

  app.post("/api/user/activity/record", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { experienceGained, challengesCompleted, actionsCompleted } = req.body;
      
      const activity = await storage.recordDailyActivity(
        req.user!.userId,
        experienceGained || 0,
        challengesCompleted || 0,
        actionsCompleted || 0
      );
      
      res.json(activity);
    } catch (error) {
      console.error('Record daily activity error:', error);
      res.status(500).json({ message: "Error al registrar actividad diaria" });
    }
  });

  // === Mission Alignment (Personal→Civic Bridge) ===

  app.get("/api/user/mission-alignment", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      // Get civic profile + life area gaps
      const context = await getUserCoachingContext(userId);

      // Get user memberships filtered to missions
      const allMemberships = await storage.getUserMemberships(userId);
      const missionMemberships = allMemberships.filter(m => m.postType === 'mission');

      // Compute recommendation from archetype + life area gaps
      const alignment = computeMissionAlignment(context.archetype, context.lifeAreaGaps);

      // Find the post for the recommended mission
      const missionPosts = await storage.getCommunityPosts('mission');
      const missionPost = missionPosts.find(p => (p as any).missionSlug === alignment.recommendedMission);

      // Count pending tasks for each current membership
      const taskCounts: Record<number, number> = {};
      for (const m of missionMemberships) {
        const tasks = await storage.getInitiativeTasks(m.postId);
        taskCounts[m.postId] = tasks.filter(t => t.status !== 'done').length;
      }

      res.json({
        hasProfile: !!context.archetype,
        hasLifeAreas: context.lifeAreaGaps.length > 0,
        archetype: context.archetype,
        recommendedRole: alignment.recommendedRole,
        recommendedRoleLabel: alignment.recommendedRoleLabel,
        recommendedMission: {
          slug: alignment.recommendedMission,
          label: alignment.recommendedMissionLabel,
          number: alignment.recommendedMissionNumber,
          postId: missionPost?.id || null,
        },
        reason: alignment.reason,
        currentMemberships: missionMemberships.map(m => ({
          postId: m.postId,
          role: m.role,
          missionSlug: m.missionSlug,
          label: m.postTitle,
          pendingTasks: taskCounts[m.postId] || 0,
        })),
        weakestLifeArea: context.lifeAreaGaps[0] || null,
      });
    } catch (error) {
      console.error('Mission alignment error:', error);
      res.status(500).json({ message: "Error al calcular alineacion de mision" });
    }
  });

  // === Territory Pulse ===

  app.get("/api/user/territory-pulse", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const user = await storage.getUser(userId);

      if (!user || !user.location) {
        return res.json({ hasLocation: false });
      }

      const location = user.location;

      // Count dreams in area + fetch latest 3
      const dreamRows = await db
        .select({
          id: dreams.id,
          type: dreams.type,
          dream: dreams.dream,
          value: dreams.value,
          need: dreams.need,
          basta: dreams.basta,
          createdAt: dreams.createdAt,
        })
        .from(dreams)
        .where(ilike(dreams.location, `%${location}%`))
        .orderBy(drizzleSql`${dreams.createdAt} desc`);

      const dreamCount = dreamRows.length;
      const recentDreams = dreamRows.slice(0, 3).map(d => ({
        id: d.id,
        type: d.type,
        text: d.dream ?? d.value ?? d.need ?? d.basta ?? '',
        createdAt: d.createdAt ?? '',
      }));

      // Count distinct users in area
      const memberRows = await db
        .select({ id: users.id })
        .from(users)
        .where(ilike(users.location, `%${location}%`));

      const memberCount = memberRows.length;

      return res.json({
        hasLocation: true,
        territoryName: location,
        dreamCount,
        recentDreams,
        memberCount,
      });
    } catch (error) {
      console.error('Territory pulse error:', error);
      res.status(500).json({ message: "Error al obtener pulso territorial" });
    }
  });

  // === Mission endpoints ===

  app.get("/api/missions", async (_req, res) => {
    try {
      const missionPosts = await storage.getCommunityPosts('mission');

      const stats = await Promise.all(MISSIONS.map(async (mission) => {
        const post = missionPosts.find(p => (p as any).missionSlug === mission.slug);
        if (!post) {
          return {
            slug: mission.slug,
            number: mission.number,
            label: mission.label,
            postId: null,
            memberCount: 0,
            milestonesCompleted: 0,
            milestonesTotal: 0,
            evidenceCount: 0,
            activeTaskCount: 0,
            status: 'active',
          };
        }

        const [members, milestones, tasks, evidenceCount] = await Promise.all([
          storage.getInitiativeMembers(post.id),
          storage.getInitiativeMilestones(post.id),
          storage.getInitiativeTasks(post.id),
          storage.getEvidenceCount(post.id),
        ]);

        return {
          slug: mission.slug,
          number: mission.number,
          label: mission.label,
          postId: post.id,
          memberCount: members.length,
          milestonesCompleted: milestones.filter(m => m.status === 'completed').length,
          milestonesTotal: milestones.length,
          evidenceCount,
          activeTaskCount: tasks.filter(t => t.status !== 'done').length,
          status: post.status,
        };
      }));

      res.json(stats);
    } catch (error) {
      console.error('Failed to fetch mission stats:', error);
      res.status(500).json({ message: "Failed to fetch mission stats" });
    }
  });

  app.get("/api/missions/:slug/signals", async (req, res) => {
    try {
      const { slug } = req.params;
      const mission = MISSIONS.find(m => m.slug === slug);
      if (!mission) {
        return res.status(404).json({ message: "Mission not found" });
      }

      const allDreams = await storage.getDreams();
      const scored = allDreams
        .map(dream => {
          const match = matchDreamToMissions(dream, [mission])[0];
          return { ...dream, score: match.score, matchCount: match.matchCount };
        })
        .filter(s => s.score > 0)
        .sort((a, b) => {
          const dateA = new Date((a as any).createdAt || 0).getTime();
          const dateB = new Date((b as any).createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 50);

      res.json(scored);
    } catch (error) {
      console.error('Failed to fetch mission signals:', error);
      res.status(500).json({ message: "Failed to fetch mission signals" });
    }
  });

  // === Evidence endpoints ===

  app.get("/api/community/:postId/evidence", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });

      const status = req.query.status as string | undefined;
      const evidence = await storage.getEvidence(postId, status);

      // Enrich with user info
      const enriched = await Promise.all(evidence.map(async (e) => {
        const user = e.userId ? await storage.getUser(e.userId) : null;
        const verifier = e.verifiedBy ? await storage.getUser(e.verifiedBy) : null;
        return {
          ...e,
          user: user ? { id: user.id, name: user.name, username: user.username } : null,
          verifier: verifier ? { id: verifier.id, name: verifier.name, username: verifier.username } : null,
        };
      }));

      res.json(enriched);
    } catch (error) {
      console.error('Failed to fetch evidence:', error);
      res.status(500).json({ message: "Failed to fetch evidence" });
    }
  });

  app.post("/api/community/:postId/evidence", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });
      if (!req.user) return res.status(401).json({ message: "Authentication required" });

      // Verify membership
      const members = await storage.getInitiativeMembers(postId);
      const isMember = members.some(m => m.userId === req.user!.userId && m.status === 'active');
      if (!isMember) return res.status(403).json({ message: "Debes ser miembro para enviar evidencia" });

      if (!req.body.evidenceType || typeof req.body.evidenceType !== 'string') {
        return res.status(400).json({ message: "evidenceType es requerido" });
      }
      if (!req.body.content || typeof req.body.content !== 'string') {
        return res.status(400).json({ message: "content es requerido" });
      }

      // Validate evidenceType against mission's accepted types
      const post = await storage.getCommunityPostWithDetails(postId);
      if (post?.type === 'mission' && (post as any).missionSlug) {
        const mission = MISSIONS.find(m => m.slug === (post as any).missionSlug);
        if (mission && req.body.evidenceType && !mission.evidenceAccepted.includes(req.body.evidenceType)) {
          return res.status(400).json({ message: "Tipo de evidencia no aceptado para esta mision" });
        }
      }

      const evidence = await storage.createEvidence({
        postId,
        userId: req.user.userId,
        evidenceType: req.body.evidenceType,
        content: req.body.content,
        imageUrl: req.body.imageUrl || null,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        milestoneId: req.body.milestoneId || null,
      });

      res.status(201).json(evidence);
    } catch (error) {
      console.error('Failed to create evidence:', error);
      res.status(500).json({ message: "Failed to create evidence" });
    }
  });

  app.post("/api/community/:postId/evidence/:evidenceId/verify", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const evidenceId = parseInt(req.params.evidenceId);
      if (isNaN(postId) || isNaN(evidenceId)) return res.status(400).json({ message: "Invalid ID" });
      if (!req.user) return res.status(401).json({ message: "Authentication required" });

      // Verify caller is a custodio
      const members = await storage.getInitiativeMembers(postId);
      const member = members.find(m => m.userId === req.user!.userId && m.status === 'active');
      if (!member || member.role !== 'custodio') {
        return res.status(403).json({ message: "Solo los custodios pueden verificar evidencia" });
      }

      const updated = await storage.verifyEvidence(evidenceId, req.user.userId);
      res.json(updated);
    } catch (error) {
      console.error('Failed to verify evidence:', error);
      res.status(500).json({ message: "Failed to verify evidence" });
    }
  });

  app.post("/api/community/:postId/evidence/:evidenceId/flag", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const evidenceId = parseInt(req.params.evidenceId);
      if (isNaN(postId) || isNaN(evidenceId)) return res.status(400).json({ message: "Invalid ID" });
      if (!req.user) return res.status(401).json({ message: "Authentication required" });

      const { flagCategory } = req.body;
      if (!flagCategory) return res.status(400).json({ message: "flagCategory required" });

      // Verify caller is a custodio
      const members = await storage.getInitiativeMembers(postId);
      const member = members.find(m => m.userId === req.user!.userId && m.status === 'active');
      if (!member || member.role !== 'custodio') {
        return res.status(403).json({ message: "Solo los custodios pueden marcar evidencia" });
      }

      // Validate flagCategory against mission's pause conditions
      const post = await storage.getCommunityPostWithDetails(postId);
      if (post?.type === 'mission' && (post as any).missionSlug) {
        const mission = MISSIONS.find(m => m.slug === (post as any).missionSlug);
        if (mission && !mission.pauseConditions.includes(flagCategory)) {
          return res.status(400).json({ message: "Condicion de pausa no valida para esta mision" });
        }
      }

      const updated = await storage.flagEvidence(evidenceId, flagCategory, req.user.userId);

      // Auto-pause check: if 3+ flags on same category, pause the mission
      const flagCounts = await storage.getEvidenceCountByFlag(postId);
      const thisFlag = flagCounts.find(f => f.flagCategory === flagCategory);
      if (thisFlag && thisFlag.count >= 3 && post) {
        await storage.updateCommunityPost(postId, { status: 'paused' }, post.userId!);
      }

      res.json({ evidence: updated, paused: (thisFlag?.count ?? 0) >= 3 });
    } catch (error) {
      console.error('Failed to flag evidence:', error);
      res.status(500).json({ message: "Failed to flag evidence" });
    }
  });

  // === Chronicle endpoints ===

  app.get("/api/community/:postId/chronicles", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });

      const chronicles = await storage.getChronicles(postId);

      const enriched = await Promise.all(chronicles.map(async (c) => {
        const user = c.userId ? await storage.getUser(c.userId) : null;
        return {
          ...c,
          user: user ? { id: user.id, name: user.name, username: user.username } : null,
        };
      }));

      res.json(enriched);
    } catch (error) {
      console.error('Failed to fetch chronicles:', error);
      res.status(500).json({ message: "Failed to fetch chronicles" });
    }
  });

  app.post("/api/community/:postId/chronicles", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });
      if (!req.user) return res.status(401).json({ message: "Authentication required" });

      if (!req.body.title || typeof req.body.title !== 'string') {
        return res.status(400).json({ message: "title es requerido" });
      }
      if (!req.body.content || typeof req.body.content !== 'string') {
        return res.status(400).json({ message: "content es requerido" });
      }

      // Verify caller is a narrador
      const members = await storage.getInitiativeMembers(postId);
      const member = members.find(m => m.userId === req.user!.userId && m.status === 'active');
      if (!member || member.role !== 'narrador') {
        return res.status(403).json({ message: "Solo los narradores pueden escribir cronicas" });
      }

      const chronicle = await storage.createChronicle({
        postId,
        userId: req.user.userId,
        title: req.body.title,
        content: req.body.content,
        highlightedEvidenceIds: req.body.highlightedEvidenceIds ? JSON.stringify(req.body.highlightedEvidenceIds) : null,
        publishedAt: new Date().toISOString(),
      });

      res.status(201).json(chronicle);
    } catch (error) {
      console.error('Failed to create chronicle:', error);
      res.status(500).json({ message: "Failed to create chronicle" });
    }
  });

  // ==================== BLOG & VLOG ENDPOINTS ====================

  // Get all blog posts with optional filters
  app.get("/api/blog/stats", async (_req, res) => {
    try {
      const stats = await storage.getBlogPostStats();
      res.json(stats);
    } catch (error) {
      console.error('Get blog stats error:', error);
      res.status(500).json({
        message: "Error al obtener estadísticas del blog"
      });
    }
  });

  app.get("/api/blog/posts", async (req, res) => {
    try {
      const {
        type, // 'blog' | 'vlog'
        category,
        tag,
        search,
        featured,
        page = '1',
        limit = '10'
      } = req.query;

      const filters: any = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      if (type) filters.type = type as string;
      if (category) filters.category = category as string;
      if (tag) filters.tag = tag as string;
      if (search) filters.search = search as string;
      if (featured === 'true') filters.featured = true;
      if (featured === 'false') filters.featured = false;

      const posts = await storage.getBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error('Get blog posts error:', error);
      console.error('Error details:', error instanceof Error ? error.stack : error);
      res.status(500).json({ 
        message: "Error al obtener posts del blog",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get single blog post by slug
  app.get("/api/blog/posts/:slug", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPost(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post no encontrado" });
      }

      // Record view if user is authenticated
      if (req.user) {
        await storage.recordPostView(post.id, req.user.userId);
      }

      res.json(post);
    } catch (error) {
      console.error('Get blog post error:', error);
      res.status(500).json({ message: "Error al obtener el post" });
    }
  });

  // Create new blog post (requires auth)
  app.post("/api/blog/posts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost({
        ...validatedData,
        authorId: req.user!.userId
      });
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos de post inválidos", errors: error.errors });
      } else {
        console.error('Create blog post error:', error);
        res.status(500).json({ message: "Error al crear el post" });
      }
    }
  });

  // Update blog post (requires auth and ownership)
  app.put("/api/blog/posts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBlogPostSchema.parse(req.body);
      
      const post = await storage.updateBlogPost(parseInt(id), validatedData, req.user!.userId);
      
      if (!post) {
        return res.status(404).json({ message: "Post no encontrado o sin permisos" });
      }
      
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos de post inválidos", errors: error.errors });
      } else {
        console.error('Update blog post error:', error);
        res.status(500).json({ message: "Error al actualizar el post" });
      }
    }
  });

  // Delete blog post (requires auth and ownership)
  app.delete("/api/blog/posts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBlogPost(parseInt(id), req.user!.userId);
      
      if (!success) {
        return res.status(404).json({ message: "Post no encontrado o sin permisos" });
      }
      
      res.json({ message: "Post eliminado exitosamente" });
    } catch (error) {
      console.error('Delete blog post error:', error);
      res.status(500).json({ message: "Error al eliminar el post" });
    }
  });

  // ==================== BLOG INTERACTION ENDPOINTS ====================

  // Like/Unlike post
  app.post("/api/blog/posts/:id/like", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const result = await storage.togglePostLike(parseInt(id), req.user!.userId);
      
      res.json(result);
    } catch (error) {
      console.error('Toggle post like error:', error);
      res.status(500).json({ message: "Error al dar/quitar like" });
    }
  });

  // Get post likes
  app.get("/api/blog/posts/:id/likes", async (req, res) => {
    try {
      const { id } = req.params;
      const likes = await storage.getPostLikes(parseInt(id));
      
      res.json(likes);
    } catch (error) {
      console.error('Get post likes error:', error);
      res.status(500).json({ message: "Error al obtener likes" });
    }
  });

  // Create comment
  app.post("/api/blog/posts/:id/comments", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { content, parentId } = req.body;
      
      if (!content || content.trim().length < 10) {
        return res.status(400).json({ message: "El comentario debe tener al menos 10 caracteres" });
      }
      
      const comment = await storage.createPostComment(parseInt(id), req.user!.userId, content, parentId);
      
      res.status(201).json(comment);
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ message: "Error al crear comentario" });
    }
  });

  // Get post comments
  app.get("/api/blog/posts/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getPostComments(parseInt(id));
      
      res.json(comments);
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ message: "Error al obtener comentarios" });
    }
  });

  // Update comment
  app.put("/api/blog/comments/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      if (!content || content.trim().length < 10) {
        return res.status(400).json({ message: "El comentario debe tener al menos 10 caracteres" });
      }
      
      const comment = await storage.updatePostComment(parseInt(id), content, req.user!.userId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comentario no encontrado o sin permisos" });
      }
      
      res.json(comment);
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ message: "Error al actualizar comentario" });
    }
  });

  // Delete comment
  app.delete("/api/blog/comments/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePostComment(parseInt(id), req.user!.userId);
      
      if (!success) {
        return res.status(404).json({ message: "Comentario no encontrado o sin permisos" });
      }
      
      res.json({ message: "Comentario eliminado exitosamente" });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ message: "Error al eliminar comentario" });
    }
  });

  // Bookmark/Unbookmark post
  app.post("/api/blog/posts/:id/bookmark", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const result = await storage.togglePostBookmark(parseInt(id), req.user!.userId);
      
      res.json(result);
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      res.status(500).json({ message: "Error al guardar/quitar bookmark" });
    }
  });

  // Get user bookmarks
  app.get("/api/blog/bookmarks", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks(req.user!.userId);
      
      res.json(bookmarks);
    } catch (error) {
      console.error('Get bookmarks error:', error);
      res.status(500).json({ message: "Error al obtener bookmarks" });
    }
  });

  // Record post view
  app.post("/api/blog/posts/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, sessionId } = req.body;
      
      await storage.recordPostView(parseInt(id), userId, sessionId);
      
      res.json({ message: "View registrada" });
    } catch (error) {
      console.error('Record view error:', error);
      res.status(500).json({ message: "Error al registrar view" });
    }
  });

  // ==================== BLOG SEARCH & RECOMMENDATIONS ====================

  // Search posts
  app.get("/api/blog/search", async (req, res) => {
    try {
      const { q: query, type, category } = req.query;
      const { limit, page } = parsePagination(req);

      if (!query || query.toString().trim().length < 2) {
        return res.status(400).json({ message: "Query debe tener al menos 2 caracteres" });
      }

      const results = await storage.searchPosts(query as string, {
        type: type as string,
        category: category as string,
        page: page ?? 1,
        limit
      });
      
      res.json(results);
    } catch (error) {
      console.error('Search posts error:', error);
      res.status(500).json({ message: "Error en búsqueda" });
    }
  });

  // Get trending posts
  app.get("/api/blog/trending", async (req, res) => {
    try {
      const { days = '7' } = req.query;
      const { limit } = parsePagination(req, { defaultLimit: 10 });
      const posts = await storage.getTrendingPosts(parseInt(days as string), limit);
      
      res.json(posts);
    } catch (error) {
      console.error('Get trending posts error:', error);
      res.status(500).json({ message: "Error al obtener posts trending" });
    }
  });

  // Get related posts
  app.get("/api/blog/posts/:id/related", async (req, res) => {
    try {
      const { id } = req.params;
      const { limit } = parsePagination(req, { defaultLimit: 4 });
      const posts = await storage.getRelatedPosts(parseInt(id), limit);
      
      res.json(posts);
    } catch (error) {
      console.error('Get related posts error:', error);
      res.status(500).json({ message: "Error al obtener posts relacionados" });
    }
  });

  // Get popular tags
  app.get("/api/blog/tags/popular", async (req, res) => {
    try {
      const { limit } = parsePagination(req);
      const tags = await storage.getPopularTags(limit);
      
      res.json(tags);
    } catch (error) {
      console.error('Get popular tags error:', error);
      res.status(500).json({ message: "Error al obtener tags populares" });
    }
  });

  // ==================== INSPIRING STORIES ROUTES ====================

  // Get all inspiring stories with optional filters
  app.get("/api/stories", async (req, res) => {
    try {
      const { category, status, featured } = req.query;
      const { limit, offset } = parsePagination(req);

      const filters: any = {};
      if (category) filters.category = category as string;
      if (status) filters.status = status as string;
      if (featured !== undefined) filters.featured = featured === 'true';
      filters.limit = limit;
      filters.offset = offset;
      
      const stories = await storage.getInspiringStories(filters);
      
      res.json({
        success: true,
        data: stories,
        total: stories.length
      });
    } catch (error) {
      console.error("Error fetching inspiring stories:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching inspiring stories"
      });
    }
  });

  // Get featured inspiring stories
  app.get("/api/stories/featured", async (req, res) => {
    try {
      const { limit } = req.query;
      const stories = await storage.getFeaturedStories(limit ? parseInt(limit as string) : 3);
      
      res.json({
        success: true,
        data: stories
      });
    } catch (error) {
      console.error("Error fetching featured stories:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching featured stories"
      });
    }
  });

  // Get stories by category
  app.get("/api/stories/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const { limit } = req.query;
      const stories = await storage.getStoriesByCategory(category, limit ? parseInt(limit as string) : 5);
      
      res.json({
        success: true,
        data: stories
      });
    } catch (error) {
      console.error("Error fetching stories by category:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching stories by category"
      });
    }
  });

  // Get single inspiring story
  app.get("/api/stories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      
      const story = await storage.getInspiringStory(storyId);
      
      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      
      // Increment view count
      await storage.incrementStoryViews(storyId);
      
      res.json({
        success: true,
        data: story
      });
    } catch (error) {
      console.error("Error fetching inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching inspiring story"
      });
    }
  });

  // Create new inspiring story
  app.post("/api/stories", optionalAuth, sanitizeInput, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Validate input
      const validatedData = createInspiringStorySchema.parse(req.body);
      
      // Create story
      const story = await storage.createInspiringStory({
        ...validatedData,
        authorId: user?.userId || null,
        status: 'pending', // New stories need moderation
        publishedAt: new Date().toISOString(),
      });
      
      res.status(201).json({
        success: true,
        data: story,
        message: "Story created successfully and submitted for moderation"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid story data",
          details: error.errors
        });
      }
      
      console.error("Error creating inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error creating inspiring story"
      });
    }
  });

  // Update inspiring story
  app.put("/api/stories/:id", authenticateToken, sanitizeInput, async (req: any, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      const user = req.user!;
      
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      
      const existingStory = await storage.getInspiringStory(storyId);
      if (!existingStory) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      
      // Check if user can edit this story
      if (existingStory.authorId !== user.userId && user.userId !== 1) { // Admin can edit any story
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only edit your own stories"
        });
      }
      
      // Validate input
      const validatedData = createInspiringStorySchema.partial().parse(req.body);
      
      // Update story
      const updatedStory = await storage.updateInspiringStory(storyId, validatedData);
      
      res.json({
        success: true,
        data: updatedStory,
        message: "Story updated successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid story data",
          details: error.errors
        });
      }
      
      console.error("Error updating inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error updating inspiring story"
      });
    }
  });

  // Delete inspiring story
  app.delete("/api/stories/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      const user = req.user!;
      
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      
      const existingStory = await storage.getInspiringStory(storyId);
      if (!existingStory) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      
      // Check if user can delete this story
      if (existingStory.authorId !== user.userId && user.userId !== 1) { // Admin can delete any story
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only delete your own stories"
        });
      }
      
      await storage.deleteInspiringStory(storyId);
      
      res.json({
        success: true,
        message: "Story deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error deleting inspiring story"
      });
    }
  });

  // Like inspiring story
  app.post("/api/stories/:id/like", optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      
      const story = await storage.getInspiringStory(storyId);
      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      
      await storage.incrementStoryLikes(storyId);
      
      res.json({
        success: true,
        message: "Story liked successfully"
      });
    } catch (error) {
      console.error("Error liking inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error liking inspiring story"
      });
    }
  });

  // Share inspiring story
  app.post("/api/stories/:id/share", optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      
      const story = await storage.getInspiringStory(storyId);
      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      
      await storage.incrementStoryShares(storyId);
      
      res.json({
        success: true,
        message: "Story shared successfully"
      });
    } catch (error) {
      console.error("Error sharing inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error sharing inspiring story"
      });
    }
  });

  // Moderate inspiring story (Admin only)
  app.put("/api/stories/:id/moderate", authenticateToken, sanitizeInput, async (req: any, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      const user = req.user!;
      const { status, notes } = req.body;
      
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      
      // Check if user is admin (for now, user ID 1 is admin)
      if (user.userId !== 1) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Only administrators can moderate stories"
        });
      }
      
      const story = await storage.getInspiringStory(storyId);
      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid status. Must be 'pending', 'approved', or 'rejected'"
        });
      }
      
      const moderatedStory = await storage.moderateStory(storyId, status, user.userId, notes);
      
      res.json({
        success: true,
        data: moderatedStory,
        message: `Story ${status} successfully`
      });
    } catch (error) {
      console.error("Error moderating inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error moderating inspiring story"
      });
    }
  });

  // ==================== GAMIFICATION ENDPOINTS ====================

  // Get recent commitments + semillero stats
  app.get("/api/commitments", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const rawLimit = Number(req.query.limit);
      const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 100)) : 20;

      const [commitments, stats] = await Promise.all([
        storage.getRecentCommitments(limit),
        storage.getCommitmentStats()
      ]);

      res.json({
        success: true,
        data: {
          commitments,
          stats
        }
      });
    } catch (error) {
      console.error("Error fetching commitments:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching commitments"
      });
    }
  });

  // Save user commitment
  app.post("/api/commitment", authenticateToken, sanitizeInput, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { commitmentText, commitmentType, latitude, longitude, province, city } = req.body;
      
      if (!commitmentText || !commitmentType) {
        return res.status(400).json({
          error: "Bad Request",
          message: "commitmentText and commitmentType are required"
        });
      }

      const parsedLatitude = latitude !== undefined && latitude !== null && latitude !== ''
        ? Number(latitude)
        : null;
      const parsedLongitude = longitude !== undefined && longitude !== null && longitude !== ''
        ? Number(longitude)
        : null;

      if ((parsedLatitude !== null && !Number.isFinite(parsedLatitude)) || (parsedLongitude !== null && !Number.isFinite(parsedLongitude))) {
        return res.status(400).json({
          error: "Bad Request",
          message: "latitude and longitude must be valid numbers when provided"
        });
      }

      if ((parsedLatitude === null) !== (parsedLongitude === null)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "latitude and longitude must be provided together"
        });
      }

      if (
        parsedLatitude !== null &&
        parsedLongitude !== null &&
        (parsedLatitude < -90 || parsedLatitude > 90 || parsedLongitude < -180 || parsedLongitude > 180)
      ) {
        return res.status(400).json({
          error: "Bad Request",
          message: "latitude must be between -90 and 90 and longitude between -180 and 180"
        });
      }

      const commitment = await storage.saveCommitment(user.userId, commitmentText, commitmentType, {
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        province: typeof province === 'string' ? province : null,
        city: typeof city === 'string' ? city : null
      });
      
      res.json({
        success: true,
        data: commitment,
        message: "Commitment saved successfully"
      });
    } catch (error) {
      console.error("Error saving commitment:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error saving commitment"
      });
    }
  });

  // Get user badges
  app.get("/api/badges/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { userId } = req.params;
      const user = req.user!;
      
      const requestedUserId = parseInt(userId);
      const tokenUserId = Number(user.userId);
      
      console.log('[Badges] Requested userId:', requestedUserId, 'Token userId:', tokenUserId, 'Types:', typeof requestedUserId, typeof tokenUserId, 'Match:', tokenUserId === requestedUserId);
      
      // Users can only see their own badges unless they're admin
      if (tokenUserId !== requestedUserId && tokenUserId !== 1) {
        console.log('[Badges] Authorization failed - userId mismatch. Requested:', requestedUserId, 'Token:', tokenUserId);
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only view your own badges",
          code: "AUTHORIZATION_FAILED",
          requestedUserId,
          tokenUserId
        });
      }

      const badges = await storage.getUserBadges(parseInt(userId));
      
      res.json({
        success: true,
        data: badges
      });
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching user badges"
      });
    }
  });

  // Get public profile by username
  app.get("/api/users/:username/profile", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getPublicProfileByUsername(username);

      if (!profile) {
        return res.status(404).json({
          error: "Not Found",
          message: "Usuario no encontrado"
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching public profile"
      });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { type = 'global', limit = 10 } = req.query;
      
      const leaderboard = await storage.getLeaderboard(type as string, parseInt(limit as string));
      
      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching leaderboard"
      });
    }
  });

  // Record user action and award points
  app.post("/api/action", authenticateToken, sanitizeInput, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { actionType, metadata } = req.body;
      
      if (!actionType) {
        return res.status(400).json({
          error: "Bad Request",
          message: "actionType is required"
        });
      }

      const action = await storage.recordAction(user.userId, actionType, metadata);
      
      res.json({
        success: true,
        data: action,
        message: "Action recorded successfully"
      });
    } catch (error) {
      console.error("Error recording action:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error recording action"
      });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { userId } = req.params;
      const user = req.user!;
      
      const requestedUserId = parseInt(userId);
      const tokenUserId = Number(user.userId);
      
      console.log('[Progress] Requested userId:', requestedUserId, 'Token userId:', tokenUserId, 'Types:', typeof requestedUserId, typeof tokenUserId, 'Match:', tokenUserId === requestedUserId);
      
      // Users can only see their own progress unless they're admin
      if (tokenUserId !== requestedUserId && tokenUserId !== 1) {
        console.log('[Progress] Authorization failed - userId mismatch. Requested:', requestedUserId, 'Token:', tokenUserId);
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only view your own progress",
          code: "AUTHORIZATION_FAILED",
          requestedUserId,
          tokenUserId
        });
      }

      const progress = await storage.getUserProgress(parseInt(userId));
      
      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching user progress"
      });
    }
  });

  // Award badge to user
  app.post("/api/badges/award", authenticateToken, sanitizeInput, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { badgeId, userId } = req.body;
      
      // Only admin can award badges or users can earn them automatically
      if (user.userId !== 1 && user.userId !== userId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Only administrators can award badges"
        });
      }

      const badge = await storage.awardBadge(userId || user.userId, badgeId);
      
      res.json({
        success: true,
        data: badge,
        message: "Badge awarded successfully"
      });
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error awarding badge"
      });
    }
  });

  // ==================== BLOG POSTS ENDPOINTS ====================

  // Get all blog posts
  app.get("/api/blog-posts", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { category, type, search, page = 1, limit = 10 } = req.query;
      
      const posts = await storage.getBlogPosts({
        category: category as string,
        type: type as string,
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching blog posts"
      });
    }
  });

  // Get single blog post
  app.get("/api/blog-posts/:id", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({
          error: "Not Found",
          message: "Post not found"
        });
      }
      
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching blog post"
      });
    }
  });

  // ============ Platform Feedback ============

  // Public: submit feedback (no auth required, optionalAuth to attach userId if logged in)
  app.post("/api/feedback", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const parsed = insertPlatformFeedbackSchema.safeParse({
        ...req.body,
        userId: req.user?.userId || null,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: "Datos inválidos", details: parsed.error.errors });
      }
      const feedback = await storage.createPlatformFeedback(parsed.data);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Error al enviar feedback" });
    }
  });

  // Admin: get all feedback (restricted to user ID 1 — HombreGris01)
  app.get("/api/admin/feedback", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (req.user?.userId !== 1) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const feedback = await storage.getAllPlatformFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Error al obtener feedback" });
    }
  });

  // Admin: update feedback status (restricted to user ID 1 — HombreGris01)
  app.patch("/api/admin/feedback/:id/status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (req.user?.userId !== 1) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const { status, adminNotes } = req.body;
      if (!status || !['nueva', 'revisada', 'resuelta'].includes(status)) {
        return res.status(400).json({ error: "Estado inválido. Debe ser 'nueva', 'revisada' o 'resuelta'" });
      }
      const feedback = await storage.updatePlatformFeedbackStatus(id, status, adminNotes);
      if (!feedback) {
        return res.status(404).json({ error: "Feedback no encontrado" });
      }
      res.json(feedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ error: "Error al actualizar feedback" });
    }
  });

  // Error handling middleware (must be last)
  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  const httpServer = createServer(app);

  return httpServer;
}
