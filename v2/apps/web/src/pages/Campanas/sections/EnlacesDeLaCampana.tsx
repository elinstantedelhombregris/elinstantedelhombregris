import { ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';

import type { CampanaPublica } from '@v2/shared';

import { EnlaceAccion } from '~/components/participacion/Elementos';

/** Adónde seguir después de leer la campaña: sus fichas, lo escuchado y los datos. */
export function EnlacesDeLaCampana({ campana: c }: { campana: CampanaPublica }) {
  const alcance = `campana=${c.id}&edicion=${c.revision}`;
  return (
    <section className="border-tinta mt-9 border-t pt-7" aria-labelledby="seguir-construyendo">
      <h2 id="seguir-construyendo" className="font-anton text-3xl">
        Seguir construyendo esta campaña
      </h2>
      <div className="mt-5 flex flex-wrap gap-3">
        <EnlaceAccion secundario href={`/fichas?campana=${c.id}`}>
          Ver las fichas de esta campaña
        </EnlaceAccion>
        <EnlaceAccion secundario href={`/la-radiografia?${alcance}`}>
          Ver lo escuchado en la Radiografía
        </EnlaceAccion>
        <EnlaceAccion secundario href={`/datos-abiertos?${alcance}`}>
          Descargar estos datos
        </EnlaceAccion>
      </div>
      <Link
        href={`/fichas/nueva?campana=${c.id}`}
        className="text-violeta mt-4 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
      >
        Proponer una ficha de futuro
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
