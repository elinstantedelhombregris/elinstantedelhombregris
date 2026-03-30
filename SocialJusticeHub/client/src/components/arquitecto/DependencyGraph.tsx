import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sigma from 'sigma';
import { Settings } from 'sigma/settings';
import { NodeDisplayData, EdgeDisplayData } from 'sigma/types';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import {
  ZoomIn, ZoomOut, AlertTriangle, Filter, Zap, X,
} from 'lucide-react';
import {
  PLAN_NODES, DEPENDENCIES, PlanNode, DependencyNature, DependencyType,
  getInDegree, simulateFailure,
} from '@/../../shared/arquitecto-data';

// ─── Constants ───

type FilterKey = 'ALL' | 'CRITICAL' | 'FINANCIAL' | 'TECHNICAL' | 'INSTITUTIONAL';

const FILTER_BUTTONS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Todas' },
  { key: 'CRITICAL', label: 'Criticas' },
  { key: 'FINANCIAL', label: 'Financieras' },
  { key: 'TECHNICAL', label: 'Tecnicas' },
  { key: 'INSTITUTIONAL', label: 'Institucionales' },
];

const NATURE_COLORS: Record<DependencyNature, string> = {
  CRITICAL: '#ef4444',
  IMPORTANT: '#f59e0b',
  MINOR: '#6b7280',
};

const NATURE_SIZES: Record<DependencyNature, number> = {
  CRITICAL: 3,
  IMPORTANT: 2,
  MINOR: 1,
};

const NATURE_LABELS: Record<DependencyNature, string> = {
  CRITICAL: 'Critica',
  IMPORTANT: 'Importante',
  MINOR: 'Menor',
};

// ─── Graph Builder ───

function buildGraph(): Graph {
  const graph = new Graph({ type: 'directed', multi: false, allowSelfLoops: false });

  const nodeCount = PLAN_NODES.length;
  const radius = 300;

  // Add nodes in circular layout by ordinal
  PLAN_NODES.forEach((plan) => {
    const angle = ((plan.ordinal - 1) / nodeCount) * 2 * Math.PI - Math.PI / 2;
    const inDeg = getInDegree(plan.id);
    const baseSize = 8;
    const nodeSize = baseSize + inDeg * 2.5;

    graph.addNode(plan.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: nodeSize,
      color: plan.color,
      label: plan.id,
      planOrdinal: plan.ordinal,
      planName: plan.name,
      inDegree: inDeg,
    });
  });

  // Add edges
  DEPENDENCIES.forEach((dep) => {
    if (graph.hasNode(dep.source) && graph.hasNode(dep.target)) {
      graph.addEdgeWithKey(dep.id, dep.source, dep.target, {
        size: NATURE_SIZES[dep.nature],
        color: NATURE_COLORS[dep.nature],
        nature: dep.nature,
        type: dep.type as DependencyType,
        description: dep.description,
        edgeType: 'arrow',
      });
    }
  });

  // Apply ForceAtlas2 for better layout (synchronous, few iterations to refine circular)
  const settings = forceAtlas2.inferSettings(graph);
  forceAtlas2.assign(graph, {
    iterations: 80,
    settings: {
      ...settings,
      gravity: 0.8,
      scalingRatio: 12,
      strongGravityMode: true,
      barnesHutOptimize: true,
      slowDown: 5,
    },
  });

  return graph;
}

// ─── Component ───

interface DependencyGraphProps {
  onSelectPlan: (plan: PlanNode) => void;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ onSelectPlan }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL');
  const [failureMode, setFailureMode] = useState(false);
  const [failureTarget, setFailureTarget] = useState<string | null>(null);
  const [failureCascade, setFailureCascade] = useState<{
    directlyAffected: string[];
    cascadeAffected: string[];
  } | null>(null);

  // Stable refs for Sigma reducer closures
  const hoveredNodeRef = useRef(hoveredNode);
  const selectedNodeRef = useRef(selectedNode);
  const activeFilterRef = useRef(activeFilter);
  const failureModeRef = useRef(failureMode);
  const failureTargetRef = useRef(failureTarget);
  const failureCascadeRef = useRef(failureCascade);
  hoveredNodeRef.current = hoveredNode;
  selectedNodeRef.current = selectedNode;
  activeFilterRef.current = activeFilter;
  failureModeRef.current = failureMode;
  failureTargetRef.current = failureTarget;
  failureCascadeRef.current = failureCascade;

  // Build graph once
  const graph = useMemo(() => buildGraph(), []);

  // ─── Initialize Sigma ───
  useEffect(() => {
    if (!containerRef.current || sigmaRef.current) return;

    const renderer = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      defaultNodeColor: '#666',
      defaultEdgeColor: '#ffffff10',
      labelColor: { color: '#e2e8f0' },
      labelFont: 'ui-monospace, monospace',
      labelSize: 11,
      labelRenderedSizeThreshold: 5,
      zIndex: true,
      minCameraRatio: 0.2,
      maxCameraRatio: 4,
      renderEdgeLabels: false,
      defaultEdgeType: 'arrow',
      stagePadding: 60,

      nodeReducer: (node: string, data: Partial<NodeDisplayData>) => {
        const res = { ...data } as Partial<NodeDisplayData> & Record<string, any>;
        const filter = activeFilterRef.current;
        const hovered = hoveredNodeRef.current;
        const selected = selectedNodeRef.current;
        const fMode = failureModeRef.current;
        const fTarget = failureTargetRef.current;
        const fCascade = failureCascadeRef.current;

        // Failure mode rendering
        if (fMode && fTarget && fCascade) {
          if (node === fTarget) {
            // The failed node itself -- red pulsing
            res.color = '#ef4444';
            res.highlighted = true;
            res.zIndex = 3;
          } else if (fCascade.directlyAffected.includes(node)) {
            // Directly affected -- bright red
            res.color = '#f87171';
            res.highlighted = true;
            res.zIndex = 2;
          } else if (fCascade.cascadeAffected.includes(node)) {
            // Cascade affected -- dark red/orange
            res.color = '#dc2626';
            res.zIndex = 1;
          } else {
            // Unaffected -- very dim
            res.color = '#1a1a2e';
            res.label = '';
          }
          return res;
        }

        // Filter: dim edges/nodes not matching type filter
        if (filter !== 'ALL' && filter !== 'CRITICAL') {
          // Check if this node has ANY edge of the filtered type
          const edges = graph.edges(node);
          const hasMatchingEdge = edges.some((e) => {
            const edgeType = graph.getEdgeAttribute(e, 'type') as string;
            return edgeType === filter;
          });
          if (!hasMatchingEdge) {
            res.color = '#1a1a2e';
            res.label = '';
            return res;
          }
        }

        if (filter === 'CRITICAL') {
          const edges = graph.edges(node);
          const hasCritical = edges.some((e) => {
            const nature = graph.getEdgeAttribute(e, 'nature') as string;
            return nature === 'CRITICAL';
          });
          if (!hasCritical) {
            res.color = '#1a1a2e';
            res.label = '';
            return res;
          }
        }

        // Hover: highlight hovered + neighbors, dim rest
        if (hovered) {
          if (node === hovered) {
            res.highlighted = true;
            res.zIndex = 2;
          } else if (graph.hasEdge(node, hovered) || graph.hasEdge(hovered, node)) {
            res.highlighted = true;
            res.zIndex = 1;
          } else {
            res.color = '#1a1a2e';
            res.label = '';
          }
        }

        // Selected highlight
        if (selected && node === selected) {
          res.highlighted = true;
          res.zIndex = 3;
        }

        // Always show label for visible nodes
        if (res.color !== '#1a1a2e') {
          res.forceLabel = true;
        }

        return res;
      },

      edgeReducer: (edge: string, data: Partial<EdgeDisplayData>) => {
        const res = { ...data } as Partial<EdgeDisplayData> & Record<string, any>;
        const [src, tgt] = graph.extremities(edge);
        const filter = activeFilterRef.current;
        const hovered = hoveredNodeRef.current;
        const fMode = failureModeRef.current;
        const fTarget = failureTargetRef.current;
        const fCascade = failureCascadeRef.current;
        const nature = graph.getEdgeAttribute(edge, 'nature') as DependencyNature;
        const edgeType = graph.getEdgeAttribute(edge, 'type') as string;

        // Failure mode: only show edges in the cascade
        if (fMode && fTarget && fCascade) {
          const allAffected = [fTarget, ...fCascade.directlyAffected, ...fCascade.cascadeAffected];
          if (allAffected.includes(src) && allAffected.includes(tgt) && nature === 'CRITICAL') {
            res.color = '#ef444490';
            res.size = 3;
            res.zIndex = 1;
          } else {
            res.hidden = true;
          }
          return res;
        }

        // Filter by type
        if (filter !== 'ALL') {
          if (filter === 'CRITICAL') {
            if (nature !== 'CRITICAL') {
              res.hidden = true;
              return res;
            }
          } else {
            if (edgeType !== filter) {
              res.hidden = true;
              return res;
            }
          }
        }

        // Hover: highlight connected edges, hide rest
        if (hovered) {
          if (src === hovered || tgt === hovered) {
            res.color = NATURE_COLORS[nature] + 'cc';
            res.size = Math.max(NATURE_SIZES[nature], 2);
            res.zIndex = 1;
          } else {
            res.hidden = true;
          }
        }

        return res;
      },
    } as Partial<Settings>);

    sigmaRef.current = renderer;
    renderer.getCamera().animatedReset({ duration: 400 });

    return () => {
      renderer.kill();
      sigmaRef.current = null;
    };
  }, [graph]);

  // Refresh reducers on state change
  useEffect(() => {
    sigmaRef.current?.refresh();
  }, [hoveredNode, selectedNode, activeFilter, failureMode, failureTarget, failureCascade]);

  // ─── Event handlers ───
  useEffect(() => {
    const renderer = sigmaRef.current;
    if (!renderer) return;

    const handleEnterNode = ({ node }: { node: string }) => {
      if (!failureModeRef.current) {
        setHoveredNode(node);
      }
    };
    const handleLeaveNode = () => {
      if (!failureModeRef.current) {
        setHoveredNode(null);
      }
    };
    const handleClickNode = ({ node }: { node: string }) => {
      if (failureModeRef.current) {
        // Simulate failure on this node
        const result = simulateFailure(node);
        setFailureTarget(node);
        setFailureCascade(result);
        return;
      }
      setSelectedNode(node);
      const plan = PLAN_NODES.find((p) => p.id === node);
      if (plan) {
        onSelectPlan(plan);
      }
    };
    const handleClickStage = () => {
      if (failureModeRef.current) {
        // Clear failure simulation
        setFailureTarget(null);
        setFailureCascade(null);
        return;
      }
      setSelectedNode(null);
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
  }, [graph, onSelectPlan]);

  // ─── Controls ───
  const handleZoomIn = useCallback(() => {
    sigmaRef.current?.getCamera().animatedZoom({ duration: 300, factor: 1.5 });
  }, []);

  const handleZoomOut = useCallback(() => {
    sigmaRef.current?.getCamera().animatedUnzoom({ duration: 300, factor: 1.5 });
  }, []);

  const handleReset = useCallback(() => {
    sigmaRef.current?.getCamera().animatedReset({ duration: 300 });
  }, []);

  const toggleFailureMode = useCallback(() => {
    setFailureMode((prev) => {
      if (prev) {
        // Exiting failure mode -- clear cascade
        setFailureTarget(null);
        setFailureCascade(null);
      }
      return !prev;
    });
  }, []);

  // ─── Hovered node tooltip data ───
  const hoveredPlan = useMemo(() => {
    if (!hoveredNode) return null;
    return PLAN_NODES.find((p) => p.id === hoveredNode) || null;
  }, [hoveredNode]);

  const hoveredInDegree = useMemo(() => {
    if (!hoveredNode) return 0;
    return getInDegree(hoveredNode);
  }, [hoveredNode]);

  // ─── Failure summary ───
  const failureSummary = useMemo(() => {
    if (!failureTarget || !failureCascade) return null;
    const plan = PLAN_NODES.find((p) => p.id === failureTarget);
    return {
      plan,
      direct: failureCascade.directlyAffected.length,
      cascade: failureCascade.cascadeAffected.length,
      total: failureCascade.directlyAffected.length + failureCascade.cascadeAffected.length,
    };
  }, [failureTarget, failureCascade]);

  return (
    <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-[#050510]">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5 bg-black/40 backdrop-blur-sm">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {FILTER_BUTTONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all"
              style={{
                backgroundColor: activeFilter === key ? '#ffffff15' : 'transparent',
                border: `1px solid ${activeFilter === key ? '#ffffff30' : '#ffffff10'}`,
                color: activeFilter === key ? '#e2e8f0' : '#666',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Failure mode toggle */}
        <button
          onClick={toggleFailureMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all"
          style={{
            backgroundColor: failureMode ? '#ef444425' : 'transparent',
            border: `1px solid ${failureMode ? '#ef444460' : '#ffffff10'}`,
            color: failureMode ? '#ef4444' : '#666',
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Simular Fallo
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-mono transition-colors"
          >
            FIT
          </button>
        </div>
      </div>

      {/* ─── Sigma Canvas ─── */}
      <div className="relative" style={{ height: 600 }}>
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ background: '#06060f' }}
        />

        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, #3b82f608 0%, transparent 70%)',
              animation: 'depGraphPulse 5s ease-in-out infinite',
            }}
          />
        </div>

        {/* ─── Legend ─── */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="rounded-xl border border-white/10 bg-black/70 backdrop-blur-xl p-3 space-y-2 min-w-[180px]">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">
              Dependencias
            </p>
            {(Object.keys(NATURE_COLORS) as DependencyNature[]).map((nature) => (
              <div key={nature} className="flex items-center gap-2 text-xs">
                <span
                  className="w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: NATURE_COLORS[nature] }}
                />
                <span className="text-slate-400">{NATURE_LABELS[nature]}</span>
              </div>
            ))}
            <div className="border-t border-white/5 pt-2 mt-2">
              <p className="text-[10px] text-slate-600 font-mono">
                Tamano del nodo = planes que dependen de el
              </p>
            </div>
          </div>
        </div>

        {/* ─── Hover tooltip ─── */}
        <AnimatePresence>
          {hoveredPlan && !failureMode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-4 right-4 z-20"
            >
              <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl p-4 min-w-[260px]">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hoveredPlan.color }}
                  />
                  <span className="text-sm font-mono text-white font-semibold">
                    {hoveredPlan.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {hoveredPlan.name}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-600">Dependen de este</p>
                    <p className="text-white font-mono font-semibold">{hoveredInDegree}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Agencia</p>
                    <p className="text-white font-mono font-semibold">{hoveredPlan.agency || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Presupuesto</p>
                    <p className="text-white font-mono font-semibold">
                      USD {hoveredPlan.budgetLow > 0 ? `${(hoveredPlan.budgetLow / 1000).toFixed(1)}B` : '0'}
                      {hoveredPlan.budgetHigh > hoveredPlan.budgetLow
                        ? `–${(hoveredPlan.budgetHigh / 1000).toFixed(1)}B`
                        : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Horizonte</p>
                    <p className="text-white font-mono font-semibold">
                      {hoveredPlan.timelineYears === -1 ? 'Permanente' : `${hoveredPlan.timelineYears} anos`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Failure mode overlay ─── */}
        <AnimatePresence>
          {failureMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-xl">
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-mono text-red-300 uppercase tracking-wider">
                  Modo Simulacion — Click en un nodo para simular fallo
                </span>
                <button
                  onClick={toggleFailureMode}
                  className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Failure result panel ─── */}
        <AnimatePresence>
          {failureSummary && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute top-4 right-4 z-30 w-80"
            >
              <div className="rounded-xl border border-red-500/20 bg-black/80 backdrop-blur-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-mono text-red-300 font-semibold">
                      Fallo: {failureSummary.plan?.id}
                    </span>
                  </div>
                  <button
                    onClick={() => { setFailureTarget(null); setFailureCascade(null); }}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Si <strong className="text-red-300">{failureSummary.plan?.name}</strong> falla,
                  se producen <strong className="text-red-300">{failureSummary.total} impactos</strong> en cascada
                  a traves de dependencias criticas.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                    <p className="text-2xl font-bold text-red-400 font-mono">{failureSummary.direct}</p>
                    <p className="text-[10px] text-red-300/60 uppercase tracking-wider mt-1">
                      Impacto directo
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-center">
                    <p className="text-2xl font-bold text-orange-400 font-mono">{failureSummary.cascade}</p>
                    <p className="text-[10px] text-orange-300/60 uppercase tracking-wider mt-1">
                      Cascada
                    </p>
                  </div>
                </div>

                {failureCascade && (
                  <div className="space-y-1 pt-1">
                    {failureCascade.directlyAffected.map((id) => (
                      <div key={id} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-red-300 font-mono">{id}</span>
                        <span className="text-slate-600">— directo</span>
                      </div>
                    ))}
                    {failureCascade.cascadeAffected.map((id) => (
                      <div key={id} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        <span className="text-orange-300 font-mono">{id}</span>
                        <span className="text-slate-600">— cascada</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes depGraphPulse {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default DependencyGraph;
