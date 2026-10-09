import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearch, Link } from 'wouter';

import { ColaDeVerificacion } from './ElMapa/sections/ColaDeVerificacion';
import { FeedVoces } from './ElMapa/sections/FeedVoces';
import { FuturosTerritorio } from './ElMapa/sections/FuturosTerritorio';
import { PanelSoltarVoz } from './ElMapa/sections/PanelSoltarVoz';
import { PortadaMapa } from './ElMapa/sections/PortadaMapa';
import { SeccionInstrumento } from './ElMapa/sections/SeccionInstrumento';

import type { LugarMapa } from './ElMapa/instrumento/BusquedaTerritorial';

import { api } from '~/lib/api';

export function ElMapa() {
  const [contexto, setContexto] = useState<LugarMapa | null>(null);
  const search = useSearch();
  const territorio = Number(new URLSearchParams(search).get('lugar'));
  const lugar = useQuery({
    queryKey: ['geo', 'lugar', territorio],
    enabled: Number.isInteger(territorio) && territorio > 0,
    queryFn: () => api.get<LugarMapa>(`/api/v1/geo/lugares/${territorio}`),
  });
  useEffect(() => {
    setContexto(lugar.data ?? null);
  }, [lugar.data]);
  return (
    <main>
      <PortadaMapa />
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-5 px-5 pb-3 min-[961px]:px-10">
        <a href="#futuros-territorio" className="text-violeta min-h-11 py-3 underline">
          Futuros en elaboración
        </a>
        <Link
          href="/imaginar"
          className="font-space bg-violeta text-papel min-h-11 px-5 py-3 text-xs uppercase"
        >
          Imaginar mi Argentina
        </Link>
        <Link href="/campanas" className="text-violeta min-h-11 py-3 underline">
          Campañas
        </Link>
      </div>
      <SeccionInstrumento onAportar={setContexto} onTerritorio={setContexto} />
      <FuturosTerritorio lugar={contexto} />

      <section
        id="aportar"
        className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-10 px-5 py-10 max-[960px]:grid-cols-1 max-[960px]:gap-8 min-[961px]:px-10"
      >
        <PanelSoltarVoz contexto={contexto} />
        <FeedVoces />
      </section>

      {/* Va justo después de cargar: el momento en que alguien está más
          dispuesto a mirar algo ajeno es apenas terminó de escribir lo
          propio. */}
      <ColaDeVerificacion />
    </main>
  );
}

export default ElMapa;
