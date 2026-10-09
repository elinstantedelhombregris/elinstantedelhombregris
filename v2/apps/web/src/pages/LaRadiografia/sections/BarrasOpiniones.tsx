import { useState } from 'react';

import { porcentajeDe, RESPUESTAS_MINIMAS_PARA_DECIMALES } from '../radiografia-data';

import type { DisenoFicha } from '@v2/shared';

import { cuantos } from '~/lib/vocabulario';

type Afirmacion = DisenoFicha['afirmaciones'][number];

/** Las tres respuestas posibles, si el desglose se puede publicar. */
function desglose(f: Afirmacion) {
  if (f.acuerdo === null || f.desacuerdo === null || f.paso === null) return null;
  return [
    { clave: 'acuerdo', rotulo: 'De acuerdo', n: f.acuerdo, relleno: 'bg-tinta' },
    { clave: 'desacuerdo', rotulo: 'En desacuerdo', n: f.desacuerdo, relleno: 'bg-violeta' },
    { clave: 'paso', rotulo: 'Pasaron', n: f.paso, relleno: 'bg-tinta-30' },
  ] as const;
}

/**
 * Cómo respondió la gente a cada afirmación: una barra apilada de acuerdo,
 * desacuerdo y pase, con la cantidad de respuestas SIEMPRE a la vista.
 *
 * Sólo agregados publicados. No reconstruye cuentas ni posiciones individuales.
 * Antes mostraba una medida por vez («Acuerdos» / «Desacuerdos» / «Pases») con
 * «60,0 %» sobre cinco respuestas y sin el n a la vista (revisión del 9/10).
 */
export function BarrasOpiniones({ afirmaciones }: { afirmaciones: DisenoFicha['afirmaciones'] }) {
  const [ordenar, setOrdenar] = useState(false);
  const filas = ordenar
    ? [...afirmaciones].sort(
        (a, b) =>
          (b.acuerdo === null ? -1 : b.acuerdo / Math.max(1, b.respuestas)) -
          (a.acuerdo === null ? -1 : a.acuerdo / Math.max(1, a.respuestas)),
      )
    : afirmaciones;
  return (
    <section aria-labelledby="barras-opiniones-titulo" className="border-tinta mt-6 border-2">
      <div className="border-tinta border-b p-5">
        <p className="font-space text-xs uppercase tracking-[0.1em]">La respuesta es el dato</p>
        <h3 id="barras-opiniones-titulo" className="font-anton mt-2 text-2xl">
          Cómo respondieron a cada afirmación
        </h3>
        <p className="text-tinta-75 mt-2 max-w-[70ch] text-[15px] leading-relaxed">
          Más acuerdo no vuelve cierta una afirmación ni obliga a hacer nada.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-5 p-5 text-sm">
        <button
          type="button"
          aria-pressed={ordenar}
          onClick={() => {
            setOrdenar(!ordenar);
          }}
          className="min-h-11 underline"
        >
          {ordenar ? 'Volver al orden de la conversación' : 'Ordenar por porcentaje de acuerdo'}
        </button>
        <p className="text-tinta-50">Se cuentan respuestas, no personas verificadas.</p>
      </div>
      <ul className="divide-papel-borde divide-y border-t">
        {filas.map((f) => {
          const partes = desglose(f);
          const pocas = f.respuestas < RESPUESTAS_MINIMAS_PARA_DECIMALES;
          return (
            <li key={f.id} className="p-5">
              <p className="leading-relaxed">{f.texto}</p>
              {partes === null ? (
                <p className="text-tinta-50 mt-3 text-sm">
                  {cuantos(f.respuestas, 'respuesta', 'respuestas', true)}; el desglose público
                  espera al menos cinco.
                </p>
              ) : (
                <>
                  <div
                    className="border-papel-borde bg-papel-presionado mt-3 flex h-4 w-full overflow-hidden border"
                    role="img"
                    aria-label={`${partes
                      .map(
                        (p) =>
                          `${p.rotulo}: ${String(p.n)} de ${String(f.respuestas)} (${porcentajeDe(p.n, f.respuestas)})`,
                      )
                      .join('. ')}.`}
                  >
                    {partes.map((p) => (
                      <div
                        key={p.clave}
                        className={`${p.relleno} h-full transition-[width] duration-300 motion-reduce:transition-none`}
                        style={{ width: `${String((p.n * 100) / Math.max(1, f.respuestas))}%` }}
                      />
                    ))}
                  </div>
                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {partes.map((p) => (
                      <div key={p.clave} className="flex items-center gap-2">
                        <span aria-hidden className={`${p.relleno} inline-block h-3 w-3`} />
                        <dt className="text-tinta-75">{p.rotulo}</dt>
                        <dd className="font-space">
                          {p.n} · {porcentajeDe(p.n, f.respuestas)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-tinta-50 mt-2 text-sm">
                    {cuantos(f.respuestas, 'respuesta', 'respuestas', true)}
                    {pocas ? ' · pocas respuestas: leé estos números con cuidado' : ''}.
                  </p>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
