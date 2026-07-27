/**
 * Noche Completa — el momento de cierre del día (spec §2). Pantalla
 * completa sobre el Cielo: el zoom del cielo se conserva (index.tsx), el
 * velo oscuro cae, y el sello NOCHE COMPLETA (spec §5) marca el cierre con
 * la frase del día en mono (Papel y Tinta spec §5).
 */

import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BotonTinta, Sello } from '@/components/papel';
import { NOCHE_COMPLETA } from '@/content';
import { indiceVariante } from '@/game/dia';
import { fadeIn } from '@/motion/variants';

export function NocheCompletaOverlay({
  fecha,
  onCerrar,
}: {
  fecha: string;
  onCerrar: () => void;
}) {
  const variante = NOCHE_COMPLETA[indiceVariante(fecha, NOCHE_COMPLETA.length)]!;

  return (
    <Animated.View
      entering={fadeIn}
      className="absolute inset-0 items-center justify-center px-8"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.72)' }}
    >
      <View className="items-center">
        <Sello texto="NOCHE COMPLETA" color="violeta" rotacion={-8} />
        <Text className="mt-8 text-center font-space text-sm leading-6 text-oscuro-secundario">
          {variante}
        </Text>
        <View className="mt-10">
          <BotonTinta etiqueta="Seguir" variante="fantasma" registro="noche" onPress={onCerrar} />
        </View>
      </View>
    </Animated.View>
  );
}
