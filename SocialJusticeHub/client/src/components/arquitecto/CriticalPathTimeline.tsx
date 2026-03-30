import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  PLAN_NODES,
  TIMELINE_PHASES,
  CRITICAL_CHAINS,
  type PlanNode,
  type TimelinePhase,
  type CriticalChain,
} from '@shared/arquitecto-data';

interface CriticalPathTimelineProps {
  onSelectPlan: (plan: PlanNode) => void;
}

const MIN_YEAR = -1;
const MAX_YEAR = 20;
const TOTAL_YEARS = MAX_YEAR - MIN_YEAR + 1; // 22 years
const YEAR_WIDTH = 80; // px per year
const SWIMLANE_HEIGHT = 44;
const HEADER_HEIGHT = 48;
const LEFT_LABEL_WIDTH = 200;
const CHART_WIDTH = TOTAL_YEARS * YEAR_WIDTH;

function yearToX(year: number): number {
  return (year - MIN_YEAR) * YEAR_WIDTH;
}

function phaseWidth(phase: TimelinePhase): number {
  return (phase.endYear - phase.startYear + 1) * YEAR_WIDTH;
}

function getPlanCriticalChains(planId: string): CriticalChain[] {
  return CRITICAL_CHAINS.filter((c) => c.plans.includes(planId));
}

function dangerColor(level: CriticalChain['dangerLevel']): string {
  switch (level) {
    case 'EXTREME':
      return '#ef4444';
    case 'CRITICAL':
      return '#f97316';
    case 'HIGH':
      return '#eab308';
  }
}

export default function CriticalPathTimeline({ onSelectPlan }: CriticalPathTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  const sortedPlans = useMemo(
    () => [...PLAN_NODES].sort((a, b) => a.ordinal - b.ordinal),
    [],
  );

  const phasesByPlan = useMemo(() => {
    const map = new Map<string, TimelinePhase[]>();
    for (const plan of sortedPlans) {
      map.set(
        plan.id,
        TIMELINE_PHASES.filter((p) => p.planId === plan.id).sort(
          (a, b) => a.startYear - b.startYear,
        ),
      );
    }
    return map;
  }, [sortedPlans]);

  // Plans involved in any critical chain, for highlighting
  const criticalPlanIds = useMemo(() => {
    const set = new Set<string>();
    CRITICAL_CHAINS.forEach((c) => c.plans.forEach((p) => set.add(p)));
    return set;
  }, []);

  const svgHeight = sortedPlans.length * SWIMLANE_HEIGHT + HEADER_HEIGHT;

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Ruta Crítica — Cronograma de 16 Mandatos
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 px-1">
        {CRITICAL_CHAINS.map((chain) => (
          <div
            key={chain.id}
            className="flex items-center gap-2 text-xs"
          >
            <span
              className="inline-block w-3 h-3 rounded-sm border-2"
              style={{ borderColor: dangerColor(chain.dangerLevel), backgroundColor: `${dangerColor(chain.dangerLevel)}20` }}
            />
            <span className="text-white/70">{chain.name}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{ color: dangerColor(chain.dangerLevel), backgroundColor: `${dangerColor(chain.dangerLevel)}15` }}
            >
              {chain.dangerLevel}
            </span>
          </div>
        ))}
      </div>

      {/* Chart container */}
      <div className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden">
        <div className="flex">
          {/* Fixed left labels */}
          <div
            className="flex-shrink-0 border-r border-white/10"
            style={{ width: LEFT_LABEL_WIDTH }}
          >
            {/* Header spacer */}
            <div
              className="flex items-end px-3 pb-1 border-b border-white/10 text-[11px] font-medium text-white/40 uppercase tracking-wider"
              style={{ height: HEADER_HEIGHT }}
            >
              Mandato
            </div>
            {sortedPlans.map((plan, i) => (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(plan)}
                className={`
                  flex items-center gap-2 w-full px-3 text-left transition-colors hover:bg-white/5
                  ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}
                `}
                style={{ height: SWIMLANE_HEIGHT }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: plan.color }}
                />
                <span className="text-xs font-medium text-white/80 truncate">
                  {plan.id}
                </span>
                {criticalPlanIds.has(plan.id) && (
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 text-red-400/70" />
                )}
              </button>
            ))}
          </div>

          {/* Scrollable chart area */}
          <div ref={scrollRef} className="overflow-x-auto flex-1 scrollbar-thin">
            <svg
              width={CHART_WIDTH}
              height={svgHeight}
              className="block"
            >
              {/* Year grid lines + labels */}
              {Array.from({ length: TOTAL_YEARS }, (_, i) => {
                const year = MIN_YEAR + i;
                const x = yearToX(year);
                return (
                  <g key={`year-${year}`}>
                    <line
                      x1={x}
                      y1={HEADER_HEIGHT}
                      x2={x}
                      y2={svgHeight}
                      stroke={year === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={year === 0 ? 2 : 1}
                      strokeDasharray={year === 0 ? undefined : '4 4'}
                    />
                    <text
                      x={x + YEAR_WIDTH / 2}
                      y={HEADER_HEIGHT - 8}
                      textAnchor="middle"
                      fill={year === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'}
                      fontSize={11}
                      fontWeight={year === 0 ? 600 : 400}
                      fontFamily="inherit"
                    >
                      {year === 0 ? 'Día 0' : year < 0 ? `A${year}` : `A+${year}`}
                    </text>
                  </g>
                );
              })}

              {/* Alternating row backgrounds */}
              {sortedPlans.map((_, i) => (
                <rect
                  key={`bg-${i}`}
                  x={0}
                  y={HEADER_HEIGHT + i * SWIMLANE_HEIGHT}
                  width={CHART_WIDTH}
                  height={SWIMLANE_HEIGHT}
                  fill={i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}
                />
              ))}

              {/* Phase bars */}
              {sortedPlans.map((plan, planIndex) => {
                const phases = phasesByPlan.get(plan.id) || [];
                const chains = getPlanCriticalChains(plan.id);
                const highestDanger = chains.length > 0
                  ? chains.reduce<CriticalChain['dangerLevel']>((worst, c) => {
                      const order: Record<CriticalChain['dangerLevel'], number> = { HIGH: 1, CRITICAL: 2, EXTREME: 3 };
                      return order[c.dangerLevel] > order[worst] ? c.dangerLevel : worst;
                    }, 'HIGH')
                  : null;

                return phases.map((phase, phaseIndex) => {
                  const x = yearToX(phase.startYear);
                  const w = phaseWidth(phase);
                  const y = HEADER_HEIGHT + planIndex * SWIMLANE_HEIGHT + 6;
                  const h = SWIMLANE_HEIGHT - 12;
                  const phaseKey = `${phase.planId}-${phase.name}`;
                  const isHovered = hoveredPhase === phaseKey;
                  const labelFits = w > 60;

                  return (
                    <g
                      key={`${plan.id}-${phaseIndex}`}
                      onMouseEnter={() => setHoveredPhase(phaseKey)}
                      onMouseLeave={() => setHoveredPhase(null)}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectPlan(plan)}
                    >
                      {/* Critical chain glow */}
                      {highestDanger && (
                        <rect
                          x={x + 1}
                          y={y - 1}
                          width={w - 2}
                          height={h + 2}
                          rx={4}
                          fill="none"
                          stroke={dangerColor(highestDanger)}
                          strokeWidth={isHovered ? 2 : 1}
                          opacity={isHovered ? 0.9 : 0.4}
                          filter={isHovered ? `drop-shadow(0 0 6px ${dangerColor(highestDanger)}80)` : undefined}
                        />
                      )}

                      {/* Phase bar */}
                      <rect
                        x={x + 2}
                        y={y}
                        width={Math.max(w - 4, 4)}
                        height={h}
                        rx={4}
                        fill={plan.color}
                        opacity={isHovered ? 0.55 : 0.35}
                        style={{ transition: 'opacity 150ms ease' }}
                      />

                      {/* Phase label */}
                      {labelFits && (
                        <text
                          x={x + w / 2}
                          y={y + h / 2 + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="rgba(255,255,255,0.85)"
                          fontSize={10}
                          fontWeight={500}
                          fontFamily="inherit"
                          style={{ pointerEvents: 'none' }}
                        >
                          {phase.name}
                        </text>
                      )}

                      {/* Tooltip on hover */}
                      {isHovered && (
                        <g>
                          <rect
                            x={x + w / 2 - 80}
                            y={y - 30}
                            width={160}
                            height={22}
                            rx={4}
                            fill="rgba(10,10,10,0.95)"
                            stroke="rgba(255,255,255,0.15)"
                          />
                          <text
                            x={x + w / 2}
                            y={y - 16}
                            textAnchor="middle"
                            fill="white"
                            fontSize={10}
                            fontFamily="inherit"
                          >
                            {phase.name} — A{phase.startYear < 0 ? phase.startYear : `+${phase.startYear}`} a A+{phase.endYear}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                });
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Critical chain details */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {CRITICAL_CHAINS.map((chain) => (
          <motion.div
            key={chain.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle
                className="w-3.5 h-3.5"
                style={{ color: dangerColor(chain.dangerLevel) }}
              />
              <span className="text-xs font-semibold text-white/90">
                {chain.name}
              </span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed mb-2">
              {chain.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {chain.plans.map((planId) => {
                const plan = PLAN_NODES.find((p) => p.id === planId);
                return (
                  <span
                    key={planId}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      backgroundColor: `${plan?.color || '#666'}20`,
                      color: plan?.color || '#999',
                    }}
                  >
                    {planId}
                  </span>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
