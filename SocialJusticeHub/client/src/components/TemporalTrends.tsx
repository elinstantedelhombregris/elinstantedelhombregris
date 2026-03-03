import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, Clock } from 'lucide-react';
import { useMapPulseAnalysis } from '@/hooks/useMapPulseAnalysis';
import { cn } from '@/lib/utils';

const TemporalTrends = () => {
  const { temporalData } = useMapPulseAnalysis();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('30d');

  const chartData = useMemo(() => {
    if (timeRange === '24h') {
      // Últimas 24 horas por hora
      const now = new Date();
      const hours: any[] = [];
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourStr = hour.toISOString().split('T')[0] + 'T' + String(hour.getHours()).padStart(2, '0') + ':00';
        const startOfHour = new Date(hour.setMinutes(0, 0, 0));
        const endOfHour = new Date(hour.setMinutes(59, 59, 999));
        
        // This would require filtering by hour, simplified for now
        hours.push({
          time: String(hour.getHours()).padStart(2, '0') + ':00',
          dream: 0,
          value: 0,
          need: 0,
          basta: 0,
          total: 0
        });
      }
      return hours;
    }
    
    const range = timeRange === '7d' ? 7 : 30;
    return temporalData.slice(-range).map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('es-AR', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [temporalData, timeRange]);

  // Calcular picos de actividad
  const activityPeaks = useMemo(() => {
    const totals = temporalData.map(d => d.total);
    const max = Math.max(...totals);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const threshold = avg + (max - avg) * 0.5;
    
    return temporalData
      .map((d, i) => ({ ...d, index: i }))
      .filter(d => d.total >= threshold)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [temporalData]);

  // Comparación semana a semana
  const weekComparison = useMemo(() => {
    const last7Days = temporalData.slice(-7);
    const previous7Days = temporalData.slice(-14, -7);
    
    const lastTotal = last7Days.reduce((sum, d) => sum + d.total, 0);
    const prevTotal = previous7Days.reduce((sum, d) => sum + d.total, 0);
    
    const change = prevTotal > 0 ? ((lastTotal - prevTotal) / prevTotal) * 100 : 0;
    
    return {
      lastWeek: lastTotal,
      previousWeek: prevTotal,
      change,
      isPositive: change > 0
    };
  }, [temporalData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-slate-400 mb-2">{payload[0].payload.date || payload[0].payload.time}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'dream' ? 'Visiones' : 
               entry.name === 'value' ? 'Valores' :
               entry.name === 'need' ? 'Necesidades' :
               entry.name === 'basta' ? '¡BASTA!' :
               entry.name}: {entry.value}
            </p>
          ))}
          <p className="text-xs text-slate-500 mt-2">
            Total: {payload[0].payload.total}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Controles de Rango Temporal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Rango Temporal</span>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all",
                timeRange === range
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/25"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico Principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-2">Evolución Temporal</h3>
          <p className="text-sm text-slate-400">Contribuciones por tipo en el tiempo</p>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDream" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBasta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey={timeRange === '24h' ? 'time' : 'date'} 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="dream" 
              stackId="1"
              stroke="#3b82f6" 
              fill="url(#colorDream)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stackId="1"
              stroke="#ec4899" 
              fill="url(#colorValue)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="need" 
              stackId="1"
              stroke="#f59e0b" 
              fill="url(#colorNeed)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="basta" 
              stackId="1"
              stroke="#ef4444" 
              fill="url(#colorBasta)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Métricas Adicionales */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Comparación Semanal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className={cn(
              "w-5 h-5",
              weekComparison.isPositive ? "text-green-400" : "text-red-400"
            )} />
            <h4 className="text-sm font-bold text-white">Comparación Semanal</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Esta semana</span>
              <span className="text-lg font-mono font-bold text-white">{weekComparison.lastWeek}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Semana anterior</span>
              <span className="text-lg font-mono font-bold text-slate-400">{weekComparison.previousWeek}</span>
            </div>
            <div className="pt-2 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Cambio</span>
                <span className={cn(
                  "text-lg font-mono font-bold",
                  weekComparison.isPositive ? "text-green-400" : "text-red-400"
                )}>
                  {weekComparison.isPositive ? '+' : ''}{weekComparison.change.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Picos de Actividad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Picos de Actividad</h4>
          </div>
          <div className="space-y-3">
            {activityPeaks.length > 0 ? (
              activityPeaks.map((peak, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs text-slate-400">
                      {new Date(peak.date).toLocaleDateString('es-AR', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white">{peak.total} contribuciones</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No hay picos significativos</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TemporalTrends;
