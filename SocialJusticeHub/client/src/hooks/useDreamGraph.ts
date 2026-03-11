import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { Dream } from '@shared/schema';
import {
  TYPE_COLORS,
  TYPE_LABELS,
  THEME_KEYWORDS,
  THEME_META,
  extractWords,
  DreamType,
  ThemeKey,
} from './useConvergenceAnalysis';

// ─── Types ───

export interface ClusterEntry {
  text: string;
  location: string | null;
  createdAt: string | null;
}

export interface GraphStats {
  totalEntries: number;
  totalNodes: number;
  totalEdges: number;
  byType: Record<DreamType, number>;
  convergencePercent: number;
}

const DREAM_TYPES: DreamType[] = ['dream', 'value', 'need', 'basta', 'compromiso', 'recurso'];

// Hexagon positions for hub nodes (6 types now)
const HUB_POSITIONS: Record<DreamType, { x: number; y: number }> = {
  dream:      { x: 0,     y: -250 },
  value:      { x: 217,   y: -125 },
  need:       { x: 217,   y: 125 },
  basta:      { x: 0,     y: 250 },
  compromiso: { x: -217,  y: 125 },
  recurso:    { x: -217,  y: -125 },
};

export const useDreamGraph = () => {
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

  const isLoading = dreamsLoading || commitmentsLoading;

  const { graph, stats, clusterData } = useMemo(() => {
    const g = new Graph({ multi: false, type: 'undirected' });
    const typeCounts: Record<DreamType, number> = {
      dream: 0, value: 0, need: 0, basta: 0, compromiso: 0, recurso: 0,
    };
    // Store entries per cluster for the detail panel
    const clusters: Record<string, ClusterEntry[]> = {};
    let totalEntries = 0;

    // Merge dreams + commitments
    const commitments = commitmentsResponse?.data?.commitments || [];
    const mappedCompromisos = commitments.map((c: any) => ({
      id: c.id + 1_000_000,
      type: 'compromiso' as const,
      compromiso: c.commitmentText,
      dream: null, value: null, need: null, basta: null,
      location: [c.city, c.province].filter(Boolean).join(', ') || null,
      createdAt: c.createdAt,
    }));
    const allEntries = [...dreams, ...mappedCompromisos];

    if (allEntries.length === 0) {
      return {
        graph: g,
        stats: { totalEntries: 0, totalNodes: 0, totalEdges: 0, byType: typeCounts, convergencePercent: 0 },
        clusterData: clusters,
      };
    }

    const themeKeys = Object.keys(THEME_KEYWORDS) as ThemeKey[];

    // ──────────────────────────────────────────────
    // Phase 1: Classify every entry into clusters
    // A cluster = (dreamType, themeKey) pair
    // Entries matching no theme go into a "general" pseudo-cluster
    // ──────────────────────────────────────────────

    // clusterCounts[type][theme] = count
    const clusterCounts: Record<DreamType, Record<ThemeKey | 'general', number>> = {} as any;
    // clusterEntries[type][theme] = entries
    const clusterEntryMap: Record<DreamType, Record<ThemeKey | 'general', ClusterEntry[]>> = {} as any;
    // Which types contributed to each theme
    const themeTypePresence: Record<ThemeKey, Set<DreamType>> = {} as any;

    for (const type of DREAM_TYPES) {
      clusterCounts[type] = {} as any;
      clusterEntryMap[type] = {} as any;
      for (const tk of themeKeys) {
        clusterCounts[type][tk] = 0;
        clusterEntryMap[type][tk] = [];
      }
      clusterCounts[type]['general'] = 0;
      clusterEntryMap[type]['general'] = [];
    }
    for (const tk of themeKeys) {
      themeTypePresence[tk] = new Set();
    }

    allEntries.forEach((entry: any) => {
      for (const type of DREAM_TYPES) {
        const text = type === 'compromiso' ? entry.compromiso : entry[type];
        if (!text) continue;

        typeCounts[type]++;
        totalEntries++;

        const words = extractWords(text);
        const matchedThemes = new Set<ThemeKey>();
        for (const w of words) {
          for (const tk of themeKeys) {
            if (THEME_KEYWORDS[tk].some((kw) => w.includes(kw) || kw.includes(w))) {
              matchedThemes.add(tk);
            }
          }
        }

        const entryData: ClusterEntry = {
          text,
          location: entry.location || null,
          createdAt: entry.createdAt || null,
        };

        if (matchedThemes.size === 0) {
          // No theme match — goes to general
          clusterCounts[type]['general']++;
          clusterEntryMap[type]['general'].push(entryData);
        } else {
          // Add to each matched theme cluster
          for (const tk of matchedThemes) {
            clusterCounts[type][tk]++;
            clusterEntryMap[type][tk].push(entryData);
            themeTypePresence[tk].add(type);
          }
        }
      }
    });

    // ──────────────────────────────────────────────
    // Phase 2: Build graph nodes
    // ──────────────────────────────────────────────

    // 2a. Hub nodes (5 type hubs)
    for (const type of DREAM_TYPES) {
      g.addNode(`hub-${type}`, {
        label: TYPE_LABELS[type],
        x: HUB_POSITIONS[type].x,
        y: HUB_POSITIONS[type].y,
        size: 28,
        color: TYPE_COLORS[type],
        nodeType: 'hub',
        dreamType: type,
      });
    }

    // 2b. Theme nodes (outer ring, only if they have any entries)
    const activeThemes: ThemeKey[] = [];
    for (const tk of themeKeys) {
      if (themeTypePresence[tk].size === 0) continue;
      activeThemes.push(tk);

      const idx = themeKeys.indexOf(tk);
      const angle = (idx / themeKeys.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 400;

      g.addNode(`theme-${tk}`, {
        label: THEME_META[tk].label,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 18,
        color: '#fbbf24',
        nodeType: 'theme',
        themeKey: tk,
      });
    }

    // 2c. Cluster nodes: one per (type, theme) pair with count > 0
    for (const type of DREAM_TYPES) {
      const themes: (ThemeKey | 'general')[] = [...activeThemes, 'general'];
      for (const tk of themes) {
        const count = clusterCounts[type][tk];
        if (count === 0) continue;

        const clusterId = `cluster-${type}-${tk}`;
        const themeLabel = tk === 'general' ? 'General' : THEME_META[tk].label;
        const label = `${count}`;

        // Position between hub and theme
        const hubPos = HUB_POSITIONS[type];
        let targetX: number, targetY: number;
        if (tk === 'general') {
          // General clusters stay close to hub
          const angle = Math.random() * Math.PI * 2;
          targetX = hubPos.x + Math.cos(angle) * 80;
          targetY = hubPos.y + Math.sin(angle) * 80;
        } else {
          // Position between hub and theme node
          const themeIdx = themeKeys.indexOf(tk);
          const themeAngle = (themeIdx / themeKeys.length) * Math.PI * 2 - Math.PI / 2;
          const themeX = Math.cos(themeAngle) * 400;
          const themeY = Math.sin(themeAngle) * 400;
          // 40% toward theme from hub
          targetX = hubPos.x + (themeX - hubPos.x) * 0.4;
          targetY = hubPos.y + (themeY - hubPos.y) * 0.4;
          // Add slight jitter to avoid overlap
          targetX += (Math.random() - 0.5) * 60;
          targetY += (Math.random() - 0.5) * 60;
        }

        // Size proportional to entry count (log scale for large counts)
        const clusterSize = Math.max(8, Math.min(22, 6 + Math.log2(count + 1) * 4));

        clusters[clusterId] = clusterEntryMap[type][tk];

        g.addNode(clusterId, {
          label,
          x: targetX,
          y: targetY,
          size: clusterSize,
          color: TYPE_COLORS[type],
          nodeType: 'cluster',
          dreamType: type,
          themeKey: tk,
          themeLabel,
          count,
        });

        // Edge: hub → cluster
        g.addEdge(`hub-${type}`, clusterId, {
          color: TYPE_COLORS[type] + '30',
          size: Math.max(1, Math.min(3, count * 0.3)),
          edgeType: 'hub-cluster',
        });

        // Edge: cluster → theme (if not general)
        if (tk !== 'general' && g.hasNode(`theme-${tk}`)) {
          g.addEdge(clusterId, `theme-${tk}`, {
            color: '#fbbf2420',
            size: Math.max(0.5, Math.min(2, count * 0.2)),
            edgeType: 'cluster-theme',
          });
        }
      }
    }

    // 2d. Cross-theme connections (themes sharing types = convergence bridges)
    for (let i = 0; i < activeThemes.length; i++) {
      for (let j = i + 1; j < activeThemes.length; j++) {
        const t1 = activeThemes[i];
        const t2 = activeThemes[j];
        // Count shared types between the two themes
        const sharedTypes = DREAM_TYPES.filter(
          (dt) => themeTypePresence[t1].has(dt) && themeTypePresence[t2].has(dt)
        );
        if (sharedTypes.length >= 2) {
          g.addEdge(`theme-${t1}`, `theme-${t2}`, {
            color: '#fbbf2425',
            size: Math.min(2.5, sharedTypes.length * 0.5),
            edgeType: 'theme-theme',
          });
        }
      }
    }

    // ──────────────────────────────────────────────
    // Phase 3: ForceAtlas2 layout
    // ──────────────────────────────────────────────
    if (g.order > 1) {
      // Fix hub + theme positions
      for (const type of DREAM_TYPES) {
        g.setNodeAttribute(`hub-${type}`, 'fixed', true);
      }
      for (const tk of activeThemes) {
        g.setNodeAttribute(`theme-${tk}`, 'fixed', true);
      }

      forceAtlas2.assign(g, {
        iterations: 80,
        settings: {
          gravity: 2,
          scalingRatio: 15,
          strongGravityMode: true,
          barnesHutOptimize: true,
          slowDown: 8,
        },
      });

      // Unfix all
      g.forEachNode((node) => {
        if (g.getNodeAttribute(node, 'fixed')) {
          g.removeNodeAttribute(node, 'fixed');
        }
      });
    }

    // ──────────────────────────────────────────────
    // Phase 4: Stats
    // ──────────────────────────────────────────────
    let sharedThemeCount = 0;
    for (const tk of activeThemes) {
      if (themeTypePresence[tk].size >= 2) sharedThemeCount++;
    }
    const convergencePercent = activeThemes.length > 0
      ? Math.round((sharedThemeCount / activeThemes.length) * 100)
      : 0;

    return {
      graph: g,
      stats: {
        totalEntries,
        totalNodes: g.order,
        totalEdges: g.size,
        byType: typeCounts,
        convergencePercent,
      },
      clusterData: clusters,
    };
  }, [dreams, commitmentsResponse]);

  return { graph, stats, clusterData, isLoading };
};
