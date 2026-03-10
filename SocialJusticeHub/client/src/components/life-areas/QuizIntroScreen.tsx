import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, RotateCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { bloom, fadeUp } from '@/lib/motion-variants';

type Mood = 'conforme' | 'inquieto' | 'cambiar';

const MOOD_OPTIONS: { value: Mood; label: string; response: string; color: string; bgClass: string }[] = [
  {
    value: 'conforme',
    label: 'Conforme',
    response: 'Genial. Veamos como sostener eso.',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15 text-emerald-400',
  },
  {
    value: 'inquieto',
    label: 'Inquieto/a',
    response: 'Esa inquietud es el primer paso del cambio.',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15 text-amber-400',
  },
  {
    value: 'cambiar',
    label: 'Necesito cambiar',
    response: 'Reconocerlo es valiente. Vamos a ver donde estas.',
    color: '#ef4444',
    bgClass: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15 text-red-400',
  },
];

interface QuizIntroScreenProps {
  areaName: string;
  areaDescription?: string;
  areaIcon: LucideIcon;
  areaColor: string;
  subcategories: string[];
  previousScore?: number | null;
  isRetake: boolean;
  onStart: (mood: Mood) => void;
}

export default function QuizIntroScreen({
  areaName,
  areaDescription,
  areaIcon: Icon,
  areaColor,
  subcategories,
  previousScore,
  isRetake,
  onStart,
}: QuizIntroScreenProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const moodOption = MOOD_OPTIONS.find(m => m.value === selectedMood);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8">
        {/* Gradient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: areaColor }}
        />

        <div className="relative z-10 text-center">
          {/* Icon */}
          <motion.div
            variants={bloom}
            initial="initial"
            animate="animate"
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/10"
            style={{ backgroundColor: `${areaColor}15` }}
          >
            <Icon className="w-10 h-10" style={{ color: areaColor }} />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">{areaName}</h2>
          {areaDescription && (
            <p className="text-slate-400 text-sm mb-8">{areaDescription}</p>
          )}

          {/* Mood prompt */}
          <p className="text-slate-300 mb-5">
            Pensa en <span className="text-white font-medium">{areaName}</span> en tu vida hoy.
            <br />
            <span className="text-slate-400">¿Como te sentis al respecto?</span>
          </p>

          {/* Mood anchors */}
          <div className="flex gap-2 justify-center mb-6">
            {MOOD_OPTIONS.map((mood) => (
              <motion.button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`
                  px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
                  ${selectedMood === mood.value
                    ? `${mood.bgClass} ring-1 ring-current/30`
                    : 'border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                {mood.label}
              </motion.button>
            ))}
          </div>

          {/* Mood response */}
          <AnimatePresence mode="wait">
            {moodOption && (
              <motion.p
                key={selectedMood}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm italic mb-6"
                style={{ color: moodOption.color }}
              >
                "{moodOption.response}"
              </motion.p>
            )}
          </AnimatePresence>

          {/* Subcategories (subtle) */}
          <p className="text-xs text-slate-500 mb-2">
            5 dimensiones · 3-5 minutos
          </p>
          <p className="text-xs text-slate-600 mb-6">
            {subcategories.join(' · ')}
          </p>

          {/* Previous score */}
          {isRetake && previousScore !== null && previousScore !== undefined && (
            <div className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10 inline-flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 text-sm">
                Tu score anterior: <span className="font-bold text-white">{previousScore}/100</span>
              </span>
            </div>
          )}

          {/* Start button */}
          <AnimatePresence>
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <Button
                  onClick={() => onStart(selectedMood)}
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20"
                >
                  Estoy listo/a
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export type { Mood };
