import { Kicker, RitoTinta } from '~/components/papel/primitives';

/** § 0 — Portada: rito de la tinta en el H1 (todo tinta — decisión 1 de la spec). */
export function PortadaIdea() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-14 pt-[72px] min-[961px]:px-10">
      <Kicker className="anim-fadeup mb-5">La idea · tres capítulos · seis minutos</Kicker>
      <h1
        aria-label="Un país no se hereda. Se diseña."
        className="font-anton riso-hover mb-6 text-[clamp(48px,7vw,104px)] leading-[0.98]"
      >
        <RitoTinta lineas={['Un país no se hereda.', 'Se diseña.']} />
      </h1>
      <p
        className="anim-fadeup text-tinta-75 max-w-[640px] text-pretty text-[19px] leading-[1.6]"
        style={{ animationDelay: '0.9s' }}
      >
        Tres capítulos: quién sos en esta historia, cómo funciona el método, y por qué acá
        nadie viene a salvarte — a propósito.
      </p>
    </section>
  );
}
