import { Link } from 'wouter';

import { useDespierto } from '~/lib/despertar';

/** Letras del rito de la tinta: se entintan una por una (firma award §10.1). */
const LETRAS: readonly { char: string; delay: string }[] = [
  { char: 'B', delay: '0.15s' },
  { char: 'A', delay: '0.35s' },
  { char: 'S', delay: '0.55s' },
  { char: 'T', delay: '0.75s' },
  { char: 'A', delay: '0.95s' },
];

export function HeroBasta() {
  const despierto = useDespierto();

  return (
    <section className="relative mx-auto max-w-[1440px] px-5 pt-14 min-[961px]:px-10">
      <div className="border-tinta font-space text-tinta-50 flex items-start justify-between gap-6 border-b pb-3.5 text-[11px] uppercase tracking-[0.16em]">
        <span>Argentina · 2026</span>
        <span className="hidden min-[1141px]:inline">Sin líder · Sin partido · Sin excusas</span>
        <span>Exp. ciudadano N° 001</span>
      </div>

      <h1
        aria-label="¡BASTA!"
        className="riso-hover font-anton mt-6 flex items-baseline justify-center text-[clamp(120px,17.5vw,300px)] leading-[0.94] tracking-[0.005em] max-[960px]:text-[21vw]"
      >
        <span aria-hidden className="contents">
          <span className="anim-vpop text-violeta" style={{ animationDelay: '1.5s' }}>
            ¡
          </span>
          {LETRAS.map(({ char, delay }, i) => (
            <span key={`${char}-${i}`} className="anim-inkfill" style={{ animationDelay: delay }}>
              {char}
            </span>
          ))}
          <span className="anim-vpop text-violeta" style={{ animationDelay: '1.65s' }}>
            !
          </span>
        </span>
      </h1>

      {!despierto ? (
        <div className="border-oscuro-meta font-space text-tinta-50 mt-[18px] border border-dashed px-4 py-2.5 text-center text-[11px] uppercase tracking-[0.14em]">
          El sitio está en gris — se enciende con tu primera acción
        </div>
      ) : null}

      <div className="border-tinta mt-5 grid grid-cols-[1.1fr_0.9fr] items-end gap-10 border-t pb-12 pt-7 max-[960px]:grid-cols-1">
        <p
          className="anim-fadeup max-w-[560px] text-pretty text-[clamp(20px,2vw,27px)] font-medium leading-[1.35]"
          style={{ animationDelay: '1.1s' }}
        >
          La palabra que millones de argentinos piensan en silencio. Dicha en voz alta, junta,
          alcanza para diseñar un país nuevo.{' '}
          <span className="text-tinta-50">
            Acá no seguís a nadie: la ciudadanía diseña, el Estado administra, la política ejecuta.
          </span>
        </p>
        <div
          className="anim-fadeup flex flex-wrap justify-end gap-3 max-[960px]:justify-start"
          style={{ animationDelay: '1.3s' }}
        >
          <Link
            href="/el-mapa"
            className="bg-violeta font-space text-papel hover:bg-tinta px-7 py-[18px] text-[13px] font-bold uppercase tracking-[0.08em] transition-all duration-200 hover:-translate-y-0.5"
          >
            Dejar mi voz en el mapa
          </Link>
          <Link
            href="/la-vision"
            className="border-tinta font-space text-tinta hover:bg-tinta hover:text-papel border px-7 py-[18px] text-[13px] uppercase tracking-[0.08em] transition-colors duration-200"
          >
            Entender la idea
          </Link>
        </div>
      </div>

      <div
        className="anim-stampin border-sello font-space text-sello absolute right-16 top-24 rotate-[-8deg] border-[3px] px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.18em] max-[960px]:hidden"
        style={{ animationDelay: '2s' }}
      >
        El instante es ahora
      </div>
    </section>
  );
}
