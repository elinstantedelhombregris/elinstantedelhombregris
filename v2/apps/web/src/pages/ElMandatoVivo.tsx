import { Link } from 'wouter';

import { ComoSeEscribe } from './ElMandatoVivo/sections/ComoSeEscribe';
import { ComoSeUsa } from './ElMandatoVivo/sections/ComoSeUsa';
import { DocumentoMandato } from './ElMandatoVivo/sections/DocumentoMandato';
import { PortadaMandato } from './ElMandatoVivo/sections/PortadaMandato';
import { ProcesosPublicos } from './ElMandatoVivo/sections/ProcesosPublicos';
import { RegistroDelMapa } from './ElMandatoVivo/sections/RegistroDelMapa';

import { BotonPapel } from '~/components/papel/primitives';

/** Procesos revisables y consulta agregada, con denominadores y efectos separados. */
export function ElMandatoVivo() {
  return (
    <main className="bg-tinta text-oscuro-texto min-h-screen">
      <PortadaMandato />
      <ComoSeEscribe />
      <ProcesosPublicos />
      <RegistroDelMapa />
      <DocumentoMandato />
      <ComoSeUsa />

      <section aria-labelledby="cta-mandato-titulo" className="mx-auto max-w-[1100px] px-10 pb-16 text-center max-[560px]:px-5">
        <h2 id="cta-mandato-titulo" className="sr-only">
          Imaginá el país que querés vivir
        </h2>
        <BotonPapel asChild variant="violeta" surface="oscuro">
          <Link href="/imaginar">Imaginar mi Argentina →</Link>
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
          Cinco actas generadas — una por clase de señal — para mostrar en qué termina el
          circuito. Viven en otra pantalla a propósito:{' '}
          <strong className="text-oscuro-secundario font-semibold">nadie dijo</strong> ninguna de
          esas cosas, y no se mezclan jamás con el documento del país.
        </p>
      </nav>
    </main>
  );
}

export default ElMandatoVivo;
