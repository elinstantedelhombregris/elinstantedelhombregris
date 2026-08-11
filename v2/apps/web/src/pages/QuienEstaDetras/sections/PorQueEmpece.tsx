import { FOTO_DOCUMENTAL_1, POR_QUE } from '../quien-data';

import { FotoPapel, Kicker } from '~/components/papel/primitives';

/**
 * § 2 — La prosa. Columna angosta (640px) y capitular en el primer párrafo:
 * es el único tramo largo de la página y tiene que leerse como una carta.
 * La foto documental entra después del segundo párrafo, donde el texto gira.
 */
export function PorQueEmpece() {
  const [primero, ...resto] = POR_QUE.parrafos;

  return (
    <section className="bg-papel-crudo border-papel-borde border-y">
      <div className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
        <Kicker className="mb-5">{POR_QUE.kicker}</Kicker>
        <h2 className="font-anton riso-hover mb-10 max-w-[880px] text-[clamp(32px,4.2vw,58px)] leading-[1.02]">
          {POR_QUE.titulo}
        </h2>

        <div className="max-w-[640px]">
          <p className="text-tinta text-pretty text-[19px] leading-[1.7] [&::first-letter]:font-anton [&::first-letter]:text-violeta [&::first-letter]:float-left [&::first-letter]:mr-2.5 [&::first-letter]:mt-1 [&::first-letter]:text-[64px] [&::first-letter]:leading-[0.8]">
            {primero}
          </p>

          {resto.slice(0, 1).map((parrafo) => (
            <p key={parrafo} className="text-tinta-75 mt-6 text-pretty text-[19px] leading-[1.7]">
              {parrafo}
            </p>
          ))}
        </div>

        <FotoPapel
          src={FOTO_DOCUMENTAL_1.src}
          archivo={FOTO_DOCUMENTAL_1.archivo}
          alt={FOTO_DOCUMENTAL_1.alt}
          epigrafe={FOTO_DOCUMENTAL_1.epigrafe}
          proporcion="apaisada"
          className="my-12"
        />

        <div className="max-w-[640px]">
          {resto.slice(1).map((parrafo) => (
            <p
              key={parrafo}
              className="text-tinta-75 text-pretty text-[19px] leading-[1.7] [&+&]:mt-6"
            >
              {parrafo}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
