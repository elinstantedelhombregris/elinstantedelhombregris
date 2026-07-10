/**
 * Progreso de expedición como LUMINOSIDAD (spec §3.2): el relleno brilla
 * en el color de señal de la plantilla y los hitos 25/50/100 son puntos
 * que se encienden al cruzarse. Los datos brillan en su color — el
 * violeta queda para las acciones.
 */

import { View } from 'react-native';

import { HITOS } from '@/game/expediciones';

export function BarraLuminosa({
  porcentaje,
  color,
  hitosOtorgados,
  alta = false,
}: {
  /** 0..100 entero (progresoExpedicion). */
  porcentaje: number;
  /** Color de señal de la plantilla. */
  color: string;
  /** Hitos ya pagados (JSON de la expedición). */
  hitosOtorgados: readonly number[];
  /** Variante grande para la pantalla de detalle. */
  alta?: boolean;
}) {
  const hBarra = alta ? 10 : 6;
  const dot = alta ? 16 : 11;
  return (
    <View className="justify-center" style={{ height: dot }}>
      <View
        className="overflow-hidden rounded-full border border-white/10 bg-white/5"
        style={{ height: hBarra }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, porcentaje))}%`,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.9,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      </View>
      {HITOS.map((hito) => {
        const encendido = hitosOtorgados.includes(hito) || porcentaje >= hito;
        return (
          <View
            key={hito}
            className="absolute rounded-full border"
            style={{
              left: `${hito}%`,
              marginLeft: hito === 100 ? -dot : -dot / 2,
              width: dot,
              height: dot,
              backgroundColor: encendido ? color : '#0a0a0a',
              borderColor: encendido ? color : 'rgba(255,255,255,0.22)',
              shadowColor: encendido ? color : 'transparent',
              shadowOpacity: encendido ? 0.8 : 0,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
              elevation: encendido ? 4 : 0,
            }}
          />
        );
      })}
    </View>
  );
}
