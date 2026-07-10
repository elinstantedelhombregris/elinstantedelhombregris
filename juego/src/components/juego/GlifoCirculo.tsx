/**
 * Glifo de círculo — la firma visual determinística de un círculo local
 * (spec §3.5, v1 mínimo): 5–7 puntos conectados, como una constelación
 * chica. Misma semilla → mismo glifo en cualquier teléfono (el hashing es
 * el de src/game, el mismo que ordena el Cielo).
 */

import { useMemo } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { hashSemilla, mulberry32 } from '@/game/eventos';
import { PLATA } from '@/theme/tokens';

export interface PuntoGlifo {
  x: number;
  y: number;
}

/**
 * Puntos del glifo, puros y determinísticos por semilla: 5–7 vértices
 * alrededor del centro, con jitter angular y radial estable.
 */
export const puntosGlifo = (seed: string, size: number): PuntoGlifo[] => {
  const rng = mulberry32(hashSemilla(`glifo#${seed}`));
  const n = 5 + Math.floor(rng() * 3); // 5..7
  const cx = size / 2;
  const cy = size / 2;
  const radioBase = size * 0.38;
  return Array.from({ length: n }, (_, i) => {
    const angulo =
      (i / n) * Math.PI * 2 - Math.PI / 2 + (rng() - 0.5) * (Math.PI / n);
    const radio = radioBase * (0.55 + rng() * 0.45);
    return { x: cx + radio * Math.cos(angulo), y: cy + radio * Math.sin(angulo) };
  });
};

export function GlifoCirculo({
  seed,
  size = 96,
  color = PLATA,
}: {
  seed: string;
  size?: number;
  color?: string;
}) {
  const puntos = useMemo(() => puntosGlifo(seed, size), [seed, size]);
  const trazo = useMemo(
    () =>
      `${puntos
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ')} Z`,
    [puntos],
  );

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={trazo}
        stroke={color}
        strokeOpacity={0.45}
        strokeWidth={1.2}
        strokeLinejoin="round"
        fill="none"
      />
      {puntos.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={size / 38} fill={color} />
      ))}
    </Svg>
  );
}
