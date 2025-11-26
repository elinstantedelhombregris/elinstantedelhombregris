import { motion } from 'framer-motion';
import { MapPin, TrendingUp, AlertCircle, Heart, Smile } from 'lucide-react';
import { useMapPulseAnalysis } from '@/hooks/useMapPulseAnalysis';
import { cn } from '@/lib/utils';

const SentimentIntensityMap = () => {
  const { sentimentData } = useMapPulseAnalysis();

  const getSentimentColor = (positive: number, negative: number, neutral: number, total: number) => {
    if (total === 0) return 'text-slate-500';
    const positiveRatio = positive / total;
    const negativeRatio = negative / total;
    
    if (positiveRatio > 0.6) return 'text-green-400';
    if (negativeRatio > 0.6) return 'text-red-400';
    if (positiveRatio > negativeRatio) return 'text-blue-400';
    return 'text-amber-400';
  };

  const getUrgencyColor = (urgency: number) => {
    if (urgency > 0.7) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (urgency > 0.4) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  };

  const getEmotionCluster = (positive: number, negative: number, neutral: number, total: number) => {
    if (total === 0) return 'Neutral';
    const positiveRatio = positive / total;
    const negativeRatio = negative / total;
    
    if (positiveRatio > 0.6) return 'Esperanza';
    if (negativeRatio > 0.6) return 'Frustración';
    if (positiveRatio > negativeRatio && positiveRatio > 0.4) return 'Determinación';
    return 'Neutral';
  };

  // Top regiones por urgencia
  const topUrgent = [...sentimentData]
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, 5);

  // Top regiones por sentimiento positivo
  const topPositive = [...sentimentData]
    .sort((a, b) => {
      const aRatio = a.total > 0 ? a.positive / a.total : 0;
      const bRatio = b.total > 0 ? b.positive / b.total : 0;
      return bRatio - aRatio;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Mapa de Calor por Región */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <MapPin className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Mapa de Sentimiento</h3>
            <p className="text-xs text-slate-400">Análisis emocional por región</p>
          </div>
        </div>
        <div className="space-y-3">
          {sentimentData.slice(0, 10).map((item, index) => {
            const sentimentColor = getSentimentColor(
              item.positive,
              item.negative,
              item.neutral,
              item.total
            );
            const emotion = getEmotionCluster(
              item.positive,
              item.negative,
              item.neutral,
              item.total
            );
            const positiveRatio = item.total > 0 ? (item.positive / item.total) * 100 : 0;
            const negativeRatio = item.total > 0 ? (item.negative / item.total) * 100 : 0;
            const neutralRatio = item.total > 0 ? (item.neutral / item.total) * 100 : 0;

            return (
              <motion.div
                key={item.location}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", {
                      'bg-green-500': positiveRatio > 50,
                      'bg-red-500': negativeRatio > 50,
                      'bg-blue-500': neutralRatio > 50 && positiveRatio > negativeRatio,
                      'bg-amber-500': neutralRatio > 50 && negativeRatio > positiveRatio
                    })} />
                    <span className="text-sm font-medium text-white">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-mono font-bold", sentimentColor)}>
                      {emotion}
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.total} contribuciones
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${positiveRatio}%` }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                    className="bg-green-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${negativeRatio}%` }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                    className="bg-red-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${neutralRatio}%` }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                    className="bg-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>+{item.positive} | -{item.negative} | ~{item.neutral}</span>
                  <span className="font-mono">
                    Urgencia: {(item.urgency * 100).toFixed(0)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Top Regiones por Urgencia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Regiones con Mayor Urgencia</h3>
            <p className="text-xs text-slate-400">Intensidad de urgencia detectada</p>
          </div>
        </div>
        <div className="space-y-3">
          {topUrgent.map((item, index) => {
            const urgencyConfig = getUrgencyColor(item.urgency);
            
            return (
              <motion.div
                key={item.location}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border flex items-center justify-between",
                  urgencyConfig
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center text-xs font-mono font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.location}</p>
                    <p className="text-xs text-slate-400">{item.total} contribuciones</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-mono font-bold text-white">
                      {(item.urgency * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-400">Urgencia</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-slate-700 relative overflow-hidden">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      className={cn("absolute inset-0 rounded-full", {
                        'bg-red-500': item.urgency > 0.7,
                        'bg-amber-500': item.urgency > 0.4 && item.urgency <= 0.7,
                        'bg-blue-500': item.urgency <= 0.4
                      })}
                      style={{ clipPath: `inset(0 ${100 - item.urgency * 100}% 0 0)` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Clusters de Emociones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <div className="bg-slate-900/80 backdrop-blur-md border border-green-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Esperanza</h4>
          </div>
          <div className="space-y-2">
            {topPositive.slice(0, 3).map((item, index) => (
              <div key={item.location} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{item.location}</span>
                <span className="text-green-400 font-mono font-bold">
                  {item.total > 0 ? ((item.positive / item.total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Determinación</h4>
          </div>
          <div className="space-y-2">
            {sentimentData
              .filter(item => {
                const positiveRatio = item.total > 0 ? item.positive / item.total : 0;
                const negativeRatio = item.total > 0 ? item.negative / item.total : 0;
                return positiveRatio > 0.4 && positiveRatio > negativeRatio;
              })
              .slice(0, 3)
              .map((item, index) => (
                <div key={item.location} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{item.location}</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {item.total > 0 ? ((item.positive / item.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Frustración</h4>
          </div>
          <div className="space-y-2">
            {sentimentData
              .filter(item => {
                const negativeRatio = item.total > 0 ? item.negative / item.total : 0;
                return negativeRatio > 0.5;
              })
              .slice(0, 3)
              .map((item, index) => (
                <div key={item.location} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{item.location}</span>
                  <span className="text-red-400 font-mono font-bold">
                    {item.total > 0 ? ((item.negative / item.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SentimentIntensityMap;

