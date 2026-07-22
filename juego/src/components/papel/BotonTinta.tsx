import { useEffect, useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Pressable97 } from '@/components/ui/Pressable97';
import { useSkipMotion } from '@/motion/variants';

type Variante = 'primaria' | 'tinta' | 'fantasma';
type Registro = 'papel' | 'noche';

type Props = {
  etiqueta: string;
  onPress: () => void;
  variante?: Variante;
  registro?: Registro;
  /** compacto = la píldora nocturna chica (spec §7: pill «La Escucha»). */
  tamano?: 'default' | 'compacto';
  disabled?: boolean;
  /** Reemplaza la etiqueta por «— ▌» con blink-cursor; bloquea el toque. */
  cargando?: boolean;
  accessibilityLabel?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** Fondo/borde y color de texto para cada combinación (spec §3.4). */
function coloresBoton({
  variante,
  registro,
  pressed,
  disabled,
}: {
  variante: Variante;
  registro: Registro;
  pressed: boolean;
  disabled: boolean;
}): { caja: string; texto: string } {
  if (disabled) {
    // Deshabilitado = tinta-30 (texto y borde), NUNCA opacity (spec §3.4).
    return registro === 'noche'
      ? { caja: 'bg-transparent border-oscuro-tenue', texto: 'text-oscuro-tenue' }
      : { caja: 'bg-transparent border-tinta-30', texto: 'text-tinta-30' };
  }

  if (variante === 'primaria') {
    // En noche: primaria igual (spec §3.4).
    return pressed
      ? { caja: 'bg-tinta border-tinta', texto: 'text-papel' }
      : { caja: 'bg-violeta border-violeta', texto: 'text-papel' };
  }

  if (variante === 'tinta') {
    return pressed
      ? { caja: 'bg-violeta border-violeta', texto: 'text-papel' }
      : { caja: 'bg-tinta border-tinta', texto: 'text-papel' };
  }

  // fantasma: pressed invierte (el fondo pasa a ser el color del borde).
  if (registro === 'noche') {
    return pressed
      ? { caja: 'bg-oscuro-texto border-oscuro-texto', texto: 'text-tinta' }
      : { caja: 'bg-transparent border-oscuro-texto', texto: 'text-oscuro-texto' };
  }
  return pressed
    ? { caja: 'bg-tinta border-tinta', texto: 'text-papel' }
    : { caja: 'bg-transparent border-tinta', texto: 'text-tinta' };
}

/** «— ▌» con el cursor titilando — el estado de carga (spec §3.4). */
function CursorCargando({ claseTexto, animar }: { claseTexto: string; animar: boolean }) {
  const opacidad = useSharedValue(1);

  useEffect(() => {
    if (animar) {
      opacidad.value = withRepeat(withTiming(0, { duration: 500, easing: Easing.linear }), -1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animar]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacidad.value }));

  return (
    <Text className={`font-space-bold text-[13px] ${claseTexto}`}>
      {'— '}
      <Animated.Text style={animatedStyle}>▌</Animated.Text>
    </Text>
  );
}

/**
 * BotonTinta — el botón canónico (spec §3.4): rectangular, Space Mono 700
 * 13px uppercase. Tres variantes × dos registros; pressed invierte color
 * (nunca opacity); deshabilitado = tinta-30; cargando reemplaza el texto
 * por «— ▌» sin correr el ancho del botón. Usa `Pressable97` por dentro.
 */
export function BotonTinta({
  etiqueta,
  onPress,
  variante = 'primaria',
  registro = 'papel',
  tamano = 'default',
  disabled = false,
  cargando = false,
  accessibilityLabel,
  className,
  style,
}: Props) {
  const [pressed, setPressed] = useState(false);
  const skip = useSkipMotion();
  const { caja, texto } = coloresBoton({ variante, registro, pressed, disabled });
  const padding = tamano === 'compacto' ? 'px-4 py-2' : 'px-6 py-4';
  const bloqueado = disabled || cargando;

  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? etiqueta}
      accessibilityState={{ disabled: bloqueado, busy: cargando }}
      disabled={bloqueado}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      className={`items-center justify-center border ${padding} ${caja} ${className ?? ''}`}
      style={style}
    >
      <View>
        <Text
          className={`font-space-bold text-[13px] uppercase tracking-[1.04px] ${texto} ${
            cargando ? 'text-transparent' : ''
          }`}
        >
          {etiqueta}
        </Text>
        {cargando && (
          <View className="absolute inset-0 flex-row items-center justify-center">
            <CursorCargando claseTexto={texto} animar={!skip} />
          </View>
        )}
      </View>
    </Pressable97>
  );
}
