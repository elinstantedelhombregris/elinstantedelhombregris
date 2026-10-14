import { useState } from 'react';
import { Link, Redirect, useLocation, useRoute, useSearch } from 'wouter';

import { IniciativaAcciones } from './IniciativaAcciones';
import { AdministracionIniciativa } from './Iniciativas/Administracion';
import { ESTADOS_INICIATIVA } from './Iniciativas/campos';
import { HitosIniciativa } from './Iniciativas/Hitos';
import { ListaGestion } from './Iniciativas/Lista';
import { TareasIniciativa } from './Iniciativas/Tareas';

import { BotonPapel } from '~/components/papel/primitives';
import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useIniciativa, useJoinIniciativa, useLeaveIniciativa } from '~/lib/queries/iniciativas';

export function IniciativaDetail() {
  const [, params] = useRoute<{ slug: string }>('/iniciativas/:slug');
  const slug = params?.slug ?? '';
  const q = useIniciativa(slug),
    auth = useAuth(),
    join = useJoinIniciativa(),
    leave = useLeaveIniciativa();
  const [aviso, setAviso] = useState('');
  const [, navegar] = useLocation();
  const search = new URLSearchParams(useSearch());
  const seccion = search.get('seccion') ?? 'tareas';
  const tareaId = Number(search.get('tarea')) || undefined;
  if (q.isLoading || auth.isLoading)
    return (
      <main className="p-10" role="status">
        Cargando iniciativa…
      </main>
    );
  if (!q.data)
    return (
      <main className="space-y-4 p-10">
        <p role="alert">No pudimos cargar la iniciativa.</p>
        <button
          className="underline"
          onClick={() => {
            void q.refetch();
          }}
        >
          Reintentar
        </button>
        <Link className="block underline" href="/iniciativas">
          Mis iniciativas
        </Link>
      </main>
    );
  const i = q.data.iniciativa;
  const p = q.data.permisos;
  if (i.kind === 'plan') return <Redirect to={`/planes/${i.slug}`} />;
  return (
    <MarcoParticipacion titulo={i.title} entrada={i.summary} kicker="Iniciativa comunitaria">
      <div className="mb-5 flex flex-wrap gap-5 text-sm">
        <p>
          {ESTADOS_INICIATIVA.find((e) => e.valor === i.status)?.etiqueta ?? 'Estado por revisar'}
        </p>
        <p>{i.memberCount} cuentas integrantes</p>
        <p>Versión {i.revision}</p>
      </div>
      <nav className="mb-6 flex flex-wrap gap-5">
        <Link className="underline" href="/iniciativas">
          Mis iniciativas
        </Link>
        <Link className="underline" href="/escucha-territorial">
          Escucha territorial
        </Link>
        <Link className="underline" href="/capacidades">
          Capacidades y reservas
        </Link>
      </nav>
      {auth.user ? (
        <div className="mb-6 space-y-3">
          {!p.miembro ? (
            <BotonPapel
              disabled={join.isPending}
              onClick={() => {
                join.mutate(i.id, {
                  onSuccess: () => {
                    setAviso('Ya integrás esta iniciativa. Podés aceptar una tarea disponible.');
                  },
                });
              }}
            >
              Unirme
            </BotonPapel>
          ) : (
            <>
              <p>
                Integrás esta iniciativa.{' '}
                {p.propietario
                  ? 'Para salir, primero transferí la propiedad y esperá su aceptación.'
                  : 'Para salir, primero liberá tus tareas activas.'}
              </p>
              {!p.propietario ? (
                <BotonPapel
                  disabled={leave.isPending}
                  onClick={() => {
                    leave.mutate(i.id, {
                      onSuccess: () => {
                        setAviso('Registramos tu salida.');
                      },
                    });
                  }}
                >
                  Salir de la iniciativa
                </BotonPapel>
              ) : null}
            </>
          )}
          {join.error || leave.error ? (
            <p role="alert">{join.error?.message ?? leave.error?.message}</p>
          ) : null}
          <p role="status">{aviso}</p>
        </div>
      ) : (
        <Link
          className="mb-6 inline-flex underline"
          href={`/ingresar?volver=${encodeURIComponent('/iniciativas/' + slug)}`}
        >
          Ingresá para integrar el equipo
        </Link>
      )}
      {q.isError ? (
        <p role="alert">No pudimos actualizar; mostramos la última lectura disponible.</p>
      ) : null}
      <nav aria-label="Secciones de la iniciativa" className="mb-6 flex flex-wrap gap-3">
        {[
          ['tareas', 'Tareas y escucha'],
          ['hitos', 'Hitos'],
          ['acciones', 'Acciones de fichas'],
          ['equipo', 'Equipo y propósito'],
          ['actividad', 'Historial'],
        ].map(([valor, label]) => (
          <button
            key={valor}
            aria-pressed={seccion === valor}
            className="border-tinta aria-pressed:bg-tinta aria-pressed:text-papel min-h-11 border px-4"
            onClick={() => {
              navegar(`/iniciativas/${slug}?seccion=${valor ?? 'tareas'}`);
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {seccion === 'hitos' ? (
        <HitosIniciativa id={i.id} administrar={p.administrar} />
      ) : seccion === 'acciones' ? (
        <IniciativaAcciones slug={slug} />
      ) : seccion === 'equipo' ? (
        p.administrar || p.aceptarTraspaso ? (
          <AdministracionIniciativa i={i} p={p} />
        ) : (
          <p>
            La administración gestiona el equipo y el propósito. Podés consultar las tareas y sus
            resultados en las otras secciones.
          </p>
        )
      ) : seccion === 'actividad' ? (
        <section>
          <h2 className="font-anton text-3xl">Historial de operaciones</h2>
          <ListaGestion<{ id: number; tipo: string; fecha: string; nota: string | null }>
            ruta={`/${i.id}/actividad`}
          >
            {(e) => (
              <p key={e.id}>
                {e.fecha.slice(0, 10)} · {e.tipo}
                {e.nota ? ' · ' + e.nota : ''}
              </p>
            )}
          </ListaGestion>
        </section>
      ) : (
        <TareasIniciativa
          id={i.id}
          administrar={p.administrar}
          escuchaInicial={search.get('escucha') === 'si'}
          {...(tareaId ? { tareaId } : {})}
        />
      )}
      {i.bodyMarkdown ? (
        <details className="border-tinta mt-8 border p-5">
          <summary className="cursor-pointer font-semibold">
            Documento público de la iniciativa
          </summary>
          <p className="mt-4 whitespace-pre-wrap">{i.bodyMarkdown}</p>
        </details>
      ) : null}
    </MarcoParticipacion>
  );
}
export default IniciativaDetail;
