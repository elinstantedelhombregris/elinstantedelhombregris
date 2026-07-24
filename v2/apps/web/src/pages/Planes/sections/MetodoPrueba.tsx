
import { Link } from 'wouter';

import { PLAN_COUNT } from '../la-prueba-data';

import type { ReactNode } from 'react';

import { BotonPapel } from '~/components/papel/primitives';

interface MetodoCard {
  titulo: string;
  body: ReactNode;
}

/** § 4 — El método (banda papel-crudo, grilla de 3) + § 5 — CTA final. */
export function MetodoPrueba() {
  const cards: readonly MetodoCard[] = [
    {
      titulo: '¿Falta un plan?',
      body: (
        <>
          Seguro: son {PLAN_COUNT} y el país es infinito. Marcá el hueco —{' '}
          <Link href="/el-mapa" className="text-violeta font-semibold">
            soltá tu urgencia en el mapa
          </Link>{' '}
          y el próximo lo escribís vos.
        </>
      ),
    },
    {
      titulo: 'Método Ackoff',
      body: 'Diseño idealizado: no se pregunta qué se puede arreglar — se pregunta qué construiríamos hoy de cero. Después, el camino de vuelta.',
    },
    {
      titulo: 'Hechos para ser superados',
      body: 'El mejor destino de estos documentos es quedar viejos. Cada voz nueva los corrige; si el mandato los contradice, ganan las voces.',
    },
  ];

  return (
    <section className="bg-papel-crudo border-tinta border-t">
      <div className="mx-auto max-w-[1440px] px-10 py-14 max-[560px]:px-5">
        <div className="grid grid-cols-3 gap-10 max-[960px]:grid-cols-1">
          {cards.map((card) => (
            <div key={card.titulo}>
              <h2 className="font-anton mb-2.5 text-[22px]">{card.titulo}</h2>
              <p className="text-tinta-50 text-sm leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <BotonPapel asChild variant="violeta">
            <Link href="/el-mapa">Soltá tu urgencia en el mapa →</Link>
          </BotonPapel>
        </div>
      </div>
    </section>
  );
}
