/**
 * Ascenso de rango (spec §3.3) — overlay de celebración a pantalla
 * completa. Papel y Tinta spec §5: SIN sello (para no inflar el catálogo)
 * — el ascenso usa `ExpedienteNum` («EXP. N° {orden del rango}») + el
 * nombre en `TituloAnton` + su línea de voz propia en Archivo.
 */

import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BotonTinta, ExpedienteNum, TituloAnton } from '@/components/papel';
import { ASCENSO_RANGO } from '@/content';
import { RANGOS } from '@/game/rangos';
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
  const orden = RANGOS.findIndex((r) => r.nombre === rango.nombre) + 1;

  return (
    <Animated.View
      entering={fadeIn}
      className="absolute inset-0 items-center justify-center px-8"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.82)' }}
    >
      <Animated.View entering={bloom} className="items-center">
        <ExpedienteNum numero={orden} registro="noche" />
        <TituloAnton registro="noche" tamano="xl" className="mt-3 text-center">
          {rango.nombre}
        </TituloAnton>
        <Text className="mt-3 font-space text-xs text-oscuro-meta">
          {rango.umbral} brasas ganadas
        </Text>
        <Text className="mt-8 text-center font-archivo text-lg leading-8 text-oscuro-secundario">
          {linea}
        </Text>
        <View className="mt-10">
          <BotonTinta etiqueta="Seguir" variante="fantasma" registro="noche" onPress={onCerrar} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}
