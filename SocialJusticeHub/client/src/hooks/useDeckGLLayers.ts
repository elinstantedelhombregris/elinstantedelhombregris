import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dream } from '@shared/schema';

// ─── Types ───

export interface DeckGLData {
  hexagonData: Array<{ position: [number, number]; weight: number }>;
  arcData: Array<{
    source: [number, number];
    target: [number, number];
    theme: string;
    sourceLabel: string;
    targetLabel: string;
  }>;
  isLoading: boolean;
}

interface LocationBucket {
  location: string;
  lat: number;
  lng: number;
  count: number;
  themes: Record<string, number>;
}

// ─── Helpers ───

function parseCoord(val: string | number | null | undefined): number | null {
  if (val == null) return null;
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return isFinite(n) ? n : null;
}

function getTopTheme(themes: Record<string, number>): string | null {
  let best: string | null = null;
  let bestCount = 0;
  for (const [theme, count] of Object.entries(themes)) {
    if (count > bestCount) {
      bestCount = count;
      best = theme;
    }
  }
  return best;
}

// ─── Hook ───

export const useDeckGLLayers = (): DeckGLData => {
  const { data: dreams = [], isLoading: dreamsLoading } = useQuery<Dream[]>({
    queryKey: ['/api/dreams'],
    staleTime: 30000,
  });

  const { data: commitmentsResponse, isLoading: commitmentsLoading } = useQuery({
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

  const isLoading = dreamsLoading || commitmentsLoading || resourcesLoading;

  // Unify all entries with lat/lng
  const allEntries = useMemo(() => {
    const commitments = commitmentsResponse?.data?.commitments || [];

    const entries: Array<{
      lat: number;
      lng: number;
      location: string;
      type: string;
      text: string;
    }> = [];

    // Dreams
    for (const d of dreams) {
      const lat = parseCoord((d as any).latitude);
      const lng = parseCoord((d as any).longitude);
      if (lat == null || lng == null) continue;
      const text = (d as any).dream || (d as any).value || (d as any).need || (d as any).basta || '';
      entries.push({
        lat,
        lng,
        location: (d as any).location || 'Sin ubicación',
        type: (d as any).type || 'dream',
        text,
      });
    }

    // Commitments
    for (const c of commitments) {
      const lat = parseCoord(c.latitude);
      const lng = parseCoord(c.longitude);
      if (lat == null || lng == null) continue;
      entries.push({
        lat,
        lng,
        location: [c.city, c.province].filter(Boolean).join(', ') || 'Sin ubicación',
        type: 'compromiso',
        text: c.commitmentText || '',
      });
    }

    // Resources
    for (const r of (resourcesData || [])) {
      const lat = parseCoord(r.latitude);
      const lng = parseCoord(r.longitude);
      if (lat == null || lng == null) continue;
      entries.push({
        lat,
        lng,
        location: [r.city, r.province].filter(Boolean).join(', ') || r.location || 'Sin ubicación',
        type: 'recurso',
        text: r.description || '',
      });
    }

    return entries;
  }, [dreams, commitmentsResponse, resourcesData]);

  // Build hexagon data
  const hexagonData = useMemo(
    () =>
      allEntries.map((e) => ({
        position: [e.lng, e.lat] as [number, number],
        weight: 1,
      })),
    [allEntries],
  );

  // Build arc data — connect locations sharing a top theme
  const arcData = useMemo(() => {
    // Group by location
    const buckets: Record<string, LocationBucket> = {};

    for (const entry of allEntries) {
      const key = entry.location;
      if (!buckets[key]) {
        buckets[key] = {
          location: key,
          lat: entry.lat,
          lng: entry.lng,
          count: 0,
          themes: {},
        };
      }
      buckets[key].count++;
      // Simple theme detection: use entry type as a lightweight theme proxy
      const theme = entry.type;
      buckets[key].themes[theme] = (buckets[key].themes[theme] || 0) + 1;
    }

    // Filter locations with 3+ entries
    const qualifiedLocations = Object.values(buckets).filter((b) => b.count >= 3);

    // Group qualified locations by their top theme
    const themeGroups: Record<string, LocationBucket[]> = {};
    for (const loc of qualifiedLocations) {
      const top = getTopTheme(loc.themes);
      if (!top) continue;
      if (!themeGroups[top]) themeGroups[top] = [];
      themeGroups[top].push(loc);
    }

    // Create arcs between locations sharing the same top theme
    const arcs: DeckGLData['arcData'] = [];
    for (const [theme, locations] of Object.entries(themeGroups)) {
      if (locations.length < 2) continue;
      // Connect each pair (limit to first 10 locations per theme to avoid arc explosion)
      const limited = locations.slice(0, 10);
      for (let i = 0; i < limited.length; i++) {
        for (let j = i + 1; j < limited.length; j++) {
          arcs.push({
            source: [limited[i].lng, limited[i].lat],
            target: [limited[j].lng, limited[j].lat],
            theme,
            sourceLabel: limited[i].location,
            targetLabel: limited[j].location,
          });
        }
      }
    }

    return arcs;
  }, [allEntries]);

  return { hexagonData, arcData, isLoading };
};
