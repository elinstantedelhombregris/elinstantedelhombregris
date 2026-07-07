/**
 * Gramática de movimiento — puerto 1:1 de client/src/lib/motion-variants.ts
 * (Framer Motion) a Reanimated 4. Mismos nombres, mismos valores.
 * Nada anima fuera de este vocabulario.
 */
import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Keyframe,
  withSpring,
  type WithSpringConfig,
} from 'react-native-reanimated';

// Entradas
export const fadeUp = FadeInUp.duration(400).easing(Easing.out(Easing.ease));
export const fadeIn = FadeIn.duration(300);
export const scaleIn = FadeInDown.duration(300).easing(Easing.out(Easing.ease));

/** Stagger: entrada escalonada, 60ms entre hijos (usar con index). */
export const staggerDelay = (index: number, ms = 60) =>
  fadeUp.delay(index * ms);
export const staggerDelaySlow = (index: number) => staggerDelay(index, 100);

// Transiciones de captura (fases del rito de señalar)
export const slideLeftIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 60 }] },
  100: {
    opacity: 1,
    transform: [{ translateX: 0 }],
    easing: Easing.out(Easing.ease),
  },
}).duration(300);

export const slideRightIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: -60 }] },
  100: {
    opacity: 1,
    transform: [{ translateX: 0 }],
    easing: Easing.out(Easing.ease),
  },
}).duration(300);

// Celebración
export const bloom = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0 }] },
  60: { opacity: 1, transform: [{ scale: 1.12 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.out(Easing.ease) },
}).duration(600);

// Springs compartidos
export const snappySpring: WithSpringConfig = { stiffness: 400, damping: 25 };
export const softSpring: WithSpringConfig = { stiffness: 200, damping: 20 };

/** Escala de toque universal (pressable 0.97). */
export const pressScale = (pressed: boolean) =>
  withSpring(pressed ? 0.97 : 1, snappySpring);
