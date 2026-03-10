import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  text: string;
  items: string[];
  value: string[];
  onChange: (ranked: string[]) => void;
}

export default function RankQuestion({ text, items, value, onChange }: Props) {
  // Use value if provided, otherwise initialize with items order
  const ranked = value.length > 0 ? value : items;

  const moveItem = useCallback((index: number, direction: 'up' | 'down') => {
    const newRanked = [...ranked];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRanked.length) return;
    [newRanked[index], newRanked[targetIndex]] = [newRanked[targetIndex], newRanked[index]];
    onChange(newRanked);
  }, [ranked, onChange]);

  return (
    <div className="space-y-5">
      <p className="text-lg text-slate-100 font-medium leading-relaxed">{text}</p>
      <p className="text-xs text-slate-500 uppercase tracking-wider">
        Usa las flechas para ordenar de mas importante a menos importante
      </p>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {ranked.map((item, idx) => (
            <motion.div
              key={item}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  idx === ranked.length - 1 ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                  'bg-white/10 text-slate-300 border border-white/10'
                }`}>
                  {idx + 1}
                </span>
                <GripVertical className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-sm text-slate-200 flex-1">{item}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === ranked.length - 1}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
