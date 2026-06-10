import { cn } from '@/lib/utils';

/**
 * Etiquetas de honestidad de la plataforma.
 * Todo lo que se muestra pertenece a uno de estos registros — y se dice.
 *  - live:        datos reales, funcionando hoy
 *  - construccion: existe pero está en desarrollo activo
 *  - simulacion:  escenario ilustrativo de cómo se vería a escala
 *  - ejercicio:   ejercicio de diseño idealizado (ej.: los 22 planes)
 */
export type PlatformStatus = 'live' | 'construccion' | 'simulacion' | 'ejercicio';

const STATUS_META: Record<PlatformStatus, { label: string; className: string; title: string }> = {
  live: {
    label: 'EN VIVO',
    className: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
    title: 'Datos reales, funcionando hoy',
  },
  construccion: {
    label: 'EN CONSTRUCCIÓN',
    className: 'bg-blue-500/10 text-blue-300 border-blue-400/30',
    title: 'Existe y se está desarrollando en abierto',
  },
  simulacion: {
    label: 'SIMULACIÓN',
    className: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
    title: 'Escenario ilustrativo: así se vería a escala',
  },
  ejercicio: {
    label: 'EJERCICIO DE DISEÑO',
    className: 'bg-violet-500/10 text-violet-300 border-violet-400/30',
    title: 'Diseño idealizado: muestra a dónde se podría apuntar, no es una promesa',
  },
};

interface StatusBadgeProps {
  status: PlatformStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      title={meta.title}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-semibold tracking-wider uppercase',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export default StatusBadge;
