import { Link } from 'wouter';

import { BotonPapel, Kicker, RitoTinta } from '~/components/papel/primitives';
import { despertar } from '~/lib/despertar';

export function HeroBasta() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 pb-12 pt-7 min-[961px]:px-10 min-[961px]:pt-10">
      <div className="border-tinta font-space text-tinta-50 flex items-start justify-between gap-5 border-b pb-3 text-[10px] uppercase tracking-[.12em] min-[561px]:text-[11px]">
        <span>Argentina · una idea de país</span>
        <span className="hidden min-[561px]:inline">Sin líder · Sin partido · Sin excusas</span>
      </div>
      <div aria-hidden className="riso-hover font-anton py-5 text-center text-[clamp(70px,19vw,280px)] leading-[.94] tracking-[.005em] min-[961px]:py-7">
        <RitoTinta lineas={['¡BASTA!']} paso={0.11} />
      </div>
      <div className="border-tinta grid gap-8 border-t pt-6 min-[961px]:grid-cols-[1.3fr_1fr] min-[961px]:gap-16 min-[961px]:pt-8">
        <div className="anim-fadeup min-w-0" style={{ animationDelay: '0.15s' }}>
          <h1 aria-label="La ciudadanía diseña. El Estado administra. La política ejecuta." className="font-anton text-[clamp(32px,4.5vw,64px)] leading-[1.08] tracking-[.005em]">
            <span className="block">La ciudadanía <span className="text-violeta">diseña.</span></span>
            <span className="block">El Estado administra.</span>
            <span className="block">La política ejecuta.</span>
          </h1>
          <p className="text-tinta-75 mt-5 hidden max-w-[540px] text-pretty text-[18px] leading-relaxed min-[961px]:block">
            Quienes vivimos el país también podemos imaginarlo. Darle forma a lo que queremos,
            ordenar lo que tenemos y hacer realidad lo que acordamos.
          </p>
          <Link href="/la-idea" className="font-space text-violeta mt-3 hidden min-h-11 items-center text-xs underline underline-offset-4 min-[961px]:inline-flex">
            Cómo funciona el ejercicio →
          </Link>
        </div>
        <div className="anim-fadeup border-tinta min-w-0 border-t pt-6 min-[961px]:border-l min-[961px]:border-t-0 min-[961px]:pl-8 min-[961px]:pt-0" style={{ animationDelay: '0.25s' }}>
          <Kicker className="mb-4">El primer trazo es tuyo</Kicker>
          <h2 className="font-anton max-w-[450px] text-[clamp(27px,2.7vw,38px)] leading-[1.12]">
            En tu Argentina ideal, ¿qué sería posible en tu vida?
          </h2>
          <p className="text-tinta-75 mt-4 max-w-[410px] text-pretty text-base leading-relaxed">
            Una frase alcanza para empezar.<span className="hidden min-[961px]:inline"> Puede ser algo que quieras aprender, cuidar, crear o compartir con otros.</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <BotonPapel asChild variant="violeta" className="motion-reduce:transform-none">
              <Link href="/el-mapa?participar=imaginar#instrumento" onClick={despertar}>Imaginar mi Argentina</Link>
            </BotonPapel>
            <Link href="/el-mapa" className="font-space text-tinta-75 inline-flex min-h-11 items-center text-xs underline underline-offset-4">Explorar el país ↗</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
