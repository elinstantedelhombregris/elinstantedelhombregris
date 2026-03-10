import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SubcategoryRadar from './SubcategoryRadar';
import AnimatedScore from './AnimatedScore';
import { getScoreVerdict } from '@/lib/life-area-insights';
import { bloom } from '@/lib/motion-variants';

interface SubcatResult {
  name: string;
  current: number;
  desired: number;
}

interface QuizCompletionScreenProps {
  areaName: string;
  areaIcon: LucideIcon;
  areaColor: string;
  subcategoryResults: SubcatResult[];
  isSubmitting: boolean;
  onExploreArea: () => void;
  onEvaluateAnother: () => void;
}

export default function QuizCompletionScreen({
  areaName,
  areaIcon: Icon,
  areaColor,
  subcategoryResults,
  isSubmitting,
  onExploreArea,
  onEvaluateAnother,
}: QuizCompletionScreenProps) {
  // Calculate overall score (average of current values, scaled to 100)
  const rawScore = subcategoryResults.length > 0
    ? Math.round(subcategoryResults.reduce((sum, s) => sum + (s.current ?? 0) * 10, 0) / subcategoryResults.length)
    : 0;
  const overallScore = isNaN(rawScore) || !isFinite(rawScore) ? 0 : rawScore;

  const verdict = getScoreVerdict(overallScore);

  // Scale for radar display
  const radarData = subcategoryResults.map(s => ({
    name: s.name,
    current: s.current * 10,
    desired: s.desired * 10,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="max-w-lg mx-auto"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center">
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: areaColor }}
        />

        <div className="relative z-10">
          {/* Icon bloom */}
          <motion.div
            variants={bloom}
            initial="initial"
            animate="animate"
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/10"
            style={{ backgroundColor: `${areaColor}15` }}
          >
            <Icon className="w-8 h-8" style={{ color: areaColor }} />
          </motion.div>

          {/* Score count-up */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-2"
          >
            <div className="text-5xl font-light text-white mb-1">
              <AnimatedScore value={overallScore} duration={1.5} />
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">puntos de 100</p>
          </motion.div>

          {/* Verdict */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${verdict.bgColor} ${verdict.color} border ${verdict.borderColor}`}>
              {verdict.label}
            </span>
            <p className="text-sm text-slate-400 mt-3 max-w-sm mx-auto">
              {verdict.description}
            </p>
          </motion.div>

          {/* Mini radar */}
          {radarData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 }}
              className="flex justify-center mb-2"
            >
              <SubcategoryRadar
                data={radarData}
                size={240}
                currentColor={areaColor}
                showLabels={true}
              />
            </motion.div>
          )}

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center gap-6 mb-8 text-xs text-slate-500"
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: areaColor }} />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full border border-purple-400 bg-transparent" />
              <span>Deseado</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="space-y-3"
          >
            <Button
              onClick={onExploreArea}
              disabled={isSubmitting}
              size="lg"
              className="w-full px-8 py-5 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  Explorar {areaName}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <button
              onClick={onEvaluateAnother}
              disabled={isSubmitting}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Evaluar otra area
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
