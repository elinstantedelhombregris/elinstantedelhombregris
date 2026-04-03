// Mission Signal Matcher — scores how relevant a dream/declaration is to a given mission
// Pure functions only, no side effects

import type { MissionDefinition } from './mission-registry';

export interface DreamLike {
  dream?: string | null;
  value?: string | null;
  need?: string | null;
  basta?: string | null;
  type?: string;
}

export interface SignalScore {
  missionSlug: string;
  score: number;
  matchedKeywords: string[];
}

// Hardcoded domain keywords per mission slug
const MISSION_KEYWORDS: Record<string, string[]> = {
  'supervivencia-digna': [
    'agua', 'vivienda', 'salud', 'hospital', 'energia', 'seguridad', 'alquiler',
    'comida', 'alimentacion', 'refugio', 'techo', 'medicina', 'violencia', 'barrio',
    'luz', 'gas', 'potable', 'saneamiento', 'calefaccion',
  ],
  'territorio-legible': [
    'datos', 'digital', 'transparencia', 'mandato', 'senal', 'informacion', 'mapa',
    'tecnologia', 'plataforma', 'algoritmo', 'privacidad', 'internet', 'conectividad',
    'software',
  ],
  'produccion-y-suelo-vivo': [
    'trabajo', 'empleo', 'produccion', 'suelo', 'campo', 'agricultura', 'cooperativa',
    'empresa', 'fabrica', 'industria', 'cosecha', 'ganado', 'tierra', 'semilla',
    'riego', 'obrero', 'salario',
  ],
  'infancia-escuela-cultura': [
    'educacion', 'escuela', 'nino', 'infancia', 'juventud', 'cultura', 'maestro',
    'docente', 'universidad', 'colegio', 'jardin', 'guarderia', 'arte', 'musica',
    'libro', 'biblioteca', 'estudiante',
  ],
  'instituciones-y-futuro': [
    'justicia', 'corrupcion', 'juez', 'tribunal', 'ley', 'constitucion', 'droga',
    'narcotrafico', 'moneda', 'peso', 'dolar', 'inflacion', 'soberania', 'congreso',
    'senador', 'diputado', 'policia', 'democracia',
  ],
};

// Minimum word length to be considered a significant keyword from text fields
const MIN_WORD_LENGTH = 4;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áà]/g, 'a')
    .replace(/[éè]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óò]/g, 'o')
    .replace(/[úù]/g, 'u')
    .replace(/ñ/g, 'n');
}

function extractWords(text: string, minLength: number = MIN_WORD_LENGTH): string[] {
  return normalize(text)
    .split(/\W+/)
    .filter(w => w.length >= minLength);
}

// Extract the suffix of a PLAN name as a keyword (e.g. "PLANAGUA" -> "agua")
function planToKeyword(plan: string): string | null {
  const match = plan.match(/^PLAN(.+)$/i);
  if (match && match[1].length >= 2) {
    return match[1].toLowerCase();
  }
  return null;
}

function buildMissionKeywords(mission: MissionDefinition): string[] {
  const keywordSet = new Set<string>();

  // Hardcoded domain keywords for this mission
  const domainKeywords = MISSION_KEYWORDS[mission.slug] ?? [];
  for (const kw of domainKeywords) {
    keywordSet.add(normalize(kw));
  }

  // Extract keywords from plan names
  for (const plan of mission.plans) {
    const kw = planToKeyword(plan);
    if (kw) keywordSet.add(kw);
    // Also add the normalized full plan name as a keyword
    keywordSet.add(normalize(plan));
  }

  // Extract significant words from description
  for (const word of extractWords(mission.description)) {
    keywordSet.add(word);
  }

  // Extract significant words from whatHurts
  for (const word of extractWords(mission.whatHurts)) {
    keywordSet.add(word);
  }

  // Extract significant words from citizenCanDo
  const citizenText = mission.citizenCanDo.join(' ');
  for (const word of extractWords(citizenText)) {
    keywordSet.add(word);
  }

  return Array.from(keywordSet);
}

function buildDreamText(dream: DreamLike): string {
  return normalize([
    dream.dream ?? '',
    dream.value ?? '',
    dream.need ?? '',
    dream.basta ?? '',
  ].join(' '));
}

/**
 * Pure function: scores a dream against a single mission.
 * Returns a SignalScore with the number of unique keyword matches.
 */
export function scoreDreamForMission(dream: DreamLike, mission: MissionDefinition): SignalScore {
  const dreamText = buildDreamText(dream);
  const keywords = buildMissionKeywords(mission);

  const matchedKeywords: string[] = [];

  for (const keyword of keywords) {
    if (keyword.length === 0) continue;
    if (dreamText.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  return {
    missionSlug: mission.slug,
    score: matchedKeywords.length,
    matchedKeywords,
  };
}

/**
 * Convenience function: scores a dream against all provided missions,
 * returns results sorted by score descending.
 */
export function matchDreamToMissions(dream: DreamLike, missions: MissionDefinition[]): SignalScore[] {
  return missions
    .map(mission => scoreDreamForMission(dream, mission))
    .sort((a, b) => b.score - a.score);
}
