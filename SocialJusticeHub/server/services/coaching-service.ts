import { db } from '../db';
import { civicProfiles, coachingSessions, lifeAreaScores, lifeAreas } from '@shared/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { config } from '../config';
import { getTemplateMessages } from '@shared/coaching-templates';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface CoachingContext {
  archetype: string | null;
  dimensionScores: Record<string, number> | null;
  topStrengths: string[];
  growthAreas: string[];
  weakestDimension: string | null;
  lifeAreaGaps: Array<{ area: string; current: number; desired: number; gap: number }>;
}

// Coaching provider interface
interface CoachingProvider {
  generateResponse(
    messages: ChatMessage[],
    sessionType: string,
    context: CoachingContext,
  ): Promise<string>;
}

// Mock provider - uses curated templates
class MockCoachingProvider implements CoachingProvider {
  async generateResponse(
    messages: ChatMessage[],
    sessionType: string,
    context: CoachingContext,
  ): Promise<string> {
    const templates = getTemplateMessages(
      sessionType,
      context.archetype,
      context.weakestDimension,
    );

    // Pick a message based on conversation length to vary responses
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    const idx = userMessageCount % templates.length;
    return templates[idx];
  }
}

// Claude provider - uses Anthropic API when configured
class ClaudeCoachingProvider implements CoachingProvider {
  async generateResponse(
    messages: ChatMessage[],
    sessionType: string,
    context: CoachingContext,
  ): Promise<string> {
    // Dynamic import - @anthropic-ai/sdk must be installed separately
    // @ts-ignore - optional dependency, only used when ANTHROPIC_API_KEY is set
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: config.ai.anthropicApiKey! });

    const systemPrompt = this.buildSystemPrompt(sessionType, context);
    const apiMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await client.messages.create({
      model: config.ai.model,
      max_tokens: config.ai.maxTokens,
      system: systemPrompt,
      messages: apiMessages,
    });

    const textBlock = (response.content as Array<{type: string; text?: string}>).find((b: {type: string}) => b.type === 'text');
    return textBlock?.text || 'No pude generar una respuesta. Intentalo de nuevo.';
  }

  private buildSystemPrompt(sessionType: string, context: CoachingContext): string {
    let prompt = `Sos un coach civico argentino. Hablas en castellano rioplatense (vos, sos, tenes). Sos directo pero empatico. Cada respuesta tiene maximo 150 palabras e incluye al menos un paso concreto y accionable.

Tipo de sesion: ${sessionType}`;

    if (context.archetype) {
      prompt += `\nArquetipo civico del usuario: ${context.archetype}`;
    }
    if (context.topStrengths.length > 0) {
      prompt += `\nFortalezas: ${context.topStrengths.join(', ')}`;
    }
    if (context.growthAreas.length > 0) {
      prompt += `\nAreas de crecimiento: ${context.growthAreas.join(', ')}`;
    }
    if (context.dimensionScores) {
      prompt += `\nPuntuaciones por dimension: ${JSON.stringify(context.dimensionScores)}`;
    }
    if (context.lifeAreaGaps.length > 0) {
      const topGaps = context.lifeAreaGaps.slice(0, 5);
      prompt += `\nAreas de vida con mayor brecha (actual vs deseado): ${topGaps.map(g => `${g.area}: ${g.current}→${g.desired} (gap ${g.gap})`).join(', ')}`;
    }

    prompt += `\n\nNunca digas que sos una IA. Actua como un coach civico experimentado que conoce la realidad argentina.`;
    return prompt;
  }
}

// Provider factory
function getProvider(): CoachingProvider {
  if (config.ai.enabled && config.ai.anthropicApiKey) {
    return new ClaudeCoachingProvider();
  }
  return new MockCoachingProvider();
}

// Main service functions

export async function getUserCoachingContext(userId: number): Promise<CoachingContext> {
  const profile = await db
    .select()
    .from(civicProfiles)
    .where(eq(civicProfiles.userId, userId))
    .orderBy(desc(civicProfiles.createdAt))
    .limit(1);

  // Fetch life area scores with gaps
  let lifeAreaGaps: CoachingContext['lifeAreaGaps'] = [];
  try {
    const scores = await db
      .select({
        areaName: lifeAreas.name,
        currentScore: lifeAreaScores.currentScore,
        desiredScore: lifeAreaScores.desiredScore,
        gap: lifeAreaScores.gap,
      })
      .from(lifeAreaScores)
      .innerJoin(lifeAreas, eq(lifeAreaScores.lifeAreaId, lifeAreas.id))
      .where(
        and(
          eq(lifeAreaScores.userId, userId),
          isNull(lifeAreaScores.subcategoryId),
        ),
      );

    lifeAreaGaps = scores
      .filter(s => (s.gap ?? 0) > 0)
      .map(s => ({
        area: s.areaName,
        current: s.currentScore ?? 0,
        desired: s.desiredScore ?? 0,
        gap: s.gap ?? 0,
      }))
      .sort((a, b) => b.gap - a.gap);
  } catch {
    // Life areas may not be seeded yet
  }

  if (profile.length === 0) {
    return {
      archetype: null,
      dimensionScores: null,
      topStrengths: [],
      growthAreas: [],
      weakestDimension: null,
      lifeAreaGaps,
    };
  }

  const p = profile[0];
  const scores: Record<string, number> = JSON.parse(p.dimensionScores);
  const growthAreas: string[] = JSON.parse(p.growthAreas);

  return {
    archetype: p.archetype,
    dimensionScores: scores,
    topStrengths: JSON.parse(p.topStrengths),
    growthAreas,
    weakestDimension: growthAreas[0] || null,
    lifeAreaGaps,
  };
}

export async function sendCoachingMessage(
  userId: number,
  sessionId: number,
  userMessage: string,
): Promise<{ reply: string; messages: ChatMessage[] }> {
  // Get session
  const session = await db
    .select()
    .from(coachingSessions)
    .where(eq(coachingSessions.id, sessionId))
    .limit(1);

  if (session.length === 0) {
    throw new Error('Session not found');
  }

  const existingMessages: ChatMessage[] = JSON.parse(session[0].messages);
  const context = await getUserCoachingContext(userId);

  // Add user message
  const userMsg: ChatMessage = {
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  };
  existingMessages.push(userMsg);

  // Generate response
  const provider = getProvider();
  const reply = await provider.generateResponse(
    existingMessages,
    session[0].sessionType,
    context,
  );

  // Add assistant message
  const assistantMsg: ChatMessage = {
    role: 'assistant',
    content: reply,
    timestamp: new Date().toISOString(),
  };
  existingMessages.push(assistantMsg);

  // Update session
  await db
    .update(coachingSessions)
    .set({
      messages: JSON.stringify(existingMessages),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(coachingSessions.id, sessionId));

  return { reply, messages: existingMessages };
}

export async function startCoachingSession(
  userId: number,
  sessionType: string,
): Promise<{ sessionId: number; messages: ChatMessage[] }> {
  const context = await getUserCoachingContext(userId);
  const provider = getProvider();

  // Generate initial message
  const initialMessage = await provider.generateResponse(
    [],
    sessionType,
    context,
  );

  const messages: ChatMessage[] = [{
    role: 'assistant',
    content: initialMessage,
    timestamp: new Date().toISOString(),
  }];

  const now = new Date().toISOString();
  const result = await db.insert(coachingSessions).values({
    userId,
    sessionType: sessionType as any,
    status: 'active',
    messages: JSON.stringify(messages),
    createdAt: now,
    updatedAt: now,
  }).returning();

  return { sessionId: result[0].id, messages };
}
