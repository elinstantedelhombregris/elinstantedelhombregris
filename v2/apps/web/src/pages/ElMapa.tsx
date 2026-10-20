import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Redirect, useLocation, useSearch } from 'wouter';

import { destinoDeImaginar, pideAportePuntual } from './ElMapa/pedido-de-aporte';
import { ColaDeVerificacion } from './ElMapa/sections/ColaDeVerificacion';
import { FuturosTerritorio } from './ElMapa/sections/FuturosTerritorio';
import { ParticiparEnMapa } from './ElMapa/sections/ParticiparEnMapa';
import { PortadaMapa } from './ElMapa/sections/PortadaMapa';
import { SeccionInstrumento } from './ElMapa/sections/SeccionInstrumento';

import type { LugarMapa } from './ElMapa/instrumento/BusquedaTerritorial';

import { api } from '~/lib/api';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

/**
 * `/el-mapa` — la capa de cómo está hoy lo que la gente imaginó (spec 2026-10-19 §6).
 *
 * Un enlace que pide imaginar (`?participar=aportar`, sus alias o `#aportar`) ya no
 * abre un panel acá: va a Imaginar, reemplazando la entrada del historial, con la
 * campaña, la edición, el borrador y el lugar que traía.
 */
export function ElMapa() {
  const search = useSearch();
  const destino = destinoDeImaginar(search, window.location.hash);
  if (destino) return <Redirect to={destino} replace />;
  return <MapaDeHoy />;
}

function MapaDeHoy() {
  const [elegido, setElegido] = useState<LugarMapa | null>(null);
  const search = useSearch();
  const [, navegar] = useLocation();
  // `participar=directo` (o `voz`) abre el aporte puntual dentro del instrumento.
  const pideDirecto = pideAportePuntual(search);
  const [participando, setParticipando] = useState(pideDirecto);
  useTituloDePagina('El mapa');
  const [visitado, setVisitado] = useState(participando);
  const territorio = Number(new URLSearchParams(search).get('lugar'));
  const lugar = useQuery({
    queryKey: ['geo', 'lugar', territorio],
    enabled: Number.isInteger(territorio) && territorio > 0,
    queryFn: () => api.get<LugarMapa>(`/api/v1/geo/lugares/${territorio}`),
  });
  // El id de la URL manda también al volver atrás o limpiar filtros.
  const contexto =
    elegido?.id === territorio ? elegido : lugar.data?.id === territorio ? lugar.data : null;
  const pendienteLugar = Number.isInteger(territorio) && territorio > 0 && contexto === null;
  const falloLugar = pendienteLugar && lugar.isError;
  const reintentarLugar = () => {
    void lugar.refetch();
  };
  const abrir = (ambito: LugarMapa | null) => {
    if (ambito) setElegido(ambito);
    setVisitado(true);
    setParticipando(true);
  };
  useEffect(() => {
    if (pideDirecto) {
      setVisitado(true);
      setParticipando(true);
    }
  }, [pideDirecto]);
  useEffect(() => {
    // Un ancla `#aportar` que aparece con la página abierta también lleva a Imaginar.
    const alAncla = () => {
      const destino = destinoDeImaginar(window.location.search, window.location.hash);
      if (destino) navegar(destino, { replace: true });
    };
    window.addEventListener('hashchange', alAncla);
    return () => {
      window.removeEventListener('hashchange', alAncla);
    };
  }, [navegar]);
  const cerrar = () => {
    setParticipando(false);
    const q = new URLSearchParams(window.location.search);
    q.delete('participar');
    window.history.replaceState(null, '', `/el-mapa${q.size ? `?${q}` : ''}#instrumento`);
    document.querySelector<HTMLButtonElement>('[data-abrir-aporte]')?.focus();
  };
  return (
    <main>
      <PortadaMapa />
      <SeccionInstrumento
        onAportar={abrir}
        onTerritorio={setElegido}
        participando={participando}
        participacion={
          visitado ? (
            // El panel no se desmonta mientras carga el lugar: lo escrito se perdería.
            <ParticiparEnMapa
              lugar={contexto}
              cargandoLugar={pendienteLugar && !falloLugar}
              falloLugar={falloLugar}
              reintentarLugar={reintentarLugar}
              visible={participando}
              cerrar={cerrar}
            />
          ) : null
        }
      />
      {pendienteLugar ? (
        <div className="mx-auto max-w-[1440px] px-5 py-8" role={falloLugar ? 'alert' : 'status'}>
          {falloLugar ? (
            <>
              <p>
                No pudimos cargar el lugar elegido. Las fichas de ese territorio todavía no están
                disponibles.
              </p>
              <button type="button" className="min-h-11 underline" onClick={reintentarLugar}>
                Reintentar el lugar
              </button>
            </>
          ) : (
            'Buscando las fichas del lugar elegido…'
          )}
        </div>
      ) : (
        <FuturosTerritorio lugar={contexto} />
      )}

      {/* Va justo después de cargar: el momento en que alguien está más
          dispuesto a mirar algo ajeno es apenas terminó de escribir lo
          propio. */}
      <ColaDeVerificacion />
    </main>
  );
}

export default ElMapa;
