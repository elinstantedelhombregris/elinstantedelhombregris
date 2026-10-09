import { Link } from 'wouter';

import type { CampanaPublica } from '@v2/shared';

import { FASES_ROTULO } from '~/components/participacion/constantes';
import { fechaDeRegistro } from '~/components/participacion/fechas';

/** Las ediciones de la campaña y por qué cambió cada una. */
export function HistorialCampana({ campana: c }: { campana: CampanaPublica }) {
  return (
    <details className="border-tinta mt-9 border p-5">
      <summary className="cursor-pointer font-semibold">
        Historia de la campaña y de sus reglas
      </summary>
      <ol className="mt-5 space-y-4 text-sm">
        {c.historial.map((h) => (
          <li key={h.revision}>
            {h.estado === 'borrador' ? (
              <>Edición {h.revision}</>
            ) : (
              <Link className="underline" href={`/campanas/${c.slug}?edicion=${h.revision}`}>
                Leer la edición {h.revision}
              </Link>
            )}{' '}
            · {FASES_ROTULO[h.estado]}
            <p className="text-tinta-75 mt-1">
              {h.motivo} · {fechaDeRegistro(h.fecha)}
            </p>
          </li>
        ))}
      </ol>
    </details>
  );
}
