/**
 * Civic assessment question catalog + scoring.
 *
 * The questions live here (not in the DB) because they change in
 * lockstep with app releases. Versioning lets old assessments keep
 * scoring against the question set they were taken against.
 */

export type CivicAxis = 'engagement' | 'knowledge' | 'impact' | 'community';

export interface CivicQuestion {
  id: string;
  axis: CivicAxis;
  prompt: string;
  /** 1..5 Likert scale; the meaning is "qué tan de acuerdo estás" by default. */
  scale: 'likert5';
}

export const CIVIC_QUESTIONS_VERSION = '2026-05-08';

export const CIVIC_QUESTIONS: readonly CivicQuestion[] = [
  // Engagement — qué tan activo estás
  { id: 'eng-01', axis: 'engagement', prompt: 'Voto en cada elección, sea local o nacional.', scale: 'likert5' },
  { id: 'eng-02', axis: 'engagement', prompt: 'Sigo activamente noticias políticas argentinas.', scale: 'likert5' },
  { id: 'eng-03', axis: 'engagement', prompt: 'Participo en alguna asamblea, mesa de trabajo o iniciativa cívica.', scale: 'likert5' },
  { id: 'eng-04', axis: 'engagement', prompt: 'Hablo de política con otros desde el respeto y la curiosidad.', scale: 'likert5' },
  { id: 'eng-05', axis: 'engagement', prompt: 'Me siento responsable por lo que pasa en mi barrio o comunidad.', scale: 'likert5' },
  { id: 'eng-06', axis: 'engagement', prompt: 'En el último año hice algo para mejorar mi entorno (limpiar, organizar, denunciar, ayudar).', scale: 'likert5' },

  // Knowledge — qué tanto entendés
  { id: 'kno-01', axis: 'knowledge', prompt: 'Entiendo cómo funciona el sistema de gobierno argentino (3 poderes, federalismo, etc.).', scale: 'likert5' },
  { id: 'kno-02', axis: 'knowledge', prompt: 'Conozco los principales problemas estructurales de Argentina y sus causas históricas.', scale: 'likert5' },
  { id: 'kno-03', axis: 'knowledge', prompt: 'Sé distinguir información de opinión cuando leo medios o redes.', scale: 'likert5' },
  { id: 'kno-04', axis: 'knowledge', prompt: 'Conozco mis derechos civiles y cómo ejercerlos.', scale: 'likert5' },
  { id: 'kno-05', axis: 'knowledge', prompt: 'Entiendo conceptos económicos básicos (inflación, déficit, deuda, productividad).', scale: 'likert5' },
  { id: 'kno-06', axis: 'knowledge', prompt: 'Estoy al tanto de iniciativas políticas + sociales actuales (no solo de las polémicas mediáticas).', scale: 'likert5' },

  // Impact — qué tanto cambiás cosas
  { id: 'imp-01', axis: 'impact', prompt: 'Lo que hago diariamente está alineado con lo que creo que debería ser un buen ciudadano.', scale: 'likert5' },
  { id: 'imp-02', axis: 'impact', prompt: 'Cuando veo una injusticia chica, hago algo (lo nombro, lo reporto, ofrezco ayuda).', scale: 'likert5' },
  { id: 'imp-03', axis: 'impact', prompt: 'Trato de mostrar con mi propio ejemplo lo que quiero ver en otros.', scale: 'likert5' },
  { id: 'imp-04', axis: 'impact', prompt: 'En el trabajo o el estudio, hago las cosas bien aún cuando nadie me está mirando.', scale: 'likert5' },
  { id: 'imp-05', axis: 'impact', prompt: 'Dedico tiempo o recursos a una causa más grande que yo.', scale: 'likert5' },
  { id: 'imp-06', axis: 'impact', prompt: 'Cuando me equivoco públicamente, reconozco el error y corrijo.', scale: 'likert5' },

  // Community — qué tanto te conectás con otros
  { id: 'com-01', axis: 'community', prompt: 'Tengo gente de confianza con la que puedo hablar de cosas importantes.', scale: 'likert5' },
  { id: 'com-02', axis: 'community', prompt: 'Conozco a mis vecinos y nos cuidamos.', scale: 'likert5' },
  { id: 'com-03', axis: 'community', prompt: 'Pertenezco a alguna comunidad significativa (organización, grupo, club, fe, oficio).', scale: 'likert5' },
  { id: 'com-04', axis: 'community', prompt: 'Cuando alguien necesita ayuda en mi entorno, soy de los que aparecen.', scale: 'likert5' },
  { id: 'com-05', axis: 'community', prompt: 'Confío en al menos una institución (escuela, salita, biblioteca, iglesia, club).', scale: 'likert5' },
  { id: 'com-06', axis: 'community', prompt: 'Puedo discutir con respeto con alguien que piensa muy distinto a mí.', scale: 'likert5' },
];

export interface CivicScores {
  engagement: number;
  knowledge: number;
  impact: number;
  community: number;
  total: number;
}

export type CivicArchetype = 'observador' | 'participante' | 'organizador' | 'arquitecto';

/**
 * Compute axis scores (0-100) from a map of questionId → 1..5 response.
 * Missing responses count as 0.
 */
export function scoreCivic(responses: Record<string, number>): CivicScores {
  const sums: Record<CivicAxis, { sum: number; count: number }> = {
    engagement: { sum: 0, count: 0 },
    knowledge: { sum: 0, count: 0 },
    impact: { sum: 0, count: 0 },
    community: { sum: 0, count: 0 },
  };
  for (const q of CIVIC_QUESTIONS) {
    const value = responses[q.id];
    if (typeof value === 'number') {
      sums[q.axis].sum += value;
      sums[q.axis].count += 1;
    }
  }
  // Likert 1..5 → 0..100: ((avg - 1) / 4) * 100. count=0 → 0.
  const axisScore = (a: CivicAxis): number => {
    const { sum, count } = sums[a];
    if (count === 0) return 0;
    const avg = sum / count;
    return Math.round(((avg - 1) / 4) * 100);
  };
  const engagement = axisScore('engagement');
  const knowledge = axisScore('knowledge');
  const impact = axisScore('impact');
  const community = axisScore('community');
  const total = Math.round((engagement + knowledge + impact + community) / 4);
  return { engagement, knowledge, impact, community, total };
}

/**
 * Map the score profile to one of four archetypes.
 *
 *   observador   — total < 30
 *   participante — total 30-59
 *   organizador  — total 60-79 OR community ≥ 70
 *   arquitecto   — total ≥ 80 AND impact ≥ 70
 */
export function archetypeFor(scores: CivicScores): CivicArchetype {
  if (scores.total >= 80 && scores.impact >= 70) return 'arquitecto';
  if (scores.total >= 60 || scores.community >= 70) return 'organizador';
  if (scores.total >= 30) return 'participante';
  return 'observador';
}
