import { useState } from 'react';

import type { DisenoFicha } from '@v2/shared';

const METRICAS = [
  { clave: 'acuerdo', titulo: 'Acuerdos' },
  { clave: 'desacuerdo', titulo: 'Desacuerdos' },
  { clave: 'paso', titulo: 'Pases' },
] as const;
type Metrica = (typeof METRICAS)[number]['clave'];

/** Sólo agregados publicados. No reconstruye cuentas ni posiciones individuales. */
export function BarrasOpiniones({ afirmaciones }: { afirmaciones: DisenoFicha['afirmaciones'] }) {
  const [metrica, setMetrica] = useState<Metrica>('acuerdo');
  const [porcentaje, setPorcentaje] = useState(true);
  const [ordenar, setOrdenar] = useState(false);
  const valor = (f: DisenoFicha['afirmaciones'][number]) =>
    f[metrica] === null
      ? null
      : porcentaje
        ? ((f[metrica] ?? 0) * 100) / Math.max(1, f.respuestas)
        : f[metrica];
  const filas = ordenar
    ? [...afirmaciones].sort((a, b) => (valor(b) ?? -1) - (valor(a) ?? -1))
    : afirmaciones;
  const maximo = porcentaje ? 100 : Math.max(1, ...afirmaciones.map((f) => f[metrica] ?? 0));
  return (
    <section aria-label="Gráfico de respuestas explícitas" className="border-tinta mt-6 border-2">
      <div className="border-tinta flex flex-wrap items-end justify-between gap-4 border-b p-5">
        <div>
          <p className="font-space text-xs uppercase tracking-[0.1em]">La respuesta es el dato</p>
          <h3 className="font-anton mt-2 text-2xl">Una afirmación. Miradas distintas.</h3>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Medida de las respuestas">
          {METRICAS.map((m) => (
            <button
              key={m.clave}
              type="button"
              aria-pressed={metrica === m.clave}
              onClick={() => {
                setMetrica(m.clave);
              }}
              className={`font-space border-tinta min-h-11 border px-3 text-xs ${metrica === m.clave ? 'bg-tinta text-papel' : ''}`}
            >
              {m.titulo}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5 p-5 text-sm">
        <button
          type="button"
          aria-pressed={porcentaje}
          onClick={() => {
            setPorcentaje(!porcentaje);
          }}
          className="min-h-11 underline"
        >
          {porcentaje ? 'Ver cantidades' : 'Ver porcentaje de respuestas'}
        </button>
        <button
          type="button"
          aria-pressed={ordenar}
          onClick={() => {
            setOrdenar(!ordenar);
          }}
          className="min-h-11 underline"
        >
          {ordenar ? 'Restaurar orden de la conversación' : 'Ordenar por esta medida'}
        </button>
        <p className="text-tinta-50">
          {porcentaje
            ? 'Porcentaje de respuestas a cada afirmación; no de la población.'
            : 'Cantidad de respuestas a cada afirmación; no personas verificadas.'}
        </p>
      </div>
      <ul className="divide-papel-borde divide-y border-t">
        {filas.map((f) => {
          const medida = valor(f);
          return (
            <li key={f.id} className="p-5">
              <p className="leading-relaxed">{f.texto}</p>
              {medida === null ? (
                <p className="text-tinta-50 mt-3 text-sm">
                  {f.respuestas} respuestas; el desglose público espera al menos cinco.
                </p>
              ) : (
                <>
                  <div className="mt-3 flex items-center gap-4">
                    <div
                      className="bg-papel-presionado border-papel-borde h-4 flex-1 border"
                      role="img"
                      aria-label={`${METRICAS.find((m) => m.clave === metrica)?.titulo ?? ''}: ${porcentaje ? medida.toFixed(1) + ' %' : String(medida)} de ${f.respuestas} respuestas`}
                    >
                      <div
                        className="bg-tinta h-full transition-[width] duration-300 motion-reduce:transition-none"
                        style={{ width: `${Math.min(100, (medida * 100) / maximo)}%` }}
                      />
                    </div>
                    <span className="font-space min-w-16 text-right text-sm">
                      {porcentaje ? medida.toFixed(1).replace('.', ',') + ' %' : medida}
                    </span>
                  </div>
                  <p className="text-tinta-50 mt-3 text-sm">
                    {f.acuerdo} acuerdos · {f.desacuerdo ?? '—'} desacuerdos · {f.paso ?? '—'} pases
                    · {f.respuestas} respuestas.
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
