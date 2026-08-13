import type { Magnitud, Procedencia } from '@v2/civic-core';

/**
 * La procedencia, en prosa.
 *
 * `hipotesis` ENVUELVE a las otras tres en vez de reemplazarlas, así que se lee
 * recursivamente: la fórmula sigue estando a la vista y arriba de ella queda
 * dicho de qué modelo salió el conteo del que cuelga. Un número de un modelo
 * nunca se muestra igual que uno medido — es la regla 6 en pantalla, y por eso
 * la palabra «hipótesis» va adelante y no en una nota al pie.
 */
function explicar(procedencia: Procedencia): string {
  switch (procedencia.tipo) {
    case 'derivado':
      return procedencia.formula;
    case 'medido':
      return `Medido: ${procedencia.fuente}`;
    case 'declarado':
      return `Declarado: ${procedencia.palanca}`;
    case 'hipotesis':
      return `Hipótesis de ${procedencia.sello.modelo}, no medida — ${explicar(procedencia.sobre)}`;
  }
}

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
  const explica = explicar(magnitud.procedencia);

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
