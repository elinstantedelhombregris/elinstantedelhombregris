import { useState } from 'react';

import { IndicePlanes } from './Planes/sections/IndicePlanes';
import { MapaCorpus } from './Planes/sections/MapaCorpus';
import { MetodoPrueba } from './Planes/sections/MetodoPrueba';
import { PortadaPrueba } from './Planes/sections/PortadaPrueba';

import { useTituloDePagina } from '~/lib/titulo-de-pagina';

/**
 * El ejemplo — página 2.4 «Papel y Tinta»
 * (docs/specs/2026-07-22-la-prueba-papel-y-tinta.md). Índice de expediente
 * de los planes + el plan meta. El chrome papel lo pone RootLayout.
 */
export function Planes() {
  useTituloDePagina('Planes');
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  return (
    <main>
      <PortadaPrueba />
      <MapaCorpus seleccionado={seleccionado} onSeleccionar={setSeleccionado} />
      <IndicePlanes abierto={seleccionado} onAbrir={setSeleccionado} />
      <MetodoPrueba />
    </main>
  );
}

export default Planes;
