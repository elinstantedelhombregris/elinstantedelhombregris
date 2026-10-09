import { lazy, Suspense, useEffect, useRef } from 'react';

import { AporteDirectoMapa } from './AporteDirectoMapa';

import type { LugarMapa } from '../instrumento/BusquedaTerritorial';

const ConversacionIdeal = lazy(() =>
  import('../../Imaginar/ConversacionIdeal').then((m) => ({ default: m.ConversacionIdeal })),
);

export type ModoAporte = 'imaginar' | 'voz';

export function ParticiparEnMapa({
  modo,
  cambiar,
  lugar,
  visible,
  cerrar,
}: {
  modo: ModoAporte;
  cambiar: (modo: ModoAporte) => void;
  lugar: LugarMapa | null;
  visible: boolean;
  cerrar: () => void;
}) {
  const titulo = useRef<HTMLHeadingElement>(null);
  const lugarInicial = useRef(lugar);
  useEffect(() => {
    if (visible) titulo.current?.focus();
  }, [visible]);
  return (
    <aside id="aportar" aria-label="Aportar desde el mapa" className="bg-papel text-tinta h-full">
      <div className="border-tinta/20 flex items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <p className="font-space text-verde text-[10px] uppercase tracking-[.14em]">
            {lugarInicial.current?.name ?? 'Argentina'} · tu lugar en la conversación
          </p>
          <h2 ref={titulo} tabIndex={-1} className="font-anton mt-2 text-2xl">
            Sumá tu mirada.
          </h2>
        </div>
        <button
          type="button"
          onClick={cerrar}
          className="min-h-11 min-w-11 text-2xl"
          aria-label="Cerrar aporte y volver al mapa"
        >
          ×
        </button>
      </div>
      <div
        className="border-tinta/20 grid grid-cols-2 border-b"
        role="group"
        aria-label="Cómo querés aportar"
      >
        {(
          [
            { id: 'imaginar', nombre: 'Imaginar una vida' },
            { id: 'voz', nombre: 'Contar lo que veo' },
          ] as const
        ).map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            aria-pressed={modo === opcion.id}
            onClick={() => {
              cambiar(opcion.id);
            }}
            className={`font-space min-h-14 px-4 py-3 text-[11px] uppercase tracking-wide ${modo === opcion.id ? 'bg-tinta text-papel' : 'hover:bg-papel-presionado'}`}
          >
            {opcion.nombre}
          </button>
        ))}
      </div>
      <div hidden={modo !== 'imaginar'} className="p-5">
        <Suspense
          fallback={
            <p role="status" className="font-space text-sm">
              Preparando tu espacio…
            </p>
          }
        >
          <ConversacionIdeal integrada lugarInicial={lugarInicial.current} />
        </Suspense>
      </div>
      <div hidden={modo !== 'voz'} className="p-5">
        <p className="text-tinta-75 mb-5 text-sm leading-relaxed">
          Lo que pensás, soñás, sabés o necesitás también forma parte del país. Elegí cómo decirlo;
          después podrás seguir su recorrido.
        </p>
        <AporteDirectoMapa contexto={lugarInicial.current} />
      </div>
    </aside>
  );
}
