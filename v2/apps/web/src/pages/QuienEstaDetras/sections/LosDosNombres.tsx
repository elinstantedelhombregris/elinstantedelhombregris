import { NOMBRES } from '../quien-data';

import { Kicker, RitoTinta, Sello } from '~/components/papel/primitives';

/**
 * § 4 — Sección oscura: de dónde salieron los dos nombres. Es el momento
 * grave de la página (la psicografía habla de sangre en la calle) y por eso
 * corta a fondo tinta. El remate no es la profecía sino la tarea que deja.
 */
export function LosDosNombres() {
  return (
    <section className="bg-tinta text-papel">
      <div className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
        <Kicker color="papel" className="text-violeta-claro mb-5">
          {NOMBRES.kicker}
        </Kicker>
        <h2
          aria-label={NOMBRES.titulo.join(' ')}
          className="font-anton riso-hover mb-14 text-[clamp(30px,3.9vw,54px)] leading-[1.04]"
        >
          <RitoTinta lineas={NOMBRES.titulo} tono="claro" />
        </h2>

        <div className="bg-oscuro-borde border-oscuro-borde grid grid-cols-2 gap-px border max-[860px]:grid-cols-1">
          {[NOMBRES.basta, NOMBRES.hombreGris].map((bloque) => (
            <div key={bloque.sello} className="bg-tinta p-8 min-[861px]:p-10">
              <Sello color="rojo" rotate={-3} className="mb-6 border-2 px-2.5 py-1.5 text-[11px]">
                {bloque.sello}
              </Sello>
              {bloque.parrafos.map((parrafo) => (
                <p
                  key={parrafo}
                  className="text-oscuro-secundario text-pretty text-[16px] leading-relaxed [&+&]:mt-4"
                >
                  {parrafo}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
