import { useRef } from 'react';

import { PESTANAS, type IdPestana } from './usePestana';

import type { KeyboardEvent, ReactNode } from 'react';

const idPestana = (id: IdPestana) => `pestana-${id}`;
const idPanel = (id: IdPestana) => `panel-${id}`;

/** Las seis pestañas como `tablist`: una sola con tabindex 0 y flechas para moverse entre ellas. */
export function ListaDePestanas({
  actual,
  elegir,
}: {
  actual: IdPestana;
  elegir: (id: IdPestana) => void;
}) {
  const botones = useRef<Partial<Record<IdPestana, HTMLButtonElement | null>>>({});
  const mover = (evento: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const ultimo = PESTANAS.length - 1;
    const destino =
      evento.key === 'ArrowRight'
        ? (indice + 1) % PESTANAS.length
        : evento.key === 'ArrowLeft'
          ? (indice + ultimo) % PESTANAS.length
          : evento.key === 'Home'
            ? 0
            : evento.key === 'End'
              ? ultimo
              : null;
    if (destino === null) return;
    evento.preventDefault();
    const siguiente = PESTANAS[destino];
    if (!siguiente) return;
    elegir(siguiente.id);
    botones.current[siguiente.id]?.focus();
  };
  return (
    <div role="tablist" aria-label="Secciones de Mi espacio" className="mb-8 flex flex-wrap gap-2">
      {PESTANAS.map((p, i) => {
        const activa = p.id === actual;
        return (
          <button
            key={p.id}
            ref={(nodo) => {
              botones.current[p.id] = nodo;
            }}
            type="button"
            role="tab"
            id={idPestana(p.id)}
            aria-selected={activa}
            aria-controls={idPanel(p.id)}
            tabIndex={activa ? 0 : -1}
            onClick={() => {
              elegir(p.id);
            }}
            onKeyDown={(evento) => {
              mover(evento, i);
            }}
            className={`font-space min-h-11 border px-4 py-3 text-xs ${activa ? 'bg-tinta text-papel' : 'bg-papel text-tinta'}`}
          >
            {p.nombre}
          </button>
        );
      })}
    </div>
  );
}

/** El panel de la pestaña activa, atado a su pestaña por ids. */
export function PanelDePestana({ id, children }: { id: IdPestana; children: ReactNode }) {
  return (
    <div role="tabpanel" id={idPanel(id)} aria-labelledby={idPestana(id)} tabIndex={0}>
      {children}
    </div>
  );
}
