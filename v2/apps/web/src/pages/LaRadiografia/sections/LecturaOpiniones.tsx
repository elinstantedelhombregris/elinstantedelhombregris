import { useState } from 'react';
import { Link } from 'wouter';

import { BarrasOpiniones } from './BarrasOpiniones';

import { CAMPO } from '~/components/participacion/constantes';
import { useFichas } from '~/lib/queries/fichas';
import { useDisenoFicha } from '~/lib/queries/participacion';

export function LecturaOpiniones({ filtros }: { filtros: Record<string, string> }) {
  const territorio = Number(filtros.territorio);
  const fichas = useFichas(
    Number.isSafeInteger(territorio) && territorio > 0 ? territorio : undefined,
    filtros.campana,
  );
  const [elegida, setElegida] = useState('');
  const lista = fichas.data?.fichas ?? [];
  const id = lista.some((f) => f.id === elegida) ? elegida : (lista[0]?.id ?? '');
  return (
    <section
      id="acuerdos"
      aria-labelledby="lectura-opiniones"
      className="bg-papel text-tinta mt-12 border p-6"
    >
      <h2 id="lectura-opiniones" className="font-anton text-4xl">
        Acuerdos y diferencias.
      </h2>
      <p className="mt-4 max-w-[75ch] leading-relaxed">
        La cercanía entre textos abre preguntas. El acuerdo necesita respuestas explícitas. Elegí
        una ficha para examinar su conversación y el alcance de esta lectura.
      </p>
      <p className="text-tinta-50 mt-3 text-sm leading-relaxed">
        La campaña y el territorio filtran las fichas disponibles. Los filtros de fecha, tema,
        edición y tipo de señal de arriba pertenecen al grafo de textos; no recortan las respuestas
        de una ficha ni convierten dos conversaciones distintas en una sola matriz.
      </p>
      {fichas.isLoading ? (
        <p role="status" className="mt-4">
          Buscando conversaciones…
        </p>
      ) : fichas.isError ? (
        <p role="alert" className="mt-4">
          No pudimos consultar las fichas. Una lectura fallida no significa que nadie haya
          respondido.
        </p>
      ) : lista.length ? (
        <>
          <label className="mt-6 block">
            Conversación que vamos a leer
            <select
              className={CAMPO}
              value={id}
              onChange={(e) => {
                setElegida(e.target.value);
              }}
            >
              {lista.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titulo}
                </option>
              ))}
            </select>
          </label>
          <p className="text-tinta-50 mt-3 text-sm">
            {lista.length} fichas disponibles de {fichas.data?.total ?? 0} en este catálogo. Cada
            ficha mantiene su alcance.
          </p>
          <Conversacion key={id} id={id} />
        </>
      ) : (
        <p className="mt-5">
          Todavía no hay fichas de futuro en este alcance. Podemos abrir la primera pregunta.
        </p>
      )}
      <Link
        href={`/fichas?${new URLSearchParams({ ...(filtros.territorio ? { lugar: filtros.territorio } : {}), ...(filtros.campana ? { campana: filtros.campana } : {}) }).toString()}`}
        className="text-violeta mt-5 inline-flex min-h-11 items-center underline"
      >
        Explorar las fichas de futuro →
      </Link>
    </section>
  );
}

function Conversacion({ id }: { id: string }) {
  const q = useDisenoFicha(id);
  if (q.isLoading)
    return (
      <p role="status" className="mt-5">
        Leyendo las respuestas explícitas…
      </p>
    );
  if (q.isError || !q.data)
    return (
      <p role="alert" className="mt-5">
        No pudimos leer las respuestas de esta ficha. Podés consultar su proceso desde el enlace
        original.
      </p>
    );
  const d = q.data;
  const a = d.analisisOpiniones;
  return (
    <div className="mt-6">
      <p className="font-space text-violeta text-xs uppercase">
        {a.estado === 'exploratorio'
          ? 'Hipótesis exploratoria'
          : a.estado === 'sin_estructura'
            ? 'Sin grupos distinguibles'
            : 'Estructura insuficiente'}
      </p>
      <p className="mt-3 leading-relaxed">{a.motivo}</p>
      <p className="text-tinta-50 mt-3 text-sm">
        {a.participantes} cuentas con exposición o respuesta · {a.incluidos} incluidas en la
        proyección · {d.afirmaciones.length} afirmaciones públicas.
      </p>
      {d.afirmaciones.length ? <BarrasOpiniones afirmaciones={d.afirmaciones} /> : null}
      {!d.afirmaciones.length ? (
        <p className="mt-5">Todavía no hay afirmaciones públicas en esta conversación.</p>
      ) : null}
      {a.grupos.length ? (
        <section className="mt-7">
          <h3 className="font-anton text-2xl">Condiciones entre grupos de esta lectura</h3>
          <p className="text-tinta-50 mt-3 text-sm">
            {a.grupos.map((g) => `${g.nombre}: ${g.cuentas} cuentas`).join(' · ')}
          </p>
          <ul className="mt-4 space-y-4">
            {a.condiciones.map((c) => (
              <li key={c.afirmacion} className="border p-4">
                <p>
                  {d.afirmaciones.find((f) => f.id === c.afirmacion)?.texto ??
                    'Afirmación no disponible.'}
                </p>
                <p className="mt-3 text-sm">
                  {c.grupos
                    .map(
                      (g) =>
                        `${g.nombre}: ${g.acuerdos === null ? 'desglose reservado por tamaño insuficiente' : `${g.acuerdos} acuerdos de ${g.respuestas ?? '—'} respuestas`}`,
                    )
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <details className="mt-5">
        <summary className="min-h-11 cursor-pointer py-3 underline">
          Método de opiniones y límites
        </summary>
        <p className="mt-3 text-sm leading-relaxed">
          {a.metodo} El pase es una respuesta; un faltante no es acuerdo. Las cuentas no acreditan
          personas únicas. Esta lectura no representa a la población ni autoriza una política. El
          motor es una adaptación propia; no es la implementación oficial de Polis.
        </p>
      </details>
      <Link
        href={`/fichas/${id}`}
        className="text-violeta mt-4 inline-flex min-h-11 items-center underline"
      >
        Abrir la ficha, responder y seguir sus diseños →
      </Link>
    </div>
  );
}
