import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { CURSO_COUNT, LECCION_COUNT } from '~/lib/courses-registry';

/** § 1 de la spec — portada del catálogo, rito de la tinta en el H1. */
export function PortadaEntrenamientos() {
  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-12 pt-16 max-[560px]:px-5">
      <Kicker className="anim-fadeup mb-4">Entrenamientos · sin cuenta, sin costo</Kicker>
      <h1
        aria-label="Entrená la mirada."
        className="font-anton riso-hover mb-5 text-[clamp(44px,6vw,88px)] leading-[0.98]"
      >
        <RitoTinta lineas={['Entrená', 'la mirada.']} />
      </h1>
      <p
        className="anim-fadeup text-tinta-75 max-w-[620px] text-pretty text-[17px] leading-[1.6]"
        style={{ animationDelay: '0.9s' }}
      >
        {CURSO_COUNT} entrenamientos, {LECCION_COUNT} lecciones, en criollo y sin jerga. No hay
        cuenta que crear ni examen que aprobar: entrá al que te sirva y usalo.
      </p>
      <p
        className="anim-fadeup text-tinta-50 mt-3 max-w-[620px] text-pretty text-[15px] leading-[1.6]"
        style={{ animationDelay: '1.05s' }}
      >
        Nada de esto se guarda: leé en el orden que quieras, cortá cuando quieras, volvé cuando
        quieras.
      </p>
    </section>
  );
}
