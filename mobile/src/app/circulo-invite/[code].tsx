import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiRequestError } from '@/api/client';
import { canjearInvitacion } from '@/api/circulos';
import { AccentButton } from '@/components/ui/AccentButton';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { bloom, fadeUp } from '@/motion/variants';
import { useAuthStore } from '@/stores/auth';
import { haptic } from '@/theme/haptics';

/**
 * Deep link basta://circulo-invite/:code — canjea la invitación solo
 * y te lleva derecho al círculo. Si no hay sesión, primero la puerta.
 */
export default function CirculoInviteDeepLink() {
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code: string }>();
  const queryClient = useQueryClient();
  const bootstrapping = useAuthStore((s) => s.bootstrapping);
  const user = useAuthStore((s) => s.user);

  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<{ id: number; name: string } | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (bootstrapping || startedRef.current || !code) return;
    if (!user) {
      // Sin sesión no se puede canjear: la puerta de entrada primero.
      router.replace('/identidad');
      return;
    }
    startedRef.current = true;
    canjearInvitacion(code)
      .then(async (result) => {
        haptic.celebrate();
        await queryClient.invalidateQueries({ queryKey: ['circulos'] });
        setExito({ id: result.circulo.id, name: result.circulo.name });
      })
      .catch((e) => {
        setError(
          e instanceof ApiRequestError
            ? e.message
            : 'No pudimos canjear la invitación. Probá de nuevo.',
        );
      });
  }, [bootstrapping, user, code, queryClient]);

  return (
    <View className="flex-1 bg-fondo" style={{ paddingBottom: insets.bottom + 16 }}>
      <PanelHeader title="Invitación" />
      <View className="flex-1 items-center justify-center px-6">
        {!exito && !error && (
          <Animated.View entering={fadeUp} className="items-center">
            <ActivityIndicator color="#94a3b8" />
            <Text className="mt-4 font-sans text-sm text-slate-400">
              Canjeando tu invitación…
            </Text>
          </Animated.View>
        )}

        {exito && (
          <>
            <Animated.View
              entering={bloom}
              className="items-center justify-center rounded-full bg-white/5 border border-white/20"
              style={{ width: 96, height: 96 }}
            >
              <Ionicons name="checkmark" size={40} color="#F5F7FA" />
            </Animated.View>
            <Text className="mt-8 text-center font-serif text-2xl text-white">
              Ya sos parte de {exito.name}.
            </Text>
          </>
        )}

        {error && (
          <Animated.View entering={fadeUp} className="items-center">
            <Ionicons name="alert-circle-outline" size={40} color="#94a3b8" />
            <Text className="mt-4 text-center font-sans text-sm leading-5 text-slate-400">
              {error}
            </Text>
          </Animated.View>
        )}
      </View>
      <View className="px-6">
        {exito && (
          <AccentButton label="Ir al círculo" onPress={() => router.replace(`/circulos/${exito.id}`)} />
        )}
        {error && <AccentButton label="Volver al mapa" onPress={() => router.replace('/')} />}
      </View>
    </View>
  );
}
