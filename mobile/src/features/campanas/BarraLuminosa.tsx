import { View } from 'react-native';

import { PLATA } from '@/theme/tokens';

/**
 * Barra de progreso como luminosidad: el avance no "llena", ilumina.
 * A más entradas, más brillo del color de la campaña.
 */
export function BarraLuminosa({
  pct,
  color,
  height = 6,
}: {
  /** 0..100 (null → barra en reposo, apenas encendida) */
  pct: number | null;
  color?: string | null;
  height?: number;
}) {
  const tone = color ?? PLATA;
  const clamped = pct === null ? 100 : Math.max(0, Math.min(100, pct));
  // La luz crece con el avance: de brasa (0.25) a llama plena (1).
  const glow = pct === null ? 0.2 : 0.25 + 0.75 * (clamped / 100);

  return (
    <View
      className="w-full overflow-hidden rounded-full bg-white/5"
      style={{ height }}
      accessibilityRole="progressbar"
    >
      <View
        className="rounded-full"
        style={{
          width: `${clamped}%`,
          height,
          backgroundColor: tone,
          opacity: glow,
          shadowColor: tone,
          shadowOpacity: glow,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}
