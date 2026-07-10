/**
 * Aviso de estrella fugaz (spec §3.4) — banner de vidrio sobre el Cielo.
 * También anuncia el desafío de 24 h cumplido. Expira en silencio: cero FOMO.
 */

import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { fadeUp } from '@/motion/variants';

export function FugazBanner({
  titulo,
  detalle,
  onOk,
}: {
  titulo: string;
  detalle: string;
  onOk: () => void;
}) {
  return (
    <Animated.View entering={fadeUp} className="px-5">
      <GlassCard className="flex-row items-center gap-3 p-4">
        <Ionicons name="sparkles" size={20} color="#F5F7FA" />
        <View className="flex-1">
          <Text className="font-sans-semibold text-sm text-plata">{titulo}</Text>
          <Text className="mt-1 font-sans text-xs leading-4 text-slate-400">{detalle}</Text>
        </View>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Entendido"
          onPress={onOk}
          className="rounded-full bg-white/10 px-4 py-2"
        >
          <Text className="font-sans-medium text-xs text-plata">Dale</Text>
        </Pressable97>
      </GlassCard>
    </Animated.View>
  );
}
