import { PLATA, PLATA_CIERRE, PLATA_TITULO } from '../quien-data';

import { Kicker } from '~/components/papel/primitives';

/**
 * § 6 — La plata. Tres columnas: de dónde sale, quién NO lo financia, a
 * dónde va. La columna del medio es la que importa en Argentina, y por eso
 * es la única que enumera ausencias.
 *
 * Sin cifras inventadas: lo que todavía no tiene número lleva el centinela
 * `PENDIENTE` del data file, nunca un valor de relleno.
 */
export function QuienPaga() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
      <Kicker className="mb-5">§ 06 — Quién paga esto</Kicker>
      <h2 className="font-anton riso-hover mb-12 max-w-[760px] text-[clamp(32px,4.2vw,58px)] leading-[1.02]">
        {PLATA_TITULO}
      </h2>

      <div className="grid grid-cols-3 gap-px bg-papel-borde max-[860px]:grid-cols-1">
        {PLATA.map((columna) => (
          <div key={columna.titulo} className="bg-papel p-7">
            <h3 className="font-space text-tinta-50 mb-5 text-[11px] font-bold uppercase tracking-[0.14em]">
              {columna.titulo}
            </h3>
            <ul className="m-0 list-none p-0">
              {columna.filas.map((fila) => (
                <li
                  key={fila}
                  className="border-papel-borde text-tinta border-b py-3 text-pretty text-[16px] leading-snug last:border-b-0"
                >
                  {fila}
                </li>
              ))}
            </ul>
            {columna.nota === undefined ? null : (
              <p className="font-space text-tinta-50 mt-5 text-[11px] uppercase tracking-[0.12em]">
                {columna.nota}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="text-tinta-75 mt-10 max-w-[640px] text-pretty text-[17px] leading-relaxed">
        {PLATA_CIERRE}
      </p>
    </section>
  );
}
