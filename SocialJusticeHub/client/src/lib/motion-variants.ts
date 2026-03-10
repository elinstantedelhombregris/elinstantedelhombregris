import type { Variants, Transition } from 'framer-motion';

// Entry animations
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
};

export const scaleIn: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
};

// Interactive
export const pressable = { whileTap: { scale: 0.97 } };
export const hoverable = { whileHover: { scale: 1.02 } };

// Quiz transitions
export const slideLeft: Variants = {
  initial: { x: 60, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: -60, opacity: 0, transition: { duration: 0.2 } },
};

export const slideRight: Variants = {
  initial: { x: -60, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: 60, opacity: 0, transition: { duration: 0.2 } },
};

// Celebratory
export const bloom: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.12, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const gentlePulse: Variants = {
  animate: {
    scale: [1, 1.04, 1],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Spring configs
export const snappySpring: Transition = { type: 'spring', stiffness: 400, damping: 25 };
export const softSpring: Transition = { type: 'spring', stiffness: 200, damping: 20 };
