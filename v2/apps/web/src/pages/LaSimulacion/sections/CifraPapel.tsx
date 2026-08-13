import { explicarProcedencia, magnitudEsHipotesis } from '../simulacion-lectura';

import type { Magnitud } from '@v2/civic-core';

/**
 * § Una cifra con su procedencia — el contrato de honestidad hecho componente.
 *
 * Un número sin decir de dónde salió es exactamente lo que vuelve indefendible
 * un simulador entero. Acá la procedencia no es letra chica: ocupa el mismo
 * bloque que la cifra y se lee siempre.
 *
 * **Y una hipótesis de modelo no comparte tratamiento visual con un medido**
 * (regla 6, §7.1.7 de la spec). No alcanza con que el texto lo diga: la barra
 * punteada al costado y el rótulo en rojo sello están para que la diferencia se
 * vea desde lejos, antes de leer. Un derivado se puede rehacer con lápiz; una
 * hipótesis sólo se puede volver a correr y esperar.
 */

export interface CifraPapelProps {
  readonly etiqueta: string;
  readonly magnitud: Magnitud;
  readonly formato: (v: number) => string;
}

export function CifraPapel({ etiqueta, magnitud, formato }: CifraPapelProps) {
  const hipotetica = magnitudEsHipotesis(magnitud);

  return (
    <div
      className={
        hipotetica
          ? 'border-sello border-l-[3px] border-dashed py-2 pl-3'
          : 'border-papel-borde border-l-[3px] py-2 pl-3'
      }
    >
      <p className="font-space text-tinta-50 text-[10px] uppercase tracking-[0.14em]">{etiqueta}</p>
      <p className={`font-anton text-[26px] leading-none ${hipotetica ? 'text-sello' : 'text-tinta'}`}>
        {formato(magnitud.valor)}
      </p>
      {hipotetica ? (
        <p className="font-space text-sello mt-1 text-[10px] font-bold uppercase tracking-[0.14em]">
          Hipótesis · no medida
        </p>
      ) : null}
      <p className="text-tinta-50 mt-1 text-[11px] leading-snug">
        {explicarProcedencia(magnitud.procedencia)}
      </p>
    </div>
  );
}
