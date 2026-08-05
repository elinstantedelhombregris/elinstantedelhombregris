import { IndicePlanes } from './Planes/sections/IndicePlanes';
import { MetodoPrueba } from './Planes/sections/MetodoPrueba';
import { PortadaPrueba } from './Planes/sections/PortadaPrueba';

/**
 * El ejemplo — página 2.4 «Papel y Tinta»
 * (docs/specs/2026-07-22-la-prueba-papel-y-tinta.md). Índice de expediente
 * de los planes + el plan meta. El chrome papel lo pone RootLayout.
 */
export function Planes() {
  return (
    <main>
      <PortadaPrueba />
      <IndicePlanes />
      <MetodoPrueba />
    </main>
  );
}

export default Planes;
