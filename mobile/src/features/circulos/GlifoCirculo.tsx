import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { PLATA } from '@/theme/tokens';

/**
 * Glifo de círculo — constelación determinística generada desde el id.
 * Cada círculo nace con su propia figura de estrellas: hermoso por defecto,
 * sin subir logos, cero moderación de imágenes. Puntos plata, líneas finas.
 */

/** PRNG determinístico (mulberry32) — mismo id, mismo glifo, siempre. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  x: number;
  y: number;
  r: number;
}

function generateStars(id: number): Star[] {
  const rand = mulberry32(id * 2654435761 + 1);
  const count = 5 + Math.floor(rand() * 3); // 5..7 puntos
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    // Ángulo con jitter alrededor del círculo + radio variable:
    // dispersión orgánica pero sin amontonarse.
    const angle = (i / count) * Math.PI * 2 + (rand() - 0.5) * 1.2;
    const radius = 18 + rand() * 26;
    stars.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      r: 1.6 + rand() * 1.8,
    });
  }
  return stars;
}

export function GlifoCirculo({ id, size = 44 }: { id: number; size?: number }) {
  const stars = generateStars(id);
  return (
    <View
      className="items-center justify-center rounded-full bg-white/5 border border-white/10"
      style={{ width: size, height: size }}
    >
      <Svg width={size * 0.8} height={size * 0.8} viewBox="0 0 100 100">
        {stars.map((star, i) => {
          const next = stars[(i + 1) % stars.length];
          if (!next) return null;
          return (
            <Line
              key={`l${i}`}
              x1={star.x}
              y1={star.y}
              x2={next.x}
              y2={next.y}
              stroke="rgba(245, 247, 250, 0.22)"
              strokeWidth={1}
            />
          );
        })}
        {stars.map((star, i) => (
          <Circle key={`s${i}`} cx={star.x} cy={star.y} r={star.r} fill={PLATA} opacity={0.9} />
        ))}
      </Svg>
    </View>
  );
}
