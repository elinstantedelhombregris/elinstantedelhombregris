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

export function ElMapa() {
  const [contexto, setContexto] = useState<LugarMapa | null>(null);
  const search = useSearch();
  const pedido = new URLSearchParams(search).get('participar');
  const [modoAporte, setModoAporte] = useState<ModoAporte>(pedido === 'voz' ? 'voz' : 'imaginar');
  const [participando, setParticipando] = useState(
    pedido === 'imaginar' || pedido === 'voz' || window.location.hash === '#aportar',
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
    if (pedido === 'imaginar' || pedido === 'voz') {
      setModoAporte(pedido);
      setVisitado(true);
      setParticipando(true);
    }
  }, [pedido]);
  useEffect(() => {
    const alAncla = () => {
      if (window.location.hash === '#aportar') abrir(contexto);
    };
    window.addEventListener('hashchange', alAncla);
    return () => {
      window.removeEventListener('hashchange', alAncla);
    };
  }, [contexto]);
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
            lugar.isLoading ? (
              <p role="status" className="bg-papel text-tinta p-5">
                Buscando el territorio de tu conversación…
              </p>
            ) : (
              <ParticiparEnMapa
                modo={modoAporte}
                cambiar={setModoAporte}
                lugar={contexto ?? lugar.data ?? null}
                visible={participando}
                cerrar={cerrar}
              />
            )
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
