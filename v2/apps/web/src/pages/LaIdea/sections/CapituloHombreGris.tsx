import { BotonPapel, Kicker } from '~/components/papel/primitives';
import { despertar, useDespierto } from '~/lib/despertar';

/**
 * Capítulo I — la identidad (absorbe la v1 /el-instante-del-hombre-gris).
 * Banda gris que se enciende con el despertar: la interacción firma de la
 * página (spec docs/specs/2026-07-22-la-idea-papel-y-tinta.md). AA: sobre
 * el gris #8E8A82 TODO el texto va en tinta plena, nunca tinta-90/75/50.
 */
export function CapituloHombreGris() {
  const despierto = useDespierto();

  return (
    <section
      id="capitulo-i"
      className={`${despierto ? 'bg-papel-crudo' : 'bg-oscuro-meta'} transition-colors duration-1000 motion-reduce:transition-none`}
    >
      <div className="text-tinta mx-auto max-w-[1100px] px-5 py-[72px] min-[961px]:px-10">
        <Kicker color="tinta" className="text-tinta mb-5">
          Capítulo I
        </Kicker>
        <h2 className="font-anton riso-hover mb-7 text-[clamp(36px,4.6vw,64px)] leading-none">
          El instante del hombre gris
        </h2>

        <div className="grid grid-cols-2 gap-10 text-[17px] leading-[1.65] max-[960px]:grid-cols-1">
          <div>
            <p className="mb-4 text-pretty">
              El hombre gris no es un personaje: sos vos a las 7:40, apretado en un tren que
              llega tarde a un trabajo que apenas alcanza. Es la maestra que enseña con
              fotocopias, el médico que atiende sin insumos, la piba que ya averiguó cuánto
              sale irse.
            </p>
            <p className="text-pretty">
              Y una aclaración, porque importa: gris no quiere decir mediocre. El gris es
              todos los colores juntos. Es plata — <em>argentum</em>, el metal que le puso
              nombre a la Argentina. Canas de aguantar, cicatrices que ya no avergüenzan:
              enseñan. Plata, no acero.
            </p>
          </div>
          <div>
            <p className="mb-4 text-pretty">
              Pero hay un instante — uno solo — en que el gris se corta. Una factura que no
              cierra, una sala de espera, una injusticia de más. El instante en que un tipo
              común dice en voz alta la palabra que venía tragando hace años.
            </p>
            <p className="text-pretty font-semibold">
              Ese instante, multiplicado y ordenado con método, es todo esto. No hace falta
              ser héroe. Hace falta decidirse.
            </p>
          </div>
        </div>

        <aside className="border-tinta mt-10 max-w-[720px] border-l-2 pl-6">
          <p className="font-space mb-3 text-[11px] uppercase tracking-[0.16em]">
            Por qué el nombre largo
          </p>
          <p className="mb-3 text-pretty text-[15px] leading-relaxed">
            El proyecto se llama El Instante del Hombre Gris por las psicografías de Solari
            Parravicini sobre la Argentina y su «Hombre Gris». Las leemos como diagnóstico,
            no como profecía: lo que él dibujó entonces es lo que resolvemos ahora.
          </p>
          <blockquote className="text-pretty text-[15px] italic leading-relaxed">
            «Eres un pozo tallado no en piedra, sino en tiempo. Y estás destinado a
            desbordarte.»
          </blockquote>
        </aside>

        <div className="border-tinta bg-papel-crudo mt-11 border p-9 text-center">
          {despierto ? (
            <>
              <div className="font-anton text-violeta anim-vpop text-[clamp(30px,3.6vw,48px)] leading-[1.05]">
                ¡BASTA!
              </div>
              <p className="text-tinta-90 mt-3.5 text-base">
                Eso fue todo. Así de simple empieza. Lo que sigue es método.
              </p>
            </>
          ) : (
            <>
              <p className="font-space mb-4 text-xs uppercase tracking-[0.14em]">
                Esta página está en gris. Como el país. Como vos, hasta hoy.
              </p>
              <BotonPapel variant="tinta" onClick={despertar}>
                Este es mi instante
              </BotonPapel>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
