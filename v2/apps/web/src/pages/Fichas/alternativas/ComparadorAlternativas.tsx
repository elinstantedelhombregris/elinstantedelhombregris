import { useState } from 'react';

import { CAMPOS_DETALLE } from './detalle';

import type { DisenoFicha } from '@v2/shared';

export function ComparadorAlternativas({
  alternativas,
}: {
  alternativas: DisenoFicha['alternativas'];
}) {
  const [ids, setIds] = useState<string[]>([]);
  const elegidas = alternativas.filter((a) => ids.includes(a.id));
  if (alternativas.length < 2)
    return (
      <p className="mt-4 text-sm">
        Para comparar hacen falta al menos dos alternativas. Podés incluir mantener la situación
        actual como referencia.
      </p>
    );
  const filas: { titulo: string; valores: string[] }[] = [
    { titulo: 'Cómo funcionaría', valores: elegidas.map((a) => a.funcionamiento) },
    { titulo: 'Resultado propuesto', valores: elegidas.map((a) => a.resultado) },
    ...CAMPOS_DETALLE.map(([k, titulo]) => ({
      titulo,
      valores: elegidas.map((a) => (a.detalle?.[k] ?? '') || 'Pendiente de documentar.'),
    })),
    {
      titulo: 'Costo estimado',
      valores: elegidas.map((a) =>
        a.detalle?.costo != null
          ? `${a.detalle.costo.toLocaleString('es-AR')} ${a.detalle.costoUnidad}`
          : 'Pendiente de estimar.',
      ),
    },
    { titulo: 'Plazo', valores: elegidas.map((a) => a.detalle?.plazo ?? 'Pendiente de acordar.') },
    {
      titulo: 'Dependencias',
      valores: elegidas.map((a) => a.dependencias || 'Pendiente de documentar.'),
    },
    { titulo: 'Criterio para detener o rediseñar', valores: elegidas.map((a) => a.criterioPausa) },
  ];
  return (
    <details className="border-tinta mt-5 border p-4">
      <summary className="min-h-11 cursor-pointer font-semibold underline">
        Comparar alternativas por las mismas dimensiones
      </summary>
      <p className="my-3">
        Elegí entre dos y cuatro propuestas. Las diferencias no se reducen a una puntuación; revisá
        a quién beneficia y a quién podría perjudicar cada una.
      </p>
      <fieldset>
        <legend className="sr-only">Alternativas a comparar</legend>
        {alternativas.map((a) => (
          <label className="my-2 flex min-h-11 items-center gap-3" key={a.id}>
            <input
              type="checkbox"
              checked={ids.includes(a.id)}
              disabled={!ids.includes(a.id) && ids.length >= 4}
              onChange={(e) => {
                setIds(e.target.checked ? [...ids, a.id] : ids.filter((id) => id !== a.id));
              }}
            />
            {a.titulo}
            {a.detalle?.situacionActual ? ' · situación actual' : ''}
          </label>
        ))}
      </fieldset>
      {elegidas.length < 2 ? (
        <p role="status">Seleccioná al menos dos alternativas.</p>
      ) : (
        <div
          role="region"
          aria-label="Comparación de alternativas"
          tabIndex={0}
          className="mt-5 overflow-x-auto"
        >
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="mb-3 text-left">
              Comparación de propuestas, con datos declarados y pendientes visibles.
            </caption>
            <thead>
              <tr>
                <th className="border p-3" scope="col">
                  Dimensión
                </th>
                {elegidas.map((a) => (
                  <th className="min-w-48 border p-3" scope="col" key={a.id}>
                    {a.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.titulo}>
                  <th scope="row" className="border p-3">
                    {fila.titulo}
                  </th>
                  {fila.valores.map((valor, i) => (
                    <td className="border p-3 align-top" key={i}>
                      {valor}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="border p-3">
                  Fuente del costo
                </th>
                {elegidas.map((a) => (
                  <td className="border p-3" key={a.id}>
                    {a.detalle?.fuenteCosto ? (
                      <a
                        className="inline-flex min-h-11 underline"
                        href={a.detalle.fuenteCosto}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Consultar fuente
                      </a>
                    ) : (
                      'Fuente pendiente.'
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
}
