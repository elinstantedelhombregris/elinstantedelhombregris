import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Info,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useMapPulseAnalysis } from '@/hooks/useMapPulseAnalysis';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

const InsightsGenerator = () => {
  const { insights, coOccurrences } = useMapPulseAnalysis();

  const getSeverityConfig = (severity: 'info' | 'warning' | 'urgent') => {
    switch (severity) {
      case 'urgent':
        return {
          icon: AlertTriangle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          badgeColor: 'bg-red-900/50 text-red-300 border-red-500/30'
        };
      case 'warning':
        return {
          icon: TrendingUp,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          badgeColor: 'bg-amber-900/50 text-amber-300 border-amber-500/30'
        };
      default:
        return {
          icon: Info,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          badgeColor: 'bg-blue-900/50 text-blue-300 border-blue-500/30'
        };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'dream': return 'Visiones';
      case 'value': return 'Valores';
      case 'need': return 'Necesidades';
      case 'basta': return '¡BASTA!';
      default: return 'General';
    }
  };

  // Frases clave extraídas
  const keyPhrases = insights.filter(i => i.type === 'phrase').slice(0, 3);
  
  // Patrones emergentes
  const patterns = insights.filter(i => i.type === 'pattern' || i.type === 'trend');
  
  // Alertas
  const alerts = insights.filter(i => i.type === 'alert');

  return (
    <div className="space-y-6">
      {/* Frases Clave */}
      {keyPhrases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Frases Clave</h3>
              <p className="text-xs text-slate-400">Palabras más significativas por tipo</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {keyPhrases.map((insight, index) => {
              const config = getSeverityConfig(insight.severity);
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-4 rounded-xl border transition-all hover:scale-105",
                    config.bgColor,
                    config.borderColor
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={cn("text-xs", config.badgeColor)}>
                      {getTypeLabel(insight.category)}
                    </Badge>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <p className="text-sm font-medium text-white mb-2">{insight.title}</p>
                  <p className="text-xs text-slate-400">{insight.description}</p>
                  {insight.data && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-xs text-slate-500">
                        Ejemplos: {insight.data.examples?.length || 0}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Patrones Emergentes */}
      {patterns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Patrones Emergentes</h3>
              <p className="text-xs text-slate-400">Tendencias y cambios detectados</p>
            </div>
          </div>
          <div className="space-y-4">
            {patterns.map((insight, index) => {
              const config = getSeverityConfig(insight.severity);
              const Icon = config.icon;
              const isPositive = insight.data?.growth > 0;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={cn(
                    "p-4 rounded-xl border transition-all hover:border-slate-600",
                    config.bgColor,
                    config.borderColor
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={cn("w-5 h-5 mt-0.5", config.color)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                          {insight.data?.growth && (
                            <div className={cn(
                              "flex items-center gap-1 text-xs font-mono font-bold",
                              isPositive ? "text-green-400" : "text-red-400"
                            )}>
                              {isPositive ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              {Math.abs(insight.data.growth).toFixed(0)}%
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{insight.description}</p>
                        {insight.data && (
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {insight.data.thisWeek !== undefined && (
                              <span>Esta semana: {insight.data.thisWeek}</span>
                            )}
                            {insight.data.lastWeek !== undefined && (
                              <span>Semana anterior: {insight.data.lastWeek}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={cn("text-xs", config.badgeColor)}>
                      {insight.severity.toUpperCase()}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Alertas */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/80 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 shadow-xl shadow-red-900/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Alertas</h3>
              <p className="text-xs text-slate-400">Situaciones que requieren atención</p>
            </div>
          </div>
          <div className="space-y-4">
            {alerts.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1">{insight.title}</h4>
                    <p className="text-sm text-slate-300">{insight.description}</p>
                    {insight.data && (
                      <div className="mt-2 text-xs text-slate-400">
                        Detalles: {JSON.stringify(insight.data)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Co-ocurrencias */}
      {coOccurrences.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Co-ocurrencias</h3>
              <p className="text-xs text-slate-400">Palabras que aparecen juntas frecuentemente</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {coOccurrences.map((item, index) => (
              <motion.div
                key={item.pair}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{item.pair}</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{item.count}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Estado vacío */}
      {insights.length === 0 && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-12 text-center">
          <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No hay insights disponibles aún</p>
          <p className="text-sm text-slate-500 mt-2">Los insights se generan automáticamente cuando hay suficientes datos</p>
        </div>
      )}
    </div>
  );
};

export default InsightsGenerator;

