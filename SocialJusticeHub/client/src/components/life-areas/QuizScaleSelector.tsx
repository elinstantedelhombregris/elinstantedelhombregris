import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface ScaleSegment {
  label: string;
  range: [number, number];
  color: string;
  bgColor: string;
}

const SEGMENTS: ScaleSegment[] = [
  { label: 'Muy lejos', range: [0, 2], color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15' },
  { label: 'Luchando', range: [3, 4], color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15' },
  { label: 'En camino', range: [5, 6], color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15' },
  { label: 'Bien', range: [7, 8], color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15' },
  { label: 'Excelente', range: [9, 10], color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15' },
];

interface QuizScaleSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  referenceValue?: number | null;
  referenceColor?: string;
}

export default function QuizScaleSelector({
  value,
  onChange,
  referenceValue = null,
  referenceColor = '#3b82f6',
}: QuizScaleSelectorProps) {
  const selectedSegmentIndex = value !== null
    ? SEGMENTS.findIndex(s => value >= s.range[0] && value <= s.range[1])
    : -1;

  const selectedSegment = selectedSegmentIndex >= 0 ? SEGMENTS[selectedSegmentIndex] : null;

  const handleSegmentClick = (segment: ScaleSegment) => {
    // Select midpoint of range
    const mid = (segment.range[0] + segment.range[1]) / 2;
    // Round to nearest 0.5 for natural feel
    onChange(Math.round(mid));
  };

  const handleFineTune = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  // Find which segment the reference value falls in
  const referenceSegmentIndex = referenceValue !== null
    ? SEGMENTS.findIndex(s => referenceValue >= s.range[0] && referenceValue <= s.range[1])
    : -1;

  return (
    <div className="space-y-4">
      {/* Segment buttons */}
      <div className="grid grid-cols-5 gap-2">
        {SEGMENTS.map((segment, i) => {
          const isSelected = selectedSegmentIndex === i;
          const isReference = referenceSegmentIndex === i;

          return (
            <motion.button
              key={segment.label}
              onClick={() => handleSegmentClick(segment)}
              className={`
                relative flex flex-col items-center justify-center rounded-xl border py-3 px-1 transition-all duration-200
                ${isSelected
                  ? `${segment.bgColor} border-current ${segment.color} ring-1 ring-current/30`
                  : 'border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:border-white/15'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              <span className={`text-[11px] font-medium text-center leading-tight ${isSelected ? segment.color : ''}`}>
                {segment.label}
              </span>
              <span className="text-[9px] text-slate-500 mt-1">
                {segment.range[0]}-{segment.range[1]}
              </span>

              {/* Reference dot */}
              {isReference && referenceValue !== null && !isSelected && (
                <div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black/50"
                  style={{ backgroundColor: referenceColor }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Fine-tune slider (appears after segment selection) */}
      <AnimatePresence>
        {selectedSegment && value !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">Ajuste fino</span>
                <span className={`text-lg font-mono font-semibold ${selectedSegment.color}`}>
                  {value}
                </span>
              </div>
              <Slider
                value={[value]}
                onValueChange={handleFineTune}
                min={selectedSegment.range[0]}
                max={selectedSegment.range[1]}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-600">{selectedSegment.range[0]}</span>
                <span className="text-[10px] text-slate-600">{selectedSegment.range[1]}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
