import { CRONICA_COUNT, DESDE } from '../bitacora-data';

import { Kicker, RitoTinta } from '~/components/papel/primitives';

/**
 * El índice (spec 3.4) — portada del índice, rito de la tinta en el H1.
 *
 * El lead NO lleva conteo: «N crónicas enteras» se leía como colección
 * cerrada y la bitácora se sigue escribiendo. El número vivo queda donde
 * es dato de índice y no promesa: el kicker de acá arriba.
 */
export function PortadaBitacora() {
  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-12 pt-16 max-[560px]:px-5">
      <Kicker className="anim-fadeup mb-4">
        La bitácora · {CRONICA_COUNT} crónicas · desde {DESDE}
      </Kicker>
      <h1
        aria-label="Acá se escribe mientras pasa."
        className="font-anton riso-hover mb-5 text-[clamp(44px,6vw,88px)] leading-[0.98]"
      >
        <RitoTinta lineas={['Acá se escribe', 'mientras pasa.']} />
      </h1>
      <p
        className="anim-fadeup text-tinta-75 max-w-[620px] text-pretty text-[17px] leading-[1.6]"
        style={{ animationDelay: '0.9s' }}
      >
        Lo que se piensa, lo que se prueba y lo que todavía no cierra. Crónicas enteras, sin
        registro y sin recorte. Están en orden, pero se leen en cualquiera.
      </p>
    </section>
  );
}
