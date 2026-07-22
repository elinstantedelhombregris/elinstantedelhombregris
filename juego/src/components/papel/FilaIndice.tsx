import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { Pressable97 } from '@/components/ui/Pressable97';

type Props = {
  /** Columna de numeración mono (p.ej. "001") — para Bitácora puede ser una fecha. */
  numero: string;
  children: ReactNode;
  /** Glifo final — → por defecto; +/− para la variante expandible. */
  glifo?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * FilaIndice — fila de lista canónica (spec §3.8): numeración mono
 * tinta-30 · contenido · glifo →; borde inferior bordeSuave; pressed →
 * papel-presionado. Para Corriente, misiones, bitácora, álbum.
 */
export function FilaIndice({
  numero,
  children,
  glifo = '→',
  onPress,
  accessibilityLabel,
  className,
  style,
}: Props) {
  const [pressed, setPressed] = useState(false);

  const fila = (
    <View
      className={`flex-row items-baseline gap-5 border-b border-bordeSuave px-2 py-4 ${
        pressed ? 'bg-papel-presionado' : ''
      } ${className ?? ''}`}
      style={style}
    >
      <Text className="w-14 font-space text-[11px] text-tinta-30">{numero}</Text>
      <View className="flex-1">{children}</View>
      <Text className="w-10 text-right font-space text-tinta">{glifo}</Text>
    </View>
  );

  if (!onPress) return fila;

  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
    >
      {fila}
    </Pressable97>
  );
}
