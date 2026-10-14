import { accionReservaSchema, type AccionReserva, type ReservaCapacidad } from '@v2/shared';
import { useState } from 'react';
import { Link } from 'wouter';

import { CampoDato } from '../Fichas/cuaderno/CampoDato';

import { ESTADOS_RESERVA } from './estados';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useOperacionCapacidad } from '~/lib/queries/capacidades';

const ACCIONES: Record<AccionReserva['accion'], string> = {
  aceptar: 'Aceptar y reservar',
  rechazar: 'Rechazar solicitud',
  cancelar: 'Cancelar y liberar reserva',
  declarar_entrega: 'Declarar entrega',
  confirmar_recepcion: 'Confirmar recepción declarada',
  discrepar: 'Informar una discrepancia',
};
export function Reserva({
  reserva: r,
  capacidadId,
  unidad,
}: {
  reserva: ReservaCapacidad;
  capacidadId: string;
  unidad: string;
}) {
  const [accion, setAccion] = useState<AccionReserva['accion'] | null>(null);
  const [revisionVista, setRevisionVista] = useState(r.revision);
  const [cantidadEntregada, setCantidadEntregada] = useState(
    String(r.cantidadDeclarada ?? r.cantidad ?? ''),
  );
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');
  const op = useOperacionCapacidad();
  const acciones: AccionReserva['accion'][] = [];
  if (!r.soySolicitante && r.estado === 'propuesta') acciones.push('aceptar', 'rechazar');
  if (['propuesta', 'reservada'].includes(r.estado)) acciones.push('cancelar');
  if (!r.soySolicitante && ['reservada', 'discrepancia'].includes(r.estado))
    acciones.push('declarar_entrega');
  if (r.soySolicitante && r.estado === 'entrega_declarada')
    acciones.push('confirmar_recepcion', 'discrepar');
  return (
    <article className="border-tinta border p-5">
      <h3 className="font-semibold">
        {r.estado === 'entregada' && r.cantidadDeclarada === 0
          ? 'Cierre confirmado · sin entrega'
          : ESTADOS_RESERVA[r.estado]}
      </h3>
      <p className="mt-2">
        {r.cantidad === null ? 'Cantidad por evaluación' : `Solicitadas: ${r.cantidad} ${unidad}`} ·{' '}
        {r.paraFecha}
      </p>
      <Link href={`/fichas/${r.fichaId}`} className="inline-flex min-h-11 underline">
        Ver ficha vinculada
      </Link>
      {r.tareaVinculada ? (
        <p>
          <Link
            className="underline"
            href={`/iniciativas/${r.tareaVinculada.slug}?seccion=tareas&tarea=${r.tareaVinculada.id}`}
          >
            Tarea abastecida: {r.tareaVinculada.titulo}
          </Link>
        </p>
      ) : (
        <p>Sin tarea vinculada. Quien solicitó puede asociarla desde las reservas de una tarea.</p>
      )}
      <p className="whitespace-pre-wrap break-words">{r.necesidad}</p>
      <p className="mt-2 whitespace-pre-wrap break-words">
        Compatibilidad propuesta: {r.compatibilidad}
      </p>
      {r.cantidadDeclarada !== null ? (
        <p className="mt-3 font-semibold">
          Cantidad declarada como entregada: {r.cantidadDeclarada} {unidad}.
        </p>
      ) : null}
      {r.notaEntrega ? (
        <p className="mt-3 whitespace-pre-wrap break-words">Entrega declarada: {r.notaEntrega}</p>
      ) : null}
      {r.discrepancia ? (
        <p className="mt-3 whitespace-pre-wrap break-words">
          Discrepancia registrada: {r.discrepancia}
        </p>
      ) : null}
      {['reservada', 'entrega_declarada', 'discrepancia'].includes(r.estado) &&
      r.paraFecha < new Date().toISOString().slice(0, 10) ? (
        <p className="mt-3">
          La fecha pasó. La cantidad sigue comprometida hasta resolver la reserva.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3">
        {acciones.map((a) => (
          <button
            className="min-h-11 underline"
            key={a}
            onClick={() => {
              setAccion(a);
              setRevisionVista(r.revision);
              setCantidadEntregada(String(r.cantidadDeclarada ?? r.cantidad ?? ''));
              setError('');
            }}
          >
            {ACCIONES[a]}
          </button>
        ))}
      </div>
      {accion ? (
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const v = accionReservaSchema.safeParse({
              accion,
              nota,
              revisionEsperada: revisionVista,
              ...(accion === 'declarar_entrega' && r.cantidad !== null
                ? { cantidadEntregada: cantidadEntregada === '' ? NaN : Number(cantidadEntregada) }
                : {}),
            });
            if (!v.success) {
              setError(v.error.issues[0]?.message ?? 'Completá la nota.');
              return;
            }
            setError('');
            op.mutate(
              { ruta: `/${capacidadId}/reservas/${r.id}/estado`, cuerpo: v.data },
              {
                onSuccess: () => {
                  setAccion(null);
                  setNota('');
                },
              },
            );
          }}
        >
          <fieldset disabled={op.isPending}>
            <p>
              {accion === 'confirmar_recepcion'
                ? r.cantidad === null
                  ? 'Confirmás la prestación declarada. Si falta algo, informá una discrepancia.'
                  : `Confirmás ${r.cantidadDeclarada ?? r.cantidad} ${unidad} recibidas y cerrás esta reserva. El saldo de ${r.cantidad - (r.cantidadDeclarada ?? r.cantidad)} ${unidad} vuelve a estar disponible. Si no coincide con lo recibido, informá una discrepancia.`
                : 'Revisá el cambio antes de registrarlo.'}
            </p>
            {accion === 'declarar_entrega' && r.cantidad !== null ? (
              <CampoDato
                etiqueta={`Cantidad entregada (${unidad}, entre 0 y ${r.cantidad})`}
                tipo="number"
                valor={cantidadEntregada}
                cambiar={setCantidadEntregada}
                ayuda="El saldo se libera solo cuando la otra parte confirma el cierre."
              />
            ) : null}
            {['declarar_entrega', 'discrepar'].includes(accion) ? (
              <CampoDato
                etiqueta="Qué se entregó o qué falta resolver (sin datos personales)"
                tipo="largo"
                valor={nota}
                cambiar={setNota}
              />
            ) : null}
            {r.revision !== revisionVista ? (
              <p role="alert">
                La reserva cambió. Volvé a abrir la acción para revisar la declaración actual.
              </p>
            ) : null}
            <ErrorOperacion mensaje={error || op.error?.message} />
            <div className="mt-4 flex flex-wrap gap-3">
              <BotonPapel type="submit" disabled={r.revision !== revisionVista}>
                Confirmar: {ACCIONES[accion]}
              </BotonPapel>
              <button
                type="button"
                className="min-h-11 underline"
                onClick={() => {
                  setAccion(null);
                }}
              >
                Volver
              </button>
            </div>
          </fieldset>
        </form>
      ) : null}
    </article>
  );
}
