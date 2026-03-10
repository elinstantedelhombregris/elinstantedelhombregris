import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sprout, Compass } from 'lucide-react';

interface MicroCelebrationProps {
  gap: number;
  onComplete: () => void;
}

const celebrations = [
  { maxGap: 2, icon: Sparkles, text: 'Casi en equilibrio', color: 'text-emerald-400' },
  { maxGap: 5, icon: Sprout, text: 'Espacio para crecer', color: 'text-blue-400' },
  { maxGap: Infinity, icon: Compass, text: 'Una meta clara', color: 'text-amber-400' },
];

export default function MicroCelebration({ gap, onComplete }: MicroCelebrationProps) {
  const celebration = celebrations.find(c => gap <= c.maxGap)!;
  const Icon = celebration.icon;
  const firedRef = useRef(false);

  // Use effect-based timer instead of onAnimationComplete to prevent double-fire
  useEffect(() => {
    firedRef.current = false;
    const timer = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onComplete();
      }
    }, 1700); // animation (500ms) + pause (1200ms)
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: [0, 1.2, 1], rotate: [-20, 5, 0] }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Icon className={`w-12 h-12 ${celebration.color}`} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-lg font-medium mt-4 ${celebration.color}`}
      >
        {celebration.text}
      </motion.p>
    </motion.div>
  );
}
