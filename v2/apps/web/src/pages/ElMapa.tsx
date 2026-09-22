import { useState } from 'react';

import { ColaDeVerificacion } from './ElMapa/sections/ColaDeVerificacion';
import { FeedVoces } from './ElMapa/sections/FeedVoces';
import { PanelSoltarVoz } from './ElMapa/sections/PanelSoltarVoz';
import { PortadaMapa } from './ElMapa/sections/PortadaMapa';
import { SeccionInstrumento } from './ElMapa/sections/SeccionInstrumento';

import type { LugarMapa } from './ElMapa/instrumento/BusquedaTerritorial';

export function ElMapa() {
  const [contexto, setContexto] = useState<LugarMapa | null>(null);
  return (
    <main>
      <PortadaMapa />
      <SeccionInstrumento onAportar={setContexto} />

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
