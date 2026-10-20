import { Link } from 'wouter';

import { EscribirIdeal } from './EscribirIdeal';

import { RitoTinta } from '~/components/papel/primitives';

/**
 * La primera pantalla de la portada: el wordmark, la idea y el campo para escribir.
 *
 * El orden del documento es el que se ve en el teléfono: el wordmark, la idea en
 * tres líneas, la pregunta con su campo y, debajo, qué es el sitio. Así la pregunta
 * y el campo entran en la primera pantalla de 390 px sin reordenar nada con CSS
 * (lo que se ve y lo que recorre el teclado van en el mismo orden). En escritorio
 * la grilla pone la idea y su explicación a la izquierda y el campo a la derecha,
 * como antes.
 */
export function HeroBasta() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 pb-12 pt-7 min-[961px]:px-10 min-[961px]:pt-10">
      <div className="border-tinta font-space text-tinta-50 flex items-start justify-between gap-5 border-b pb-3 text-[10px] uppercase tracking-[.12em] min-[561px]:text-[11px]">
        <span>Argentina · una idea de país</span>
        <span className="hidden min-[561px]:inline">Sin líder · Sin partido · Sin excusas</span>
      </div>
      <div
        aria-hidden
        className="riso-hover font-anton py-4 text-center text-[clamp(70px,19vw,280px)] leading-[.94] tracking-[.005em] min-[961px]:py-7"
      >
        <RitoTinta lineas={['¡BASTA!']} paso={0.11} />
      </div>
      <div className="border-tinta grid gap-8 border-t pt-6 min-[961px]:grid-cols-[1.3fr_1fr] min-[961px]:grid-rows-[auto_1fr] min-[961px]:gap-x-16 min-[961px]:gap-y-5 min-[961px]:pt-8">
        <h1
          aria-label="La ciudadanía diseña. El Estado administra. La política ejecuta."
          className="anim-fadeup font-anton min-w-0 text-[clamp(32px,4.5vw,64px)] leading-[1.08] tracking-[.005em] min-[961px]:col-start-1 min-[961px]:row-start-1"
          style={{ animationDelay: '0.15s' }}
        >
          <span className="block">
            La ciudadanía <span className="text-violeta">diseña.</span>
          </span>
          <span className="block">El Estado administra.</span>
          <span className="block">La política ejecuta.</span>
        </h1>
        <div
          className="anim-fadeup border-tinta min-w-0 border-t pt-6 min-[961px]:col-start-2 min-[961px]:row-span-2 min-[961px]:row-start-1 min-[961px]:border-l min-[961px]:border-t-0 min-[961px]:pl-8 min-[961px]:pt-0"
          style={{ animationDelay: '0.25s' }}
        >
          <EscribirIdeal />
        </div>
        <div
          className="anim-fadeup min-w-0 min-[961px]:col-start-1 min-[961px]:row-start-2"
          style={{ animationDelay: '0.2s' }}
        >
          <p className="text-tinta-75 max-w-[540px] text-pretty text-[18px] leading-relaxed">
            ¡BASTA! es un lugar para imaginar entre todos cómo podría ser la Argentina. Contás qué
            querrías que fuera posible en tu vida y se suma a lo que cuentan otras personas.
          </p>
          <Link
            href="/la-idea"
            className="font-space text-violeta mt-3 inline-flex min-h-11 items-center text-xs underline underline-offset-4"
          >
            Cómo funciona →
          </Link>
        </div>
      </div>
    </section>
  );
}
