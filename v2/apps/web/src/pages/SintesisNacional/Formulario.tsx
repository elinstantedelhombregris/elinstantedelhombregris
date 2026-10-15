import { useMutation } from '@tanstack/react-query';
import {
  contenidoSintesisNacionalSchema,
  type ContenidoSintesisNacional,
  type CrearSintesisNacional,
} from '@v2/shared';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';

import { ElegirResultado } from './ElegirResultado';
import { VACIA, CAMPOS, DETALLES } from './formulario-campos';

import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth/csrf';
import { useVisionCompartida } from '~/lib/queries/deliberacion';

export function FormularioSintesis({
  anteriorId = null,
  inicial = VACIA,
}: {
  anteriorId?: string | null;
  inicial?: ContenidoSintesisNacional;
}) {
  const [v, setV] = useState(inicial),
    [error, setError] = useState(''),
    [idLocal, setIdLocal] = useState(() => crypto.randomUUID());
  const [, navegar] = useLocation();
  const q = useVisionCompartida();
  const fichas = q.data?.pages.flatMap((p) => p.fichas) ?? [];
  const cambiar = (v: ContenidoSintesisNacional) => {
    setV(v);
    setIdLocal(crypto.randomUUID());
    setError('');
  };
  const m = useMutation({
    mutationFn: (body: CrearSintesisNacional) =>
      api.post<{ id: string }>('/api/v1/sintesis-nacional', body, { csrfToken: readCsrfToken() }),
    onSuccess: (r) => {
      navegar(`/sintesis-nacional/${r.id}`);
    },
  });
  return (
    <form
      className="mt-6 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const r = contenidoSintesisNacionalSchema.safeParse(v);
        if (!r.success) {
          setError(r.error.issues[0]?.message ?? 'Revisá el formulario.');
          return;
        }
        m.mutate({ idLocal, anteriorId, contenido: r.data });
      }}
    >
      <p>
        Guardá una edición para que otra persona editora de todas las fichas seleccionadas la
        revise. Podés invitarla desde cada ficha. Hasta entonces, solo sus equipos pueden leerla.
        Tus permisos y las versiones se comprueban al guardar.
      </p>
      <fieldset disabled={m.isPending} className="space-y-5">
        <label className="grid gap-2 font-semibold">
          Título
          <input
            required
            minLength={10}
            maxLength={160}
            className="border-tinta w-full border bg-transparent p-3 font-normal"
            value={v.titulo}
            onChange={(e) => {
              cambiar({ ...v, titulo: e.target.value });
            }}
          />
        </label>
        {CAMPOS.map(([k, label, hint]) => (
          <label key={k} className="grid gap-2 font-semibold">
            {label}
            <span className="text-sm font-normal">{hint}</span>
            <textarea
              required
              minLength={10}
              maxLength={k === 'metodo' || k === 'ausencias' ? 3000 : 2000}
              rows={3}
              className="border-tinta w-full border bg-transparent p-3 font-normal"
              value={v[k]}
              onChange={(e) => {
                cambiar({ ...v, [k]: e.target.value });
              }}
            />
          </label>
        ))}
        <label className="grid gap-2 font-semibold">
          Fecha de próxima revisión
          <input
            required
            className="border-tinta w-full max-w-xs border bg-transparent p-3 font-normal"
            type="date"
            value={v.proximaRevision}
            onChange={(e) => {
              cambiar({ ...v, proximaRevision: e.target.value });
            }}
          />
        </label>
        <section aria-label="Selección de objetivos">
          <h2 className="font-anton text-3xl">Elegí hasta doce objetivos</h2>
          <p className="mt-2">
            Se conserva la versión que elegís. Si una ficha cambia, la edición deberá revisarse de
            nuevo.
          </p>
          {q.isPending && <p>Cargando objetivos…</p>}
          {q.isError && (
            <p role="alert">
              No pudimos consultar las fichas.{' '}
              <button type="button" className="min-h-11 underline" onClick={() => void q.refetch()}>
                Reintentar
              </button>
            </p>
          )}
          <ul className="mt-4 space-y-3">
            {fichas.map((f) => (
              <li key={f.id}>
                <p className="font-semibold">
                  <Link className="underline" href={`/fichas/${f.id}`}>
                    {f.titulo}
                  </Link>{' '}
                  · revisión {f.revision}
                </p>
                {!f.objetivos.length && (
                  <p className="text-sm">Todavía no tiene objetivos verificables.</p>
                )}
                {f.objetivos.map((o) => {
                  const seleccionada = v.referencias.some(
                    (r) => r.fichaId === f.id && r.objetivoId === o.id,
                  );
                  return (
                    <label className="flex min-h-11 items-center gap-2" key={o.id}>
                      <input
                        type="checkbox"
                        checked={seleccionada}
                        disabled={!seleccionada && v.referencias.length >= 12}
                        onChange={(e) => {
                          cambiar({
                            ...v,
                            referencias: e.target.checked
                              ? [
                                  ...v.referencias,
                                  {
                                    fichaId: f.id,
                                    objetivoId: o.id,
                                    revision: f.revision,
                                    tipo: 'propuesta',
                                    resultadoCampo: null,
                                    variantes: '',
                                    recursos: '',
                                    alternativas: '',
                                    tensiones: '',
                                    tarea: '',
                                  },
                                ]
                              : v.referencias.filter(
                                  (r) => r.fichaId !== f.id || r.objetivoId !== o.id,
                                ),
                          });
                        }}
                      />
                      {o.titulo}
                    </label>
                  );
                })}
              </li>
            ))}
          </ul>
          {q.hasNextPage && (
            <button
              type="button"
              className="min-h-11 underline"
              disabled={q.isFetchingNextPage}
              onClick={() => void q.fetchNextPage()}
            >
              Cargar más fichas
            </button>
          )}
        </section>
        {v.referencias.map((r, i) => {
          const actualizar = (cambio: Partial<typeof r>) => {
            cambiar({
              ...v,
              referencias: v.referencias.map((a, j) => (j === i ? { ...a, ...cambio } : a)),
            });
          };
          return (
            <fieldset
              className="border-tinta/40 space-y-4 border p-4"
              key={`${r.fichaId}/${r.objetivoId}`}
            >
              <legend className="px-2 font-semibold">
                Objetivo {i + 1}:{' '}
                {fichas
                  .find((f) => f.id === r.fichaId)
                  ?.objetivos.find((o) => o.id === r.objetivoId)?.titulo ??
                  'Objetivo de la edición anterior'}
              </legend>
              <p>
                Versión de ficha citada: {r.revision}.{' '}
                <Link className="underline" href={`/fichas/${r.fichaId}`}>
                  Consultar el proceso original
                </Link>
                .
              </p>
              <label className="grid gap-2">
                Qué sustenta esta lectura
                <select
                  className="border-tinta w-full border bg-transparent p-3"
                  value={r.tipo}
                  onChange={(e) => {
                    actualizar({ tipo: e.target.value as typeof r.tipo, resultadoCampo: null });
                  }}
                >
                  <option value="propuesta">Propuesta sin acuerdo atribuido</option>
                  <option value="acuerdo_participantes">
                    Acuerdos publicados en el proceso de la ficha
                  </option>
                  <option value="hecho_revisado">Resultado de campo revisado</option>
                </select>
              </label>
              {r.tipo === 'hecho_revisado' && (
                <ElegirResultado
                  referencia={r}
                  cambiar={(resultadoCampo) => {
                    actualizar({ resultadoCampo });
                  }}
                />
              )}
              {DETALLES.map(([k, label]) => (
                <label key={k} className="grid gap-2">
                  {label}
                  <textarea
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={3}
                    className="border-tinta w-full border bg-transparent p-3"
                    value={r[k]}
                    onChange={(e) => {
                      actualizar({ [k]: e.target.value });
                    }}
                  />
                </label>
              ))}
              <button
                type="button"
                className="min-h-11 underline"
                onClick={() => {
                  cambiar({ ...v, referencias: v.referencias.filter((_, j) => j !== i) });
                }}
              >
                Quitar este objetivo
              </button>
            </fieldset>
          );
        })}
      </fieldset>
      {(error || m.error) && (
        <p role="alert">{error || m.error?.message} El formulario conserva lo que escribiste.</p>
      )}
      <button
        disabled={m.isPending}
        className="border-tinta min-h-11 border px-5 py-3 font-semibold disabled:opacity-40"
        type="submit"
      >
        {m.isPending ? 'Guardando…' : 'Guardar edición para revisión'}
      </button>
    </form>
  );
}
