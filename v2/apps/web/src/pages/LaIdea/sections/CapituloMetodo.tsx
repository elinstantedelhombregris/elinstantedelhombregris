import { Fragment } from 'react';
import { Link } from 'wouter';

import { CICLO, PLAN_COUNT, ROLES } from '../la-idea-data';

import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
import { cn } from '~/lib/utils';

const CHIP_ACENTO: Record<'violeta' | 'verde', string> = {
  violeta: 'bg-violeta text-papel border-violeta',
  verde: 'bg-verde text-papel border-verde',
};

/** Capítulo II — el método (absorbe la v1 /la-vision: Ackoff + tres roles + la prueba). */
export function CapituloMetodo() {
  return (
    <section id="capitulo-ii" className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
      <Kicker className="mb-5">Capítulo II</Kicker>
      <h2 className="font-anton riso-hover mb-4 text-[clamp(36px,4.6vw,64px)] leading-none">
        El método: tres roles que no se mezclan
      </h2>
      <div className="text-tinta-75 max-w-[620px] text-[17px] leading-relaxed">
        <p className="mb-4 text-pretty">
          La política argentina fracasa por un error de diseño: una sola casta hace los tres
          trabajos. Decide qué país quiere, lo administra y se controla a sí misma. Acá los
          tres roles se separan — y no se vuelven a mezclar.
        </p>
        <p className="mb-10 text-pretty">
          El método tiene nombre: diseño idealizado. Cuando un sistema falla en todo, no se
          lo emparcha — se lo dibuja de nuevo, como si empezara hoy. No prometemos arreglar
          lo viejo: dibujamos lo nuevo hasta que volver atrás quede en ridículo.
        </p>
      </div>

      {ROLES.map((rol) => (
        <div
          key={rol.num}
          className="border-tinta grid grid-cols-[90px_1fr] gap-7 border-t py-[30px] max-[560px]:grid-cols-1 max-[560px]:gap-2"
        >
          <span className="font-space text-tinta-50 text-sm">{rol.num}</span>
          <div>
            <h3 className="font-anton mb-3 text-[clamp(28px,3.4vw,44px)] leading-none">
              {rol.a} <span className="text-violeta">{rol.b}</span>
            </h3>
            <p className="text-tinta-75 max-w-[640px] text-pretty text-base leading-relaxed">
              {rol.body}
            </p>
          </div>
        </div>
      ))}

      <div className="border-tinta bg-papel-crudo mt-8 border p-9">
        <Kicker color="tinta" className="mb-5">
          El ciclo completo
        </Kicker>
        <div className="flex flex-wrap items-center gap-2.5">
          {CICLO.map((paso, i) => (
            <Fragment key={paso.label}>
              {i > 0 ? <span className="font-space text-tinta-30 text-sm">→</span> : null}
              <span
                className={cn(
                  'font-space border-tinta border px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.06em]',
                  paso.acento && CHIP_ACENTO[paso.acento],
                )}
              >
                {paso.label}
              </span>
            </Fragment>
          ))}
          <span className="font-space text-tinta-30 text-sm">↺</span>
        </div>
        <p className="text-tinta-50 mt-5 text-sm leading-relaxed">
          El ciclo no tiene última vuelta: las voces nuevas ajustan el mandato, el mandato
          ajusta los planes, y la ejecución se audita a la vista de todos. Después vuelve a
          girar.
        </p>
      </div>

      <div className="border-tinta mt-14 flex flex-wrap items-center justify-between gap-6 border-t pt-8">
        <div className="flex max-w-[680px] flex-wrap items-start gap-5">
          <Sello color="rojo" rotate={-4}>
            No es doctrina
          </Sello>
          <p className="text-tinta-75 min-w-[260px] flex-1 text-pretty text-base leading-relaxed">
            ¿Suena imposible? Ya está escrito. Un ciudadano común redactó {PLAN_COUNT} planes
            de país — más PLANRUTA, el que explica cómo se arranca. No son doctrina: son la
            prueba de que cualquiera puede. Imaginate lo que sale de millones.
          </p>
        </div>
        <BotonPapel asChild variant="fantasma">
          <Link href="/planes">Ver la prueba: los planes →</Link>
        </BotonPapel>
      </div>
    </section>
  );
}
