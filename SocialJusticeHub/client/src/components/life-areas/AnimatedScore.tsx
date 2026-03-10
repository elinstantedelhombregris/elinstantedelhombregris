import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface AnimatedScoreProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export default function AnimatedScore({ value, duration = 1.2, className = '', suffix = '' }: AnimatedScoreProps) {
  const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    spring.set(safeValue);
    const unsub = spring.on('change', (v) => {
      const rounded = Math.round(v);
      setCurrent(isNaN(rounded) ? 0 : rounded);
    });
    return unsub;
  }, [safeValue, spring]);

  return (
    <motion.span className={className}>
      {current}{suffix}
    </motion.span>
  );
}
