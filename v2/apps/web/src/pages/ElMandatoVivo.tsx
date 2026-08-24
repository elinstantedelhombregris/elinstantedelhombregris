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

      <section aria-labelledby="cta-mandato-titulo" className="mx-auto max-w-[1100px] px-10 pb-16 text-center max-[560px]:px-5">
        <h2 id="cta-mandato-titulo" className="sr-only">
          Sumate al mandato
        </h2>
        <BotonPapel asChild variant="violeta" surface="oscuro">
          <Link href="/el-mapa">Sumar mi voz al mandato →</Link>
        </BotonPapel>
      </section>

      {/* Un link y nada más que un link (E5 de la enmienda de las actas): el
          ejemplo no se monta acá, vive en su propia pantalla. Fuera del flujo
          principal a propósito — con el documento en cero, esto es lo único
          que muestra en qué termina el circuito. */}
      <nav
        aria-label="El ejemplo del mandato"
        className="border-oscuro-borde mx-auto max-w-[1100px] border-t-2 px-10 pb-24 pt-8 max-[560px]:px-5"
      >
        <p className="font-space text-oscuro-meta mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">
          Todavía no se ve nada, o se ve poco
        </p>
        <Link
          href="/mandato-vivo/ejemplo"
          className="font-anton text-oscuro-texto block max-w-[70ch] text-[clamp(24px,2.8vw,34px)] leading-[1.08] underline decoration-1 underline-offset-[6px] hover:opacity-70"
        >
          Ver un ejemplo de actas, con casos inventados →
        </Link>
        <p className="text-oscuro-meta mt-3 max-w-[70ch] text-[15px] leading-[1.55]">
          Cinco actas escritas a mano — una por clase de señal — para mostrar en qué termina el
          circuito. Viven en otra pantalla a propósito:{' '}
          <strong className="text-oscuro-secundario font-semibold">nadie dijo</strong> ninguna de
          esas cosas, y no se mezclan jamás con el documento del país.
        </p>
      </nav>
    </main>
  );
}

export default ElMandatoVivo;
