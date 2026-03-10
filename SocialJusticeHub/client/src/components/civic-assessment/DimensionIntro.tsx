import { motion } from 'framer-motion';
import type { CivicDimension } from '@shared/civic-assessment-questions';

interface Props {
  dimension: CivicDimension;
  sectionIndex: number;
  totalSections: number;
}

export default function DimensionIntro({ dimension, sectionIndex, totalSections }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-8"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400 uppercase tracking-widest mb-6">
        Seccion {sectionIndex + 1} de {totalSections}
      </div>
      <h2 className="text-3xl font-serif font-bold text-white mb-4">
        {dimension.name}
      </h2>
      <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
        {dimension.description}
      </p>
      <div className="mt-6 w-16 h-1 rounded-full mx-auto" style={{ backgroundColor: dimension.color }} />
    </motion.div>
  );
}
