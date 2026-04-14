import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import Sigma from 'sigma';
import { Settings } from 'sigma/settings';
import { NodeDisplayData, EdgeDisplayData } from 'sigma/types';
import { useDreamGraph, ClusterEntry } from '@/hooks/useDreamGraph';
import { TYPE_COLORS, TYPE_LABELS, THEME_META, DreamType, ThemeKey } from '@/hooks/useConvergenceAnalysis';
import { Search, ZoomIn, ZoomOut, X, Sparkles, Globe, Link2, TrendingUp, Layers } from 'lucide-react';

const DREAM_TYPES: DreamType[] = ['dream', 'value', 'need', 'basta', 'compromiso'];

// ─── Animated Counter ───

const AnimatedCount: React.FC<{ value: number }> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.5,
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [value, inView]);

  return <span ref={ref}>0</span>;
};

// ─── Cluster Detail Panel ───

interface ClusterDetail {
  dreamType: DreamType;
  themeKey: string;
  themeLabel: string;
  count: number;
  entries: ClusterEntry[];
}

interface NodeDetail {
  nodeType: 'hub' | 'theme' | 'cluster';
  label: string;
  dreamType?: DreamType;
  themeKey?: string;
  cluster?: ClusterDetail;
}

const DetailPanel: React.FC<{ detail: NodeDetail; onClose: () => void }> = ({ detail, onClose }) => {
  const typeColor = detail.dreamType ? TYPE_COLORS[detail.dreamType] : '#fbbf24';

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed md:absolute bottom-0 md:bottom-auto md:top-4 right-0 md:right-4 w-full md:w-96 max-h-[60vh] md:max-h-[calc(100%-2rem)] overflow-hidden z-30 rounded-t-xl md:rounded-xl border border-white/10 bg-black/90 md:bg-black/80 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider text-white"
            style={{ backgroundColor: typeColor + '30', border: `1px solid ${typeColor}50` }}
          >
            {detail.nodeType === 'theme' ? 'Tema' : detail.nodeType === 'hub' ? 'Hub' : TYPE_LABELS[detail.dreamType!]}
          </span>
          {detail.cluster && (
            <span className="text-xs text-slate-500 font-mono">
              {detail.cluster.count} {detail.cluster.count === 1 ? 'entrada' : 'entradas'}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Theme label */}
      {detail.cluster && (
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <p className="text-sm text-slate-300 font-medium">
            {TYPE_LABELS[detail.dreamType!]} <span className="text-slate-600">x</span>{' '}
            <span className="text-amber-400">{detail.cluster.themeLabel}</span>
          </p>
        </div>
      )}

      {detail.nodeType === 'hub' && (
        <div className="p-4">
          <p className="text-sm text-slate-400">
            Hub central para todas las entradas de tipo <strong className="text-white">{detail.label}</strong>.
            Haz click en los nodos conectados para ver las entradas agrupadas por tema.
          </p>
        </div>
      )}

      {detail.nodeType === 'theme' && (
        <div className="p-4">
          <p className="text-sm text-slate-400">
            Categoria tematica <strong className="text-amber-400">{detail.label}</strong>.
            Los nodos conectados representan grupos de entradas que comparten este tema.
          </p>
        </div>
      )}

      {/* Entry list */}
      {detail.cluster && detail.cluster.entries.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {detail.cluster.entries.map((entry, i) => (
            <div key={i} className="rounded-lg bg-white/5 border border-white/5 p-3 space-y-1">
              <p className="text-sm text-slate-200 leading-relaxed">{entry.text}</p>
              <div className="flex items-center gap-3">
                {entry.location && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Globe className="w-3 h-3" />
                    {entry.location}
                  </span>
                )}
                {entry.createdAt && (
                  <span className="text-xs text-slate-600">
                    {new Date(entry.createdAt).toLocaleDateString('es-AR', {
                      month: 'short', day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Component ───

const ConstellationGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const { graph, stats, clusterData, isLoading } = useDreamGraph();

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<NodeDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<DreamType>>(new Set(DREAM_TYPES));
  const [searchMatches, setSearchMatches] = useState<Set<string>>(new Set());

  // Refs for reducer closures (avoids stale state in Sigma callbacks)
  const hoveredNodeRef = useRef(hoveredNode);
  const selectedNodeRef = useRef(selectedNode);
  const searchMatchesRef = useRef(searchMatches);
  const activeFiltersRef = useRef(activeFilters);
  hoveredNodeRef.current = hoveredNode;
  selectedNodeRef.current = selectedNode;
  searchMatchesRef.current = searchMatches;
  activeFiltersRef.current = activeFilters;

  // Initialize Sigma
  useEffect(() => {
    if (!containerRef.current || !graph || graph.order === 0 || sigmaRef.current) return;

    const renderer = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      defaultNodeColor: '#666',
      defaultEdgeColor: '#ffffff08',
      labelColor: { color: '#e2e8f0' },
      labelFont: 'ui-monospace, monospace',
      labelSize: 12,
      labelRenderedSizeThreshold: 6,
      zIndex: true,
      minCameraRatio: 0.15,
      maxCameraRatio: 5,
      renderEdgeLabels: false,
      defaultEdgeType: 'line',
      stagePadding: 50,
      nodeReducer: (node: string, data: Partial<NodeDisplayData>) => {
        const res = { ...data } as Partial<NodeDisplayData> & Record<string, any>;
        const dreamType = graph.getNodeAttribute(node, 'dreamType') as DreamType | undefined;
        const nodeType = graph.getNodeAttribute(node, 'nodeType') as string;

        // Filter: hide cluster nodes whose type is toggled off
        if (dreamType && !activeFiltersRef.current.has(dreamType)) {
          res.hidden = true;
          return res;
        }

        // Search: highlight matches, dim others
        if (searchMatchesRef.current.size > 0) {
          if (searchMatchesRef.current.has(node)) {
            res.zIndex = 2;
            res.highlighted = true;
          } else if (nodeType === 'cluster') {
            res.color = '#1a1a2e';
            res.label = '';
          }
        }

        // Hover: highlight hovered + neighbors, dim rest
        const hovered = hoveredNodeRef.current;
        if (hovered) {
          if (node === hovered) {
            res.highlighted = true;
            res.zIndex = 2;
          } else if (graph.hasEdge(node, hovered) || graph.hasEdge(hovered, node)) {
            res.highlighted = true;
            res.zIndex = 1;
          } else if (nodeType === 'cluster') {
            res.color = '#1a1a2e';
            res.label = '';
          }
        }

        // Selected
        const selected = selectedNodeRef.current;
        if (selected && node === selected) {
          res.highlighted = true;
          res.zIndex = 3;
        }

        // Hub + theme nodes always show labels
        if (nodeType === 'hub' || nodeType === 'theme') {
          res.forceLabel = true;
        }

        return res;
      },
      edgeReducer: (edge: string, data: Partial<EdgeDisplayData>) => {
        const res = { ...data } as Partial<EdgeDisplayData> & Record<string, any>;
        const [src, tgt] = graph.extremities(edge);

        // Hide edges for filtered nodes
        const srcType = graph.getNodeAttribute(src, 'dreamType') as DreamType | undefined;
        const tgtType = graph.getNodeAttribute(tgt, 'dreamType') as DreamType | undefined;
        if ((srcType && !activeFiltersRef.current.has(srcType)) || (tgtType && !activeFiltersRef.current.has(tgtType))) {
          res.hidden = true;
          return res;
        }

        // Hover: highlight connected edges, hide rest
        const hovered = hoveredNodeRef.current;
        if (hovered) {
          if (src === hovered || tgt === hovered) {
            res.color = graph.getNodeAttribute(hovered, 'color') + '70';
            res.size = Math.max(2, (data.size || 1));
            res.zIndex = 1;
          } else {
            res.hidden = true;
          }
        }

        return res;
      },
    } as Partial<Settings>);

    sigmaRef.current = renderer;
    renderer.getCamera().animatedReset({ duration: 300 });

    return () => {
      renderer.kill();
      sigmaRef.current = null;
    };
  }, [graph]);

  // Refresh reducers on state change
  useEffect(() => {
    sigmaRef.current?.refresh();
  }, [hoveredNode, selectedNode, searchMatches, activeFilters]);

  // Event handlers
  useEffect(() => {
    const renderer = sigmaRef.current;
    if (!renderer || !graph) return;

    const handleEnterNode = ({ node }: { node: string }) => setHoveredNode(node);
    const handleLeaveNode = () => setHoveredNode(null);
    const handleClickNode = ({ node }: { node: string }) => {
      setSelectedNode(node);
      const nodeType = graph.getNodeAttribute(node, 'nodeType') as string;
      const label = graph.getNodeAttribute(node, 'label') as string;
      const dreamType = graph.getNodeAttribute(node, 'dreamType') as DreamType | undefined;
      const themeKey = graph.getNodeAttribute(node, 'themeKey') as string | undefined;

      if (nodeType === 'cluster') {
        const entries = clusterData[node] || [];
        const themeLabel = graph.getNodeAttribute(node, 'themeLabel') as string;
        const count = graph.getNodeAttribute(node, 'count') as number;
        setSelectedDetail({
          nodeType: 'cluster',
          label,
          dreamType,
          themeKey,
          cluster: { dreamType: dreamType!, themeKey: themeKey || 'general', themeLabel, count, entries },
        });
      } else if (nodeType === 'hub') {
        setSelectedDetail({ nodeType: 'hub', label, dreamType });
      } else if (nodeType === 'theme') {
        setSelectedDetail({ nodeType: 'theme', label, themeKey });
      }
    };
    const handleClickStage = () => {
      setSelectedNode(null);
      setSelectedDetail(null);
    };

    renderer.on('enterNode', handleEnterNode);
    renderer.on('leaveNode', handleLeaveNode);
    renderer.on('clickNode', handleClickNode);
    renderer.on('clickStage', handleClickStage);

    return () => {
      renderer.off('enterNode', handleEnterNode);
      renderer.off('leaveNode', handleLeaveNode);
      renderer.off('clickNode', handleClickNode);
      renderer.off('clickStage', handleClickStage);
    };
  }, [graph, clusterData]);

  // Search across cluster entries
  useEffect(() => {
    if (!graph || !searchQuery.trim()) {
      setSearchMatches((prev) => prev.size === 0 ? prev : new Set());
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = new Set<string>();
    graph.forEachNode((node) => {
      const nodeType = graph.getNodeAttribute(node, 'nodeType') as string;
      // Match hub/theme labels
      const label = (graph.getNodeAttribute(node, 'label') as string || '').toLowerCase();
      if (label.includes(q)) {
        matches.add(node);
        return;
      }
      // Match cluster entries' text
      if (nodeType === 'cluster') {
        const entries = clusterData[node] || [];
        if (entries.some((e) => e.text.toLowerCase().includes(q))) {
          matches.add(node);
        }
      }
    });
    setSearchMatches(matches);
  }, [searchQuery, graph, clusterData]);

  const handleZoomIn = useCallback(() => {
    sigmaRef.current?.getCamera().animatedZoom({ duration: 300, factor: 1.5 });
  }, []);

  const handleZoomOut = useCallback(() => {
    sigmaRef.current?.getCamera().animatedUnzoom({ duration: 300, factor: 1.5 });
  }, []);

  const handleReset = useCallback(() => {
    sigmaRef.current?.getCamera().animatedReset({ duration: 300 });
  }, []);

  const toggleFilter = useCallback((type: DreamType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  return (
    <div ref={sectionRef}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
            Grafo de Conocimiento
          </span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-4 font-serif">
            Constelacion Soberana
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Cada nodo agrupa voces que comparten tipo y tema. Cada linea es un puente de significado.
            Cuantas mas voces convergen, mas grande el nodo. Haz click para explorar.
          </p>
        </div>

        {/* Graph Container */}
        <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-[#050510]">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5 bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {DREAM_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: activeFilters.has(type) ? TYPE_COLORS[type] + '25' : 'transparent',
                    border: `1px solid ${activeFilters.has(type) ? TYPE_COLORS[type] + '60' : '#ffffff15'}`,
                    color: activeFilters.has(type) ? TYPE_COLORS[type] : '#666',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: activeFilters.has(type) ? TYPE_COLORS[type] : '#444' }}
                  />
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/30 w-48"
              />
              {searchMatches.size > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-amber-400">
                  {searchMatches.size}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button onClick={handleZoomIn} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={handleZoomOut} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={handleReset} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-mono transition-colors">
                FIT
              </button>
            </div>
          </div>

          {/* Sigma Canvas */}
          <div className="relative" style={{ height: 'clamp(400px, 60vh, 700px)' }}>
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-4">
                  <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
                  <p className="text-slate-500 text-sm font-mono">Construyendo constelacion...</p>
                </div>
              </div>
            ) : graph.order === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-slate-600 text-sm">No hay datos disponibles aun.</p>
              </div>
            ) : null}

            <div
              ref={containerRef}
              className="w-full h-full"
              style={{ background: '#06060f' }}
            />

            {/* Decorative glow */}
            {!isLoading && graph.order > 0 && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #3b82f610 0%, transparent 70%)',
                    animation: 'constellationPulse 4s ease-in-out infinite',
                  }}
                />
              </div>
            )}

            {/* Stats Overlay */}
            {!isLoading && stats.totalEntries > 0 && (
              <div className="absolute bottom-4 left-4 z-20">
                <div className="rounded-xl border border-white/10 bg-black/70 backdrop-blur-xl p-4 space-y-3 min-w-[220px]">
                  <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider font-mono">
                    <Layers className="w-3 h-3 text-amber-500" />
                    Constelacion
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        <AnimatedCount value={stats.totalEntries} />
                      </p>
                      <p className="text-xs text-slate-500">voces</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        <AnimatedCount value={stats.totalNodes} />
                      </p>
                      <p className="text-xs text-slate-500">nodos</p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2 space-y-1">
                    {DREAM_TYPES.map((type) => (
                      stats.byType[type] > 0 && (
                        <div key={type} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] }} />
                          <span className="text-slate-400 flex-1">{TYPE_LABELS[type]}</span>
                          <span className="text-slate-300 font-mono">{stats.byType[type]}</span>
                        </div>
                      )
                    ))}
                  </div>

                  <div className="border-t border-white/5 pt-2 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-slate-400">Convergencia</span>
                    <span className="text-sm font-bold text-emerald-400 ml-auto">
                      {stats.convergencePercent}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Detail Panel */}
            {selectedDetail && (
              <DetailPanel detail={selectedDetail} onClose={() => { setSelectedNode(null); setSelectedDetail(null); }} />
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-600 font-mono">
          <Link2 className="w-3 h-3" />
          <span className="hidden md:inline">Arrastra para explorar. Click en un nodo para ver las entradas agrupadas.</span>
          <span className="md:hidden">Pellizcá para zoom. Tocá un nodo para ver detalles.</span>
        </div>
      </motion.div>

      <style>{`
        @keyframes constellationPulse {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ConstellationGraph;
