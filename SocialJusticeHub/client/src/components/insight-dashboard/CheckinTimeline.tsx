import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { CheckinEntry } from '@/hooks/useCheckinHistory';

const MOOD_LABELS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: '\u{1F614}', label: 'Dificil' },
  2: { emoji: '\u{1F615}', label: 'Complicada' },
  3: { emoji: '\u{1F610}', label: 'Normal' },
  4: { emoji: '\u{1F642}', label: 'Buena' },
  5: { emoji: '\u{1F60A}', label: 'Excelente' },
};

const PROGRESS_LABELS: Record<number, string> = {
  1: 'Nada',
  2: 'Poco',
  3: 'Algo',
  4: 'Bastante',
  5: 'Mucho',
};

interface Props {
  checkins: CheckinEntry[];
  hasCurrentWeek: boolean;
}

function formatWeekLabel(weekOf: string): string {
  const date = new Date(weekOf + 'T00:00:00');
  const day = date.getDate();
  const month = date.toLocaleDateString('es-AR', { month: 'short' });
  return `${day} ${month}`;
}

function getTrend(values: number[]): 'up' | 'down' | 'flat' {
  if (values.length < 2) return 'flat';
  const recent = values.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const older = values.slice(0, -3);
  if (older.length === 0) return 'flat';
  const oldAvg = older.reduce((a, b) => a + b, 0) / older.length;
  if (avg - oldAvg > 0.3) return 'up';
  if (oldAvg - avg > 0.3) return 'down';
  return 'flat';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 font-mono mb-1">Semana del {data.label}</p>
      <p className="text-white">
        {MOOD_LABELS[data.mood]?.emoji} Estado: <span className="font-bold">{MOOD_LABELS[data.mood]?.label}</span>
      </p>
      <p className="text-blue-300">
        Avance: <span className="font-bold">{PROGRESS_LABELS[data.progress]}</span>
      </p>
    </div>
  );
};

export default function CheckinTimeline({ checkins, hasCurrentWeek }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Sort chronologically (oldest first for chart)
  const sorted = [...checkins].sort((a, b) => a.weekOf.localeCompare(b.weekOf));
  const chartData = sorted.slice(-12).map(c => ({
    label: formatWeekLabel(c.weekOf),
    mood: c.mood,
    progress: c.progressRating,
  }));

  const moodTrend = getTrend(sorted.map(c => c.mood));
  const progressTrend = getTrend(sorted.map(c => c.progressRating));

  // Most recent check-in for detail view
  const latest = sorted[sorted.length - 1];

  // Show last 4 for expanded history
  const recentCheckins = [...checkins]
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf))
    .slice(0, expanded ? 8 : 3);

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
    if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
    if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
    return <Minus className="h-3.5 w-3.5 text-slate-500" />;
  };

  const trendLabel = (trend: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return 'En alza';
    if (trend === 'down') return 'En baja';
    return 'Estable';
  };

  // Empty state: no check-ins at all
  if (checkins.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="py-8 text-center">
          <Calendar className="h-10 w-10 text-blue-500/30 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-bold text-white mb-2">Check-in Semanal</h3>
          <p className="text-slate-400 text-sm mb-1 max-w-sm mx-auto">
            Registra como fue tu semana para ver tu evolucion en el tiempo.
          </p>
          <p className="text-slate-600 text-xs font-mono mb-5">
            Cada check-in queda guardado y construye tu historial
          </p>
          <Link href="/checkin-semanal">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-6 h-10 rounded-xl">
              Hacer mi primer check-in
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-blue-400" />
            Evolucion Semanal
          </CardTitle>
          {!hasCurrentWeek && (
            <Link href="/checkin-semanal">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider h-7 px-3 rounded-lg">
                Check-in
              </Button>
            </Link>
          )}
          {hasCurrentWeek && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              SEMANA OK
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Trend indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Estado</span>
              <TrendIcon trend={moodTrend} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{MOOD_LABELS[latest.mood]?.emoji}</span>
              <div>
                <p className="text-sm font-bold text-white">{MOOD_LABELS[latest.mood]?.label}</p>
                <p className={`text-[10px] font-mono ${moodTrend === 'up' ? 'text-emerald-400' : moodTrend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                  {trendLabel(moodTrend)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Avance</span>
              <TrendIcon trend={progressTrend} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-white">{latest.progressRating}</span>
              <span className="text-slate-500 text-xs">/5</span>
            </div>
            <p className={`text-[10px] font-mono ${progressTrend === 'up' ? 'text-emerald-400' : progressTrend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
              {trendLabel(progressTrend)}
            </p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length >= 2 && (
          <div className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-2">Ultimas semanas</p>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[1, 5]}
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[1, 2, 3, 4, 5]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#moodGrad)"
                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0a0a0a', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#progressGrad)"
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#10b981', stroke: '#0a0a0a', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[10px] text-slate-500">Estado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500">Avance</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent check-in details */}
        <div className="space-y-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Historial reciente</p>
          {recentCheckins.map((checkin, idx) => (
            <motion.div
              key={checkin.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#0a0a0a] rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500">
                  Semana del {formatWeekLabel(checkin.weekOf)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{MOOD_LABELS[checkin.mood]?.emoji}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Avance: {PROGRESS_LABELS[checkin.progressRating]}
                  </span>
                </div>
              </div>
              {(checkin.highlight || checkin.challenge || checkin.nextWeekIntention) && (
                <div className="space-y-1.5 mt-2 pt-2 border-t border-white/5">
                  {checkin.highlight && (
                    <p className="text-xs text-slate-400">
                      <span className="text-emerald-400/70 font-bold text-[10px] uppercase mr-1">Logro:</span>
                      {checkin.highlight}
                    </p>
                  )}
                  {checkin.challenge && (
                    <p className="text-xs text-slate-400">
                      <span className="text-amber-400/70 font-bold text-[10px] uppercase mr-1">Desafio:</span>
                      {checkin.challenge}
                    </p>
                  )}
                  {checkin.nextWeekIntention && (
                    <p className="text-xs text-slate-400">
                      <span className="text-blue-400/70 font-bold text-[10px] uppercase mr-1">Intencion:</span>
                      {checkin.nextWeekIntention}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Expand / collapse */}
        {checkins.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider font-bold transition-colors"
          >
            {expanded ? (
              <>Ver menos <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Ver mas ({checkins.length - 3} anteriores) <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
