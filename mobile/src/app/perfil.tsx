import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { logout } from '@/api/auth';
import { DisplayText } from '@/components/ui/DisplayText';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useAuthStore } from '@/stores/auth';

/**
 * Perfil — quién sos en la constelación. Tu identidad acá; en el mapa
 * público, siempre anónimo.
 */
export default function Perfil() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [saliendo, setSaliendo] = useState(false);

  if (!user) return <Redirect href="/identidad" />;

  const cerrarSesion = async () => {
    setSaliendo(true);
    try {
      await logout();
    } finally {
      setSaliendo(false);
      router.replace('/');
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Perfil" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <Animated.View entering={fadeUp} className="items-center py-6">
          <DisplayText className="text-3xl">{user.name || user.username}</DisplayText>
          <Text className="mt-2 font-sans text-sm text-slate-500">@{user.username}</Text>
          {user.location && (
            <Text className="mt-1 font-sans text-xs text-slate-500">{user.location}</Text>
          )}
        </Animated.View>

        <View className="gap-3">
          <Animated.View entering={staggerDelay(0)}>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Mi aporte"
              onPress={() => router.push('/datos')}
            >
              <GlassCard className="flex-row items-center p-5">
                <Ionicons name="sparkles-outline" size={20} color="#94a3b8" />
                <View className="ml-3 flex-1">
                  <Text className="font-sans-semibold text-base text-white">Mi aporte</Text>
                  <Text className="mt-0.5 font-sans text-xs text-slate-500">
                    Tu constelación personal: señales, entradas, círculos.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </GlassCard>
            </Pressable97>
          </Animated.View>

          <Animated.View entering={staggerDelay(1)}>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Mis círculos"
              onPress={() => router.push('/circulos')}
            >
              <GlassCard className="flex-row items-center p-5">
                <Ionicons name="people-outline" size={20} color="#94a3b8" />
                <View className="ml-3 flex-1">
                  <Text className="font-sans-semibold text-base text-white">Mis círculos</Text>
                  <Text className="mt-0.5 font-sans text-xs text-slate-500">
                    La gente con la que mirás tu realidad.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748b" />
              </GlassCard>
            </Pressable97>
          </Animated.View>

          <Animated.View entering={staggerDelay(2)}>
            <GlassCard className="p-5">
              <Text className="font-sans text-xs uppercase tracking-[3px] text-slate-500">
                Cuenta
              </Text>
              <Text className="mt-2 font-sans text-sm text-slate-300">{user.email}</Text>
              <Text className="mt-1 font-sans text-xs leading-4 text-slate-500">
                En el mapa público sos siempre anónimo. Tu nombre solo aparece donde vos
                decidís: en tus círculos.
              </Text>
            </GlassCard>
          </Animated.View>
        </View>

        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          className="mt-10 items-center py-2"
          disabled={saliendo}
          onPress={cerrarSesion}
        >
          <Text className="font-sans text-sm text-slate-500">
            {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Text>
        </Pressable97>
      </ScrollView>
    </View>
  );
}
