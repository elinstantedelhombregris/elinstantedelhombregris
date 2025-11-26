import { motion } from 'framer-motion';
import { 
  Activity, 
  MapPin, 
  TrendingUp, 
  Users,
  Eye,
  Heart,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useMapPulseAnalysis } from '@/hooks/useMapPulseAnalysis';
import { cn } from '@/lib/utils';

const PulseDashboard = () => {
  const { pulseMetrics } = useMapPulseAnalysis();

  const typeConfig = [
    { 
      type: 'dream', 
      label: 'Visiones', 
      icon: Eye, 
      color: 'text-blue-400', 
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    { 
      type: 'value', 
      label: 'Valores', 
      icon: Heart, 
      color: 'text-pink-400', 
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30'
    },
    { 
      type: 'need', 
      label: 'Necesidades', 
      icon: AlertCircle, 
      color: 'text-amber-400', 
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30'
    },
    { 
      type: 'basta', 
      label: '¡BASTA!', 
      icon: Zap, 
      color: 'text-red-400', 
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas de Velocidad */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl hover:border-slate-600 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Última Hora</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white mb-1">
            {pulseMetrics.velocity.lastHour}
          </div>
          <div className="text-sm text-slate-400">contribuciones</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl hover:border-slate-600 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Últimas 24h</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white mb-1">
            {pulseMetrics.velocity.last24Hours}
          </div>
          <div className="text-sm text-slate-400">contribuciones</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl hover:border-slate-600 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Total Nodos</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white mb-1">
            {pulseMetrics.totalNodes}
          </div>
          <div className="text-sm text-slate-400">activos</div>
        </motion.div>
      </div>

      {/* Distribución Geográfica */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <MapPin className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Distribución Geográfica</h3>
        </div>
        <div className="space-y-4">
          {pulseMetrics.geographicDistribution.map((item, index) => (
            <div key={item.location} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-slate-300 text-sm">{item.location}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  />
                </div>
                <span className="text-white font-mono text-sm w-16 text-right">
                  {item.count}
                </span>
                <span className="text-slate-500 text-xs w-12 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ratios por Tipo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-bold text-white mb-6">Distribución por Tipo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {typeConfig.map((config, index) => {
            const Icon = config.icon;
            const ratio = pulseMetrics.typeRatios[config.type as keyof typeof pulseMetrics.typeRatios];
            
            return (
              <motion.div
                key={config.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border transition-all hover:scale-105",
                  config.bgColor,
                  config.borderColor
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={cn("w-5 h-5", config.color)} />
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    {config.label}
                  </span>
                </div>
                <div className={cn("text-2xl font-mono font-bold mb-1", config.color)}>
                  {ratio.toFixed(1)}%
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ratio}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
                    className={cn("h-full", {
                      'bg-blue-500': config.type === 'dream',
                      'bg-pink-500': config.type === 'value',
                      'bg-amber-500': config.type === 'need',
                      'bg-red-500': config.type === 'basta'
                    })}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default PulseDashboard;

