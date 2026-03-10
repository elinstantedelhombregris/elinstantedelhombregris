import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import AnimatedScore from './AnimatedScore';

interface LifeArea {
  id: number;
  name: string;
  iconName: string;
  colorTheme: { primary: string; secondary: string } | null;
  currentScore: number;
  desiredScore: number;
  gap: number;
}

interface ConstellationProps {
  areas: LifeArea[];
  onAreaClick?: (areaId: number) => void;
}

const defaultColor = '#64748b';

export default function Constellation({ areas, onAreaClick }: ConstellationProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  const validAreas = (areas || []).filter(a => a && a.id && a.name);

  if (!validAreas.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500 text-sm">Cargando areas...</p>
      </div>
    );
  }

  const svgSize = 600;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const orbitRadius = 210;
  const numAreas = validAreas.length;
  const angleStep = (2 * Math.PI) / numAreas;

  const averageScore = Math.round(
    validAreas.reduce((sum, a) => sum + (a.currentScore || 0), 0) / validAreas.length
  );

  const getColor = (area: LifeArea) => area.colorTheme?.primary || defaultColor;

  // Orb radius: min 18, max 40, proportional to score
  const getOrbRadius = (score: number) => 18 + (Math.min(score, 100) / 100) * 22;

  // Desired ring radius: same formula but for desired score
  const getDesiredRadius = (score: number) => 18 + (Math.min(score, 100) / 100) * 22;

  const handleClick = (areaId: number) => {
    if (onAreaClick) {
      onAreaClick(areaId);
    } else {
      setLocation(`/life-areas/${areaId}`);
    }
  };

  // Calculate node positions
  const nodes = validAreas.map((area, i) => {
    const angle = i * angleStep - Math.PI / 2; // Start from top
    const x = cx + orbitRadius * Math.cos(angle);
    const y = cy + orbitRadius * Math.sin(angle);
    const color = getColor(area);
    const orbR = getOrbRadius(area.currentScore);
    const desiredR = getDesiredRadius(area.desiredScore);
    const labelRadius = orbitRadius + 52;
    const lx = cx + labelRadius * Math.cos(angle);
    const ly = cy + labelRadius * Math.sin(angle);
    return { area, x, y, color, orbR, desiredR, lx, ly, angle };
  });

  return (
    <div className="w-full flex items-center justify-center px-4 py-6 relative">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 bg-blue-500/[0.03] blur-[80px] pointer-events-none rounded-full scale-75" />

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="overflow-visible relative z-10"
        style={{ maxWidth: '560px', minWidth: '280px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Constellation threads between adjacent nodes */}
        {nodes.map((node, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return (
            <line
              key={`thread-${i}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke="white"
              strokeWidth="0.5"
              opacity="0.06"
            />
          );
        })}

        {/* Orbit guide circle */}
        <circle
          cx={cx}
          cy={cy}
          r={orbitRadius}
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.04"
        />

        {/* Area nodes */}
        {nodes.map(({ area, x, y, color, orbR, desiredR, lx, ly }, i) => {
          const isHovered = hoveredId === area.id;
          const isDimmed = hoveredId !== null && hoveredId !== area.id;

          return (
            <motion.g
              key={area.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isDimmed ? 0.35 : 1,
                scale: 1,
              }}
              transition={{
                delay: i * 0.04,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              style={{ transformOrigin: `${x}px ${y}px` }}
              onMouseEnter={() => setHoveredId(area.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleClick(area.id)}
              className="cursor-pointer"
            >
              {/* Desired score ring (dashed) */}
              {area.desiredScore > area.currentScore && (
                <circle
                  cx={x}
                  cy={y}
                  r={desiredR + 4}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity={isHovered ? 0.5 : 0.2}
                />
              )}

              {/* Main orb with radial gradient */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? orbR + 3 : orbR}
                fill={color}
                opacity={0.85}
                style={{
                  filter: `drop-shadow(0 0 ${isHovered ? 18 : 10}px ${color}50)`,
                  transition: 'r 0.2s ease, filter 0.2s ease',
                }}
              />

              {/* Inner bright core */}
              <circle
                cx={x}
                cy={y}
                r={orbR * 0.4}
                fill="white"
                opacity={isHovered ? 0.35 : 0.15}
              />

              {/* Label */}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[11px] font-medium select-none pointer-events-none"
                fill={isHovered ? '#f1f5f9' : '#94a3b8'}
                style={{ transition: 'fill 0.2s' }}
              >
                {area.name}
              </text>

              {/* Score on hover */}
              {isHovered && (
                <motion.text
                  x={lx}
                  y={ly + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] font-mono select-none pointer-events-none"
                  fill={color}
                  initial={{ opacity: 0, y: ly + 10 }}
                  animate={{ opacity: 1, y: ly + 15 }}
                  transition={{ duration: 0.15 }}
                >
                  {area.currentScore} / {area.desiredScore}
                </motion.text>
              )}
            </motion.g>
          );
        })}

        {/* Center score */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-4xl font-light fill-white select-none"
          style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.15))' }}
        >
          {averageScore}
        </text>
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[10px] uppercase tracking-[0.25em] fill-slate-500 select-none"
        >
          equilibrio
        </text>
      </svg>
    </div>
  );
}
