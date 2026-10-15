import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useRoute, useSearch } from 'wouter';

import { ESTADOS } from './SintesisNacional/estados';
import { FormularioSintesis } from './SintesisNacional/Formulario';
import { LecturaSintesis } from './SintesisNacional/Lectura';

import type { EdicionSintesisNacional, ListaSintesisNacional } from '@v2/shared';

import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth/csrf';
import { useAuth } from '~/lib/auth/use-auth';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export function SintesisNacional() {
  useTituloDePagina('Síntesis nacional revisada');
  const [, params] = useRoute('/sintesis-nacional/:id');
  const nueva = params?.id === 'nueva',
    id = nueva ? undefined : params?.id;
  const anterior = new URLSearchParams(useSearch()).get('anterior');
  const auth = useAuth(),
    cliente = useQueryClient();
  const [cursor, setCursor] = useState(''),
    [errorDescarga, setErrorDescarga] = useState(''),
    [descargando, setDescargando] = useState(false);
  const clave = [
    'sintesis-nacional',
    nueva ? 'anterior' : id ? 'edicion' : 'lista',
    id ?? (nueva ? anterior : cursor),
    auth.user?.id ?? null,
  ] as const;
  const q = useQuery<EdicionSintesisNacional | ListaSintesisNacional>({
    queryKey: clave,
    enabled: !auth.isLoading && (!nueva || Boolean(anterior)),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: nueva ? false : 30_000,
    queryFn: ({ signal }) =>
      id || nueva
        ? api.get<EdicionSintesisNacional>(`/api/v1/sintesis-nacional/${id ?? anterior ?? ''}`, {
            signal,
          })
        : api.get<ListaSintesisNacional>(
            `/api/v1/sintesis-nacional${cursor ? `?despues=${cursor}` : ''}`,
            { signal },
          ),
  });
  const edicion = !q.isError && q.data && 'id' in q.data ? q.data : null;
  const lista = !q.isError && q.data && 'ediciones' in q.data ? q.data : null;
  const m = useMutation({
    mutationFn: (accion: 'revisar' | 'retirar') =>
      api.post(
        `/api/v1/sintesis-nacional/${id ?? ''}/acciones`,
        { accion },
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['sintesis-nacional'] }),
  });
  const descargar = async () => {
    if (!id) return;
    setErrorDescarga('');
    setDescargando(true);
    try {
      const actual = await api.get<EdicionSintesisNacional>(`/api/v1/sintesis-nacional/${id}`);
      cliente.setQueryData(clave, actual);
      if (actual.estado !== 'revisada' || !actual.contenido)
        throw new Error('La edición cambió o no tiene revisión. Consultá su estado actual.');
      const archivo = {
        ...actual,
        cita: `${window.location.origin}/sintesis-nacional/${id}`,
        advertencia:
          'Selección editorial del equipo participante. La lectura pública aplica retiros posteriores; una copia descargada no se puede revocar.',
      };
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(archivo, null, 2)], { type: 'application/json' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = `sintesis-${id}.json`;
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (e) {
      setErrorDescarga(e instanceof Error ? e.message : 'No pudimos descargar la edición.');
    } finally {
      setDescargando(false);
    }
  };
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-10">
      <p className="text-sm uppercase tracking-widest">Visión de país</p>
      <h1 className="font-anton mt-3 text-5xl">
        {nueva ? 'Preparar una síntesis' : 'Síntesis nacional revisada'}
      </h1>
      <p className="mt-5 text-lg">
        Una lectura de los territorios participantes: objetivos, diferencias, recursos, acuerdos y
        tareas que todavía faltan.
      </p>
      <nav className="mt-4 flex flex-wrap gap-5">
        <Link className="inline-flex min-h-11 items-center underline" href="/vision-compartida">
          Explorar todas las fichas
        </Link>
        <Link
          className="inline-flex min-h-11 items-center underline"
          href="/conciliacion-territorial"
        >
          Comprobar los territorios
        </Link>
        <Link
          className="inline-flex min-h-11 items-center underline"
          href="/sintesis-nacional/ejemplo"
        >
          Ver cómo se usaría
        </Link>
        {(Boolean(id) || nueva) && (
          <Link className="inline-flex min-h-11 items-center underline" href="/sintesis-nacional">
            Ver ediciones
          </Link>
        )}
      </nav>
      {auth.isLoading && <p role="status">Comprobando sesión…</p>}
      {!auth.isLoading && nueva && !auth.user && (
        <p className="mt-6">
          <Link className="underline" href="/login?redirect=/sintesis-nacional/nueva">
            Iniciá sesión
          </Link>{' '}
          para preparar una edición.
        </p>
      )}
      {q.isError && (
        <p className="mt-6" role="alert">
          {q.error.message}{' '}
          <button className="min-h-11 underline" onClick={() => void q.refetch()}>
            Reintentar
          </button>
        </p>
      )}
      {!nueva && q.isPending && (
        <p className="mt-6" role="status">
          Consultando ediciones…
        </p>
      )}
      {nueva && auth.user && (!anterior || (edicion?.contenido && edicion.puedoDerivar)) && (
        <FormularioSintesis
          key={anterior ?? 'nueva'}
          anteriorId={anterior}
          {...(edicion?.contenido ? { inicial: edicion.contenido } : {})}
        />
      )}
      {nueva && anterior && edicion && (!edicion.contenido || !edicion.puedoDerivar) && (
        <p className="mt-6">
          El contenido anterior no se puede reutilizar. Prepará una nueva lectura desde las fichas
          actuales.{' '}
          <Link className="underline" href="/sintesis-nacional/nueva">
            Empezar una nueva edición
          </Link>
          .
        </p>
      )}
      {!nueva && lista && (
        <section className="mt-8">
          <h2 className="font-anton text-3xl">Ediciones disponibles</h2>
          {auth.user && (
            <Link
              className="my-4 inline-flex min-h-11 items-center border px-4"
              href="/sintesis-nacional/nueva"
            >
              Preparar una edición
            </Link>
          )}
          {!lista.ediciones.length && (
            <p className="mt-4">
              Todavía no hay ediciones disponibles para esta consulta. Las fichas pueden seguir
              trabajándose antes de tener una síntesis.
            </p>
          )}
          <ul className="mt-4 space-y-4">
            {lista.ediciones.map((e) => (
              <li className="border-tinta/40 border p-5" key={e.id}>
                <p className="text-sm">{ESTADOS[e.estado]}</p>
                <Link
                  className="mt-2 inline-flex min-h-11 items-center text-xl underline"
                  href={`/sintesis-nacional/${e.id}`}
                >
                  {e.contenido?.titulo ?? 'Referencia de edición con contenido oculto'}
                </Link>
                <p>
                  Creada {new Date(e.creadaEn).toLocaleDateString('es-AR')} por @{e.autor}.
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-5">
            {cursor && (
              <button
                className="min-h-11 underline"
                onClick={() => {
                  setCursor('');
                }}
              >
                Volver al inicio
              </button>
            )}
            {lista.siguiente && (
              <button
                className="min-h-11 underline"
                onClick={() => {
                  setCursor(lista.siguiente ?? '');
                }}
              >
                Ver más ediciones
              </button>
            )}
          </div>
        </section>
      )}
      {!nueva && edicion && (
        <section className="mt-8">
          <LecturaSintesis edicion={edicion} />
          <div className="mt-6 flex flex-wrap gap-4">
            {edicion.puedoRevisar && (
              <button
                disabled={m.isPending}
                className="min-h-11 border px-4 py-3"
                onClick={() => {
                  m.mutate('revisar');
                }}
              >
                Confirmar revisión del equipo
              </button>
            )}
            {edicion.puedoDerivar && edicion.contenido && (
              <Link
                className="inline-flex min-h-11 items-center border px-4"
                href={`/sintesis-nacional/nueva?anterior=${edicion.id}`}
              >
                Preparar otra edición
              </Link>
            )}
            {edicion.estado === 'revisada' && (
              <button
                className="min-h-11 border px-4 py-3"
                disabled={descargando}
                onClick={() => void descargar()}
              >
                Descargar edición citable (JSON)
              </button>
            )}
          </div>
          {edicion.puedoRetirar && (
            <details className="mt-6">
              <summary className="cursor-pointer">Retirar esta edición</summary>
              <p className="mt-2">
                Se ocultará el contenido en esta dirección y sus futuras descargas.
              </p>
              <button
                disabled={m.isPending}
                className="mt-2 min-h-11 underline"
                onClick={() => {
                  m.mutate('retirar');
                }}
              >
                Confirmar retiro
              </button>
            </details>
          )}
          {m.isSuccess && (
            <p className="mt-4" role="status">
              {m.variables === 'retirar'
                ? 'Se retiró el contenido de esta edición.'
                : 'Se registró la revisión del equipo.'}
            </p>
          )}
          {m.error && <p role="alert">{m.error.message}</p>}
          {errorDescarga && <p role="alert">{errorDescarga}</p>}
        </section>
      )}
    </main>
  );
}
