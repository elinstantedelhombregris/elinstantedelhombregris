import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, Heart, AlertCircle, Zap, BarChart3 } from 'lucide-react';
import { useMapPulseAnalysis } from '@/hooks/useMapPulseAnalysis';
import { cn } from '@/lib/utils';

const ComparativeWordAnalysis = () => {
  const { wordAnalysis } = useMapPulseAnalysis();
  const [activeView, setActiveView] = useState<'top' | 'unique' | 'intersection' | 'heatmap'>('top');

  const typeConfig = [
    { 
      type: 'dream', 
      label: 'Visiones', 
      icon: Eye, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      barColor: 'bg-blue-500'
    },
    { 
      type: 'value', 
      label: 'Valores', 
      icon: Heart, 
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      barColor: 'bg-pink-500'
    },
    { 
      type: 'need', 
      label: 'Necesidades', 
      icon: AlertCircle, 
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      barColor: 'bg-amber-500'
    },
    { 
      type: 'basta', 
      label: '¡BASTA!', 
      icon: Zap, 
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      barColor: 'bg-red-500'
    }
  ];

  // Palabras únicas por categoría
  const uniqueWords = useMemo(() => {
    const allWords = new Set<string>();
    Object.values(wordAnalysis).forEach(words => {
      words.forEach(w => allWords.add(w.word));
    });

    const unique: Record<string, string[]> = {};
    typeConfig.forEach(config => {
      const words = wordAnalysis[config.type as keyof typeof wordAnalysis] || [];
      unique[config.type] = words
        .filter(w => {
          // Verificar que esta palabra NO aparece en otros tipos
          return Object.entries(wordAnalysis).every(([type, typeWords]) => {
            if (type === config.type) return true;
            return !typeWords.some(tw => tw.word === w.word);
          });
        })
        .map(w => w.word)
        .slice(0, 10);
    });
    return unique;
  }, [wordAnalysis]);

  // Intersecciones (palabras comunes)
  const intersections = useMemo(() => {
    const wordSets: Record<string, Set<string>> = {};
    typeConfig.forEach(config => {
      const words = wordAnalysis[config.type as keyof typeof wordAnalysis] || [];
      wordSets[config.type] = new Set(words.slice(0, 20).map(w => w.word));
    });

    const common: string[] = [];
    const allTypes = typeConfig.map(c => c.type);
    
    // Encontrar palabras que aparecen en al menos 2 tipos
    const wordCounts: Record<string, number> = {};
    allTypes.forEach(type => {
      wordSets[type].forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    Object.entries(wordCounts)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 15)
      .forEach(([word]) => common.push(word));

    return common;
  }, [wordAnalysis]);

  // Heatmap data
  const heatmapData = useMemo(() => {
    const topWords = new Set<string>();
    typeConfig.forEach(config => {
      const words = wordAnalysis[config.type as keyof typeof wordAnalysis] || [];
      words.slice(0, 10).forEach(w => topWords.add(w.word));
    });

    return Array.from(topWords).map(word => {
      const row: Record<string, string | number> = { word };
      typeConfig.forEach(config => {
        const words = wordAnalysis[config.type as keyof typeof wordAnalysis] || [];
        const found = words.find(w => w.word === word);
        row[config.type] = found ? found.count : 0;
      });
      return row;
    }).sort((a, b) => {
      const totalA = typeConfig.reduce((sum, c) => sum + Number(a[c.type] || 0), 0);
      const totalB = typeConfig.reduce((sum, c) => sum + Number(b[c.type] || 0), 0);
      return totalB - totalA;
    }).slice(0, 20);
  }, [wordAnalysis]);

  const maxCount = useMemo(() => {
    let max = 0;
    Object.values(wordAnalysis).forEach(words => {
      words.forEach(w => {
        if (w.count > max) max = w.count;
      });
    });
    return max;
  }, [wordAnalysis]);

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Vista de Análisis</span>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'top', label: 'Top Palabras' },
            { id: 'unique', label: 'Únicas' },
            { id: 'intersection', label: 'Intersecciones' },
            { id: 'heatmap', label: 'Heatmap' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all",
                activeView === view.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/25"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
              )}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Top Palabras por Tipo */}
        {activeView === 'top' && (
          <motion.div
            key="top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {typeConfig.map((config) => {
              const Icon = config.icon;
              const words = wordAnalysis[config.type as keyof typeof wordAnalysis] || [];
              const topWords = words.slice(0, 10);

              return (
                <div
                  key={config.type}
                  className={cn(
                    "bg-slate-900/80 backdrop-blur-md border rounded-2xl p-6 shadow-xl",
                    config.borderColor
                  )}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("p-2 rounded-lg", config.bgColor)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{config.label}</h3>
                      <p className="text-xs text-slate-400">Top 10 palabras</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {topWords.map((word, index) => (
                      <div key={word.word} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500 w-6">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{word.word}</span>
                            <span className="text-xs font-mono text-slate-400">{word.count}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(word.count / maxCount) * 100}%` }}
                              transition={{ delay: index * 0.05, duration: 0.5 }}
                              className={cn("h-full", config.barColor)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Palabras Únicas */}
        {activeView === 'unique' && (
          <motion.div
            key="unique"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {typeConfig.map((config) => {
              const Icon = config.icon;
              const unique = uniqueWords[config.type] || [];

              return (
                <div
                  key={config.type}
                  className={cn(
                    "bg-slate-900/80 backdrop-blur-md border rounded-2xl p-6 shadow-xl",
                    config.borderColor
                  )}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("p-2 rounded-lg", config.bgColor)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Palabras Únicas</h3>
                      <p className="text-xs text-slate-400">{config.label}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {unique.length > 0 ? (
                      unique.map((word) => (
                        <div
                          key={word}
                          className="px-3 py-2 bg-slate-800/50 rounded-lg text-sm text-white"
                        >
                          {word}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No hay palabras únicas</p>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Intersecciones */}
        {activeView === 'intersection' && (
          <motion.div
            key="intersection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2">Palabras Comunes</h3>
              <p className="text-sm text-slate-400">Palabras que aparecen en múltiples tipos</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {intersections.map((word) => {
                const counts: Record<string, number> = {};
                typeConfig.forEach(config => {
                  const words = wordAnalysis[config.type as keyof typeof wordAnalysis] || [];
                  const found = words.find(w => w.word === word);
                  counts[config.type] = found ? found.count : 0;
                });

                return (
                  <div
                    key={word}
                    className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="text-sm font-medium text-white mb-3">{word}</div>
                    <div className="space-y-1">
                      {typeConfig.map(config => (
                        <div key={config.type} className="flex items-center justify-between text-xs">
                          <span className={cn(config.color)}>{config.label}</span>
                          <span className="text-slate-400 font-mono">{counts[config.type] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Heatmap */}
        {activeView === 'heatmap' && (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl overflow-x-auto"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2">Tabla de Frecuencia</h3>
              <p className="text-sm text-slate-400">Frecuencia de palabras clave por tipo</p>
            </div>
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-mono uppercase tracking-widest text-slate-400">
                    Palabra
                  </th>
                  {typeConfig.map(config => (
                    <th
                      key={config.type}
                      className={cn("text-center py-3 px-4 text-xs font-mono uppercase tracking-widest", config.color)}
                    >
                      {config.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, index) => {
                  const maxInRow = Math.max(...typeConfig.map(c => Number(row[c.type] || 0)));
                  return (
                    <tr
                      key={row.word}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-white">{row.word}</td>
                      {typeConfig.map(config => {
                        const value = Number(row[config.type] || 0);
                        const intensity = maxInRow > 0 ? value / maxInRow : 0;
                        return (
                          <td key={config.type} className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center">
                              <div
                                className={cn(
                                  "w-12 h-8 rounded flex items-center justify-center text-xs font-mono font-bold transition-all",
                                  intensity > 0.7 ? config.bgColor : 'bg-slate-800/30',
                                  intensity > 0.7 ? config.color : 'text-slate-500'
                                )}
                                style={{
                                  opacity: intensity > 0 ? Math.max(0.3, intensity) : 0.1
                                }}
                              >
                                {value}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComparativeWordAnalysis;
