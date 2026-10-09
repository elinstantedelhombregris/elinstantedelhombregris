import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearch } from 'wouter';

import { ColaDeVerificacion } from './ElMapa/sections/ColaDeVerificacion';
import { FuturosTerritorio } from './ElMapa/sections/FuturosTerritorio';
import { ParticiparEnMapa } from './ElMapa/sections/ParticiparEnMapa';
import { PortadaMapa } from './ElMapa/sections/PortadaMapa';
import { SeccionInstrumento } from './ElMapa/sections/SeccionInstrumento';

import type { LugarMapa } from './ElMapa/instrumento/BusquedaTerritorial';
import type { ModoAporte } from './ElMapa/sections/ParticiparEnMapa';

import { api } from '~/lib/api';
import { leerPedidoAportar } from '~/lib/participacion/aportar';

export function ElMapa() {
  const [contexto, setContexto] = useState<LugarMapa | null>(null);
  const search = useSearch();
  // `participar=aportar|directo` (y sus alias) o el ancla `#aportar` abren el panel.
  const pedido = leerPedidoAportar(search).modo;
  const [modoAporte, setModoAporte] = useState<ModoAporte>(pedido ?? 'guiado');
  const [participando, setParticipando] = useState(
    pedido !== null || window.location.hash === '#aportar',
  );
  const [visitado, setVisitado] = useState(participando);
  const territorio = Number(new URLSearchParams(search).get('lugar'));
  const lugar = useQuery({
    queryKey: ['geo', 'lugar', territorio],
    enabled: Number.isInteger(territorio) && territorio > 0,
    queryFn: () => api.get<LugarMapa>(`/api/v1/geo/lugares/${territorio}`),
  });
  useEffect(() => {
    setContexto(lugar.data ?? null);
  }, [lugar.data]);
  const abrir = (ambito: LugarMapa | null) => {
    setContexto(ambito);
    setVisitado(true);
    setParticipando(true);
  };
  useEffect(() => {
    if (pedido) {
      setModoAporte(pedido);
      setVisitado(true);
      setParticipando(true);
    }
  }, [pedido]);
  useEffect(() => {
    // El ancla `#aportar` (p. ej. la invitación del mapa vacío) abre las tres preguntas.
    const alAncla = () => {
      if (window.location.hash !== '#aportar') return;
      setModoAporte('guiado');
      abrir(contexto);
    };
    window.addEventListener('hashchange', alAncla);
    return () => {
      window.removeEventListener('hashchange', alAncla);
    };
  }, [contexto]);
  /** Cambiar de camino deja el enlace diciendo en cuál se está: se puede compartir o recargar. */
  const cambiarModo = (modo: ModoAporte) => {
    setModoAporte(modo);
    const q = new URLSearchParams(window.location.search);
    q.set('participar', modo === 'directo' ? 'directo' : 'aportar');
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${q}${window.location.hash}`,
    );
  };
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
        onTerritorio={setContexto}
        participando={participando}
        participacion={
          visitado ? (
            // El panel no se desmonta mientras carga el lugar: lo escrito se perdería.
            <ParticiparEnMapa
              modo={modoAporte}
              cambiar={cambiarModo}
              lugar={contexto ?? lugar.data ?? null}
              cargandoLugar={lugar.isLoading}
              visible={participando}
              cerrar={cerrar}
            />
          ) : null
        }
      />
      <FuturosTerritorio lugar={contexto} />

      {/* Va justo después de cargar: el momento en que alguien está más
          dispuesto a mirar algo ajeno es apenas terminó de escribir lo
          propio. */}
      <ColaDeVerificacion />
    </main>
  );
}

export default ElMapa;
