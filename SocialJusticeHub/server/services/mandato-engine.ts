/**
 * Mandato Engine — El Mandato Vivo
 *
 * Unified engine that merges pulse-service.ts (weekly digest generation)
 * and mandate-service.ts (territory mandate synthesis).
 *
 * Every Friday at 17:55 ART, processes all map data and generates:
 *   1. A weekly digest with proposals, patterns, and action templates
 *   2. Per-territory mandates with convergence analysis and gap detection
 *
 * Uses Claude API for deep convergence analysis.
 * No voting. No debates. The data writes the mandate.
 */

import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../storage';
import { db } from '../db';
import { dreams, userCommitments, userResources, weeklyDigests, digestProposals } from '../../shared/schema';
import { desc, gte, sql, and, eq } from 'drizzle-orm';

// -- Types ------------------------------------------------------------------

interface PulseData {
  // This week's new data
  newDreams: any[];
  newNeeds: any[];
  newBastas: any[];
  newValues: any[];
  newCommitments: any[];
  newResources: any[];
  // Cumulative totals
  allDreams: any[];
  allCommitments: any[];
  allResources: any[];
  // Previous pulse for comparison
  previousPulse: any | null;
  // Recurring proposals (3+ weeks)
  recurringProposals: any[];
}

interface GeneratedProposal {
  title: string;
  summary: string;
  fullAnalysis: string;
  evidence: {
    voiceCount: number;
    territories: string[];
    quotes: string[];
    convergencePercent: number;
  };
  targetCategory: string;
  targetDescription: string;
  territory: string;
  urgency: 'critica' | 'importante' | 'oportunidad';
  precedent: string;
  suggestedActionType: string;
  actionTemplate: string;
}

interface TerritoryMandateResult {
  territoryName: string;
  territoryLevel: 'barrio' | 'city' | 'province' | 'national';
  convergenceScore: number;
  voiceCount: number;
  priorities: Array<{
    rank: number;
    theme: string;
    description: string;
    convergencePercent: number;
    voiceCount: number;
    sampleQuotes: string[];
  }>;
  gaps: Array<{
    theme: string;
    needCount: number;
    resourceCount: number;
    gap: number;
    urgency: 'critical' | 'high' | 'medium';
  }>;
  suggestedActions: Array<{
    title: string;
    description: string;
    needsAddressed: string;
    resourcesRequired: string;
    estimatedImpact: string;
    precedent: string;
  }>;
  rawSummary: string;
}

interface PulseResult {
  thermometer: {
    totalNewVoices: number;
    newDreams: number;
    newNeeds: number;
    newBastas: number;
    newValues: number;
    newCommitments: number;
    newResources: number;
  };
  emergingThemes: Array<{
    theme: string;
    trend: 'up' | 'stable' | 'down' | 'new';
    count: number;
    description: string;
  }>;
  patterns: Array<{
    pattern: string;
    territories: string[];
    description: string;
    evidence: string[];
  }>;
  proposals: GeneratedProposal[];
  territoryMandates: TerritoryMandateResult[];
  unconnectedResources: Array<{
    resource: string;
    category: string;
    suggestion: string;
  }>;
  seedOfWeek: {
    title: string;
    description: string;
    inspiration: string;
  };
  comparisonWithPrevious: {
    trends: Array<{ theme: string; direction: string; detail: string }>;
    escalations: string[];
  };
  fullAnalysis: string;
}

// -- Helpers ----------------------------------------------------------------

function getWeekBounds(): { start: Date; end: Date; weekNumber: number; year: number } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  // Week starts Monday
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  // ISO week number
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((start.getTime() - jan1.getTime()) / 86400000);
  const weekNumber = Math.ceil((days + jan1.getDay() + 1) / 7);

  return { start, end, weekNumber, year: now.getFullYear() };
}

function extractTerritory(item: any): string {
  return item.location || item.province || item.city || 'Sin ubicacion';
}

// -- Data Gathering ---------------------------------------------------------

async function gatherPulseData(): Promise<PulseData> {
  const { start } = getWeekBounds();
  const weekStartISO = start.toISOString();

  // Fetch all data
  const [allDreams, allResources] = await Promise.all([
    storage.getDreams(),
    storage.getUserResources(),
  ]);

  // Fetch commitments
  let allCommitments: any[] = [];
  try {
    allCommitments = await db.select().from(userCommitments).orderBy(desc(userCommitments.createdAt));
  } catch { /* empty */ }

  // Filter this week's new data
  const isThisWeek = (createdAt: string | null) => {
    if (!createdAt) return false;
    return new Date(createdAt) >= new Date(weekStartISO);
  };

  const newDreamEntries = allDreams.filter(d => isThisWeek(d.createdAt));

  // Separate by type
  const newDreams = newDreamEntries.filter(d => d.type === 'dream');
  const newNeeds = newDreamEntries.filter(d => d.type === 'need');
  const newBastas = newDreamEntries.filter(d => d.type === 'basta');
  const newValues = newDreamEntries.filter(d => d.type === 'value');
  const newCommitments = allCommitments.filter(c => isThisWeek(c.createdAt));
  const newResources = allResources.filter(r => isThisWeek(r.createdAt));

  // Get previous pulse
  const previousPulses = await db.select()
    .from(weeklyDigests)
    .where(eq(weeklyDigests.status, 'completed'))
    .orderBy(desc(weeklyDigests.createdAt))
    .limit(1);
  const previousPulse = previousPulses[0] || null;

  // Get recurring proposals (active 3+ weeks)
  const recurringProposals = await db.select()
    .from(digestProposals)
    .where(
      and(
        gte(digestProposals.weeksActive, 3),
        sql`${digestProposals.status} NOT IN ('completada', 'archivada')`
      )
    );

  return {
    newDreams, newNeeds, newBastas, newValues,
    newCommitments, newResources,
    allDreams, allCommitments, allResources,
    previousPulse, recurringProposals,
  };
}

// -- Territory Grouping -----------------------------------------------------

function groupByTerritory(data: PulseData): Record<string, { dreams: any[]; resources: any[]; commitments: any[] }> {
  const territoryGroups: Record<string, { dreams: any[]; resources: any[]; commitments: any[] }> = {};

  for (const d of data.allDreams) {
    const territory = d.location || d.province || 'Sin ubicacion';
    if (!territoryGroups[territory]) territoryGroups[territory] = { dreams: [], resources: [], commitments: [] };
    territoryGroups[territory].dreams.push(d);
  }

  for (const r of data.allResources) {
    const territory = r.province || r.city || r.location || 'Sin ubicacion';
    if (!territoryGroups[territory]) territoryGroups[territory] = { dreams: [], resources: [], commitments: [] };
    territoryGroups[territory].resources.push(r);
  }

  for (const c of data.allCommitments) {
    const territory = (c as any).location || (c as any).province || 'Sin ubicacion';
    if (!territoryGroups[territory]) territoryGroups[territory] = { dreams: [], resources: [], commitments: [] };
    territoryGroups[territory].commitments.push(c);
  }

  return territoryGroups;
}

function buildTerritorySummary(groups: Record<string, { dreams: any[]; resources: any[]; commitments: any[] }>): string {
  const lines: string[] = [];

  const sorted = Object.entries(groups)
    .filter(([name]) => name !== 'Sin ubicacion')
    .sort(([, a], [, b]) => (b.dreams.length + b.resources.length) - (a.dreams.length + a.resources.length));

  for (const [territory, group] of sorted) {
    const dreamTypes = {
      dream: group.dreams.filter(d => d.type === 'dream').length,
      need: group.dreams.filter(d => d.type === 'need').length,
      basta: group.dreams.filter(d => d.type === 'basta').length,
      value: group.dreams.filter(d => d.type === 'value').length,
    };
    const totalVoices = dreamTypes.dream + dreamTypes.need + dreamTypes.basta + dreamTypes.value;

    lines.push(`\n--- ${territory} (${totalVoices} voces, ${group.resources.length} recursos) ---`);
    if (dreamTypes.dream > 0) lines.push(`  Suenos: ${dreamTypes.dream}`);
    if (dreamTypes.need > 0) lines.push(`  Necesidades: ${dreamTypes.need}`);
    if (dreamTypes.basta > 0) lines.push(`  Bastas: ${dreamTypes.basta}`);
    if (dreamTypes.value > 0) lines.push(`  Valores: ${dreamTypes.value}`);
    if (group.resources.length > 0) lines.push(`  Recursos: ${group.resources.length}`);
    if (group.commitments.length > 0) lines.push(`  Compromisos: ${group.commitments.length}`);

    // Sample quotes per type (max 3 each)
    const sampleDreams = group.dreams.filter(d => d.type === 'dream').slice(0, 3);
    const sampleNeeds = group.dreams.filter(d => d.type === 'need').slice(0, 3);
    const sampleBastas = group.dreams.filter(d => d.type === 'basta').slice(0, 3);

    if (sampleDreams.length > 0) {
      lines.push(`  Citas suenos: ${JSON.stringify(sampleDreams.map((d: any) => (d.dream || '').slice(0, 150)))}`);
    }
    if (sampleNeeds.length > 0) {
      lines.push(`  Citas necesidades: ${JSON.stringify(sampleNeeds.map((d: any) => (d.need || '').slice(0, 150)))}`);
    }
    if (sampleBastas.length > 0) {
      lines.push(`  Citas bastas: ${JSON.stringify(sampleBastas.map((d: any) => (d.basta || '').slice(0, 150)))}`);
    }
  }

  // Sin ubicacion summary
  const sinUbicacion = groups['Sin ubicacion'];
  if (sinUbicacion && sinUbicacion.dreams.length > 0) {
    lines.push(`\n--- Sin ubicacion (${sinUbicacion.dreams.length} voces sin territorio asignado) ---`);
  }

  return lines.join('\n');
}

// -- Claude AI Synthesis ----------------------------------------------------

const MANDATO_SYSTEM_PROMPT = `Sos el Motor de Convergencia de "El Mandato Vivo" — el sistema de inteligencia colectiva del proyecto El Instante del Hombre Gris.

Tu funcion es UNICA y PRECISA: transformar las voces crudas del pueblo (suenos, necesidades, bastas, valores, compromisos y recursos declarados en el mapa colaborativo) en DOS productos:

1. EL PULSO SEMANAL — un analisis profundo de lo que emerge de los datos esta semana, con propuestas concretas y accionables dirigidas a destinatarios especificos.
2. MANDATOS TERRITORIALES — por cada territorio con 3 o mas voces, un mandato estructurado que sintetiza las prioridades, brechas y acciones sugeridas para ese territorio.

═══ PRINCIPIOS INNEGOCIABLES ═══

- CERO INTERPRETACION IDEOLOGICA: no agregas, no filtras, no editorializas. Articulás lo que los datos dicen. Si 47 personas piden agua potable en Tucumán, eso es un mandato — no una "demanda social" ni una "reivindicación". Es un dato.
- CERO VOTACION: el sistema no funciona por mayoría. Funciona por convergencia. Si 3 personas en un barrio dicen lo mismo sin conocerse, eso pesa más que 100 firmas en una petición genérica.
- CONVERGENCIA > POPULARIDAD: buscá patrones que se repiten entre personas que NO se coordinaron. Esa es la señal real.
- DATOS HABLAN SOLOS: cada propuesta debe ser AUTOEVIDENTE desde los datos. Si alguien lee la evidencia y no llega a la misma conclusión, la propuesta está mal fundamentada.
- ESCALAMIENTO TEMPORAL: si una propuesta aparece 3+ semanas seguidas sin acción, escalá su urgencia automáticamente. El sistema tiene memoria.
- GRANULARIDAD TERRITORIAL: agrupá las voces por territorio (barrio, ciudad, provincia, nacional). Un mandato territorial es más poderoso que uno genérico porque tiene nombre y apellido geográfico.
- NIVEL DE GOBIERNO: para cada mandato territorial, identificá qué nivel de gobierno debería responder (municipal, provincial, nacional) o si es algo que la propia comunidad puede resolver por autogestión.

═══ IDENTIDAD Y TONO ═══

- Hablá en español rioplatense, directo y sin sarasa
- Sé riguroso como un analista de datos pero apasionado como alguien que entiende que detrás de cada dato hay una persona
- No uses lenguaje burocrático ni academicista — escribí para que lo entienda cualquiera desde el celular
- Sé tan extenso como sea necesario para que cada propuesta sea de altísima calidad — no hay límite de palabras
- Cada propuesta debe poder imprimirse y entregarse tal cual a un funcionario, medio de comunicación, o asamblea barrial

═══ CATEGORÍAS DE DESTINATARIOS ═══

- gobierno_municipal: Intendencias, concejos deliberantes, secretarías municipales
- gobierno_provincial: Legislaturas provinciales, ministerios, gobernaciones
- gobierno_nacional: Congreso, ministerios nacionales, organismos federales
- organizaciones: ONGs, fundaciones, organizaciones de base, sindicatos
- medios: Periodistas, medios comunitarios, medios nacionales
- sector_privado: Empresas, cooperativas, emprendedores, cámaras
- comunidad: La propia comunidad organizada (autogestión directa)

═══ TIPOS DE ACCIÓN ═══

- carta: Carta formal dirigida al destinatario (con encabezado, saludo, cuerpo argumentativo con datos, solicitud concreta, cierre formal)
- peticion: Petición pública con fundamentación (título, fundamentación legal/social, datos de respaldo, pedido específico, espacio para adhesiones)
- iniciativa_comunitaria: Plan de acción comunitario autogestivo (objetivo, pasos, recursos necesarios, cronograma, coordinación)
- difusion: Campaña de concientización (mensaje principal, datos clave, hashtags, call to action, piezas para redes)
- nota_periodistica: Nota periodística/comunicado de prensa (título, bajada, cuerpo informativo, datos duros, declaraciones, cierre)
- proyecto_ley: Borrador de proyecto de ley/ordenanza (considerandos, articulado, fundamentación, impacto presupuestario estimado)

Para cada PLANTILLA DE ACCION, generá el texto COMPLETO listo para usar — no resúmenes, no esquemas, el documento final que alguien puede copiar, pegar, firmar y enviar.

═══ MANDATOS TERRITORIALES ═══

Para cada territorio con 3 o más voces, generá un mandato territorial que incluya:
- Las prioridades rankeadas por convergencia real (no por cantidad bruta)
- Las brechas entre lo que se necesita y los recursos disponibles
- Acciones sugeridas que conecten necesidades con recursos existentes
- El nivel de gobierno que debería actuar (o si es autogestión comunitaria)
- Un resumen ejecutivo que un coordinador territorial pueda usar para actuar HOY

Los territorios pueden ser: barrios, ciudades, provincias, o el nivel nacional. Usá el nivel más específico posible — un mandato de "Barrio Alberdi, Córdoba" es más útil que uno de "Córdoba".

═══ DETECCIÓN DE PATRONES CRUZADOS ═══

Buscá especialmente:
- Temas que aparecen en MÚLTIPLES territorios (señal de problema sistémico)
- Recursos declarados en un territorio que podrían cubrir necesidades de otro
- Compromisos que ya abordan brechas identificadas (para visibilizarlos)
- Escalaciones: temas que pasaron de "necesidad" a "basta" en semanas recientes
- Semillas: conexiones entre datos que nadie pidió explícitamente pero que los datos sugieren

RESPUESTA EN JSON ESTRICTO (sin markdown, sin backticks):`;

async function synthesizeWithClaude(data: PulseData, weekInfo: { weekNumber: number; year: number }): Promise<PulseResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required for mandate generation');
  }

  const client = new Anthropic({ apiKey });

  // Build data summary for context
  const totalNewVoices = data.newDreams.length + data.newNeeds.length +
    data.newBastas.length + data.newValues.length +
    data.newCommitments.length + data.newResources.length;

  const previousSummary = data.previousPulse
    ? `PULSO ANTERIOR (Semana ${data.previousPulse.weekNumber}):
- Voces nuevas: ${data.previousPulse.totalNewVoices}
- Temas emergentes: ${data.previousPulse.emergingThemes || 'N/A'}
- Propuestas activas: ${data.recurringProposals.length} propuestas llevan 3+ semanas sin resolverse`
    : 'No hay pulso anterior — este es el PRIMER PULSO.';

  // Sample quotes for context (limit to prevent token overflow)
  const sampleQuotes = (items: any[], field: string, max = 15) =>
    items.slice(0, max).map(i => ({
      text: (i[field] || '').slice(0, 200),
      location: extractTerritory(i),
    })).filter(q => q.text);

  // Group voices by territory
  const territoryGroups = groupByTerritory(data);
  const territorySummary = buildTerritorySummary(territoryGroups);

  // Count territories with 3+ voices
  const territoriesWithMandate = Object.entries(territoryGroups)
    .filter(([name, g]) => name !== 'Sin ubicacion' && g.dreams.length >= 3)
    .map(([name, g]) => `${name} (${g.dreams.length} voces)`)
    .join(', ');

  const prompt = `Genera el Pulso Semanal #${weekInfo.weekNumber} del ano ${weekInfo.year} junto con los Mandatos Territoriales.

═══ DATOS DE ESTA SEMANA ═══

NUEVAS VOCES: ${totalNewVoices} total
- Suenos: ${data.newDreams.length}
- Necesidades: ${data.newNeeds.length}
- Bastas: ${data.newBastas.length}
- Valores: ${data.newValues.length}
- Compromisos: ${data.newCommitments.length}
- Recursos nuevos: ${data.newResources.length}

DATOS ACUMULADOS TOTALES:
- ${data.allDreams.length} declaraciones totales en el mapa
- ${data.allCommitments.length} compromisos activos
- ${data.allResources.length} recursos declarados

═══ MUESTRAS DE VOCES NUEVAS ═══

SUENOS:
${JSON.stringify(sampleQuotes(data.newDreams, 'dream'))}

NECESIDADES:
${JSON.stringify(sampleQuotes(data.newNeeds, 'need'))}

BASTAS:
${JSON.stringify(sampleQuotes(data.newBastas, 'basta'))}

VALORES:
${JSON.stringify(sampleQuotes(data.newValues, 'value'))}

COMPROMISOS:
${JSON.stringify(sampleQuotes(data.newCommitments, 'commitmentText'))}

RECURSOS DECLARADOS:
${JSON.stringify(data.newResources.slice(0, 10).map(r => ({
  description: r.description,
  category: r.category,
  location: extractTerritory(r),
  hours: r.availableHours,
})))}

═══ TODOS LOS DATOS ACUMULADOS (muestras) ═══

SUENOS ACUMULADOS:
${JSON.stringify(sampleQuotes(data.allDreams.filter(d => d.type === 'dream'), 'dream', 20))}

NECESIDADES ACUMULADAS:
${JSON.stringify(sampleQuotes(data.allDreams.filter(d => d.type === 'need'), 'need', 20))}

BASTAS ACUMULADOS:
${JSON.stringify(sampleQuotes(data.allDreams.filter(d => d.type === 'basta'), 'basta', 20))}

VALORES ACUMULADOS:
${JSON.stringify(sampleQuotes(data.allDreams.filter(d => d.type === 'value'), 'value', 20))}

TODOS LOS RECURSOS:
${JSON.stringify(data.allResources.map(r => ({
  description: r.description?.slice(0, 100),
  category: r.category,
  location: extractTerritory(r),
  hours: r.availableHours,
})))}

═══ VOCES AGRUPADAS POR TERRITORIO ═══

Territorios con suficientes voces para mandato: ${territoriesWithMandate || 'Ninguno aun'}

${territorySummary}

═══ CONTEXTO HISTORICO ═══

${previousSummary}

PROPUESTAS RECURRENTES (3+ semanas sin accion):
${JSON.stringify(data.recurringProposals.map(p => ({
  title: p.title,
  urgency: p.urgency,
  weeksActive: p.weeksActive,
  targetCategory: p.targetCategory,
})))}

═══ INSTRUCCIONES DE RESPUESTA ═══

Responde con un JSON con esta estructura exacta:
{
  "emergingThemes": [
    {"theme": "nombre del tema", "trend": "up|stable|down|new", "count": numero, "description": "descripcion"}
  ],
  "patterns": [
    {"pattern": "nombre del patron", "territories": ["territorio1"], "description": "explicacion", "evidence": ["cita1"]}
  ],
  "proposals": [
    {
      "title": "Verbo + objetivo concreto",
      "summary": "Resumen en 2-3 oraciones",
      "fullAnalysis": "Analisis detallado extenso — tan largo como sea necesario para fundamentar bien la propuesta. Incluí contexto, datos, argumentacion, y por que es autoevidente desde los datos.",
      "evidence": {"voiceCount": numero, "territories": ["lista"], "quotes": ["citas textuales del mapa"], "convergencePercent": numero},
      "targetCategory": "gobierno_municipal|gobierno_provincial|gobierno_nacional|organizaciones|medios|sector_privado|comunidad",
      "targetDescription": "A quien especificamente va dirigida",
      "territory": "Alcance geografico",
      "urgency": "critica|importante|oportunidad",
      "precedent": "Caso similar que funciono en otro lado (investigar si existe)",
      "suggestedActionType": "carta|peticion|iniciativa_comunitaria|difusion|nota_periodistica|proyecto_ley",
      "actionTemplate": "TEXTO COMPLETO de la accion — carta, peticion, proyecto, nota — LISTO PARA USAR. Extenso, formal, profesional, con todos los datos."
    }
  ],
  "territoryMandates": [
    {
      "territoryName": "Nombre exacto del territorio",
      "territoryLevel": "barrio|city|province|national",
      "convergenceScore": numero_0_a_100,
      "voiceCount": numero,
      "priorities": [
        {"rank": numero, "theme": "tema", "description": "descripcion con evidencia", "convergencePercent": numero, "voiceCount": numero, "sampleQuotes": ["citas reales"]}
      ],
      "gaps": [
        {"theme": "tema", "needCount": numero, "resourceCount": numero, "gap": numero, "urgency": "critical|high|medium"}
      ],
      "suggestedActions": [
        {"title": "titulo accion", "description": "descripcion detallada", "needsAddressed": "que necesidad cubre", "resourcesRequired": "que recursos se necesitan", "estimatedImpact": "impacto estimado", "precedent": "caso similar si existe"}
      ],
      "rawSummary": "Resumen ejecutivo del mandato territorial — directo, accionable, con datos. Lo que un coordinador territorial necesita para actuar hoy."
    }
  ],
  "unconnectedResources": [
    {"resource": "descripcion", "category": "categoria", "suggestion": "como podria activarse"}
  ],
  "seedOfWeek": {
    "title": "Idea inspiradora",
    "description": "Explicacion de la idea",
    "inspiration": "Por que los datos sugieren esta idea aunque nadie la pidio explicitamente"
  },
  "comparisonWithPrevious": {
    "trends": [{"theme": "tema", "direction": "up|stable|down", "detail": "explicacion"}],
    "escalations": ["propuestas que deben escalar de urgencia"]
  },
  "fullAnalysis": "EL PULSO COMPLETO como texto narrativo. Incluye todo: termometro, patrones, propuestas explicadas, mandatos territoriales resumidos, recursos sin conectar, semilla. Se extenso, profundo, y accionable. Esto es lo que la gente lee."
}

IMPORTANTE:
- Genera tantas propuestas como los datos justifiquen — no hay limite.
- Genera un mandato territorial por cada territorio con 3+ voces.
- Para cada mandato territorial, identifica que nivel de gobierno debería responder.
- Cada propuesta debe ser autoevidente desde los datos.
- El texto de fullAnalysis (tanto global como por propuesta) debe ser tan extenso como sea necesario para generar algo de altísima calidad.
- Las plantillas de accion (actionTemplate) deben ser documentos COMPLETOS listos para usar.
- Si no hay datos suficientes para un territorio, no inventes — omití ese mandato.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 24000,
    system: MANDATO_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON (handle potential markdown wrapping)
  const jsonStr = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(jsonStr);

  return {
    thermometer: {
      totalNewVoices,
      newDreams: data.newDreams.length,
      newNeeds: data.newNeeds.length,
      newBastas: data.newBastas.length,
      newValues: data.newValues.length,
      newCommitments: data.newCommitments.length,
      newResources: data.newResources.length,
    },
    emergingThemes: parsed.emergingThemes || [],
    patterns: parsed.patterns || [],
    proposals: parsed.proposals || [],
    territoryMandates: parsed.territoryMandates || [],
    unconnectedResources: parsed.unconnectedResources || [],
    seedOfWeek: parsed.seedOfWeek || { title: '', description: '', inspiration: '' },
    comparisonWithPrevious: parsed.comparisonWithPrevious || { trends: [], escalations: [] },
    fullAnalysis: parsed.fullAnalysis || '',
  };
}

// -- Main Generation Function -----------------------------------------------

export async function generateWeeklyMandate(): Promise<any> {
  const weekInfo = getWeekBounds();

  // Check if pulse already exists for this week
  const existing = await db.select()
    .from(weeklyDigests)
    .where(
      and(
        eq(weeklyDigests.weekNumber, weekInfo.weekNumber),
        eq(weeklyDigests.year, weekInfo.year),
      )
    )
    .limit(1);

  if (existing[0]?.status === 'completed') {
    return existing[0];
  }

  // Create or get the in-progress digest record
  let digestRecord: any;
  if (existing[0]) {
    digestRecord = existing[0];
    await db.update(weeklyDigests)
      .set({ status: 'generating' })
      .where(eq(weeklyDigests.id, existing[0].id));
  } else {
    const [created] = await db.insert(weeklyDigests).values({
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year,
      weekStartDate: weekInfo.start.toISOString(),
      weekEndDate: weekInfo.end.toISOString(),
      status: 'generating',
    }).returning();
    digestRecord = created;
  }

  try {
    // Gather data
    const data = await gatherPulseData();

    // Synthesize with Claude
    const result = await synthesizeWithClaude(data, weekInfo);

    // Update digest record with results
    const [updated] = await db.update(weeklyDigests)
      .set({
        totalNewVoices: result.thermometer.totalNewVoices,
        newDreams: result.thermometer.newDreams,
        newNeeds: result.thermometer.newNeeds,
        newBastas: result.thermometer.newBastas,
        newValues: result.thermometer.newValues,
        newCommitments: result.thermometer.newCommitments,
        newResources: result.thermometer.newResources,
        cumulativeVoices: data.allDreams.length + data.allCommitments.length,
        cumulativeResources: data.allResources.length,
        emergingThemes: JSON.stringify(result.emergingThemes),
        patterns: JSON.stringify(result.patterns),
        unconnectedResources: JSON.stringify(result.unconnectedResources),
        seedOfWeek: JSON.stringify(result.seedOfWeek),
        comparisonWithPrevious: JSON.stringify(result.comparisonWithPrevious),
        fullAnalysis: result.fullAnalysis,
        status: 'completed' as const,
        generatedAt: new Date().toISOString(),
      })
      .where(eq(weeklyDigests.id, digestRecord.id))
      .returning();

    // Save proposals
    for (const proposal of result.proposals) {
      // Check if this is a recurring proposal
      const existingProposal = data.recurringProposals.find(
        p => p.title.toLowerCase().includes(proposal.title.toLowerCase().slice(0, 20))
      );

      await db.insert(digestProposals).values({
        digestId: digestRecord.id,
        title: proposal.title,
        summary: proposal.summary,
        fullAnalysis: proposal.fullAnalysis,
        evidence: JSON.stringify(proposal.evidence),
        targetCategory: proposal.targetCategory as any,
        targetDescription: proposal.targetDescription,
        territory: proposal.territory,
        urgency: proposal.urgency as any,
        precedent: proposal.precedent,
        suggestedActionType: proposal.suggestedActionType as any,
        actionTemplate: proposal.actionTemplate,
        status: 'propuesta' as any,
        firstAppearedWeek: existingProposal?.firstAppearedWeek || weekInfo.weekNumber,
        weeksActive: existingProposal ? (existingProposal.weeksActive || 1) + 1 : 1,
      });
    }

    // Escalate recurring proposals
    for (const recurring of data.recurringProposals) {
      if ((recurring.weeksActive || 0) >= 3 && recurring.urgency !== 'critica') {
        await db.update(digestProposals)
          .set({
            urgency: 'critica' as any,
            escalatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(digestProposals.id, recurring.id));
      }
    }

    // Save territory mandates
    if (result.territoryMandates && Array.isArray(result.territoryMandates)) {
      for (const tm of result.territoryMandates) {
        if (!tm.territoryName || tm.voiceCount < 3) continue;

        const level = tm.territoryLevel || 'province';
        const existingMandate = await storage.getMandateByTerritory(level, tm.territoryName);

        const mandateData = {
          territoryLevel: level as 'barrio' | 'city' | 'province' | 'national',
          territoryName: tm.territoryName,
          voiceCount: tm.voiceCount,
          convergenceScore: tm.convergenceScore,
          diagnosis: JSON.stringify({ priorities: tm.priorities || [] }),
          availableResources: JSON.stringify({ categories: [], totalVolunteers: 0 }),
          gaps: JSON.stringify({ critical: tm.gaps || [] }),
          suggestedActions: JSON.stringify({ actions: tm.suggestedActions || [] }),
          rawSummary: tm.rawSummary || '',
          status: 'published' as const,
          generatedAt: new Date().toISOString(),
        };

        if (existingMandate) {
          await storage.updateMandate(existingMandate.id, {
            ...mandateData,
            version: (existingMandate.version || 0) + 1,
          });
          console.log(`[Mandato] Updated mandate for ${tm.territoryName} (v${(existingMandate.version || 0) + 1})`);
        } else {
          await storage.createMandate(mandateData);
          console.log(`[Mandato] Created new mandate for ${tm.territoryName}`);
        }
      }
    }

    console.log(`[Mandato] Weekly mandate generated: ${result.proposals.length} proposals, ${result.territoryMandates.length} territory mandates`);

    return updated;
  } catch (error: any) {
    // Mark as failed
    await db.update(weeklyDigests)
      .set({
        status: 'failed' as const,
        errorMessage: error.message || 'Unknown error',
      })
      .where(eq(weeklyDigests.id, digestRecord.id));
    throw error;
  }
}

// -- Cron Scheduler ---------------------------------------------------------

let cronInterval: ReturnType<typeof setInterval> | null = null;

export function startMandatoCron() {
  // Check every minute if it's Friday 17:55 ART (UTC-3 = 20:55 UTC)
  cronInterval = setInterval(async () => {
    const now = new Date();
    const arTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));

    if (arTime.getDay() === 5 && arTime.getHours() === 17 && arTime.getMinutes() === 55) {
      console.log('[Mandato] Friday 17:55 ART — triggering weekly mandate generation...');
      try {
        await generateWeeklyMandate();
        console.log('[Mandato] Weekly mandate generated successfully.');
      } catch (error) {
        console.error('[Mandato] Failed to generate weekly mandate:', error);
      }
    }
  }, 60_000); // Check every minute

  console.log('[Mandato] Cron scheduler started — will generate mandate every Friday at 17:55 ART');
}

/**
 * Generate and save a mandate for a specific territory (on-demand).
 * Gathers territory data, analyzes locally with keyword matching,
 * optionally enriches with AI, and persists to DB.
 */
export async function generateAndSaveMandate(
  territoryLevel: 'barrio' | 'city' | 'province' | 'national',
  territoryName: string,
  province?: string,
  city?: string,
): Promise<any> {
  const [allDreams, allResources] = await Promise.all([
    storage.getDreams(),
    storage.getUserResources(),
  ]);

  // Filter by territory
  const filterByTerritory = (items: any[]) => {
    if (territoryLevel === 'national') return items;
    return items.filter(item => {
      const loc = (item.location || '').toLowerCase();
      return loc.includes(territoryName.toLowerCase());
    });
  };
  const filterResources = (resources: any[]) => {
    if (territoryLevel === 'national') return resources;
    return resources.filter(r => {
      const loc = [r.city, r.province, r.location].filter(Boolean).join(' ').toLowerCase();
      return loc.includes(territoryName.toLowerCase());
    });
  };

  const territoryDreams = filterByTerritory(allDreams);
  const territoryResources = filterResources(allResources);

  // Local keyword-based analysis
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
  const THEME_LABELS: Record<string, string> = {
    systemic: 'Transformación Sistémica', values: 'Valores Fundamentales',
    action: 'Acción y Agencia', development: 'Desarrollo Humano',
    justice: 'Justicia y Derechos', economy: 'Economía y Recursos',
    health: 'Salud y Vida', community: 'Comunidad y Colectivo', future: 'Futuro y Visión',
  };
  const RESOURCE_CATEGORY_LABELS: Record<string, string> = {
    legal: 'Legal', medical: 'Salud', education: 'Educación', tech: 'Tecnología',
    construction: 'Construcción', agriculture: 'Agricultura', communication: 'Comunicación',
    admin: 'Administración', transport: 'Transporte', space: 'Espacio Físico',
    equipment: 'Equipamiento', other: 'Otros',
  };
  const RESOURCE_THEME_MAP: Record<string, string[]> = {
    legal: ['justice', 'systemic'], medical: ['health'], education: ['development', 'future'],
    tech: ['systemic', 'action', 'economy'], construction: ['community', 'economy'],
    agriculture: ['economy', 'health'], communication: ['action', 'values', 'community'],
    admin: ['systemic', 'economy'], transport: ['community', 'economy'],
    space: ['community', 'action'], equipment: ['economy', 'action'],
  };

  const normalize = (w: string) =>
    w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');

  const themeHits: Record<string, { count: number; quotes: string[] }> = {};
  for (const tk of Object.keys(THEME_KEYWORDS)) themeHits[tk] = { count: 0, quotes: [] };

  let voiceCount = 0;
  for (const entry of territoryDreams) {
    for (const type of ['need', 'basta', 'dream', 'value'] as const) {
      const text = entry[type] as string | null;
      if (!text) continue;
      voiceCount++;
      const words = text.split(/\s+/).map(normalize).filter(w => w.length > 3);
      for (const tk of Object.keys(THEME_KEYWORDS)) {
        if (words.some(w => THEME_KEYWORDS[tk].some(kw => w.includes(kw) || kw.includes(w)))) {
          themeHits[tk].count++;
          if (themeHits[tk].quotes.length < 3) themeHits[tk].quotes.push(text.length > 120 ? text.slice(0, 120) + '…' : text);
        }
      }
    }
  }

  const priorities = Object.entries(themeHits)
    .filter(([, v]) => v.count > 0).sort(([, a], [, b]) => b.count - a.count).slice(0, 5)
    .map(([theme, data], i) => ({
      rank: i + 1, theme: THEME_LABELS[theme] || theme,
      description: `${data.count} declaraciones convergen en ${THEME_LABELS[theme] || theme}`,
      convergencePercent: voiceCount > 0 ? Math.round((data.count / voiceCount) * 100) : 0,
      voiceCount: data.count, sampleQuotes: data.quotes,
    }));

  const resCats: Record<string, number> = {};
  territoryResources.forEach(r => { resCats[r.category || 'other'] = (resCats[r.category || 'other'] || 0) + 1; });
  const resourceCategories = Object.entries(resCats)
    .map(([category, count]) => ({ category: RESOURCE_CATEGORY_LABELS[category] || category, count, description: `${count} persona(s) con capacidad en ${RESOURCE_CATEGORY_LABELS[category] || category}` }))
    .sort((a, b) => b.count - a.count);

  const resourceThemeCounts: Record<string, number> = {};
  territoryResources.forEach(r => { (RESOURCE_THEME_MAP[r.category] || []).forEach(t => { resourceThemeCounts[t] = (resourceThemeCounts[t] || 0) + 1; }); });

  const gaps = Object.entries(themeHits)
    .map(([theme, data]) => ({ theme: THEME_LABELS[theme] || theme, needCount: data.count, resourceCount: resourceThemeCounts[theme] || 0, gap: data.count - (resourceThemeCounts[theme] || 0), urgency: (data.count - (resourceThemeCounts[theme] || 0) > 5 ? 'critical' : data.count - (resourceThemeCounts[theme] || 0) > 2 ? 'high' : 'medium') as 'critical' | 'high' | 'medium' }))
    .filter(g => g.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 5);

  const suggestedActions = gaps.slice(0, 3).map(gap => ({
    title: `Programa de ${gap.theme}`, description: `${gap.needCount} personas expresaron necesidad en ${gap.theme}. ${gap.resourceCount > 0 ? `Hay ${gap.resourceCount} recursos disponibles.` : 'Se necesitan recursos externos.'}`,
    needsAddressed: gap.theme, resourcesRequired: gap.resourceCount > 0 ? 'Parcialmente cubiertos' : 'Se requiere movilización', estimatedImpact: `Impacto directo en ${gap.needCount} personas`,
  }));

  const topPriority = priorities[0]?.theme || 'Sin datos suficientes';
  let rawSummary = voiceCount > 0
    ? `Mandato basado en ${voiceCount} declaraciones. Prioridad #1: ${topPriority}. ${territoryResources.length} recursos declarados. ${gaps.length} brechas identificadas.`
    : 'Aún no hay suficientes datos para generar un mandato. Se necesitan más declaraciones en el mapa.';

  const convergenceScore = priorities.length > 0
    ? Math.round(priorities.reduce((sum, p) => sum + p.convergencePercent, 0) / priorities.length) : 0;

  // Optionally enrich summary with AI
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && voiceCount >= 3) {
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: `Sos el sintetizador del Mandato Vivo — un sistema que traduce la voz colectiva del pueblo en mandatos accionables. No interpretas, no opinas, no agregas ideología. Solo ARTICULÁS lo que los datos dicen.\n\nTERRITORIO: ${territoryName} (nivel: ${territoryLevel})\nDATOS: ${voiceCount} declaraciones, ${territoryResources.length} recursos.\n\nDIAGNÓSTICO:\n${JSON.stringify(priorities, null, 2)}\n\nRECURSOS:\n${JSON.stringify(resourceCategories, null, 2)}\n\nBRECHAS:\n${JSON.stringify(gaps, null, 2)}\n\nGenerá un RESUMEN EJECUTIVO del mandato en español rioplatense (máximo 300 palabras): top 3 prioridades con evidencia, recursos disponibles, brechas críticas, 2-3 acciones concretas. Tono: directo, sin retórica vacía.` }],
      });
      const aiText = response.content[0].type === 'text' ? response.content[0].text : '';
      if (aiText) rawSummary = aiText;
    } catch (error) {
      console.error('[Mandato] AI enrichment failed for on-demand mandate, using local analysis:', error);
    }
  }

  const mandateData = {
    territoryLevel,
    territoryName,
    province: province || null,
    city: city || null,
    voiceCount,
    convergenceScore,
    diagnosis: JSON.stringify({ priorities }),
    availableResources: JSON.stringify({ categories: resourceCategories, totalVolunteers: territoryResources.length }),
    gaps: JSON.stringify({ critical: gaps }),
    suggestedActions: JSON.stringify({ actions: suggestedActions }),
    rawSummary,
    generatedAt: new Date().toISOString(),
  };

  const existing = await storage.getMandateByTerritory(territoryLevel, territoryName);
  if (existing) {
    const updated = await storage.updateMandate(existing.id, { ...mandateData, version: (existing.version || 0) + 1 });
    return { mandate: updated, generated: { diagnosis: { priorities }, availableResources: { categories: resourceCategories, totalVolunteers: territoryResources.length }, gaps: { critical: gaps }, suggestedActions: { actions: suggestedActions }, rawSummary, convergenceScore, voiceCount } };
  }

  const created = await storage.createMandate({ ...mandateData, status: 'draft' });
  return { mandate: created, generated: { diagnosis: { priorities }, availableResources: { categories: resourceCategories, totalVolunteers: territoryResources.length }, gaps: { critical: gaps }, suggestedActions: { actions: suggestedActions }, rawSummary, convergenceScore, voiceCount } };
}

export function stopMandatoCron() {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log('[Mandato] Cron scheduler stopped.');
  }
}
