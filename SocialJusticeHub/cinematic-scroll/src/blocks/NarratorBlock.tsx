import React from 'react';
import { motion } from 'framer-motion';
import { useReveal } from '../engine/useReveal';

interface NarratorBlockProps {
  children: React.ReactNode;
  emphasis?: 'normal' | 'strong';
}

export function NarratorBlock({ children, emphasis = 'normal' }: NarratorBlockProps) {
  const { ref, isVisible } = useReveal({ threshold: 0.2 });

  const className = `cin-narrator ${emphasis === 'strong' ? 'cin-narrator--strong' : ''}`;

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      data-reveal
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
