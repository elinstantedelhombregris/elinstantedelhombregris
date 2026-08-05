import { Link } from 'wouter';

import { PLAN_COUNT } from '../la-prueba-data';

import { Kicker, RitoTinta, Sello } from '~/components/papel/primitives';

/** § 1 — Portada + callout «No es doctrina» (spec 2.4). */
export function PortadaPrueba() {
  return (
    <section className="mx-auto max-w-[1440px] px-10 pb-12 pt-16 max-[560px]:px-5">
      <Kicker className="anim-fadeup mb-4">El ejemplo · {PLAN_COUNT} planes · un solo autor</Kicker>
      <h1
        aria-label="Esto lo escribió uno solo."
        className="font-anton riso-hover mb-5 text-[clamp(44px,6vw,88px)] leading-[0.98]"
      >
        <RitoTinta lineas={['Esto lo escribió', 'uno solo.']} />
      </h1>
      <p
        className="anim-fadeup text-tinta-75 max-w-[640px] text-pretty text-[17px] leading-[1.6]"
        style={{ animationDelay: '0.9s' }}
      >
        {PLAN_COUNT} planes de país — salud, escuelas, tierra, moneda, justicia — escritos por un
        hombre gris cualquiera. Son ejemplos de lo que podríamos producir, no el programa. Cada uno
        parte de la misma pregunta: si esto se pudiera diseñar de cero, ¿cómo sería? Y del mismo
        método: primero el ideal, después el camino de vuelta.
      </p>

      <div className="border-sello anim-fadeup mt-9 flex flex-wrap items-center gap-7 border-2 px-8 py-7">
        <Sello color="rojo">No es doctrina</Sello>
        <p className="text-tinta-90 min-w-[280px] flex-1 text-pretty text-[15px] leading-[1.6]">
          Nada de esto se firma ni se obedece. Se publica como ejemplo: para inspirar, y para
          levantar la vara de la discusión que estamos teniendo. Si uno solo pudo diseñar esto,
          millones diseñan mejor. Leelos para criticarlos, mejorarlos o reemplazarlos — el programa
          real lo escriben las{' '}
          <Link href="/el-mapa" className="text-violeta font-semibold">
            voces del mapa
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
