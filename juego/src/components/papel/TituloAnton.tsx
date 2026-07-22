import { useEffect } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useSkipMotion } from '@/motion/variants';
import { OSCURO_TENUE, OSCURO_TEXTO, TINTA, TINTA_30 } from '@/theme/tokens';

type Tamano = 'xl' | 'lg' | 'md';
type Registro = 'papel' | 'noche';

const TAMANOS: Record<Tamano, number> = { xl: 34, lg: 28, md: 22 };

const INKFILL_DELAY_MS = 40;
const INKFILL_DURACION_MS = 220;

type Props = {
  children: string;
  tamano?: Tamano;
  registro?: Registro;
  /** Activa el inkfill: se entinta letra por letra al montar (spec §6). */
  entintar?: boolean;
  className?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * TituloAnton — Anton, line-height 1.0 (spec §3.2). Reemplaza a
 * `DisplayText` (que queda intacto hasta que las pantallas migren). El
 * caso ("uppercase implícito del trazo") NO se fuerza acá: Anton ya lee
 * como display en cualquier caja; el texto de origen manda (hay títulos
 * en mayúscula fija y otros en frase, p.ej. «No está acá.»).
 */
export function TituloAnton({
  children,
  tamano = 'lg',
  registro = 'papel',
  entintar = false,
  className,
  style,
}: Props) {
  const skip = useSkipMotion();
  const fontSize = TAMANOS[tamano];
  const claseColor = registro === 'noche' ? 'text-oscuro-texto' : 'text-tinta';

  if (!entintar || skip) {
    return (
      <Text
        className={`font-anton ${claseColor} ${className ?? ''}`}
        style={[{ fontSize, lineHeight: fontSize }, style]}
      >
        {children}
      </Text>
    );
  }

  const colorInicial = registro === 'noche' ? OSCURO_TENUE : TINTA_30;
  const colorFinal = registro === 'noche' ? OSCURO_TEXTO : TINTA;

  return (
    <Text className={`font-anton ${className ?? ''}`} style={[{ fontSize, lineHeight: fontSize }, style]}>
      {children.split('').map((letra, i) => (
        // El orden de las letras es estático dentro de un mismo montaje:
        // usar el índice como key es correcto acá.
        <Letra key={i} letra={letra} index={i} colorInicial={colorInicial} colorFinal={colorFinal} />
      ))}
    </Text>
  );
}

function Letra({
  letra,
  index,
  colorInicial,
  colorFinal,
}: {
  letra: string;
  index: number;
  colorInicial: string;
  colorFinal: string;
}) {
  const progreso = useSharedValue(0);

  useEffect(() => {
    progreso.value = withDelay(
      index * INKFILL_DELAY_MS,
      withTiming(1, { duration: INKFILL_DURACION_MS, easing: Easing.out(Easing.ease) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progreso.value, [0, 1], [colorInicial, colorFinal]),
  }));

  return <Animated.Text style={animatedStyle}>{letra}</Animated.Text>;
}
