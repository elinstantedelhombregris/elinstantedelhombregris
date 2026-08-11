import { INTERESES, QUE_GANO_CIERRE, QUE_GANO_TITULO } from '../quien-data';

import { Kicker } from '~/components/papel/primitives';

/**
 * § 7 — La contracara de «Quién paga esto»: ahí se contesta quién financia,
 * acá por qué lo hace igual. Tres intereses declarados en primera persona,
 * y un cierre que los ata a la prohibición 04: ninguno se sirve cobrando de
 * esta plataforma — los tres se sirven si el país funciona.
 *
 * El interés propio dicho en voz alta se puede auditar; el altruismo
 * prometido, no. Por eso esta franja existe.
 */
export function QueGanoYo() {
  return (
    <section className="bg-papel-crudo border-papel-borde border-y">
      <div className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
        <Kicker className="mb-5">§ 07 — Qué gano yo con esto</Kicker>
        <h2 className="font-anton riso-hover mb-12 max-w-[820px] text-[clamp(32px,4.2vw,58px)] leading-[1.02]">
          {QUE_GANO_TITULO}
        </h2>

        <ol className="bg-papel-borde m-0 grid list-none grid-cols-3 gap-px p-0 max-[860px]:grid-cols-1">
          {INTERESES.map((interes) => (
            <li key={interes.num} className="bg-papel-crudo p-7">
              <span className="font-space text-tinta-30 mb-4 block text-sm">{interes.num}</span>
              <h3 className="font-anton text-tinta mb-3 text-[24px] leading-none">
                {interes.titulo}
              </h3>
              <p className="text-tinta-75 m-0 text-pretty text-[16px] leading-relaxed">
                {interes.cuerpo}
              </p>
            </li>
          ))}
        </ol>

        <p className="border-violeta text-tinta mt-10 max-w-[680px] text-pretty border-l-2 pl-6 text-[18px] leading-relaxed">
          {QUE_GANO_CIERRE}
        </p>
      </div>
    </section>
  );
}
