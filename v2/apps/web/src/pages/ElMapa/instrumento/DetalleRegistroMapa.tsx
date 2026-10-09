import { TEXTO_RESERVADO } from '@v2/shared';
import { useEffect, useRef } from 'react';

import { ubicacionDelAporte } from '../lienzo/precision';

import { enlaceDeRegistro } from './enlace-registro';

import type { SenalMapa } from '~/lib/queries/civic-map';

export function DetalleRegistroMapa({ senal, cerrar }: { senal: SenalMapa; cerrar: () => void }) {
  const cierre = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cierre.current?.focus();
  }, [senal.id]);
  const enlace = enlaceDeRegistro(senal);
  return (
    <aside
      aria-label="Aporte seleccionado"
      onKeyDown={(e) => {
        if (e.key === 'Escape') cerrar();
      }}
      className="bg-papel text-tinta border-violeta absolute bottom-5 right-5 z-10 w-[min(360px,calc(100%_-_40px))] border-l-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-space text-violeta text-[11px] uppercase tracking-wide">
          {senal.tipo ?? 'Un aporte'} · {senal.tema ?? 'sin tema elegido'}
        </p>
        <button
          ref={cierre}
          type="button"
          className="min-h-11 min-w-11 text-2xl"
          aria-label="Cerrar el aporte seleccionado"
          onClick={cerrar}
        >
          ×
        </button>
      </div>
      {senal.texto === TEXTO_RESERVADO ? (
        <p className="text-tinta-75 mt-2 text-sm leading-relaxed">
          Quien lo cargó eligió reservar sus palabras. Podés consultar el tipo y el recorrido de
          este aporte.
        </p>
      ) : (
        <blockquote className="mt-2 max-h-40 overflow-auto break-words text-base leading-relaxed">
          «{senal.texto}»
        </blockquote>
      )}
      <p className="text-tinta-50 mt-4 text-xs leading-relaxed">
        {new Date(senal.createdAt).toLocaleDateString('es-AR')} · {ubicacionDelAporte(senal)}
      </p>
      {enlace ? (
        <a
          href={enlace}
          className="font-space text-violeta mt-3 inline-flex min-h-11 items-center text-xs uppercase underline"
        >
          Leer este aporte →
        </a>
      ) : null}
    </aside>
  );
}
