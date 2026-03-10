import { db } from '../db';
import {
  civicAssessments,
  civicAssessmentResponses,
  civicProfiles,
} from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';
import {
  type AssessmentQuestion,
  type CivicDimension,
  type CivicArchetype,
  CIVIC_DIMENSIONS,
  CIVIC_ARCHETYPES,
  ASSESSMENT_QUESTIONS,
} from '@shared/civic-assessment-questions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawResponse {
  questionKey: string;
  dimensionKey: string;
  responseType: 'scale' | 'choice' | 'rank';
  responseValue: number | null;
  responseChoice: string | null;
  responseRank: string | null; // JSON-encoded array
}

export interface DimensionScores {
  [dimension: string]: number; // 0-100
}

export interface CivicProfileResult {
  userId: number;
  assessmentId: number;
  archetype: string;
  dimensionScores: DimensionScores;
  topStrengths: string[];
  growthAreas: string[];
  recommendedActions: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findQuestion(questionKey: string): AssessmentQuestion | undefined {
  return ASSESSMENT_QUESTIONS.find((q) => q.key === questionKey);
}

function stdDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

// ---------------------------------------------------------------------------
// 1. computeDimensionScores
// ---------------------------------------------------------------------------

export function computeDimensionScores(responses: RawResponse[]): DimensionScores {
  // Accumulate weighted scores per dimension
  const dimensionAccum: Record<string, { totalWeightedScore: number; totalWeight: number }> = {};

  // Initialise all known dimensions to zero
  for (const dim of CIVIC_DIMENSIONS) {
    dimensionAccum[dim.key] = { totalWeightedScore: 0, totalWeight: 0 };
  }

  for (const resp of responses) {
    const question = findQuestion(resp.questionKey);
    if (!question) continue;

    const weight = question.weight ?? 1;
    let score: number | null = null;

    switch (resp.responseType) {
      case 'scale': {
        // Scale questions use 1-10 range
        const value = resp.responseValue ?? 1;
        score = ((value - 1) / 9) * 100;
        break;
      }

      case 'choice': {
        if (question.type !== 'choice') break;
        const choiceKey = resp.responseChoice ?? '';
        const options = question.options;
        const idx = options.findIndex(o => o.value === choiceKey);
        if (idx >= 0 && options.length > 1) {
          // Later options generally indicate higher engagement/capability
          score = ((idx + 1) / options.length) * 100;
        } else {
          score = 50;
        }
        break;
      }

      case 'rank': {
        // Score based on average position of ranked items
        // First item ranked = highest score contribution
        let rankedItems: string[] = [];
        try {
          rankedItems = JSON.parse(resp.responseRank ?? '[]');
        } catch {
          rankedItems = [];
        }
        if (rankedItems.length > 0) {
          // Average normalized position: top = 100, bottom = 0
          const avgScore = rankedItems.reduce((sum, _, idx) => {
            return sum + ((rankedItems.length - 1 - idx) / Math.max(1, rankedItems.length - 1)) * 100;
          }, 0) / rankedItems.length;
          score = avgScore;
        }
        break;
      }
    }

    if (score !== null) {
      // Clamp to 0-100
      score = Math.max(0, Math.min(100, score));

      const dimKey = resp.dimensionKey;
      if (!dimensionAccum[dimKey]) {
        dimensionAccum[dimKey] = { totalWeightedScore: 0, totalWeight: 0 };
      }
      dimensionAccum[dimKey].totalWeightedScore += score * weight;
      dimensionAccum[dimKey].totalWeight += weight;
    }
  }

  // Average per dimension
  const scores: DimensionScores = {};
  for (const [dim, accum] of Object.entries(dimensionAccum)) {
    scores[dim] = accum.totalWeight > 0
      ? Math.round((accum.totalWeightedScore / accum.totalWeight) * 100) / 100
      : 0;
  }

  return scores;
}

// ---------------------------------------------------------------------------
// 2. determineArchetype
// ---------------------------------------------------------------------------

export function determineArchetype(dimensionScores: DimensionScores): string {
  let bestArchetype: string = CIVIC_ARCHETYPES[0]?.key ?? 'unknown';
  let bestScore = -Infinity;

  const allScoreValues = Object.values(dimensionScores);
  const globalStdDev = stdDeviation(allScoreValues);

  for (const archetype of CIVIC_ARCHETYPES) {
    const primaryDims: string[] = archetype.primaryDimensions ?? [];

    if (primaryDims.length === 0) continue;

    // Average of primaryDimension scores
    const relevantScores = primaryDims
      .map((d) => dimensionScores[d] ?? 0);
    const avg = relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length;

    // For "el_espejo" (balanced archetype): favour it when std dev is low
    let adjustedScore = avg;
    if (archetype.key === 'el_espejo') {
      // Bonus for balance: lower std deviation yields a bigger boost.
      // Max bonus of 15 points when perfectly balanced (stdDev = 0).
      const balanceBonus = Math.max(0, 15 - globalStdDev);
      adjustedScore = avg + balanceBonus;
    }

    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestArchetype = archetype.key;
    }
  }

  return bestArchetype;
}

// ---------------------------------------------------------------------------
// 3. computeTopStrengths
// ---------------------------------------------------------------------------

export function computeTopStrengths(dimensionScores: DimensionScores): string[] {
  return Object.entries(dimensionScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([dim]) => dim);
}

// ---------------------------------------------------------------------------
// 4. computeGrowthAreas
// ---------------------------------------------------------------------------

export function computeGrowthAreas(dimensionScores: DimensionScores): string[] {
  return Object.entries(dimensionScores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)
    .map(([dim]) => dim);
}

// ---------------------------------------------------------------------------
// 5. generateRecommendedActions
// ---------------------------------------------------------------------------

const ACTION_MAP: Record<string, string[]> = {
  el_puente: [
    'Facilita un dialogo entre personas con perspectivas opuestas en tu entorno',
    'Conecta dos organizaciones de tu zona que trabajan temas complementarios',
    'Organiza un encuentro entre vecinos que no se conocen para un objetivo comun',
  ],
  el_vigia: [
    'Pedí un informe publico sobre el presupuesto de tu municipio y compartilo',
    'Asisti a la proxima audiencia publica o sesion del concejo deliberante',
    'Crea un hilo en redes explicando un tema civico que investigaste',
  ],
  la_raiz: [
    'Sumarte como voluntario/a regular en un comedor, biblioteca o centro comunitario',
    'Organiza una jornada solidaria en tu barrio este mes',
    'Identifica una necesidad concreta de tu cuadra y coordina una solucion con vecinos',
  ],
  el_catalizador: [
    'Lidera una campana de accion directa sobre un problema local concreto',
    'Convoca a 5 personas para un proyecto comunitario y defini los primeros pasos',
    'Propon una solucion innovadora a un problema persistente de tu zona',
  ],
  el_sembrador: [
    'Asisti a una reunion comunitaria o asamblea vecinal como oyente activo',
    'Completa un curso sobre participacion ciudadana esta semana',
    'Conversa con un referente comunitario de tu zona sobre como empezar',
  ],
  el_espejo: [
    'Facilita una ronda de reflexion con amigos o vecinos sobre ciudadania',
    'Escribi tus 3 compromisos civicos concretos para este mes y compartilos',
    'Propon un espacio de dialogo abierto sobre un tema que divida opiniones',
  ],
};

// Growth-area-based actions (keyed by actual dimension keys)
const GROWTH_ACTION_MAP: Record<string, string> = {
  motivacion_civica: 'Lee una historia de alguien que genero cambio en su comunidad y reflexiona que te moviliza a vos',
  estilo_liderazgo: 'Practica facilitar una conversacion grupal donde todos tengan voz',
  valores_prioridades: 'Escribi tus 5 valores civicos principales y ordenalos por importancia',
  fortalezas_civicas: 'Asisti a una asamblea vecinal o reunion del consejo deliberante como oyente activo',
  areas_crecimiento: 'Inscribite en un taller o curso sobre participacion ciudadana',
  barreras_compromiso: 'Identifica tu barrera principal y hace una sola accion pequeña para superarla esta semana',
};

export function generateRecommendedActions(
  archetype: string,
  growthAreas: string[],
): string[] {
  const actions: string[] = [];

  // Add archetype-specific actions (up to 3)
  const archetypeActions = ACTION_MAP[archetype] ?? [];
  actions.push(...archetypeActions.slice(0, 3));

  // Add growth-area actions (up to 2)
  for (const area of growthAreas) {
    const action = GROWTH_ACTION_MAP[area];
    if (action && !actions.includes(action)) {
      actions.push(action);
    }
  }

  // Ensure we return between 3-5 actions
  return actions.slice(0, 5);
}

// ---------------------------------------------------------------------------
// 6. computeCivicProfile (main orchestrator)
// ---------------------------------------------------------------------------

export async function computeCivicProfile(
  userId: number,
  assessmentId: number,
): Promise<CivicProfileResult> {
  // Fetch responses from civic_assessment_responses
  const responses = await db
    .select()
    .from(civicAssessmentResponses)
    .where(eq(civicAssessmentResponses.assessmentId, assessmentId));

  const rawResponses: RawResponse[] = responses.map((r) => ({
    questionKey: r.questionKey,
    dimensionKey: r.dimensionKey,
    responseType: r.responseType as 'scale' | 'choice' | 'rank',
    responseValue: r.responseValue,
    responseChoice: r.responseChoice,
    responseRank: r.responseRank,
  }));

  // Compute all profile components
  const dimensionScores = computeDimensionScores(rawResponses);
  const archetype = determineArchetype(dimensionScores);
  const topStrengths = computeTopStrengths(dimensionScores);
  const growthAreas = computeGrowthAreas(dimensionScores);
  const recommendedActions = generateRecommendedActions(archetype, growthAreas);

  const now = new Date().toISOString();

  // Upsert the civic_profiles record
  const existing = await db
    .select()
    .from(civicProfiles)
    .where(eq(civicProfiles.assessmentId, assessmentId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(civicProfiles)
      .set({
        archetype,
        dimensionScores: JSON.stringify(dimensionScores),
        topStrengths: JSON.stringify(topStrengths),
        growthAreas: JSON.stringify(growthAreas),
        recommendedActions: JSON.stringify(recommendedActions),
        updatedAt: now,
      })
      .where(eq(civicProfiles.assessmentId, assessmentId));
  } else {
    await db.insert(civicProfiles).values({
      userId,
      assessmentId,
      archetype,
      dimensionScores: JSON.stringify(dimensionScores),
      topStrengths: JSON.stringify(topStrengths),
      growthAreas: JSON.stringify(growthAreas),
      recommendedActions: JSON.stringify(recommendedActions),
      createdAt: now,
      updatedAt: now,
    });
  }

  // Mark assessment as completed
  await db
    .update(civicAssessments)
    .set({
      status: 'completed',
      completedAt: now,
    })
    .where(eq(civicAssessments.id, assessmentId));

  return {
    userId,
    assessmentId,
    archetype,
    dimensionScores,
    topStrengths,
    growthAreas,
    recommendedActions,
  };
}

// ---------------------------------------------------------------------------
// 7. getCommunityComparison
// ---------------------------------------------------------------------------

export async function getCommunityComparison(
  userId: number,
): Promise<Record<string, number>> {
  // Fetch the user's latest profile
  const userProfile = await db
    .select()
    .from(civicProfiles)
    .where(eq(civicProfiles.userId, userId))
    .orderBy(desc(civicProfiles.createdAt))
    .limit(1);

  if (userProfile.length === 0) {
    throw new Error('No civic profile found for this user');
  }

  const userScores: DimensionScores = JSON.parse(
    userProfile[0].dimensionScores as string,
  );

  // Fetch all profiles for comparison
  const allProfiles = await db
    .select({
      dimensionScores: civicProfiles.dimensionScores,
    })
    .from(civicProfiles);

  if (allProfiles.length <= 1) {
    // Only the user's own profile exists; percentile is 100 for all
    const percentiles: Record<string, number> = {};
    for (const dim of Object.keys(userScores)) {
      percentiles[dim] = 100;
    }
    return percentiles;
  }

  // Parse all dimension scores
  const allParsed: DimensionScores[] = allProfiles.map((p) =>
    JSON.parse(p.dimensionScores as string),
  );

  // Compute percentile per dimension
  const percentiles: Record<string, number> = {};

  for (const dim of Object.keys(userScores)) {
    const userValue = userScores[dim] ?? 0;

    // Collect all values for this dimension
    const allValues = allParsed
      .map((scores) => scores[dim] ?? 0)
      .sort((a, b) => a - b);

    // Count how many are below the user's score
    const belowCount = allValues.filter((v) => v < userValue).length;
    const equalCount = allValues.filter((v) => v === userValue).length;

    // Percentile rank formula: (B + 0.5 * E) / N * 100
    const percentile =
      Math.round(
        ((belowCount + 0.5 * equalCount) / allValues.length) * 100 * 100,
      ) / 100;

    percentiles[dim] = Math.max(0, Math.min(100, percentile));
  }

  return percentiles;
}
