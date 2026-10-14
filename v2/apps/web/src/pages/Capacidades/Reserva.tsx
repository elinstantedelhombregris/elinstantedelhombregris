import { accionReservaSchema, type AccionReserva, type ReservaCapacidad } from '@v2/shared';
import { useState } from 'react';
import { Link } from 'wouter';

import { CampoDato } from '../Fichas/cuaderno/CampoDato';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useOperacionCapacidad } from '~/lib/queries/capacidades';

const ESTADOS = {
  propuesta: 'Esperando aceptación',
  reservada: 'Reserva aceptada',
  entrega_declarada: 'Entrega declarada · falta recepción',
  entregada: 'Recepción confirmada',
  discrepancia: 'Discrepancia por resolver',
  cancelada: 'Cancelada',
  rechazada: 'Rechazada',
};
const ACCIONES: Record<AccionReserva['accion'], string> = {
  aceptar: 'Aceptar y reservar',
  rechazar: 'Rechazar solicitud',
  cancelar: 'Cancelar y liberar reserva',
  declarar_entrega: 'Declarar entrega',
  confirmar_recepcion: 'Confirmar que recibí lo acordado',
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
      <h3 className="font-semibold">{ESTADOS[r.estado]}</h3>
      <p className="mt-2">
        {r.cantidad === null ? 'Cantidad por evaluación' : `${r.cantidad} ${unidad}`} ·{' '}
        {r.paraFecha}
      </p>
      <Link href={`/fichas/${r.fichaId}`} className="inline-flex min-h-11 underline">
        Ver ficha vinculada
      </Link>
      <p className="whitespace-pre-wrap break-words">{r.necesidad}</p>
      <p className="mt-2 whitespace-pre-wrap break-words">
        Compatibilidad propuesta: {r.compatibilidad}
      </p>
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
            const v = accionReservaSchema.safeParse({ accion, nota });
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
                ? 'Confirmás la recepción completa de lo acordado. Si falta algo, informá una discrepancia.'
                : 'Revisá el cambio antes de registrarlo.'}
            </p>
            {['declarar_entrega', 'discrepar'].includes(accion) ? (
              <CampoDato
                etiqueta="Qué se entregó o qué falta resolver (sin datos personales)"
                tipo="largo"
                valor={nota}
                cambiar={setNota}
              />
            ) : null}
            <ErrorOperacion mensaje={error || op.error?.message} />
            <div className="mt-4 flex flex-wrap gap-3">
              <BotonPapel type="submit">Confirmar: {ACCIONES[accion]}</BotonPapel>
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
