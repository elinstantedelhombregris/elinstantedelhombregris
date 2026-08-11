import { FICHA, FICHA_CIERRE, RETRATO } from '../quien-data';

import { FotoPapel } from '~/components/papel/primitives';

/**
 * § 1 — El retrato y la ficha de expediente. La última fila («Acá — ningún
 * cargo») es el remate: la ficha enumera lo que Juan es en todos lados y
 * termina diciendo lo que no es acá.
 */
export function LaFicha() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-20 min-[961px]:px-10">
      <div className="grid grid-cols-[minmax(0,340px)_1fr] items-start gap-12 max-[760px]:grid-cols-1 max-[760px]:gap-8">
        <FotoPapel
          src={RETRATO.src}
          archivo={RETRATO.archivo}
          alt={RETRATO.alt}
          epigrafe={RETRATO.epigrafe}
          proporcion="retrato"
        />

        <div>
          <dl className="border-papel-borde m-0 border-t">
            {FICHA.map((fila) => (
              <div
                key={fila.etiqueta}
                className="border-papel-borde grid grid-cols-[110px_1fr] items-baseline gap-5 border-b py-4 max-[560px]:grid-cols-1 max-[560px]:gap-1.5"
              >
                <dt className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.14em]">
                  {fila.etiqueta}
                </dt>
                <dd className="text-tinta m-0 text-pretty text-[17px] leading-snug">
                  {fila.valor}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-tinta-75 mt-7 max-w-[520px] text-pretty text-[17px] leading-relaxed">
            {FICHA_CIERRE}
          </p>
        </div>
      </div>
    </section>
  );
}
