import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Line } from 'react-native-svg';

import { SEMGROW_DURATION_MS, SEMGROW_STAGGER_MS, useSkipMotion } from '@/motion/variants';
import { OSCURO_TEXTO, TINTA, TINTA_30 } from '@/theme/tokens';
import { agruparPalitos } from './palitos-logica';

// Geometría de un grupo: hasta 4 verticales a este paso, + 1 diagonal
// cruzada cuando el grupo cierra en 5 (spec §3.7).
const ALTO = 16;
const PASO = 6;
const HUECO_GRUPO = 10;
const GROSOR = 2;
const MARGEN = 3;
// Más allá de este índice de trazo, todo entra junto — el stagger se topea
// para que un total grande no arrastre una animación eterna (spec: "capped
// stagger for large counts").
const TOPE_STAGGER = 10;

const AnimatedLine = Animated.createAnimatedComponent(Line);

type Segmento = { x1: number; y1: number; x2: number; y2: number; color: string };

/** Los trazos (verticales + diagonal opcional) de UN grupo, arrancando en x=xInicial. */
function trazosDeGrupo(
  tamano: number,
  xInicial: number,
  color: string,
): { trazos: Segmento[]; ancho: number } {
  const verticales = Math.min(tamano, 4);
  const trazos: Segmento[] = [];

  for (let i = 0; i < verticales; i++) {
    const x = xInicial + i * PASO;
    trazos.push({ x1: x, y1: ALTO, x2: x, y2: 0, color });
  }

  if (tamano === 5) {
    // El quinto trazo cruza los 4 verticales en diagonal.
    trazos.push({
      x1: xInicial - 2,
      y1: ALTO * 0.85,
      x2: xInicial + 3 * PASO + 2,
      y2: ALTO * 0.15,
      color,
    });
  }

  return { trazos, ancho: (verticales - 1) * PASO };
}

type Props = {
  /** Cuánto va lleno. */
  total: number;
  /** La meta — si se da, el resto hasta acá se dibuja hueco en tinta-30. */
  de?: number;
  /** Color de los trazos llenos. Sin dar uno: tinta en papel, papel en noche. */
  color?: string;
  registro?: 'papel' | 'noche';
  style?: StyleProp<ViewStyle>;
};

/**
 * Palitos — tally marks para conteos chicos (spec §3.7): ES el data-viz
 * del juego (brasas, racha, presupuesto de pulsos, capturas de expedición,
 * obras por oficio). Nunca barras fuera de documentos.
 */
export function Palitos({ total, de, color, registro = 'papel', style }: Props) {
  const skip = useSkipMotion();
  const { llenos, huecos } = agruparPalitos(total, de);

  const colorLlenos = color ?? (registro === 'noche' ? OSCURO_TEXTO : TINTA);

  let cursor = 0;
  const segmentos: Segmento[] = [];

  for (const tamano of llenos) {
    const { trazos, ancho } = trazosDeGrupo(tamano, cursor, colorLlenos);
    segmentos.push(...trazos);
    cursor += ancho + HUECO_GRUPO;
  }
  for (const tamano of huecos) {
    // Los huecos van SIEMPRE en tinta-30, sin importar el registro (spec).
    const { trazos, ancho } = trazosDeGrupo(tamano, cursor, TINTA_30);
    segmentos.push(...trazos);
    cursor += ancho + HUECO_GRUPO;
  }

  if (segmentos.length === 0) return null;

  const anchoTotal = Math.max(0, cursor - HUECO_GRUPO);
  const etiqueta = de !== undefined ? `${total} de ${de}` : `${total}`;

  return (
    <View style={style} accessible accessibilityLabel={etiqueta}>
      <Svg width={anchoTotal + MARGEN * 2} height={ALTO + MARGEN * 2}>
        <G transform={`translate(${MARGEN}, ${MARGEN})`}>
          {segmentos.map((segmento, i) => (
            // El orden de los trazos es estático por render: el índice
            // como key es correcto acá.
            <Trazo
              key={i}
              {...segmento}
              delayMs={Math.min(i, TOPE_STAGGER) * SEMGROW_STAGGER_MS}
              animar={!skip}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}

/**
 * Un trazo individual, animado con `useAnimatedProps` (no `entering`: son
 * primitivas SVG, no Views, y no participan del layout de Reanimated).
 * Crece desde su ancla (x2,y2) — semgrow: scaleY 0→1 vía interpolación de
 * los extremos, 90ms de stagger entre trazos (spec §6).
 */
function Trazo({
  x1,
  y1,
  x2,
  y2,
  color,
  delayMs,
  animar,
}: Segmento & { delayMs: number; animar: boolean }) {
  const progreso = useSharedValue(animar ? 0 : 1);

  useEffect(() => {
    if (animar) {
      progreso.value = withDelay(
        delayMs,
        withTiming(1, { duration: SEMGROW_DURATION_MS, easing: Easing.out(Easing.ease) }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animar]);

  const animatedProps = useAnimatedProps(() => ({
    x1: x2 + (x1 - x2) * progreso.value,
    y1: y2 + (y1 - y2) * progreso.value,
  }));

  return (
    <AnimatedLine
      animatedProps={animatedProps}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={GROSOR}
      strokeLinecap="round"
    />
  );
}
