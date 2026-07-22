import { FeedVoces } from './ElMapa/sections/FeedVoces';
import { MapaArgentina } from './ElMapa/sections/MapaArgentina';
import { PanelSoltarVoz } from './ElMapa/sections/PanelSoltarVoz';
import { PortadaMapa } from './ElMapa/sections/PortadaMapa';

/**
 * El mapa — página 2.2 «Papel y Tinta»
 * (docs/specs/2026-07-22-el-mapa-papel-y-tinta.md). Conversión primaria del
 * sitio: soltar la primera voz en 30 segundos y verla caer en el mapa.
 * Móvil: el panel va antes que el mapa (la conversión no espera el scroll).
 * El chrome papel (header/footer/grano/velo) lo pone RootLayout.
 *
 * El panel va PRIMERO en el DOM (no solo visualmente en móvil): el orden de
 * tabulación sigue el orden del documento, no el `order` visual de CSS —
 * si el mapa fuera primero en el markup, el teclado pisaría las 24
 * provincias antes de llegar al formulario, al revés de lo que pide la
 * spec (§ Accesibilidad: chips → textarea → select → «Soltar la voz» →
 * provincias). En desktop, la posición visual (mapa a la izquierda
 * ocupando dos filas) se logra con grid placement explícito, no con el
 * orden del documento.
 */
export function ElMapa() {
  return (
    <main>
      <PortadaMapa />
      <section className="mx-auto grid max-w-[1440px] grid-cols-[1fr_480px] items-start gap-12 px-5 pb-[88px] max-[960px]:grid-cols-1 max-[960px]:gap-8 min-[961px]:px-10">
        <div className="min-[961px]:col-start-2 min-[961px]:row-start-1">
          <PanelSoltarVoz />
        </div>
        <div className="min-[961px]:col-start-1 min-[961px]:row-start-1 min-[961px]:row-span-2">
          <MapaArgentina />
        </div>
        <div className="min-[961px]:col-start-2 min-[961px]:row-start-2">
          <FeedVoces />
        </div>
      </section>
    </main>
  );
}

export default ElMapa;
