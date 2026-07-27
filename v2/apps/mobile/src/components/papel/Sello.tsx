import { useEffect } from 'react';
import { Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { stampin, useSkipMotion } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

type ColorSello = 'sello' | 'verde' | 'violeta';

const CLASES_COLOR: Record<ColorSello, { borde: string; texto: string }> = {
  sello: { borde: 'border-sello', texto: 'text-sello' },
  verde: { borde: 'border-verde', texto: 'text-verde' },
  violeta: { borde: 'border-violeta', texto: 'text-violeta' },
};

type Props = {
  texto: string;
  color?: ColorSello;
  /** Grados de rotación fija (spec §5: −8°…+6°, uno por sello del catálogo). */
  rotacion?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Sello — el toast del juego: cae una vez con `stampin` (scale 1.6→0.96→1 +
 * fade, 400ms) y un `haptic.celebrate()` al montar (spec §3.6, §5). Nunca
 * un toast repetido: quien lo usa lo monta/desmonta condicionalmente.
 * Catálogo de textos/colores/rotación cerrado — spec §5, no se elige acá.
 */
export function Sello({ texto, color = 'sello', rotacion = -4, className, style }: Props) {
  const skip = useSkipMotion();
  const { borde, texto: claseTexto } = CLASES_COLOR[color];

  useEffect(() => {
    // Solo dispara al montar — es la caída del sello, no algo que se repite
    // con cambios de prop.
    haptic.celebrate();
  }, []);

  return (
    <Animated.View
      entering={skip ? undefined : stampin}
      className={`self-start border-[3px] px-4 py-2.5 ${borde} ${className ?? ''}`}
      style={[{ transform: [{ rotate: `${rotacion}deg` }] }, style]}
    >
      <Text className={`font-space-bold text-[13px] uppercase tracking-[2.34px] ${claseTexto}`}>
        {texto}
      </Text>
    </Animated.View>
  );
}
