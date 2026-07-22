import { Link } from 'wouter';

import { ComoSeEscribe } from './ElMandatoVivo/sections/ComoSeEscribe';
import { ComoSeUsa } from './ElMandatoVivo/sections/ComoSeUsa';
import { DocumentoMandato } from './ElMandatoVivo/sections/DocumentoMandato';
import { PortadaMandato } from './ElMandatoVivo/sections/PortadaMandato';
import { RegistroDelMapa } from './ElMandatoVivo/sections/RegistroDelMapa';

import { BotonPapel } from '~/components/papel/primitives';

/**
 * El mandato — página 2.3 «Papel y Tinta»
 * (docs/specs/2026-07-22-el-mandato-papel-y-tinta.md). La tesis: quien ya
 * vio el mapa pregunta «¿y esto en qué termina?» — acá la respuesta es que
 * las voces SE VUELVEN un documento, con regímenes de honestidad
 * (cero/palitos/porcentaje) y el sello EJEMPLO mientras N < 100. Página
 * oscura de punta a punta; el chrome papel (header/footer/grano/velo) lo
 * pone `RootLayout`.
 *
 * El v1-port murió acá: el form «Mandá tu señal» (`POST /api/pulso` sigue
 * vivo para otras superficies — posts de comunidad, comentarios), el feed
 * «Señales recientes» y el aside de propuestas — todo absorbido por el
 * documento real (§4) y su registro (§3). La única conversión de la página
 * es el CTA final: soltar la voz en `/el-mapa`. Los anexos
 * (`/mandato-vivo/pulso/:id`, `/mandato-vivo/propuesta/:id`) viven en sus
 * propias páginas (`PulsoDetail.tsx`, `PropuestaDetail.tsx`).
 */
export function ElMandatoVivo() {
  return (
    <main className="bg-tinta text-oscuro-texto min-h-screen">
      <PortadaMandato />
      <ComoSeEscribe />
      <RegistroDelMapa />
      <DocumentoMandato />
      <ComoSeUsa />

      <section aria-labelledby="cta-mandato-titulo" className="mx-auto max-w-[1100px] px-10 pb-24 text-center max-[560px]:px-5">
        <h2 id="cta-mandato-titulo" className="sr-only">
          Sumate al mandato
        </h2>
        <BotonPapel asChild variant="violeta" surface="oscuro">
          <Link href="/el-mapa">Sumar mi voz al mandato →</Link>
        </BotonPapel>
      </section>
    </main>
  );
}

export default ElMandatoVivo;
