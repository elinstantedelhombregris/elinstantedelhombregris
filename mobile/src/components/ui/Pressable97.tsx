import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { pressScale } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
// Los componentes creados con createAnimatedComponent no vienen registrados
// en NativeWind: sin esto, className se ignora silenciosamente.
cssInterop(AnimatedPressable, { className: 'style' });

type Props = Omit<PressableProps, 'style'> & {
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** No emitir el tick háptico (para toques que ya tienen su propio gesto). */
  silent?: boolean;
};

/**
 * Toque universal de la app: escala 0.97 con spring + tick háptico.
 * Todo lo tocable pasa por acá — coherencia antes que variedad.
 */
export function Pressable97({ onPressIn, onPressOut, onPress, silent, style, ...props }: Props) {
  const [pressed, setPressed] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale(pressed) }],
  }));

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (!silent) haptic.tick();
        onPress?.(e);
      }}
      {...props}
    />
  );
}
