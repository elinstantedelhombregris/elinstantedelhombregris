import type { Magnitud } from '@v2/civic-core';

/**
 * Un número de titular con su procedencia debajo.
 *
 * La procedencia no es letra chica: es la mitad del contrato de honestidad del
 * motor (spec §3.1). Un número sin decir de dónde salió es exactamente lo que
 * vuelve indefendible un simulador entero.
 */
export function Cifra({
  etiqueta,
  magnitud,
  formato,
}: {
  etiqueta: string;
  magnitud: Magnitud;
  formato: (v: number) => string;
}) {
  const { procedencia } = magnitud;
  const explica =
    procedencia.tipo === 'derivado'
      ? procedencia.formula
      : procedencia.tipo === 'medido'
        ? `Medido: ${procedencia.fuente}`
        : `Declarado: ${procedencia.palanca}`;

  return (
    <div className="border-oscuro-borde border-t py-2">
      <p className="font-space text-oscuro-meta text-[10px] uppercase tracking-[0.14em]">
        {etiqueta}
      </p>
      <p className="text-papel font-anton text-[22px] leading-none">{formato(magnitud.valor)}</p>
      <p className="text-oscuro-tenue mt-1 text-[10px] leading-snug">{explica}</p>
    </div>
  );
}
