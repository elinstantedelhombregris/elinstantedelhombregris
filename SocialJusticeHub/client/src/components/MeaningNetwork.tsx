import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Link2, X, RotateCcw } from 'lucide-react';
import { useMapPulseAnalysis } from '@/hooks/useMapPulseAnalysis';
import { cn } from '@/lib/utils';

type WordType = 'dream' | 'value' | 'need' | 'basta';

type WordStats = {
  word: string;
  total: number;
  byType: Record<WordType, number>;
  examplesByType: Record<WordType, string[]>;
};

type WordNode = {
  word: string;
  display: string;
  kind: 'shared' | 'unique';
  type?: WordType;
  total: number;
  byType: Record<WordType, number>;
  examplesByType: Record<WordType, string[]>;
  types: WordType[];
  x: number;
  y: number;
};

type NodeMetrics = {
  fontSize: number;
  paddingX: number;
  paddingY: number;
  width: number;
  height: number;
  maxWidth: number;
};

const TYPE_META: Record<WordType, { label: string; color: string }> = {
  dream: { label: 'Sueños', color: '#3b82f6' },
  value: { label: 'Valores', color: '#ec4899' },
  need: { label: 'Necesidades', color: '#f59e0b' },
  basta: { label: '¡BASTA!', color: '#ef4444' },
};

const TYPE_ORDER: WordType[] = ['dream', 'value', 'need', 'basta'];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:¡!¿?()[\]{}«»""']/g, '')
    .trim();

const formatWord = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const estimateNodeMetrics = (node: WordNode, maxCount: number, compact: boolean): NodeMetrics => {
  const baseFont = compact ? 10 : 12;
  const fontRange = compact ? 5 : 7;
  const ratio = maxCount > 0 ? node.total / maxCount : 0;
  const boost = node.kind === 'shared' ? 1.2 : 0;
  const fontSize = baseFont + ratio * fontRange + boost;
  const paddingX = compact ? 10 : 12;
  const paddingY = compact ? 6 : 7;
  const maxWidth = compact ? 120 : 160;
  const displayLength = Math.min(node.display.length, 18);
  const estimatedTextWidth = displayLength * fontSize * 0.58;
  const width = Math.min(maxWidth, estimatedTextWidth + paddingX * 2);
  const height = fontSize + paddingY * 2;

  return {
    fontSize,
    paddingX,
    paddingY,
    width,
    height,
    maxWidth,
  };
};

const buildCurvePath = (x1: number, y1: number, x2: number, y2: number, bend: number) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const offsetX = (-dy / length) * bend;
  const offsetY = (dx / length) * bend;
  const controlX = midX + offsetX;
  const controlY = midY + offsetY;
  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
};

const MeaningNetwork = () => {
  const { wordAnalysis, coOccurrences, pulseMetrics } = useMapPulseAnalysis();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState<WordType[]>([...TYPE_ORDER]);
  const [showSharedOnly, setShowSharedOnly] = useState(false);
  const [compact, setCompact] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => setCompact(window.innerWidth < 768);
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const activeTypeSet = useMemo(() => new Set(activeTypes), [activeTypes]);

  const wordStatsMap = useMemo(() => {
    const stats = new Map<string, WordStats>();
    TYPE_ORDER.forEach((type) => {
      wordAnalysis[type].forEach((item) => {
        const key = item.word;
        if (!stats.has(key)) {
          stats.set(key, {
            word: key,
            total: 0,
            byType: { dream: 0, value: 0, need: 0, basta: 0 },
            examplesByType: { dream: [], value: [], need: [], basta: [] },
          });
        }
        const entry = stats.get(key)!;
        entry.total += item.count;
        entry.byType[type] = item.count;
        entry.examplesByType[type] = item.examples || [];
      });
    });
    return stats;
  }, [wordAnalysis]);

  const totalWords = wordStatsMap.size;

  const sharedNodes = useMemo(() => {
    const candidates = Array.from(wordStatsMap.values()).filter((entry) => {
      const typeCount = TYPE_ORDER.filter((type) => entry.byType[type] > 0).length;
      return typeCount >= 2;
    });
    const maxShared = compact ? 8 : 14;
    const sorted = candidates.sort((a, b) => b.total - a.total).slice(0, maxShared);

    const innerCount = Math.min(sorted.length, compact ? 5 : 7);
    const outerCount = sorted.length - innerCount;
    const innerRadius = compact ? 10 : 12;
    const outerRadius = compact ? 18 : 22;

    return sorted.map((entry, index) => {
      const isInner = index < innerCount;
      const ringIndex = isInner ? index : index - innerCount;
      const ringCount = isInner ? innerCount : outerCount || 1;
      const radius = isInner ? innerRadius : outerRadius;
      const angle = (ringIndex / ringCount) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;

      return {
        word: entry.word,
        display: formatWord(entry.word),
        kind: 'shared' as const,
        total: entry.total,
        byType: entry.byType,
        examplesByType: entry.examplesByType,
        types: TYPE_ORDER.filter((type) => entry.byType[type] > 0),
        x,
        y,
      };
    });
  }, [wordStatsMap, compact]);

  const uniqueNodesByType = useMemo(() => {
    const maxUnique = compact ? 4 : 7;
    const result: Record<WordType, WordStats[]> = {
      dream: [],
      value: [],
      need: [],
      basta: [],
    };

    TYPE_ORDER.forEach((type) => {
      const uniqueWords = Array.from(wordStatsMap.values()).filter((entry) => {
        const typeCount = TYPE_ORDER.filter((t) => entry.byType[t] > 0).length;
        return typeCount === 1 && entry.byType[type] > 0;
      });
      result[type] = uniqueWords
        .sort((a, b) => b.byType[type] - a.byType[type])
        .slice(0, maxUnique);
    });

    return result;
  }, [wordStatsMap, compact]);

  const { nodes: baseNodes, anchors, maxCount } = useMemo(() => {
    const edge = compact ? 18 : 16;
    const far = 100 - edge;
    const anchorsMap = {
      dream: { x: 50, y: edge, baseAngle: 90 },
      value: { x: far, y: 50, baseAngle: 180 },
      need: { x: 50, y: far, baseAngle: 270 },
      basta: { x: edge, y: 50, baseAngle: 0 },
    } as const;

    const spread = compact ? 70 : 90;
    const radius = compact ? 8 : 10;
    const allNodes: WordNode[] = [...sharedNodes];

    TYPE_ORDER.forEach((type) => {
      const words = uniqueNodesByType[type];
      const anchor = anchorsMap[type];
      const startAngle = anchor.baseAngle - spread / 2;
      const step = words.length > 1 ? spread / (words.length - 1) : 0;

      words.forEach((entry, index) => {
        const angle = (startAngle + step * index) * (Math.PI / 180);
        const x = anchor.x + Math.cos(angle) * radius;
        const y = anchor.y + Math.sin(angle) * radius;

        allNodes.push({
          word: entry.word,
          display: formatWord(entry.word),
          kind: 'unique',
          type,
          total: entry.total,
          byType: entry.byType,
          examplesByType: entry.examplesByType,
          types: [type],
          x,
          y,
        });
      });
    });

    const max = Math.max(
      1,
      ...Array.from(wordStatsMap.values()).map((entry) => entry.total)
    );

    return {
      nodes: allNodes,
      anchors: anchorsMap,
      maxCount: max,
    };
  }, [compact, sharedNodes, uniqueNodesByType, wordStatsMap]);

  const nodeMetrics = useMemo(() => {
    const metrics = new Map<string, NodeMetrics>();
    baseNodes.forEach((node) => {
      metrics.set(node.word, estimateNodeMetrics(node, maxCount, compact));
    });
    return metrics;
  }, [baseNodes, maxCount, compact]);

  const layoutNodes = useMemo(() => {
    if (!containerSize.width || !containerSize.height) {
      return baseNodes;
    }

    const width = containerSize.width;
    const height = containerSize.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const padding = compact ? 12 : 16;
    const spacing = compact ? 6 : 8;
    const coreRadius = Math.min(width, height) * (compact ? 0.12 : 0.14);
    const iterations = compact ? 120 : 160;

    const layout = baseNodes.map((node) => {
      const metrics = nodeMetrics.get(node.word) || estimateNodeMetrics(node, maxCount, compact);
      const x = (node.x / 100) * width;
      const y = (node.y / 100) * height;
      const radius = Math.max(metrics.width, metrics.height) / 2 + spacing;
      return {
        ...node,
        x,
        y,
        radius,
        targetX: x,
        targetY: y,
      };
    });

    for (let iteration = 0; iteration < iterations; iteration += 1) {
      for (let i = 0; i < layout.length; i += 1) {
        for (let j = i + 1; j < layout.length; j += 1) {
          const nodeA = layout[i];
          const nodeB = layout[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.hypot(dx, dy) || 0.001;
          const minDistance = nodeA.radius + nodeB.radius;
          if (distance < minDistance) {
            const push = (minDistance - distance) * 0.08;
            const ux = dx / distance;
            const uy = dy / distance;
            nodeA.x -= ux * push;
            nodeA.y -= uy * push;
            nodeB.x += ux * push;
            nodeB.y += uy * push;
          }
        }
      }

      layout.forEach((node) => {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const distance = Math.hypot(dx, dy) || 0.001;
        const minDistance = coreRadius + node.radius;
        if (distance < minDistance) {
          const push = (minDistance - distance) * 0.06;
          node.x += (dx / distance) * push;
          node.y += (dy / distance) * push;
        }
      });

      layout.forEach((node) => {
        node.x += (node.targetX - node.x) * 0.04;
        node.y += (node.targetY - node.y) * 0.04;
        node.x = clamp(node.x, padding, width - padding);
        node.y = clamp(node.y, padding, height - padding);
      });
    }

    return layout.map((node) => ({
      ...node,
      x: (node.x / width) * 100,
      y: (node.y / height) * 100,
    }));
  }, [baseNodes, compact, containerSize, maxCount, nodeMetrics]);

  const nodesByWord = useMemo(() => {
    const map = new Map<string, WordNode>();
    layoutNodes.forEach((node) => map.set(node.word, node));
    return map;
  }, [layoutNodes]);

  useEffect(() => {
    if (selectedWord && !nodesByWord.has(selectedWord)) {
      setSelectedWord(null);
    }
  }, [selectedWord, nodesByWord]);

  const normalizedQuery = normalizeText(query);
  const queryActive = normalizedQuery.length > 0;

  const selectedNode = selectedWord ? nodesByWord.get(selectedWord) : null;
  const activeWord = selectedWord || hoveredWord;
  const hasFilters =
    queryActive || showSharedOnly || activeTypes.length < TYPE_ORDER.length || selectedWord;

  const exampleList = useMemo(() => {
    if (!selectedNode) return [];
    const examples: Array<{ type: WordType; text: string }> = [];
    TYPE_ORDER.forEach((type) => {
      selectedNode.examplesByType[type].forEach((text) => {
        examples.push({ type, text });
      });
    });
    return examples.slice(0, 4);
  }, [selectedNode]);

  const sharedHeadline = useMemo(() => {
    const headline = sharedNodes
      .slice(0, compact ? 2 : 3)
      .map((node) => formatWord(node.word))
      .join(' · ');
    return headline || 'Conexiones reales';
  }, [sharedNodes, compact]);

  const lines = useMemo(() => {
    const lineItems: Array<{
      word: string;
      type: WordType;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [];

    layoutNodes.forEach((node) => {
      if (node.kind === 'unique' && node.type) {
        lineItems.push({
          word: node.word,
          type: node.type,
          x1: node.x,
          y1: node.y,
          x2: anchors[node.type].x,
          y2: anchors[node.type].y,
        });
        return;
      }

      if (node.kind === 'shared') {
        node.types.forEach((type) => {
          lineItems.push({
            word: node.word,
            type,
            x1: node.x,
            y1: node.y,
            x2: anchors[type].x,
            y2: anchors[type].y,
          });
        });
      }
    });

    return lineItems;
  }, [layoutNodes, anchors]);

  if (totalWords === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <p className="text-white text-lg font-semibold">La red todavía no tiene señales suficientes.</p>
        <p className="text-slate-400 mt-2">
          Cuando aparezcan contribuciones, vas a ver cómo se conectan las visiones.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.48fr)]">
      <div className="relative rounded-3xl border border-white/10 bg-[#0b0f1a] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(236,72,153,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(transparent_0px,_transparent_22px,_rgba(255,255,255,0.05)_22px),linear-gradient(90deg,_transparent_0px,_transparent_22px,_rgba(255,255,255,0.05)_22px)] bg-[size:24px_24px]" />

        {/* Controls */}
        <div className="absolute left-4 right-4 top-4 z-20 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-2 text-sm text-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar palabra clave..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPE_ORDER.map((type) => {
              const isActive = activeTypeSet.has(type);
              return (
                <button
                  key={type}
                  onClick={() =>
                    setActiveTypes((prev) =>
                      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
                    )
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                    isActive ? 'text-white border-white/20' : 'text-white/40 border-white/10'
                  )}
                  style={{ backgroundColor: isActive ? `${TYPE_META[type].color}30` : 'transparent' }}
                >
                  {TYPE_META[type].label}
                </button>
              );
            })}
            <button
              onClick={() => setShowSharedOnly((prev) => !prev)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 text-white/70',
                showSharedOnly && 'bg-white/10 text-white'
              )}
            >
              Solo compartidas
            </button>
            {hasFilters && (
              <button
                onClick={() => {
                  setQuery('');
                  setActiveTypes([...TYPE_ORDER]);
                  setShowSharedOnly(false);
                  setSelectedWord(null);
                  setHoveredWord(null);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 text-white/70 hover:text-white hover:border-white/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Network */}
        <div ref={containerRef} className="relative h-[520px] md:h-[620px]">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {lines.map((line, index) => {
              const isActiveType = activeTypeSet.has(line.type);
              if (!isActiveType) return null;
              if (showSharedOnly && nodesByWord.get(line.word)?.kind === 'unique') return null;
              const isSelected = activeWord && line.word === activeWord;
              const isDimmed = activeWord && line.word !== activeWord;
              const opacity = isDimmed ? 0.08 : isSelected ? 0.75 : 0.2;
              const bendDirection = line.type === 'dream' || line.type === 'need' ? 1 : -1;
              const bend = (compact ? 3 : 4) * bendDirection;
              const path = buildCurvePath(line.x1, line.y1, line.x2, line.y2, bend);

              return (
                <path
                  key={`${line.word}-${line.type}-${index}`}
                  d={path}
                  stroke={TYPE_META[line.type].color}
                  strokeOpacity={opacity}
                  strokeWidth={isSelected ? 0.6 : 0.35}
                  fill="none"
                  className={cn('meaning-flow', isSelected && 'meaning-flow--active')}
                />
              );
            })}
          </svg>

          {/* Core */}
          <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/20 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-semibold text-white">Núcleo compartido</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Todos buscamos lo mismo
            </div>
          </div>

          {/* Anchors */}
          {TYPE_ORDER.map((type) => {
            const anchor = anchors[type];
            const isActive = activeTypeSet.has(type);
            return (
              <div
                key={type}
                className={cn(
                  'absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity',
                  isActive ? 'text-white border-white/20 bg-black/40' : 'text-white/30 border-white/10 bg-black/20'
                )}
                style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
              >
                {TYPE_META[type].label}
              </div>
            );
          })}

          {/* Nodes */}
          {layoutNodes.map((node) => {
            const isActive =
              node.kind === 'shared'
                ? node.types.some((type) => activeTypeSet.has(type))
                : node.type
                ? activeTypeSet.has(node.type)
                : false;
            if (!isActive) return null;
            if (showSharedOnly && node.kind === 'unique') return null;

            const matchesQuery = !queryActive || normalizeText(node.word).includes(normalizedQuery);
            const isSelected = activeWord === node.word;
            const isDimmed = (queryActive && !matchesQuery) || (activeWord && !isSelected);
            const metrics = nodeMetrics.get(node.word) || estimateNodeMetrics(node, maxCount, compact);
            const transform = `translate(-50%, -50%) ${isSelected ? 'scale(1.08)' : 'scale(1)'}`;

            return (
              <motion.button
                key={`${node.word}-${node.kind}`}
                onClick={() => setSelectedWord((prev) => (prev === node.word ? null : node.word))}
                onMouseEnter={() => setHoveredWord(node.word)}
                onMouseLeave={() => setHoveredWord(null)}
                onFocus={() => setHoveredWord(node.word)}
                onBlur={() => setHoveredWord(null)}
                className={cn(
                  'absolute z-20 rounded-full border font-semibold transition-all',
                  isSelected && 'z-30',
                  node.kind === 'shared'
                    ? 'border-white/30 text-white bg-white/10'
                    : 'border-white/10 text-white/90 bg-black/50'
                )}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform,
                  opacity: isDimmed ? 0.2 : 1,
                  boxShadow:
                    node.type && node.kind === 'unique'
                      ? `0 0 18px ${TYPE_META[node.type].color}40`
                      : '0 0 20px rgba(255,255,255,0.1)',
                  fontSize: `${metrics.fontSize}px`,
                  padding: `${metrics.paddingY}px ${metrics.paddingX}px`,
                  maxWidth: `${metrics.maxWidth}px`,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                whileHover={{ scale: 1.12 }}
              >
                {node.display}
              </motion.button>
            );
          })}

          <div className="absolute bottom-4 left-4 z-20 max-w-[240px] rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-slate-200">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Lo que nos une</p>
            <p className="mt-2 text-sm font-semibold text-white">{sharedHeadline}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span>{sharedNodes.length} puentes</span>
              <span>{coOccurrences.length} relaciones</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card-unified p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/10 p-2">
                <Link2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vínculo activo</p>
                <p className="text-lg font-semibold text-white">
                  {selectedNode ? selectedNode.display : 'Selecciona una palabra'}
                </p>
              </div>
            </div>
            {selectedNode && (
              <button
                onClick={() => setSelectedWord(null)}
                className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.word}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  {TYPE_ORDER.map((type) => {
                    const count = selectedNode.byType[type];
                    if (count === 0) return null;
                    return (
                      <div key={type} className="rounded-xl bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-widest" style={{ color: TYPE_META[type].color }}>
                          {TYPE_META[type].label}
                        </p>
                        <p className="text-lg font-semibold text-white">{count}</p>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                    Ecos reales
                  </p>
                  <div className="space-y-2">
                    {exampleList.map((example, index) => (
                      <div key={`${example.type}-${index}`} className="rounded-xl bg-black/40 p-3 text-sm text-slate-200">
                        <span className="mr-2 text-xs uppercase tracking-widest" style={{ color: TYPE_META[example.type].color }}>
                          {TYPE_META[example.type].label}
                        </span>
                        {example.text}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-sm text-slate-400"
              >
                Toca una palabra para ver cuántas veces aparece y en qué capas se conecta.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="card-unified p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Lo que nos une</p>
          <div className="flex flex-wrap gap-2">
            {sharedNodes.map((node) => (
              <button
                key={`shared-${node.word}`}
                onClick={() => setSelectedWord(node.word)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                  selectedWord === node.word
                    ? 'border-white/30 text-white bg-white/10'
                    : 'border-white/10 text-white/70 hover:text-white'
                )}
              >
                {node.display}
              </button>
            ))}
          </div>
        </div>

        <div className="card-unified p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Puentes visibles</p>
          <div className="space-y-2">
            {coOccurrences.slice(0, 6).map((pair) => (
              <div
                key={pair.pair}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-200"
              >
                <span>{pair.pair}</span>
                <span className="text-white font-semibold">{pair.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-unified p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">Pulso compartido</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Contribuciones</p>
              <p className="text-xl font-semibold text-white">{pulseMetrics.totalNodes}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Últimas 24h</p>
              <p className="text-xl font-semibold text-white">{pulseMetrics.velocity.last24Hours}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
              {TYPE_ORDER.map((type) => (
                <div
                  key={`ratio-${type}`}
                  style={{ width: `${pulseMetrics.typeRatios[type]}%`, backgroundColor: TYPE_META[type].color }}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              {TYPE_ORDER.map((type) => (
                <span key={`legend-${type}`} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: TYPE_META[type].color }}
                  />
                  {TYPE_META[type].label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeaningNetwork;
