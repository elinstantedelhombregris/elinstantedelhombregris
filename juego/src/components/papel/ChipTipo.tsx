import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Pressable97 } from '@/components/ui/Pressable97';
import { TINTA } from '@/theme/tokens';

type Props = {
  etiqueta: string;
  /** Sin tocar = chip inactivo (borde tinta, transparente). */
  activo?: boolean;
  /**
   * Color semántico del chip activo (una señal, spec §2). Sin dar color,
   * activo cae en tinta pura — el caso de los chips de oficio, que
   * perdieron el color (spec §2: "Oficios pierden el color").
   */
  color?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * ChipTipo — cuadrado, borde 1px tinta, mono 11px 700 uppercase (spec §3.5).
 * Activo = fondo del color semántico (o tinta para oficios) + texto papel.
 */
export function ChipTipo({
  etiqueta,
  activo = false,
  color,
  onPress,
  accessibilityLabel,
  className,
  style,
}: Props) {
  const contenido = (
    <View
      className={`items-center justify-center border border-tinta px-[14px] py-[9px] ${className ?? ''}`}
      style={[activo ? { backgroundColor: color ?? TINTA } : undefined, style]}
    >
      <Text
        className={`font-space-bold text-[11px] uppercase tracking-[0.88px] ${
          activo ? 'text-papel' : 'text-tinta'
        }`}
      >
        {etiqueta}
      </Text>
    </View>
  );

  if (!onPress) return contenido;

  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? etiqueta}
      accessibilityState={{ selected: activo }}
      onPress={onPress}
    >
      {contenido}
    </Pressable97>
  );
}
