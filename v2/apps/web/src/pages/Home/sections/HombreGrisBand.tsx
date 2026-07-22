import { Link } from 'wouter';

import { TALLIES } from '../landing-data';

import { BotonPapel, Kicker } from '~/components/papel/primitives';

/**
 * § 02 — El origen. Banda gris con los tally marks: 45 millones de grises,
 * contados a mano (palitos, no barras — firma award §10.6).
 */
export function HombreGrisBand() {
  return (
    <section className="bg-oscuro-meta text-tinta">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 items-center gap-14 px-5 py-[72px] max-[960px]:grid-cols-1 min-[961px]:px-10">
        <div>
          <Kicker color="papel" className="mb-5">
            § 02 — El origen
          </Kicker>
          <h2 className="font-anton mb-5 text-[clamp(40px,4.4vw,64px)] leading-[1.02]">
            ¿Quién es el
            <br />
            hombre gris?
          </h2>
          <p className="mb-3 max-w-[460px] text-pretty text-[17px] leading-relaxed">
            Sos vos, un martes cualquiera. El que trabaja, paga, aguanta y calla. El que cree que su
            voz no cambia nada — hasta el instante en que deja de creerlo.
          </p>
          <p className="mb-7 max-w-[460px] text-[17px] font-semibold leading-relaxed">
            Ese instante tiene nombre.
          </p>
          <BotonPapel asChild variant="tinta" className="inline-block px-[26px] py-4 text-xs">
            <Link href="/el-instante-del-hombre-gris">Leer el capítulo I</Link>
          </BotonPapel>
        </div>

        <div className="flex flex-col gap-2.5">
          <div aria-hidden className="flex flex-wrap content-start gap-1.5">
            {TALLIES.map((t, i) => (
              <span
                key={i}
                className="inline-block w-1"
                style={{
                  height: `${t.alto}px`,
                  transform: `rotate(${t.rot}deg)`,
                  background: t.color,
                }}
              />
            ))}
          </div>
          <div className="font-space text-papel text-[11px] uppercase tracking-[0.1em]">
            45 millones de grises. Alcanza uno que despierte por día.
          </div>
        </div>
      </div>
    </section>
  );
}
