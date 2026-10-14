import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { AporteDirectoMapa } from './AporteDirectoMapa';

import type { LugarMapa } from '../instrumento/BusquedaTerritorial';
import type { ModoAportar } from '~/lib/participacion/aportar';

import { ISLA_DE_PAPEL } from '~/components/papel/esquema';
import { useLugarSincronizado } from '~/lib/participacion/useLugarSincronizado';
import { cn } from '~/lib/utils';

const ConversacionIdeal = lazy(() =>
  import('../../Imaginar/ConversacionIdeal').then((m) => ({ default: m.ConversacionIdeal })),
);

export type ModoAporte = ModoAportar;

/**
 * El panel de aportes del mapa: un solo lugar para «Imaginar mi Argentina».
 *
 * Abre con las tres preguntas. El aporte puntual es un camino secundario
 * dentro del mismo panel, no una pestaña pareja. Los dos formularios quedan
 * montados mientras se alterna —uno oculto con `hidden`, que lo saca también
 * del teclado y de los lectores de pantalla—, así que cambiar de camino no
 * pierde lo escrito. El lugar es el que se mira en el mapa, en vivo.
 */
export function ParticiparEnMapa({
  modo,
  cambiar,
  lugar,
  cargandoLugar = false,
  falloLugar = false,
  reintentarLugar,
  visible,
  cerrar,
}: {
  modo: ModoAporte;
  cambiar: (modo: ModoAporte) => void;
  lugar: LugarMapa | null;
  /** El mapa está buscando el lugar: se avisa en la línea del lugar, sin desmontar el panel. */
  cargandoLugar?: boolean;
  falloLugar?: boolean;
  reintentarLugar?: () => void;
  visible: boolean;
  cerrar: () => void;
}) {
  const raiz = useRef<HTMLElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  // Mientras el mapa busca el lugar llega un `null` que no es «todo el país»: el
  // formulario conserva el último lugar firme hasta que llegue el nuevo.
  const [firme, setFirme] = useState<LugarMapa | null>(lugar);
  const efectivo = lugar === null && (cargandoLugar || falloLugar) ? firme : lugar;
  if (efectivo !== firme) setFirme(efectivo);
  const { aviso } = useLugarSincronizado(efectivo);
  useEffect(() => {
    if (visible) titulo.current?.focus();
  }, [visible]);
  // Al alternar, el foco va al control que se acaba de usar o al que lleva de vuelta.
  const modoPrevio = useRef(modo);
  useEffect(() => {
    if (modoPrevio.current === modo) return;
    modoPrevio.current = modo;
    raiz.current
      ?.querySelector<HTMLElement>(
        modo === 'directo' ? '[data-volver-guiado]' : '[data-ir-directo]',
      )
      ?.focus();
  }, [modo]);
  return (
    <aside
      ref={raiz}
      id="aportar"
      aria-label="Aportar desde el mapa"
      className={cn('bg-papel text-tinta h-full', ISLA_DE_PAPEL)}
    >
      <div className="border-tinta/20 flex items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <p className="font-space text-verde text-[10px] uppercase tracking-[.14em]">
            {falloLugar
              ? 'Lugar pendiente de cargar'
              : cargandoLugar
                ? 'Buscando el lugar…'
                : (lugar?.name ?? 'Todo el país')}{' '}
            · el lugar de tu aporte
          </p>
          {aviso ? (
            <p role="status" className="text-violeta mt-1 text-xs">
              {aviso}
            </p>
          ) : null}
          <h2 ref={titulo} tabIndex={-1} className="font-anton mt-2 text-2xl focus:outline-none">
            Sumá tu aporte.
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
      {falloLugar ? (
        <div role="alert" className="px-5 py-4 text-sm">
          <p>
            No pudimos cargar el lugar elegido. Tu borrador se conserva; reintentá antes de publicar
            para no cambiar su territorio.
          </p>
          <button type="button" className="min-h-11 underline" onClick={reintentarLugar}>
            Reintentar el lugar
          </button>
        </div>
      ) : null}
      <fieldset
        disabled={cargandoLugar || falloLugar}
        className="min-w-0"
        aria-label="Contenido del aporte"
      >
        <div hidden={modo !== 'guiado'} className="p-5">
          <Suspense
            fallback={
              <p role="status" className="font-space text-sm">
                Preparando tu espacio…
              </p>
            }
          >
            <ConversacionIdeal
              lugarInicial={efectivo}
              irADirecto={() => {
                cambiar('directo');
              }}
              alMapa={cerrar}
            />
          </Suspense>
        </div>
        <div hidden={modo !== 'directo'} className="p-5">
          <button
            type="button"
            data-volver-guiado
            onClick={() => {
              cambiar('guiado');
            }}
            className="text-violeta mb-4 min-h-11 text-sm underline"
          >
            ← Volver a las tres preguntas
          </button>
          <p className="text-tinta-75 mb-5 text-sm leading-relaxed">
            Contá algo puntual: un problema, una necesidad, algo que ya funciona. Elegí de qué estás
            hablando y escribilo; después podés seguir su recorrido.
          </p>
          <AporteDirectoMapa contexto={efectivo} />
        </div>
      </fieldset>
    </aside>
  );
}
