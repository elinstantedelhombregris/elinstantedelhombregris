import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Text, type TextProps } from 'react-native';

import { DISPLAY_GRADIENT_COLORS } from '@/theme/tokens';

/**
 * Único tratamiento de título display: Playfair + gradiente plata
 * (blanco → slate-200 → slate-400), espejo de DISPLAY_GRADIENT del sitio.
 * Usar con moderación — una línea destacada por pantalla.
 */
export function DisplayText({
  children,
  className,
  ...props
}: TextProps & { className?: string }) {
  if (Platform.OS === 'web') {
    // MaskedView no existe en web: el gradiente va por CSS (ver global.css).
    return (
      <Text className={`font-serif display-gradient ${className ?? ''}`} {...props}>
        {children}
      </Text>
    );
  }

  const text = (
    <Text className={`font-serif ${className ?? ''}`} {...props}>
      {children}
    </Text>
  );
  return (
    <MaskedView maskElement={text}>
      <LinearGradient
        colors={DISPLAY_GRADIENT_COLORS}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* El texto invisible reserva el layout exacto bajo la máscara */}
        <Text className={`font-serif opacity-0 ${className ?? ''}`} {...props}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
