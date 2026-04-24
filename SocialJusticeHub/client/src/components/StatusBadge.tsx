import { cn } from '@/lib/utils';

export type StatusKind = 'activo' | 'beta' | 'desarrollo' | 'idealizado';

interface StatusBadgeProps {
  kind: StatusKind;
  size?: 'sm' | 'md';
  className?: string;
}

const LABELS: Record<StatusKind, string> = {
  activo: 'Activo',
  beta: 'En beta',
  desarrollo: 'En desarrollo',
  idealizado: 'Diseño idealizado',
};

const DOT_COLORS: Record<StatusKind, string> = {
  activo: 'bg-emerald-500',
  beta: 'bg-cyan-400',
  desarrollo: 'bg-amber-500',
  idealizado: 'bg-[#C8A64A]',
};

export function StatusBadge({ kind, size = 'sm', className }: StatusBadgeProps) {
  const padding = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 font-mono font-medium text-white/85',
        padding,
        className,
      )}
      aria-label={`Estado: ${LABELS[kind]}`}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', DOT_COLORS[kind])} aria-hidden="true" />
      {LABELS[kind]}
    </span>
  );
}

export default StatusBadge;
