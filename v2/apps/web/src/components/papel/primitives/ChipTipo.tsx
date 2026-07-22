import { cn } from '~/lib/utils';

/** Los 6 tipos de voz del sistema y su color fijo (README §7). */
export type TipoVoz = 'basta' | 'sueño' | 'necesidad' | 'compromiso' | 'recurso' | 'valor';

const TIPO_CLASSES: Record<TipoVoz, string> = {
  basta: 'bg-sello border-sello',
  sueño: 'bg-violeta border-violeta',
  necesidad: 'bg-ambar border-ambar',
  compromiso: 'bg-verde border-verde',
  recurso: 'bg-cian border-cian',
  valor: 'bg-tinta border-tinta',
};

export interface ChipTipoProps {
  tipo: TipoVoz;
  active?: boolean;
  className?: string;
}

/**
 * Tag/chip de tipo §5. Inactivo: borde tinta, fondo transparente.
 * Activo: fondo del color semántico del `tipo` + texto papel.
 */
export function ChipTipo({ tipo, active = false, className }: ChipTipoProps) {
  return (
    <span
      className={cn(
        'font-space inline-block border border-tinta px-[14px] py-[9px] text-[11px] font-bold uppercase tracking-[0.08em] text-tinta',
        active && `${TIPO_CLASSES[tipo]} text-papel`,
        className,
      )}
    >
      {tipo}
    </span>
  );
}
