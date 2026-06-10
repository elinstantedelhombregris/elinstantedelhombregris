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

const STATUS_META: Record<PlatformStatus, { label: string; dotClass: string; title: string }> = {
  live: {
    label: 'EN VIVO',
    dotClass: 'bg-emerald-400',
    title: 'Datos reales, funcionando hoy',
  },
  construccion: {
    label: 'EN CONSTRUCCIÓN',
    dotClass: 'bg-amber-400',
    title: 'Existe y se está desarrollando en abierto',
  },
  simulacion: {
    label: 'SIMULACIÓN',
    dotClass: 'bg-sky-400',
    title: 'Escenario ilustrativo: así se vería a escala',
  },
  ejercicio: {
    label: 'EJERCICIO DE DISEÑO',
    dotClass: 'bg-slate-400',
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
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5',
        'text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-300',
        className,
      )}
    >
      <span aria-hidden className={cn('w-1.5 h-1.5 rounded-full shrink-0', meta.dotClass)} />
      {meta.label}
    </span>
  );
}

export default StatusBadge;
