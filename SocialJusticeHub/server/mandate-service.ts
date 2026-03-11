/**
 * Mandate Service — El Mandato Vivo
 *
 * Synthesizes collective data (dreams, values, needs, bastas, commitments, resources)
 * into structured territory mandates using AI.
 *
 * The data writes the mandate. Nobody votes. Nobody debates. It emerges.
 */

import Anthropic from '@anthropic-ai/sdk';
import { storage } from './storage';

interface MandateDiagnosis {
  priorities: Array<{
    rank: number;
    theme: string;
    description: string;
    convergencePercent: number;
    voiceCount: number;
    sampleQuotes: string[];
  }>;
}

interface MandateResources {
  categories: Array<{
    category: string;
    count: number;
    description: string;
  }>;
  totalVolunteers: number;
}

interface MandateGaps {
  critical: Array<{
    theme: string;
    needCount: number;
    resourceCount: number;
    gap: number;
    urgency: 'critical' | 'high' | 'medium';
  }>;
}

interface MandateActions {
  actions: Array<{
    title: string;
    description: string;
    needsAddressed: string;
    resourcesRequired: string;
    estimatedImpact: string;
    precedent?: string;
  }>;
}

interface GeneratedMandate {
  diagnosis: MandateDiagnosis;
  availableResources: MandateResources;
  gaps: MandateGaps;
  suggestedActions: MandateActions;
  rawSummary: string;
  convergenceScore: number;
  voiceCount: number;
}

// Theme labels for human-readable output
const THEME_LABELS: Record<string, string> = {
  systemic: 'Transformación Sistémica',
  values: 'Valores Fundamentales',
  action: 'Acción y Agencia',
  development: 'Desarrollo Humano',
  justice: 'Justicia y Derechos',
  economy: 'Economía y Recursos',
  health: 'Salud y Vida',
  community: 'Comunidad y Colectivo',
  future: 'Futuro y Visión',
};

const RESOURCE_CATEGORY_LABELS: Record<string, string> = {
  legal: 'Legal',
  medical: 'Salud',
  education: 'Educación',
  tech: 'Tecnología',
  construction: 'Construcción',
  agriculture: 'Agricultura',
  communication: 'Comunicación',
  admin: 'Administración',
  transport: 'Transporte',
  space: 'Espacio Físico',
  equipment: 'Equipamiento',
  other: 'Otros',
};

/**
 * Generate a mandate for a territory by synthesizing all data
 */
export async function generateMandate(
  territoryLevel: 'barrio' | 'city' | 'province' | 'national',
  territoryName: string,
  province?: string,
  city?: string,
): Promise<GeneratedMandate> {
  // 1. Gather all data
  const [dreams, commitmentsRes, resources] = await Promise.all([
    storage.getDreams(),
    fetchCommitments(),
    storage.getUserResources(),
  ]);

  // 2. Filter by territory
  const territoryDreams = filterByTerritory(dreams, territoryName, territoryLevel);
  const territoryResources = filterResourcesByTerritory(resources, territoryName, territoryLevel);

  // 3. Analyze data locally first (fast, no API call)
  const localAnalysis = analyzeLocally(territoryDreams, territoryResources);

  // 4. If we have an API key, use AI to synthesize. Otherwise, use local analysis.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && localAnalysis.voiceCount >= 3) {
    try {
      return await synthesizeWithAI(apiKey, territoryName, territoryLevel, localAnalysis);
    } catch (error) {
      console.error('AI synthesis failed, falling back to local analysis:', error);
      return localAnalysis;
    }
  }

  return localAnalysis;
}

async function fetchCommitments() {
  // Access commitments through the storage layer
  try {
    const db = await import('./db');
    const schema = await import('../shared/schema');
    const { desc } = await import('drizzle-orm');
    const commitments = await db.db.select().from(schema.userCommitments).orderBy(desc(schema.userCommitments.createdAt));
    return commitments;
  } catch {
    return [];
  }
}

function filterByTerritory(items: any[], territoryName: string, level: string): any[] {
  if (level === 'national') return items;
  return items.filter((item) => {
    const loc = (item.location || '').toLowerCase();
    const name = territoryName.toLowerCase();
    return loc.includes(name);
  });
}

function filterResourcesByTerritory(resources: any[], territoryName: string, level: string): any[] {
  if (level === 'national') return resources;
  return resources.filter((r) => {
    const loc = [r.city, r.province, r.location].filter(Boolean).join(' ').toLowerCase();
    return loc.includes(territoryName.toLowerCase());
  });
}

function analyzeLocally(dreams: any[], resources: any[]): GeneratedMandate {
  // Theme keyword matching (same as frontend hooks)
  const THEME_KEYWORDS: Record<string, string[]> = {
    systemic: ['transformacion', 'cambio', 'revolucion', 'reforma', 'sistema', 'estructura'],
    values: ['transparencia', 'justicia', 'equidad', 'dignidad', 'respeto', 'honestidad', 'solidaridad'],
    action: ['accion', 'participacion', 'movilizacion', 'liderazgo', 'iniciativa', 'compromiso'],
    development: ['educacion', 'formacion', 'capacitacion', 'aprendizaje', 'conocimiento', 'desarrollo'],
    justice: ['derechos', 'libertad', 'democracia', 'acceso', 'oportunidad', 'proteccion'],
    economy: ['trabajo', 'empleo', 'economia', 'produccion', 'salario', 'inversion'],
    health: ['salud', 'cuidado', 'atencion', 'prevencion', 'tratamiento', 'vida'],
    community: ['comunidad', 'pueblo', 'sociedad', 'colectivo', 'ciudadania', 'barrio', 'territorio'],
    future: ['futuro', 'vision', 'horizonte', 'esperanza', 'sueno', 'meta', 'proposito'],
  };

  const normalize = (w: string) =>
    w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');

  // Count theme hits from needs and bastas
  const themeHits: Record<string, { count: number; quotes: string[] }> = {};
  for (const tk of Object.keys(THEME_KEYWORDS)) {
    themeHits[tk] = { count: 0, quotes: [] };
  }

  let voiceCount = 0;
  const types = ['need', 'basta', 'dream', 'value'] as const;

  dreams.forEach((entry) => {
    for (const type of types) {
      const text = entry[type] as string | null;
      if (!text) continue;
      voiceCount++;

      const words = text.split(/\s+/).map(normalize).filter((w) => w.length > 3);
      for (const tk of Object.keys(THEME_KEYWORDS)) {
        const matched = words.some((w) =>
          THEME_KEYWORDS[tk].some((kw) => w.includes(kw) || kw.includes(w))
        );
        if (matched) {
          themeHits[tk].count++;
          if (themeHits[tk].quotes.length < 3) {
            themeHits[tk].quotes.push(text.length > 120 ? text.slice(0, 120) + '…' : text);
          }
        }
      }
    }
  });

  // Build priorities
  const priorities = Object.entries(themeHits)
    .filter(([, v]) => v.count > 0)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([theme, data], i) => ({
      rank: i + 1,
      theme: THEME_LABELS[theme] || theme,
      description: `${data.count} declaraciones convergen en ${THEME_LABELS[theme] || theme}`,
      convergencePercent: voiceCount > 0 ? Math.round((data.count / voiceCount) * 100) : 0,
      voiceCount: data.count,
      sampleQuotes: data.quotes,
    }));

  // Categorize resources
  const resCats: Record<string, number> = {};
  resources.forEach((r) => {
    const cat = r.category || 'other';
    resCats[cat] = (resCats[cat] || 0) + 1;
  });

  const resourceCategories = Object.entries(resCats)
    .map(([category, count]) => ({
      category: RESOURCE_CATEGORY_LABELS[category] || category,
      count,
      description: `${count} persona(s) con capacidad en ${RESOURCE_CATEGORY_LABELS[category] || category}`,
    }))
    .sort((a, b) => b.count - a.count);

  // Compute gaps
  const RESOURCE_THEME_MAP: Record<string, string[]> = {
    legal: ['justice', 'systemic'],
    medical: ['health'],
    education: ['development', 'future'],
    tech: ['systemic', 'action', 'economy'],
    construction: ['community', 'economy'],
    agriculture: ['economy', 'health'],
    communication: ['action', 'values', 'community'],
    admin: ['systemic', 'economy'],
    transport: ['community', 'economy'],
    space: ['community', 'action'],
    equipment: ['economy', 'action'],
  };

  const resourceThemeCounts: Record<string, number> = {};
  resources.forEach((r) => {
    const themes = RESOURCE_THEME_MAP[r.category] || [];
    themes.forEach((t) => {
      resourceThemeCounts[t] = (resourceThemeCounts[t] || 0) + 1;
    });
  });

  const gaps = Object.entries(themeHits)
    .map(([theme, data]) => ({
      theme: THEME_LABELS[theme] || theme,
      needCount: data.count,
      resourceCount: resourceThemeCounts[theme] || 0,
      gap: data.count - (resourceThemeCounts[theme] || 0),
      urgency: (data.count - (resourceThemeCounts[theme] || 0) > 5
        ? 'critical'
        : data.count - (resourceThemeCounts[theme] || 0) > 2
        ? 'high'
        : 'medium') as 'critical' | 'high' | 'medium',
    }))
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5);

  // Generate suggested actions from gaps
  const suggestedActions = gaps.slice(0, 3).map((gap) => ({
    title: `Programa de ${gap.theme}`,
    description: `${gap.needCount} personas expresaron necesidad en ${gap.theme}. ${gap.resourceCount > 0 ? `Hay ${gap.resourceCount} recursos disponibles.` : 'Se necesitan recursos externos.'}`,
    needsAddressed: gap.theme,
    resourcesRequired: gap.resourceCount > 0 ? 'Parcialmente cubiertos' : 'Se requiere movilización',
    estimatedImpact: `Impacto directo en ${gap.needCount} personas`,
  }));

  // Build summary
  const topPriority = priorities[0]?.theme || 'Sin datos suficientes';
  const rawSummary = voiceCount > 0
    ? `Mandato basado en ${voiceCount} declaraciones. Prioridad #1: ${topPriority}. ${resources.length} recursos declarados. ${gaps.length} brechas identificadas.`
    : 'Aún no hay suficientes datos para generar un mandato. Se necesitan más declaraciones en el mapa.';

  const convergenceScore = priorities.length > 0
    ? Math.round(priorities.reduce((sum, p) => sum + p.convergencePercent, 0) / priorities.length)
    : 0;

  return {
    diagnosis: { priorities },
    availableResources: { categories: resourceCategories, totalVolunteers: resources.length },
    gaps: { critical: gaps },
    suggestedActions: { actions: suggestedActions },
    rawSummary,
    convergenceScore,
    voiceCount,
  };
}

async function synthesizeWithAI(
  apiKey: string,
  territoryName: string,
  territoryLevel: string,
  localAnalysis: GeneratedMandate,
): Promise<GeneratedMandate> {
  const client = new Anthropic({ apiKey });

  const prompt = `Eres el sintetizador del Mandato Vivo — un sistema que traduce la voz colectiva del pueblo en mandatos accionables. No interpretas, no opinas, no agregas ideología. Solo ARTICULÁS lo que los datos dicen.

TERRITORIO: ${territoryName} (nivel: ${territoryLevel})
DATOS RECOPILADOS: ${localAnalysis.voiceCount} declaraciones, ${localAnalysis.availableResources.totalVolunteers} recursos declarados.

DIAGNÓSTICO LOCAL:
${JSON.stringify(localAnalysis.diagnosis.priorities, null, 2)}

RECURSOS DISPONIBLES:
${JSON.stringify(localAnalysis.availableResources.categories, null, 2)}

BRECHAS IDENTIFICADAS:
${JSON.stringify(localAnalysis.gaps.critical, null, 2)}

Genera un RESUMEN EJECUTIVO del mandato en español rioplatense (máximo 300 palabras) que incluya:
1. Las top 3 prioridades con evidencia de convergencia
2. Los recursos disponibles y qué pueden cubrir
3. Las brechas críticas que requieren acción
4. 2-3 acciones concretas sugeridas que conecten necesidades con recursos disponibles

El tono debe ser: directo, basado en datos, sin retórica vacía. Como un informe de inteligencia que un coordinador territorial pueda usar para actuar HOY.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const aiSummary = response.content[0].type === 'text' ? response.content[0].text : localAnalysis.rawSummary;

  return {
    ...localAnalysis,
    rawSummary: aiSummary,
  };
}

/**
 * Generate mandate and save to database
 */
export async function generateAndSaveMandate(
  territoryLevel: 'barrio' | 'city' | 'province' | 'national',
  territoryName: string,
  province?: string,
  city?: string,
): Promise<any> {
  const mandate = await generateMandate(territoryLevel, territoryName, province, city);

  // Check if mandate already exists for this territory
  const existing = await storage.getMandateByTerritory(territoryLevel, territoryName);

  if (existing) {
    // Update existing mandate with new version
    const updated = await storage.updateMandate(existing.id, {
      version: (existing.version || 0) + 1,
      voiceCount: mandate.voiceCount,
      convergenceScore: mandate.convergenceScore,
      diagnosis: JSON.stringify(mandate.diagnosis),
      availableResources: JSON.stringify(mandate.availableResources),
      gaps: JSON.stringify(mandate.gaps),
      suggestedActions: JSON.stringify(mandate.suggestedActions),
      rawSummary: mandate.rawSummary,
      generatedAt: new Date().toISOString(),
    });
    return { mandate: updated, generated: mandate };
  }

  // Create new mandate
  const created = await storage.createMandate({
    territoryLevel,
    territoryName,
    province: province || null,
    city: city || null,
    voiceCount: mandate.voiceCount,
    convergenceScore: mandate.convergenceScore,
    diagnosis: JSON.stringify(mandate.diagnosis),
    availableResources: JSON.stringify(mandate.availableResources),
    gaps: JSON.stringify(mandate.gaps),
    suggestedActions: JSON.stringify(mandate.suggestedActions),
    rawSummary: mandate.rawSummary,
    status: 'draft',
  });

  return { mandate: created, generated: mandate };
}
