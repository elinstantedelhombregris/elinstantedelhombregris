import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dream } from '@shared/schema';
import {
  THEME_KEYWORDS,
  THEME_META,
  type ThemeKey,
  type DreamType,
  extractWords,
} from './useConvergenceAnalysis';

// Resource categories mapped to themes they can address
const RESOURCE_THEME_MAP: Record<string, ThemeKey[]> = {
  legal: ['justice', 'systemic'],
  medical: ['health'],
  education: ['development', 'future'],
  tech: ['systemic', 'action', 'economy'],
  construction: ['community', 'economy'],
  agriculture: ['economy', 'health', 'community'],
  communication: ['action', 'values', 'community'],
  admin: ['systemic', 'economy'],
  transport: ['community', 'economy'],
  space: ['community', 'action'],
  equipment: ['economy', 'action'],
  other: [],
};

const THEME_KEYS = Object.keys(THEME_KEYWORDS) as ThemeKey[];

export interface TerritoryGap {
  location: string;
  needIntensity: number;
  resourceAvailability: number;
  gapScore: number; // positive = unmet need, negative = surplus
  isOpportunityZone: boolean; // high need AND high resources
  isCrisisZone: boolean; // high need AND low resources
  topNeeds: Array<{ theme: ThemeKey; label: string; count: number }>;
  availableResources: Array<{ category: string; count: number }>;
  themeGaps: Array<{
    theme: ThemeKey;
    label: string;
    needCount: number;
    resourceCount: number;
    gap: number;
  }>;
}

export interface GapAnalysisData {
  territories: TerritoryGap[];
  globalGap: {
    totalNeeds: number;
    totalResources: number;
    topUnmetThemes: Array<{ theme: ThemeKey; label: string; gap: number }>;
    topOpportunities: Array<{ theme: ThemeKey; label: string; needCount: number; resourceCount: number }>;
  };
  opportunityZones: TerritoryGap[];
  crisisZones: TerritoryGap[];
  isLoading: boolean;
}

export const useGapAnalysis = (): GapAnalysisData => {
  const { data: dreams = [], isLoading: dreamsLoading } = useQuery<Dream[]>({
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

  const { data: resourcesData = [], isLoading: resourcesLoading } = useQuery<any[]>({
    queryKey: ['/api/resources-map'],
    staleTime: 30000,
  });

  return useMemo(() => {
    const isLoading = dreamsLoading || resourcesLoading;
    const empty: GapAnalysisData = {
      territories: [],
      globalGap: { totalNeeds: 0, totalResources: 0, topUnmetThemes: [], topOpportunities: [] },
      opportunityZones: [],
      crisisZones: [],
      isLoading,
    };

    // Merge all entries (needs + bastas only for need analysis)
    const allEntries = [...dreams];
    const commitments = commitmentsResponse?.data?.commitments || [];
    commitments.forEach((c: any) => {
      allEntries.push({
        id: c.id + 1_000_000,
        type: 'compromiso' as any,
        compromiso: c.commitmentText,
        dream: null, value: null, need: null, basta: null,
        location: [c.city, c.province].filter(Boolean).join(', ') || null,
        latitude: c.latitude?.toString() || null,
        longitude: c.longitude?.toString() || null,
        createdAt: c.createdAt,
      } as any);
    });

    const resources = resourcesData || [];
    if (allEntries.length === 0 && resources.length === 0) return empty;

    // 1. Accumulate NEEDS per location per theme
    // Focus on 'need' and 'basta' types as they represent demand
    const locNeedThemes: Record<string, Record<ThemeKey, number>> = {};
    const locResourceCats: Record<string, Record<string, number>> = {};
    const locResourceThemes: Record<string, Record<ThemeKey, number>> = {};
    const globalNeedThemes: Record<ThemeKey, number> = {} as any;
    const globalResourceThemes: Record<ThemeKey, number> = {} as any;
    for (const tk of THEME_KEYS) {
      globalNeedThemes[tk] = 0;
      globalResourceThemes[tk] = 0;
    }

    let totalNeeds = 0;

    allEntries.forEach((entry: any) => {
      const loc = entry.location || 'Sin ubicación';
      if (!locNeedThemes[loc]) {
        locNeedThemes[loc] = {} as Record<ThemeKey, number>;
        for (const tk of THEME_KEYS) locNeedThemes[loc][tk] = 0;
      }

      // Only count need and basta entries for need intensity
      for (const type of ['need', 'basta'] as const) {
        const text = entry[type] as string | null;
        if (!text) continue;
        totalNeeds++;

        const words = extractWords(text);
        const matched = new Set<ThemeKey>();
        for (const w of words) {
          for (const tk of THEME_KEYS) {
            if (!matched.has(tk) && THEME_KEYWORDS[tk].some((kw) => w.includes(kw) || kw.includes(w))) {
              matched.add(tk);
              locNeedThemes[loc][tk]++;
              globalNeedThemes[tk]++;
            }
          }
        }
      }
    });

    // 2. Accumulate RESOURCES per location per theme
    let totalResources = 0;
    resources.forEach((r: any) => {
      const loc = [r.city, r.province].filter(Boolean).join(', ') || r.location || 'Sin ubicación';
      totalResources++;

      if (!locResourceCats[loc]) locResourceCats[loc] = {};
      if (!locResourceThemes[loc]) {
        locResourceThemes[loc] = {} as Record<ThemeKey, number>;
        for (const tk of THEME_KEYS) locResourceThemes[loc][tk] = 0;
      }

      const cat = r.category || 'other';
      locResourceCats[loc][cat] = (locResourceCats[loc][cat] || 0) + 1;

      // Map resource category to themes
      const themes = RESOURCE_THEME_MAP[cat] || [];
      for (const tk of themes) {
        locResourceThemes[loc][tk]++;
        globalResourceThemes[tk]++;
      }
    });

    // 3. Build territory gap cards
    const allLocations = new Set([
      ...Object.keys(locNeedThemes),
      ...Object.keys(locResourceCats),
    ]);

    const territories: TerritoryGap[] = Array.from(allLocations)
      .filter((loc) => loc !== 'Sin ubicación')
      .map((location) => {
        const needThemes = locNeedThemes[location] || ({} as Record<ThemeKey, number>);
        const resThemes = locResourceThemes[location] || ({} as Record<ThemeKey, number>);
        const resCats = locResourceCats[location] || {};

        const needIntensity = THEME_KEYS.reduce((sum, tk) => sum + (needThemes[tk] || 0), 0);
        const resourceAvailability = Object.values(resCats).reduce((sum, c) => sum + c, 0);
        const gapScore = needIntensity - resourceAvailability;

        const NEED_THRESHOLD = 3;
        const RESOURCE_THRESHOLD = 1;
        const isOpportunityZone = needIntensity >= NEED_THRESHOLD && resourceAvailability >= RESOURCE_THRESHOLD;
        const isCrisisZone = needIntensity >= NEED_THRESHOLD && resourceAvailability < RESOURCE_THRESHOLD;

        const topNeeds = THEME_KEYS
          .filter((tk) => (needThemes[tk] || 0) > 0)
          .map((tk) => ({ theme: tk, label: THEME_META[tk].label, count: needThemes[tk] || 0 }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        const availableResources = Object.entries(resCats)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);

        const themeGaps = THEME_KEYS
          .map((tk) => ({
            theme: tk,
            label: THEME_META[tk].label,
            needCount: needThemes[tk] || 0,
            resourceCount: resThemes[tk] || 0,
            gap: (needThemes[tk] || 0) - (resThemes[tk] || 0),
          }))
          .filter((g) => g.needCount > 0 || g.resourceCount > 0)
          .sort((a, b) => b.gap - a.gap);

        return {
          location,
          needIntensity,
          resourceAvailability,
          gapScore,
          isOpportunityZone,
          isCrisisZone,
          topNeeds,
          availableResources,
          themeGaps,
        };
      })
      .sort((a, b) => b.gapScore - a.gapScore);

    // 4. Global gap analysis
    const topUnmetThemes = THEME_KEYS
      .map((tk) => ({
        theme: tk,
        label: THEME_META[tk].label,
        gap: globalNeedThemes[tk] - globalResourceThemes[tk],
      }))
      .filter((t) => t.gap > 0)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5);

    const topOpportunities = THEME_KEYS
      .map((tk) => ({
        theme: tk,
        label: THEME_META[tk].label,
        needCount: globalNeedThemes[tk],
        resourceCount: globalResourceThemes[tk],
      }))
      .filter((t) => t.needCount > 0 && t.resourceCount > 0)
      .sort((a, b) => Math.min(b.needCount, b.resourceCount) - Math.min(a.needCount, a.resourceCount))
      .slice(0, 5);

    return {
      territories,
      globalGap: {
        totalNeeds,
        totalResources,
        topUnmetThemes,
        topOpportunities,
      },
      opportunityZones: territories.filter((t) => t.isOpportunityZone),
      crisisZones: territories.filter((t) => t.isCrisisZone),
      isLoading,
    };
  }, [dreams, commitmentsResponse, resourcesData, dreamsLoading, resourcesLoading]);
};
