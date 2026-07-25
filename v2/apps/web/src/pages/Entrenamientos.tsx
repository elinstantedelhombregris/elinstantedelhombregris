import { CierreEntrenamientos } from './Entrenamientos/sections/CierreEntrenamientos';
import { IndiceEntrenamientos } from './Entrenamientos/sections/IndiceEntrenamientos';
import { PortadaEntrenamientos } from './Entrenamientos/sections/PortadaEntrenamientos';

/**
 * Los entrenamientos — página 3.5 «Papel y Tinta»
 * (docs/specs/2026-07-24-entrenamientos-papel-y-tinta.md). El catálogo
 * entero: portada, índice agrupado por `category` real (con pliegue) y
 * cierre al mapa. Cero backend, cero métricas de progreso (Decisiones 1/2).
 * El chrome papel lo pone RootLayout.
 */
export function Entrenamientos() {
  return (
    <main>
      <PortadaEntrenamientos />
      <IndiceEntrenamientos />
      <CierreEntrenamientos />
    </main>
  );
}

export default Entrenamientos;
