import { useMemo } from "react";

interface DataPoint {
  date: string;
  score: number;
}

interface ScoreTrendChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showDots?: boolean;
  showArea?: boolean;
}

export function ScoreTrendChart({
  data,
  color = "#3b82f6",
  height = 120,
  showDots = true,
  showArea = true,
}: ScoreTrendChartProps) {
  const width = 400;
  const padding = { top: 10, right: 10, bottom: 24, left: 32 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { linePath, areaPath, points, yTicks } = useMemo(() => {
    if (data.length === 0) return { linePath: "", areaPath: "", points: [], yTicks: [] };

    const minY = Math.max(0, Math.min(...data.map(d => d.score)) - 10);
    const maxY = Math.min(100, Math.max(...data.map(d => d.score)) + 10);
    const range = maxY - minY || 1;

    const pts = data.map((d, i) => ({
      x: padding.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
      y: padding.top + chartH - ((d.score - minY) / range) * chartH,
      ...d,
    }));

    const line = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const area = line +
      ` L ${pts[pts.length - 1].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)}` +
      ` L ${pts[0].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} Z`;

    const tickCount = 3;
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      const val = minY + (range * i) / (tickCount - 1);
      return {
        value: Math.round(val),
        y: padding.top + chartH - (i / (tickCount - 1)) * chartH,
      };
    });

    return { linePath: line, areaPath: area, points: pts, yTicks: ticks };
  }, [data, chartW, chartH]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-600 text-xs" style={{ height }}>
        Sin datos de tendencia
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={tick.y}
            x2={width - padding.right}
            y2={tick.y}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="3 3"
          />
          <text
            x={padding.left - 4}
            y={tick.y + 3}
            textAnchor="end"
            className="fill-slate-600"
            fontSize="9"
            fontFamily="monospace"
          >
            {tick.value}
          </text>
        </g>
      ))}

      {/* Area fill */}
      {showArea && areaPath && (
        <path d={areaPath} fill={`${color}15`} />
      )}

      {/* Line */}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      )}

      {/* Dots */}
      {showDots && points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={color}
          stroke="#0a0a0a"
          strokeWidth="1.5"
        />
      ))}

      {/* Date labels */}
      {points.length > 0 && (
        <>
          <text
            x={points[0].x}
            y={height - 4}
            textAnchor="start"
            className="fill-slate-600"
            fontSize="8"
            fontFamily="monospace"
          >
            {points[0].date}
          </text>
          {points.length > 1 && (
            <text
              x={points[points.length - 1].x}
              y={height - 4}
              textAnchor="end"
              className="fill-slate-600"
              fontSize="8"
              fontFamily="monospace"
            >
              {points[points.length - 1].date}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
