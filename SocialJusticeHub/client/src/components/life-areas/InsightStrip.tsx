import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Target, Flame, ArrowRight } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

interface InsightStripProps {
  priorityArea?: { id: number; name: string; gap: number; currentScore: number } | null;
  streak?: number;
  nextAction?: { title: string; areaId: number } | null;
}

export default function InsightStrip({ priorityArea, streak = 0, nextAction }: InsightStripProps) {
  const cards: React.ReactNode[] = [];

  if (priorityArea && priorityArea.gap > 0) {
    cards.push(
      <Link key="priority" href={`/life-areas/${priorityArea.id}/quiz`}>
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/15 bg-amber-500/5 px-4 py-3 cursor-pointer hover:bg-amber-500/10 transition-colors">
          <Target className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-amber-400/70 uppercase tracking-wider font-medium">Prioridad</p>
            <p className="text-sm text-slate-200 truncate">{priorityArea.name} · {priorityArea.currentScore}/100</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400/50 shrink-0 ml-auto" />
        </div>
      </Link>
    );
  }

  if (streak > 0) {
    cards.push(
      <div key="streak" className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3">
        <Flame className="w-4 h-4 text-orange-400 shrink-0" />
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Racha</p>
          <p className="text-sm text-slate-200">{streak} dias</p>
        </div>
      </div>
    );
  }

  if (nextAction) {
    cards.push(
      <Link key="action" href={`/life-areas/${nextAction.areaId}`}>
        <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3 cursor-pointer hover:bg-white/[0.05] transition-colors">
          <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Siguiente paso</p>
            <p className="text-sm text-slate-200 truncate">{nextAction.title}</p>
          </div>
        </div>
      </Link>
    );
  }

  if (!cards.length) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto px-4"
    >
      {cards.map((card, i) => (
        <motion.div key={i} variants={fadeUp}>
          {card}
        </motion.div>
      ))}
    </motion.div>
  );
}
