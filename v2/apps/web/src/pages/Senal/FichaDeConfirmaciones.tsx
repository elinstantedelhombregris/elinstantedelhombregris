import type { ConfirmacionPublica } from '~/lib/queries/senales';

import { METODOS_EN_CASTELLANO, VEREDICTOS_EN_CASTELLANO } from '~/lib/vocabulario';

/**
 * Quiénes la miraron — sin decir quiénes.
 *
 * Ésa es la línea entera de esta pantalla: se publica **qué se hizo y con qué
 * método**, nunca quién lo hizo. Ni un seudónimo, ni un avatar, ni un contador
 * por persona que permita seguirle el rastro a alguien de señal en señal. El
 * actor existe para poder contar personas distintas, no para exhibirlas.
 *
 * Las que NO suman al umbral se muestran igual, marcadas. Esconderlas daría una
 * ficha más limpia y una lectura falsa: alguien miró y dijo algo, y el hecho de
 * que su método no pese para el umbral es información, no un motivo para
 * borrarlo.
 */
export interface FichaDeConfirmacionesProps {
  readonly confirmaciones: readonly ConfirmacionPublica[];
}

const rotuloDe = (lista: readonly { clave: string; rotulo: string }[], clave: string): string =>
  lista.find((x) => x.clave === clave)?.rotulo ?? clave;

export function FichaDeConfirmaciones({ confirmaciones }: FichaDeConfirmacionesProps) {
  return (
    <>
      <ul className="border-tinta border-t-2">
        {confirmaciones.map((c, i) => (
          <li
            key={`${c.creadaEn}-${String(i)}`}
            className="border-papel-borde flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b py-3"
          >
            <span className="font-space text-tinta text-[13px] font-bold">
              {rotuloDe(VEREDICTOS_EN_CASTELLANO, c.veredicto)}
            </span>
            <span className="font-space text-tinta-50 text-[12px]">
              {rotuloDe(METODOS_EN_CASTELLANO, c.metodo)}
            </span>
            {c.cuenta ? null : (
              <span className="font-space text-tinta-50 border-tinta-25 border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em]">
                no suma
              </span>
            )}
            <span className="font-space text-tinta-50 ml-auto text-[11px] tabular-nums">
              {new Date(c.creadaEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </span>
          </li>
        ))}
      </ul>

      <p className="font-space text-tinta-50 mt-3 max-w-[60ch] text-[11px] leading-relaxed">
        No decimos quién miró, y no lo vamos a decir. Lo que se publica es qué se hizo y con qué
        método — el identificador existe para poder contar personas distintas, no para mostrarlas.
      </p>
    </>
  );
}
