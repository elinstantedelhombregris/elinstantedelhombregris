/**
 * Aviso de estrella fugaz (spec §3.4) — banner sobre el Cielo, registro
 * nocturno del sistema Papel y Tinta: `PapelCard` plana en vez de vidrio,
 * texto mono, botón `BotonTinta` fantasma compacto. También anuncia el
 * desafío de 24 h cumplido. Expira en silencio: cero FOMO.
 */

import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BotonTinta, PapelCard } from '@/components/papel';
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
      <PapelCard registro="noche" className="flex-row items-center gap-3 p-4">
        <View className="flex-1">
          <Text className="font-space text-sm text-oscuro-texto">{titulo}</Text>
          <Text className="mt-1 font-space text-xs leading-4 text-oscuro-secundario">{detalle}</Text>
        </View>
        <BotonTinta etiqueta="Dale" variante="fantasma" registro="noche" tamano="compacto" onPress={onOk} />
      </PapelCard>
    </Animated.View>
  );
}
