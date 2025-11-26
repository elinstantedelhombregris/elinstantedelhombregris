import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

interface LifeArea {
  id: number;
  name: string;
  iconName: string;
  colorTheme: {
    primary: string;
    secondary: string;
  } | null;
  currentScore: number;
  desiredScore: number;
  gap: number;
}

interface LifeWheelProps {
  areas: LifeArea[];
  onAreaClick?: (areaId: number) => void;
  highlightAreaId?: number | null;
  onAreaHoverChange?: (area: LifeArea | null) => void;
  showTargets?: boolean;
}

const LifeWheel: React.FC<LifeWheelProps> = ({
  areas,
  onAreaClick,
  highlightAreaId = null,
  onAreaHoverChange,
  showTargets = true,
}) => {
  const [hoveredArea, setHoveredArea] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  if (!areas || areas.length === 0) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center text-slate-500">
          <p className="text-lg font-mono font-light tracking-widest animate-pulse">ESPERANDO DATOS DEL SISTEMA...</p>
        </div>
      </div>
    );
  }

  const validAreas = areas.filter(a => a && a.id && a.name);
  if (validAreas.length === 0) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center text-slate-500">
          <p className="text-lg font-mono font-light tracking-widest">SISTEMA VACÍO</p>
        </div>
      </div>
    );
  }

  // Configuración HUD High-Tech
  const numAreas = validAreas.length;
  const angleStep = 360 / numAreas;
  const svgSize = 800;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const innerRadius = 100;
  const outerRadius = 320;
  const ringWidth = (outerRadius - innerRadius) / 10;

  // Paleta Neón / Glow para Dark Mode
  const neonPalette = [
    { base: '#3b82f6', tint: '#60a5fa', glow: '#93c5fd' }, // Blue Electric
    { base: '#8b5cf6', tint: '#a78bfa', glow: '#c4b5fd' }, // Violet Pulse
    { base: '#10b981', tint: '#34d399', glow: '#6ee7b7' }, // Emerald Matrix
    { base: '#f59e0b', tint: '#fbbf24', glow: '#fcd34d' }, // Amber Energy
  ];

  const getScoreRadius = (score: number) => {
    const ringIndex = Math.min(Math.floor(score / 10), 9);
    return innerRadius + (ringIndex + 1) * ringWidth;
  };

  const averageScore = validAreas.length > 0 
    ? Math.round(validAreas.reduce((sum, a) => sum + (a.currentScore || 0), 0) / validAreas.length)
    : 0;

  const handleAreaClick = (areaId: number) => {
    if (onAreaClick) {
      onAreaClick(areaId);
    } else if (areaId > 0) {
      setLocation(`/life-areas/${areaId}`);
    }
  };

  return (
    <div className="w-full flex items-center justify-center bg-transparent px-4 sm:px-8 py-10 sm:py-12 relative">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full transform scale-75"></div>

      <svg 
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgSize} ${svgSize}`} 
        className="overflow-visible relative z-10"
        style={{ maxWidth: '720px', minWidth: '260px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Filtro de Neón Intenso */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Patrón HUD Scanlines */}
          <pattern id="scanlinePattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="1" fill="currentColor" fillOpacity="0.2" />
          </pattern>

          {/* Gradientes Cyberpunk */}
          {validAreas.map((area, index) => {
            const palette = neonPalette[index % 4];
            return (
              <linearGradient key={`area-grad-${area.id}`} id={`areaGradient-${area.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={palette.base} stopOpacity="0.8" />
                <stop offset="100%" stopColor={palette.tint} stopOpacity="0.4" />
              </linearGradient>
            );
          })}

          {/* Núcleo del Reactor */}
          <radialGradient id="coreReactor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="1" />
            <stop offset="70%" stopColor="#0f172a" stopOpacity="1" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Anillos HUD Exteriores - Rotatorios */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        >
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius + 40}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="10 30"
            opacity="0.5"
          />
        </motion.g>
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        >
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius + 20}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="2 8"
            opacity="0.3"
          />
        </motion.g>

        {/* Grid Radial HUD */}
        {[0, 2.5, 5, 7.5, 10].map((ringIndex) => {
          const radius = innerRadius + ringIndex * ringWidth;
          return (
            <circle
              key={`grid-ring-${ringIndex}`}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              opacity={ringIndex === 0 || ringIndex === 10 ? 0.4 : 0.15}
            />
          );
        })}

        {/* Segmentos de Datos */}
        {validAreas.map((area, index) => {
          const palette = neonPalette[index % 4];
          const startAngle = (index * angleStep - 90) * (Math.PI / 180);
          const endAngle = ((index + 1) * angleStep - 90) * (Math.PI / 180);
          const midAngle = (startAngle + endAngle) / 2;
          
          const scoreRadius = getScoreRadius(area.currentScore);
          const desiredRadius = getScoreRadius(area.desiredScore);
          
          const resolvedActiveId = highlightAreaId ?? hoveredArea;
          const isActive = resolvedActiveId === area.id;
          const isDimmed = resolvedActiveId !== null && resolvedActiveId !== area.id;

          // Coordenadas shape
          const x1 = centerX + innerRadius * Math.cos(startAngle);
          const y1 = centerY + innerRadius * Math.sin(startAngle);
          const x2 = centerX + scoreRadius * Math.cos(startAngle);
          const y2 = centerY + scoreRadius * Math.sin(startAngle);
          const x3 = centerX + scoreRadius * Math.cos(endAngle);
          const y3 = centerY + scoreRadius * Math.sin(endAngle);
          const x4 = centerX + innerRadius * Math.cos(endAngle);
          const y4 = centerY + innerRadius * Math.sin(endAngle);

          // Coordenadas GAP
          const gapX2 = centerX + desiredRadius * Math.cos(startAngle);
          const gapY2 = centerY + desiredRadius * Math.sin(startAngle);
          const gapX3 = centerX + desiredRadius * Math.cos(endAngle);
          const gapY3 = centerY + desiredRadius * Math.sin(endAngle);

          // Etiquetas
          const labelRadius = outerRadius + 70;
          const labelX = centerX + labelRadius * Math.cos(midAngle);
          const labelY = centerY + labelRadius * Math.sin(midAngle);
          const isRightSide = Math.cos(midAngle) >= 0;
          
          const labelBoxWidth = Math.min(200, Math.max(120, area.name.length * 9));
          const labelBoxHeight = 28;
          const labelRectX = isRightSide ? 10 : -(labelBoxWidth + 10);

          return (
            <g
              key={area.id}
              onMouseEnter={() => {
                setHoveredArea(area.id);
                onAreaHoverChange?.(area);
              }}
              onMouseLeave={() => {
                setHoveredArea(null);
                onAreaHoverChange?.(null);
              }}
              onClick={() => handleAreaClick(area.id)}
              className="cursor-pointer transition-all duration-300"
              style={{ opacity: isDimmed ? 0.2 : 1 }}
            >
              {/* Zona GAP (Holográfica) */}
              {showTargets && area.desiredScore > area.currentScore && (
                <motion.path
                  d={`M ${x2} ${y2} L ${gapX2} ${gapY2} A ${desiredRadius} ${desiredRadius} 0 0 1 ${gapX3} ${gapY3} L ${x3} ${y3} A ${scoreRadius} ${scoreRadius} 0 0 0 ${x2} ${y2} Z`}
                  fill="url(#scanlinePattern)"
                  stroke={palette.base}
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  className="text-slate-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive ? 0.4 : 0.15 }}
                />
              )}

              {/* Segmento Principal (Plasma) */}
              <motion.path
                d={`M ${x1} ${y1} L ${x2} ${y2} A ${scoreRadius} ${scoreRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`}
                fill={`url(#areaGradient-${area.id})`}
                stroke={palette.glow}
                strokeWidth={isActive ? 2 : 1}
                filter={isActive ? "url(#strongGlow)" : "none"}
                initial={{ scale: 1 }}
                animate={{ 
                  scale: isActive ? 1.03 : 1,
                  filter: isActive ? "url(#strongGlow)" : "none"
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{ transformOrigin: `${centerX}px ${centerY}px` }}
              />

              {/* Línea Conectora Láser */}
              <motion.line
                x1={centerX + outerRadius * Math.cos(midAngle)}
                y1={centerY + outerRadius * Math.sin(midAngle)}
                x2={labelX}
                y2={labelY}
                stroke={palette.base}
                strokeWidth={1}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: isActive ? 1 : 0.3 }}
              />
              
              <motion.circle
                cx={labelX}
                cy={labelY}
                r={2}
                fill={palette.glow}
                filter="url(#neonGlow)"
              />

              {/* Etiqueta HUD */}
              <g transform={`translate(${labelX}, ${labelY})`}>
                <motion.rect
                  x={labelRectX}
                  y={-labelBoxHeight / 2}
                  width={labelBoxWidth}
                  height={labelBoxHeight}
                  fill={isActive ? "rgba(15, 23, 42, 0.9)" : "rgba(15, 23, 42, 0.4)"}
                  stroke={isActive ? palette.base : "#334155"}
                  strokeWidth={1}
                  rx={2}
                  animate={{
                    fill: isActive ? "rgba(15, 23, 42, 0.9)" : "rgba(15, 23, 42, 0.4)",
                    stroke: isActive ? palette.base : "#334155"
                  }}
                />
                <motion.text
                  x={labelRectX + labelBoxWidth / 2}
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono text-[10px] font-bold uppercase tracking-wider"
                  style={{ fill: isActive ? "#f8fafc" : "#94a3b8" }}
                >
                  {area.name}
                </motion.text>

                {/* Score flotante */}
                {isActive && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <text
                      x={labelRectX + labelBoxWidth / 2}
                      y={24}
                      textAnchor="middle"
                      className="font-mono text-[9px] tracking-widest"
                      fill={palette.glow}
                    >
                      NVL: {area.currentScore}%
                    </text>
                  </motion.g>
                )}
              </g>
            </g>
          );
        })}

        {/* Reactor Central (Núcleo) */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 8}
          fill="url(#coreReactor)"
          stroke="#334155"
          strokeWidth="2"
          filter="url(#neonGlow)"
          animate={{
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
          }}
          className="cursor-pointer hover:stroke-blue-400 transition-colors"
          onClick={() => onAreaClick?.(0)}
        />
        
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 15}
          fill="none"
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="4 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        />

        <text
          x={centerX}
          y={centerY - 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[9px] uppercase tracking-[0.2em] font-bold fill-slate-500 font-mono"
        >
          SINCRONÍA
        </text>
        
        <text
          x={centerX}
          y={centerY + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-3xl font-bold fill-white font-mono tracking-tighter"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))" }}
        >
          {averageScore}
        </text>

        <text
          x={centerX}
          y={centerY + 30}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[8px] fill-emerald-500 font-mono tracking-widest"
        >
          ESTABLE
        </text>

      </svg>
    </div>
  );
};

export default LifeWheel;
