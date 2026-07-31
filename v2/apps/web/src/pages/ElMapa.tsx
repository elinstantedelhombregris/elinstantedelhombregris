import { FeedVoces } from './ElMapa/sections/FeedVoces';
import { PanelSoltarVoz } from './ElMapa/sections/PanelSoltarVoz';
import { PortadaMapa } from './ElMapa/sections/PortadaMapa';
import { SeccionInstrumento } from './ElMapa/sections/SeccionInstrumento';

/**
 * El mapa — página 2.2.
 *
 * La estructura cambió con el rediseño: el panel para soltar la voz va ARRIBA,
 * junto al feed que prueba que lo dicho queda, y debajo va el instrumento
 * ocupando el ancho completo.
 *
 * Antes el mapa estaba encajonado al costado del panel y el análisis vivía
 * enterrado en una sección que había que ir a buscar. Un instrumento que hay
 * que buscar no se usa: ahora el mapa es la superficie de la página y las
 * lentes —mapa, análisis, línea de tiempo, cobertura— son pestañas suyas.
 *
 * El chrome papel (header/footer/grano/velo) lo pone RootLayout. El instrumento
 * es la única superficie oscura, y lo es a propósito: sobre tinta los colores
 * de las señales se leen, sobre crema se apagan.
 */
export function ElMapa() {
  return (
    <main>
      <PortadaMapa />

      <section className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-10 px-5 pb-4 max-[960px]:grid-cols-1 max-[960px]:gap-8 min-[961px]:px-10">
        <PanelSoltarVoz />
        <FeedVoces />
      </section>

      <SeccionInstrumento />
    </main>
  );
}

export default ElMapa;
