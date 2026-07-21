import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ACCENT } from '@/theme/tokens';

/** Un halo lento y barato: profundidad sin competir con el dato. */
export function LivingHalo({ color = ACCENT }: { color?: string }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + drift.value * 0.25,
    transform: [{ scale: 0.92 + drift.value * 0.18 }, { translateY: drift.value * -8 }],
  }));
  return (
    <View style={{ pointerEvents: 'none' }} className="absolute inset-0 overflow-hidden rounded-[28px]">
      <Animated.View
        style={style}
        className="absolute -right-16 -top-24 h-64 w-64 overflow-hidden rounded-full"
      >
        <LinearGradient
          colors={[`${color}55`, `${color}08`, 'transparent']}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}
