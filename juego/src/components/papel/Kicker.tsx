import { Text, type StyleProp, type TextStyle } from 'react-native';

type Props = {
  children: string;
  /** Registro visual: papel (default) o la noche del Cielo. */
  registro?: 'papel' | 'noche';
  /** acento = violeta (la marca); neutro = tinta-50 (kickers sin urgencia). */
  tono?: 'acento' | 'neutro';
  className?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Kicker — Space Mono 11px, tracking 0.16em, uppercase (spec §3.1).
 * Reemplaza a `SectionBadge` (que queda intacto hasta que las pantallas
 * migren). Es texto plano: sin píldora, sin fondo, sin borde.
 */
export function Kicker({
  children,
  registro = 'papel',
  tono = 'acento',
  className,
  style,
}: Props) {
  const color =
    tono === 'acento'
      ? registro === 'noche'
        ? 'text-violeta-claro'
        : 'text-violeta'
      : registro === 'noche'
        ? 'text-oscuro-meta'
        : 'text-tinta-50';

  return (
    <Text
      className={`font-space text-[11px] uppercase tracking-[1.76px] ${color} ${className ?? ''}`}
      style={style}
    >
      {children}
    </Text>
  );
}
