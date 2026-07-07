import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable97 } from './Pressable97';

/**
 * Cabecera de panel — los paneles son hojas de vidrio sobre el mapa;
 * el chevron siempre te devuelve hacia la constelación.
 */
export function PanelHeader({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-center px-4 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel="Volver"
        className="-ml-2 p-2"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      >
        <Ionicons name="chevron-back" size={26} color="#94a3b8" />
      </Pressable97>
      <Text className="ml-1 flex-1 font-serif text-2xl text-white" numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
