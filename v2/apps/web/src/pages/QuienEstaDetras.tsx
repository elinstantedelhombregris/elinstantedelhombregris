import { CierreFirma } from './QuienEstaDetras/sections/CierreFirma';
import { DeDondeVengo } from './QuienEstaDetras/sections/DeDondeVengo';
import { LaFicha } from './QuienEstaDetras/sections/LaFicha';
import { LaSemillaNoEsMia } from './QuienEstaDetras/sections/LaSemillaNoEsMia';
import { LosDosNombres } from './QuienEstaDetras/sections/LosDosNombres';
import { PorQueEmpece } from './QuienEstaDetras/sections/PorQueEmpece';
import { PortadaQuien } from './QuienEstaDetras/sections/PortadaQuien';
import { QuienPaga } from './QuienEstaDetras/sections/QuienPaga';

/**
 * Quién está detrás — la semilla y la mano que la plantó
 * (spec docs/specs/2026-08-10-quien-esta-detras.md).
 *
 * Página de entrada única: el ÚNICO enlace del sitio está en la franja
 * inferior del footer. No entra al recorrido del header ni al menú móvil —
 * si compitiera con la idea, contradiría lo que la página misma dice.
 *
 * El chrome papel (header/footer/grano/velo) lo pone RootLayout.
 */
export function QuienEstaDetras() {
  return (
    <main>
      <PortadaQuien />
      <LaFicha />
      <PorQueEmpece />
      <DeDondeVengo />
      <LosDosNombres />
      <LaSemillaNoEsMia />
      <QuienPaga />
      <CierreFirma />
    </main>
  );
}

export default QuienEstaDetras;
