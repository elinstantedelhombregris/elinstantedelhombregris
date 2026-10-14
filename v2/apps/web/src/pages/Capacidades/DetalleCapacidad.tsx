import { useState } from 'react';
import { Link } from 'wouter';

import { TerritorioDocumentado } from '../Fichas/cuaderno/TerritorioDocumentado';

import { Reserva } from './Reserva';
import { ResumenCapacidad } from './ResumenCapacidad';
import { SolicitarCapacidad } from './SolicitarCapacidad';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { useCapacidad, useOperacionCapacidad } from '~/lib/queries/capacidades';

export function DetalleCapacidad({ id, fichaId }: { id: string; fichaId: string }) {
  const q = useCapacidad(id);
  const auth = useAuth();
  const op = useOperacionCapacidad();
  const [cerrar, setCerrar] = useState(false);
  const [aviso, setAviso] = useState('');
  const c = q.data?.pages[0]?.capacidad;
  const reservas = q.data?.pages.flatMap((p) => p.reservas) ?? [];
  if (!c)
    return (
      <>
        <ErrorOperacion mensaje={q.error?.message} />
        {q.isError ? (
          <button
            className="min-h-11 underline"
            onClick={() => {
              void q.refetch();
            }}
          >
            Reintentar capacidad
          </button>
        ) : (
          <p role="status">Consultando capacidad…</p>
        )}
      </>
    );
  return (
    <>
      <h2 className="font-anton break-words text-4xl">{c.titulo}</h2>
      <ResumenCapacidad c={c} />
      <div className="border-tinta mt-6 border-y py-5">
        <h3 className="font-semibold">Condiciones de uso</h3>
        <p className="mt-3 whitespace-pre-wrap break-words">{c.restricciones}</p>
        <p className="mt-3 break-words">
          Ofrece: {c.firma} · autorización declarada, sin verificación institucional.
        </p>
        <p className="mt-2 text-sm">
          Última confirmación: {new Date(c.confirmadaEn).toLocaleDateString('es-AR')}
        </p>
        {c.territorioId !== null ? (
          <TerritorioDocumentado id={c.territorioId} />
        ) : (
          <p className="mt-2 text-sm">
            Lugar de servicio detallado en las condiciones de la oferta.
          </p>
        )}
        <Link href={`/senal/${c.senalId}`} className="inline-flex min-h-11 underline">
          Consultar aporte de origen
        </Link>
      </div>
      {c.esMia ? (
        <div className="mt-5">
          <ErrorOperacion mensaje={op.error?.message} />
          {c.vigente ? (
            <BotonPapel
              onClick={() => {
                op.mutate(
                  { ruta: `/${id}/estado`, cuerpo: { accion: 'confirmar' } },
                  {
                    onSuccess: () => {
                      setAviso('Disponibilidad reconfirmada con las mismas condiciones.');
                    },
                  },
                );
              }}
              disabled={op.isPending}
            >
              Reconfirmar disponibilidad
            </BotonPapel>
          ) : null}
          {!c.cerrada ? (
            <button
              className="ml-4 min-h-11 underline"
              onClick={() => {
                setCerrar(true);
              }}
            >
              Cerrar a nuevas solicitudes
            </button>
          ) : null}
          {cerrar && !c.cerrada ? (
            <div className="mt-4">
              <p>
                Las reservas aceptadas siguen pendientes hasta resolver su entrega o cancelación.
              </p>
              <BotonPapel
                className="mt-3"
                disabled={op.isPending}
                onClick={() => {
                  op.mutate(
                    { ruta: `/${id}/estado`, cuerpo: { accion: 'cerrar' } },
                    {
                      onSuccess: () => {
                        setCerrar(false);
                        setAviso('Oferta cerrada a nuevas solicitudes.');
                      },
                    },
                  );
                }}
              >
                Confirmar cierre
              </BotonPapel>
              <button
                className="ml-4 min-h-11 underline"
                onClick={() => {
                  setCerrar(false);
                }}
              >
                Volver
              </button>
            </div>
          ) : null}
          {aviso ? (
            <p role="status" className="mt-3">
              {aviso}
            </p>
          ) : null}
        </div>
      ) : c.vigente ? (
        auth.user ? (
          <SolicitarCapacidad capacidad={c} fichaId={fichaId} />
        ) : (
          <Link
            className="mt-5 inline-flex min-h-11 underline"
            href={hrefIngresar(`/capacidades/${id}${fichaId ? `?fichaId=${fichaId}` : ''}`)}
          >
            Ingresá para proponer una solicitud
          </Link>
        )
      ) : null}
      <section className="mt-8">
        <h2 className="font-anton text-3xl">Seguimiento de solicitudes</h2>
        <p className="my-4">
          Cada solicitud y sus notas solo son visibles para la cuenta que ofrece y la que solicita.
        </p>
        {auth.user && reservas.length === 0 ? (
          <p>No tenés solicitudes visibles en esta oferta.</p>
        ) : null}
        <div className="space-y-4">
          {reservas.map((r) => (
            <Reserva key={r.id} reserva={r} capacidadId={id} unidad={c.unidad} />
          ))}
        </div>
        {q.isError ? (
          <>
            <ErrorOperacion mensaje={q.error.message} />
            <button
              className="min-h-11 underline"
              onClick={() => {
                void q.refetch();
              }}
            >
              Reintentar seguimiento
            </button>
          </>
        ) : null}
        {q.hasNextPage ? (
          <button
            disabled={q.isFetchingNextPage}
            className="mt-4 min-h-11 underline"
            onClick={() => {
              void q.fetchNextPage();
            }}
          >
            Cargar más solicitudes
          </button>
        ) : null}
      </section>
    </>
  );
}
