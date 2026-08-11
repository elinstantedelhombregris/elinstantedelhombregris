import { FOTO_DOCUMENTAL_2, TRAYECTORIA, TRAYECTORIA_TITULO } from '../quien-data';

import { FotoPapel, Kicker } from '~/components/papel/primitives';

/**
 * § 3 — La trayectoria como índice de expediente, no como CV: numeración
 * mono, un renglón de título y un párrafo. Sin logos, sin bullets, sin
 * fechas inventadas — el orden es narrativo y el número lo dice todo.
 */
export function DeDondeVengo() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
      <Kicker className="mb-5">§ 03 — De dónde vengo</Kicker>
      <h2 className="font-anton riso-hover mb-12 max-w-[760px] text-[clamp(32px,4.2vw,58px)] leading-[1.02]">
        {TRAYECTORIA_TITULO}
      </h2>

      <div className="grid grid-cols-[1fr_minmax(0,380px)] items-start gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-10">
        <ol className="border-papel-borde m-0 list-none border-t p-0">
          {TRAYECTORIA.map((fila) => (
            <li
              key={fila.num}
              className="border-papel-borde grid grid-cols-[56px_1fr] items-baseline gap-5 border-b py-6 max-[560px]:grid-cols-1 max-[560px]:gap-2"
            >
              <span className="font-space text-tinta-30 text-sm">{fila.num}</span>
              <div>
                <h3 className="font-anton text-tinta mb-2 text-[26px] leading-none">
                  {fila.titulo}
                </h3>
                <p className="text-tinta-75 m-0 text-pretty text-[16px] leading-relaxed">
                  {fila.cuerpo}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <FotoPapel
          src={FOTO_DOCUMENTAL_2.src}
          archivo={FOTO_DOCUMENTAL_2.archivo}
          alt={FOTO_DOCUMENTAL_2.alt}
          epigrafe={FOTO_DOCUMENTAL_2.epigrafe}
          proporcion="apaisada"
          className="sticky top-24 max-[900px]:static"
        />
      </div>
    </section>
  );
}
