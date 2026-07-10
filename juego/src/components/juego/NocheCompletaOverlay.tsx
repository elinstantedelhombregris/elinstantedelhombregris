/**
 * Noche Completa — el momento de cierre del día (spec §2).
 * Pantalla completa sobre el Cielo: +brasas contadas en mono, una de las
 * tres variantes del texto en Playfair, bloom y háptica de celebración.
 */

import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AccentButton } from '@/components/ui/AccentButton';
import { NOCHE_COMPLETA } from '@/content';
import { GANANCIAS } from '@/game/brasas';
import { indiceVariante } from '@/game/dia';
import { bloom, fadeIn } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

export function NocheCompletaOverlay({
  fecha,
  multiplicador,
  onCerrar,
}: {
  fecha: string;
  multiplicador: 1 | 2;
  onCerrar: () => void;
}) {
  const total = GANANCIAS.nocheCompleta * multiplicador;
  const [cuenta, setCuenta] = useState(0);
  const variante = NOCHE_COMPLETA[indiceVariante(fecha, NOCHE_COMPLETA.length)]!;

  useEffect(() => {
    haptic.celebrate();
  }, []);

  useEffect(() => {
    if (cuenta >= total) return;
    const t = setTimeout(() => setCuenta((c) => c + 1), 260);
    return () => clearTimeout(t);
  }, [cuenta, total]);

  return (
    <Animated.View
      entering={fadeIn}
      className="absolute inset-0 items-center justify-center px-8"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.72)' }}
    >
      <Animated.View entering={bloom} className="items-center">
        <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
          Noche completa
        </Text>
        <Text className="mt-6 font-mono text-5xl text-brasa">+{cuenta}</Text>
        <Text className="mt-1 font-sans text-xs text-slate-500">
          brasas{multiplicador === 2 ? ' · día doble' : ''}
        </Text>
        <Text className="mt-8 text-center font-serif-italic text-2xl leading-9 text-plata">
          {variante}
        </Text>
        <View className="mt-10">
          <AccentButton label="Buenas noches" onPress={onCerrar} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}
