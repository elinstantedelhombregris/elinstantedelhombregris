import { View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  /** Registro visual: papel (default) o la noche del Cielo. */
  registro?: 'papel' | 'noche';
  /** default = borde tinta dura; suave = borde bordeSuave, menos peso. */
  variante?: 'default' | 'suave';
  className?: string;
};

/**
 * PapelCard — panel plano, radius 0, sin sombra (spec §3.3).
 * Reemplaza a `GlassCard` (que queda como alias deprecado hasta la
 * limpieza final de Task PT8; las pantallas migran en PT3–PT7).
 */
export function PapelCard({
  registro = 'papel',
  variante = 'default',
  className,
  ...props
}: Props) {
  const base =
    registro === 'noche'
      ? 'bg-oscuro-barra/60 border border-oscuro-borde'
      : variante === 'suave'
        ? 'bg-papel-crudo border border-bordeSuave'
        : 'bg-papel-crudo border border-tinta';

  return <View className={`${base} ${className ?? ''}`} {...props} />;
}
