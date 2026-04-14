import { db } from '../db';
import { dreams, userCommitments, userResources, users } from '@shared/schema';
import { eq, and, isNull, or } from 'drizzle-orm';
import { config } from '../config';

// ─── Theme detection (mirrors client-side THEME_KEYWORDS) ───

const THEME_KEYWORDS: Record<string, string[]> = {
  systemic: [
    'transformacion', 'cambio', 'revolucion', 'reforma', 'renovacion',
    'sistema', 'estructura', 'organizacion', 'institucion', 'proceso',
  ],
  values: [
    'transparencia', 'amabilidad', 'justicia', 'equidad', 'dignidad',
    'respeto', 'integridad', 'honestidad', 'solidaridad', 'empatia',
    'colaboracion', 'cooperacion', 'inclusion', 'diversidad', 'igualdad',
  ],
  action: [
    'accion', 'participacion', 'movilizacion', 'empoderamiento',
    'liderazgo', 'innovacion', 'creatividad', 'iniciativa', 'compromiso',
    'responsabilidad', 'protagonismo', 'autonomia', 'autodeterminacion',
  ],
  development: [
    'educacion', 'formacion', 'capacitacion', 'aprendizaje', 'conocimiento',
    'desarrollo', 'crecimiento', 'evolucion', 'progreso', 'avance',
    'mejora', 'excelencia', 'calidad', 'bienestar',
  ],
  justice: [
    'derechos', 'libertad', 'democracia', 'representacion',
    'acceso', 'oportunidad', 'redistribucion', 'reparacion', 'restitucion',
    'garantia', 'proteccion', 'defensa', 'reivindicacion',
  ],
  economy: [
    'trabajo', 'empleo', 'economia', 'produccion', 'distribucion',
    'recursos', 'bienes', 'servicios', 'salario', 'ingreso',
    'inversion', 'sustentabilidad', 'sostenibilidad',
  ],
  health: [
    'salud', 'cuidado', 'atencion', 'prevencion',
    'tratamiento', 'curacion', 'sanacion', 'vida',
    'universal', 'publico', 'gratuito',
  ],
  community: [
    'comunidad', 'pueblo', 'sociedad', 'colectivo', 'ciudadania',
    'vecindario', 'barrio', 'territorio', 'espacio', 'comun',
    'compartido', 'participativo', 'abierto', 'inclusivo',
  ],
  future: [
    'futuro', 'vision', 'horizonte', 'posibilidad', 'potencial',
    'esperanza', 'aspiracion', 'sueno', 'ideal', 'meta',
    'objetivo', 'proposito', 'mision', 'destino', 'legado',
  ],
};

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

const TYPE_LABELS: Record<string, string> = {
  dream: 'Sueños',
  value: 'Valores',
  need: 'Necesidades',
  basta: '¡BASTA!',
  compromiso: 'Compromisos',
  recurso: 'Recursos',
};

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:¡!¿?()[\]{}«»""'/\\-]/g, '')
    .trim();
}

function extractWords(text: string | null): string[] {
  if (!text) return [];
  const STOP_WORDS = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'de', 'que', 'y', 'a', 'en', 'ser', 'se', 'no', 'haber',
    'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le',
    'es', 'son', 'pero', 'sino', 'porque', 'pues', 'cuando', 'donde',
  ]);
  return text
    .split(/\s+/)
    .map(normalizeWord)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

function classifyThemes(text: string): string[] {
  const words = extractWords(text);
  const matched = new Set<string>();
  for (const w of words) {
    for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
      if (keywords.some((kw) => w.includes(kw) || kw.includes(w))) {
        matched.add(theme);
      }
    }
  }
  return [...matched];
}

// ─── Query helpers ───

async function queryAllDreams() {
  return db
    .select({
      id: dreams.id,
      dream: dreams.dream,
      value: dreams.value,
      need: dreams.need,
      basta: dreams.basta,
      type: dreams.type,
      location: dreams.location,
      createdAt: dreams.createdAt,
    })
    .from(dreams)
    .leftJoin(users, eq(dreams.userId, users.id))
    .where(
      or(
        isNull(dreams.userId),
        isNull(users.dataShareOptOut),
        eq(users.dataShareOptOut, false),
      ),
    );
}

async function queryAllCommitments() {
  return db
    .select({
      id: userCommitments.id,
      commitmentText: userCommitments.commitmentText,
      province: userCommitments.province,
      city: userCommitments.city,
      createdAt: userCommitments.createdAt,
    })
    .from(userCommitments)
    .leftJoin(users, eq(userCommitments.userId, users.id))
    .where(
      or(
        isNull(userCommitments.userId),
        isNull(users.dataShareOptOut),
        eq(users.dataShareOptOut, false),
      ),
    );
}

async function queryAllResources() {
  return db
    .select({
      id: userResources.id,
      description: userResources.description,
      category: userResources.category,
      province: userResources.province,
      city: userResources.city,
      createdAt: userResources.createdAt,
    })
    .from(userResources)
    .leftJoin(users, eq(userResources.userId, users.id))
    .where(
      and(
        eq(userResources.isActive, true),
        or(
          isNull(userResources.userId),
          isNull(users.dataShareOptOut),
          eq(users.dataShareOptOut, false),
        ),
      ),
    );
}

// ─── Public API ───

export async function computeConvergenceSummary() {
  const [dreamsData, commitmentsData, resourcesData] = await Promise.all([
    queryAllDreams(),
    queryAllCommitments(),
    queryAllResources(),
  ]);

  const totalContributions = dreamsData.length + commitmentsData.length + resourcesData.length;

  const typeCounts: Record<string, number> = {
    dream: 0, value: 0, need: 0, basta: 0, compromiso: 0, recurso: 0,
  };

  const themePresence: Record<string, Set<string>> = {};
  const themeHits: Record<string, Record<string, number>> = {};
  for (const theme of Object.keys(THEME_KEYWORDS)) {
    themePresence[theme] = new Set();
    themeHits[theme] = { dream: 0, value: 0, need: 0, basta: 0, compromiso: 0, recurso: 0 };
  }

  for (const d of dreamsData) {
    const entryType = d.type || 'dream';
    typeCounts[entryType] = (typeCounts[entryType] || 0) + 1;

    const fields: Array<{ type: string; text: string | null }> = [
      { type: 'dream', text: d.dream },
      { type: 'value', text: d.value },
      { type: 'need', text: d.need },
      { type: 'basta', text: d.basta },
    ];

    for (const field of fields) {
      if (!field.text) continue;
      const themes = classifyThemes(field.text);
      for (const theme of themes) {
        themePresence[theme].add(field.type);
        themeHits[theme][field.type]++;
      }
    }
  }

  typeCounts.compromiso = commitmentsData.length;
  for (const c of commitmentsData) {
    if (!c.commitmentText) continue;
    const themes = classifyThemes(c.commitmentText);
    for (const theme of themes) {
      themePresence[theme].add('compromiso');
      themeHits[theme].compromiso++;
    }
  }

  typeCounts.recurso = resourcesData.length;
  for (const r of resourcesData) {
    if (!r.description) continue;
    const themes = classifyThemes(r.description);
    for (const theme of themes) {
      themePresence[theme].add('recurso');
      themeHits[theme].recurso++;
    }
  }

  const themeKeys = Object.keys(THEME_KEYWORDS);
  const themeSummary = themeKeys
    .map((theme) => {
      const presentTypes = [...themePresence[theme]];
      const totalHits = Object.values(themeHits[theme]).reduce((s, n) => s + n, 0);
      return { theme, label: THEME_LABELS[theme], convergenceCount: presentTypes.length, totalHits, presentTypes };
    })
    .filter((t) => t.totalHits > 0)
    .sort((a, b) => b.convergenceCount - a.convergenceCount || b.totalHits - a.totalHits);

  const activeThemes = themeSummary.filter((t) => t.convergenceCount > 0);
  const sharedThemes = themeSummary.filter((t) => t.convergenceCount >= 2);
  const convergencePercentage =
    activeThemes.length > 0
      ? Math.round((sharedThemes.length / activeThemes.length) * 100)
      : 0;

  const typeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    label: TYPE_LABELS[type] || type,
    count,
  }));

  return {
    totalContributions,
    convergencePercentage,
    sharedThemeCount: sharedThemes.length,
    totalActiveThemes: activeThemes.length,
    topThemes: themeSummary.slice(0, 7),
    typeDistribution,
    generatedAt: new Date().toISOString(),
  };
}

const AI_FALLBACK = {
  narrative: 'Las voces del pueblo se acumulan en el mapa colectivo. ' +
    'Cada sueño declarado, cada valor defendido y cada grito de ¡BASTA! forman parte de un mandato popular que se construye desde abajo. ' +
    'Los datos muestran convergencia — personas que no se conocen están diciendo lo mismo con palabras distintas. ' +
    'Eso no es coincidencia, es el pulso de un país que sabe lo que quiere.',
  generatedAt: new Date().toISOString(),
};

export async function generateAIInsights(convergenceData: any): Promise<{ narrative: string; generatedAt: string }> {
  if (!config.ai.groqApiKey) {
    return AI_FALLBACK;
  }

  const systemPrompt = `Sos un analista de datos cívicos del movimiento "El Instante del Hombre Gris" en Argentina.
Tu tarea es generar una narrativa de exactamente 3 párrafos en castellano rioplatense (vos, sos, tenés) sobre los datos de convergencia ciudadana.

Párrafo 1: Resumen del volumen y diversidad de voces (total de contribuciones, tipos).
Párrafo 2: Dónde convergen — qué temas comparten distintos tipos de declaraciones (sueños, valores, necesidades, ¡BASTA!, compromisos, recursos).
Párrafo 3: Cierre con perspectiva de futuro y llamado a la acción.

Reglas:
- Máximo 200 palabras total.
- Tono: directo, esperanzador pero no ingenuo. Como un amigo que te muestra datos y te dice "mirá esto".
- NO uses emojis.
- NO uses markdown ni formato especial — texto plano.
- NO inventes datos. Usá solo los que te paso.`;

  const userPrompt = `Datos de convergencia ciudadana:
- Total de contribuciones: ${convergenceData.totalContributions}
- Porcentaje de convergencia: ${convergenceData.convergencePercentage}%
- Temas compartidos: ${convergenceData.sharedThemeCount} de ${convergenceData.totalActiveThemes} activos
- Top temas: ${convergenceData.topThemes.slice(0, 5).map((t: any) => `${t.label} (${t.convergenceCount} tipos, ${t.totalHits} menciones)`).join(', ')}
- Distribución: ${convergenceData.typeDistribution.map((t: any) => `${t.label}: ${t.count}`).join(', ')}

Generá la narrativa.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.ai.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.ai.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: config.ai.maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API error in analytics insights:', response.status, errorText);
    return AI_FALLBACK;
  }

  const aiData = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  const narrative = aiData.choices[0]?.message?.content || 'No se pudo generar la narrativa.';

  return {
    narrative,
    generatedAt: new Date().toISOString(),
  };
}
