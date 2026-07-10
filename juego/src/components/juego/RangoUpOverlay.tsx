/**
 * Ascenso de rango (spec §3.3) — overlay de celebración a pantalla
 * completa: el nombre nuevo en gradiente plata, su línea de voz propia y
 * el bloom. Aparece al volver al Cielo o al cruzar el umbral en plena
 * expedición.
 */

import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AccentButton } from '@/components/ui/AccentButton';
import { DisplayText } from '@/components/ui/DisplayText';
import { ASCENSO_RANGO } from '@/content';
import type { Rango } from '@/game/types';
import { bloom, fadeIn } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

export function RangoUpOverlay({
  rango,
  onCerrar,
}: {
  rango: Rango;
  onCerrar: () => void;
}) {
  useEffect(() => {
    haptic.celebrate();
  }, []);

  const linea = ASCENSO_RANGO[rango.nombre.toLowerCase() as keyof typeof ASCENSO_RANGO];

  return (
    <Animated.View
      entering={fadeIn}
      className="absolute inset-0 items-center justify-center px-8"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.82)' }}
    >
      <Animated.View entering={bloom} className="items-center">
        <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
          Tu luz creció
        </Text>
        <DisplayText className="mt-5 text-5xl">{rango.nombre}</DisplayText>
        <Text className="mt-3 font-mono text-xs text-slate-500">
          {rango.umbral} brasas ganadas
        </Text>
        <Text className="mt-8 text-center font-serif-italic text-2xl leading-9 text-plata">
          {linea}
        </Text>
        <View className="mt-10">
          <AccentButton label="Seguir" onPress={onCerrar} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}
