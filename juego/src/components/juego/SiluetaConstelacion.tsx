/**
 * La silueta de una constelación (spec §3.1), dibujada con SVG: la
 * polilínea une los puntos del dibujo y cada punto se enciende en el
 * color de su señal a medida que las estrellas llegan. Los pendientes
 * esperan apagados, apenas visibles — el dibujo se completa solo.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): el trazo y los
 * puntos apagados recolorean a tinta (antes plata, pensados para fondo
 * oscuro); los puntos encendidos siguen en su color de señal — ya son los
 * tokens de papel (spec §2, `content/senales.ts`).
 */

import { View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { SENAL_POR_KEY, type Constelacion } from '@/content';
import { puntosDeConstelacion, type ProgresoConstelacion } from '@/game/colecciones';
import { TINTA, TINTA_30 } from '@/theme/tokens';

const PAD = 8;
const escala = (v: number): number => PAD + v * (100 - PAD * 2);

export function SiluetaConstelacion({
  constelacion,
  porTipo,
  size = 120,
  completada = false,
}: {
  constelacion: Constelacion;
  /** Progreso por tipo (computeColecciones); {} = todo apagado. */
  porTipo: ProgresoConstelacion['porTipo'];
  size?: number;
  completada?: boolean;
}) {
  const puntos = puntosDeConstelacion(constelacion.receta, porTipo);
  const poly = constelacion.silueta
    .map((p) => `${escala(p.x)},${escala(p.y)}`)
    .join(' ');

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Polyline
          points={poly}
          fill="none"
          stroke={completada ? TINTA : TINTA_30}
          strokeWidth={completada ? 1.1 : 0.8}
          strokeLinejoin="round"
        />
        {/* halos primero, núcleos encima: el glow no tapa el punto */}
        {constelacion.silueta.map((p, i) => {
          const info = puntos[i];
          if (!info?.encendido) return null;
          return (
            <Circle
              key={`halo-${i}`}
              cx={escala(p.x)}
              cy={escala(p.y)}
              r={5.2}
              fill={SENAL_POR_KEY[info.tipo].color}
              opacity={0.22}
            />
          );
        })}
        {constelacion.silueta.map((p, i) => {
          const info = puntos[i];
          const cx = escala(p.x);
          const cy = escala(p.y);
          if (!info?.encendido) {
            return <Circle key={i} cx={cx} cy={cy} r={1.8} fill={TINTA_30} />;
          }
          return (
            <Circle key={i} cx={cx} cy={cy} r={2.6} fill={SENAL_POR_KEY[info.tipo].color} />
          );
        })}
      </Svg>
    </View>
  );
}
