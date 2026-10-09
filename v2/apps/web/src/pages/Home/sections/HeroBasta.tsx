import { Link } from 'wouter';

import { BotonPapel } from '~/components/papel/primitives';
import { despertar } from '~/lib/despertar';

export function HeroBasta() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-10 pt-10 min-[961px]:px-10">
      <div className="font-space text-tinta-50 flex flex-wrap justify-between gap-3 border-y py-3 text-[11px] uppercase tracking-[.12em]">
        <span>Argentina · diseño ciudadano</span>
        <span>Un ejercicio abierto de diseño idealizado</span>
      </div>
      <p
        aria-label="¡BASTA!"
        className="font-anton mt-7 text-[clamp(70px,12vw,150px)] leading-none"
      >
        <span className="text-violeta">¡</span>BASTA<span className="text-violeta">!</span>
      </p>
      <h1 className="font-anton mt-7 max-w-[900px] text-[clamp(38px,5.6vw,70px)] leading-[1.06]">
        Diseñemos la Argentina
        <br className="hidden sm:block" /> que queremos vivir.
      </h1>
      <p className="mt-6 max-w-[670px] text-[clamp(18px,2vw,23px)] leading-relaxed">
        En tu Argentina ideal, ¿qué sería posible en tu vida?
      </p>
      <p className="text-tinta-75 mt-4 max-w-[670px] leading-relaxed">
        Una frase alcanza para empezar. Después podemos encontrar las condiciones que la sostienen,
        conversar con otros y poner los diseños a prueba. La ciudadanía tiene algo propio que decir
        sobre su futuro.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <BotonPapel asChild variant="violeta">
          <Link href="/imaginar" onClick={despertar}>
            Imaginar mi Argentina
          </Link>
        </BotonPapel>
        <BotonPapel asChild variant="fantasma">
          <Link href="/el-mapa">Explorar el país</Link>
        </BotonPapel>
      </div>
      <Link
        href="/la-idea"
        className="text-violeta mt-4 inline-flex min-h-11 items-center underline"
      >
        Cómo funciona el ejercicio →
      </Link>
    </section>
  );
}
