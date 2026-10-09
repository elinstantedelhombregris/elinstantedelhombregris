import { fechaCampana } from '../presentacion';

import type { CampanaPublica } from '@v2/shared';

export function Recorrido({ campana: c }: { campana: CampanaPublica }) {
  return (
    <section className="mt-10" aria-labelledby="recorrido-campana">
      <h2 id="recorrido-campana" className="font-anton text-3xl">
        Las etapas de la campaña
      </h2>
      <ol className="border-tinta/25 mt-6 border-t">
        {c.contrato.fases.map((f, i) => (
          <li
            key={`${i}-${f.nombre}`}
            className="border-tinta/25 grid gap-4 border-b py-6 sm:grid-cols-[60px_1fr_190px]"
          >
            <span className="font-anton text-violeta text-3xl" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-anton text-2xl">
                <span className="sr-only">Etapa {i + 1}: </span>
                {f.nombre}
              </h3>
              <p className="mt-3 text-sm leading-relaxed">{f.salida}</p>
            </div>
            <p className="text-tinta-50 text-sm">Para el {fechaCampana(f.fecha)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
