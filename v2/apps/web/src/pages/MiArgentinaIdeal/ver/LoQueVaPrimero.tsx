import { REGLAS_DE_VISION } from '@v2/civic-core';

import { deCadaDiez, numero } from './formato';
import { Seccion, Vacio } from './piezas';

import type { PrioridadEnVision } from '@v2/shared';

/** Entre lo que se quiere, el orden que sale de los duelos de Mirar. Llegan ordenados. */
export function LoQueVaPrimero({ primero }: { primero: PrioridadEnVision[] }) {
  const R = REGLAS_DE_VISION;
  return (
    <Seccion
      titulo="Lo que va primero"
      bajada="Entre lo que se quiere, lo que la gente elige cuando tiene que ordenar."
    >
      {primero.length === 0 ? (
        <Vacio>
          Para ordenar hace falta comparar. Un aporte entra acá cuando se lo comparó{' '}
          {R.MINIMO_COMPARACIONES} veces con otros que también se quieren y tiene{' '}
          {deCadaDiez(R.ACUERDO_PARA_PRIORIDAD)} de cada 10 opiniones a favor. Las comparaciones
          salen de Mirar, cuando la pila pregunta cuál va primero.
        </Vacio>
      ) : (
        <ol className="flex flex-col">
          {primero.map((a, i) => (
            <li
              key={a.id}
              className="border-papel-borde grid grid-cols-[34px_1fr] gap-2 border-b py-3 last:border-b-0"
            >
              <span aria-hidden className="font-anton text-tinta-50 text-[30px] leading-none">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1.5">
                <p className="font-archivo text-[17px] font-semibold leading-[1.32]">«{a.texto}»</p>
                <p className="text-tinta-50 text-[13.5px] tabular-nums">
                  Cuando se compara con otro que también se quiere, va primero{' '}
                  {deCadaDiez(a.puntaje)} de cada 10 veces · {numero(a.comparaciones)} comparaciones
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Seccion>
  );
}
