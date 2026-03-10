import React, { useMemo } from 'react';

interface RadarDataPoint {
  name: string;
  current: number;
  desired: number;
}

interface SubcategoryRadarProps {
  data: RadarDataPoint[];
  size?: number;
  currentColor?: string;
  desiredColor?: string;
  showLabels?: boolean;
  className?: string;
}

export default function SubcategoryRadar({
  data,
  size = 280,
  currentColor = '#3b82f6',
  desiredColor = '#a855f7',
  showLabels = true,
  className = '',
}: SubcategoryRadarProps) {
  const center = size / 2;
  const radius = (size / 2) - (showLabels ? 50 : 20);
  const levels = 5;
  const maxValue = 100;

  const angleSlice = (2 * Math.PI) / data.length;

  const getPoint = (value: number, index: number) => {
    const normalizedValue = Math.min(value, maxValue) / maxValue;
    const angle = angleSlice * index - Math.PI / 2;
    return {
      x: center + radius * normalizedValue * Math.cos(angle),
      y: center + radius * normalizedValue * Math.sin(angle),
    };
  };

  const currentPath = useMemo(() => {
    return data.map((d, i) => {
      const point = getPoint(d.current, i);
      return `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }).join(' ') + ' Z';
  }, [data, center, radius]);

  const desiredPath = useMemo(() => {
    return data.map((d, i) => {
      const point = getPoint(d.desired, i);
      return `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }).join(' ') + ' Z';
  }, [data, center, radius]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      {/* Grid circles */}
      {Array.from({ length: levels }, (_, i) => {
        const r = (radius / levels) * (i + 1);
        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Grid lines (axes) */}
      {data.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x2}
            y2={y2}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}

      {/* Desired area (outline) */}
      <path
        d={desiredPath}
        fill={`${desiredColor}10`}
        stroke={desiredColor}
        strokeWidth="1.5"
        strokeDasharray="6 3"
        opacity="0.6"
      />

      {/* Current area (filled) */}
      <path
        d={currentPath}
        fill={`${currentColor}20`}
        stroke={currentColor}
        strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 6px ${currentColor}40)` }}
      />

      {/* Data points - current */}
      {data.map((d, i) => {
        const point = getPoint(d.current, i);
        return (
          <circle
            key={`current-${i}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={currentColor}
            stroke="#0a0a0a"
            strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 4px ${currentColor}80)` }}
          />
        );
      })}

      {/* Data points - desired */}
      {data.map((d, i) => {
        const point = getPoint(d.desired, i);
        return (
          <circle
            key={`desired-${i}`}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="transparent"
            stroke={desiredColor}
            strokeWidth="1.5"
            opacity="0.7"
          />
        );
      })}

      {/* Labels with scores */}
      {showLabels && data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelRadius = radius + 28;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);

        // Determine text-anchor based on position
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (Math.cos(angle) > 0.3) textAnchor = 'start';
        else if (Math.cos(angle) < -0.3) textAnchor = 'end';

        return (
          <g key={`label-${i}`}>
            <text
              x={x}
              y={y - 6}
              textAnchor={textAnchor}
              dominantBaseline="central"
              className="fill-slate-400 text-[10px] font-medium"
            >
              {d.name.length > 16 ? d.name.slice(0, 14) + '...' : d.name}
            </text>
            <text
              x={x}
              y={y + 7}
              textAnchor={textAnchor}
              dominantBaseline="central"
              className="text-[9px] font-mono"
              fill={currentColor}
              opacity="0.7"
            >
              {Math.round(d.current)}/{Math.round(d.desired)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
