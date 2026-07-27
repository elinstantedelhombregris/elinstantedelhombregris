/**
 * Gramática de movimiento — puerto 1:1 de client/src/lib/motion-variants.ts
 * (Framer Motion) a Reanimated 4. Mismos nombres, mismos valores.
 * Nada anima fuera de este vocabulario.
 */
import { Platform } from 'react-native';
import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Keyframe,
  useReducedMotion,
  withSpring,
  type WithSpringConfig,
} from 'react-native-reanimated';

// En web (solo preview de desarrollo) las animaciones de entrada de
// Reanimated quedan congeladas a mitad de camino — se desactivan ahí.
const isWeb = Platform.OS === 'web';
const native = <T,>(v: T): T | undefined => (isWeb ? undefined : v);

/**
 * Gate compartido para el kit Papel y Tinta (spec §10): en web y con
 * reduce-motion nativo, las animaciones de firma (inkfill, stampin,
 * semgrow) se saltean y muestran el estado final directo.
 */
export function useSkipMotion(): boolean {
  const reducedMotion = useReducedMotion();
  return isWeb || reducedMotion;
}

// Entradas
export const fadeUp = native(FadeInUp.duration(400).easing(Easing.out(Easing.ease)));
export const fadeIn = native(FadeIn.duration(300));
export const scaleIn = native(FadeInDown.duration(300).easing(Easing.out(Easing.ease)));

/** Stagger: entrada escalonada, 60ms entre hijos (usar con index). */
export const staggerDelay = (index: number, ms = 60) =>
  isWeb ? undefined : FadeInUp.duration(400).easing(Easing.out(Easing.ease)).delay(index * ms);
export const staggerDelaySlow = (index: number) => staggerDelay(index, 100);

// Transiciones de captura (fases del rito de señalar)
const slideLeftKeyframe = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 60 }] },
  100: {
    opacity: 1,
    transform: [{ translateX: 0 }],
    easing: Easing.out(Easing.ease),
  },
}).duration(300);
export const slideLeftIn = native(slideLeftKeyframe);

const slideRightKeyframe = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: -60 }] },
  100: {
    opacity: 1,
    transform: [{ translateX: 0 }],
    easing: Easing.out(Easing.ease),
  },
}).duration(300);
export const slideRightIn = native(slideRightKeyframe);

// Celebración
const bloomKeyframe = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0 }] },
  60: { opacity: 1, transform: [{ scale: 1.12 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.out(Easing.ease) },
}).duration(600);
export const bloom = native(bloomKeyframe);

// Papel y Tinta (spec §6) — el sello que cae: scale 1.6→0.96→1 + fade, 400ms.
const stampinKeyframe = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 1.6 }] },
  60: { opacity: 1, transform: [{ scale: 0.96 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.out(Easing.ease) },
}).duration(400);
export const stampin = native(stampinKeyframe);

/**
 * Papel y Tinta (spec §6) — semgrow: cada trazo de `Palitos` crece desde su
 * ancla, escalonado. Son SVG (react-native-svg), no Views: no hay `entering`
 * de Reanimated ahí, así que estos son solo los números del ritmo; la
 * animación misma vive en `useAnimatedProps` dentro de Palitos.tsx.
 */
export const SEMGROW_STAGGER_MS = 90;
export const SEMGROW_DURATION_MS = 200;

// Springs compartidos
export const snappySpring: WithSpringConfig = { stiffness: 400, damping: 25 };
export const softSpring: WithSpringConfig = { stiffness: 200, damping: 20 };

/** Escala de toque universal (pressable 0.97). */
export const pressScale = (pressed: boolean) =>
  withSpring(pressed ? 0.97 : 1, snappySpring);
