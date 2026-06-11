import { Link } from 'wouter';
import { cn } from '@/lib/utils';

/**
 * El viaje de seis pasos del movimiento, antes implícito en la navegación,
 * ahora explícito en cada página: Visión → Hombre Gris → Semilla → Mapa → Mandato → Círculos.
 */
export const JOURNEY_STEPS = [
  { step: 1, label: 'La Visión', href: '/la-vision' },
  { step: 2, label: 'El Hombre Gris', href: '/el-instante-del-hombre-gris' },
  { step: 3, label: 'La Semilla', href: '/la-semilla-de-basta' },
  { step: 4, label: 'El Mapa', href: '/el-mapa' },
  { step: 5, label: 'El Mandato Vivo', href: '/el-mandato-vivo' },
  { step: 6, label: 'Los Círculos', href: '/community' },
] as const;

interface JourneyBadgeProps {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function JourneyBadge({ step, className }: JourneyBadgeProps) {
  const prev = JOURNEY_STEPS.find((s) => s.step === step - 1);
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-slate-300',
        className,
      )}
    >
      <span>Paso {step} de 6 del viaje</span>
      {prev && (
        <>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <Link href={prev.href} className="text-[#9D85E8] hover:text-[#B5A3EF] transition-colors normal-case tracking-normal">
            ¿Te perdiste el paso {prev.step}?
          </Link>
        </>
      )}
    </div>
  );
}

export default JourneyBadge;
