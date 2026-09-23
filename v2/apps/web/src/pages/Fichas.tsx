import { useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';

import { FormularioFicha } from './Fichas/FormularioFicha';

import type { ContenidoFicha, FichaFuturo } from '@v2/shared';

import { useAuth } from '~/lib/auth/use-auth';
import { useFicha, useFichas } from '~/lib/queries/fichas';

function Lectura({ ficha }: { ficha: FichaFuturo }) {
  const [editando, setEditando] = useState(false);
  const contenido = ficha.contenido;
  if (editando)
    return (
      <>
        <button
          type="button"
          className="mb-6 min-h-11 underline"
          onClick={() => {
            setEditando(false);
          }}
        >
          Volver a la ficha
        </button>
        <FormularioFicha
          inicial={contenido}
          nombreTerritorio={ficha.territorioNombre ?? 'Argentina'}
          ficha={ficha}
          guardada={() => {
            setEditando(false);
          }}
        />
      </>
    );
  return (
    <>
      <p className="font-space text-violeta text-xs uppercase">
        Borrador público · Revisión {ficha.revision}
      </p>
      <h1 className="font-anton mt-3 text-4xl">{contenido.titulo}</h1>
      <p className="mt-4">
        {ficha.territorioNombre ?? 'Argentina'} ·{' '}
        {contenido.temas.join(' · ') || 'Temas pendientes'} · Actualizada{' '}
        {new Date(ficha.actualizadaEn).toLocaleDateString('es-AR')}
      </p>
      <p className="text-tinta-75 mt-4 border-l-2 pl-4">
        Esta ficha ordena una investigación entre vecinos. No habla por todo el barrio, no es un
        acuerdo y no obliga a nadie.
      </p>
      {ficha.puedoEditar ? (
        <button
          type="button"
          className="text-violeta mt-4 min-h-11 underline"
          onClick={() => {
            setEditando(true);
          }}
        >
          Editar este borrador
        </button>
      ) : null}
      {(
        [
          ['situacion', 'Situación actual'],
          ['futuro', 'Futuro deseado'],
          ['proximaTarea', 'Próxima tarea de investigación'],
        ] as const
      ).map(([campo, titulo]) => (
        <section key={campo} className="mt-8">
          <h2 className="font-anton text-2xl">{titulo}</h2>
          <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed">
            {contenido[campo] || 'Pendiente: todavía no hay una formulación.'}
          </p>
        </section>
      ))}
      <section className="mt-8">
        <h2 className="font-anton text-2xl">Aportes vinculados</h2>
        <p className="my-3 text-sm">
          Cada vínculo lo propuso quien escribió la ficha. Mirá la fuente y su estado antes de dar
          algo por comprobado.
        </p>
        {ficha.aportes.length === 0 ? (
          <p>Sin fuentes enlazadas todavía.</p>
        ) : (
          <ul className="space-y-3">
            {ficha.aportes.map((a) => (
              <li key={a.senalId + a.relacion} className="border p-4">
                <p className="text-violeta text-sm">
                  {a.relacion} · {a.estado ?? 'No disponible'}
                </p>
                <p className="my-2 break-words">
                  {a.disponible
                    ? a.texto
                    : 'Este aporte dejó de estar disponible. La ficha necesita revisar esta referencia.'}
                </p>
                {a.disponible ? (
                  <Link
                    className="inline-flex min-h-11 items-center underline"
                    href={`/senal/${a.senalId}`}
                  >
                    Consultar aporte y estado →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8">
        <h2 className="font-anton text-2xl">Historial</h2>
        <p className="my-3 text-sm">
          Se ven hasta 100 revisiones, con los campos que cambiaron. Los aportes se muestran como
          están hoy, no como estaban cuando se enlazaron.
        </p>
        <ol>
          {ficha.historial.map((h) => (
            <li className="border-t py-3 text-sm" key={h.revision}>
              Revisión {h.revision} · {new Date(h.fecha).toLocaleString('es-AR')} ·{' '}
              {h.campos.join(', ') || 'Sin cambios de contenido'}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
export function Fichas() {
  const [nueva] = useRoute('/fichas/nueva');
  const [, parametros] = useRoute('/fichas/:id');
  const [, navegar] = useLocation();
  const auth = useAuth();
  const id = nueva ? undefined : parametros?.id;
  const detalle = useFicha(id);
  const territorio = Number(new URLSearchParams(window.location.search).get('lugar'));
  const lugarId = Number.isSafeInteger(territorio) && territorio > 0 ? territorio : undefined;
  const lista = useFichas(lugarId);
  const inicial: ContenidoFicha = {
    titulo: '',
    territorioId: lugarId ?? null,
    temas: [],
    situacion: '',
    futuro: '',
    proximaTarea: '',
    vinculos: [],
  };
  return (
    <main className="mx-auto max-w-[960px] px-5 py-10">
      <nav className="mb-8 flex flex-wrap gap-5 text-sm">
        <Link href="/el-mapa" className="min-h-11 underline">
          Volver al mapa
        </Link>
        <Link href="/fichas" className="min-h-11 underline">
          Todas las fichas
        </Link>
      </nav>
      {nueva ? (
        <>
          <h1 className="font-anton mb-6 text-4xl">Una ficha para empezar a construir futuro</h1>
          {auth.isLoading ? (
            <p role="status">Revisando sesión…</p>
          ) : auth.isAuthenticated ? (
            <FormularioFicha
              inicial={inicial}
              nombreTerritorio={
                new URLSearchParams(window.location.search).get('nombre') ??
                (lugarId ? `Lugar ${lugarId}` : 'Argentina')
              }
              guardada={(nuevoId) => {
                navegar(`/fichas/${nuevoId}`);
              }}
            />
          ) : (
            <p>
              Necesitás{' '}
              <Link href="/ingresar" className="underline">
                iniciar sesión
              </Link>{' '}
              para administrar fichas. Podés seguir explorando y aportando señales sin cuenta.
            </p>
          )}
        </>
      ) : id ? (
        detalle.isLoading ? (
          <p role="status">Cargando ficha…</p>
        ) : detalle.isError ? (
          <p role="alert">
            No pudimos abrir esta ficha.{' '}
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => {
                void detalle.refetch();
              }}
            >
              Reintentar
            </button>
          </p>
        ) : detalle.data ? (
          <Lectura ficha={detalle.data} />
        ) : null
      ) : (
        <>
          <h1 className="font-anton text-4xl">Fichas de futuro</h1>
          <p className="mt-4 leading-relaxed">
            Situaciones, capacidades, preguntas y futuros deseados en un mismo documento revisable.
            Por ahora son borradores. Los acuerdos, la deliberación y la comprobación de resultados
            vienen después.
          </p>
          <Link
            href={`/fichas/nueva${window.location.search}`}
            className="bg-violeta text-papel my-6 inline-flex min-h-11 items-center px-5"
          >
            Crear una ficha →
          </Link>
          {lista.isLoading ? (
            <p role="status">Buscando fichas…</p>
          ) : lista.isError ? (
            <p role="alert">
              No pudimos cargar las fichas.{' '}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  void lista.refetch();
                }}
              >
                Reintentar
              </button>
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm">
                {lista.data?.fichas.length ?? 0} últimas fichas de {lista.data?.total ?? 0} en este
                ámbito.
              </p>
              <ul className="space-y-4">
                {lista.data?.fichas.map((f) => (
                  <li key={f.id} className="border p-5">
                    <Link href={`/fichas/${f.id}`} className="font-anton text-2xl underline">
                      {f.titulo}
                    </Link>
                    <p className="mt-3 text-sm">
                      {f.territorioNombre ?? 'Argentina'} · Borrador · Revisión {f.revision}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </main>
  );
}
