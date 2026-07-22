import { useEffect, useRef } from 'react';

import { BORDE_TIPO, tipoDeCategoria } from '../el-mapa-data';

import type { VozAbierta } from '~/lib/queries/open-data';

import { cn } from '~/lib/utils';

export interface PopoverVozProps {
  provincia: string;
  voces: readonly VozAbierta[];
  idx: number;
  onCiclar: () => void;
  onCerrar: () => void;
}

/**
 * Popover de mapa (§5, receta nueva): card tinta sobre el marco del mapa,
 * borde izquierdo del color del tipo. Foco al «✕» al abrir; Escape cierra;
 * el llamador devuelve el foco a la provincia al cerrar.
 */
export function PopoverVoz({ provincia, voces, idx, onCiclar, onCerrar }: PopoverVozProps) {
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cerrarRef.current?.focus();
  }, []);

  const voz = voces[idx] ?? voces[0];
  if (!voz) return null;
  const tipo = tipoDeCategoria(voz.category);

  return (
    <div
      role="dialog"
      aria-label={`Voz de ${provincia}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCerrar();
      }}
      className={cn(
        'anim-fadeup bg-tinta text-papel absolute right-6 top-6 w-[min(300px,80%)] border-l-2 p-5',
        BORDE_TIPO[tipo],
      )}
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="font-space text-[10px] font-bold uppercase tracking-[0.14em]">{tipo}</span>
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
    </div>
  );
}
