import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dream } from '@shared/schema';
import {
  THEME_KEYWORDS,
  THEME_META,
  TYPE_COLORS,
  TYPE_LABELS,
  type ThemeKey,
  type DreamType,
} from './useConvergenceAnalysis';

// Re-export for consumer convenience
export { THEME_META, TYPE_COLORS, TYPE_LABELS, type ThemeKey, type DreamType };

// ─── Local word-extraction utils (same pattern as useMapPulseAnalysis) ───

const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'que', 'y', 'a', 'en', 'ser', 'se', 'no', 'haber',
  'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le',
  'es', 'son', 'está', 'están', 'esté', 'estén', 'sea', 'sean',
  'ha', 'han', 'he', 'has', 'hay', 'había', 'habían', 'habrá',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
  'aquel', 'aquella', 'aquellos', 'aquellas', 'les', 'lo',
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

// ─── Constants ───

const DREAM_TYPES: DreamType[] = ['dream', 'value', 'need', 'basta', 'compromiso'];
const THEME_KEYS = Object.keys(THEME_KEYWORDS) as ThemeKey[];

const VERB_MAP: Record<DreamType, string> = {
  dream: 'sueña con',
  value: 'defiende',
  need:  'necesita',
  basta: 'exige',
  compromiso: 'se compromete con',
};

// ─── Interfaces ───

export interface MandatoArticle {
  rank: number;
  theme: ThemeKey;
  label: string;
  icon: string;
  combinedSignal: number;
  penetration: Record<DreamType, number>;
  quotes: Partial<Record<DreamType, string>>;
}

export interface MandatoSection {
  articles: MandatoArticle[];
}

export interface VoiceEntry {
  id: number;
  text: string;
  type: DreamType;
  location: string | null;
  theme: ThemeKey;
}

export interface VocesSection {
  entries: VoiceEntry[];
}

export interface BastaKeyword {
  word: string;
  count: number;
  declarations: string[];
}

export interface RedLinesSection {
  totalBastaCount: number;
  keywords: BastaKeyword[];
  rawDeclarations: Array<{ text: string; location: string | null }>;
}

export interface TerritoryCard {
  location: string;
  totalCount: number;
  typeCounts: Record<DreamType, number>;
  dominantType: DreamType;
  topTheme: { theme: ThemeKey; label: string };
  headline: string;
}

export interface TermometroSection {
  territories: TerritoryCard[];
}

export interface MomentumData {
  thisWeek: number;
  lastWeek: number;
  changePercent: number;
  isGrowing: boolean;
  dailyTotals: Array<{ date: string; total: number }>;
  totalAllTime: number;
}

export interface TerritoryPulseData {
  mandato: MandatoSection;
  voces: VocesSection;
  redLines: RedLinesSection;
  termometro: TermometroSection;
  momentum: MomentumData;
  totalContributions: number;
  isLoading: boolean;
}

// ─── Helper: match word against a theme's keywords ───

const matchesTheme = (word: string, theme: ThemeKey): boolean =>
  THEME_KEYWORDS[theme].some((kw) => word.includes(kw) || kw.includes(word));

// ─── Hook ───

export const useTerritoryPulse = (): TerritoryPulseData => {
  const { data: dreams = [], isLoading } = useQuery<Dream[]>({
    queryKey: ['/api/dreams'],
    staleTime: 30000,
  });

  const { data: commitmentsResponse } = useQuery({
    queryKey: ['/api/commitments'],
    queryFn: async () => {
      const res = await fetch('/api/commitments?limit=100');
      if (!res.ok) return { data: { commitments: [] } };
      return res.json();
    },
    staleTime: 30000,
  });

  const allEntries = useMemo(() => {
    const commitments = commitmentsResponse?.data?.commitments || [];
    const mappedCompromisos = commitments.map((c: any) => ({
      id: c.id + 1_000_000,
      type: 'compromiso' as const,
      compromiso: c.commitmentText,
      dream: null, value: null, need: null, basta: null,
      location: [c.city, c.province].filter(Boolean).join(', ') || null,
      latitude: c.latitude?.toString() || null,
      longitude: c.longitude?.toString() || null,
      createdAt: c.createdAt,
    }));
    return [...dreams, ...mappedCompromisos];
  }, [dreams, commitmentsResponse]);

  return useMemo(() => {
    const empty: TerritoryPulseData = {
      mandato: { articles: [] },
      voces: { entries: [] },
      redLines: { totalBastaCount: 0, keywords: [], rawDeclarations: [] },
      termometro: { territories: [] },
      momentum: {
        thisWeek: 0, lastWeek: 0, changePercent: 0,
        isGrowing: false, dailyTotals: [], totalAllTime: 0,
      },
      totalContributions: 0,
      isLoading,
    };

    if (!allEntries.length) return empty;

    // ── Accumulators ──

    // Mandato: theme presence per type
    const themePresence: Record<ThemeKey, Record<DreamType, Set<number>>> = {} as any;
    const themeHits: Record<ThemeKey, Record<DreamType, number>> = {} as any;
    const themeQuotes: Record<ThemeKey, Partial<Record<DreamType, string>>> = {} as any;
    for (const tk of THEME_KEYS) {
      themePresence[tk] = { dream: new Set(), value: new Set(), need: new Set(), basta: new Set(), compromiso: new Set() };
      themeHits[tk] = { dream: 0, value: 0, need: 0, basta: 0, compromiso: 0 };
      themeQuotes[tk] = {};
    }
    const totalWithText: Record<DreamType, number> = { dream: 0, value: 0, need: 0, basta: 0, compromiso: 0 };

    // Voces: candidate entries per theme
    const voiceCandidates: Map<ThemeKey, VoiceEntry[]> = new Map();
    for (const tk of THEME_KEYS) voiceCandidates.set(tk, []);

    // Red lines: basta word freq + raw texts
    let totalBastaCount = 0;
    const bastaWordCounts: Record<string, number> = {};
    const bastaWordTexts: Record<string, string[]> = {};
    const bastaRawTexts: Array<{ text: string; location: string | null; length: number }> = [];

    // Termometro: location tracking
    const locTypeCounts: Record<string, Record<DreamType, number>> = {};
    const locThemeHits: Record<string, Record<ThemeKey, number>> = {};

    // Momentum: temporal
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    let thisWeek = 0;
    let lastWeek = 0;
    const dailyBuckets: Record<string, number> = {};
    // Prepare 30-day buckets
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dailyBuckets[d.toISOString().split('T')[0]] = 0;
    }

    // ── Single pass ──

    allEntries.forEach((entry: any, idx: number) => {
      // Momentum: temporal bucketing
      const created = entry.createdAt ? new Date(entry.createdAt) : null;
      if (created) {
        if (created >= oneWeekAgo) thisWeek++;
        else if (created >= twoWeeksAgo) lastWeek++;
        const dateKey = created.toISOString().split('T')[0];
        if (dateKey in dailyBuckets) dailyBuckets[dateKey]++;
      }

      const loc = entry.location || 'Sin ubicación';

      // Location accumulator init
      if (!locTypeCounts[loc]) {
        locTypeCounts[loc] = { dream: 0, value: 0, need: 0, basta: 0, compromiso: 0 };
        locThemeHits[loc] = {} as Record<ThemeKey, number>;
        for (const tk of THEME_KEYS) locThemeHits[loc][tk] = 0;
      }

      // Process each type field
      for (const type of DREAM_TYPES) {
        const text = entry[type] as string | null;
        if (!text || !text.trim()) continue;

        totalWithText[type]++;
        locTypeCounts[loc][type]++;

        const words = extractWords(text);
        const matchedThemes = new Set<ThemeKey>();

        for (const w of words) {
          for (const tk of THEME_KEYS) {
            if (matchesTheme(w, tk)) {
              themeHits[tk][type]++;
              locThemeHits[loc][tk]++;

              if (!matchedThemes.has(tk)) {
                matchedThemes.add(tk);
                themePresence[tk][type].add(idx);

                // Store first quote per theme per type
                if (!themeQuotes[tk][type]) {
                  themeQuotes[tk][type] = text.length > 140 ? text.slice(0, 140) + '…' : text;
                }
              }
            }
          }

          // Basta word counting
          if (type === 'basta') {
            bastaWordCounts[w] = (bastaWordCounts[w] || 0) + 1;
          }
        }

        // Voice candidate (if matches any top theme)
        if (matchedThemes.size > 0 && text.length > 20) {
          const primaryTheme = [...matchedThemes][0];
          const candidate: VoiceEntry = {
            id: entry.id,
            text: text.length > 200 ? text.slice(0, 200) + '…' : text,
            type,
            location: entry.location,
            theme: primaryTheme,
          };
          voiceCandidates.get(primaryTheme)?.push(candidate);
        }

        // Basta raw text collection
        if (type === 'basta') {
          totalBastaCount++;
          bastaRawTexts.push({
            text: text.length > 200 ? text.slice(0, 200) + '…' : text,
            location: entry.location,
            length: text.length,
          });

          // Store basta texts by word for excerpts
          for (const w of words) {
            if (!bastaWordTexts[w]) bastaWordTexts[w] = [];
            if (bastaWordTexts[w].length < 3) {
              bastaWordTexts[w].push(text.length > 150 ? text.slice(0, 150) + '…' : text);
            }
          }
        }
      }
    });

    // ── Post-pass: Section 1 - El Mandato ──

    const allArticles: MandatoArticle[] = THEME_KEYS.map((tk) => {
      const combinedSignal = DREAM_TYPES.reduce((s, t) => s + themeHits[tk][t], 0);
      const penetration: Record<DreamType, number> = {} as any;
      for (const t of DREAM_TYPES) {
        penetration[t] = totalWithText[t] > 0
          ? Math.round((themePresence[tk][t].size / totalWithText[t]) * 100)
          : 0;
      }
      return {
        rank: 0,
        theme: tk,
        label: THEME_META[tk].label,
        icon: THEME_META[tk].icon,
        combinedSignal,
        penetration,
        quotes: themeQuotes[tk],
      };
    })
      .filter((a) => a.combinedSignal > 0)
      .sort((a, b) => b.combinedSignal - a.combinedSignal)
      .slice(0, 7)
      .map((a, i) => ({ ...a, rank: i + 1 }));

    // ── Post-pass: Section 2 - Voces ──

    const topThemes = allArticles.slice(0, 5).map((a) => a.theme);
    const voiceEntries: VoiceEntry[] = [];
    for (const tk of topThemes) {
      const candidates = voiceCandidates.get(tk) || [];
      // Round-robin across types for variety
      const byType: Partial<Record<DreamType, VoiceEntry[]>> = {};
      for (const c of candidates) {
        if (!byType[c.type]) byType[c.type] = [];
        byType[c.type]!.push(c);
      }
      // Sort each type's candidates by text length (prefer more expressive)
      for (const t of DREAM_TYPES) {
        byType[t]?.sort((a, b) => b.text.length - a.text.length);
      }
      // Pick up to 3 per theme, rotating types
      let picked = 0;
      const seenIds = new Set(voiceEntries.map((v) => v.id));
      for (let round = 0; round < 2 && picked < 3; round++) {
        for (const t of DREAM_TYPES) {
          if (picked >= 3) break;
          const entry = byType[t]?.find((e) => !seenIds.has(e.id));
          if (entry) {
            voiceEntries.push(entry);
            seenIds.add(entry.id);
            picked++;
          }
        }
      }
    }

    // ── Post-pass: Section 3 - Red Lines ──

    const sortedBastaWords = Object.entries(bastaWordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7);

    const bastaKeywords: BastaKeyword[] = sortedBastaWords.map(([word, count]) => ({
      word,
      count,
      declarations: bastaWordTexts[word]?.slice(0, 3) || [],
    }));

    const rawDeclarations = bastaRawTexts
      .sort((a, b) => b.length - a.length)
      .slice(0, 5)
      .map(({ text, location }) => ({ text, location }));

    // ── Post-pass: Section 4 - Termometro ──

    const territories: TerritoryCard[] = Object.entries(locTypeCounts)
      .filter(([loc]) => loc !== 'Sin ubicación' || Object.keys(locTypeCounts).length <= 1)
      .map(([location, typeCounts]) => {
        const totalCount = DREAM_TYPES.reduce((s, t) => s + typeCounts[t], 0);

        // Dominant type
        let dominantType: DreamType = 'dream';
        let maxTypeCount = 0;
        for (const t of DREAM_TYPES) {
          if (typeCounts[t] > maxTypeCount) {
            maxTypeCount = typeCounts[t];
            dominantType = t;
          }
        }

        // Top theme for this location
        let topThemeKey: ThemeKey = 'values';
        let maxThemeHits = 0;
        for (const tk of THEME_KEYS) {
          const hits = locThemeHits[location]?.[tk] || 0;
          if (hits > maxThemeHits) {
            maxThemeHits = hits;
            topThemeKey = tk;
          }
        }

        const headline = `${location} ${VERB_MAP[dominantType]} ${THEME_META[topThemeKey].label}`;

        return {
          location,
          totalCount,
          typeCounts,
          dominantType,
          topTheme: { theme: topThemeKey, label: THEME_META[topThemeKey].label },
          headline,
        };
      })
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 6);

    // ── Post-pass: Section 5 - Momentum ──

    const changePercent = lastWeek > 0
      ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
      : thisWeek > 0 ? 100 : 0;

    const dailyTotals = Object.entries(dailyBuckets).map(([date, total]) => ({ date, total }));

    return {
      mandato: { articles: allArticles },
      voces: { entries: voiceEntries },
      redLines: { totalBastaCount, keywords: bastaKeywords, rawDeclarations },
      termometro: { territories },
      momentum: {
        thisWeek,
        lastWeek,
        changePercent,
        isGrowing: changePercent > 0,
        dailyTotals,
        totalAllTime: allEntries.length,
      },
      totalContributions: allEntries.length,
      isLoading,
    };
  }, [allEntries, isLoading]);
};
