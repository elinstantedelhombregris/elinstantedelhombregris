import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dream } from '@shared/schema';

// --- Reuse patterns from useMapPulseAnalysis / useWordCloudAnalysis ---

const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'que', 'y', 'a', 'en', 'ser', 'se', 'no', 'haber',
  'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le',
  'es', 'son', 'está', 'están', 'esté', 'estén', 'sea', 'sean',
  'ha', 'han', 'he', 'has', 'hay', 'había', 'habían', 'habrá',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
  'aquel', 'aquella', 'aquellos', 'aquellas', 'le', 'les', 'lo',
  'me', 'te', 'nos', 'os', 'mi', 'tu', 'nuestro', 'vuestro',
  'mío', 'tuyo', 'suyo', 'mía', 'tuya', 'suya',
  'muy', 'más', 'menos', 'tan', 'tanto', 'mucho', 'poco',
  'todo', 'toda', 'todos', 'todas', 'algo', 'nada', 'alguien', 'nadie',
  'mismo', 'misma', 'otro', 'otra', 'otros', 'otras',
  'cada', 'varios', 'varias', 'algún', 'alguna', 'algunos',
  'ningún', 'ninguna', 'cualquier', 'bien', 'mal',
  'pero', 'sino', 'porque', 'pues', 'cuando', 'donde', 'quien',
  'hacer', 'decir', 'poder', 'deber', 'ir', 'ver', 'dar', 'saber',
  'querer', 'llegar', 'pasar', 'quedar', 'sobre', 'entre', 'hacia',
  'desde', 'hasta', 'durante', 'mediante', 'según', 'bajo', 'ante',
  'tras', 'sin',
]);

const normalizeWord = (word: string): string =>
  word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:¡!¿?()[\]{}«»""'/\\-]/g, '')
    .trim();

const extractWords = (text: string | null): string[] => {
  if (!text) return [];
  return text
    .split(/\s+/)
    .map(normalizeWord)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
};

// --- 9 thematic categories (from useWordCloudAnalysis TRANSFORMATIVE_KEYWORDS) ---

export type ThemeKey =
  | 'systemic'
  | 'values'
  | 'action'
  | 'development'
  | 'justice'
  | 'economy'
  | 'health'
  | 'community'
  | 'future';

export type DreamType = 'dream' | 'value' | 'need' | 'basta';

export const THEME_KEYWORDS: Record<ThemeKey, string[]> = {
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

export const THEME_META: Record<ThemeKey, { label: string; icon: string }> = {
  systemic:    { label: 'Transformacion Sistémica', icon: 'RefreshCw' },
  values:      { label: 'Valores Fundamentales',    icon: 'Heart' },
  action:      { label: 'Acción y Agencia',         icon: 'Zap' },
  development: { label: 'Desarrollo Humano',        icon: 'GraduationCap' },
  justice:     { label: 'Justicia y Derechos',       icon: 'Scale' },
  economy:     { label: 'Economía y Recursos',       icon: 'Briefcase' },
  health:      { label: 'Salud y Vida',              icon: 'HeartPulse' },
  community:   { label: 'Comunidad y Colectivo',     icon: 'Users' },
  future:      { label: 'Futuro y Visión',           icon: 'Sunrise' },
};

export const TYPE_COLORS: Record<DreamType, string> = {
  dream: '#3b82f6',
  value: '#ec4899',
  need:  '#f59e0b',
  basta: '#ef4444',
};

export const TYPE_LABELS: Record<DreamType, string> = {
  dream: 'Sueños',
  value: 'Valores',
  need:  'Necesidades',
  basta: '¡BASTA!',
};

const DREAM_TYPES: DreamType[] = ['dream', 'value', 'need', 'basta'];

// --- Interfaces ---

export interface ThemeCard {
  theme: ThemeKey;
  label: string;
  icon: string;
  /** which types contributed at least one entry to this theme */
  presentTypes: DreamType[];
  /** convergence = how many of the 4 types share this theme */
  convergenceCount: number;
  /** real text excerpts per type */
  quotes: Partial<Record<DreamType, string[]>>;
  /** total word hits across all types */
  totalHits: number;
}

export interface SharedConcept {
  word: string;
  display: string;
  totalCount: number;
  typeCount: number;
  presentTypes: DreamType[];
}

export interface StreamLink {
  source: DreamType;
  theme: ThemeKey;
  strength: number;
}

export interface ConvergenceData {
  convergencePercentage: number;
  sharedThemeCount: number;
  totalActiveThemes: number;
  themeCards: ThemeCard[];
  sharedConcepts: SharedConcept[];
  streamLinks: StreamLink[];
  totalContributions: number;
  isLoading: boolean;
}

// --- Hook ---

export const useConvergenceAnalysis = (): ConvergenceData => {
  const { data: dreams = [], isLoading } = useQuery<Dream[]>({
    queryKey: ['/api/dreams'],
    staleTime: 30000,
  });

  return useMemo(() => {
    if (!dreams.length) {
      return {
        convergencePercentage: 0,
        sharedThemeCount: 0,
        totalActiveThemes: 0,
        themeCards: [],
        sharedConcepts: [],
        streamLinks: [],
        totalContributions: 0,
        isLoading,
      };
    }

    // 1. For each dream entry, extract words and classify into themes per type
    // themePresence[theme][type] = Set of entry indices that contributed
    const themePresence: Record<ThemeKey, Record<DreamType, Set<number>>> = {} as any;
    // themeQuotes[theme][type] = string excerpts
    const themeQuotes: Record<ThemeKey, Record<DreamType, string[]>> = {} as any;
    // themeHits[theme][type] = word hit count
    const themeHits: Record<ThemeKey, Record<DreamType, number>> = {} as any;

    const themeKeys = Object.keys(THEME_KEYWORDS) as ThemeKey[];
    for (const tk of themeKeys) {
      themePresence[tk] = { dream: new Set(), value: new Set(), need: new Set(), basta: new Set() };
      themeQuotes[tk] = { dream: [], value: [], need: [], basta: [] };
      themeHits[tk] = { dream: 0, value: 0, need: 0, basta: 0 };
    }

    // word-level cross-type tracking
    const wordByType: Record<string, Record<DreamType, number>> = {};

    dreams.forEach((entry, idx) => {
      for (const type of DREAM_TYPES) {
        const text = entry[type] as string | null;
        if (!text) continue;

        const words = extractWords(text);
        const matchedThemes = new Set<ThemeKey>();

        for (const w of words) {
          // track word-level stats
          if (!wordByType[w]) wordByType[w] = { dream: 0, value: 0, need: 0, basta: 0 };
          wordByType[w][type]++;

          // classify into themes
          for (const tk of themeKeys) {
            if (THEME_KEYWORDS[tk].some((kw) => w.includes(kw) || kw.includes(w))) {
              themeHits[tk][type]++;
              if (!matchedThemes.has(tk)) {
                matchedThemes.add(tk);
                themePresence[tk][type].add(idx);
                // store quote (max 2 per type per theme)
                if (themeQuotes[tk][type].length < 2) {
                  const snippet = text.length > 120 ? text.slice(0, 120) + '…' : text;
                  themeQuotes[tk][type].push(snippet);
                }
              }
            }
          }
        }
      }
    });

    // 2. Build theme cards
    const allThemeCards: ThemeCard[] = themeKeys.map((tk) => {
      const presentTypes = DREAM_TYPES.filter((t) => themePresence[tk][t].size > 0);
      const totalHits = DREAM_TYPES.reduce((sum, t) => sum + themeHits[tk][t], 0);
      const quotes: Partial<Record<DreamType, string[]>> = {};
      for (const t of presentTypes) {
        if (themeQuotes[tk][t].length > 0) quotes[t] = themeQuotes[tk][t];
      }
      return {
        theme: tk,
        label: THEME_META[tk].label,
        icon: THEME_META[tk].icon,
        presentTypes,
        convergenceCount: presentTypes.length,
        quotes,
        totalHits,
      };
    });

    // themes with any presence
    const activeThemes = allThemeCards.filter((c) => c.convergenceCount > 0);
    const sharedThemes = allThemeCards.filter((c) => c.convergenceCount >= 2);

    // 3. Convergence percentage
    const convergencePercentage =
      activeThemes.length > 0
        ? Math.round((sharedThemes.length / activeThemes.length) * 100)
        : 0;

    // 4. Sort theme cards: 4-type first, then by totalHits, take top 7
    const sortedCards = [...sharedThemes]
      .sort((a, b) => b.convergenceCount - a.convergenceCount || b.totalHits - a.totalHits)
      .slice(0, 7);

    // 5. Shared concepts (words present in 2+ types)
    const sharedConcepts: SharedConcept[] = Object.entries(wordByType)
      .map(([word, counts]) => {
        const presentTypes = DREAM_TYPES.filter((t) => counts[t] > 0);
        const totalCount = DREAM_TYPES.reduce((s, t) => s + counts[t], 0);
        return {
          word,
          display: word.charAt(0).toUpperCase() + word.slice(1),
          totalCount,
          typeCount: presentTypes.length,
          presentTypes,
        };
      })
      .filter((c) => c.typeCount >= 2)
      .sort((a, b) => b.typeCount - a.typeCount || b.totalCount - a.totalCount)
      .slice(0, 30);

    // 6. Stream links for flow diagram
    const streamLinks: StreamLink[] = [];
    for (const card of sortedCards) {
      for (const type of card.presentTypes) {
        streamLinks.push({
          source: type,
          theme: card.theme,
          strength: themeHits[card.theme][type],
        });
      }
    }

    return {
      convergencePercentage,
      sharedThemeCount: sharedThemes.length,
      totalActiveThemes: activeThemes.length,
      themeCards: sortedCards,
      sharedConcepts,
      streamLinks,
      totalContributions: dreams.length,
      isLoading,
    };
  }, [dreams, isLoading]);
};
