/**
 * Pantalla provisoria "Pronto." — para que la navegación jamás se rompa
 * mientras G4/G5 construyen los paneles de verdad.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { SectionBadge } from '@/components/ui/SectionBadge';

export function PantallaPronto({ titulo, detalle }: { titulo: string; detalle: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-fondo px-7"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-row items-center justify-between">
        <SectionBadge>{titulo}</SectionBadge>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          className="rounded-full border border-white/10 bg-white/5 p-2"
        >
          <Ionicons name="chevron-down" size={18} color="#94a3b8" />
        </Pressable97>
      </View>
      <View className="flex-1 items-center justify-center">
        <GlassCard className="w-full p-6">
          <Text className="font-serif text-2xl text-plata">Pronto.</Text>
          <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">{detalle}</Text>
        </GlassCard>
      </View>
    </View>
  );
}
