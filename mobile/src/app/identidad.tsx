import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { fadeUp, staggerDelay } from '@/motion/variants';

/**
 * Elegir cómo presentarse — un acto cívico, no un formulario.
 * Seudónimo o nombre real: tu elección. Las células piden nombre real.
 */
export default function Identidad() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-fondo px-6"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
    >
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        className="self-end p-2"
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={26} color="#94a3b8" />
      </Pressable97>

      <Animated.View entering={fadeUp} className="mt-4">
        <Text className="font-serif text-3xl text-white">¿Cómo querés aparecer?</Text>
        <Text className="mt-3 font-sans text-base leading-6 text-slate-400">
          En el mapa público sos siempre anónimo. Esto es solo para tus círculos.
        </Text>
      </Animated.View>

      <View className="mt-8 gap-4">
        <Animated.View entering={staggerDelay(0)}>
          <GlassCard className="p-5">
            <Text className="font-sans-semibold text-base text-white">Seudónimo</Text>
            <Text className="mt-1 font-sans text-sm leading-5 text-slate-400">
              Participás con un nombre de usuario. Tu palabra vale por tus aportes.
            </Text>
          </GlassCard>
        </Animated.View>
        <Animated.View entering={staggerDelay(1)}>
          <GlassCard className="p-5">
            <Text className="font-sans-semibold text-base text-white">Nombre real</Text>
            <Text className="mt-1 font-sans text-sm leading-5 text-slate-400">
              Es más fácil recibir ayuda cuando te ven la cara. Y es la llave de las
              células de confianza.
            </Text>
          </GlassCard>
        </Animated.View>
      </View>

      <View className="flex-1" />

      <AccentButton label="Crear mi cuenta" onPress={() => router.push('/registro')} />
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel="Ya tengo cuenta"
        className="mt-4 items-center py-2"
        onPress={() => router.push('/entrar')}
      >
        <Text className="font-sans text-sm text-accent-text">Ya tengo cuenta</Text>
      </Pressable97>
    </View>
  );
}
