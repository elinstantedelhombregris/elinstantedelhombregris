import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useInView, animate } from 'framer-motion';
import {
  RefreshCw, Heart, Zap, GraduationCap, Scale,
  Briefcase, HeartPulse, Users, Sunrise,
} from 'lucide-react';
import {
  useConvergenceAnalysis,
  THEME_META,
  TYPE_COLORS,
  TYPE_LABELS,
  type ThemeKey,
  type DreamType,
  type ThemeCard,
  type SharedConcept,
  type StreamLink,
} from '@/hooks/useConvergenceAnalysis';

// ─── Constants ───

const DREAM_TYPES: DreamType[] = ['dream', 'value', 'need', 'basta'];

const TYPE_VERB: Record<DreamType, string> = {
  dream: 'soñamos',
  value: 'valoramos',
  need:  'necesitamos',
  basta: 'rechazamos',
};

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  RefreshCw, Heart, Zap, GraduationCap, Scale,
  Briefcase, HeartPulse, Users, Sunrise,
};

// ─── Styles injected once ───

const flowAnimationCSS = `
@keyframes convergenceFlow {
  0%   { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 0; }
}
@keyframes radiantPulse {
  0%, 100% { opacity: 0.7; filter: brightness(1); }
  50%      { opacity: 1;   filter: brightness(1.4); }
}
`;

// ─── Section A: Hero Convergence Stat ───

const HeroConvergenceStat: React.FC<{
  percentage: number;
  sharedCount: number;
  totalActive: number;
}> = ({ percentage, sharedCount, totalActive }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionVal, percentage, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [isInView, percentage, motionVal]);

  return (
    <div ref={ref} className="text-center py-12 md:py-16 relative">
      {/* Purple radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-purple-600/20 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-7xl md:text-9xl font-black text-white tabular-nums"
        >
          {display}
          <span className="text-purple-400">%</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-lg md:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed"
        >
          de lo que{' '}
          {DREAM_TYPES.map((t, i) => (
            <React.Fragment key={t}>
              {i > 0 && (i < DREAM_TYPES.length - 1 ? ', ' : ' y ')}
              <strong style={{ color: TYPE_COLORS[t] }}>{TYPE_VERB[t]}</strong>
            </React.Fragment>
          ))}
          … habla de lo mismo
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-3 text-sm text-slate-500 font-mono"
        >
          {sharedCount} de {totalActive} temas compartidos
        </motion.p>
      </div>
    </div>
  );
};

// ─── Section B: Theme Convergence Cards ───

const ConvergenceDots: React.FC<{ presentTypes: DreamType[] }> = ({ presentTypes }) => (
  <div className="flex gap-1.5">
    {DREAM_TYPES.map((t) => (
      <span
        key={t}
        className="w-2.5 h-2.5 rounded-full transition-opacity"
        style={{
          backgroundColor: TYPE_COLORS[t],
          opacity: presentTypes.includes(t) ? 1 : 0.15,
        }}
      />
    ))}
  </div>
);

const ThemeCardComponent: React.FC<{ card: ThemeCard; index: number }> = ({ card, index }) => {
  const IconComp = ICON_MAP[card.icon];
  const is4 = card.convergenceCount === 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`relative rounded-2xl bg-white/5 backdrop-blur-sm border overflow-hidden ${
        is4
          ? 'border-transparent'
          : 'border-white/10'
      }`}
      style={
        is4
          ? {
              backgroundImage:
                'linear-gradient(#0b0f1a, #0b0f1a), linear-gradient(135deg, #3b82f6, #ec4899, #f59e0b, #ef4444)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              border: '1.5px solid transparent',
            }
          : undefined
      }
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {IconComp && <IconComp className="w-5 h-5 text-purple-400" />}
            <span className="text-sm font-semibold text-white">{card.label}</span>
          </div>
          <ConvergenceDots presentTypes={card.presentTypes} />
        </div>

        {/* Quotes per type */}
        <div className="space-y-2 mt-3">
          {DREAM_TYPES.filter((t) => card.quotes[t]?.length).map((t) => (
            <div
              key={t}
              className="rounded-lg bg-black/30 px-3 py-2 text-xs text-slate-300 border-l-2"
              style={{ borderLeftColor: TYPE_COLORS[t] }}
            >
              <span className="block text-[10px] uppercase tracking-wider mb-0.5" style={{ color: TYPE_COLORS[t] }}>
                {TYPE_LABELS[t]}
              </span>
              {card.quotes[t]![0]}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ThemeCardsGrid: React.FC<{ cards: ThemeCard[] }> = ({ cards }) => {
  if (cards.length === 0) return null;
  return (
    <div className="py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-6 text-center font-mono">
        Temas que cruzan todas las voces
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <ThemeCardComponent key={card.theme} card={card} index={i} />
        ))}
      </div>
    </div>
  );
};

// ─── Section C: Convergence Flow Diagram ───

const FlowDiagram: React.FC<{ links: StreamLink[]; cards: ThemeCard[] }> = ({ links, cards }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  if (cards.length === 0) return null;

  // Layout: sources on left (y-positions), themes in center-right
  const svgW = 800;
  const svgH = 400;
  const srcX = 30;
  const themeX = 620;
  const srcSpacing = svgH / (DREAM_TYPES.length + 1);
  const themeSpacing = svgH / (cards.length + 1);

  const srcY = (idx: number) => srcSpacing * (idx + 1);
  const themeY = (idx: number) => themeSpacing * (idx + 1);
  const themeIndex = (tk: ThemeKey) => cards.findIndex((c) => c.theme === tk);

  // Max strength for line width scaling
  const maxStrength = Math.max(1, ...links.map((l) => l.strength));

  return (
    <div ref={ref} className="py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-6 text-center font-mono">
        Flujo de convergencia
      </p>

      {/* Desktop SVG */}
      <div className="hidden md:block">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-auto"
          style={{ maxHeight: 420 }}
        >
          <defs>
            {DREAM_TYPES.map((t) => (
              <linearGradient key={`grad-${t}`} id={`flow-${t}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={TYPE_COLORS[t]} stopOpacity="0.8" />
                <stop offset="100%" stopColor={TYPE_COLORS[t]} stopOpacity="0.2" />
              </linearGradient>
            ))}
          </defs>

          {/* Paths */}
          {isInView &&
            links.map((link, i) => {
              const si = DREAM_TYPES.indexOf(link.source);
              const ti = themeIndex(link.theme);
              if (ti < 0) return null;

              const y1 = srcY(si);
              const y2 = themeY(ti);
              const cp1x = srcX + (themeX - srcX) * 0.35;
              const cp2x = srcX + (themeX - srcX) * 0.65;
              const sw = 1 + (link.strength / maxStrength) * 4;

              return (
                <motion.path
                  key={`${link.source}-${link.theme}`}
                  d={`M ${srcX + 60} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${themeX - 20} ${y2}`}
                  fill="none"
                  stroke={`url(#flow-${link.source})`}
                  strokeWidth={sw}
                  strokeDasharray="6 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.1 * i, ease: 'easeInOut' }}
                  style={{ animation: 'convergenceFlow 1.5s linear infinite' }}
                />
              );
            })}

          {/* Source labels */}
          {DREAM_TYPES.map((t, i) => (
            <g key={`src-${t}`}>
              <circle cx={srcX + 10} cy={srcY(i)} r={8} fill={TYPE_COLORS[t]} opacity={0.8} />
              <text
                x={srcX + 24}
                y={srcY(i) + 4}
                fill={TYPE_COLORS[t]}
                fontSize="13"
                fontWeight="600"
              >
                {TYPE_LABELS[t]}
              </text>
            </g>
          ))}

          {/* Theme nodes */}
          {cards.map((card, i) => (
            <g key={`theme-${card.theme}`}>
              <circle
                cx={themeX}
                cy={themeY(i)}
                r={12}
                fill="rgba(168,85,247,0.15)"
                stroke="rgba(168,85,247,0.4)"
                strokeWidth={1.5}
              />
              <text
                x={themeX + 20}
                y={themeY(i) + 4}
                fill="#e2e8f0"
                fontSize="12"
                fontWeight="500"
              >
                {card.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Mobile: simplified vertical list */}
      <div className="md:hidden space-y-3">
        {cards.map((card) => (
          <div
            key={card.theme}
            className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3"
          >
            <div className="flex gap-1">
              {DREAM_TYPES.map((t) => (
                <span
                  key={t}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: TYPE_COLORS[t],
                    opacity: card.presentTypes.includes(t) ? 1 : 0.15,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-white font-medium">{card.label}</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">
              {card.convergenceCount}/4
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Section D: Shared Concepts Cloud ───

const ConceptsCloud: React.FC<{ concepts: SharedConcept[] }> = ({ concepts }) => {
  if (concepts.length === 0) return null;

  // Size / glow tiers based on typeCount (1-4)
  const sizeMap: Record<number, string> = {
    1: 'text-xs',
    2: 'text-sm',
    3: 'text-base font-semibold',
    4: 'text-lg font-bold',
  };
  const glowMap: Record<number, string> = {
    1: 'opacity-50',
    2: 'opacity-70',
    3: 'opacity-90',
    4: 'opacity-100',
  };

  return (
    <div className="py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-6 text-center font-mono">
        Conceptos compartidos
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {concepts.map((c, i) => (
          <motion.div
            key={c.word}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.03, type: 'spring', stiffness: 200 }}
            className={`inline-flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 ${glowMap[c.typeCount]} ${
              c.typeCount === 4 ? 'ring-1 ring-purple-500/30' : ''
            }`}
            style={
              c.typeCount === 4
                ? { animation: 'radiantPulse 3s ease-in-out infinite' }
                : undefined
            }
          >
            <span className={`text-white ${sizeMap[c.typeCount]}`}>{c.display}</span>
            <div className="flex gap-1">
              {DREAM_TYPES.map((t) => (
                <span
                  key={t}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: TYPE_COLORS[t],
                    opacity: c.presentTypes.includes(t) ? 1 : 0.15,
                  }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───

const MeaningNetwork: React.FC = () => {
  const {
    convergencePercentage,
    sharedThemeCount,
    totalActiveThemes,
    themeCards,
    sharedConcepts,
    streamLinks,
    totalContributions,
    isLoading,
  } = useConvergenceAnalysis();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <p className="text-white text-lg font-semibold animate-pulse">Cargando la red…</p>
      </div>
    );
  }

  if (totalContributions === 0) {
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
    <div className="space-y-4">
      <style>{flowAnimationCSS}</style>

      {/* A: Hero Convergence Stat */}
      <HeroConvergenceStat
        percentage={convergencePercentage}
        sharedCount={sharedThemeCount}
        totalActive={totalActiveThemes}
      />

      {/* B: Theme Convergence Cards */}
      <ThemeCardsGrid cards={themeCards} />

      {/* C: Convergence Flow Diagram */}
      <FlowDiagram links={streamLinks} cards={themeCards} />

      {/* D: Shared Concepts Cloud */}
      <ConceptsCloud concepts={sharedConcepts} />
    </div>
  );
};

export default MeaningNetwork;
