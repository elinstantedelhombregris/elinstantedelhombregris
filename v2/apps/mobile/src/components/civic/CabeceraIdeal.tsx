import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Kicker, TituloAnton } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';

/**
 * La cabecera fija de las pantallas de «Argentina ideal»: la flecha de volver de 44pt que usa el
 * resto de la app (`publicar.tsx`), con la salida al territorio si no hay a dónde volver (un enlace
 * directo), más el kicker y el título.
 */
export function CabeceraIdeal({ kicker, titulo }: { kicker: string; titulo: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const volver = () => (router.canGoBack() ? router.back() : router.replace('/territorio'));
  return (
    <View className="px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={volver}
        className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
      >
        <Text className="font-space text-tinta text-2xl">←</Text>
      </Pressable97>
      <View className="mt-2">
        <Kicker>{kicker}</Kicker>
        <TituloAnton tamano="lg" className="mt-1">
          {titulo}
        </TituloAnton>
      </View>
    </View>
  );
}
