import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import type { CivicArchetype, CivicDimension, DimensionKey } from '@shared/civic-assessment-questions';

interface Props {
  archetype: CivicArchetype;
  dimensionScores: Record<string, number>;
  dimensions: CivicDimension[];
  topStrengths: string[];
  growthAreas: string[];
  recommendedActions: string[];
}

export default function ArchetypeReveal({
  archetype,
  dimensionScores,
  dimensions,
  topStrengths,
  growthAreas,
  recommendedActions,
}: Props) {
  const getDimensionName = (key: string) =>
    dimensions.find(d => d.key === key)?.name || key;

  const getDimensionColor = (key: string) =>
    dimensions.find(d => d.key === key)?.color || '#6366F1';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-10 py-4"
    >
      {/* Archetype Hero */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">{archetype.emoji}</div>
        <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 uppercase tracking-widest mb-4">
          Tu arquetipo civico
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
          {archetype.name}
        </h1>
        <p className="text-lg text-blue-400 font-medium mb-6">{archetype.subtitle}</p>
        <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {archetype.description}
        </p>
      </motion.div>

      {/* Dimension Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Tus dimensiones civicas
        </h3>
        <div className="space-y-3">
          {dimensions.map((dim) => {
            const score = dimensionScores[dim.key] ?? 0;
            const isStrength = topStrengths.includes(dim.key);
            const isGrowth = growthAreas.includes(dim.key);
            return (
              <div key={dim.key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">{dim.name}</span>
                    {isStrength && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                        Fortaleza
                      </span>
                    )}
                    {isGrowth && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
                        Crecimiento
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-200">{Math.round(score)}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: dim.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recommended Actions */}
      {recommendedActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Tus proximos pasos
          </h3>
          <div className="space-y-2">
            {recommendedActions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-300">{action}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
      >
        <Link href="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            Ir a Mi Panel
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/metas">
          <Button variant="outline" className="border-white/20 text-slate-300 hover:bg-white/10 font-bold px-8 h-12 rounded-xl">
            Definir una Meta
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
