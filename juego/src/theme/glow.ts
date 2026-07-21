/**
 * Resplandor (glow) multiplataforma.
 *
 * react-native-web deprecó los props de estilo `shadow*` en favor de
 * `boxShadow`. En nativo, en cambio, `boxShadow` recién llega y los `shadow*`
 * siguen siendo el camino probado. Este helper devuelve el estilo correcto
 * para cada plataforma — mismo radio y misma opacidad en ambas — así ningún
 * componente tiene que repetir la bifurcación ni arrastra el warning en web.
 *
 * Todos los glows de la app tienen offset (0, 0): son halos, no sombras
 * proyectadas. Por eso el offset no es parámetro.
 */

import { Platform, type ViewStyle } from 'react-native';

/** #rrggbb (o 'transparent') → rgba() con alpha, para el string de boxShadow. */
const aRgba = (color: string, alpha: number): string => {
  if (color === 'transparent' || alpha <= 0) return 'rgba(0, 0, 0, 0)';
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // Colores con nombre u otros formatos: el navegador los resuelve tal cual
  // (la opacidad se pierde, pero ningún glow de la app cae en este caso).
  return color;
};

/**
 * @param color     Color del halo (#rrggbb o 'transparent').
 * @param radius    Radio de difuminado (= shadowRadius / blur del boxShadow).
 * @param opacity   Opacidad del halo (0–1).
 * @param elevation Profundidad Android opcional (ignorada en web).
 */
export const glow = (
  color: string,
  radius: number,
  opacity: number,
  elevation = 0,
): ViewStyle =>
  Platform.OS === 'web'
    ? { boxShadow: `0px 0px ${radius}px ${aRgba(color, opacity)}` }
    : {
        shadowColor: color,
        shadowOpacity: opacity,
        shadowRadius: radius,
        shadowOffset: { width: 0, height: 0 },
        ...(elevation ? { elevation } : {}),
      };
