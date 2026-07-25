import { CICLO_COUNT, ENSAYO_COUNT } from '../biblioteca-data';

import { Kicker, RitoTinta } from '~/components/papel/primitives';

/** § 1 de la spec — portada del hub, rito de la tinta en el H1. */
export function PortadaBiblioteca() {
  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-12 pt-16 max-[560px]:px-5">
      <Kicker className="anim-fadeup mb-4">La biblioteca · leer también es hacer</Kicker>
      <h1
        aria-label="Papel, tinta y método."
        className="font-anton riso-hover mb-5 text-[clamp(44px,6vw,88px)] leading-[0.98]"
      >
        <RitoTinta lineas={['Papel, tinta', 'y método.']} />
      </h1>
      <p
        className="anim-fadeup text-tinta-75 max-w-[620px] text-pretty text-[17px] leading-[1.6]"
        style={{ animationDelay: '0.9s' }}
      >
        Todo lo que el movimiento piensa está publicado entero: el manifiesto, {ENSAYO_COUNT}{' '}
        ensayos en {CICLO_COUNT} ciclos y la bitácora de lo que va pasando. Sin paywall, sin
        registro. Robate todo.
      </p>
    </section>
  );
}
