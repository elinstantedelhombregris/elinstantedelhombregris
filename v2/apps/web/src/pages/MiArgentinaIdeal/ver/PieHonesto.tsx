import { REGLAS_DE_VISION } from '@v2/civic-core';

import { deCadaDiez } from './formato';

/**
 * El pie que va siempre (spec §5): qué mide esto y qué no, y las reglas en lenguaje llano.
 * Los números salen de `REGLAS_DE_VISION`, las mismas que aplica el servidor.
 */
export function PieHonesto() {
  const R = REGLAS_DE_VISION;
  return (
    <footer className="border-tinta flex flex-col gap-2 border-t-2 pt-4">
      <p className="font-bold">
        Esto es lo que dijeron quienes participaron. No es una encuesta del país.
      </p>
      <p className="text-tinta-50 text-[13.5px]">
        Una persona decidida puede responder desde dos teléfonos. Esto mide a quienes participaron,
        no a la Argentina.
      </p>
      <details className="group">
        <summary className="font-space text-tinta focus-visible:outline-violeta flex min-h-11 cursor-pointer list-none items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
          <span aria-hidden className="group-open:rotate-90 motion-safe:transition-transform">
            ›
          </span>
          Cómo se cuenta
        </summary>
        <div className="text-tinta-75 flex flex-col gap-2 text-[13.5px] leading-relaxed">
          <p>
            Un aporte entra en la visión con al menos {R.MINIMO_OPINIONES} opiniones («Yo también» o
            «Yo no») y al menos dos regiones con cinco o más.
          </p>
          <p>
            «Lo que nos une» pide {deCadaDiez(R.ACUERDO_QUE_UNE)} de cada 10 en cada una de esas
            regiones, y se ordena por la región donde el aporte anda peor.
          </p>
          <p>
            «Lo que va primero» cuenta cuántas veces se elige un aporte cuando se lo compara con
            otro que también se quiere. Entran los que tienen {R.MINIMO_COMPARACIONES} comparaciones
            o más y {deCadaDiez(R.ACUERDO_PARA_PRIORIDAD)} de cada 10 opiniones a favor. Al puntaje
            se le suma uno arriba y dos abajo, para que dos comparaciones ganadas no encabecen la
            lista.
          </p>
          <p>
            «Donde no coincidimos» junta lo que parte al medio (entre {deCadaDiez(R.DIVIDE_DESDE)} y{' '}
            {deCadaDiez(R.DIVIDE_HASTA)} de cada 10) y lo que en una región se quiere y en otra no,
            con {Math.round(R.DIVIDE_DISTANCIA * 100)} puntos de diferencia o más.
          </p>
          <p>
            Los «Paso» se cuentan, pero no entran en los porcentajes. Una región con menos de cinco
            opiniones en un aporte no muestra porcentaje, y una provincia con menos de cinco
            personas no muestra su número.
          </p>
          <p>
            Las regiones son NOA, NEA, Cuyo, Centro (con La Pampa), Buenos Aires (provincia y
            Ciudad) y Patagonia.
          </p>
        </div>
      </details>
    </footer>
  );
}
