import { textoDeLaBarra, type Impulso } from './impulso';

import { cn } from '~/lib/utils';

/**
 * La barra del paso previo: cuántas personas nuevas trajo la campaña de las que necesita. La
 * frase dice el número; la barra lo muestra y lo repite para el lector de pantalla.
 */
export function BarraImpulso({ impulso, className }: { impulso: Impulso; className?: string }) {
  const { personas, umbral } = impulso;
  const lleno = Math.max(0, Math.min(personas, umbral));
  const ancho = umbral > 0 ? (lleno * 100) / umbral : 100;
  return (
    <div className={cn('max-w-[640px]', className)}>
      <p className="leading-relaxed">{textoDeLaBarra(impulso)}</p>
      <div
        role="progressbar"
        aria-label="Personas nuevas que trajo la campaña"
        aria-valuemin={0}
        aria-valuemax={umbral}
        aria-valuenow={lleno}
        aria-valuetext={`${String(personas)} de ${String(umbral)}`}
        className="border-tinta bg-papel-crudo mt-3 h-3 w-full border"
      >
        <div className="bg-violeta h-full" style={{ width: `${String(ancho)}%` }} />
      </div>
      <p
        aria-hidden="true"
        className="font-space text-tinta-50 mt-2 text-[11px] uppercase tracking-[.12em]"
      >
        {personas.toLocaleString('es-AR')} de {umbral.toLocaleString('es-AR')}
      </p>
    </div>
  );
}
