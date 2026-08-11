import { PORTADA } from '../quien-data';

import { Kicker, RitoTinta } from '~/components/papel/primitives';

/** § 0 — Portada: el rito de la tinta abre con la mano que plantó, no con la persona. */
export function PortadaQuien() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-14 pt-[72px] min-[961px]:px-10">
      <Kicker className="anim-fadeup mb-5">{PORTADA.kicker}</Kicker>
      <h1
        aria-label={PORTADA.titulo.join(' ')}
        className="font-anton riso-hover mb-6 text-[clamp(48px,7vw,104px)] leading-[0.98]"
      >
        <RitoTinta lineas={PORTADA.titulo} />
      </h1>
      <p
        className="anim-fadeup text-tinta-75 max-w-[640px] text-pretty text-[19px] leading-[1.6]"
        style={{ animationDelay: '0.9s' }}
      >
        {PORTADA.bajada}
      </p>
    </section>
  );
}
