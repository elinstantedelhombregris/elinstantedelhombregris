/**
 * Matchmaker Service — El Casamentero
 *
 * Auto-detects actionable patterns: clusters of needs + available resources = suggested initiatives.
 * The system sees the pattern and proposes the action.
 */

import { storage } from './storage';

interface MatchPattern {
  territoryName: string;
  needTheme: string;
  needThemeLabel: string;
  needCount: number;
  resourceCategory: string;
  resourceCategoryLabel: string;
  resourceCount: number;
  suggestedAction: string;
  precedent: string;
}

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

const RESOURCE_LABELS: Record<string, string> = {
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

// Resource categories that can address each theme
const THEME_RESOURCE_MATCHES: Record<string, string[]> = {
  health: ['medical'],
  development: ['education'],
  justice: ['legal'],
  economy: ['tech', 'agriculture', 'construction', 'admin'],
  community: ['space', 'communication', 'transport'],
  action: ['communication', 'tech', 'space'],
  systemic: ['legal', 'tech', 'admin'],
  values: ['education', 'communication'],
  future: ['education', 'tech'],
};

// Action templates based on theme + resource combination
const ACTION_TEMPLATES: Record<string, Record<string, { action: string; precedent: string }>> = {
  health: {
    medical: {
      action: 'Red de Atención Comunitaria: jornadas de salud gratuitas con profesionales voluntarios',
      precedent: 'En Rosario, 15 médicos voluntarios atienden a 200 familias por mes en centros comunitarios',
    },
  },
  development: {
    education: {
      action: 'Red de Tutorías Barriales: docentes voluntarios ofrecen apoyo escolar en espacios comunitarios',
      precedent: 'En La Matanza, una red de 30 docentes ayudó a 500 chicos a mejorar rendimiento escolar en 6 meses',
    },
  },
  justice: {
    legal: {
      action: 'Consultorio Jurídico Popular: asesoramiento legal gratuito semanal para el barrio',
      precedent: 'En Córdoba, 10 abogados voluntarios resolvieron 150 casos de vivienda en un año',
    },
  },
  economy: {
    tech: {
      action: 'Hub de Emprendedores Digitales: capacitación tecnológica para generar ingresos',
      precedent: 'En Mendoza, un hub digital capacitó a 80 personas que generaron emprendimientos en 4 meses',
    },
    agriculture: {
      action: 'Red de Huertas Comunitarias: producción local de alimentos con asistencia técnica',
      precedent: 'En Tucumán, 20 huertas comunitarias alimentan a 300 familias y generan excedente para ferias',
    },
  },
  community: {
    space: {
      action: 'Centro de Encuentro Barrial: espacio abierto para reuniones, talleres y coordinación vecinal',
      precedent: 'En San Martín, un vecino cedió su garaje y ahora funciona como centro comunitario con 100 asistentes semanales',
    },
    communication: {
      action: 'Medio Comunitario Digital: canal de comunicación barrial para coordinar acciones y difundir logros',
      precedent: 'En Quilmes, un grupo de WhatsApp barrial evolucionó a un medio digital con 2,000 seguidores',
    },
  },
};

const DEFAULT_TEMPLATE = {
  action: 'Programa de acción coordinada conectando necesidades con recursos disponibles en el territorio',
  precedent: 'Múltiples experiencias en Argentina demuestran que la organización vecinal multiplica el impacto',
};

/**
 * Scan all territories for actionable patterns and generate suggestions
 */
export async function scanForMatches(minNeeds: number = 2, minResources: number = 1): Promise<MatchPattern[]> {
  const [dreams, resources] = await Promise.all([
    storage.getDreams(),
    storage.getUserResources(),
  ]);

  const THEME_KEYWORDS: Record<string, string[]> = {
    systemic: ['transformacion', 'cambio', 'revolucion', 'reforma', 'sistema'],
    values: ['transparencia', 'justicia', 'equidad', 'dignidad', 'respeto', 'solidaridad'],
    action: ['accion', 'participacion', 'movilizacion', 'liderazgo', 'iniciativa'],
    development: ['educacion', 'formacion', 'capacitacion', 'aprendizaje', 'desarrollo'],
    justice: ['derechos', 'libertad', 'democracia', 'acceso', 'oportunidad'],
    economy: ['trabajo', 'empleo', 'economia', 'produccion', 'salario'],
    health: ['salud', 'cuidado', 'atencion', 'prevencion', 'tratamiento'],
    community: ['comunidad', 'pueblo', 'sociedad', 'colectivo', 'barrio', 'territorio'],
    future: ['futuro', 'vision', 'horizonte', 'esperanza', 'sueno', 'meta'],
  };

  const normalize = (w: string) =>
    w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');

  // Group needs by territory + theme
  const needsByLocTheme: Record<string, Record<string, number>> = {};

  dreams.forEach((entry: any) => {
    const loc = entry.location || 'Sin ubicación';
    if (loc === 'Sin ubicación') return;

    for (const type of ['need', 'basta'] as const) {
      const text = entry[type] as string | null;
      if (!text) continue;

      const words = text.split(/\s+/).map(normalize).filter((w) => w.length > 3);
      for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
        if (words.some((w) => keywords.some((kw) => w.includes(kw) || kw.includes(w)))) {
          if (!needsByLocTheme[loc]) needsByLocTheme[loc] = {};
          needsByLocTheme[loc][theme] = (needsByLocTheme[loc][theme] || 0) + 1;
        }
      }
    }
  });

  // Group resources by territory + category
  const resourcesByLocCat: Record<string, Record<string, number>> = {};

  resources.forEach((r: any) => {
    const loc = [r.city, r.province].filter(Boolean).join(', ') || r.location || 'Sin ubicación';
    if (loc === 'Sin ubicación') return;

    if (!resourcesByLocCat[loc]) resourcesByLocCat[loc] = {};
    const cat = r.category || 'other';
    resourcesByLocCat[loc][cat] = (resourcesByLocCat[loc][cat] || 0) + 1;
  });

  // Find matches: territory + theme need + matching resource category
  const matches: MatchPattern[] = [];

  for (const [loc, themes] of Object.entries(needsByLocTheme)) {
    const locResources = resourcesByLocCat[loc] || {};

    for (const [theme, needCount] of Object.entries(themes)) {
      if (needCount < minNeeds) continue;

      const matchingCategories = THEME_RESOURCE_MATCHES[theme] || [];
      for (const cat of matchingCategories) {
        const resourceCount = locResources[cat] || 0;
        if (resourceCount < minResources) continue;

        const template =
          ACTION_TEMPLATES[theme]?.[cat] || DEFAULT_TEMPLATE;

        matches.push({
          territoryName: loc,
          needTheme: theme,
          needThemeLabel: THEME_LABELS[theme] || theme,
          needCount,
          resourceCategory: cat,
          resourceCategoryLabel: RESOURCE_LABELS[cat] || cat,
          resourceCount,
          suggestedAction: template.action,
          precedent: template.precedent,
        });
      }
    }
  }

  // Sort by combined signal (need + resource)
  matches.sort((a, b) => (b.needCount + b.resourceCount) - (a.needCount + a.resourceCount));

  return matches;
}

/**
 * Scan and save suggestions to database
 */
export async function scanAndSaveSuggestions(mandateId?: number): Promise<any[]> {
  const matches = await scanForMatches();
  const saved = [];

  for (const match of matches.slice(0, 10)) {
    const suggestion = await storage.createSuggestion({
      mandateId: mandateId || null,
      territoryName: match.territoryName,
      needCategory: match.needTheme,
      needCount: match.needCount,
      resourceCount: match.resourceCount,
      suggestedAction: `${match.suggestedAction}\n\n${match.needCount} personas necesitan ${match.needThemeLabel}. ${match.resourceCount} personas con capacidad en ${match.resourceCategoryLabel} están disponibles.`,
      precedent: match.precedent,
      status: 'suggested',
    });
    saved.push({ suggestion, match });
  }

  return saved;
}
