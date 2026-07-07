import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentButton } from '@/components/ui/AccentButton';
import { DisplayText } from '@/components/ui/DisplayText';
import { Pressable97 } from '@/components/ui/Pressable97';
import { fadeIn, fadeUp } from '@/motion/variants';
import { useSettingsStore } from '@/stores/settings';
import { PLATA } from '@/theme/tokens';

/**
 * El manifiesto de bienvenida — 3 pasos.
 * Puntos de luz dispersos convergen mientras avanza el relato:
 * el país que queremos empieza por verlo.
 */

const PASOS = [
  {
    titulo: 'El país que queremos\nempieza por verlo.',
    texto:
      'Cada sueño, cada necesidad, cada ¡basta! es un punto de luz. Solos son gotas. Juntos, un mapa.',
  },
  {
    titulo: 'Nadie va a venir\na hacerlo por nosotros.',
    texto:
      'Los círculos juntan vecinos, causas y células de confianza. Relevan lo que falta y lo hacen visible.',
  },
  {
    titulo: 'Tu voz es anónima.\nTu aporte, imborrable.',
    texto:
      'En el mapa nadie sabe quién sos. En tu círculo, tu palabra vale por lo que hiciste.',
  },
];

const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const N_STARS = 48;

function Star({ index, paso }: { index: number; paso: number }) {
  const { width, height } = useWindowDimensions();
  // Posición dispersa (paso 0) → constelación apretada al centro (paso 2)
  const sx = seeded(index, 1) * width;
  const sy = seeded(index, 2) * height;
  const cx = width / 2 + (seeded(index, 3) - 0.5) * width * 0.55;
  const cy = height * 0.32 + (seeded(index, 4) - 0.5) * height * 0.28;

  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      index * 12,
      withTiming(paso / (PASOS.length - 1), {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [paso, index, t]);

  const style = useAnimatedStyle(() => ({
    left: sx + (cx - sx) * t.value,
    top: sy + (cy - sy) * t.value,
    opacity: 0.25 + 0.6 * t.value,
  }));

  const size = 1.5 + seeded(index, 5) * 2;
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: PLATA,
        },
        style,
      ]}
    />
  );
}

export default function Bienvenida() {
  const insets = useSafeAreaInsets();
  const [paso, setPaso] = useState(0);
  const setOnboarded = useSettingsStore((s) => s.setOnboarded);
  const ultimo = paso === PASOS.length - 1;

  const terminar = () => {
    setOnboarded();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-fondo">
      <Animated.View entering={fadeIn} className="absolute inset-0">
        {Array.from({ length: N_STARS }, (_, i) => (
          <Star key={i} index={i} paso={paso} />
        ))}
      </Animated.View>

      <View
        className="flex-1 justify-end px-8"
        style={{ paddingBottom: insets.bottom + 32 }}
      >
        <Animated.View key={paso} entering={fadeUp}>
          <DisplayText className="text-4xl leading-[46px]">
            {PASOS[paso]!.titulo}
          </DisplayText>
          <Text className="mt-5 font-sans text-base leading-6 text-slate-400">
            {PASOS[paso]!.texto}
          </Text>
        </Animated.View>

        {/* Progreso */}
        <View className="mt-8 flex-row gap-2">
          {PASOS.map((_, i) => (
            <View
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= paso ? 'bg-accent' : 'bg-white/10'}`}
            />
          ))}
        </View>

        <View className="mt-8">
          <AccentButton
            label={ultimo ? 'Ver el mapa' : 'Seguir'}
            onPress={() => (ultimo ? terminar() : setPaso(paso + 1))}
          />
          {!ultimo && (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Saltear"
              className="mt-4 items-center py-2"
              onPress={terminar}
            >
              <Text className="font-sans text-sm text-slate-500">Saltear</Text>
            </Pressable97>
          )}
        </View>
      </View>
    </View>
  );
}
