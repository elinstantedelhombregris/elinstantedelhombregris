import { Text, type StyleProp, type TextStyle } from 'react-native';

type Props = {
  /** Número = orden de creación. */
  numero: number;
  registro?: 'papel' | 'noche';
  className?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * ExpedienteNum — «EXP. N° 004», mono 10px tracking 0.12em tinta-50
 * (spec §3.10). Para misiones y logros/ascensos (p.ej. RangoUpOverlay,
 * que vive en el registro noche — de ahí el prop `registro`).
 */
export function ExpedienteNum({ numero, registro = 'papel', className, style }: Props) {
  const color = registro === 'noche' ? 'text-oscuro-meta' : 'text-tinta-50';
  const n = Number.isFinite(numero) ? Math.max(0, Math.trunc(numero)) : 0;

  return (
    <Text
      className={`font-space text-[10px] uppercase tracking-[1.2px] ${color} ${className ?? ''}`}
      style={style}
    >
      {`EXP. N° ${String(n).padStart(3, '0')}`}
    </Text>
  );
}
