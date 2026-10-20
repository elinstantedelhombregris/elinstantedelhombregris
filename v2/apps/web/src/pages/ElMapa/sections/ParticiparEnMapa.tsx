import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';

import { AporteDirectoMapa } from './AporteDirectoMapa';

import type { LugarMapa } from '../instrumento/BusquedaTerritorial';

import { ISLA_DE_PAPEL } from '~/components/papel/esquema';
import { APORTAR_HREF } from '~/lib/participacion/aportar';
import { useLugarSincronizado } from '~/lib/participacion/useLugarSincronizado';
import { cn } from '~/lib/utils';

/**
 * El panel de aportes del mapa: contar algo puntual que pasa hoy, con su lugar.
 *
 * Hasta la entrega 3 abría con las tres preguntas para imaginar el país, y el aporte
 * puntual era un camino secundario. Imaginar se fue a Mi Argentina ideal (spec
 * 2026-10-19 §7) y el mapa quedó como la capa de cómo está hoy: un problema, algo que
 * falta, algo que ya funciona. El lugar es el que se mira en el mapa, en vivo.
 */
export function ParticiparEnMapa({
  lugar,
  cargandoLugar = false,
  falloLugar = false,
  reintentarLugar,
  visible,
  cerrar,
}: {
  lugar: LugarMapa | null;
  /** El mapa está buscando el lugar: se avisa en la línea del lugar, sin desmontar el panel. */
  cargandoLugar?: boolean;
  falloLugar?: boolean;
  reintentarLugar?: () => void;
  visible: boolean;
  cerrar: () => void;
}) {
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
  return (
    <aside
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
        className="min-w-0 p-5"
        aria-label="Contenido del aporte"
      >
        <p className="text-tinta-75 mb-5 text-sm leading-relaxed">
          Contá cómo está hoy algo de tu lugar: un problema, algo que falta, algo que ya funciona.
          Elegí de qué estás hablando y escribilo; después podés seguir su recorrido.
        </p>
        <AporteDirectoMapa contexto={efectivo} />
        <p className="text-tinta-75 border-tinta/20 mt-6 border-t pt-4 text-sm leading-relaxed">
          ¿Querés contar cómo imaginás el país?{' '}
          <Link href={APORTAR_HREF} className="text-violeta underline underline-offset-4">
            Eso va en Mi Argentina ideal
          </Link>
          .
        </p>
      </fieldset>
    </aside>
  );
}
