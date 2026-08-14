import { useEffect, useRef } from 'react';

import { BORDE_CLASE, claseDeCategoria } from '../el-mapa-data';

import type { VozAbierta } from '~/lib/queries/open-data';

import { cn } from '~/lib/utils';

export interface PopoverVozProps {
  provincia: string;
  voces: readonly VozAbierta[];
  idx: number;
  onCiclar: () => void;
  onCerrar: () => void;
  /**
   * Entra a la provincia — el zoom por altitud de la spec 1 §4.
   *
   * Vive acá y no en un gesto porque el zoom tiene que ser operable con
   * teclado (§4.2): el popover ya está en el camino de foco de la provincia,
   * así que quien llegó tabulando puede entrar sin tocar la pantalla.
   */
  onVerDeCerca?: () => void;
}

/**
 * Popover de mapa (§5, receta nueva): card tinta sobre el marco del mapa,
 * borde izquierdo del color del tipo. Foco al «✕» al abrir; Escape cierra;
 * el llamador devuelve el foco a la provincia al cerrar.
 */
export function PopoverVoz({
  provincia,
  voces,
  idx,
  onCiclar,
  onCerrar,
  onVerDeCerca,
}: PopoverVozProps) {
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cerrarRef.current?.focus();
  }, []);

  const voz = voces[idx] ?? voces[0];
  if (!voz) return null;
  const clase = claseDeCategoria(voz.category);

  return (
    <div
      role="dialog"
      aria-label={`Voz de ${provincia}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCerrar();
      }}
      className={cn(
        'anim-fadeup bg-tinta text-papel absolute right-6 top-6 w-[min(300px,80%)] border-l-2 p-5',
        clase === null ? 'border-papel' : BORDE_CLASE[clase],
      )}
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="font-space text-[10px] font-bold uppercase tracking-[0.14em]">
          {voz.category ?? 'sin tipo'}
        </span>
        <button
          ref={cerrarRef}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="font-space text-oscuro-meta hover:text-papel text-[13px]"
        >
          ✕
        </button>
      </div>
      <p className="mb-2.5 max-h-[220px] overflow-y-auto text-[15px] leading-normal">«{voz.body}»</p>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-space text-oscuro-meta text-[11px]">
          {provincia} · voz {idx + 1} de {voces.length}
        </span>
        {voces.length > 1 ? (
          <button
            type="button"
            onClick={onCiclar}
            className="font-space text-violeta-claro text-[11px] font-bold uppercase tracking-[0.08em]"
          >
            otra →
          </button>
        ) : null}
      </div>
      {onVerDeCerca ? (
        <button
          type="button"
          onClick={onVerDeCerca}
          className="font-space text-oscuro-meta hover:text-papel mt-3 border-t border-white/10 pt-3 text-[11px] uppercase tracking-[0.08em]"
        >
          ver {provincia} de cerca ↗
        </button>
      ) : null}
    </div>
  );
}
