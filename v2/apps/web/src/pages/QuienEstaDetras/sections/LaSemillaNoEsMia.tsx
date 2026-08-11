import { Link } from 'wouter';

import { CITA_BAJADA, CITA_LA_IDEA, PROHIBICIONES, PROHIBICIONES_CIERRE } from '../quien-data';

import { Kicker, Sello } from '~/components/papel/primitives';

/**
 * § 5 — El corazón de la página: la tensión con «sin líder» resuelta de
 * frente. No es una declaración de modestia (no se puede verificar): son
 * cinco cosas que Juan NO puede hacer, y cada una se puede auditar.
 *
 * Abre citando textualmente a `/la-idea` — el sitio ya se había comprometido
 * a esto antes de que existiera esta página, y acá lo firma alguien.
 */
export function LaSemillaNoEsMia() {
  return (
    <section className="bg-papel-crudo border-papel-borde border-y">
      <div className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
        <Kicker className="mb-5">§ 05 — La semilla no es mía</Kicker>

        <blockquote className="border-violeta m-0 mb-12 max-w-[760px] border-l-2 pl-6">
          {/* Sin comillas angulares: Anton no tiene glifo para « » y las
              dibuja como << >>. El filete violeta ya dice que es una cita. */}
          <p className="font-anton text-tinta m-0 text-pretty text-[clamp(24px,3.1vw,40px)] leading-[1.12]">
            {CITA_LA_IDEA.texto}
          </p>
          <cite className="font-space text-tinta-50 mt-3 block text-[11px] uppercase not-italic tracking-[0.14em]">
            <Link href={CITA_LA_IDEA.href} className="hover:text-tinta transition-colors">
              {CITA_LA_IDEA.fuente} →
            </Link>
          </cite>
        </blockquote>

        <p className="text-tinta-75 mb-10 max-w-[640px] text-pretty text-[19px] leading-[1.7]">
          {CITA_BAJADA}
        </p>

        <ol className="m-0 grid list-none grid-cols-2 gap-px bg-papel-borde p-0 max-[760px]:grid-cols-1">
          {PROHIBICIONES.map((item) => (
            <li key={item.num} className="bg-papel-crudo p-7">
              <div className="mb-4 flex items-center gap-4">
                <span className="font-space text-tinta-30 text-sm">{item.num}</span>
                <Sello color="rojo" rotate={-2} className="border-2 px-2.5 py-1.5 text-[11px]">
                  {item.sello}
                </Sello>
              </div>
              <p className="text-tinta-75 m-0 text-pretty text-[15px] leading-relaxed">
                {item.cuerpo}
              </p>
            </li>
          ))}
          {/* La grilla es de dos columnas y las prohibiciones son cinco: el
              hueco final se deja vacío a propósito (§ el vacío como pieza). */}
          <li aria-hidden className="bg-papel-crudo max-[760px]:hidden" />
        </ol>

        <p className="text-tinta mt-10 max-w-[640px] text-pretty text-[17px] leading-relaxed">
          {PROHIBICIONES_CIERRE}
        </p>
      </div>
    </section>
  );
}
